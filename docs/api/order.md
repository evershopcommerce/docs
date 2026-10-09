---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop api
sidebar_label: Order
title: Order REST API
description: Use the REST API to create, cancel, capture and refund EverShop orders, and to manage their shipments.
---

# Order API

Use the REST API to interact with EverShop orders.

An order can carry **many shipments**. Each shipment covers specific order items at specific quantities, and `order.shipment_status` is a rollup computed from all of them — it is not a status you set directly.

## Endpoints

### Create An Order

Use this endpoint to create an order from a shopping cart.

import Api from '@site/src/components/rest/Api';

<Api
method="POST"
url="/api/orders"
requestSchema={{
  "type": "object",
  "properties": {
    "cart_id": {
      "type": "string"
    }
  },
  "required": [
    "cart_id"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "cart_id": "Cart id is required"
    }
  }
}}
responseSample={`{
  "data": {
    "order_id": 274,
    "uuid": "fd0b4f0fd6704ed0b53fa0c64ae7df3c",
    "integration_order_id": null,
    "order_number": "10274",
    "cart_id": 990,
    "currency": "USD",
    "customer_id": 20,
    "customer_email": "customer@example.com",
    "customer_full_name": "The Nguyen",
    "user_ip": null,
    "sid": "09d34c21-4af3-4db8-a38b-335ebf6d45fa",
    "user_agent": null,
    "coupon": null,
    "shipping_fee_excl_tax": 0,
    "shipping_fee_incl_tax": 0,
    "discount_amount": 0,
    "sub_total": 12345,
    "total_qty": 15,
    "total_weight": 81,
    "tax_amount": 0,
    "shipping_note": null,
    "grand_total": 12345,
    "shipping_method_data": {
      "provider_code": "core",
      "method_code": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
      "snapshot": {
        "code": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
        "name": "Free Shipping",
        "cost": 0
      }
    },
    "shipping_address_id": 551,
    "payment_method": "paypal",
    "payment_method_name": "Paypal",
    "billing_address_id": 552,
    "shipment_status": "pending",
    "payment_status": "pending",
    "created_at": "2023-02-07 14:18:04",
    "updated_at": "2023-02-07 14:18:04",
    "items": [
      {
        "order_item_id": 306,
        "uuid": "dc651b93008d475e9de6d85983586a2e",
        "order_item_order_id": 274,
        "product_id": 3,
        "referer": null,
        "product_sku": "NJC90842-Black-X",
        "product_name": "Lite racer adapt 3.0 shoes",
        "thumbnail": "/assets/catalog/8953/8037/plv3663-Black-thumb.png",
        "product_weight": 5.4,
        "product_price": 823,
        "product_price_incl_tax": 823,
        "qty": 15,
        "final_price": 823,
        "final_price_incl_tax": 823,
        "tax_percent": 0,
        "tax_amount": 0,
        "discount_amount": 0,
        "total": 12345,
        "variant_group_id": 62,
        "variant_options": "[{\"attribute_code\":\"size\",\"attribute_name\":\"Size\",\"attribute_id\":2,\"option_id\":4,\"option_text\":\"X\"},{\"attribute_code\":\"color\",\"attribute_name\":\"Color\",\"attribute_id\":3,\"option_id\":14,\"option_text\":\"Black\"}]",
        "product_custom_options": null,
        "requested_data": null
      }
    ],
    "shipping_address": {
      "order_address_id": 551,
      "uuid": "e0fbebaca66c11edb46b60d819134f39",
      "recipient": "The Nguyen",
      "given_name": null,
      "family_name": null,
      "organization": null,
      "address_line_1": "12 Nguyen Hue",
      "address_line_2": null,
      "address_line_3": null,
      "dependent_locality": "26737",
      "locality": null,
      "administrative_area": "VN-SG",
      "postal_code": null,
      "sorting_code": null,
      "country": "VN",
      "telephone": "+84912345678",
      "extra": {}
    },
    "billing_address": {
      "order_address_id": 552,
      "uuid": "e0fd1671a66c11edb46b60d819134f39",
      "recipient": "The Nguyen",
      "given_name": null,
      "family_name": null,
      "organization": null,
      "address_line_1": "12 Nguyen Hue",
      "address_line_2": null,
      "address_line_3": null,
      "dependent_locality": "26737",
      "locality": null,
      "administrative_area": "VN-SG",
      "postal_code": null,
      "sorting_code": null,
      "country": "VN",
      "telephone": "+84912345678",
      "extra": {}
    },
    "links": [
      {
        "rel": "edit",
        "href": "/admin/order/edit/fd0b4f0fd6704ed0b53fa0c64ae7df3c",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
isPrivate={false}
/>

:::info Shipping columns changed
`order.shipping_method` and `order.shipping_method_name` were dropped. The selection now lives in the `shipping_method_data` JSONB column, which holds `provider_code`, `method_code` and a `snapshot` of the method as quoted at checkout time.
:::

:::info `billing_address` can be null
The billing address is optional on zero-total orders (nothing is charged, taxed or invoiced). `billing_address_id` is `null` and `billing_address` resolves to `null`. Every other order still requires one.
:::

<hr />

## Shipments

An order can have many shipments in EverShop 2.2 and later. Each carries its own
items, status and tracking, and `order.shipment_status` is a **derived rollup** over
them — see [Shipment Status](#shipment-status) below.

The shipment endpoints have their own reference:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>What you want to do</th>
      <th>Where</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Create a shipment, list an order's shipments, update, cancel, mark delivered, void a label</td>
      <td><a href="./shipment">Shipment API</a></td>
    </tr>
    <tr>
      <td>Understand the rollup, phases and status transitions</td>
      <td><a href="../development/knowledge-base/multi-shipment-and-fulfillment">Multi-shipment And Fulfillment</a></td>
    </tr>
    <tr>
      <td>Register a carrier so labels and tracking work</td>
      <td><a href="../development/knowledge-base/carrier-development">Carrier Development</a></td>
    </tr>
  </tbody>
</table>

<hr/>

## Order-level Actions

### Cancel An Order

Use this endpoint to cancel an order. `:id` is the order **uuid**.

The cancellation runs in one database transaction, in this order: it validates the order, voids an uncaptured authorization at the payment provider, sets the payment status to `canceled`, cancels the shipments that are not final, writes an activity log entry, returns the stock and emits `order_canceled`. If any step fails, including the provider refusing the void, the whole cancellation is rolled back and the order keeps its status.

An order can be canceled only when its payment status is cancelable and its shipments allow it. A `captured` or refunded order is not cancelable; refund it first. Canceling does not refund money that was already captured.

<Api
method="POST"
url="/api/orders/:id/cancel"
requestSchema={{
  "type": "object",
  "properties": {
    "reason": {
      "type": "string"
    }
  },
  "required": ["reason"],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "reason": "Reason is mandatory"
    }
  }
}}
responseSample={`{
"data": {}
}`}
/>

A failed cancellation answers HTTP `500` with `{ "error": { "status": 500, "message": "..." } }`. The messages include `Order not found`, `Order is not cancelable at this status`, and any error raised by the payment method while voiding the authorization. A missing `reason` is rejected with `400`.

<hr />

### Capture An Order

Captures the money for an order whose payment is authorized. This is what the admin **Capture** button calls. It works for any payment method that registers a `capture` handler: Stripe, PayPal and Cash On Delivery in core, and any gateway added by an extension.

`:id` is the order **uuid**. The request has no body, and the capture is always for the full authorized amount.

<Api
method="POST"
url="/api/orders/:id/capture"
responseSample={`{
  "data": {
    "paymentStatus": "stripe_captured"
  }
}`}
/>

`paymentStatus` is the new payment status, always `<payment_method>_captured`.

**When it is allowed.** The order's payment method must have a `capture` handler, and its current payment status must be flagged `isCapturable`. In core, those statuses are `stripe_authorized` (the store is in authorize-only mode), `paypal_authorized` (the PayPal intent is `AUTHORIZE`) and `cod_pending` (the cash has not been collected). The admin GraphQL field `Order.canCapture` reports whether both conditions hold.

**What it records.** A `payment_transaction` row with `payment_action: "capture"`, the new payment status, and the activity `Captured <amount> <currency>. Transaction ID: <id>`. Stripe keeps the PaymentIntent id, so its authorization row is updated in place. PayPal issues a new capture id, which is inserted as a new row whose `parent_transaction_id` is the authorization. Cash On Delivery records an offline row. No event is emitted for a capture, and `order_placed` is not emitted again.

**Errors.** Every failure answers HTTP `500` with `{ "error": { "status": 500, "message": "..." } }`, including mistakes the client made. A missing or invalid admin session answers `401`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Message</th>
      <th className="text-left">Cause</th>
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
      <td>The method has no <code>capture</code> handler, or it is no longer registered (for example <code>zero_checkout</code>).</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; is not capturable in its current status (&lt;status&gt;)</code></td>
      <td>The payment status is not flagged <code>isCapturable</code>. This is also what a second capture of the same order returns.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; has no authorization to capture</code></td>
      <td>The order has no <code>payment_transaction</code> row to capture against.</td>
    </tr>
    <tr>
      <td>The gateway's message</td>
      <td>Passed through, for example <code>Payment intent is not in a capturable state (requires_capture)</code> from Stripe, or <code>PayPal capture failed (status ...)</code> from PayPal.</td>
    </tr>
    <tr>
      <td><code>Invalid status</code></td>
      <td>The method did not register its <code>&lt;method&gt;_captured</code> payment status.</td>
    </tr>
  </tbody>
</table>

The gateway is called outside the database transaction, and the order row is not locked. A second capture is rejected because the status is no longer capturable, and Stripe and PayPal reject a concurrent duplicate themselves.

<hr />

### Refund An Order

Refunds money that was captured, in full or in part. This is what the admin **Refund** button calls. It works for any payment method that registers a `refund` handler: Stripe, PayPal and Cash On Delivery in core.

`:id` is the order **uuid**. `amount` is in the order currency's major units (`49.99`), as a number or a string with at most two decimal places.

<Api
method="POST"
url="/api/orders/:id/refunds"
requestSchema={{
  "type": "object",
  "properties": {
    "amount": {
      "type": ["string", "number"],
      "pattern": "^\\d+(\\.\\d{1,2})?$",
      "errorMessage": {
        "pattern": "Amount should be a number with maximum 2 decimal places"
      }
    }
  },
  "required": ["amount"],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "amount": "Refund amount is invalid"
    }
  }
}}
responseSample={`{
  "data": {
    "paymentStatus": "stripe_partial_refunded",
    "isFullRefund": false
  }
}`}
/>

`isFullRefund` is `true` when the refunds recorded so far, including this one, reach the captured amount. The payment status is then `<payment_method>_refunded`, and the order status moves to `closed`. Otherwise it is `<payment_method>_partial_refunded`, which can be refunded again.

**When it is allowed.** The order's payment method must have a `refund` handler, and its payment status must be flagged `isRefundable`: `stripe_captured`, `stripe_partial_refunded`, `paypal_captured`, `paypal_partial_refunded`, `cod_captured` and `cod_partial_refunded` in core. A fully refunded order, and `paypal_pending`, are not refundable. The amount must be greater than zero and no more than what is still refundable: the captured amount minus the refunds already recorded. The admin GraphQL field `Order.canRefund` reports whether the method and the status allow a refund.

**What it records.** A `payment_transaction` row with `payment_action: "refund"` whose `parent_transaction_id` is the capture, the new payment status, the activity `Refunded <amount> <currency>. Refund ID: <id>`, and the `order_refunded` event. Cash On Delivery refunds are recorded offline: nothing moves, but the books balance.

**Errors.** Request validation failures answer `400` with the first schema message (a missing `amount` reads `must have required property 'amount'`). Every other failure answers HTTP `500` with `{ "error": { "status": 500, "message": "..." } }`. A missing or invalid admin session answers `401`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Message</th>
      <th className="text-left">Cause</th>
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
      <td>The method has no <code>refund</code> handler.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; is not refundable in its current status (&lt;status&gt;)</code></td>
      <td>The payment status is not flagged <code>isRefundable</code>.</td>
    </tr>
    <tr>
      <td><code>Order &lt;uuid&gt; has no captured payment to refund</code></td>
      <td>The order has no <code>payment_transaction</code> row that was captured.</td>
    </tr>
    <tr>
      <td><code>Refund amount must be greater than 0 and at most the remaining captured amount</code></td>
      <td>The amount is zero, negative, not a number, or more than what is left.</td>
    </tr>
    <tr>
      <td>The gateway's message</td>
      <td>Passed through, for example <code>PayPal refund failed (status ...)</code>, or an error from the Stripe API.</td>
    </tr>
    <tr>
      <td><code>Invalid status</code></td>
      <td>The method did not register its <code>&lt;method&gt;_refunded</code> or <code>&lt;method&gt;_partial_refunded</code> payment status.</td>
    </tr>
  </tbody>
</table>

:::caution This endpoint is not idempotent
Each valid request creates a new refund at the gateway, so a client that retries after a timeout can refund twice. The amount check reads the recorded refunds first and does not lock the order. What is deduplicated is the gateway's own webhook echo (`charge.refunded` for Stripe, `PAYMENT.CAPTURE.REFUNDED` for PayPal): it carries the same refund id, so it is recorded once.
:::

<hr />

### Mark Every Shipment Delivered

Legacy back-compat wrapper. It sweeps every shipment on the order that is not already `delivered` or `canceled` and advances it, then returns how many it actually moved. Prefer the per-shipment endpoint above for new integrations.

<Api
method="POST"
url="/api/deliveries"
requestSchema={{
  "type": "object",
  "properties": {
    "order_id": {
      "type": "string",
      "description": "The numeric order_id (not the uuid)"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "order_id": 274,
    "updated_count": 2
  }
}`}
/>

Errors: `400 Invalid order id`, `400 No shipments to mark delivered`.

<hr />

## Shipment Status

`order.shipment_status` is an order-level **rollup** derived from the per-item shipment math. You never write it directly; it is recomputed after every shipment status change and after order cancellation.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Value</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>pending</td>
      <td>No items shipped yet. This is the value a brand-new order gets</td>
    </tr>
    <tr>
      <td>partially_shipped</td>
      <td>Some, but not all, shippable items have shipped</td>
    </tr>
    <tr>
      <td>shipped</td>
      <td>Every shippable item has shipped</td>
    </tr>
    <tr>
      <td>partially_delivered</td>
      <td>Some items delivered, others still in transit</td>
    </tr>
    <tr>
      <td>delivered</td>
      <td>Every shippable item delivered. An all-digital order short-circuits to this at creation</td>
    </tr>
    <tr>
      <td>partially_canceled</td>
      <td>Some items are in canceled shipments and nothing else has shipped</td>
    </tr>
    <tr>
      <td>canceled</td>
      <td>The whole order is canceled, or every shippable item sits in a canceled shipment</td>
    </tr>
  </tbody>
</table>

:::warning `unfullfilled` is dead
The legacy `"unfullfilled"` value no longer exists anywhere in the system. Integrations that switch on it will never match. The initial value is `pending`.
:::

The three `partially_*` values are rollup-only — a single shipment can never carry them. Per-shipment `status` values are the registered shipment statuses (`shipped`, `delivered`, `canceled`, plus anything an extension registers).
