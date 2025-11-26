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
description: Register a new payment method in the EverShop checkout system.
---

# `registerPaymentMethod()`

The `registerPaymentMethod()` function allows you to add a new payment method to the EverShop checkout system. This is the primary way to integrate custom payment gateways or offline payment options into your store.

This function is part of a pair, with `getAvailablePaymentMethods()` being used on the frontend to retrieve all the valid, registered methods.

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
  validator?: () => boolean | Promise<boolean>;
};

type PaymentMethodInfo = {
  code: string;
  name: string;
};
```

-   **`init()`**: (Required) A function that returns an object (or a Promise resolving to an object) with the payment method's core information:
    -   `code`: A unique string identifier for your payment method (e.g., `'stripe'`, `'cod'`).
    -   `name`: The display name for the payment method shown to the customer (e.g., `'Credit Card'`, `'Cash on Delivery'`).

-   **`validator()`**: (Optional) A function that returns a boolean value (or a Promise resolving to a boolean). This function determines if the payment method should be available for the current cart.
    -   If it returns `true` or is not provided, the payment method will be available.
    -   If it returns `false`, the method will be hidden.
    -   This is useful for conditionally showing payment methods based on cart total, customer group, or specific items in the cart.

## How to Use

You typically call `registerPaymentMethod()` in the `index.js` file of your module or extension.

### Example: Creating a "Cash on Delivery" Method

Let's create a simple "Cash on Delivery" payment method that is only available for orders under $100.

```js
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';
import { getSetting } from '@evershop/evershop/lib/util/settings';

registerPaymentMethod({
  init: () => {
    return {
      code: 'cod',
      name: 'Cash on Delivery'
    };
  },
  validator: async () => {
    codStatus = await getSetting('codPaymentStatus', 0);
    if (parseInt(codStatus, 10) === 1) {
      return true;
    } else {
      return false;
    }
  }
});
```

In this example:
1.  We import the necessary functions.
2.  We call `registerPaymentMethod()` with our factory object.
3.  The `init` function defines the `code` and `name` for our method.
4.  The `validator` function asynchronously check if the "Cash on Delivery" method is enabled in the settings.