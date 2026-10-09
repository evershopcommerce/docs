---
sidebar_position: 28
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Payment Gateway
  - Stripe
  - PayPal
  - Cash On Delivery
  - Webhook
  - REST API
sidebar_label: Payment Gateways
title: Payment Gateway REST API
description: Reference for the Stripe and PayPal REST endpoints in EverShop — payment intents, PayPal order creation and the Stripe and PayPal webhooks — plus how Cash On Delivery fits the unified capture and refund flow.
---

import Api from '@site/src/components/rest/Api';

# Payment Gateway API

## Overview

Two payment modules expose REST endpoints for the parts that talk to their gateway: creating the payment during checkout, and receiving the gateway's webhook. These are gateway plumbing, not a public payments API.

Capturing and refunding no longer have gateway-specific routes. Since 2.3, one pair of admin endpoints serves every payment method, including Cash On Delivery: [`POST /api/orders/:id/capture`](/docs/api/order#capture-an-order) and [`POST /api/orders/:id/refunds`](/docs/api/order#refund-an-order).

Four gateway endpoints exist:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Endpoint</th>
      <th className="text-left">Access</th>
      <th className="text-left">Called by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>POST /api/stripe/paymentIntents</code></td>
      <td>public</td>
      <td>Storefront checkout</td>
    </tr>
    <tr>
      <td><code>POST /api/stripe/webhook</code></td>
      <td>public</td>
      <td>Stripe</td>
    </tr>
    <tr>
      <td><code>POST /api/paypal/orders</code></td>
      <td>public</td>
      <td>Storefront checkout</td>
    </tr>
    <tr>
      <td><code>POST /api/paypal/webhook</code></td>
      <td>public</td>
      <td>PayPal</td>
    </tr>
  </tbody>
</table>

:::info Removed in 2.3.0
These routes no longer exist:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Removed route</th>
      <th className="text-left">Use instead</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>POST /api/stripe/paymentIntents/capture</code>, <code>POST /api/paypal/authorizations/capture</code>, <code>POST /api/cod/captures</code></td>
      <td><code>POST /api/orders/:id/capture</code></td>
    </tr>
    <tr>
      <td><code>POST /api/stripe/paymentIntents/refund</code></td>
      <td><code>POST /api/orders/:id/refunds</code></td>
    </tr>
    <tr>
      <td><code>POST /api/paypal/authorizedTransactions</code>, <code>POST /api/paypal/captureTransactions</code></td>
      <td>Nothing. The PayPal return page (<code>/paypal/processing/:order_id</code>) finalizes the payment in-process.</td>
    </tr>
  </tbody>
</table>

The old routes took an `order_id` in the request body (the Stripe refund route wanted the numeric id). The new routes take the order **uuid** in the URL path. The PayPal return page was also renamed from `/paypal/proccessing` to `/paypal/processing`.
:::

## Credential Resolution

Every gateway handler resolves its keys the same way: a `config.json` value wins, and the admin **Settings → Payment** value is the fallback. Nothing is read from environment variables directly.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Purpose</th>
      <th className="text-left">Config key (wins)</th>
      <th className="text-left">Setting key (fallback)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Stripe secret key</td>
      <td><code>system.stripe.secretKey</code></td>
      <td><code>stripeSecretKey</code></td>
    </tr>
    <tr>
      <td>Stripe webhook signing secret</td>
      <td><code>system.stripe.endpointSecret</code></td>
      <td><code>stripeEndpointSecret</code></td>
    </tr>
    <tr>
      <td>Stripe capture behavior</td>
      <td>—</td>
      <td><code>stripePaymentMode</code> (<code>capture</code> or <code>authorizeOnly</code>)</td>
    </tr>
    <tr>
      <td>PayPal client id</td>
      <td><code>system.paypal.clientId</code></td>
      <td><code>paypalClientId</code></td>
    </tr>
    <tr>
      <td>PayPal client secret</td>
      <td><code>system.paypal.clientSecret</code></td>
      <td><code>paypalClientSecret</code></td>
    </tr>
    <tr>
      <td>PayPal environment (API base URL)</td>
      <td><code>system.paypal.environment</code></td>
      <td><code>paypalEnvironment</code> (default <code>https://api-m.sandbox.paypal.com</code>)</td>
    </tr>
    <tr>
      <td>PayPal webhook id</td>
      <td><code>system.paypal.webhookId</code></td>
      <td><code>paypalWebhookId</code></td>
    </tr>
    <tr>
      <td>PayPal intent</td>
      <td>—</td>
      <td><code>paypalPaymentIntent</code> (<code>CAPTURE</code> or <code>AUTHORIZE</code>, default <code>CAPTURE</code>)</td>
    </tr>
    <tr>
      <td>PayPal abandoned-order TTL in hours</td>
      <td><code>system.paypal.abandonedOrderTtlHours</code> (default <code>6</code>)</td>
      <td>—</td>
    </tr>
    <tr>
      <td>PayPal reconciliation schedule</td>
      <td><code>system.paypal.reconcileSchedule</code> (default <code>*/30 * * * *</code>)</td>
      <td>—</td>
    </tr>
    <tr>
      <td>PayPal reconciliation switch</td>
      <td><code>system.paypal.reconcileEnabled</code> (<code>false</code> disables the job)</td>
      <td>—</td>
    </tr>
  </tbody>
</table>

## Stripe Endpoints

### Create A Payment Intent

Creates a Stripe PaymentIntent for an order and returns its client secret so the browser can mount Stripe Elements. This is the only gateway endpoint the storefront calls before the customer pays, and it is called after the order has been placed.

The amount and currency come from the **order**, not from the request: `order.grand_total` converted to the currency's smallest unit, in `order.currency`. The order is resolved by uuid and must have `payment_method = 'stripe'` and `payment_status = 'pending'`; anything else answers `400` with `Invalid order`. An order that is already paid, already failed, or placed with another method therefore cannot get a new PaymentIntent.

`cart_id` is still required by the payload schema, but the server ignores it. The PaymentIntent's `metadata` carries only `order_id` (the order uuid), which the webhook and the return page read back to find the order.

`capture_method` follows the `stripePaymentMode` setting: `capture` produces `automatic_async`, anything else produces `manual` (authorize now, capture later with [`POST /api/orders/:id/capture`](/docs/api/order#capture-an-order)).

<Api
method="POST"
url="/api/stripe/paymentIntents"
requestSchema={{
  "type": "object",
  "properties": {
    "cart_id": {
      "type": "string"
    },
    "order_id": {
      "type": "string"
    }
  },
  "required": [
    "cart_id",
    "order_id"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "cart_id": "Cart is invalid",
      "order_id": "Order is invalid"
    }
  }
}}
responseSample={`{
  "data": {
    "clientSecret": "pi_3QhK8xJv2Lm4Np0R1sT5uVwX_secret_YzA9bCdEfGhIjKlMnOpQrStU"
  }
}`}
isPrivate={false}
/>

Both ids are **uuids**: `order_id` is `order.uuid` and `cart_id` is `cart.uuid` (ignored).

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Status</th>
      <th className="text-left">Body</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>200</code></td>
      <td><code>{'{ "data": { "clientSecret": "..." } }'}</code></td>
    </tr>
    <tr>
      <td><code>400</code></td>
      <td><code>{'{ "error": { "status": 400, "message": "Invalid order" } }'}</code>, or the schema message when a required field is missing</td>
    </tr>
    <tr>
      <td><code>500</code></td>
      <td><code>{'{ "error": { "status": 500, "message": "Can not create the payment intent" } }'}</code> for any other failure, such as a Stripe API error</td>
    </tr>
  </tbody>
</table>

<hr />

### Stripe Webhook

The endpoint Stripe calls. Set it to `https://<your domain>/api/stripe/webhook` in the Stripe dashboard, and paste the resulting signing secret into **Settings → Payment → Stripe → Endpoint secret** (or `system.stripe.endpointSecret` in `config.json`).

<Api
method="POST"
url="/api/stripe/webhook"
responseSample={`{
  "received": true
}`}
isPrivate={false}
/>

:::info Signature verification is mandatory and there is no way to disable it
The route parses the request with `bodyParser.raw({ type: '*/*' })` — the untouched bytes are required for `stripe.webhooks.constructEvent(...)`, which verifies the `stripe-signature` header against the endpoint secret. If the secret is blank or wrong, **every** delivery fails. Do not put a JSON body parser in front of this route; a re-serialized body will never match the signature.
:::

The success response is `{"received": true}` — a bare object, not the usual `{"data": ...}` envelope. An exception, including a signature mismatch, answers `400` with a **plain-text** body of the form `Webhook Error: <message>` and rolls back the transaction, so Stripe retries.

Five event types are handled. For `payment_intent.*` events the order is located from `paymentIntent.metadata.order_id`, which was written when the intent was created. For `charge.refunded` the charge carries no such metadata, so the order is found through the saved `payment_transaction` whose `transaction_id` equals the charge's `payment_intent`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Event</th>
      <th className="text-left">Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>payment_intent.succeeded</code></td>
      <td>Upserts the <code>payment_transaction</code> row. If this is the first transaction for the order, sets payment status <code>stripe_captured</code>, adds an activity log entry and emits <code>order_placed</code>.</td>
    </tr>
    <tr>
      <td><code>payment_intent.amount_capturable_updated</code></td>
      <td>Upserts the <code>payment_transaction</code> row. If this is the first transaction for the order, sets payment status <code>stripe_authorized</code>, adds an activity log entry and emits <code>order_placed</code>.</td>
    </tr>
    <tr>
      <td><code>payment_intent.payment_failed</code></td>
      <td>If the order is still <code>pending</code>, sets payment status <code>stripe_failed</code> and logs Stripe's error message. A late failure never overrides a captured or authorized order.</td>
    </tr>
    <tr>
      <td><code>payment_intent.canceled</code></td>
      <td>Sets payment status <code>canceled</code>, unless the order is already canceled.</td>
    </tr>
    <tr>
      <td><code>charge.refunded</code></td>
      <td>Records the refund through core's refund recorder, keyed on the Stripe refund id: a refund transaction, payment status <code>stripe_refunded</code> or <code>stripe_partial_refunded</code>, and the <code>order_refunded</code> event. A refund issued from EverShop and its webhook echo end as one transaction.</td>
    </tr>
  </tbody>
</table>

Enable all five events on the webhook endpoint in the Stripe dashboard (or choose "All events").

Every other event type, an event whose order cannot be found, and an event for an order that is not a Stripe order is logged and acknowledged with `200 {"received": true}`, so Stripe does not retry something the store will never act on.

Before `payment_intent.succeeded` or `payment_intent.amount_capturable_updated` can mark an order paid, the handler checks that the PaymentIntent's amount and currency equal the order's grand total and currency. On a mismatch nothing is written, an error is logged, the order stays `pending` for manual review, and the response is still `200` because retrying cannot fix it.

The handler runs in one database transaction and locks the order row (`SELECT ... FOR UPDATE`). "First transaction" is decided under that lock, so a redelivered or overlapping event cannot fire `order_placed` twice.

<hr />

## PayPal Endpoints

The buyer-facing capture/authorize step has no REST endpoint: the storefront's PayPal return page (`/paypal/processing/:order_id`) finalizes the payment in-process through the `finalizePaypalOrder` service. What remains on the REST surface is order creation (storefront) and the webhook. Admin capture and refund use the unified [order endpoints](/docs/api/order#capture-an-order). `order_id` below is the order **uuid**.


### Create A PayPal Order

Builds the PayPal order payload from the EverShop order (line items, shipping, discount, tax breakdown, shipping address) and posts it to PayPal's `/v2/checkout/orders`. The returned PayPal order id is stored on `order.integration_order_id`, and the approval URL is handed back for the browser to redirect to.

The EverShop order must exist with `payment_method = 'paypal'` **and** `payment_status = 'pending'`; anything else answers `400` with `Invalid order`.

<Api
method="POST"
url="/api/paypal/orders"
requestSchema={{
  "type": "object",
  "properties": {
    "order_id": {
      "type": "string"
    }
  },
  "required": [
    "order_id"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "paypalOrderId": "5O190127TN364715T",
    "approveUrl": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T"
  }
}`}
isPrivate={false}
/>

The payload uses the current Orders v2 shape: buyer experience settings (return/cancel URLs, `PAY_NOW`, brand name) ride in `payment_source.paypal.experience_context`, the EverShop order number is sent as `purchase_units[0].invoice_id` (so captures show up reconciled in the PayPal dashboard and duplicate captures are rejected by PayPal itself), and the order uuid is sent as the `PayPal-Request-Id` idempotency key — a retried create returns the same PayPal order instead of minting a new one.

The `intent` comes from the `paypalPaymentIntent` setting (`CAPTURE` by default). Line item prices switch between tax-inclusive and tax-exclusive columns according to the store's catalog price setting, and the amount breakdown is computed in integer minor units and verified to sum exactly to the grand total — when per-unit rounding makes that impossible, the itemized breakdown is dropped and a bare amount is sent (PayPal accepts it; a mismatched breakdown would be a `422`). Zero-decimal currencies (JPY, HUF, TWD) are sent as integers.

If PayPal returns no order id or no approval link, the handler re-activates the cart so the customer is not stranded, and answers `500` with PayPal's message, or `PayPal did not return an approval link for this order`.

Two registry keys let an extension rewrite the payload before it is sent — register a processor for either from `bootstrap.ts`: `paypalFinalAmount` (the amount breakdown) and `finalPaypalOrderData` (the whole request body).


<hr />

### PayPal Webhook

The endpoint PayPal calls. Create a webhook in the [PayPal developer dashboard](https://developer.paypal.com/) pointing at `https://<your domain>/api/paypal/webhook`, subscribe it to the five events below, and paste the webhook's **ID** (not a secret — PayPal webhooks are verified by id) into **Settings → Payment → Paypal → Webhook ID** (or `system.paypal.webhookId` in `config.json`).

<Api
method="POST"
url="/api/paypal/webhook"
responseSample={`{
  "data": {}
}`}
isPrivate={false}
/>

Every delivery is verified through PayPal's `verify-webhook-signature` API using the configured webhook id; a failed verification answers `400`. While no webhook id is configured the endpoint answers `503` and logs a warning — the webhook feature is inert until you wire it. Transient processing failures answer `500`, which makes PayPal retry the delivery.

The local order is resolved from the PayPal order id (`integration_order_id`), then the `invoice_id` (the order number), then the capture id saved in `payment_transaction`; events for unknown orders are acknowledged and ignored.

Events can arrive out of order, so each one only acts from a state where it makes sense.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Event</th>
      <th className="text-left">Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>CHECKOUT.ORDER.APPROVED</code></td>
      <td>If the order is still <code>pending</code> (the buyer approved at PayPal but never completed the return redirect), captures or authorizes it server-side — the same finalization the return page runs. A payment PayPal declined sets <code>paypal_failed</code>.</td>
    </tr>
    <tr>
      <td><code>PAYMENT.CAPTURE.COMPLETED</code></td>
      <td>Upserts the <code>payment_transaction</code> row and sets payment status <code>paypal_captured</code>. Ignored for refunded, partially refunded and canceled orders. Emits <code>order_placed</code> only if this is the first record of the capture.</td>
    </tr>
    <tr>
      <td><code>PAYMENT.CAPTURE.PENDING</code></td>
      <td>Records the capture and sets payment status <code>paypal_pending</code> (eCheck, manual review — money in flight, not yet settled). Never downgrades a settled or canceled order.</td>
    </tr>
    <tr>
      <td><code>PAYMENT.CAPTURE.DENIED</code></td>
      <td>Only when the order is <code>pending</code> or <code>paypal_pending</code>: sets payment status <code>paypal_failed</code> and logs the denial for admin review. Deliberately does <strong>not</strong> auto-cancel the order.</td>
    </tr>
    <tr>
      <td><code>PAYMENT.CAPTURE.REFUNDED</code></td>
      <td>Records the refund through core's refund recorder, keyed on the PayPal refund id, and sets <code>paypal_refunded</code> / <code>paypal_partial_refunded</code> from the cumulative refunded total. Emits <code>order_refunded</code>. A replay of a refund already recorded through <code>POST /api/orders/:id/refunds</code> is a no-op.</td>
    </tr>
  </tbody>
</table>

All handlers share the same idempotency guard as the storefront return page (the `payment_transaction` row keyed on transaction id), so duplicate deliveries and out-of-order deliveries cannot double-record a payment. The `order_placed` guard is per PayPal transaction id.

<hr />

## Cash On Delivery

Cash On Delivery has no REST endpoints of its own. Since 2.3 it follows the same capture and refund contract as the other methods, with no money moving through a gateway:

- A COD order is created with payment status `cod_pending`, and an offline `authorize` transaction (`cod-authorize-<uuid>`) is recorded for it.
- When the cash is collected, the admin calls [`POST /api/orders/:id/capture`](/docs/api/order#capture-an-order). It records an offline `capture` transaction for the full grand total, sets `cod_captured` (labeled "Paid") and adds the activity `Captured <amount> <currency>. Transaction ID: cod-capture-<uuid>-<timestamp>`.
- Refunds use [`POST /api/orders/:id/refunds`](/docs/api/order#refund-an-order) and are recorded offline, ending in `cod_refunded` or `cod_partial_refunded`.

Existing COD orders that were awaiting payment are moved from `pending` to `cod_pending` by a migration when you upgrade.

<hr />

## Adding Your Own Gateway

None of these endpoints are extension points. A new gateway registers itself at bootstrap with `registerPaymentMethod` and ships its own `api/` folder for the payment-creation and webhook routes, in the same shape as the modules above. It does **not** ship capture or refund routes: it declares optional `capture`, `void` and `refund` handlers, and core's order endpoints call them. See the [payment method development guide](/docs/development/knowledge-base/payment-method-development) and the [Payment Method API](/docs/api/payment-method) for how a method becomes selectable on a cart.
