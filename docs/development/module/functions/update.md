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
import { update } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
update(table: string): UpdateQuery
```

### Parameters

**`table`**

**Type:** `string`

The name of the table to update.

## Return Value

Returns an `UpdateQuery` instance that can be chained with additional methods.

## Examples

### Basic Update

```typescript
import { update } from '@evershop/postgres-query-builder';
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
import { update } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await update('product')
  .given({
    status: 0,
    updated_at: new Date()
  })
  .where('qty', '=', 0)
  .and('status', '=', 1)
  .execute(pool);
```

### Update with prime()

```typescript
import { update } from '@evershop/postgres-query-builder';
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
import { update, startTransaction, commit, rollback } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  // Update inventory
  await update('product')
    .given({ qty: 5 })
    .where('product_id', '=', 123)
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
import { update } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await update('customer')
  .given({
    status: 0,
    deactivated_at: new Date()
  })
  .where('last_login', '<', new Date('2024-01-01'))
  .and('status', '=', 1)
  .execute(pool);
```

### Update with Dedicated Connection

```typescript
import { update } from '@evershop/postgres-query-builder';
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
  .given({ status: 0 })
  .where('qty', '=', 0)
  .and('status', '=', 1)
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
