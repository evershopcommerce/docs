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
2. **`validator()`** (optional) — Determines whether the method is available for the current checkout. If omitted, the method is always available.

When a customer reaches the checkout, EverShop calls `getAvailablePaymentMethods()` which runs every registered method's `init()` and `validator()` to build the list of available options.

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
  validator?: () => boolean | Promise<boolean>;
};

type PaymentMethodInfo = {
  code: string;  // Unique identifier (e.g., 'stripe', 'cod', 'paypal')
  name: string;  // Display name shown to customers
};
```

:::warning
Each payment method code must be unique. Registering two methods with the same code throws an error.
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
          "badge": "attention"
        },
        "my_payment_captured": {
          "name": "Captured",
          "badge": "success"
        },
        "my_payment_refunded": {
          "name": "Refunded",
          "badge": "critical"
        }
      }
    }
  }
}
```

### PSO (Payment-Shipment-Order) Status Mapping

EverShop automatically resolves the overall order status based on the combination of payment status and shipment status. Configure this mapping:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "psoMapping": {
        "my_payment_captured:*": "processing",
        "my_payment_refunded:*": "canceled"
      }
    }
  }
}
```

The format is `{paymentStatus}:{shipmentStatus}` where `*` matches any status.

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

- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — How the registration system works
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) ��� How to react to order events
- [hookable](/docs/development/module/functions/hookable) — How to hook into the order creation process
- [Extension Development](/docs/development/module/extension-development) — How to create an extension

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
