---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop api
sidebar_label: Order
title: Order REST API
description: Use the REST API to interact with EverShop orders and their shipments.
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
      "full_name": "The Nguyen",
      "postcode": "5000",
      "telephone": "123456",
      "country": "VN",
      "province": "Ho Chi Minh",
      "city": "Ho Chi Minh",
      "address_1": "Thu Duc ho chi minh",
      "address_2": null
    },
    "billing_address": {
      "order_address_id": 552,
      "uuid": "e0fd1671a66c11edb46b60d819134f39",
      "full_name": "The Nguyen",
      "postcode": "5000",
      "telephone": "123456",
      "country": "VN",
      "province": "Ho Chi Minh",
      "city": "Ho Chi Minh",
      "address_1": "Thu Duc ho chi minh",
      "address_2": null
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

Use this endpoint to cancel an order.

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
