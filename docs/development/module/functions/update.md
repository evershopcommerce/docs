---
sidebar_position: 16
keywords:
- update
- query builder
- database
- postgres
- SQL
groups:
- database
sidebar_label: update
title: update
description: Update existing records in the database.
since: 1.0.0
---

# update

Update existing records in a database table using the query builder.

## Import

```typescript
import { update } from '@evershop/evershop/lib/postgres/query';
```

:::info Typed wrapper
`@evershop/evershop/lib/postgres/query` is EverShop's first-party typed query builder. It wraps `@evershop/postgres-query-builder` and adds table/column types for every known EverShop table, so `update('order')` narrows `.given()` / `.where()` to that table's columns and gives you autocomplete.

The raw `@evershop/postgres-query-builder` package is still available as an untyped lower-level fallback, but new code should import from the wrapper.
:::

## Syntax

```typescript
update<T extends AnyTableName>(table: T): TypedUpdateQuery<T>
```

### Parameters

**`table`**

**Type:** `AnyTableName`

The name of the table to update. Known EverShop tables are suggested by name; any other string is still accepted for custom tables.

## Return Value

Returns a `TypedUpdateQuery<T>` that can be chained with additional methods. When `T` is a known table, `.given()`, `.prime()` and `.where()` only accept that table's columns.

:::warning No raw SQL in `.given()`
`UpdateQuery.given` / `InsertQuery.given` stringify every value, so the `{ isSQL: true, value: '...' }` raw-escape convention — which only works inside `.where()` — is **not** honoured on the write side. A value like `COALESCE(col, NOW())`, `col + 1` or `gen_random_uuid()` will be bound as a literal string and fail with `invalid input syntax for type …`. Drop to `connection.query()` with bind parameters for those.
:::

## Examples

### Basic Update

```typescript
import { update } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await update('customer')
  .given({
    full_name: 'Jane Doe',
    status: 1
  })
  .where('customer_id', '=', 123)
  .execute(pool);

console.log(result.updatedId); // The ID of the updated record
console.log(result); // The full updated row
```

### Update with WHERE Conditions

```typescript
import { update } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

// `product.status` and `product.visibility` are booleans. `qty` is not a `product`
// column — it moved to `product_inventory` in catalog 1.0.3.
const result = await update('product')
  .given({
    status: false,
    updated_at: new Date()
  })
  .where('visibility', '=', true)
  .and('status', '=', true)
  .execute(pool);
```

### Update with prime()

```typescript
import { update } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await update('product')
  .given({ name: 'Updated Product Name' })
  .prime('price', 149.99)
  .prime('updated_at', new Date())
  .where('product_id', '=', 456)
  .execute(pool);
```

### Update in Transaction

```typescript
import { update, startTransaction, commit, rollback } from '@evershop/evershop/lib/postgres/query';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  // Update inventory. Stock lives on `product_inventory`, keyed by
  // `product_inventory_product_id` — not on `product`.
  await update('product_inventory')
    .given({ qty: 5 })
    .where('product_inventory_product_id', '=', 123)
    .execute(connection, false);
  
  // Update order status
  await update('order')
    .given({ status: 'completed' })
    .where('order_id', '=', 789)
    .execute(connection, false);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### Conditional Update

```typescript
import { update } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

// `customer` has no `deactivated_at` or `last_login` column. Unknown keys in
// `.given()` are silently dropped; unknown columns in `.where()` error at runtime.
// (Note `customer.status` is an integer, unlike `product.status`, which is boolean.)
const result = await update('customer')
  .given({ status: 0 })
  .where('created_at', '<', new Date('2024-01-01'))
  .and('status', '=', 1)
  .execute(pool);
```

### Update with Dedicated Connection

```typescript
import { update } from '@evershop/evershop/lib/postgres/query';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  const result = await update('order')
    .given({
      status: 'shipped',
      shipped_at: new Date()
    })
    .where('order_id', '=', 123)
    .execute(connection);
  
  console.log(result.updatedId);
} finally {
  connection.release();
}
```

## Methods

### given(data)

Provide data to update as an object.

**Parameters:**
- `data` - Object containing column names as keys and new values

**Returns:** `UpdateQuery`

```typescript
update('product').given({
  name: 'Updated Name',
  price: 149.99,
  status: 1
})
```

### prime(field, value)

Set a single field value. Can be called multiple times.

**Parameters:**
- `field` - Column name
- `value` - New value

**Returns:** `UpdateQuery`

```typescript
update('product')
  .given({ name: 'Updated Name' })
  .prime('price', 149.99)
  .prime('updated_at', new Date())
```

### where(field, operator, value)

Add a WHERE condition. Required for update queries.

**Parameters:**
- `field` - Column name
- `operator` - Comparison operator (e.g., `=`, `>`, `<`, `!=`)
- `value` - Value to compare

**Returns:** `Where`

```typescript
update('customer')
  .given({ status: 0 })
  .where('customer_id', '=', 123)
```

### and(field, operator, value)

Add an AND condition to the WHERE clause.

**Parameters:**
- `field` - Column name
- `operator` - Comparison operator
- `value` - Value to compare

**Returns:** `Node`

```typescript
update('product')
  .given({ status: false })
  .where('visibility', '=', true)
  .and('status', '=', true)
```

### execute(connection, releaseConnection?)

Execute the update query.

**Parameters:**
- `connection` - `Pool` or `PoolClient` instance
- `releaseConnection` - Whether to release the connection after execution (default: `true`)

**Returns:** `Promise<any>` - The updated row with an `updatedId` property

```typescript
const result = await update('product')
  .given({ status: 1 })
  .where('product_id', '=', 123)
  .execute(pool);
```

## Return Value Details

The `execute()` method returns the updated row with all fields, plus an `updatedId` property:

```typescript
const result = await update('customer')
  .given({ full_name: 'Jane Doe' })
  .where('customer_id', '=', 123)
  .execute(pool);

// result contains:
// {
//   customer_id: 123,
//   email: 'jane@example.com',
//   full_name: 'Jane Doe',
//   updated_at: '2025-11-08T10:30:00.000Z',
//   updatedId: 123  // Same as the primary key value
// }
```

## See Also

- [insert](/docs/development/module/functions/insert) - Insert records
- [select](/docs/development/module/functions/select) - Select records
- [del](/docs/development/module/functions/del) - Delete records
- [pool](/docs/development/module/functions/pool) - Database connection pool
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
