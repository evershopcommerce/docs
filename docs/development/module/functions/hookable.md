---
sidebar_position: 4
keywords:
- hookable
- hooks
- extension
groups:
- utilities
- hooks
sidebar_label: hookable
title: hookable
description: Wrap a function to make it hookable, allowing hooks to run before or after execution.
---

# hookable

Wrap a function to make it hookable, allowing other code to run before or after it executes.

## Import

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';
```

## Syntax

```typescript
hookable<T extends Function>(originalFunction: T, context?: any): T
```

### Parameters

**`originalFunction`**

**Type:** `T extends Function`

The function to make hookable. Must be a named function.

**`context`**

**Type:** `any` (optional)

Context object passed to hook callbacks.

## Return Value

Returns a proxied version of the original function that executes registered hooks.

## Examples

### Basic Usage

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';
import { insert } from '@evershop/postgres-query-builder';

async function insertCustomerData(data, connection) {
  const customer = await insert('customer')
    .given(data)
    .execute(connection);
  
  delete customer.password;
  return customer;
}

// Make the function hookable
const customer = await hookable(insertCustomerData, { connection })(
  customerData,
  connection
);
```

### With Context

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';

async function createProduct(data, connection) {
  const product = await insert('product')
    .given(data)
    .execute(connection);
  
  return product;
}

// Pass context to hooks
const product = await hookable(createProduct, {
  connection,
  userId: 123,
  source: 'admin'
})(productData, connection);
```

### In Service Function

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';
import { getConnection } from '@evershop/evershop/lib/postgres';

async function insertOrderData(data, connection) {
  return await insert('order')
    .given(data)
    .execute(connection);
}

export async function createOrder(orderData) {
  const connection = await getConnection();
  
  try {
    const order = await hookable(insertOrderData, {
      connection
    })(orderData, connection);
    
    await commit(connection);
    return order;
  } catch (error) {
    await rollback(connection);
    throw error;
  }
}
```

### Multiple Hookable Functions

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';

async function validateData(data) {
  // Validation logic
  return data;
}

async function saveData(data, connection) {
  // Save logic
  return await insert('table').given(data).execute(connection);
}

async function processData(data) {
  const connection = await getConnection();
  
  // Both functions are hookable
  const validated = await hookable(validateData)(data);
  const saved = await hookable(saveData, { connection })(
    validated,
    connection
  );
  
  return saved;
}
```

## Complete Example

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';
import { hookBefore, hookAfter } from '@evershop/evershop/lib/util/hookable';
import { insert } from '@evershop/postgres-query-builder';

// Core function
async function createProduct(data, connection) {
  const product = await insert('product')
    .given(data)
    .execute(connection);
  
  return product;
}

// Make it hookable
export async function productService(data, connection) {
  return await hookable(createProduct, { connection })(
    data,
    connection
  );
}

// Extensions can register hooks
hookBefore('createProduct', async (data) => {
  if (!data.sku) {
    throw new Error('SKU is required');
  }
}, 5);

hookAfter('createProduct', async (product) => {
  console.log('Product created:', product.product_id);
}, 10);
```

## Named Functions Required

The function must be named for hooks to work:

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';

// ✅ Correct - named function
async function saveOrder(data, connection) {
  return await insert('order').given(data).execute(connection);
}

const order = await hookable(saveOrder, { connection })(data, connection);

// ❌ Wrong - anonymous function
const order = await hookable(async (data, connection) => {
  return await insert('order').given(data).execute(connection);
})(data, connection);
```

## Hook Registration

Hooks are registered separately using `hookBefore` and `hookAfter`:

```typescript
import { hookBefore, hookAfter } from '@evershop/evershop/lib/util/hookable';

// Register before hook
hookBefore('createProduct', async (data) => {
  data.slug = generateSlug(data.name);
}, 5);

// Register after hook
hookAfter('createProduct', async (product) => {
  await syncToSearchEngine(product);
}, 10);
```

## Context Object

Pass context to provide additional data to hooks:

```typescript
import { hookable } from '@evershop/evershop/lib/util/hookable';

const result = await hookable(myFunction, {
  connection,
  userId: request.session.userId,
  permissions: request.session.permissions
})(data, connection);

// Hooks can access context
hookBefore('myFunction', async (data, connection, context) => {
  if (!context.permissions.includes('create')) {
    throw new Error('Unauthorized');
  }
});
```

## Notes

- Original function must be a named function
- Returns proxied version that executes hooks
- Context is optional but useful for passing metadata
- Hooks are registered separately with `hookBefore` and `hookAfter`
- Both sync and async functions are supported
- Function name is used to match hooks

## See Also

- [hookBefore](/docs/development/module/functions/hookBefore) - Register before hooks
- [hookAfter](/docs/development/module/functions/hookAfter) - Register after hooks
