---
sidebar_position: 13
keywords:
- getConnection
- database
- postgres
- connection
- transaction
groups:
- database
sidebar_label: getConnection
title: getConnection
description: Get a dedicated PostgreSQL database connection from the pool.
since: 1.0.0
---

# getConnection

Get a dedicated PostgreSQL database connection from the connection pool.

## Import

```typescript
import { getConnection } from '@evershop/evershop/lib/postgres';
```

## Syntax

```typescript
async getConnection(): Promise<PoolClient>
```

### Parameters

None.

## Return Value

Returns a `Promise<PoolClient>` - a dedicated database client from the connection pool.

:::warning Do not run query-builder reads on a fresh client before `startTransaction`
The query builder auto-releases the connection after `.execute()` / `.load()` unless the client is inside a transaction (`startTransaction` sets an internal `INTRANSACTION` flag). A query-builder read on a freshly acquired `PoolClient` therefore hands it straight back to the pool, and the next `startTransaction(connection)` operates on a detached client — surfacing later as `Release called on client which has already been released to the pool`.

Either call `startTransaction` **immediately** after `getConnection()`, or run pre-transaction reads on the shared `pool` (which the auto-release ignores) and acquire the dedicated client only at the top of the transaction. Raw `connection.query()` calls are unaffected.
:::

## Examples

### Basic Usage

```typescript
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  const result = await connection.query('SELECT * FROM product WHERE product_id = $1', [123]);
  console.log(result.rows[0]);
} finally {
  connection.release();
}
```

### Transaction

```typescript
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await connection.query('BEGIN');
  
  // Update inventory
  await connection.query(
    'UPDATE product SET qty = qty - $1 WHERE product_id = $2',
    [quantity, productId]
  );
  
  // Create order item
  await connection.query(
    'INSERT INTO order_item (order_id, product_id, qty, price) VALUES ($1, $2, $3, $4)',
    [orderId, productId, quantity, price]
  );
  
  await connection.query('COMMIT');
} catch (error) {
  await connection.query('ROLLBACK');
  throw error;
} finally {
  connection.release();
}
```

### Multiple Queries

```typescript
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  // Execute multiple related queries with same connection
  const customer = await connection.query(
    'SELECT * FROM customer WHERE customer_id = $1',
    [customerId]
  );
  
  const orders = await connection.query(
    'SELECT * FROM "order" WHERE customer_id = $1',
    [customerId]
  );
  
  const addresses = await connection.query(
    'SELECT * FROM customer_address WHERE customer_id = $1',
    [customerId]
  );
  
  return {
    customer: customer.rows[0],
    orders: orders.rows,
    addresses: addresses.rows
  };
} finally {
  connection.release();
}
```

### With Query Builder

Inside a transaction, the query builder leaves the connection alone, so `commit()` / `rollback()` own the release:

```typescript
import { getConnection } from '@evershop/evershop/lib/postgres';
import {
  select,
  update,
  startTransaction,
  commit,
  rollback
} from '@evershop/evershop/lib/postgres/query';

const connection = await getConnection();
await startTransaction(connection);

try {
  const product = await select()
    .from('product')
    .where('product_id', '=', 123)
    .load(connection);

  await update('product')
    .given({ status: false })
    .where('product_id', '=', product.product_id)
    .execute(connection);

  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

For a plain read there is no reason to take a dedicated client at all — use the pool:

```typescript
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/evershop/lib/postgres/query';

const products = await select()
  .from('product')
  .where('status', '=', true)
  .execute(pool);
```

## See Also

- [pool](/docs/development/module/functions/pool) - PostgreSQL connection pool instance
- [startTransaction](/docs/development/module/functions/startTransaction) - Start a transaction
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
