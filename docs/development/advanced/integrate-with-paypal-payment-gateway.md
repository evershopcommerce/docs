---
sidebar_position: 6
keywords:
  - EverShop PayPal payment gateway integration
  - PayPal checkout
  - payment processing
  - e-commerce payments
sidebar_label: PayPal Payment Integration
title: Integrating PayPal Payment Gateway
description: How to set up EverShop's built-in PayPal module — credentials, webhook, capture modes, refunds and the abandoned-order reconciliation — and how the redirect flow and the capture, void and refund handlers are wired together.
---

# Integrating PayPal Payment Gateway

EverShop ships PayPal as a core module. Where Stripe embeds a card form into the checkout page, PayPal is a **redirect gateway**: the buyer leaves the store, approves the payment at PayPal, and is redirected back. This guide covers setting the module up — including the webhook, which you should not skip — and walks through how the flow is wired so you can extend it.

Every path below is relative to `packages/evershop/src/modules/paypal/` in the EverShop repository, unless it says it belongs to the `oms` (order management) module.

## How a PayPal checkout flows

1. The buyer selects PayPal and clicks **Pay with PayPal**. EverShop creates the order first, with `payment_status: pending` — order first, pay second.
2. The storefront calls `POST /api/paypal/orders`, which creates a matching order at PayPal (storing its id on the EverShop order) and returns an approval URL. The browser redirects there.
3. The buyer approves the payment at PayPal and is redirected back to `/paypal/processing/:order_id`.
4. The return page validates the PayPal token against the stored order, then **captures or authorizes in-process** — no HTTP round-trips — updates the payment status, records the transaction, emits `order_placed` and redirects to the order confirmation.
5. If the buyer cancels at PayPal instead, they land on `/paypal/cancelling/:order_id`. That page **cancels the pending order** (returning its stock), re-activates the cart and sends them back to checkout. If the cancellation itself fails, the reconciliation cron below picks the order up later.

The return page only acts on an order that matches the PayPal token in the URL. A refresh after the payment has settled (`paypal_captured`, `paypal_authorized` or `paypal_pending`) goes straight to the order confirmation. If finalization fails, the page renders an error and the order stays `pending`, so the webhook or the cron can still resolve it.

Two safety nets sit behind the redirect, because the return leg depends on the buyer's browser and is not guaranteed:

- **The webhook** (`POST /api/paypal/webhook`): if the buyer approves and then closes the tab, PayPal's `CHECKOUT.ORDER.APPROVED` event triggers the same server-side finalization the return page would have run. It also confirms pending (eCheck) captures, reports denials, and mirrors refunds made elsewhere.
- **The reconciliation cron**: every 30 minutes, PayPal orders still `pending` past a TTL (6 hours by default) are checked against PayPal — approved ones are finalized, abandoned ones are canceled and restocked. See [Abandoned-order reconciliation](#abandoned-order-reconciliation).

All three paths — return page, webhook, cron — share one idempotent finalization service. Each PayPal transaction id is recorded once and fires `order_placed` at most once, and the PayPal requests carry a request id, so duplicate deliveries and the race between the return page and the webhook cannot capture the same payment twice.

## Setting it up

### 1. Get REST API credentials

Create (or open) a REST API app in the [PayPal developer dashboard](https://developer.paypal.com/dashboard/) and copy its **Client ID** and **Secret**. Sandbox and live are separate apps with separate credentials.

### 2. Configure the admin settings

Go to **Settings → Payment Setting → Paypal Payment**:

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
      <td>Sandbox or Live. Switching takes effect on the next request — access tokens are cached per environment and client ID.</td>
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

#### What the webhook answers

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Response</th>
      <th className="text-left">When</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>200</code></td>
      <td>The event was verified and handled, or it is one the store ignores (an unknown event type or an unknown order).</td>
    </tr>
    <tr>
      <td><code>400</code></td>
      <td>The signature verification failed.</td>
    </tr>
    <tr>
      <td><code>503</code></td>
      <td>No webhook ID is configured.</td>
    </tr>
    <tr>
      <td><code>500</code></td>
      <td>A transport or internal error. PayPal retries the delivery.</td>
    </tr>
  </tbody>
</table>

Events can arrive out of order, so each one only acts from a state where it makes sense. `CHECKOUT.ORDER.APPROVED` acts only on an order that is still `pending`. `PAYMENT.CAPTURE.COMPLETED` is ignored for refunded, partially refunded and canceled orders. `PAYMENT.CAPTURE.PENDING` never downgrades a settled or canceled order. `PAYMENT.CAPTURE.DENIED` acts only from `pending` or `paypal_pending`, and sets `paypal_failed` without canceling the order. `PAYMENT.CAPTURE.REFUNDED` goes through the same core refund recording as an admin refund.

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

`environment` is the API base URL: `https://api-m.paypal.com` for live, `https://api-m.sandbox.paypal.com` for the sandbox. A `status` of `0` is falsy, so it falls back to the **Enable** admin setting rather than forcing PayPal off. The display name and the payment mode can only be set in the admin.

The reconciliation keys behave as follows: `reconcileEnabled` disables the job only when it is exactly `false`; an invalid `reconcileSchedule` logs a warning and skips the job instead of stopping the store from booting; `abandonedOrderTtlHours` falls back to 6 if it is not a number.

## Payment statuses

The module registers six PayPal-specific payment statuses at bootstrap:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Status</th>
      <th className="text-left">Meaning</th>
      <th className="text-left">Cancelable?</th>
      <th className="text-left">Admin actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>paypal_authorized</code></td>
      <td>A hold is placed (Authorize only mode); waiting for admin capture.</td>
      <td>Yes — canceling voids the authorization at PayPal.</td>
      <td>Capture, void (by canceling)</td>
    </tr>
    <tr>
      <td><code>paypal_captured</code></td>
      <td>Money captured and settled.</td>
      <td>No — refund it first.</td>
      <td>Refund</td>
    </tr>
    <tr>
      <td><code>paypal_pending</code></td>
      <td>Capture initiated but not settled (eCheck, manual review). Do not fulfill yet; the webhook flips it to captured or failed.</td>
      <td>No — money is in flight.</td>
      <td>None</td>
    </tr>
    <tr>
      <td><code>paypal_failed</code></td>
      <td>PayPal denied or failed the capture. Flagged for admin review — never auto-canceled.</td>
      <td>Yes.</td>
      <td>None</td>
    </tr>
    <tr>
      <td><code>paypal_refunded</code></td>
      <td>Fully refunded.</td>
      <td>No.</td>
      <td>None</td>
    </tr>
    <tr>
      <td><code>paypal_partial_refunded</code></td>
      <td>Refunded for less than the captured amount.</td>
      <td>No.</td>
      <td>Refund (the rest)</td>
    </tr>
  </tbody>
</table>

These actions come from three flags on each status: `paypal_authorized` is `isCapturable` and `isVoidable`, and `paypal_captured` and `paypal_partial_refunded` are `isRefundable`. The admin **Capture** and **Refund** buttons appear only when the flag is set *and* the method registered the matching handler. See [Capture, void and refund](#capture-void-and-refund).

Each status also maps to the order's overall status. `paypal_authorized`, `paypal_captured`, `paypal_pending` and `paypal_partial_refunded` map to `processing`, `paypal_failed` maps to `new` and `paypal_refunded` maps to `closed`. Note that `paypal_pending` still shows the order as `processing`, so check the **payment** status before you ship.

`order_placed` — the event that sends the confirmation email and feeds every other subscriber — fires when the PayPal flow completes successfully, including a `PENDING` (eCheck) capture. It never fires on a declined or failed payment.

## Capture modes

With **Capture** (the default), the return page settles the money immediately.

With **Authorize only**, the return page places a hold (`paypal_authorized`) and an admin captures it later with the **Capture Payment** button on the order screen. The button calls core's `POST /api/orders/:id/capture` (private), and appears only for an `isCapturable` status. Note that PayPal authorizations are honored for 3 days and expire after 29; capture them promptly.

The mode is read from the PayPal order itself at finalization time, so changing the setting mid-flight cannot mismatch an in-progress checkout.

## Refunds

Captured PayPal orders are refunded from the order screen with the **Refund** button. The button calls core's `POST /api/orders/:id/refunds` (private) with a body such as `{ "amount": 10.5 }`. Full and partial refunds are supported. Core checks the requested amount against what is still refundable, asks PayPal to refund through the module's `refund` handler, records the refund, and moves the payment status to `paypal_refunded` or `paypal_partial_refunded` based on the cumulative total. It emits `order_refunded` once. Refunds made directly in the PayPal dashboard flow back through the `PAYMENT.CAPTURE.REFUNDED` webhook and are recorded the same way; because refunds are recorded by the PayPal refund id, an admin refund and its webhook echo produce one transaction, not two.

To cancel a captured order, refund it first — `paypal_captured` deliberately refuses cancellation so the money and the order state cannot diverge.

Canceling an `paypal_authorized` order releases the hold: core calls the module's `void` handler inside the cancellation, and if PayPal refuses, the cancellation rolls back and the order keeps its status. A canceled order triggers `order_canceled`, which sends the customer a cancellation email (switchable with `system.notification_emails.order_canceled.enabled`). That includes orders the cron cancels as abandoned.

## Abandoned-order reconciliation

The `paypalReconcileAbandonedOrders` cron job runs on the schedule from `system.paypal.reconcileSchedule` (default every 30 minutes) and sweeps PayPal orders still `pending` past `system.paypal.abandonedOrderTtlHours` (default 6):

- Approved or completed at PayPal → **finalized** exactly as the return page would have done it (the missed-webhook / lost-return fallback — the money is never thrown away). What that means depends on the PayPal order's intent: a capture becomes `paypal_captured`, or `paypal_pending` if PayPal reports it as pending; an authorization becomes `paypal_authorized`; a payment PayPal declined becomes `paypal_failed`.
- Never started, never approved, or the PayPal order no longer exists → **canceled and restocked**.

Per-order failures are logged and retried on the next run, including a PayPal lookup that fails for any reason other than "not found". The TTL is counted from the order's creation time. Set `system.paypal.reconcileEnabled` to `false` to disable the job.

## Capture, void and refund

Core owns these three operations: the admin routes (`POST /api/orders/:id/capture` and `POST /api/orders/:id/refunds`), the order-screen buttons, the validation, the transaction record and the status change. The PayPal module supplies only the one step that talks to PayPal, as a `capture`, `void` and `refund` handler on `registerPaymentMethod`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Handler</th>
      <th className="text-left">What the PayPal module does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>capture</code></td>
      <td>Captures the authorization at PayPal. PayPal issues a <strong>new</strong> capture id; core saves it as a transaction whose parent is the authorization, so later refunds target the capture. The capture must come back <code>COMPLETED</code>, or the handler throws.</td>
    </tr>
    <tr>
      <td><code>void</code></td>
      <td>Voids the authorization at PayPal. Core calls it when a voidable order is canceled.</td>
    </tr>
    <tr>
      <td><code>refund</code></td>
      <td>Refunds the capture for the requested amount, with the order number as the invoice id. A refund PayPal reports as <code>COMPLETED</code> or <code>PENDING</code> is accepted; anything else throws.</td>
    </tr>
  </tbody>
</table>

Core builds the status codes from the method code, so a gateway named `paypal` must register `paypal_captured`, `paypal_refunded` and `paypal_partial_refunded`. Zero-decimal currencies (HUF, JPY and TWD) are sent to PayPal as whole numbers. The registration contract is described in [Payment Method Development](/docs/development/knowledge-base/payment-method-development).

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
      <td>Declares the method, its payment statuses, the <code>capture</code>, <code>void</code> and <code>refund</code> handlers and the reconciliation cron</td>
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
      <td><code>oms</code> module: <code>api/captureOrder/</code>, <code>api/createOrderRefund/</code>, <code>services/captureOrder.ts</code>, <code>refundOrder.ts</code>, <code>recordRefund.ts</code></td>
      <td>Core routes and services that capture a hold and refund a capture; the PayPal module only provides the handlers in <code>bootstrap.ts</code> and <code>services/voidPaymentTransaction.js</code></td>
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
import type { CreateOrderRequestBody } from '@paypal/paypal-js';
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default async () => {
  // Rewrite the whole create-order request body
  addProcessor<CreateOrderRequestBody>('finalPaypalOrderData', (orderData) => {
    const experienceContext = orderData.payment_source?.paypal?.experience_context;
    if (experienceContext) {
      experienceContext.locale = 'de-DE';
    }
    return orderData;
  });

  // Or only the amount breakdown
  addProcessor('paypalFinalAmount', (amount) => {
    return amount;
  });
};
```

Both processors receive context as `this` (the order, its items, and — for `finalPaypalOrderData` — the shipping address); use the `function` keyword rather than an arrow function if you need it. If you change the amounts, keep the breakdown summing exactly to `amount.value`, or PayPal rejects the order. The module computes amounts in minor units and, when the breakdown cannot sum exactly, drops the breakdown and the line items and sends a bare amount. A `paypalFinalAmount` processor can therefore receive an amount with no `breakdown`, so check for it before reading `amount.breakdown`.

## Upgrading from 2.2.x

- **Capture and refund moved to core.** `POST /api/paypal/authorizations/capture`, `POST /api/paypal/authorizedTransactions` and `POST /api/paypal/captureTransactions` are removed. Capture goes through `POST /api/orders/:id/capture` and refunds through `POST /api/orders/:id/refunds`.
- **The webhook is new.** Create it as described above and save its ID. Until then the endpoint answers `503`, and the reconciliation cron is the only fallback.
- **`paypalWebhookSecret` is gone**, together with the `system.paypal.webhookSecret` configuration key. Verification uses the webhook ID.
- **The return page was renamed** from `/paypal/proccessing` to `/paypal/processing`, with no alias for the old spelling.

## See also

- [Payment Gateway REST API](/docs/api/payment-gateway) — the endpoint reference for everything above.
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — the registration contract for building your own gateway.
- [captureOrder](/docs/development/module/functions/captureOrder), [refundOrder](/docs/development/module/functions/refundOrder) and [recordRefund](/docs/development/module/functions/recordRefund) — the core services behind capture and refund.
- [Integrating Stripe Payment Gateway](/docs/development/advanced/integrate-with-stripe-payment-gateway) — the embedded-form counterpart to this redirect flow.
