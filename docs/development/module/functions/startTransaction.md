---
sidebar_position: 17
keywords:
- startTransaction
- transaction
- database
- postgres
- BEGIN
groups:
- database
sidebar_label: startTransaction
title: startTransaction
description: Start a database transaction.
---

# startTransaction

Start a database transaction by executing BEGIN.

## Import

```typescript
import { startTransaction } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
async startTransaction(connection: PoolClient): Promise<void>
```

### Parameters

**`connection`**

**Type:** `PoolClient`

A dedicated database connection from the pool. Must be a `PoolClient`, not a `Pool` instance.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Transaction

```typescript
import { startTransaction, commit, rollback } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  // Your queries here
  await connection.query('INSERT INTO customer (email) VALUES ($1)', ['test@example.com']);
  await connection.query('INSERT INTO customer_address (customer_id) VALUES ($1)', [123]);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### Transaction with Query Builder

```typescript
import { startTransaction, commit, rollback, insert, update } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  const customer = await insert('customer')
    .given({
      email: 'customer@example.com',
      full_name: 'John Doe'
    })
    .execute(connection, false); // Don't release connection
  
  await insert('customer_address')
    .given({
      customer_id: customer.insertId,
      address: '123 Main St'
    })
    .execute(connection, false);
  
  await update('customer')
    .given({ status: 1 })
    .where('customer_id', '=', customer.insertId)
    .execute(connection, false);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### Nested Operations

```typescript
import { startTransaction, commit, rollback, insert } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

async function createOrderWithItems(orderData, items) {
  const connection = await getConnection();
  
  try {
    await startTransaction(connection);
    
    // Create order
    const order = await insert('order')
      .given(orderData)
      .execute(connection, false);
    
    // Create order items
    for (const item of items) {
      await insert('order_item')
        .given({
          order_id: order.insertId,
          product_id: item.product_id,
          qty: item.qty,
          price: item.price
        })
        .execute(connection, false);
      
      // Update inventory
      await update('product')
        .given({ qty: item.qty })
        .where('product_id', '=', item.product_id)
        .execute(connection, false);
    }
    
    await commit(connection);
    return order;
  } catch (error) {
    await rollback(connection);
    throw error;
  }
}
```

## Important Notes

### Connection Management

- Must use a `PoolClient`, not a `Pool` instance
- Must call `commit()` or `rollback()` to end the transaction
- Connection is automatically released by `commit()` or `rollback()`
- Do not manually release connection when in a transaction

### Query Execution

When executing queries inside a transaction, set `releaseConnection` to `false`:

```typescript
await insert('customer')
  .given({ email: 'test@example.com' })
  .execute(connection, false); // Don't release!
```

## See Also

- [commit](/docs/development/module/functions/commit) - Commit a transaction
- [rollback](/docs/development/module/functions/rollback) - Rollback a transaction
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
- [insert](/docs/development/module/functions/insert) - Insert records
- [update](/docs/development/module/functions/update) - Update records
