---
sidebar_position: 40
keywords:
  - payment method
  - payment gateway
  - custom payment
  - checkout
sidebar_label: Payment Method Development
title: Payment Method Development
description: Learn how to create a custom payment method for EverShop, from registration and the capture, void and refund handlers to order placement.
---

# Payment Method Development

This guide walks you through creating a custom payment method for EverShop. You'll learn how to register your payment method, validate its availability, and handle the order placement flow.

## How Payment Methods Work

EverShop uses a registry-based system for payment methods. Each payment method is registered during the bootstrap phase with up to five parts:

1. **`init()`** — Returns the method's code and display name.
2. **`validator(context?)`** — **Required.** Determines whether the method is available for the current checkout. It receives an optional cart context carrying `cartTotal`. It cannot be omitted: the registry asserts `typeof method.validator === 'function'` on every factory, and a factory without one makes the whole listing throw `Value checkoutPaymentMethods is invalid: false`. If your method is always available, return `true`.
3. **`capture(context)`** — Optional. Captures an authorized payment at the provider.
4. **`void(context)`** — Optional. Releases an authorization that was never captured, when the order is canceled.
5. **`refund(context)`** — Optional. Refunds a captured payment at the provider.

The three optional handlers are how a method declares what it supports: a method with a `refund` handler can be refunded, and a method without one cannot. Core does everything else around them. See [Supporting Capture, Void and Refund](#supporting-capture-void-and-refund).

When a customer reaches the checkout, EverShop calls `getAvailablePaymentMethods(context)` which runs every registered method's `init()` and `validator(context)` to build the list of available options.

:::danger Zero-total carts bypass your validator
When the cart's `grand_total` is `0`, `getAvailablePaymentMethods()` **discards every method except the built-in `zero_checkout`** — no matter what your `validator()` returned. The filter is applied centrally, after all validators have run, because a gateway validator cannot reasonably know about zero totals:

```ts
// modules/checkout/services/getAvailablePaymentMethods.ts
if (typeof context.cartTotal === 'number' && context.cartTotal <= 0) {
  return applicableMethods.filter((m) => m.code === ZERO_CHECKOUT_CODE);
}
```

So a 100%-off coupon, a fully store-credited order, or an all-free-items cart will never show your gateway. Do not try to work around it from your validator — see [Zero Total Checkout](./zero-total-checkout) for the full behavior.
:::

## Registering a Payment Method

Register your payment method in your extension's `bootstrap.ts`:

```ts title="extensions/my-payment/src/bootstrap.ts"
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
import { getSetting } from '@evershop/evershop/setting/services';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

export default async () => {
  registerPaymentMethod({
    init: async () => ({
      code: 'my_payment',
      name: await getSetting('myPaymentDisplayName', 'My Payment Method')
    }),
    validator: async () => {
      // Only show this method if it's enabled in settings
      const status = await getSetting('myPaymentStatus', 0);
      return parseInt(status, 10) === 1;
    }
  });
};
```

### The `registerPaymentMethod` Function

```typescript
registerPaymentMethod(factory: PaymentMethodFactory): void

type PaymentMethodFactory = {
  init: () => PaymentMethodInfo | Promise<PaymentMethodInfo>;
  validator?: (
    context?: PaymentMethodValidationContext
  ) => boolean | Promise<boolean>; // required at runtime
  capture?: PaymentCaptureHandler;
  void?: PaymentVoidHandler;
  refund?: PaymentRefundHandler;
  supportsPartialRefund?: boolean; // default false
};

interface PaymentMethodValidationContext {
  // The cart's `grand_total` in major currency units. Undefined when no cart
  // is in scope (context-less callers).
  cartTotal?: number;
}

type PaymentMethodInfo = {
  code: string;  // Unique identifier (e.g., 'stripe', 'cod', 'paypal')
  name: string;  // Display name shown to customers
};

interface PaymentOperationContext {
  order: OrderRow;                    // The order being operated on
  transaction: PaymentTransactionRow; // capture and void: the authorization
                                      // refund: the capture
}

interface PaymentRefundContext extends PaymentOperationContext {
  amount: number;   // This refund, in major currency units
  currency: string;
}

interface PaymentOperationResult {
  transactionId: string; // The provider's id for the capture or refund
  amount: number;        // What the provider actually moved, in major units
  currency?: string;     // Defaults to the order currency
  offline?: boolean;     // true when no provider was involved
  raw?: unknown;         // The provider's response, stored with the transaction
}

type PaymentCaptureHandler = (c: PaymentOperationContext) => Promise<PaymentOperationResult>;
type PaymentVoidHandler = (c: PaymentOperationContext) => Promise<void>;
type PaymentRefundHandler = (c: PaymentRefundContext) => Promise<PaymentOperationResult>;
```

All of these types are exported from `@evershop/evershop/checkout/services`.

:::note `supportsPartialRefund` is reserved
The flag exists on the type, but core 2.3 does not read it: any amount up to what is still refundable is accepted. Do not rely on it to restrict refunds.
:::

The `context` argument is optional and may be `undefined`, so always read it defensively (`context?.cartTotal`). A validator that only checks settings can simply ignore it.

```ts
validator: async (context) => {
  const status = await getSetting('myPaymentStatus', 0);
  if (parseInt(status, 10) !== 1) {
    return false;
  }
  // Example: this gateway rejects anything under 1.00
  return (context?.cartTotal ?? 0) >= 1;
}
```

:::warning
Each payment method code must be unique. Registering two methods with the same code does not fail immediately: `getAvailablePaymentMethods()` throws `Duplicate payment method code: <code>` the first time it lists the methods, which breaks the checkout.

`zero_checkout` is a **reserved** code used by the built-in zero-total payment method. Do not register a method with that code.
:::

### Zero-total Order Validation Rules

Two order-validation rules run at `validateBeforeCreateOrder` and will reject an order outright:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rule</th>
      <th>Rejects when</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>zeroTotalRequiresZeroCheckout</code></td>
      <td>The cart's <code>grand_total</code> is <code>0</code> but <code>payment_method</code> is anything other than <code>zero_checkout</code>.</td>
    </tr>
    <tr>
      <td><code>zeroCheckoutRequiresZeroTotal</code></td>
      <td>The cart's <code>payment_method</code> is <code>zero_checkout</code> but <code>grand_total</code> is greater than <code>0</code>.</td>
    </tr>
  </tbody>
</table>

These close the gap left by a cart whose `payment_method` was never set at all (such a cart carries no field-level error). They apply only to zero-total carts — a non-zero-total order with no payment method behaves as it always has.

:::warning Billing address can be null
A zero-total order does **not** require a billing address — nothing is charged, taxed, or invoiced — so `order.billing_address_id` may be `null`. Any payment code that loads the billing address (to build a gateway payload, to compute AVS data, to render an invoice) must handle the null case instead of assuming a row exists.
:::

## Registering the Payment Form on the Checkout Page

After registering the payment method in `bootstrap.ts`, you need a React component on the checkout page that renders the payment UI (e.g., a credit card form, a "Pay with Cash" message, or a redirect button).

EverShop's `CheckoutContext` provides a `registerPaymentComponent()` function that lets your extension register three renderers for the checkout page:

- **`nameRenderer`** — Renders the payment method label in the method selector (e.g., "Credit Card" with a logo).
- **`formRenderer`** — Renders the payment form when this method is selected (e.g., Stripe card input fields, or an informational message for COD).
- **`checkoutButtonRenderer`** — Renders the "Place Order" button with your custom logic (e.g., call Stripe to confirm payment before placing the order).

### Creating the Checkout Component

Create a React component in `pages/frontStore/checkout/`:

```tsx title="extensions/my-payment/src/pages/frontStore/checkout/MyPayment.tsx"
import React, { useEffect } from 'react';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/frontStore/checkout/CheckoutContext';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

export default function MyPayment({ setting }) {
  const { checkoutSuccessUrl, orderPlaced, orderId, checkoutData } = useCheckout();
  const { registerPaymentComponent } = useCheckoutDispatch();

  // Redirect to success page after order is placed with this method
  useEffect(() => {
    if (orderPlaced && checkoutData.paymentMethod === 'my_payment') {
      window.location.href = `${checkoutSuccessUrl}/${orderId}`;
    }
  }, [orderPlaced, checkoutSuccessUrl, orderId]);

  // Register the three renderers for this payment method
  useEffect(() => {
    registerPaymentComponent('my_payment', {
      // 1. The label shown in the payment method selector
      nameRenderer: () => (
        <div className="flex items-center justify-between w-full">
          <span>{setting.myPaymentDisplayName}</span>
          <img src="/my-payment-logo.png" alt="My Payment" width={60} />
        </div>
      ),
      // 2. The form shown when this method is selected
      formRenderer: () => (
        <div className="p-4">
          {/* Your payment form fields go here */}
          <p>{_('Enter your payment details below.')}</p>
          <input type="text" placeholder="Card number" className="w-full border p-2 rounded" />
        </div>
      ),
      // 3. The checkout button with your payment logic
      checkoutButtonRenderer: () => {
        const { checkout } = useCheckoutDispatch();
        const { loadingStates, orderPlaced } = useCheckout();

        const handleClick = async (e: React.MouseEvent) => {
          e.preventDefault();
          // Call your payment provider here if needed, then place the order
          await checkout();
        };

        return (
          <button
            onClick={handleClick}
            disabled={loadingStates.placingOrder || orderPlaced}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md"
          >
            {loadingStates.placingOrder ? _('Placing Order...') : _('Place Order')}
          </button>
        );
      }
    });
  }, [registerPaymentComponent, setting.myPaymentDisplayName]);

  // This component doesn't render anything visible itself
  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 10
};

export const query = `
  query Query {
    setting {
      myPaymentDisplayName
    }
  }
`;
```

### Key Points

- The component must be placed in the **checkout page folder** (`pages/frontStore/checkout/`) so it loads on the checkout page.
- The `layout.areaId` should be `'checkoutFormAfter'` — this is the Area where payment methods are rendered.
- The `registerPaymentComponent()` **code** (first argument) must match the code returned by your `registerPaymentMethod()` init function in bootstrap.
- The component itself returns `null` — it only registers renderers via the effect.
- Use `useCheckout()` to read checkout state (e.g., `orderPlaced`, `orderId`, `loadingStates`).
- Use `useCheckoutDispatch()` to access `checkout()` (places the order) and `registerPaymentComponent()`.
- The `query` export fetches any settings your payment method needs (e.g., display name, public API keys).

### The `PaymentMethodComponent` Interface

```typescript
interface PaymentMethodComponent {
  nameRenderer: React.ComponentType;      // Label in payment method list
  formRenderer: React.ComponentType;      // Form shown when method is selected
  checkoutButtonRenderer: React.ComponentType; // "Place Order" button
}
```

## Handling Order Placement

After a customer places an order, you need to handle the payment flow. The approach depends on your payment type:

### Offline Payment (e.g., Cash on Delivery)

For offline payments, the order is placed immediately and no provider is involved. Cash on Delivery is the reference implementation. It does four things:

1. **Registers its own statuses**, `cod_pending`, `cod_captured`, `cod_refunded` and `cod_partial_refunded`, flagged so that the **Capture** and **Refund** buttons appear.
2. **Supplies offline `capture` and `refund` handlers.** They call nothing; they report the amount and return a generated transaction id with `offline: true`.
3. **Initializes the payment inside order creation.** A `hookAfter('saveOrder')` hook records an offline `authorize` transaction for the amount to collect and moves the order to `cod_pending`. This runs in the order-creation transaction, so a failure rolls the whole order back.
4. **Emits `order_placed`** from a `hookAfter('createOrderFunc')` hook.

A simplified version for a bank transfer method:

```ts title="extensions/my-payment/src/bootstrap.ts"
import { emit } from '@evershop/evershop/lib/event';
import { hookAfter } from '@evershop/evershop/lib/util/hookable';
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
import {
  addPaymentTransaction,
  updatePaymentStatus
} from '@evershop/evershop/oms/services';

export default async () => {
  // Register the statuses first. See "Adding Custom Payment Statuses" below.

  registerPaymentMethod({
    init: async () => ({
      code: 'bank_transfer',
      name: 'Bank Transfer'
    }),
    // REQUIRED. Return true if the method is always available.
    validator: async () => true,
    // The merchant recording "the transfer arrived"
    capture: async ({ order }) => ({
      transactionId: `bank_transfer-capture-${order.uuid}-${Date.now()}`,
      amount: Number(order.grand_total),
      offline: true
    }),
    // The merchant recording "the money was sent back"
    refund: async ({ order, amount }) => ({
      transactionId: `bank_transfer-refund-${order.uuid}-${Date.now()}`,
      amount,
      offline: true
    })
  });

  // Inside order creation: record what is owed and set the first status
  hookAfter('saveOrder', async function (order, cart, connection) {
    if (order.payment_method !== 'bank_transfer') {
      return;
    }
    await addPaymentTransaction(
      connection,
      order.insertId,
      Number(order.grand_total),
      `bank_transfer-authorize-${order.uuid}`,
      'offline',
      'authorize'
    );
    await updatePaymentStatus(order.insertId, 'bank_transfer_pending', connection);
  });

  // When an order is created with this method, mark it as placed
  hookAfter('createOrderFunc', async function (order) {
    if (order.payment_method === 'bank_transfer') {
      await emit('order_placed', order);
    }
  });
};
```

### Online Payment (e.g., Stripe, PayPal)

For online payments, the order is created first with a `pending` payment status. After the payment provider confirms the payment, you record the transaction, update the payment status and emit `order_placed`.

The typical flow:

1. **Create a payment intent API** — An API endpoint that creates a payment session with your provider.
2. **Frontend component** — A React component in the checkout page that handles the payment UI.
3. **Webhook/callback** — An API endpoint that your provider calls when payment is confirmed. It records the first transaction and sets the first payment status.
4. **Handlers** — `capture`, `void` and `refund` handlers on `registerPaymentMethod`, if you support those operations. You do not write admin routes or buttons for them; core provides both.

The payment-intent endpoint takes the **amount from the order**, never from the request:

```ts title="extensions/my-payment/src/api/createPaymentIntent/[context]bodyParser[auth].ts"
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

export default async (request, response) => {
  const { order_id } = request.body;

  // Scope the lookup so a paid, failed or foreign order cannot get a new payment
  const order = await select()
    .from('order')
    .where('uuid', '=', order_id)
    .and('payment_method', '=', 'my_payment')
    .and('payment_status', '=', 'pending')
    .load(pool);
  if (!order) {
    response.status(400);
    response.$body = { error: { status: 400, message: 'Invalid order' } };
    return;
  }

  // Create payment session with your provider
  const session = await myProvider.createSession({
    amount: order.grand_total,
    currency: order.currency
  });

  response.$body = {
    data: { clientSecret: session.client_secret }
  };
};
```

The [Stripe](/docs/development/advanced/integrate-with-stripe-payment-gateway) and [PayPal](/docs/development/advanced/integrate-with-paypal-payment-gateway) guides walk through complete implementations.

## Adding Custom Payment Statuses

Payment gateways have their own status lifecycle (e.g., `authorized`, `captured`, `refunded`). Register custom statuses in your config. The flags decide which actions an order in that status can take:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "paymentStatus": {
        "my_payment_authorized": {
          "name": "Authorized",
          "badge": "warning",
          "isDefault": false,
          "isCancelable": true,
          "isCapturable": true,
          "isVoidable": true
        },
        "my_payment_captured": {
          "name": "Captured",
          "badge": "success",
          "isDefault": false,
          "isCancelable": false,
          "isRefundable": true
        },
        "my_payment_partial_refunded": {
          "name": "Partial Refunded",
          "badge": "destructive",
          "isDefault": false,
          "isCancelable": false,
          "isRefundable": true
        },
        "my_payment_refunded": {
          "name": "Refunded",
          "badge": "destructive",
          "isDefault": false,
          "isCancelable": false
        }
      }
    }
  }
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Flag</th>
      <th>Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>isCapturable</code></td>
      <td>With a <code>capture</code> handler, the <strong>Capture</strong> button appears and <code>captureOrder</code> is allowed.</td>
    </tr>
    <tr>
      <td><code>isRefundable</code></td>
      <td>With a <code>refund</code> handler, the <strong>Refund</strong> button appears and <code>refundOrder</code> is allowed. Keep it on the partial-refund status so more can be refunded later.</td>
    </tr>
    <tr>
      <td><code>isVoidable</code></td>
      <td>With a <code>void</code> handler, canceling the order releases the authorization.</td>
    </tr>
    <tr>
      <td><code>isCancelable</code></td>
      <td>When <code>false</code>, the order cannot be canceled in this status. Leaving it out allows cancellation.</td>
    </tr>
  </tbody>
</table>

A flag says when an action is *allowed*; a handler says whether the method *supports* it. The action is available only when both are present.

:::warning
`badge` must be one of the `Badge` component's variants: `default`, `secondary`, `destructive`, `success`, `warning`, `outline`, `ghost` or `link` (`components/common/ui/Badge.tsx`). Other values render with the fallback style. The built-in `stripe_failed` and `paypal_failed` statuses use `critical`, which is not a variant, so do not copy it.
:::

:::caution Core builds status codes from your method code
After a capture, core sets `<code>_captured`. After a refund, it sets `<code>_refunded` or `<code>_partial_refunded`. Register exactly these names, and map them in `psoMapping`. Status ids can contain only letters and underscores.
:::

### PSO (Payment-Shipment-Order) Status Mapping

EverShop automatically resolves the overall order status based on the combination of the payment status and the order's shipment **rollup**. Configure this mapping:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "psoMapping": {
        "my_payment_authorized:*": "processing",
        "my_payment_captured:*": "processing",
        "my_payment_captured:delivered": "completed",
        "my_payment_partial_refunded:*": "processing",
        "my_payment_partial_refunded:delivered": "completed",
        "my_payment_refunded:*": "closed"
      }
    }
  }
}
```

The format is `{paymentStatus}:{shipmentRollup}` where `*` matches anything. The second segment is the **order-level shipment rollup** (`pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`), not a per-shipment status. See [Order Status Management](./order-status-management) for the full mapping rules.

## Supporting Capture, Void and Refund

Since 2.3, capturing, voiding and refunding are owned by core and work the same way for every payment method. Core provides the admin routes ([`POST /api/orders/:id/capture`](/docs/api/order#capture-an-order) and [`POST /api/orders/:id/refunds`](/docs/api/order#refund-an-order)), the **Capture** and **Refund** buttons on the order page, the validation, the `payment_transaction` records, the payment status change, the activity log and the `order_refunded` event.

Your method supplies only the step that talks to the provider, as a handler on `registerPaymentMethod`:

```ts title="extensions/my-payment/src/bootstrap.ts"
registerPaymentMethod({
  init: async () => ({ code: 'my_payment', name: 'My Payment' }),
  validator: async () => true,

  // `transaction` is the authorization. Return the capture the provider made.
  capture: async ({ order, transaction }) => {
    const capture = await myProvider.capture(transaction.transaction_id);
    return { transactionId: capture.id, amount: capture.amount, raw: capture };
  },

  // Release an authorization that was never captured. Return nothing.
  void: async ({ transaction }) => {
    await myProvider.cancelAuthorization(transaction.transaction_id);
  },

  // `transaction` is the capture. Return the refund the provider made.
  refund: async ({ order, transaction, amount, currency }) => {
    const refund = await myProvider.refund(transaction.transaction_id, amount, currency);
    return { transactionId: refund.id, amount: refund.amount, raw: refund };
  }
});
```

### What core does around a handler

- **Capture** — [`captureOrder(uuid)`](/docs/development/module/functions/captureOrder) checks that the method has a `capture` handler and the payment status is `isCapturable`, finds the authorization, calls your handler, saves the capture as a transaction and moves the status to `<code>_captured`. It always captures the full amount.
- **Refund** — [`refundOrder(uuid, amount)`](/docs/development/module/functions/refundOrder) checks the `refund` handler and the `isRefundable` flag, checks that the amount is greater than zero and no more than what is still refundable, calls your handler, then [`recordRefund`](/docs/development/module/functions/recordRefund) saves the refund, chooses `<code>_refunded` or `<code>_partial_refunded`, writes the activity log and emits `order_refunded`.
- **Void** — [`cancelOrder`](/docs/development/module/functions/cancelOrder) calls your `void` handler when the order's status is `isVoidable`, inside the cancellation transaction and before the order becomes `canceled`. If the handler throws, the cancellation rolls back.

Core calls your handler outside any database transaction. To refuse an operation, throw an `Error`: nothing is recorded, and the message reaches the admin.

Return what the provider actually moved. For a refund, core uses your `amount`, not the requested one. `transactionId` is the key that prevents duplicates, so it must be the provider's own id for that capture or refund. An offline method has no such id: generate one (for example `my-payment-refund-<uuid>-<timestamp>`) and set `offline: true`.

### Record the first transaction yourself

Core does not create the authorization or the first capture. Your return page, webhook or hook must save a `payment_transaction` row with `payment_action` set to `authorize` or `capture` (use [`addPaymentTransaction`](/docs/development/module/functions/addPaymentTransaction) or `insertOnUpdate`), and set the payment status with [`updatePaymentStatus`](/docs/development/module/functions/updatePaymentStatus). Without that row, capture fails with `Order <uuid> has no authorization to capture` and refund fails with `Order <uuid> has no captured payment to refund`.

Register your statuses before you ship. If `<code>_captured` is missing, the provider call has already succeeded when core fails to record it, and the money moved without a matching record.

### Refunds made at the provider

A merchant can also refund from the provider's own dashboard. Call [`recordRefund`](/docs/development/module/functions/recordRefund) from your webhook with the provider's refund id. It is idempotent on that id, so a refund made from EverShop and the webhook that echoes it are recorded once. Lock the order row in the webhook first, as the Stripe module does, so two deliveries cannot race.

### Void replaces cancel hooks

Before 2.3, gateways released authorizations with a `hookAfter('changePaymentStatus')` hook. Use a `void` handler instead, and do not keep both: the authorization would be voided twice.

### Methods that cannot be captured or refunded

`zero_checkout`, the built-in method for zero-total orders, registers no handlers, so its orders show neither button. Do not register a method with that code.

### Upgrading a gateway from 2.2

- Delete your own capture and refund routes and admin buttons.
- Move the provider calls into `capture`, `void` and `refund` handlers.
- Add the status flags and the `<code>_partial_refunded` status.
- Route refunds that arrive by webhook through `recordRefund`.

## Complete Example: Cash on Delivery

Here is the Cash on Delivery module, trimmed slightly, as a reference for the simplest complete payment method. It registers statuses, handlers and the two order-creation hooks:

```ts title="modules/cod/bootstrap.ts"
import config from 'config';
import { emit } from '@evershop/evershop/lib/event';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { hookAfter } from '@evershop/evershop/lib/util/hookable';
import { getSetting } from '@evershop/evershop/setting/services';
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
import {
  addPaymentTransaction,
  updatePaymentStatus
} from '@evershop/evershop/oms/services';

export default async () => {
  // 1. Statuses: what each one allows, and what it means for the order
  config.util.setModuleDefaults('oms', {
    order: {
      paymentStatus: {
        cod_pending: { name: 'Pending', badge: 'default', isDefault: false, isCancelable: true, isCapturable: true },
        cod_captured: { name: 'Paid', badge: 'success', isDefault: false, isCancelable: false, isRefundable: true },
        cod_refunded: { name: 'Refunded', badge: 'destructive', isDefault: false, isCancelable: false, isRefundable: false },
        cod_partial_refunded: { name: 'Partial Refunded', badge: 'destructive', isDefault: false, isCancelable: false, isRefundable: true }
      },
      psoMapping: {
        'cod_pending:pending': 'new',
        'cod_pending:*': 'processing',
        'cod_captured:*': 'processing',
        'cod_captured:delivered': 'completed',
        'cod_refunded:*': 'closed',
        'cod_partial_refunded:*': 'processing',
        'cod_partial_refunded:delivered': 'completed'
      }
    }
  });

  // 2. Register the payment method and its offline handlers
  registerPaymentMethod({
    init: async () => ({
      code: 'cod',
      name: await getSetting('codDisplayName', 'Cash on Delivery')
    }),
    validator: async () => {
      const codConfig = getConfig('system.cod', {});
      const codStatus = codConfig.status
        ? codConfig.status
        : await getSetting('codPaymentStatus', 0);
      return parseInt(codStatus, 10) === 1;
    },
    // The merchant recording "cash received"
    capture: async ({ order }) => ({
      transactionId: `cod-capture-${order.uuid}-${Date.now()}`,
      amount: Number(order.grand_total),
      offline: true
    }),
    // The merchant recording "cash handed back"
    refund: async ({ order, amount }) => ({
      transactionId: `cod-refund-${order.uuid}-${Date.now()}`,
      amount,
      offline: true
    })
  });

  // 3. Inside order creation: record the amount to collect, set the first status
  hookAfter('saveOrder', async function CodInitializePayment(order, cart, connection) {
    if (order.payment_method !== 'cod') {
      return;
    }
    await addPaymentTransaction(
      connection,
      order.insertId,
      Number(order.grand_total),
      `cod-authorize-${order.uuid}`,
      'offline',
      'authorize'
    );
    await updatePaymentStatus(order.insertId, 'cod_pending', connection);
  });

  // 4. Announce the order
  hookAfter('createOrderFunc', async function EmitOrderPlacedEvent(order) {
    if (order.payment_method === 'cod') {
      await emit('order_placed', order);
    }
  });
};
```

`cod_pending` is deliberately not the shared `pending` status: the **Capture** button is gated on the status flag, so a card order that has not been authorized yet, which sits in `pending`, must not offer it.

## See Also

- [Zero Total Checkout](./zero-total-checkout) — Why a zero-total cart only offers `zero_checkout`
- [Order Status Management](./order-status-management) — Payment, shipment, and order statuses
- [captureOrder](/docs/development/module/functions/captureOrder), [refundOrder](/docs/development/module/functions/refundOrder) and [recordRefund](/docs/development/module/functions/recordRefund) — The services behind the Capture and Refund buttons
- [Integrating Stripe](/docs/development/advanced/integrate-with-stripe-payment-gateway) and [Integrating PayPal](/docs/development/advanced/integrate-with-paypal-payment-gateway) — Complete gateway walk-throughs
- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — How the registration system works
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — How to react to order events
- [hookable](/docs/development/module/functions/hookable) — How to hook into the order creation process
- [Extension Development](/docs/development/module/extension-development) — How to create an extension

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
