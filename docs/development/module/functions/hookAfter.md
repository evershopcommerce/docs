---
sidebar_position: 6
keywords:
- hookAfter
- hooks
- extension
groups:
- utilities
sidebar_label: hookAfter
title: hookAfter
description: Register a callback to run after a hookable function executes.
---

# hookAfter

Register a callback to run after a hookable function executes.

## Import

```typescript
import { hookAfter } from '@evershop/evershop/lib/util/hookable';
```

## Syntax

```typescript
hookAfter(funcName: string, callback: Function, priority?: number): void
```

### Parameters

**`funcName`**

**Type:** `string`

The name of the function to hook into.

**`callback`**

**Type:** `Function`

The callback function to execute. First parameter is the result from the original function, followed by the original function's arguments.

**`priority`**

**Type:** `number` (optional, default: `10`)

Execution priority. Lower numbers execute first.

## Return Value

Returns `void`.

## Examples

### Basic Hook

```typescript
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

hookAfter('insertCustomerData', async (result, data, connection) => {
  console.log('Customer created:', result.customer_id);
});
```

### Send Email

```typescript
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

hookAfter('insertCustomerData', async (customer, data, connection) => {
  await sendWelcomeEmail({
    to: customer.email,
    name: customer.full_name
  });
}, 10);
```

## Bootstrap Registration

Register hooks during application bootstrap:

```typescript
// extensions/notifications/bootstrap.ts
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

export default function bootstrap() {
  hookAfter('insertCustomerData', sendWelcomeEmail, 10);
  hookAfter('createOrder', sendOrderConfirmation, 10);
  hookAfter('createProduct', syncToExternalCatalog, 15);
}
```

## Async Operations

Hooks support async operations:

```typescript
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

hookAfter('createOrder', async (order) => {
  // Multiple async operations
  await Promise.all([
    sendEmail(order),
    updateInventory(order),
    createInvoice(order)
  ]);
}, 10);
```

## Notes

- Hooks must be registered during bootstrap

## See Also

- [hookable](/docs/development/module/functions/hookable) - Make functions hookable
- [hookBefore](/docs/development/module/functions/hookBefore) - Hook before function execution
