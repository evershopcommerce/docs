---
sidebar_position: 20
keywords:
- del
- delete
- query builder
- database
- postgres
- SQL
groups:
- database
sidebar_label: del
title: del
description: Delete records from the database.
since: 1.0.0
---

# del

Delete records from a database table using the query builder.

## Import

```typescript
import { del } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
del(table: string): DeleteQuery
```

### Parameters

**`table`**

**Type:** `string`

The name of the table to delete from.

## Return Value

Returns a `DeleteQuery` instance that can be chained with additional methods.

## Examples

### Basic Delete

```typescript
import { del } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

await del('customer')
  .where('customer_id', '=', 123)
  .execute(pool);
```

### Delete with Multiple Conditions

```typescript
import { del } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

await del('product')
  .where('status', '=', 0)
  .and('qty', '=', 0)
  .and('created_at', '<', new Date('2024-01-01'))
  .execute(pool);
```

### Delete in Transaction

```typescript
import { del, startTransaction, commit, rollback } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  // Delete order items first
  await del('order_item')
    .where('order_id', '=', 789)
    .execute(connection, false);
  
  // Then delete the order
  await del('order')
    .where('order_id', '=', 789)
    .execute(connection, false);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

## Methods

### where(field, operator, value)

Add a WHERE condition. Required for delete queries.

**Parameters:**
- `field` - Column name
- `operator` - Comparison operator (e.g., `=`, `>`, `<`, `!=`, `IN`, `IS NULL`)
- `value` - Value to compare

**Returns:** `Where`

```typescript
del('customer')
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
del('product')
  .where('status', '=', 0)
  .and('qty', '=', 0)
```

### orWhere(field, operator, value)

Add an OR condition to the WHERE clause.

**Parameters:**
- `field` - Column name
- `operator` - Comparison operator
- `value` - Value to compare

**Returns:** `Node`

```typescript
del('log')
  .where('level', '=', 'debug')
  .orWhere('created_at', '<', new Date('2024-01-01'))
```

### execute(connection, releaseConnection?)

Execute the delete query.

**Parameters:**
- `connection` - `Pool` or `PoolClient` instance
- `releaseConnection` - Whether to release the connection after execution (default: `true`)

**Returns:** `Promise<any[]>` - Array of deleted rows

```typescript
const deletedRows = await del('customer')
  .where('customer_id', '=', 123)
  .execute(pool);
```

## Return Value Details

The `execute()` method returns an array of deleted rows (empty if no rows were deleted):

```typescript
const result = await del('customer')
  .where('customer_id', '=', 123)
  .execute(pool);

// result is an array (empty if nothing was deleted)
console.log(result); // []
```

## See Also

- [insert](/docs/development/module/functions/insert) - Insert records
- [update](/docs/development/module/functions/update) - Update records
- [select](/docs/development/module/functions/select) - Select records
- [pool](/docs/development/module/functions/pool) - Database connection pool
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
