---
sidebar_position: 6
keywords:
  - EverShop PayPal payment gateway integration
  - PayPal checkout
  - payment processing
  - e-commerce payments
sidebar_label: PayPal Payment Integration
title: Integrating PayPal Payment Gateway
description: How to set up EverShop's built-in PayPal module — credentials, webhook, capture modes, refunds and the abandoned-order reconciliation — and how the redirect flow is wired together.
---

# Integrating PayPal Payment Gateway

EverShop ships PayPal as a core module. Where Stripe embeds a card form into the checkout page, PayPal is a **redirect gateway**: the buyer leaves the store, approves the payment at PayPal, and is redirected back. This guide covers setting the module up — including the webhook, which you should not skip — and walks through how the flow is wired so you can extend it.

Every path below is relative to `packages/evershop/src/modules/paypal/` in the EverShop repository.

## How a PayPal checkout flows

1. The buyer selects PayPal and clicks **Pay with PayPal**. EverShop creates the order first, with `payment_status: pending` — order first, pay second.
2. The storefront calls `POST /api/paypal/orders`, which creates a matching order at PayPal (storing its id on the EverShop order) and returns an approval URL. The browser redirects there.
3. The buyer approves the payment at PayPal and is redirected back to `/paypal/processing/:order_id`.
4. The return page validates the PayPal token against the stored order, then **captures or authorizes in-process** — no HTTP round-trips — updates the payment status, records the transaction, emits `order_placed` and redirects to the order confirmation.
5. If the buyer cancels at PayPal instead, the cancel page **cancels the pending order** (returning its stock) and re-activates the cart so they can check out again.

Two safety nets sit behind the redirect, because the return leg depends on the buyer's browser and is not guaranteed:

- **The webhook** (`POST /api/paypal/webhook`): if the buyer approves and then closes the tab, PayPal's `CHECKOUT.ORDER.APPROVED` event triggers the same server-side finalization the return page would have run. It also confirms pending (eCheck) captures, reports denials, and mirrors refunds made elsewhere.
- **The reconciliation cron**: every 30 minutes, PayPal orders still `pending` past a TTL (6 hours by default) are checked against PayPal — approved ones are captured, abandoned ones are canceled and restocked.

All three paths — return page, webhook, cron — share one idempotent finalization service, so races and duplicate deliveries cannot double-capture or fire `order_placed` twice.

## Setting it up

### 1. Get REST API credentials

Create (or open) a REST API app in the [PayPal developer dashboard](https://developer.paypal.com/dashboard/) and copy its **Client ID** and **Secret**. Sandbox and live are separate apps with separate credentials.

### 2. Configure the admin settings

Go to **Settings → Payment → Paypal Payment**:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Field</th>
      <th className="text-left">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Enable</td>
      <td>Makes PayPal selectable at checkout.</td>
    </tr>
    <tr>
      <td>Display name</td>
      <td>The label shown on the checkout page.</td>
    </tr>
    <tr>
      <td>Client ID / Client Secret</td>
      <td>The REST app credentials from step 1.</td>
    </tr>
    <tr>
      <td>Webhook ID</td>
      <td>The id of the webhook you create in step 3.</td>
    </tr>
    <tr>
      <td>Environment</td>
      <td>Sandbox or Live. Switching takes effect on the next request — access tokens are cached per environment.</td>
    </tr>
    <tr>
      <td>Payment mode</td>
      <td><strong>Capture</strong> takes the money as soon as the buyer approves. <strong>Authorize only</strong> places a hold; an admin captures later from the order screen.</td>
    </tr>
  </tbody>
</table>

### 3. Create the webhook

In the PayPal developer dashboard, open your REST app and add a webhook pointing at:

```
https://<your domain>/api/paypal/webhook
```

Subscribe it to these five events:

- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.PENDING`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

Copy the webhook's **ID** and paste it into the **Webhook ID** field from step 2. Every delivery is verified against PayPal's verify-webhook-signature API using this id; until it is configured, the endpoint answers `503` and the webhook feature is inert.

:::caution Do not skip the webhook
Without it, payment completion depends entirely on the buyer's browser finishing the return redirect. A buyer who approves the payment and closes the tab leaves a pending order whose money is never captured (the reconciliation cron will eventually catch it, hours later). With the webhook, that order is captured within seconds.
:::

### 4. Or configure through `config.json`

Every credential can also live in configuration, which **wins over the admin settings**. The last three keys tune the reconciliation cron and are config-only:

```json
{
  "system": {
    "paypal": {
      "status": 1,
      "clientId": "AeA1QIZXiflr...",
      "clientSecret": "EC-5O123456789...",
      "environment": "https://api-m.paypal.com",
      "webhookId": "8PT597110X687430LK",
      "abandonedOrderTtlHours": 6,
      "reconcileSchedule": "*/30 * * * *",
      "reconcileEnabled": true
    }
  }
}
```

## Payment statuses

The module registers six PayPal-specific payment statuses at bootstrap:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Status</th>
      <th className="text-left">Meaning</th>
      <th className="text-left">Cancelable?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>paypal_authorized</code></td>
      <td>A hold is placed (Authorize only mode); waiting for admin capture.</td>
      <td>Yes — canceling voids the authorization at PayPal.</td>
    </tr>
    <tr>
      <td><code>paypal_captured</code></td>
      <td>Money captured and settled.</td>
      <td>No — refund it first.</td>
    </tr>
    <tr>
      <td><code>paypal_pending</code></td>
      <td>Capture initiated but not settled (eCheck, manual review). Do not fulfill yet; the webhook flips it to captured or failed.</td>
      <td>No — money is in flight.</td>
    </tr>
    <tr>
      <td><code>paypal_failed</code></td>
      <td>PayPal denied or failed the capture. Flagged for admin review — never auto-canceled.</td>
      <td>Yes.</td>
    </tr>
    <tr>
      <td><code>paypal_refunded</code></td>
      <td>Fully refunded.</td>
      <td>No.</td>
    </tr>
    <tr>
      <td><code>paypal_partial_refunded</code></td>
      <td>Refunded for less than the captured amount.</td>
      <td>No.</td>
    </tr>
  </tbody>
</table>

`order_placed` — the event that sends the confirmation email and feeds every other subscriber — fires when the PayPal flow completes successfully, including a `PENDING` (eCheck) capture. It never fires on a declined or failed payment.

## Capture modes

With **Capture** (the default), the return page settles the money immediately.

With **Authorize only**, the return page places a hold (`paypal_authorized`) and an admin captures it later with the **Capture Payment** button on the order screen (`POST /api/paypal/authorizations/capture`, private). Note that PayPal authorizations are honored for 3 days and expire after 29; capture them promptly.

The mode is read from the PayPal order itself at finalization time, so changing the setting mid-flight cannot mismatch an in-progress checkout.

## Refunds

Captured PayPal orders are refunded from the order screen with the **Refund** button (`POST /api/paypal/refunds`, private). Full and partial refunds are supported; the requested amount is validated against the remaining captured amount, and the payment status moves to `paypal_refunded` or `paypal_partial_refunded` based on the cumulative total. Refunds made directly in the PayPal dashboard flow back through the `PAYMENT.CAPTURE.REFUNDED` webhook and are recorded the same way.

To cancel a captured order, refund it first — `paypal_captured` deliberately refuses cancellation so the money and the order state cannot diverge.

## Abandoned-order reconciliation

The `paypalReconcileAbandonedOrders` cron job runs on the schedule from `system.paypal.reconcileSchedule` (default every 30 minutes) and sweeps PayPal orders still `pending` past `system.paypal.abandonedOrderTtlHours` (default 6):

- Approved or completed at PayPal → **captured** (the missed-webhook / lost-return fallback — the money is never thrown away).
- Never approved, or the PayPal order no longer exists → **canceled and restocked**.

Per-order failures are logged and retried on the next run. Set `system.paypal.reconcileEnabled` to `false` to disable the job.

## The pieces

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Piece</th>
      <th className="text-left">File</th>
      <th className="text-left">Job</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Registration</td>
      <td><code>bootstrap.ts</code></td>
      <td>Declares the method, its payment statuses, the void-on-cancel hook and the reconciliation cron</td>
    </tr>
    <tr>
      <td>Checkout component</td>
      <td><code>pages/frontStore/checkout/Paypal.tsx</code></td>
      <td>Registers the name/form/button renderers; after the order is placed, calls the create-order API and redirects to PayPal</td>
    </tr>
    <tr>
      <td>Order creation API</td>
      <td><code>api/paypalCreateOrder/</code></td>
      <td>Builds the Orders v2 payload and returns the approval URL</td>
    </tr>
    <tr>
      <td>Finalization service</td>
      <td><code>services/finalizePaypalOrder.ts</code></td>
      <td>Captures/authorizes in-process; the single idempotent path shared by return page, webhook and cron</td>
    </tr>
    <tr>
      <td>Return / cancel pages</td>
      <td><code>pages/frontStore/paypalReturn/</code>, <code>paypalCancel/</code></td>
      <td>Finalize on success; cancel, restock and re-activate the cart on cancel</td>
    </tr>
    <tr>
      <td>Webhook</td>
      <td><code>api/paypalWebhook/</code></td>
      <td>Verified server-side confirmation for approvals, pending captures, denials and refunds</td>
    </tr>
    <tr>
      <td>Admin actions</td>
      <td><code>api/paypalCaptureAuthorizedPayment/</code>, <code>api/paypalRefundPayment/</code></td>
      <td>Capture a hold; refund a capture</td>
    </tr>
    <tr>
      <td>Reconciliation cron</td>
      <td><code>services/reconcileAbandonedOrders.ts</code></td>
      <td>Resolves abandoned pending orders — capture or cancel+restock</td>
    </tr>
    <tr>
      <td>Admin settings</td>
      <td><code>pages/admin/paymentSetting/PaypalSetting.tsx</code></td>
      <td>Credentials, environment, webhook id, payment mode</td>
    </tr>
  </tbody>
</table>

## Customizing the outgoing payload

Two registry keys let an extension rewrite what is sent to PayPal, without touching the module. Register a processor from your extension's `bootstrap.ts`:

```ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default async () => {
  // Rewrite the whole create-order request body
  addProcessor('finalPaypalOrderData', (orderData) => {
    orderData.payment_source.paypal.experience_context.locale = 'de-DE';
    return orderData;
  });

  // Or only the amount breakdown
  addProcessor('paypalFinalAmount', (amount) => {
    return amount;
  });
};
```

Both processors receive context as `this` (the order, its items, and — for `finalPaypalOrderData` — the shipping address); use the `function` keyword rather than an arrow function if you need it. If you change the amounts, keep the breakdown summing exactly to `amount.value`, or PayPal rejects the order.

## See also

- [Payment Gateway REST API](/docs/api/payment-gateway) — the endpoint reference for everything above.
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — the registration contract for building your own gateway.
- [Integrating Stripe Payment Gateway](/docs/development/advanced/intergrate-with-stripe-payment-gateway) — the embedded-form counterpart to this redirect flow.
