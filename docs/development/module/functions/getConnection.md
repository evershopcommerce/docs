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

```typescript
import { getConnection } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/postgres-query-builder';

const connection = await getConnection();

try {
  const query = select()
    .from('product')
    .where('status', '=', 1)
    .and('qty', '>', 0);
  
  const result = await query.execute(connection);
  return result;
} finally {
  connection.release();
}
```

## See Also

- [pool](/docs/development/module/functions/pool) - PostgreSQL connection pool instance
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
