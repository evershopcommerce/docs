---
sidebar_position: 5
keywords:
  - EverShop Stripe payment gateway integration
  - payment processing
  - e-commerce payments
sidebar_label: Stripe Payment Integration
title: Integrating Stripe Payment Gateway
description: How EverShop's built-in Stripe module is wired together — registration, the capture, void and refund handlers, the payment component, the payment intent API and the webhook — as a blueprint for building your own payment gateway.
---

# Integrating Stripe Payment Gateway

EverShop ships Stripe as a core module. This guide walks through how that module is actually wired together, so you can use it as a blueprint for your own gateway.

Every path below is relative to `packages/evershop/src/modules/stripe/` in the EverShop repository. Read alongside [Payment Method Development](/docs/development/knowledge-base/payment-method-development), which covers the registration contract in isolation.

## The six pieces

A payment gateway in EverShop is made of six parts:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Piece</th>
      <th>File</th>
      <th>Job</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registration</td>
      <td><code>bootstrap.ts</code></td>
      <td>Declares the method, its payment statuses, when it is available, and its <code>capture</code>, <code>void</code> and <code>refund</code> handlers</td>
    </tr>
    <tr>
      <td>Checkout component</td>
      <td><code>pages/frontStore/checkout/Stripe.tsx</code></td>
      <td>Mounts into the checkout page and supplies the name, form and button renderers</td>
    </tr>
    <tr>
      <td>Payment intent API</td>
      <td><code>api/createPaymentIntent/</code></td>
      <td>Creates the Stripe PaymentIntent for an order and returns its client secret</td>
    </tr>
    <tr>
      <td>Return page</td>
      <td><code>pages/frontStore/stripeReturn/</code></td>
      <td>Receives the shopper after payment and sends them to the success page or back to the cart</td>
    </tr>
    <tr>
      <td>Webhook</td>
      <td><code>api/stripeWebHook/</code></td>
      <td>Receives Stripe events, moves the order's payment status and records refunds</td>
    </tr>
    <tr>
      <td>Admin settings</td>
      <td><code>pages/admin/paymentSetting/StripePayment.tsx</code></td>
      <td>Keys, display name and capture mode</td>
    </tr>
  </tbody>
</table>

:::info Capture and refund are not Stripe routes anymore
Before 2.3, the Stripe module had its own admin routes and buttons for capturing and refunding. Since 2.3, **core owns the whole operation**: the admin routes (`POST /api/orders/:id/capture` and `POST /api/orders/:id/refunds`), the buttons, the validation, the transaction record and the status change. A gateway only supplies the one step that talks to the payment provider, as a handler on `registerPaymentMethod`. See [Capture, void and refund](#2-capture-void-and-refund).
:::

## 1. Registration

Registration happens in the module's `bootstrap.ts` — the only entry point the framework loads per module. The registry is locked immediately afterwards, so calling `registerPaymentMethod` from a middleware or request handler throws `Registry is locked`.

```ts title="modules/stripe/bootstrap.ts"
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
import { getSetting } from '@evershop/evershop/setting/services';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

export default async () => {
  registerPaymentMethod({
    // `init` returns the method's identity. `code` is the value stored on the
    // order; `name` is what the shopper sees.
    init: async () => ({
      code: 'stripe',
      name: await getSetting('stripeDisplayName', 'Stripe')
    }),
    // `validator` decides whether the method is offered for this checkout.
    // It is REQUIRED — a factory without one makes the whole payment-method
    // listing throw `Value checkoutPaymentMethods is invalid: false`.
    validator: async () => {
      const stripeConfig = getConfig('system.stripe', {}) ?? {};
      const stripeStatus = stripeConfig.status
        ? stripeConfig.status
        : await getSetting('stripePaymentStatus', 0);
      return parseInt(stripeStatus, 10) === 1;
    }
    // capture, void and refund handlers go here. See "Capture, void and refund".
  });
};
```

`validator` receives an optional `PaymentMethodValidationContext` carrying `cartTotal`. Read it defensively (`context?.cartTotal`) — and note that a cart total of `0` collapses the list to the built-in `zero_checkout` method regardless of what your validator returns. See [Zero Total Checkout](/docs/development/knowledge-base/zero-total-checkout).

### Declaring payment statuses

The same bootstrap declares the payment statuses the gateway can put an order into, plus their mapping to the order's overall status:

```ts title="modules/stripe/bootstrap.ts"
import config from 'config';

config.util.setModuleDefaults('oms', {
  order: {
    paymentStatus: {
      stripe_authorized: {
        name: 'Authorized',
        isDefault: false,
        isCancelable: true,
        isCapturable: true,
        isVoidable: true,
        badge: 'warning'
      },
      stripe_captured: {
        name: 'Captured',
        isDefault: false,
        isCancelable: false,
        isRefundable: true,
        badge: 'success'
      },
      stripe_failed: { name: 'Failed', isDefault: false, isCancelable: true, badge: 'critical' },
      stripe_refunded: { name: 'Refunded', isDefault: false, isCancelable: false, badge: 'destructive' },
      stripe_partial_refunded: {
        name: 'Partial Refunded',
        isDefault: false,
        isCancelable: false,
        isRefundable: true,
        badge: 'destructive'
      }
    },
    psoMapping: {
      'stripe_authorized:*': 'processing',
      'stripe_captured:*': 'processing',
      'stripe_captured:delivered': 'completed',
      'stripe_failed:*': 'new',
      'stripe_refunded:*': 'closed',
      'stripe_partial_refunded:*': 'processing',
      'stripe_partial_refunded:delivered': 'completed'
    }
  }
});
```

Three flags tell core what an order in this status may do:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Flag</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>isCapturable</code></td>
      <td>The admin can capture the order. Used by <code>captureOrder</code>.</td>
    </tr>
    <tr>
      <td><code>isVoidable</code></td>
      <td>Canceling the order releases an uncaptured authorization through the method's <code>void</code> handler.</td>
    </tr>
    <tr>
      <td><code>isRefundable</code></td>
      <td>The admin can refund the order. Stays set on the partial-refund status so more can be refunded later.</td>
    </tr>
  </tbody>
</table>

A flag says when an action is *allowed*; a registered handler says whether the method *supports* it. The admin **Capture** and **Refund** buttons appear only when both hold.

:::caution Core builds status codes from the method code
Core moves an order to `<code>_captured` after a capture, and to `<code>_refunded` or `<code>_partial_refunded` after a refund. A gateway whose method code is `stripe` must therefore register statuses with exactly these names, as shown above.
:::

## 2. Capture, void and refund

Core owns these operations. Your gateway adds up to three optional handlers to the same `registerPaymentMethod` call; supplying a handler is how a method declares that it supports the operation:

```ts title="modules/stripe/bootstrap.ts"
import Stripe from 'stripe';
import smallestUnit, { display } from 'zero-decimal-currencies';

registerPaymentMethod({
  // init and validator as above

  // Capture an authorized PaymentIntent. Core records the transaction, sets
  // the status and writes the activity log. The handler only talks to Stripe.
  capture: async ({ order, transaction }) => {
    const stripe = new Stripe(secretKey);
    const intent = await stripe.paymentIntents.retrieve(transaction.transaction_id);
    if (intent.status !== 'requires_capture') {
      throw new Error('Payment intent is not in a capturable state (requires_capture)');
    }
    const captured = await stripe.paymentIntents.capture(transaction.transaction_id);
    return {
      transactionId: captured.id,
      amount: parseFloat(display(captured.amount_received ?? captured.amount, order.currency)),
      raw: captured
    };
  },

  // Release an uncaptured authorization when a voidable order is canceled.
  void: async ({ order }) => {
    await cancelPaymentIntent(order.order_id);
  },

  // Refund through Stripe and report what moved. Core decides whether the
  // refund is full or partial, sets the status and emits `order_refunded`.
  refund: async ({ order, amount, transaction }) => {
    const stripe = new Stripe(secretKey);
    const refund = await stripe.refunds.create({
      payment_intent: transaction.transaction_id,
      amount: parseInt(smallestUnit(amount, order.currency), 10)
    });
    return {
      transactionId: refund.id,
      amount: parseFloat(display(refund.amount, order.currency)),
      raw: refund
    };
  }
});
```

`secretKey` stands for the value read from `getConfig('system.stripe').secretKey`, falling back to `getSetting('stripeSecretKey', '')`; the module repeats that lookup in each handler.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Handler</th>
      <th>Receives</th>
      <th>Returns</th>
      <th>Called by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>capture</code></td>
      <td><code>{'{ order, transaction }'}</code> — the transaction is the authorization</td>
      <td><code>{'{ transactionId, amount, raw }'}</code></td>
      <td><code>POST /api/orders/:id/capture</code></td>
    </tr>
    <tr>
      <td><code>void</code></td>
      <td><code>{'{ order, transaction }'}</code></td>
      <td>Nothing. Throw to abort the cancellation.</td>
      <td>Order cancellation, when the status is <code>isVoidable</code></td>
    </tr>
    <tr>
      <td><code>refund</code></td>
      <td><code>{'{ order, transaction, amount, currency }'}</code> — the transaction is the capture</td>
      <td><code>{'{ transactionId, amount, raw }'}</code> — the gateway's refund id</td>
      <td><code>POST /api/orders/:id/refunds</code></td>
    </tr>
  </tbody>
</table>

What core does around each handler:

- **Capture** ([`captureOrder`](/docs/development/module/functions/captureOrder)) requires a `capture` handler and an `isCapturable` status. It is always a full capture. Core calls the handler, saves the capture transaction with the authorization as its parent, moves the status to `stripe_captured` and logs the activity.
- **Refund** ([`refundOrder`](/docs/development/module/functions/refundOrder)) requires a `refund` handler and an `isRefundable` status. The amount must be greater than zero and no more than what is still refundable. Core calls the handler, then `recordRefund`, which saves the refund transaction, chooses `stripe_refunded` or `stripe_partial_refunded`, logs the activity and emits `order_refunded` once.
- **Void** runs inside the cancellation transaction, before the order becomes `canceled`. If the handler throws, the cancellation rolls back and the order keeps its status.

The `refund` handler's transaction id is the **idempotency key**. `recordRefund` skips a refund it has already recorded, so an admin refund and the `charge.refunded` webhook that Stripe sends for it end as one transaction and one `order_refunded` event.

Handlers report a failure by throwing a plain `Error`. The admin routes answer any failure, including a failed validation, with HTTP `500` and `{ "error": { "status": 500, "message": "..." } }`.

## 3. The checkout component

Every payment method mounts into the **same** area — `checkoutFormAfter`. There is no per-method area convention:

```tsx title="modules/stripe/pages/frontStore/checkout/Stripe.tsx"
export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 10
};
```

The component does not render the payment UI directly into that area. Instead it calls `registerPaymentComponent` from `useCheckoutDispatch()` and returns `null` — the checkout page decides where and when to draw each renderer:

```tsx
import { useEffect } from 'react';
import { useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';

export default function StripeMethod({
  setting,
  cart: { grandTotal, currency },
  returnUrl,
  createPaymentIntentApi
}) {
  const { registerPaymentComponent } = useCheckoutDispatch();

  useEffect(() => {
    registerPaymentComponent('stripe', {
      nameRenderer: () => <span>{setting.stripeDisplayName}</span>,
      formRenderer: () => (
        <StripeApp
          total={grandTotal.value}
          currency={currency}
          stripePublishableKey={setting.stripePublishableKey}
          stripePaymentMode={setting.stripePaymentMode}
          returnUrl={returnUrl}
          createPaymentIntentApi={createPaymentIntentApi}
        />
      ),
      // Renders the "Pay with Stripe" button. See "The payment flow" below.
      checkoutButtonRenderer: () => <PayButton />
    });
  }, [registerPaymentComponent, setting.stripeDisplayName]);

  // The component itself renders nothing.
  return null;
}
```

Its GraphQL query supplies everything the renderers need. Note the `cart: myCart` alias, which is why the component destructures `cart`:

```tsx
export const query = `
  query Query {
    setting {
      stripeDisplayName
      stripePublishableKey
      stripePaymentMode
    }
    cart: myCart {
      grandTotal {
        value
      }
      currency
    }
    returnUrl: url(routeId: "stripeReturn")
    createPaymentIntentApi: url(routeId: "createPaymentIntent")
  }
`;
```

### The card form

The form uses Stripe's `PaymentElement` inside `<Elements>`, in deferred-intent mode — the PaymentIntent does not exist yet when the form renders, so Elements is configured with the amount and currency instead of a client secret:

```tsx
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import smallUnit from 'zero-decimal-currencies';

// Call loadStripe outside of render so the Stripe object is created only once.
let stripe;
const stripeLoader = (publishableKey) => {
  if (!stripe) {
    stripe = loadStripe(publishableKey);
  }
  return stripe;
};

<Elements
  stripe={stripeLoader(stripePublishableKey)}
  options={{
    mode: 'payment',
    currency: currency.toLowerCase(),
    amount: Number(smallUnit(total, currency)),
    capture_method: stripePaymentMode === 'capture' ? 'automatic_async' : 'manual'
  }}
>
  <PaymentElement id="payment-element" />
</Elements>
```

`zero-decimal-currencies` returns a string, hence the `Number(...)`.

If you need a hidden field to carry validation state into the checkout form, use a real field component — there is no `Field` component and no `validationRules` prop:

```tsx
import { InputField } from '@components/common/form/InputField';

<InputField
  type="hidden"
  name="stripeCartComplete"
  validation={{ required: 'Please complete the card information' }}
/>
```

The field name is yours to choose; `stripeCartComplete` is only an example.

### The payment flow

The order is created **before** the payment, so the amount is always an order amount:

1. **Validate.** The pay button runs a validation function that calls `elements.submit()`, which makes Stripe validate the card details without charging anything.
2. **Place the order.** If validation passes, the button calls `checkout()`. The order is created with the `pending` payment status.
3. **Create the PaymentIntent.** Once the order exists, the form calls the [payment intent API](#4-creating-the-payment-intent) with the order id and receives a client secret.
4. **Confirm.** The form calls `stripe.confirmPayment(...)` with that secret and a `return_url` of `<returnUrl>?order_id=<uuid>`. The billing details sent to Stripe are built from the cart's billing or shipping address.

If `confirmPayment` returns an error, the shopper is redirected to the return page with the PaymentIntent id, so a declined card takes the same failure path as any other dead end.

## 4. Creating the payment intent

```json title="modules/stripe/api/createPaymentIntent/route.json"
{
  "methods": ["POST"],
  "path": "/stripe/paymentIntents",
  "access": "public"
}
```

The payload schema still lists both ids as required, and the storefront sends both:

```json title="modules/stripe/api/createPaymentIntent/payloadSchema.json"
{
  "type": "object",
  "properties": {
    "cart_id": { "type": "string" },
    "order_id": { "type": "string" }
  },
  "required": ["cart_id", "order_id"],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "cart_id": "Cart is invalid",
      "order_id": "Order is invalid"
    }
  }
}
```

The server reads only `order_id`. `cart_id` stays in the schema for compatibility and is ignored.

The handler loads the **order** — and derives the charge from `order.grand_total` and `order.currency` — so the client can never dictate what it pays. The lookup is scoped to the order's own method and state: `payment_method = 'stripe'` and `payment_status = 'pending'`. An order that is already paid, failed or belongs to another method cannot get a new PaymentIntent:

```ts title="modules/stripe/api/createPaymentIntent/createPaymentIntent.ts"
import Stripe from 'stripe';
import smallestUnit from 'zero-decimal-currencies';
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { getSetting } from '@evershop/evershop/setting/services';
import { OK, INVALID_PAYLOAD } from '@evershop/evershop/lib/util/httpStatus';

export default async (request, response, next) => {
  const { order_id } = request.body;

  const order = await select()
    .from('order')
    .where('uuid', '=', order_id)
    .and('payment_method', '=', 'stripe')
    .and('payment_status', '=', 'pending')
    .load(pool);
  if (!order) {
    response.status(INVALID_PAYLOAD);
    response.json({ error: { status: INVALID_PAYLOAD, message: 'Invalid order' } });
    return;
  }

  // `system.stripe.secretKey` in configuration wins over the admin setting.
  const stripeConfig = getConfig('system.stripe', {});
  const secretKey = stripeConfig.secretKey
    ? stripeConfig.secretKey
    : await getSetting('stripeSecretKey', '');
  const stripePaymentMode = await getSetting('stripePaymentMode', 'capture');

  // ESM: import the constructor. `require()` is not available.
  const stripe = new Stripe(secretKey);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(smallestUnit(order.grand_total, order.currency), 10),
    currency: order.currency,
    // The order's own uuid, set here on the server. The webhook and the
    // return page use it to bind the intent back to the order.
    metadata: { order_id: order.uuid },
    automatic_payment_methods: { enabled: true },
    capture_method: stripePaymentMode === 'capture' ? 'automatic_async' : 'manual'
  });

  response.status(OK);
  response.json({ data: { clientSecret: paymentIntent.client_secret } });
};
```

The excerpt omits the error handling the real handler has. Any failure inside it, such as a Stripe API error, is logged and answered with HTTP `500` and `{ "error": { "status": 500, "message": "Can not create the payment intent" } }`.

Call it from the form with both ids, and check for an error before reading the data:

```ts
const response = await fetch(createPaymentIntentApi, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cart_id: cartId, order_id: orderId })
});
const result = await response.json();
if (result.error) {
  // show result.error.message
} else {
  // result.data.clientSecret
}
```

:::note This handler declares three parameters
`(request, response, next)` — the third parameter is required whenever a middleware sends its own response. A 2-argument middleware is treated as *passive*: the framework auto-calls `next()` and `apiResponse` then tries to send headers again, producing `ERR_HTTP_HEADERS_SENT`.
:::

## 5. The return page

`pages/frontStore/stripeReturn/` serves `GET /stripe/return?order_id=<uuid>&payment_intent=<id>`. Stripe sends the shopper here after `confirmPayment`, and the form sends them here after a declined card. Both query parameters come from the browser, so the page trusts neither:

1. It loads the order and rejects it unless it exists and has `payment_method = 'stripe'`.
2. It retrieves the PaymentIntent from Stripe and rejects it unless `metadata.order_id` equals the `order_id` in the URL. Without this check, a cheaper order's intent could be used to steer someone else's order.
3. It maps the PaymentIntent status to an outcome:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>PaymentIntent status</th>
      <th>Outcome</th>
      <th>What happens</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>succeeded</code>, <code>requires_capture</code></td>
      <td>Success</td>
      <td>Redirect to the checkout success page. The webhook sets the payment status.</td>
    </tr>
    <tr>
      <td><code>processing</code></td>
      <td>Pending</td>
      <td>Same redirect. A delayed-notification method is still settling; the webhook finishes it.</td>
    </tr>
    <tr>
      <td>Anything else</td>
      <td>Failure</td>
      <td>Reactivate the cart, set <code>stripe_failed</code> if the order is still <code>pending</code>, show a "Payment failed" notification and redirect to the cart.</td>
    </tr>
  </tbody>
</table>

The page never marks an order paid. Only the webhook does.

## 6. The webhook

The webhook is where payment status actually moves. It never writes `payment_status` with a raw `update()` — it goes through the OMS services so the status transition, the activity log and the payment transaction all stay consistent.

Point a Stripe webhook endpoint at `https://yourstore.com/api/stripe/webhook`. The route uses a raw-body middleware (`[bodyJson]webhook.ts` with `bodyJson.ts` beside it), because Stripe's signature is computed over the exact bytes it sent and a parsed body would not verify.

The handler handles five event types:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Stripe event</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>payment_intent.amount_capturable_updated</code></td>
      <td>Payment status <code>stripe_authorized</code>. The first time only: activity log and <code>order_placed</code>.</td>
    </tr>
    <tr>
      <td><code>payment_intent.succeeded</code></td>
      <td>Payment status <code>stripe_captured</code>. The first time only: activity log and <code>order_placed</code>.</td>
    </tr>
    <tr>
      <td><code>payment_intent.payment_failed</code></td>
      <td>Payment status <code>stripe_failed</code>, only if the order is still <code>pending</code>.</td>
    </tr>
    <tr>
      <td><code>payment_intent.canceled</code></td>
      <td>Payment status <code>canceled</code>, unless it already is.</td>
    </tr>
    <tr>
      <td><code>charge.refunded</code></td>
      <td>Recorded through <code>recordRefund</code>: a refund transaction, <code>stripe_refunded</code> or <code>stripe_partial_refunded</code>, and <code>order_refunded</code>.</td>
    </tr>
  </tbody>
</table>

Any other event type, an event without an `order_id`, and an event for an unknown order are logged and answered `200 { "received": true }`, so Stripe does not retry something the store will never act on.

The handler is built around four guarantees:

- **One transaction, one lock.** Everything runs in a single database transaction. The order row is read with `SELECT ... FOR UPDATE`, so two overlapping deliveries of the same event are serialized: the second waits for the first to commit, then sees the saved payment transaction and stops.
- **Fire once.** Whether an event is "the first time" is decided under that lock, by looking for an existing `payment_transaction` for this PaymentIntent and order. The status change, the activity log and `order_placed` run only the first time. The transaction row itself is written with `insertOnUpdate`, so it is safe to repeat. `order_placed` is emitted on the same connection, so subscribers see it only after the transaction commits.
- **The order owns the amount.** Before any money-in event marks an order paid, the handler checks that the order's `payment_method` is `stripe` and that the PaymentIntent's amount and currency equal the order's grand total and currency. On a mismatch nothing is written, an error is logged, and the order stays `pending` for manual review. The response is still `200`, because a mismatch is permanent and retrying cannot fix it.
- **Failures are retried.** A bad signature or any exception rolls the transaction back and answers `400 Webhook Error: <message>`, so Stripe delivers the event again.

For `payment_intent.*` events the order is found through `paymentIntent.metadata.order_id`. For `charge.refunded` there is no such metadata on the charge, so the handler finds the order through the saved `payment_transaction` whose `transaction_id` equals the charge's `payment_intent`.

```ts title="modules/stripe/api/stripeWebHook/[bodyJson]webhook.ts"
import Stripe from 'stripe';
import { insertOnUpdate } from '@evershop/evershop/lib/postgres/query';
import { getConnection } from '@evershop/evershop/lib/postgres';
import {
  addOrderActivityLog,
  updatePaymentStatus
} from '@evershop/evershop/oms/services';

const { order_id } = paymentIntent.metadata;

// Record the transaction (safe to repeat)
await insertOnUpdate('payment_transaction', [
  'transaction_id',
  'payment_transaction_order_id'
])
  .given({ /* amount, order id, PaymentIntent id, ... */ })
  .execute(connection);

// Move the payment status through the registered stripe_* statuses
await updatePaymentStatus(order.order_id, 'stripe_captured', connection);
await addOrderActivityLog(order.order_id, 'Payment captured by using Stripe', false, connection);
```

### Configuring the webhook in Stripe

In the Stripe dashboard, add an endpoint for `https://yourstore.com/api/stripe/webhook` and enable these events (or "All events"):

- `payment_intent.succeeded`
- `payment_intent.amount_capturable_updated`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

Copy the endpoint's signing secret into **Webhook Secret Key** in the admin settings (or `system.stripe.endpointSecret` in configuration).

:::caution Upgrading from 2.2.x
Earlier versions needed only `payment_intent.succeeded`, `payment_intent.amount_capturable_updated` and `payment_intent.canceled`. After upgrading to 2.3, also enable `payment_intent.payment_failed` and `charge.refunded`. Without `payment_intent.payment_failed`, a delayed payment that fails stays `pending`. Without `charge.refunded`, refunds made in the Stripe dashboard are not reflected in EverShop.
:::

For local development, forward events with the Stripe CLI. It prints a signing secret to use for that session:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 7. Admin settings

`pages/admin/paymentSetting/StripePayment.tsx` mounts into the payment settings page and collects:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Setting key</th>
      <th>Admin field</th>
      <th><code>system.stripe</code> override</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>stripePaymentStatus</code></td>
      <td>Enabled (0 or 1)</td>
      <td><code>status</code></td>
    </tr>
    <tr>
      <td><code>stripeDisplayName</code></td>
      <td>Display name</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>stripePublishableKey</code></td>
      <td>Publishable key</td>
      <td><code>publishableKey</code></td>
    </tr>
    <tr>
      <td><code>stripeSecretKey</code></td>
      <td>Secret key</td>
      <td><code>secretKey</code></td>
    </tr>
    <tr>
      <td><code>stripeEndpointSecret</code></td>
      <td>Webhook Secret Key</td>
      <td><code>endpointSecret</code></td>
    </tr>
    <tr>
      <td><code>stripePaymentMode</code></td>
      <td>Payment mode: <code>capture</code> or <code>authorizeOnly</code></td>
      <td>—</td>
    </tr>
  </tbody>
</table>

Values are read back with `getSetting`, and `getConfig('system.stripe')` takes precedence when it has a value — which lets an operator keep secrets in configuration or the environment instead of the database. A `status` of `0` in configuration is falsy, so it falls back to the admin setting. When a value comes from configuration, the admin form shows it masked.

`stripePaymentMode` decides the PaymentIntent's `capture_method`. `capture` captures automatically (`automatic_async`), and the webhook sets `stripe_captured`. Any other value means manual capture: the payment is authorized, the webhook sets `stripe_authorized`, and an admin captures it later with the **Capture** button.

## Offline methods: Cash on Delivery

Not every method talks to a gateway. Cash on Delivery uses the same contract with no network call: its `capture` and `refund` handlers return a generated transaction id with `offline: true`, and it registers no `void` handler. Its statuses use the `cod_` prefix (`cod_pending`, `cod_captured`, `cod_refunded`, `cod_partial_refunded`). The order is moved to `cod_pending` as it is placed, so unlike Stripe it never sits in the shared `pending` status. See [Payment Method Development](/docs/development/knowledge-base/payment-method-development).

## Building your own gateway

The same six pieces apply. The parts most people get wrong:

- **Register from `bootstrap.ts`.** Nothing else is loaded per module, and the registry locks right after.
- **`validator` is mandatory.** Return `true` if your method is always available.
- **Mount into `checkoutFormAfter`** and call `registerPaymentComponent(code, …)`; do not invent a per-method area.
- **Compute the amount server-side** from the order, never from the request body, and verify the gateway's amount and currency against the order again before marking anything paid.
- **Move status through `updatePaymentStatus`**, not a raw `update('order')`, and declare your statuses plus their `psoMapping` in bootstrap.
- **Flag your statuses and register handlers.** `isCapturable`, `isVoidable` and `isRefundable` say when an action is allowed; the `capture`, `void` and `refund` handlers say that you support it. Name the statuses `<code>_captured`, `<code>_refunded` and `<code>_partial_refunded`.
- **Make the webhook idempotent.** Lock the order row, decide "first time" under the lock, and use the gateway's own ids as keys.

## See also

- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — the registration contract on its own
- [registerPaymentMethod](/docs/development/module/functions/registerPaymentMethod) — API reference
- [Order Status Management](/docs/development/knowledge-base/order-status-management) — how payment status maps to order status
- [captureOrder](/docs/development/module/functions/captureOrder), [refundOrder](/docs/development/module/functions/refundOrder) and [recordRefund](/docs/development/module/functions/recordRefund) — the core services behind capture and refund
- [Payment Gateway REST API](/docs/api/payment-gateway) — the Stripe and PayPal endpoint reference
