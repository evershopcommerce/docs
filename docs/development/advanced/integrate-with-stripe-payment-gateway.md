---
sidebar_position: 5
keywords:
  - EverShop Stripe payment gateway integration
  - payment processing
  - e-commerce payments
sidebar_label: Stripe Payment Integration
title: Integrating Stripe Payment Gateway
description: How EverShop's built-in Stripe module is wired together — registration, the payment component, the payment intent API and the webhook — as a blueprint for building your own payment gateway.
---

# Integrating Stripe Payment Gateway

EverShop ships Stripe as a core module. This guide walks through how that module is actually wired together, so you can use it as a blueprint for your own gateway.

Every path below is relative to `packages/evershop/src/modules/stripe/` in the EverShop repository. Read alongside [Payment Method Development](/docs/development/knowledge-base/payment-method-development), which covers the registration contract in isolation.

## The five pieces

A payment gateway in EverShop is made of five parts:

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
      <td>Declares the method, its payment statuses, and when it is available</td>
    </tr>
    <tr>
      <td>Checkout component</td>
      <td><code>pages/frontStore/checkout/Stripe.tsx</code></td>
      <td>Mounts into the checkout page and supplies the name, form and button renderers</td>
    </tr>
    <tr>
      <td>Payment intent API</td>
      <td><code>api/createPaymentIntent/</code></td>
      <td>Creates the Stripe PaymentIntent and returns its client secret</td>
    </tr>
    <tr>
      <td>Webhook</td>
      <td><code>api/stripeWebHook/</code></td>
      <td>Receives Stripe events and moves the order's payment status</td>
    </tr>
    <tr>
      <td>Admin settings</td>
      <td><code>pages/admin/paymentSetting/StripePayment.tsx</code></td>
      <td>Keys, display name and capture mode</td>
    </tr>
  </tbody>
</table>

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
      const stripeStatus =
        stripeConfig.status ?? (await getSetting('stripePaymentStatus', 0));
      return parseInt(stripeStatus, 10) === 1;
    }
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
      stripe_authorized: { name: 'Authorized', isDefault: false, isCancelable: true, badge: 'warning' },
      stripe_captured: { name: 'Captured', isDefault: false, isCancelable: false, badge: 'success' },
      stripe_failed: { name: 'Failed', isDefault: false, isCancelable: true, badge: 'critical' },
      stripe_refunded: { name: 'Refunded', isDefault: false, isCancelable: false, badge: 'destructive' },
      stripe_partial_refunded: { name: 'Partial Refunded', isDefault: false, isCancelable: false, badge: 'destructive' }
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

The module also hooks order cancellation so a cancelled order releases its authorization:

```ts
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

hookAfter('changePaymentStatus', async (order, orderID, status) => {
  if (status !== 'canceled' || order.payment_method !== 'stripe') {
    return;
  }
  await cancelPaymentIntent(orderID);
});
```

Note the first argument is the hook **name as a string**. Passing the imported function files the hook under a key that never matches, and it silently never fires.

## 2. The checkout component

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

function StripeMethod({ setting, grandTotal, currency, returnUrl, createPaymentIntentApi }) {
  const { registerPaymentComponent } = useCheckoutDispatch();

  useEffect(() => {
    registerPaymentComponent('stripe', {
      nameRenderer: () => <span>{setting.stripeDisplayName}</span>,
      formRenderer: () => (
        <StripeApp
          total={grandTotal.value}
          currency={currency}
          returnUrl={returnUrl}
          createPaymentIntentApi={createPaymentIntentApi}
        />
      ),
      checkoutButtonRenderer: () => <StripeCheckoutButton />
    });
  }, [registerPaymentComponent, setting.stripeDisplayName]);

  // The component itself renders nothing.
  return null;
}
```

Its GraphQL query supplies everything the renderers need:

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

The form uses Stripe's `PaymentElement` inside `<Elements>`, in deferred-intent mode — the intent is created when the shopper submits, not on render:

```tsx
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

<Elements
  stripe={loadStripe(setting.stripePublishableKey)}
  options={{
    mode: 'payment',
    currency: currency.toLowerCase(),
    amount: smallestUnit(total, currency),
    capture_method: setting.stripePaymentMode === 'capture' ? 'automatic_async' : 'manual'
  }}
>
  <PaymentElement id="payment-element" />
</Elements>
```

If you need a hidden field to carry validation state into the checkout form, use a real field component — there is no `Field` component and no `validationRules` prop:

```tsx
import { InputField } from '@components/common/form/InputField';

<InputField
  type="hidden"
  name="stripeCartComplete"
  validation={{ required: 'Please complete the card information' }}
/>
```

## 3. Creating the payment intent

```json title="modules/stripe/api/createPaymentIntent/route.json"
{
  "methods": ["POST"],
  "path": "/stripe/paymentIntents",
  "access": "public"
}
```

Both `cart_id` and `order_id` are required:

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

The handler loads the **cart** — not the order — and derives the amount from `cart.grand_total`, so the client can never dictate what it pays:

```ts title="modules/stripe/api/createPaymentIntent/createPaymentIntent.ts"
import Stripe from 'stripe';
import smallestUnit from 'zero-decimal-currencies';
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';
import { getSetting } from '@evershop/evershop/setting/services';
import { OK, INVALID_PAYLOAD } from '@evershop/evershop/lib/util/httpStatus';

export default async (request, response, next) => {
  const { cart_id, order_id } = request.body;

  const cart = await select().from('cart').where('uuid', '=', cart_id).load(pool);
  if (!cart) {
    response.status(INVALID_PAYLOAD);
    response.json({ error: { status: INVALID_PAYLOAD, message: 'Invalid cart' } });
    return;
  }

  const stripeSecretKey = await getSetting('stripeSecretKey', '');
  const stripePaymentMode = await getSetting('stripePaymentMode', 'capture');

  // ESM: import the constructor. `require()` is not available.
  const stripe = new Stripe(stripeSecretKey);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(smallestUnit(cart.grand_total, cart.currency), 10),
    currency: cart.currency,
    metadata: { cart_id, order_id },
    automatic_payment_methods: { enabled: true },
    capture_method: stripePaymentMode === 'capture' ? 'automatic_async' : 'manual'
  });

  response.status(OK);
  response.json({ data: { clientSecret: paymentIntent.client_secret } });
};
```

Call it from the form with both ids:

```ts
const response = await fetch(createPaymentIntentApi, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cart_id: cartId, order_id: orderId })
});
const { data } = await response.json();
// data.clientSecret
```

:::note This handler declares three parameters
`(request, response, next)` — the third parameter is required whenever a middleware sends its own response. A 2-argument middleware is treated as *passive*: the framework auto-calls `next()` and `apiResponse` then tries to send headers again, producing `ERR_HTTP_HEADERS_SENT`.
:::

## 4. The webhook

The webhook is where payment status actually moves. It never writes `payment_status` with a raw `update()` — it goes through the OMS services so the status transition, the activity log and the payment transaction all stay consistent.

The order is found via `paymentIntent.metadata.order_id` (the key set when the intent was created):

```ts title="modules/stripe/api/stripeWebHook/[bodyJson]webhook.ts"
import Stripe from 'stripe';
import { insertOnUpdate } from '@evershop/evershop/lib/postgres/query';
import addOrderActivityLog from '@evershop/evershop/oms/services/addOrderActivityLog';
import { updatePaymentStatus } from '@evershop/evershop/oms/services/updatePaymentStatus';

const { order_id } = paymentIntent.metadata;

// Record the transaction
await insertOnUpdate('payment_transaction', [
  'transaction_id',
  'payment_transaction_order_id'
])
  .given({ /* ... */ })
  .execute(connection);

// Move the payment status through the registered stripe_* statuses
await updatePaymentStatus(order.order_id, 'stripe_captured', connection);
await addOrderActivityLog(order.order_id, 'Payment captured by Stripe', false, connection);
```

The event-to-status mapping:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Stripe event</th>
      <th>Payment status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>payment_intent.amount_capturable_updated</code></td>
      <td><code>stripe_authorized</code></td>
    </tr>
    <tr>
      <td><code>payment_intent.succeeded</code></td>
      <td><code>stripe_captured</code></td>
    </tr>
    <tr>
      <td><code>payment_intent.canceled</code></td>
      <td><code>canceled</code></td>
    </tr>
  </tbody>
</table>

### Configuring the webhook in Stripe

Point a Stripe webhook endpoint at `https://yourstore.com/api/stripe/webhook` and subscribe to the events above. Copy the signing secret into the admin settings.

For local development, forward events with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 5. Admin settings

`pages/admin/paymentSetting/StripePayment.tsx` mounts into the payment settings page and collects the publishable key, secret key, webhook signing secret, display name, capture mode and enabled flag. Values are read back with `getSetting`, and `getConfig('system.stripe')` takes precedence when present — which lets an operator keep secrets in configuration or the environment instead of the database.

## Building your own gateway

The same five pieces apply. The parts most people get wrong:

- **Register from `bootstrap.ts`.** Nothing else is loaded per module, and the registry locks right after.
- **`validator` is mandatory.** Return `true` if your method is always available.
- **Mount into `checkoutFormAfter`** and call `registerPaymentComponent(code, …)`; do not invent a per-method area.
- **Compute the amount server-side** from the cart, never from the request body.
- **Move status through `updatePaymentStatus`**, not a raw `update('order')`, and declare your statuses plus their `psoMapping` in bootstrap.

## See also

- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — the registration contract on its own
- [registerPaymentMethod](/docs/development/module/functions/registerPaymentMethod) — API reference
- [Order Status Management](/docs/development/knowledge-base/order-status-management) — how payment status maps to order status
