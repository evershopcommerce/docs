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
