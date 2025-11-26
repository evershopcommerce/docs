---
sidebar_position: 15
keywords:
- insert
- query builder
- database
- postgres
- SQL
groups:
- database
sidebar_label: insert
title: insert
description: Insert a new record into the database.
since: 1.0.0
---

# insert

Insert a new record into a database table using the query builder.

## Import

```typescript
import { insert } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
insert(table: string): InsertQuery
```

### Parameters

**`table`**

**Type:** `string`

The name of the table to insert into.

## Return Value

Returns an `InsertQuery` instance that can be chained with additional methods.

## Examples

### Basic Insert

```typescript
import { insert } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await insert('customer')
  .given({
    email: 'customer@example.com',
    full_name: 'John Doe',
    status: 1
  })
  .execute(pool);

console.log(result.insertId); // The auto-generated ID
console.log(result); // The full inserted row
```

### Insert with prime()

```typescript
import { insert } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await insert('product')
  .given({
    name: 'Product Name',
    price: 99.99
  })
  .prime('status', 1)
  .prime('created_at', new Date())
  .execute(pool);
```

### Insert in Transaction

```typescript
import { insert, startTransaction, commit, rollback } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  const customer = await insert('customer')
    .given({
      email: 'customer@example.com',
      full_name: 'John Doe'
    })
    .execute(connection, false);
  
  await insert('customer_address')
    .given({
      customer_id: customer.insertId,
      address: '123 Main St',
      city: 'New York'
    })
    .execute(connection, false);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### Insert with Dedicated Connection

```typescript
import { insert } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  const result = await insert('order')
    .given({
      customer_id: 123,
      total: 199.99,
      status: 'pending'
    })
    .execute(connection);
  
  console.log(result.insertId);
} finally {
  connection.release();
}
```

## Methods

### given(data)

Provide data to insert as an object.

**Parameters:**
- `data` - Object containing column names as keys and values to insert

**Returns:** `InsertQuery`

```typescript
insert('product').given({
  name: 'Product Name',
  price: 99.99,
  status: 1
})
```

### prime(field, value)

Set a single field value. Can be called multiple times.

**Parameters:**
- `field` - Column name
- `value` - Value to insert

**Returns:** `InsertQuery`

```typescript
insert('product')
  .given({ name: 'Product Name' })
  .prime('price', 99.99)
  .prime('status', 1)
```

### execute(connection, releaseConnection?)

Execute the insert query.

**Parameters:**
- `connection` - `Pool` or `PoolClient` instance
- `releaseConnection` - Whether to release the connection after execution (default: `true`)

**Returns:** `Promise<any>` - The inserted row with an `insertId` property

```typescript
const result = await insert('product')
  .given({ name: 'Product' })
  .execute(pool);
```

## Return Value Details

The `execute()` method returns the inserted row with all fields, plus an `insertId` property:

```typescript
const result = await insert('customer')
  .given({ email: 'test@example.com', full_name: 'John Doe' })
  .execute(pool);

// result contains:
// {
//   customer_id: 123,
//   email: 'test@example.com',
//   full_name: 'John Doe',
//   created_at: '2025-11-08T10:30:00.000Z',
//   insertId: 123  // Same as the primary key value
// }
```

## See Also

- [update](/docs/development/module/functions/update) - Update records
- [select](/docs/development/module/functions/select) - Select records
- [del](/docs/development/module/functions/del) - Delete records
- [pool](/docs/development/module/functions/pool) - Database connection pool
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
