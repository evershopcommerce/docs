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

Forwarded to every registered factory's `validator`. Its `cartTotal` field is the one core reads: when `cartTotal` is `0` or less, the returned list collapses to the built-in `zero_checkout` method regardless of what any validator returned. Omitting the argument keeps the legacy behaviour.

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

- [addProcessor](/docs/development/module/functions/addProcessor) - Register payment methods
- [createOrder](/docs/development/module/functions/createOrder) - Create orders
