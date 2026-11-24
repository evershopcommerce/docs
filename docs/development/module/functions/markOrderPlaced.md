---
slug: markorderplaced
sidebar_position: 148
keywords:
  - markOrderPlaced
  - order_placed
  - placed_at
  - payment
  - OMS
groups:
  - oms
sidebar_label: markOrderPlaced
title: markOrderPlaced
description: Mark an order placed and emit the order_placed event, once per order.
---

# markOrderPlaced

Mark an order placed: set `order.placed_at` and emit the `order_placed` event, once per order.

`order_placed` sends the order confirmation email and the `order_placed` webhook, and every subscriber that reacts to a new order listens to it. Core does not emit it when an order is created, because an order is created before it is paid. The payment method calls `markOrderPlaced` at its own moment of success:

- An **offline** method (Cash on Delivery, bank transfer): when the order is created.
- An **online** method (a card or wallet gateway): when the gateway accepts the payment, authorized or captured. PayPal also places an order whose capture is pending review.

## Import

```typescript
import { markOrderPlaced } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
markOrderPlaced(
  orderId: number,
  connection?: PoolClient
): Promise<OrderRow | null>
```

### Parameters

<table className="not-prose table-auto">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>orderId</code></td>
      <td><code>number</code></td>
      <td>Order database ID (<code>order_id</code>, not the uuid)</td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td><code>PoolClient</code> (optional)</td>
      <td>The connection of your open transaction, started with <code>startTransaction</code>; any other connection is refused. The event then exists only if your transaction commits. Without it, <code>markOrderPlaced</code> runs in a transaction of its own.</td>
    </tr>
  </tbody>
</table>

:::warning
Inside your own transaction, always pass its connection. Without it, `markOrderPlaced` opens a second connection, which waits for the lock your transaction holds on the order row (taken by `updatePaymentStatus`, or by `SELECT ... FOR UPDATE`), while your transaction waits for the call. Both wait forever.
:::

## Return Value

Returns `Promise<OrderRow | null>`:

- the placed order, as it is after the update, when this call placed it;
- `null` when the order was already placed, or does not exist.

## How it works

It runs one statement and emits only when that statement changes a row:

```sql
UPDATE "order" SET "placed_at" = NOW()
 WHERE "order_id" = $1 AND "placed_at" IS NULL
 RETURNING *
```

- **Once per order.** The first call sets `placed_at`. Every later call finds it set and does nothing. Two calls at the same time are safe too: the second waits for the first transaction to finish, then finds `placed_at` set. So a return page, a webhook and a cron job can all call it for the same order.
- **One payload.** The event carries the full order row returned by the `UPDATE`: the payment status your code set earlier in the same transaction, the order status and `placed_at` included.
- **All or nothing.** `placed_at` and the event are written in the same transaction. If the event cannot be saved, `placed_at` is not set either, so the next call still sends it.

## Examples

A webhook that records a captured payment. Update the payment status first, then mark the order placed, in the same transaction:

```typescript
import {
  markOrderPlaced,
  updatePaymentStatus
} from "@evershop/evershop/oms/services";

await updatePaymentStatus(order.order_id, "my_payment_captured", connection);
await markOrderPlaced(order.order_id, connection);
await commit(connection);
```

An offline method marks its order placed after the order is created, from its `bootstrap.ts`:

```typescript
import { error } from "@evershop/evershop/lib/log";
import { hookAfter } from "@evershop/evershop/lib/util/hookable";
import { markOrderPlaced } from "@evershop/evershop/oms/services";

hookAfter("createOrderFunc", async function (order) {
  if (order.payment_method !== "bank_transfer") {
    return;
  }
  try {
    await markOrderPlaced(order.insertId);
  } catch (e) {
    // The order exists already: a failure here must not fail the checkout
    error(e);
  }
});
```

## Notes

- Do not emit `order_placed` yourself. Core emits it only through `markOrderPlaced`.
- An extension that still emits `order_placed` directly keeps working: core does not emit it a second time. But its orders keep `placed_at` empty.
- `placed_at` is empty while the payment is awaited, and for an order whose payment failed or was never made. Orders that existed before this column was added got their creation time, when their payment went further than pending, failed or canceled, when a payment was recorded for them, or when they are Cash on Delivery orders. Their `updated_at` is kept.
- It does not change the payment status. Call [updatePaymentStatus](/docs/development/module/functions/updatepaymentstatus) first.

## See Also

- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — When to mark an order placed
- [updatePaymentStatus](/docs/development/module/functions/updatepaymentstatus) — Update the payment status
- [addPaymentTransaction](/docs/development/module/functions/addpaymenttransaction) — Record a payment transaction
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — React to `order_placed`
