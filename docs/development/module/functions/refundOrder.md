---
sidebar_position: 139
keywords:
  - refundOrder
  - payment
  - refund
  - OMS
groups:
  - oms
sidebar_label: refundOrder
title: refundOrder
description: Refund a captured payment, in full or in part, through the order's payment method's refund handler.
---

# refundOrder

Refund the captured payment of an order, in full or in part. `refundOrder` is the service behind the **Refund** button on the order page and the `POST /api/orders/:id/refunds` endpoint. It works for every payment method that registered a `refund` handler.

Core validates the request, calls the handler (the one step that talks to the payment provider), then hands the result to [recordRefund](/docs/development/module/functions/recordRefund), which saves the refund, sets the payment status and emits `order_refunded`.

## Import

```typescript
import { refundOrder } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
refundOrder(uuid: string, amount: number): Promise<RefundOrderResult>

interface RefundOrderResult {
  status: string;
  isFullRefund: boolean;
}
```

### Parameters

**`uuid`**

**Type:** `string`

The order **uuid** (`order.uuid`), not the numeric `order_id`.

**`amount`**

**Type:** `number`

The amount to refund, in the order currency's **major units** (`49.99`, not `4999`). It must be greater than zero and no more than what is still refundable: the captured amount minus the refunds already recorded. Amounts are compared in the currency's smallest unit, so rounding noise cannot slip a cent through.

## Return Value

Returns `Promise<RefundOrderResult>`:

- `status` — the new payment status: `<payment_method>_refunded` when the refunds reach the captured amount, otherwise `<payment_method>_partial_refunded`.
- `isFullRefund` — `true` when the refunds recorded so far, including this one, reach the captured amount.

## Behavior

1. Loads the order by uuid.
2. Looks up the payment method's registered `refund` handler.
3. Checks that the order's payment status is flagged `isRefundable`.
4. Finds the captured payment: the newest payment transaction that is not a refund.
5. Checks the amount against what remains refundable.
6. Calls the handler with `{ order, transaction, amount, currency }`, where `transaction` is the capture. This call runs outside any database transaction.
7. Calls `recordRefund` with what the handler returned. Core uses the handler's `amount`, not the requested one.

## Errors

`refundOrder` throws a plain `Error`. The REST endpoint returns the message in an HTTP `500` response.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Message</th>
      <th>Cause</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>Order &lt;uuid&gt; not found</code></td>
      <td>No order has this uuid.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; has no payment method</code></td>
      <td>The order has no payment method recorded.</td>
    </tr>
    <tr>
      <td><code>Payment method "&lt;code&gt;" does not support refunds</code></td>
      <td>The method has no <code>refund</code> handler, or it is not registered.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; is not refundable in its current status (&lt;status&gt;)</code></td>
      <td>The payment status is not flagged <code>isRefundable</code>.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; has no captured payment to refund</code></td>
      <td>The order has no non-refund <code>payment_transaction</code> row.</td>
    </tr>
    <tr>
      <td><code>Refund amount must be greater than 0 and at most the remaining captured amount</code></td>
      <td>The amount is zero, negative, not a number, or more than what is left.</td>
    </tr>
    <tr>
      <td>The handler's error</td>
      <td>Passed through unchanged, for example <code>PayPal refund failed (status ...)</code>.</td>
    </tr>
    <tr>
      <td>Errors from <code>recordRefund</code></td>
      <td>See <a href="/docs/development/module/functions/recordRefund">recordRefund</a>, for example <code>Invalid status</code> when the method did not register its refund statuses.</td>
    </tr>
  </tbody>
</table>

## Notes

- **Not idempotent per call.** Each valid call makes a new refund at the provider. Only the provider's own webhook echo is deduplicated, because it carries the same refund id.
- Emits `order_refunded` through `recordRefund`. `refundOrder` itself is not wrapped in `hookable`.
- If the provider's webhook reaches `recordRefund` first, the refund is already recorded when `refundOrder` gets there. `recordRefund` then reports `alreadyRecorded`, and `refundOrder` returns the order's current payment status with `isFullRefund: false`.
- The `supportsPartialRefund` flag on a payment method is not checked.

## Examples

```typescript
import { refundOrder } from "@evershop/evershop/oms/services";

const { status, isFullRefund } = await refundOrder(order.uuid, 25.5);
// status: 'stripe_partial_refunded', isFullRefund: false
```

An offline method has no provider to call. Cash On Delivery's handler only reports the amount:

```typescript
refund: async ({ order, amount }) => ({
  transactionId: `cod-refund-${order.uuid}-${Date.now()}`,
  amount,
  offline: true
})
```

## See Also

- [recordRefund](/docs/development/module/functions/recordRefund) — Record a refund without calling a provider
- [captureOrder](/docs/development/module/functions/captureOrder) — Capture an authorized payment
- [Order API: Refund An Order](/docs/api/order#refund-an-order) — The REST endpoint
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — Writing a `refund` handler
