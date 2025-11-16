---
sidebar_position: 18
keywords:
- commit
- transaction
- database
- postgres
- COMMIT
groups:
- database
sidebar_label: commit
title: commit
description: Commit a database transaction.
since: 1.0.0
---

# commit

Commit a database transaction and release the connection.

## Import

```typescript
import { commit } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
async commit(connection: PoolClient): Promise<void>
```

### Parameters

**`connection`**

**Type:** `PoolClient`

A dedicated database connection that has an active transaction.

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
  
  await connection.query('UPDATE product SET qty = qty - 1 WHERE product_id = $1', [123]);
  await connection.query('INSERT INTO order_item (product_id, qty) VALUES ($1, $2)', [123, 1]);
  
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### With Query Builder

```typescript
import { startTransaction, commit, rollback, insert, update } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const connection = await getConnection();

try {
  await startTransaction(connection);
  
  const order = await insert('order')
    .given({
      customer_id: 123,
      total: 199.99,
      status: 'pending'
    })
    .execute(connection, false);
  
  await update('customer')
    .given({ last_order_id: order.insertId })
    .where('customer_id', '=', 123)
    .execute(connection, false);
  
  await commit(connection);
  
  return order;
} catch (error) {
  await rollback(connection);
  throw error;
}
```

### Complex Transaction

```typescript
import { startTransaction, commit, rollback, insert, update } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

async function processOrder(orderId) {
  const connection = await getConnection();
  
  try {
    await startTransaction(connection);
    
    // Update order status
    await update('order')
      .given({ status: 'processing' })
      .where('order_id', '=', orderId)
      .execute(connection, false);
    
    // Deduct inventory
    const items = await connection.query(
      'SELECT product_id, qty FROM order_item WHERE order_id = $1',
      [orderId]
    );
    
    for (const item of items.rows) {
      await update('product')
        .given({ qty: item.qty })
        .where('product_id', '=', item.product_id)
        .execute(connection, false);
    }
    
    // Create shipment record
    await insert('shipment')
      .given({
        order_id: orderId,
        status: 'pending',
        created_at: new Date()
      })
      .execute(connection, false);
    
    await commit(connection);
  } catch (error) {
    await rollback(connection);
    throw error;
  }
}
```

## Important Notes

### Connection Release

The connection is automatically released after commit. Do NOT manually release:

```typescript
await startTransaction(connection);
// ... queries ...
await commit(connection);
// Connection is already released - don't call connection.release()
```

### Error Handling

Always use try/catch to ensure rollback on errors:

```typescript
try {
  await startTransaction(connection);
  // ... queries ...
  await commit(connection);
} catch (error) {
  await rollback(connection);
  throw error;
}
```

## See Also

- [startTransaction](/docs/development/module/functions/startTransaction) - Start a transaction
- [rollback](/docs/development/module/functions/rollback) - Rollback a transaction
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
- [insert](/docs/development/module/functions/insert) - Insert records
- [update](/docs/development/module/functions/update) - Update records
