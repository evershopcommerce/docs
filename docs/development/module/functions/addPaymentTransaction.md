---
sidebar_position: 126
keywords:
  - addPaymentTransaction
  - payment
  - transaction
  - OMS
groups:
  - oms
sidebar_label: addPaymentTransaction
title: addPaymentTransaction
description: Record a payment transaction for an order.
---

# addPaymentTransaction

Record a payment transaction (an authorization, a capture or a refund) for an order. It is a plain `INSERT` into the `payment_transaction` table.

Use it to save the **first** transaction of an order from your own return page, webhook or order-creation hook. Core does not create that row for you, and [captureOrder](/docs/development/module/functions/captureOrder) and [refundOrder](/docs/development/module/functions/refundOrder) need it. For a refund, call [recordRefund](/docs/development/module/functions/recordRefund) instead, and for a capture call [captureOrder](/docs/development/module/functions/captureOrder): they record the transaction, set the status and emit the events.

## Import

```typescript
import { addPaymentTransaction } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
addPaymentTransaction(
  connection: Pool | PoolClient,
  orderId: number,
  amount: number,
  transactionId: string | number,
  transactionType: string,
  paymentAction: string,
  additionalInformation?: string,
  parentTransactionId?: string | number
): Promise<PaymentTransactionRow>
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
      <td><code>connection</code></td>
      <td><code>Pool | PoolClient</code></td>
      <td>Database connection</td>
    </tr>
    <tr>
      <td><code>orderId</code></td>
      <td><code>number</code></td>
      <td>Order database ID (<code>order_id</code>, not the uuid)</td>
    </tr>
    <tr>
      <td><code>amount</code></td>
      <td><code>number</code></td>
      <td>Transaction amount, in major currency units</td>
    </tr>
    <tr>
      <td><code>transactionId</code></td>
      <td><code>string | number</code></td>
      <td>The provider's transaction ID. Together with the order it must be unique.</td>
    </tr>
    <tr>
      <td><code>transactionType</code></td>
      <td><code>string</code></td>
      <td><code>'online'</code> when a payment provider was involved, <code>'offline'</code> when it was not (Cash On Delivery)</td>
    </tr>
    <tr>
      <td><code>paymentAction</code></td>
      <td><code>string</code></td>
      <td><code>'authorize'</code>, <code>'capture'</code> or <code>'refund'</code>. Core matches these exact lowercase values when it looks for the authorization, the capture and the refunds of an order.</td>
    </tr>
    <tr>
      <td><code>additionalInformation</code></td>
      <td><code>string</code> (optional)</td>
      <td>Extra details (JSON string)</td>
    </tr>
    <tr>
      <td><code>parentTransactionId</code></td>
      <td><code>string | number</code> (optional)</td>
      <td>The <code>transactionId</code> of the transaction this one follows, for example the authorization a capture settles</td>
    </tr>
  </tbody>
</table>

## Return Value

Returns `Promise<PaymentTransactionRow>`, the inserted row.

## Notes

- **Not idempotent.** The table has a unique constraint on the order and the transaction id, so inserting the same transaction twice throws. When a webhook can deliver the same event twice, use `insertOnUpdate` on `transaction_id` and `payment_transaction_order_id` instead, as the Stripe and PayPal modules do.
- It does not change the payment status and emits no event. Call [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) for that.
- It is not wrapped in `hookable`.

## Examples

Record the amount to collect when a Cash On Delivery order is created. The Cash On Delivery module does this inside order creation:

```typescript
import { addPaymentTransaction } from "@evershop/evershop/oms/services";

await addPaymentTransaction(
  connection,
  order.insertId,
  Number(order.grand_total),
  `cod-authorize-${order.uuid}`,
  "offline",
  "authorize"
);
```

Record a capture that settles an authorization, with the provider's response attached:

```typescript
await addPaymentTransaction(
  connection,
  orderId,
  99.99,
  "cap_1234567890",
  "online",
  "capture",
  JSON.stringify({ provider: "my-gateway" }),
  "auth_1234567890" // parent transaction: the authorization
);
```

## See Also

- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) — Update payment status
- [captureOrder](/docs/development/module/functions/captureOrder) — Capture an authorized payment
- [recordRefund](/docs/development/module/functions/recordRefund) — Record a refund
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — Payment gateway guide
