---
sidebar_position: 21
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Shipment
  - Multi Shipment
  - Fulfillment
  - Shipping Label
  - REST API
sidebar_label: Shipment
title: Shipment REST API
description: Use the EverShop REST API to create, update, cancel and deliver order shipments. Covers partial fulfillment, carrier label purchase and the derived order shipment status.
---

import Api from '@site/src/components/rest/Api';

# Shipment API

## Overview

An order can have many shipments. A shipment is a set of `(order_item, qty)` pairs handed to one carrier, so a five-item order can be fulfilled as one shipment, five shipments, or anything in between.

Three ideas drive every endpoint on this page:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Concept</th>
      <th className="text-left">What it is</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Shipment items</b></td>
      <td>A shipment always carries an explicit item list. There is no "ship the whole order" shortcut — the caller names each <code>order_item_id</code> and the <code>qty</code> going in the box.</td>
    </tr>
    <tr>
      <td><b>Phase</b></td>
      <td>Every shipment status maps to one of three hardcoded phases: <code>shipped</code>, <code>delivered</code>, <code>canceled</code>. There is no <code>pending</code> phase — a shipment row exists only because something actually shipped.</td>
    </tr>
    <tr>
      <td><b>Rollup</b></td>
      <td><code>order.shipment_status</code> is derived from the item math, never set directly. Every write on this page recomputes it.</td>
    </tr>
  </tbody>
</table>

:::info The `carrier` code must be registered
`carrier` is not a free-text label. It must match the `code` of a carrier registered with `registerCarrier(...)` from a module's `bootstrap.ts`; an unrecognised code fails with `Unknown carrier '<code>'. Install or register the carrier extension first.` Core registers exactly one out of the box — `custom` ("Custom / Other"), a capability-free fallback for shipping without a carrier integration.
:::

## Endpoints

### List An Order's Shipments

Returns every shipment on the order, each with its `items` array embedded, ordered by `created_at` ascending. Returns an empty array when the order has no shipments or the id does not resolve.

`{id}` is the order **uuid**.

<Api
method="GET"
url="/api/orders/2f8a1c40-9d31-4c5b-8f6e-3b1a7d0e5c92/shipments"
responseSample={`{
  "data": [
    {
      "shipment_id": 41,
      "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60",
      "shipment_order_id": 18,
      "carrier": "custom",
      "tracking_number": "1Z999AA10123456784",
      "status": "shipped",
      "shipped_at": "2025-11-04T09:12:44.000Z",
      "delivered_at": null,
      "canceled_at": null,
      "label_url": null,
      "label_format": null,
      "carrier_shipment_id": null,
      "carrier_metadata": null,
      "tracking_url": null,
      "created_at": "2025-11-04T09:12:44.000Z",
      "updated_at": "2025-11-04T09:12:44.000Z",
      "items": [
        {
          "shipment_item_id": 77,
          "uuid": "b2e6a8c3-4d5f-4e9b-a012-7c3d4e5f6071",
          "shipment_id": 41,
          "order_item_id": 55,
          "qty": 2,
          "created_at": "2025-11-04T09:12:44.000Z"
        }
      ]
    }
  ]
}`}
/>

<hr />

### Create A Shipment

Creates one shipment for a subset of the order's items. `{id}` is the order **uuid**.

<Api
method="POST"
url="/api/orders/2f8a1c40-9d31-4c5b-8f6e-3b1a7d0e5c92/shipments"
requestSchema={{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "order_item_id": {
            "type": "integer"
          },
          "qty": {
            "type": "integer",
            "minimum": 1
          }
        },
        "required": ["order_item_id", "qty"]
      }
    },
    "carrier": {
      "type": "string",
      "minLength": 1
    },
    "tracking_number": {
      "type": "string"
    },
    "notifyCustomer": {
      "type": "boolean"
    }
  },
  "required": ["items", "carrier"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "shipment": {
      "shipment_id": 41,
      "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60",
      "shipment_order_id": 18,
      "carrier": "custom",
      "tracking_number": "1Z999AA10123456784",
      "status": "shipped",
      "shipped_at": "2025-11-04T09:12:44.000Z",
      "delivered_at": null,
      "canceled_at": null,
      "label_url": null,
      "label_format": null,
      "carrier_shipment_id": null,
      "carrier_metadata": null,
      "tracking_url": null
    },
    "items": [
      {
        "order_item_id": 55,
        "qty": 2
      }
    ],
    "labelCreated": false
  }
}`}
/>

`order_item_id` is the **numeric** `order_item.order_item_id`, not a uuid. Read the candidate items from the order's GraphQL `items` before building the payload.

#### Tracking number, or a purchased label

The presence of `tracking_number` decides whether the carrier's API is called:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Request</th>
      <th className="text-left">Behaviour</th>
      <th className="text-left"><code>labelCreated</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>tracking_number</code> supplied</td>
      <td>Stored as-is. No carrier call.</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td>Omitted, carrier implements <code>createLabel</code></td>
      <td>A label is purchased before the transaction opens. The returned tracking number, label URL, label format, carrier shipment id, metadata and tracking URL are written onto the shipment.</td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td>Omitted, carrier has no <code>createLabel</code></td>
      <td>The shipment is created with <code>tracking_number: null</code>. This is the normal path for the built-in <code>custom</code> carrier.</td>
      <td><code>false</code></td>
    </tr>
  </tbody>
</table>

If the transaction fails after a label was purchased, EverShop calls the carrier's `voidLabel` as a compensating action so no orphan tracking number is left behind.

`notifyCustomer` defaults to `true`; it is forwarded on the `shipment_created` event, where the shipment-confirmation email subscriber reads it. Send `false` to create a shipment silently.

#### Validation

The item list is validated twice — once before any write, and again under a per-order advisory lock inside the transaction, so two concurrent requests cannot over-allocate the same item. A request is rejected when:

- `items` is empty or `carrier` is missing.
- `carrier` is not a registered carrier code.
- Any `order_item_id` does not belong to the order.
- Any item has `no_shipping_required = true` (digital items can never be in a shipment).
- Any `qty` is not a positive integer, or exceeds the remaining unshipped quantity. Quantities inside `canceled` shipments are released back to the pool and become shippable again.

:::warning Business errors return `500`
This handler maps every thrown error to `500 Internal Server Error` with the message in `error.message` — including validation failures such as an unknown carrier or an over-allocated quantity. Only payload-schema violations (missing `items`, missing `carrier`, wrong types) return `400`. Read `error.message`, not just the status.
:::

<hr />

### Update A Shipment

Updates the carrier and/or tracking number on a single shipment, addressed by its own uuid. Fields are applied only when present and of type `string`; sending neither is rejected.

<Api
method="PATCH"
url="/api/shipments/a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60"
requestSchema={{
  "type": "object",
  "properties": {
    "carrier": {
      "type": "string",
      "minLength": 1
    },
    "tracking_number": {
      "type": "string"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "shipment_id": 41,
    "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60",
    "shipment_order_id": 18,
    "carrier": "custom",
    "tracking_number": "1Z999AA10123456799",
    "status": "shipped",
    "shipped_at": "2025-11-04T09:12:44.000Z",
    "delivered_at": null,
    "canceled_at": null
  }
}`}
/>

Errors: `400 Invalid shipment id`, `400 Nothing to update; provide carrier and/or tracking_number`.

A `Shipment information updated` entry is added to the order's activity log. This endpoint does not re-validate the carrier code against the registry, and it never touches the item list or the status.

<hr />

### Mark A Shipment Delivered

Advances one shipment into the `delivered` phase and recomputes the order rollup. Takes no request body.

<Api
method="POST"
url="/api/shipments/a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60/markDelivered"
responseSample={`{
  "data": {
    "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60"
  }
}`}
/>

Sets `delivered_at` on first entry into the phase, emits `shipment_status_changed` and `shipment_delivered`. `delivered` is terminal — a second call, or a call on a canceled shipment, fails with `Cannot transition shipment from phase ... to phase delivered`.

Errors: `400 Invalid shipment id`; `500` with the transition message on an illegal phase change.

<hr />

### Cancel A Shipment

Moves one shipment into the `canceled` phase. Takes no request body.

<Api
method="POST"
url="/api/shipments/a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60/cancel"
responseSample={`{
  "data": {
    "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60"
  }
}`}
/>

Sets `canceled_at`, releases the shipment's quantities back to the unshipped pool, and recomputes `order.shipment_status`. A `delivered` shipment cannot be canceled.

Canceling every shipment does **not** cancel the order — use `POST /api/orders/{id}/cancel` for that. See the [Order API](./order.md).

Errors: `400 Invalid shipment id`; `500` with the transition message on an illegal phase change.

<hr />

### Void A Shipping Label

Voids a previously purchased label through the carrier's `voidLabel` method, then clears `label_url` and `label_format` on the shipment. `tracking_number` is deliberately kept as a record of the original purchase.

<Api
method="DELETE"
url="/api/shipments/a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60/label"
responseSample={`{
  "data": {
    "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60"
  }
}`}
/>

The call is rejected with `400` when any of these hold:

- The shipment does not exist.
- It has no purchased label (`label_url` is null).
- It has no carrier code, its carrier is not registered, or that carrier does not implement `voidLabel`.
- It has a label but no tracking number (an inconsistent state the service refuses to act on).

Anything else — including a carrier-side failure — surfaces as `500`. On success a `shipment_label_voided` event fires and the order activity log records the void.

:::note Voiding a shipment past the `shipped` phase returns 500, not 400
Carriers refuse to void a committed label, and the service throws
`Cannot void label for shipment <uuid> — already in terminal phase '<phase>'`. That
message is not among the alternatives the handler matches when choosing the status
code, so the call surfaces as a `500` rather than the `400` you would expect. Treat it
as a client-side condition regardless of the status code.
:::

<hr />

## Order Shipment Status Is Derived

`order.shipment_status` is a cached rollup, recomputed after every shipment write. Do not write it directly.

The math runs per shippable order item (digital items are excluded), comparing ordered quantity against quantity in `shipped`-, `delivered`- and `canceled`-phase shipments, and resolves to one of seven values:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Value</th>
      <th className="text-left">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>pending</code></td>
      <td>Nothing has shipped yet.</td>
    </tr>
    <tr>
      <td><code>partially_shipped</code></td>
      <td>Some, but not all, quantity has shipped.</td>
    </tr>
    <tr>
      <td><code>shipped</code></td>
      <td>Every shippable item is fully shipped.</td>
    </tr>
    <tr>
      <td><code>partially_delivered</code></td>
      <td>Some quantity has been delivered.</td>
    </tr>
    <tr>
      <td><code>delivered</code></td>
      <td>Every shippable item is delivered. Also the value for an all-digital order, which short-circuits.</td>
    </tr>
    <tr>
      <td><code>partially_canceled</code></td>
      <td>Some quantity is in canceled shipments and nothing has shipped or been delivered.</td>
    </tr>
    <tr>
      <td><code>canceled</code></td>
      <td>The order itself is canceled, or every shippable item sits in canceled shipments.</td>
    </tr>
  </tbody>
</table>

Shipping progress wins over cancellation: an item that was canceled and then re-shipped reads as shipped. `partially_shipped`, `partially_delivered` and `partially_canceled` exist only at the order level — no individual shipment can hold them.

The rollup then feeds `order.status` through the payment-status / shipment-status mapping. See [Order Status Management](/docs/development/knowledge-base/order-status-management).

## Shipment Statuses

Core registers three statuses, each bound to a phase:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Code</th>
      <th className="text-left">Phase</th>
      <th className="text-left">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipped</code></td>
      <td><code>shipped</code></td>
      <td>Where every new shipment starts.</td>
    </tr>
    <tr>
      <td><code>delivered</code></td>
      <td><code>delivered</code></td>
      <td>Terminal.</td>
    </tr>
    <tr>
      <td><code>canceled</code></td>
      <td><code>canceled</code></td>
      <td>Terminal.</td>
    </tr>
  </tbody>
</table>

Extensions may register additional statuses with `registerShipmentStatus`, but each one must pick an existing phase — the three phases are fixed in code. Same-phase transitions (for example a custom `in_transit` to a custom `out_for_delivery`, both `shipped`) are always permitted.

## Back-Compatible Endpoints

These two routes predate the multi-shipment model. They still work, but new integrations should use the per-shipment endpoints above.

### Mark A Whole Order Delivered

Sweeps every shipment on the order and tries to advance each to `delivered`, skipping the ones that reject on the phase check. `updated_count` reports how many actually moved.

<Api
method="POST"
url="/api/deliveries"
requestSchema={{
  "type": "object",
  "properties": {
    "order_id": {
      "type": "string"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "order_id": 18,
    "updated_count": 2
  }
}`}
/>

:::caution `order_id` here is the numeric primary key
Unlike every other order route, this handler looks the order up by `order.order_id` — the numeric column — not by uuid. The payload schema types it as `string` purely for legacy form posts. Prefer `POST /api/shipments/{shipment_uuid}/markDelivered`, which is uuid-keyed and targets exactly one shipment.
:::

Errors: `400 Invalid order id`, `400 No shipments to mark delivered`.

<hr />

### Update A Shipment Through The Order

The order-scoped form of `PATCH /api/shipments/{shipment_uuid}`. Both path segments are uuids. Unlike the newer route it accepts an empty body, in which case it writes `carrier` and `tracking_number` as `undefined`.

<Api
method="PATCH"
url="/api/orders/2f8a1c40-9d31-4c5b-8f6e-3b1a7d0e5c92/shipments/a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60"
requestSchema={{
  "type": "object",
  "properties": {
    "carrier": {
      "type": "string"
    },
    "tracking_number": {
      "type": "string"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "shipment_id": 41,
    "uuid": "a1d5f7b2-3c4e-4d8a-9f01-6b2c3d4e5f60",
    "shipment_order_id": 18,
    "carrier": "custom",
    "tracking_number": "1Z999AA10123456799",
    "status": "shipped"
  }
}`}
/>

Errors: `400 Invalid order id`, `400 Invalid shipment id`.

<hr />

## Reading Shipment Data With GraphQL

Shipments are exposed on the `Order` type in GraphQL, which is the right surface for storefront and admin reads. See the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).

## Related Documentation

- [Multi-Shipment and Fulfillment](/docs/development/knowledge-base/multi-shipment-and-fulfillment) — the model behind these endpoints.
- [Carrier Development](/docs/development/knowledge-base/carrier-development) — writing a carrier with `createLabel`, `voidLabel` and tracking.
- [Order API](./order.md) — order creation, cancellation and status.
- [Shipping Provider API](./shipping-provider.md) — configuring the methods a customer can pick at checkout.
- [Package API](./package.md) — the parcel dimensions that feed carrier label and rating calls.
