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
description: Reference for the Stripe, PayPal and Cash On Delivery REST endpoints in EverShop — payment intents, captures, refunds, PayPal order creation and the Stripe webhook.
---

import Api from '@site/src/components/rest/Api';

# Payment Gateway API

## Overview

Three payment modules ship in core, and each one exposes its own REST surface rather than sharing a generic payment endpoint. These are gateway plumbing, not a public payments API: the storefront calls some of them during checkout, the admin order screen calls the rest, and Stripe calls one of them from the outside.

Nine endpoints exist across the three modules:

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
      <td><code>POST /api/stripe/paymentIntents/capture</code></td>
      <td>private</td>
      <td>Admin order screen</td>
    </tr>
    <tr>
      <td><code>POST /api/stripe/paymentIntents/refund</code></td>
      <td>private</td>
      <td>Admin order screen</td>
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
      <td><code>POST /api/paypal/captureTransactions</code></td>
      <td>public</td>
      <td>Storefront PayPal return page</td>
    </tr>
    <tr>
      <td><code>POST /api/paypal/authorizedTransactions</code></td>
      <td>public</td>
      <td>Storefront PayPal return page</td>
    </tr>
    <tr>
      <td><code>POST /api/paypal/authorizations/capture</code></td>
      <td>public</td>
      <td>Admin order screen</td>
    </tr>
    <tr>
      <td><code>POST /api/cod/captures</code></td>
      <td>private</td>
      <td>Admin order screen</td>
    </tr>
  </tbody>
</table>

:::warning `POST /api/paypal/authorizations/capture` is declared public
It is the "Capture" button on the admin order screen, but its `route.json` says `access: "public"`, so the admin auth middleware never runs on it. Anyone who knows an order uuid can trigger the capture of an authorized PayPal payment. Compare with the COD equivalent (`/api/cod/captures`), which is correctly `private`. Put a network-level rule in front of it if that matters to you.
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
      <td>Stripe capture behaviour</td>
      <td>—</td>
      <td><code>stripePaymentMode</code> (<code>capture</code> or <code>authorize</code>)</td>
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
      <td>PayPal intent</td>
      <td>—</td>
      <td><code>paypalPaymentIntent</code> (<code>CAPTURE</code> or <code>AUTHORIZE</code>, default <code>CAPTURE</code>)</td>
    </tr>
  </tbody>
</table>

## Stripe Endpoints

### Create A Payment Intent

Creates a Stripe PaymentIntent for a cart and returns its client secret so the browser can mount Stripe Elements. This is the only gateway endpoint the storefront calls before the customer pays.

The amount comes from `cart.grand_total`, converted to the currency's smallest unit. The cart is resolved by uuid; a cart that does not exist answers `400` with `Invalid cart`. The `order_id` is **not** validated here — it is written into the PaymentIntent's `metadata`, and the webhook reads it back later to find the order.

`capture_method` follows the `stripePaymentMode` setting: `capture` produces `automatic_async`, anything else produces `manual` (authorize now, capture later through the endpoint below).

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

Both ids are **uuids**: `cart_id` is `cart.uuid` and `order_id` is `order.uuid`.

<hr />

### Capture A Payment Intent

Captures a PaymentIntent that was created in `manual` mode and is sitting in `requires_capture`. Used by the admin "Capture" button after an authorize-only checkout.

<Api
method="POST"
url="/api/stripe/paymentIntents/capture"
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
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "order_id": "Order is invalid"
    }
  }
}}
responseSample={`{
  "data": {
    "amount": 12995
  }
}`}
/>

`order_id` is the order **uuid**. The returned `amount` is Stripe's amount, in the smallest currency unit — `12995` means `129.95` for a two-decimal currency.

The request is rejected with `400` when the order does not exist or its `payment_method` is not `stripe` (`Invalid order`), when no `payment_transaction` row exists for it (`Can not find payment transaction`), or when the PaymentIntent is not in `requires_capture` (`Payment intent is not in the correct state (requires_capture)`). On success the order's payment status moves to `stripe_captured`.

<hr />

### Refund A Payment Intent

Issues a full or partial refund against the order's PaymentIntent, then reconciles the order's payment status from the resulting Stripe charge: fully refunded becomes `stripe_refunded`, anything less becomes `stripe_partial_refunded`. An order activity log entry (`Refunded <amount> <currency>`) is written in the same transaction.

<Api
method="POST"
url="/api/stripe/paymentIntents/refund"
requestSchema={{
  "type": "object",
  "properties": {
    "order_id": {
      "type": "string"
    },
    "amount": {
      "type": ["string", "number"],
      "pattern": "^\\d+(\\.\\d{1,2})?$",
      "errorMessage": {
        "pattern": "Amount should be a number with maximum 2 decimal places"
      }
    }
  },
  "required": [
    "order_id"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "order_id": "Order is invalid"
    }
  }
}}
responseSample={`{
  "data": {
    "amount": 5000
  }
}`}
/>

:::caution `order_id` here is the numeric id, not the uuid
Every other endpoint on this page resolves the order by `uuid`. This one queries `WHERE order_id = :order_id` — the integer primary key. Sending a uuid answers `400` with `Invalid order`. The admin refund form supplies the value from the GraphQL `Order.orderId` field, which is that integer.
:::

`amount` is declared optional by the payload schema, but the handler passes it straight to the currency converter with no default, so a request without it will not produce a usable refund. Always send it, in major units (`50` or `49.99`), and read the returned `amount` back as smallest units.

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

The success response is `{"received": true}` — a bare object, not the usual `{"data": ...}` envelope. Any failure, including a signature mismatch, answers `400` with a **plain-text** body of the form `Webhook Error: <message>` and rolls back the transaction, so Stripe retries.

The order is located from `paymentIntent.metadata.order_id`, which was written when the intent was created. Three event types are handled; everything else is logged at debug level and acknowledged.

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
      <td><code>payment_intent.canceled</code></td>
      <td>Sets payment status <code>canceled</code>.</td>
    </tr>
  </tbody>
</table>

The `order_placed` emit is guarded by the absence of an existing `payment_transaction` row, so a redelivered event will not fire the event twice.

<hr />

## PayPal Endpoints

All four PayPal endpoints take a single `order_id`, which is the order **uuid**, and all four return an empty or near-empty envelope — the meaningful state change is on the order row, not in the response.

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

The `intent` sent to PayPal comes from the `paypalPaymentIntent` setting (`CAPTURE` by default). Line item prices and the amount breakdown switch between tax-inclusive and tax-exclusive columns according to the store's catalog price setting. If PayPal returns no order id, the handler re-activates the cart so the customer is not stranded, and answers `500` with PayPal's message.

Two registry keys let an extension rewrite the payload before it is sent — register a processor for either from `bootstrap.ts`: `paypalFinalAmount` (the amount breakdown) and `finalPaypalOrderData` (the whole request body).

<hr />

### Capture A PayPal Order

Called by the storefront's PayPal return page when the store's intent is `CAPTURE`. Posts to PayPal's `/v2/checkout/orders/{integration_order_id}/capture`, inserts the resulting `payment_transaction` row and moves the order's payment status to `paypal_captured`.

<Api
method="POST"
url="/api/paypal/captureTransactions"
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
  "data": {}
}`}
isPrivate={false}
/>

This handler looks the order up by uuid alone — unlike the other three PayPal endpoints it does not additionally require `payment_method = 'paypal'` or a pending payment status.

<hr />

### Authorize A PayPal Order

Called by the storefront's PayPal return page when the store's intent is `AUTHORIZE`. Posts to PayPal's `/v2/checkout/orders/{integration_order_id}/authorize`, records the authorization as a `payment_transaction` with `payment_action: "authorize"`, and moves the payment status to `paypal_authorized`.

The order must be `payment_method = 'paypal'` and `payment_status = 'pending'`.

<Api
method="POST"
url="/api/paypal/authorizedTransactions"
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
  "data": {}
}`}
isPrivate={false}
/>

<hr />

### Capture An Authorized PayPal Payment

The second half of the authorize flow, driven from the admin order screen. It reads the stored authorization from PayPal first: if PayPal already reports it as `CAPTURED`, EverShop simply syncs its own status rather than double-capturing; otherwise it posts to `/v2/payments/authorizations/{transaction_id}/capture`. Either way the payment status ends at `paypal_captured` and an activity log entry is written.

<Api
method="POST"
url="/api/paypal/authorizations/capture"
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
  "data": {}
}`}
isPrivate={false}
/>

Errors from PayPal are passed through with PayPal's own HTTP status and message rather than being flattened to `500`. A missing `payment_transaction` row answers `400` with `Can not find payment transaction`.

<hr />

## Cash On Delivery

### Capture A COD Payment

Marks a cash-on-delivery order as paid. This is the admin "Capture" button on the order screen and it is the one gateway endpoint on this page that is correctly gated as `private`.

The order must exist with `payment_method = 'cod'` **and** `payment_status = 'pending'`; otherwise `400` with `Requested order does not exist or is not in pending payment status`.

<Api
method="POST"
url="/api/cod/captures"
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
  "data": {}
}`}
/>

On success it does three things: sets the order's payment status to `paid`, inserts a `payment_transaction` row with `transaction_type: "offline"` and `payment_action: "capture"` for the full `grand_total`, and appends the order activity `Customer paid using cash.`

<hr />

## Adding Your Own Gateway

None of these endpoints are extension points. A new gateway registers itself at bootstrap with `registerPaymentMethod` and ships its own `api/` folder in the same shape as the modules above. See the [payment method development guide](/docs/development/knowledge-base/payment-method-development) and the [Payment Method API](/docs/api/payment-method) for how a method becomes selectable on a cart.
