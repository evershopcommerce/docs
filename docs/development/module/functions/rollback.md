---
sidebar_position: 19
keywords:
- rollback
- transaction
- database
- postgres
- ROLLBACK
groups:
- database
sidebar_label: rollback
title: rollback
description: Rollback a database transaction.
since: 1.0.0
---

# rollback

Rollback a database transaction and release the connection.

## Import

```typescript
import { rollback } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
async rollback(connection: PoolClient): Promise<void>
```

### Parameters

**`connection`**

**Type:** `PoolClient`

A dedicated database connection that has an active transaction.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Transaction Rollback

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
  await rollback(connection); // Undo all changes
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
      total: 199.99
    })
    .execute(connection, false);
  
  // This might throw an error
  await update('product')
    .given({ qty: -10 }) // Invalid quantity
    .where('product_id', '=', 456)
    .execute(connection, false);
  
  await commit(connection);
} catch (error) {
  await rollback(connection); // Order insert is also undone
  throw error;
}
```

### Conditional Rollback

```typescript
import { startTransaction, commit, rollback, update, select } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

async function processPayment(orderId, amount) {
  const connection = await getConnection();
  
  try {
    await startTransaction(connection);
    
    // Check customer balance
    const customer = await select('customer_id', 'balance')
      .from('customer')
      .where('customer_id', '=', customerId)
      .load(connection);
    
    if (customer.balance < amount) {
      // Insufficient balance - rollback
      await rollback(connection);
      throw new Error('Insufficient balance');
    }
    
    // Deduct balance
    await update('customer')
      .given({ balance: customer.balance - amount })
      .where('customer_id', '=', customerId)
      .execute(connection, false);
    
    // Update order
    await update('order')
      .given({ status: 'paid' })
      .where('order_id', '=', orderId)
      .execute(connection, false);
    
    await commit(connection);
  } catch (error) {
    await rollback(connection);
    throw error;
  }
}
```

### Multiple Operations Rollback

```typescript
import { startTransaction, commit, rollback, insert, update } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

async function transferInventory(fromWarehouse, toWarehouse, productId, qty) {
  const connection = await getConnection();
  
  try {
    await startTransaction(connection);
    
    // Deduct from source warehouse
    await update('inventory')
      .given({ qty: qty })
      .where('warehouse_id', '=', fromWarehouse)
      .and('product_id', '=', productId)
      .execute(connection, false);
    
    // Add to destination warehouse
    await update('inventory')
      .given({ qty: qty })
      .where('warehouse_id', '=', toWarehouse)
      .and('product_id', '=', productId)
      .execute(connection, false);
    
    // Log transfer
    await insert('inventory_transfer')
      .given({
        from_warehouse: fromWarehouse,
        to_warehouse: toWarehouse,
        product_id: productId,
        qty: qty,
        transferred_at: new Date()
      })
      .execute(connection, false);
    
    await commit(connection);
  } catch (error) {
    await rollback(connection); // All changes are undone
    console.error('Transfer failed, rolling back:', error);
    throw error;
  }
}
```

## Important Notes

### Connection Release

The connection is automatically released after rollback. Do NOT manually release:

```typescript
await startTransaction(connection);
try {
  // ... queries ...
  await commit(connection);
} catch (error) {
  await rollback(connection);
  // Connection is already released - don't call connection.release()
}
```

### Always Use in Catch Block

Always call rollback in the catch block:

```typescript
const connection = await getConnection();

try {
  await startTransaction(connection);
  // ... queries ...
  await commit(connection);
} catch (error) {
  await rollback(connection); // Essential!
  throw error;
}
```

## See Also

- [startTransaction](/docs/development/module/functions/startTransaction) - Start a transaction
- [commit](/docs/development/module/functions/commit) - Commit a transaction
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
- [insert](/docs/development/module/functions/insert) - Insert records
- [update](/docs/development/module/functions/update) - Update records
