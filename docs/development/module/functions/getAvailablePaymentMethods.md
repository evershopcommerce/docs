---
sidebar_position: 63
keywords:
- getAvailablePaymentMethods
- checkout
- payment
groups:
- checkout
sidebar_label: getAvailablePaymentMethods
title: getAvailablePaymentMethods
description: Get available payment methods for checkout.
---

# getAvailablePaymentMethods

Get list of available payment methods.

## Import

```typescript
import { getAvailablePaymentMethods } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
getAvailablePaymentMethods(context?: PaymentMethodValidationContext): Promise<PaymentMethodInfo[]>
```

### Parameters

**`context`** — `PaymentMethodValidationContext` (optional, defaults to `{}`)

Forwarded to every registered factory's `validator`. Its `cartTotal` field is the one core reads: when `cartTotal` is `0` or less, the returned list collapses to the built-in `zero_checkout` method regardless of what any validator returned. Omitting the argument keeps the legacy behavior.

```typescript
interface PaymentMethodValidationContext {
  cartTotal?: number;
}
```

## Return Value

Returns `Promise<PaymentMethodInfo[]>`:

```typescript
{
  code: string;
  name: string;
}[]
```

## Errors

Throws `Duplicate payment method code: <code>` when two registered methods return the same `code`, and the `Value checkoutPaymentMethods is invalid: false` error when a registered factory has no `validator`.

The result contains only `{ code, name }`. It does not include the `capture`, `void` and `refund` handlers.

## Examples

### Basic Usage

```typescript
import { getAvailablePaymentMethods } from "@evershop/evershop/checkout/services";

const methods = await getAvailablePaymentMethods();

methods.forEach(method => {
  console.log(`${method.name} (${method.code})`);
});
```

## See Also

- [registerPaymentMethod](/docs/development/module/functions/registerPaymentMethod) - Register payment methods
- [createOrder](/docs/development/module/functions/createOrder) - Create orders
