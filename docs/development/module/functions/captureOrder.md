---
sidebar_position: 138
keywords:
  - captureOrder
  - payment
  - capture
  - OMS
groups:
  - oms
sidebar_label: captureOrder
title: captureOrder
description: Capture the authorized payment of an order through its payment method's capture handler.
---

# captureOrder

Capture the authorized payment of an order. `captureOrder` is the service behind the **Capture** button on the order page and the `POST /api/orders/:id/capture` endpoint. It works for every payment method that registered a `capture` handler.

Core does the whole job: it validates the order, calls the handler (the one step that talks to the payment provider), saves the capture as a payment transaction, moves the payment status and writes the activity log.

## Import

```typescript
import { captureOrder } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
captureOrder(uuid: string): Promise<CaptureOrderResult>

interface CaptureOrderResult {
  status: string;
}
```

### Parameters

**`uuid`**

**Type:** `string`

The order **uuid** (`order.uuid`), not the numeric `order_id`. There is no amount parameter: the full authorized amount is always captured.

## Return Value

Returns `Promise<CaptureOrderResult>`. `status` is the new payment status, always `<payment_method>_captured` (for example `stripe_captured`).

## Behavior

1. Loads the order by uuid.
2. Looks up the payment method's registered `capture` handler.
3. Checks that the order's payment status is flagged `isCapturable`.
4. Finds the authorization: the newest payment transaction that is not a capture or a refund.
5. Calls the handler with `{ order, transaction }`, where `transaction` is the authorization. This call runs outside any database transaction.
6. In one short database transaction: saves the capture as a `payment_transaction` with `payment_action: 'capture'`, sets the payment status to `<payment_method>_captured` (which also re-derives the order status), and adds the activity `Captured <amount> <currency>. Transaction ID: <id>`.

If the provider reuses the authorization id (Stripe), the existing row is updated in place. If it returns a new id (PayPal), a new row is inserted whose `parent_transaction_id` is the authorization, so later refunds target the capture. An offline method (Cash On Delivery) saves a row with `transaction_type: 'offline'`.

## Errors

`captureOrder` throws a plain `Error`. The REST endpoint returns the message in an HTTP `500` response.

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
      <td><code>Payment method "&lt;code&gt;" does not support capture</code></td>
      <td>The method has no <code>capture</code> handler, or it is not registered.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; is not capturable in its current status (&lt;status&gt;)</code></td>
      <td>The payment status is not flagged <code>isCapturable</code>. This is also what a second capture returns.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; has no authorization to capture</code></td>
      <td>The order has no <code>payment_transaction</code> row.</td>
    </tr>
    <tr>
      <td>The handler's error</td>
      <td>Passed through unchanged, for example Stripe's <code>Payment intent is not in a capturable state (requires_capture)</code>.</td>
    </tr>
    <tr>
      <td><code>Invalid status</code></td>
      <td>The method did not register its <code>&lt;method&gt;_captured</code> payment status. The provider has already captured the money when this happens, so register the status before you ship.</td>
    </tr>
  </tbody>
</table>

## Notes

- `captureOrder` is not wrapped in `hookable` and emits no event of its own. `order_status_updated` fires if the capture changes the order status. To react to a capture, hook `changePaymentStatus`.
- The order row is not locked. A concurrent second call is rejected once the status is no longer capturable, and the payment providers reject a concurrent duplicate themselves.
- The capture handler is registered with [registerPaymentMethod](/docs/development/module/functions/registerPaymentMethod). It receives `{ order, transaction }` and returns `{ transactionId, amount, currency?, offline?, raw? }`.

## Examples

```typescript
import { captureOrder } from "@evershop/evershop/oms/services";

const { status } = await captureOrder(order.uuid);
// 'stripe_captured'
```

The Stripe module's handler retrieves the PaymentIntent, checks that it is in `requires_capture`, captures it and reports the amount:

```typescript
capture: async ({ order, transaction }) => {
  const stripe = new Stripe(secretKey);
  const captured = await stripe.paymentIntents.capture(transaction.transaction_id);
  return {
    transactionId: captured.id,
    amount: parseFloat(display(captured.amount_received ?? captured.amount, order.currency)),
    raw: captured
  };
}
```

## See Also

- [refundOrder](/docs/development/module/functions/refundOrder) — Refund a captured payment
- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) — Change the payment status
- [Order API: Capture An Order](/docs/api/order#capture-an-order) — The REST endpoint
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — Writing a `capture` handler
