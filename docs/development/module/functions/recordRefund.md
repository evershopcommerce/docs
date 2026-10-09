---
sidebar_position: 140
keywords:
  - recordRefund
  - payment
  - refund
  - OMS
groups:
  - oms
sidebar_label: recordRefund
title: recordRefund
description: Record a refund that already happened at the payment provider, set the payment status and emit order_refunded.
---

# recordRefund

Record a refund against an order. `recordRefund` never calls a payment provider: it writes down a refund that has already happened. It is the one place that saves refund transactions and emits the `order_refunded` event, so every payment method gets the same bookkeeping.

[refundOrder](/docs/development/module/functions/refundOrder) calls it after an admin refund. Call it yourself from a webhook to record a refund that was made outside EverShop, such as one issued from the provider's dashboard.

## Import

```typescript
import { recordRefund } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
recordRefund(params: RecordRefundParams, conn?: PoolClient): Promise<RecordRefundResult>

interface RecordRefundParams {
  order: OrderRow;
  transactionId: string;
  amount: number;
  currency?: string;
  offline?: boolean;
  raw?: unknown;
}

interface RecordRefundResult {
  status: string;
  isFullRefund: boolean;
  alreadyRecorded: boolean;
}
```

### Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>order</code></td>
      <td><code>OrderRow</code></td>
      <td>The order row. Needs <code>order_id</code>, <code>uuid</code>, <code>payment_method</code>, <code>payment_status</code> and <code>currency</code>.</td>
    </tr>
    <tr>
      <td><code>transactionId</code></td>
      <td><code>string</code></td>
      <td>The provider's id for this refund. It is the idempotency key: a refund with an id that is already recorded for the order is skipped.</td>
    </tr>
    <tr>
      <td><code>amount</code></td>
      <td><code>number</code></td>
      <td>This refund's amount, in major currency units.</td>
    </tr>
    <tr>
      <td><code>currency</code></td>
      <td><code>string</code> (optional)</td>
      <td>Defaults to the order's currency.</td>
    </tr>
    <tr>
      <td><code>offline</code></td>
      <td><code>boolean</code> (optional)</td>
      <td>Records the transaction as <code>offline</code> instead of <code>online</code> (Cash On Delivery).</td>
    </tr>
    <tr>
      <td><code>raw</code></td>
      <td><code>unknown</code> (optional)</td>
      <td>The provider's response. Stored as JSON on the transaction for audit.</td>
    </tr>
  </tbody>
</table>

**`conn`** (optional) — a database connection. Pass one to run inside a transaction you already hold, such as a webhook. `recordRefund` then neither commits nor rolls back: that is up to the caller. Without it, `recordRefund` opens and commits its own transaction.

## Return Value

Returns `Promise<RecordRefundResult>`:

- `status` — the new payment status: `<payment_method>_refunded` or `<payment_method>_partial_refunded`.
- `isFullRefund` — `true` when the refunds recorded so far, including this one, reach the captured amount, compared in the currency's smallest unit.
- `alreadyRecorded` — `true` when a transaction with this `transactionId` already exists. In that case nothing is written or emitted, `status` is the order's current payment status and `isFullRefund` is `false`.

## Behavior

1. Reads the order's payment transactions.
2. If one already has this `transactionId`, returns with `alreadyRecorded: true`.
3. Finds the captured transaction (the newest one that is not a refund) and adds this amount to the refunds already recorded.
4. Saves the refund as a `payment_transaction` with `payment_action: 'refund'` and the capture as its `parent_transaction_id`.
5. Sets the payment status and re-derives the order status.
6. Adds the activity `Refunded <amount> <currency>. Refund ID: <id>`.
7. Emits `order_refunded` on the same connection, so subscribers see it only after the transaction commits.

## Errors

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Message</th>
      <th>Cause</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>Order &lt;uuid&gt; has no payment method to refund</code></td>
      <td><code>order.payment_method</code> is empty.</td>
    </tr>
    <tr>
      <td><code>Cannot find the captured transaction to refund for order &lt;uuid&gt;</code></td>
      <td>The order has no non-refund <code>payment_transaction</code> row.</td>
    </tr>
    <tr>
      <td><code>Invalid status</code></td>
      <td>The method did not register <code>&lt;method&gt;_refunded</code> or <code>&lt;method&gt;_partial_refunded</code>.</td>
    </tr>
  </tbody>
</table>

## Notes

- `recordRefund` trusts its input. It does not check the `isRefundable` flag or that the amount fits what remains captured: a refund the provider already made has to be recorded.
- Two simultaneous calls with the same `transactionId` are protected only by the database's unique constraint on the order and transaction id. In a webhook, lock the order row first (`SELECT ... FOR UPDATE`), as the Stripe module does.
- It is not wrapped in `hookable`.
- The event payload is `{ orderId, amount, currency, isFullRefund, transactionId, paymentMethod }`. It also triggers the refund email to the customer, which can be switched off with `system.notification_emails.order_refunded.enabled`.

## Examples

Record a refund that was made from the Stripe dashboard, inside the webhook's transaction:

```typescript
import { recordRefund } from "@evershop/evershop/oms/services";

await recordRefund(
  {
    order,
    transactionId: refund.id,
    amount: parseFloat(display(refund.amount, charge.currency)),
    raw: charge
  },
  connection
);
```

## See Also

- [refundOrder](/docs/development/module/functions/refundOrder) — Refund through the payment method's handler
- [addPaymentTransaction](/docs/development/module/functions/addPaymentTransaction) — Record any other payment transaction
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — React to `order_refunded`
