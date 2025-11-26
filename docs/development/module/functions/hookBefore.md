---
sidebar_position: 5
keywords:
- hookBefore
- hooks
- extension
groups:
- utilities
sidebar_label: hookBefore
title: hookBefore
description: Register a callback to run before a hookable function executes.
---

# hookBefore

Register a callback to run before a hookable function executes.

## Import

```typescript
import { hookBefore } from '@evershop/evershop/lib/util/hookable';
```

## Syntax

```typescript
hookBefore(funcName: string, callback: Function, priority?: number): void
```

### Parameters

**`funcName`**

**Type:** `string`

The name of the function to hook into.

**`callback`**

**Type:** `Function`

The callback function to execute. Receives the same arguments as the original function.

**`priority`**

**Type:** `number` (optional, default: `10`)

Execution priority. Lower numbers execute first.

## Return Value

Returns `void`.

## Examples

### Basic Hook

```typescript
import { hookBefore } from '@evershop/evershop/lib/util/hookable';

hookBefore('insertCustomerData', async (data, connection) => {
  console.log('About to insert customer:', data.email);
});
```

### Validate Data

```typescript
import { hookBefore } from '@evershop/evershop/lib/util/hookable';

hookBefore('insertCustomerData', async (data, connection) => {
  if (!data.email) {
    throw new Error('Email is required');
  }
  
  if (!data.full_name) {
    throw new Error('Full name is required');
  }
}, 5);
```

## Bootstrap Registration

Register hooks during application bootstrap:

```typescript
// extensions/custom-validation/bootstrap.ts
import { hookBefore } from '@evershop/evershop/lib/util/hookable';

export default function bootstrap() {
  hookBefore('insertCustomerData', validateCustomerData, 5);
  hookBefore('createProduct', validateProductData, 5);
  hookBefore('createOrder', validateOrderData, 5);
}
```

## Notes

- Hooks must be registered during bootstrap

## See Also

- [hookable](/docs/development/module/functions/hookable) - Make functions hookable
- [hookAfter](/docs/development/module/functions/hookAfter) - Hook after function execution
