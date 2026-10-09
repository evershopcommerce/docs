---
sidebar_position: 20
keywords:
  - payment methods
  - checkout
  - extensibility
groups:
  - checkout
sidebar_label: registerPaymentMethod()
title: registerPaymentMethod()
description: Register a new payment method, with optional capture, void and refund handlers, in the EverShop checkout system.
---

# `registerPaymentMethod()`

The `registerPaymentMethod()` function allows you to add a new payment method to the EverShop checkout system. This is the primary way to integrate custom payment gateways or offline payment options into your store.

This function is part of a pair: `getAvailablePaymentMethods()` returns the registered methods that are valid for the current checkout. It runs on the server, for example in the GraphQL resolver that feeds the checkout page.

## Function Signature

```ts
function registerPaymentMethod(factory: PaymentMethodFactory): void;
```

## Parameters

The function accepts a single argument, a `factory` object, which defines the behavior and properties of the payment method.

### The `factory` Object

The `factory` object must conform to the `PaymentMethodFactory` type:

```ts
type PaymentMethodFactory = {
  init: () => PaymentMethodInfo | Promise<PaymentMethodInfo>;
  // REQUIRED. The registry validator asserts `typeof method.validator === 'function'`
  // on every factory — a factory without one makes the whole payment-method listing
  // throw `Value checkoutPaymentMethods is invalid: false`.
  validator: (context?: PaymentMethodValidationContext) => boolean | Promise<boolean>;
  // Optional operation handlers. A handler's presence declares that the method
  // supports the operation.
  capture?: PaymentCaptureHandler;
  void?: PaymentVoidHandler;
  refund?: PaymentRefundHandler;
  // Declared but not read by core 2.3. Reserved.
  supportsPartialRefund?: boolean;
};

type PaymentMethodInfo = {
  code: string;
  name: string;
};

interface PaymentMethodValidationContext {
  cartTotal?: number; // The cart's grand total in major units
}

interface PaymentOperationContext {
  order: OrderRow;
  transaction: PaymentTransactionRow; // capture, void: the authorization. refund: the capture.
}

interface PaymentRefundContext extends PaymentOperationContext {
  amount: number; // This refund, in major units
  currency: string;
}

interface PaymentOperationResult {
  transactionId: string; // The provider's id for the capture or refund
  amount: number;        // What the provider actually moved, in major units
  currency?: string;
  offline?: boolean;
  raw?: unknown;
}

type PaymentCaptureHandler = (c: PaymentOperationContext) => Promise<PaymentOperationResult>;
type PaymentVoidHandler = (c: PaymentOperationContext) => Promise<void>;
type PaymentRefundHandler = (c: PaymentRefundContext) => Promise<PaymentOperationResult>;
```

-   **`init()`**: (Required) A function that returns an object (or a Promise resolving to an object) with the payment method's core information:
    -   `code`: A unique string identifier for your payment method (e.g., `'stripe'`, `'cod'`).
    -   `name`: The display name for the payment method shown to the customer (e.g., `'Credit Card'`, `'Cash on Delivery'`).

-   **`validator(context?)`**: **Required.** Returns a boolean (or a Promise of one) deciding whether the method is available for the current cart. Every registered factory must supply one — the registry validates this and throws `Value checkoutPaymentMethods is invalid: false` otherwise, taking down every payment-method listing. If your method is always available, return `true`. The optional `context` carries `cartTotal`; read it defensively (`context?.cartTotal`).
    -   If it returns `true`, the payment method will be available.
    -   If it returns `false`, the method will be hidden.
    -   This is useful for conditionally showing payment methods based on cart total, customer group, or specific items in the cart.

-   **`capture(context)`**: (Optional) Captures an authorized payment at the provider. Receives `{ order, transaction }`, where `transaction` is the authorization, and returns `{ transactionId, amount, currency?, offline?, raw? }`. Called by [`captureOrder`](/docs/development/module/functions/captureOrder).

-   **`void(context)`**: (Optional) Releases an authorization that was never captured. Returns nothing. Called by [`cancelOrder`](/docs/development/module/functions/cancelOrder) when the order's payment status is flagged `isVoidable`. If it throws, the cancellation is rolled back.

-   **`refund(context)`**: (Optional) Refunds a captured payment at the provider. Receives `{ order, transaction, amount, currency }`, where `transaction` is the capture, and returns the refund the provider made. Called by [`refundOrder`](/docs/development/module/functions/refundOrder).

Handlers only do the provider-specific step. Core validates the request, records the `payment_transaction`, moves the payment status and emits `order_refunded`. For this to work, the method must also register payment statuses named `<code>_captured`, `<code>_refunded` and `<code>_partial_refunded`, flagged `isCapturable`, `isRefundable` and `isVoidable` as needed. See [Supporting Capture, Void and Refund](/docs/development/knowledge-base/payment-method-development#supporting-capture-void-and-refund).

Registering two methods with the same `code` does not fail here. `getAvailablePaymentMethods()` throws `Duplicate payment method code: <code>` the first time it lists them.

## How to Use

Call `registerPaymentMethod()` from the default export of your module or extension's `bootstrap.ts`. That is the only entry point the framework loads per module, and the registry is locked immediately afterwards — calling it from a middleware or request handler throws `Registry is locked`.

### Example: Creating a "Cash on Delivery" Method

Let's create a simple "Cash on Delivery" payment method that is only available when it is enabled in the settings, with offline capture and refund handlers.

```js
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
import { getSetting } from '@evershop/evershop/setting/services';

registerPaymentMethod({
  init: () => {
    return {
      code: 'cod',
      name: 'Cash on Delivery'
    };
  },
  validator: async () => {
    const codStatus = await getSetting('codPaymentStatus', 0);
    if (parseInt(codStatus, 10) === 1) {
      return true;
    } else {
      return false;
    }
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
```

In this example:
1.  We import the necessary functions.
2.  We call `registerPaymentMethod()` with our factory object.
3.  The `init` function defines the `code` and `name` for our method.
4.  The `validator` function asynchronously checks if the "Cash on Delivery" method is enabled in the settings.
5.  The `capture` and `refund` handlers call no provider. They report the amount and return a generated transaction id with `offline: true`.

The full module, including its statuses and order-creation hooks, is in [Payment Method Development](/docs/development/knowledge-base/payment-method-development#complete-example-cash-on-delivery).

## See Also

-   [getAvailablePaymentMethods](/docs/development/module/functions/getAvailablePaymentMethods) — List the methods available for a checkout
-   [captureOrder](/docs/development/module/functions/captureOrder), [refundOrder](/docs/development/module/functions/refundOrder) and [recordRefund](/docs/development/module/functions/recordRefund) — The services that call the handlers
-   [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — The full guide
