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
import { insert } from '@evershop/evershop/lib/postgres/query';
```

:::info Typed wrapper
`@evershop/evershop/lib/postgres/query` is EverShop's first-party typed query builder. It wraps `@evershop/postgres-query-builder` and adds table/column types for every known EverShop table, so `insert('order')` narrows `.given()` / `.where()` to that table's columns and gives you autocomplete.

The raw `@evershop/postgres-query-builder` package is still available as an untyped lower-level fallback, but new code should import from the wrapper.
:::

## Syntax

```typescript
insert<T extends AnyTableName>(table: T): TypedInsertQuery<T>
```

### Parameters

**`table`**

**Type:** `AnyTableName`

The name of the table to insert into. Known EverShop tables are suggested by name; any other string is still accepted for custom tables.

## Return Value

Returns a `TypedInsertQuery<T>` that can be chained with additional methods. When `T` is a known table, `.given()` and `.prime()` only accept that table's columns.

## Examples

### Basic Insert

```typescript
import { insert } from '@evershop/evershop/lib/postgres/query';
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
import { insert } from '@evershop/evershop/lib/postgres/query';
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
import { insert, startTransaction, commit, rollback } from '@evershop/evershop/lib/postgres/query';
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
  
  // The street columns are `address_1` / `address_2` — there is no `address`
  // column, and `country` is NOT NULL.
  await insert('customer_address')
    .given({
      customer_id: customer.insertId,
      address_1: '123 Main St',
      city: 'New York',
      country: 'US'
    })
    .execute(connection, false);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### A single statement outside a transaction

Use the shared pool. A lone statement needs no dedicated connection:

```typescript
import { insert } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

const result = await insert('order')
  .given({
    customer_id: 123,
    total: 199.99,
    status: 'pending'
  })
  .execute(pool);

console.log(result.insertId);
```

:::warning Do not pair `.execute(connection)` with a manual `release()`
`.execute()` releases the connection itself unless you pass `false` as the second
argument. Combining the default `.execute(connection)` with a
`finally { connection.release(); }` releases twice and throws
`Release called on client which has already been released to the pool`.

Pick one: either `.execute(connection)` and no manual release, or
`.execute(connection, false)` with your own `finally { connection.release(); }`.
:::

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
