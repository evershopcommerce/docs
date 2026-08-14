---
sidebar_position: 40
keywords:
  - payment method
  - payment gateway
  - custom payment
  - checkout
sidebar_label: Payment Method Development
title: Payment Method Development
description: Learn how to create a custom payment method for EverShop, from registration to order placement.
---

# Payment Method Development

This guide walks you through creating a custom payment method for EverShop. You'll learn how to register your payment method, validate its availability, and handle the order placement flow.

## How Payment Methods Work

EverShop uses a registry-based system for payment methods. Each payment method is registered during the bootstrap phase with two functions:

1. **`init()`** — Returns the method's code and display name.
2. **`validator(context?)`** — **Required.** Determines whether the method is available for the current checkout. It receives an optional cart context carrying `cartTotal`. It cannot be omitted: the registry asserts `typeof method.validator === 'function'` on every factory, and a factory without one makes the whole listing throw `Value checkoutPaymentMethods is invalid: false`. If your method is always available, return `true`.

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
  ) => boolean | Promise<boolean>;
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
```

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
Each payment method code must be unique. Registering two methods with the same code throws an error.

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

For offline payments, the order is placed immediately. Use a hook on the `createOrderFunc` to emit the `order_placed` event:

```ts title="extensions/my-payment/src/bootstrap.ts"
import { emit } from '@evershop/evershop/lib/event';
import { hookAfter } from '@evershop/evershop/lib/util/hookable';
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';

export default async () => {
  // Register the method
  registerPaymentMethod({
    init: async () => ({
      code: 'bank_transfer',
      name: 'Bank Transfer'
    })
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

For online payments, the order is created first with a `pending` payment status. After the payment provider confirms the payment, you update the payment status and emit `order_placed`.

The typical flow:

1. **Create a payment intent API** — An API endpoint that creates a payment session with your provider.
2. **Frontend component** — A React component in the checkout page that handles the payment UI.
3. **Webhook/callback** — An API endpoint that your provider calls when payment is confirmed.
4. **Capture API** — An admin endpoint to capture authorized payments.

```ts title="extensions/my-payment/src/api/createPaymentIntent/[context]bodyParser[auth].ts"
export default async (request, response) => {
  const { order_id } = request.body;

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

## Adding Custom Payment Statuses

Payment gateways often have their own status lifecycle (e.g., `authorized`, `captured`, `refunded`). Register custom statuses in your config:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "paymentStatus": {
        "my_payment_authorized": {
          "name": "Authorized",
          "badge": "warning"
        },
        "my_payment_captured": {
          "name": "Captured",
          "badge": "success"
        },
        "my_payment_refunded": {
          "name": "Refunded",
          "badge": "destructive"
        }
      }
    }
  }
}
```

:::warning
`badge` must be one of the `Badge` component's status variants: `default`, `destructive`, `success`, `warning`, or `outline` (`components/common/ui/Badge.tsx`). Values such as `attention` or `critical` are **not** valid and render with the fallback style.
:::

### PSO (Payment-Shipment-Order) Status Mapping

EverShop automatically resolves the overall order status based on the combination of the payment status and the order's shipment **rollup**. Configure this mapping:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "psoMapping": {
        "my_payment_captured:*": "processing",
        "my_payment_refunded:*": "closed"
      }
    }
  }
}
```

The format is `{paymentStatus}:{shipmentRollup}` where `*` matches anything. The second segment is the **order-level shipment rollup** (`pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`), not a per-shipment status. See [Order Status Management](./order-status-management) for the full mapping rules.

## Complete Example: Cash on Delivery

Here is the complete COD module as a reference for the simplest possible payment method:

```ts title="extensions/cod/src/bootstrap.ts"
import { emit } from '@evershop/evershop/lib/event';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { hookAfter } from '@evershop/evershop/lib/util/hookable';
import { getSetting } from '@evershop/evershop/setting/services';
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';

export default async () => {
  // 1. Register the payment method
  registerPaymentMethod({
    init: async () => ({
      code: 'cod',
      name: await getSetting('codDisplayName', 'Cash on Delivery')
    }),
    validator: async () => {
      const codConfig = getConfig('system.cod', {});
      let codStatus;
      if (codConfig.status) {
        codStatus = codConfig.status;
      } else {
        codStatus = await getSetting('codPaymentStatus', 0);
      }
      return parseInt(codStatus, 10) === 1;
    }
  });

  // 2. When order is created with COD, emit order_placed immediately
  hookAfter('createOrderFunc', async function (order) {
    if (order.payment_method === 'cod') {
      await emit('order_placed', order);
    }
  });
};
```

## See Also

- [Zero Total Checkout](./zero-total-checkout) — Why a zero-total cart only offers `zero_checkout`
- [Order Status Management](./order-status-management) — Payment, shipment, and order statuses
- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — How the registration system works
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) ��� How to react to order events
- [hookable](/docs/development/module/functions/hookable) — How to hook into the order creation process
- [Extension Development](/docs/development/module/extension-development) — How to create an extension

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
