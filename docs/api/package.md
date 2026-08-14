---
sidebar_position: 23
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Package
  - Parcel
  - Box Size
  - Shipping Dimensions
  - REST API
sidebar_label: Package
title: Package REST API
description: Manage the box and envelope sizes EverShop uses for parcel dimensions. Create, update and delete packages with the REST API and understand how dimensions reach carrier label and rating calls.
---

import Api from '@site/src/components/rest/Api';

# Package API

## Overview

A package is an admin-managed box or envelope size: a name, three dimensions, and an optional tare weight. Products point at one through `product.package_id`, and that choice is what gives every downstream shipping calculation a parcel to reason about.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Field</th>
      <th className="text-left">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>Unique label shown in the product form, for example "Standard Box".</td>
    </tr>
    <tr>
      <td><code>length</code> / <code>width</code> / <code>height</code></td>
      <td>Outer dimensions in the store's dimension unit (the <code>dimensionUnit</code> admin setting). Length and width must be greater than <code>0</code>; height may be <code>0</code> for a flat envelope.</td>
    </tr>
    <tr>
      <td><code>weight</code></td>
      <td><b>Tare</b> — the weight of the <i>empty</i> package, in the store's weight unit (the <code>weightUnit</code> admin setting). Optional, defaults to <code>0</code>. This is not the weight of the goods.</td>
    </tr>
    <tr>
      <td><code>is_default</code></td>
      <td>Exactly one package is the default, preselected when a new product is created. Enforced by a unique partial index, not just by the service.</td>
    </tr>
  </tbody>
</table>

A fresh install seeds one package — `Standard Box`, 30 × 25 × 10, tare `0`, default — so product creation never dead-ends. Merchants rename or edit it rather than starting from nothing.

:::info Numeric columns come back as strings
`length`, `width`, `height` and `weight` are Postgres `decimal` columns, so responses carry them as strings (`"30.00"`). Requests may send either numbers or numeric strings; the handler coerces with `Number()` before validating.
:::

## Endpoints

### Create A Package

<Api
method="POST"
url="/api/packages"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "length": {
      "type": ["number", "string"]
    },
    "width": {
      "type": ["number", "string"]
    },
    "height": {
      "type": ["number", "string"]
    },
    "weight": {
      "type": ["number", "string"]
    },
    "is_default": {
      "type": "boolean"
    }
  },
  "required": ["name", "length", "width", "height"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "package_id": 4,
    "uuid": "7d2f5a91-6c3b-4e08-9a1d-5f7b8c0e2d34",
    "name": "Large Box",
    "length": "45.00",
    "width": "35.00",
    "height": "25.00",
    "weight": "0.4500",
    "is_default": false,
    "created_at": "2025-11-04T09:12:44.000Z",
    "updated_at": "2025-11-04T09:12:44.000Z"
  }
}`}
/>

`weight` defaults to `0` and `is_default` to `false`. Sending `is_default: true` unsets the current default inside the same transaction, so there is never a moment with two defaults or none.

Beyond the payload schema, the service enforces the same rules as the table's `CHECK` constraints, so you get a readable message instead of a constraint code:

- `Package name is required` — missing, non-string, or whitespace-only.
- `Package length must be greater than 0`, `Package width must be greater than 0`.
- `Package height must be 0 (envelope) or greater`.
- `Package weight must be 0 or greater`.
- `A package with this name already exists` — the unique name constraint.

<hr />

### Update A Package

Partial update. `{id}` is the package **uuid**. Only the fields present in the body are written, and each present field is validated by the same rules as on create.

<Api
method="PATCH"
url="/api/packages/7d2f5a91-6c3b-4e08-9a1d-5f7b8c0e2d34"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "length": {
      "type": ["number", "string"]
    },
    "width": {
      "type": ["number", "string"]
    },
    "height": {
      "type": ["number", "string"]
    },
    "weight": {
      "type": ["number", "string"]
    },
    "is_default": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "package_id": 4,
    "uuid": "7d2f5a91-6c3b-4e08-9a1d-5f7b8c0e2d34",
    "name": "Large Box",
    "length": "45.00",
    "width": "35.00",
    "height": "30.00",
    "weight": "0.4500",
    "is_default": true,
    "created_at": "2025-11-04T09:12:44.000Z",
    "updated_at": "2025-11-06T11:03:21.000Z"
  }
}`}
/>

:::note This route has no payload schema file
Unlike `POST /api/packages`, the update route declares no `payloadSchema.json`, so there is no request-schema rejection layer in front of it. The table above documents the fields the handler actually reads; anything else in the body is ignored. All validation happens in the service and surfaces as an error message.
:::

Setting `is_default: true` swaps the default over in one transaction. Setting `is_default: false` on the package that *is* currently the default is refused with `This is the default package. Set another package as default first.` — there must always be exactly one default. To move the default, promote the other package instead.

Errors: `Package not found: {uuid}`, the validation messages listed above, and `A package with this name already exists`.

<hr />

### Delete A Package

`{id}` is the package **uuid**. Takes no request body.

<Api
method="DELETE"
url="/api/packages/7d2f5a91-6c3b-4e08-9a1d-5f7b8c0e2d34"
responseSample={`{
  "data": {
    "uuid": "7d2f5a91-6c3b-4e08-9a1d-5f7b8c0e2d34"
  }
}`}
/>

Two guards stand in the way:

- The default package cannot be deleted — `The default package cannot be deleted. Set another package as default first.`
- `product.package_id` is a foreign key with `ON DELETE RESTRICT`. A package still assigned to products is refused with a message that counts them: `This package is used by N product(s). Assign those products to another package first.`

Orders are never blocked by this. Order rows carry a *copy* of the dimensions rather than a reference, so deleting a package cannot alter fulfilment history.

Errors: `Package not found: {uuid}`, plus the two guards above.

<hr />

:::warning Errors on this resource return `500`
All three handlers catch every thrown error and respond `500 Internal Server Error` with the detail in `error.message` — including the business rules above. The only `400` you will see is a payload-schema violation on `POST /api/packages` (missing `name`, `length`, `width` or `height`). Always read `error.message`.
:::

## How Dimensions Reach The Carrier

Dimensions are snapshotted forward at every step rather than joined at read time, so editing or deleting a package never rewrites history.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Stage</th>
      <th className="text-left">What happens</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Product</b></td>
      <td><code>product.package_id</code> references the package. It is nullable — legacy products keep <code>NULL</code> until next edited — and is forced to <code>NULL</code> when the product is marked <code>no_shipping_required</code>. Variant group members share one package.</td>
    </tr>
    <tr>
      <td><b>Cart item</b></td>
      <td>On every cart rebuild the product's package is merged onto the loaded product row and copied into <code>cart_item.package_length</code>, <code>package_width</code>, <code>package_height</code> and <code>package_weight</code> — the same refresh semantics as price and product weight.</td>
    </tr>
    <tr>
      <td><b>Cart</b></td>
      <td>The <code>cartPackages</code> processor turns those per-item dimensions into a packing proposal stored on <code>cart.packages</code> as an array of <code>{"{ packageUuid, name, length, width, height, tareWeight, goodsWeight }"}</code>. The default heuristic is deliberately simple: one parcel, sized by the largest item package by volume, carrying that package's tare. Override the whole strategy with <code>addProcessor('cartPackages', ...)</code>.</td>
    </tr>
    <tr>
      <td><b>Order item</b></td>
      <td>At placement the four <code>package_*</code> columns copy straight across to <code>order_item</code> and are never touched again. There is no foreign key from order rows back to <code>package</code>.</td>
    </tr>
    <tr>
      <td><b>Carrier call</b></td>
      <td>When a shipment is created, each item's snapshot becomes <code>CarrierItem.dimensions</code>, and a per-shipment parcel is built over just that shipment's items — a multi-shipment order ships subsets, so the cart-level proposal does not apply. The parcel's weight is goods + tare.</td>
    </tr>
  </tbody>
</table>

:::info Tare is counted exactly once
Per-item weights stay goods-only everywhere. The empty package's weight enters the total in exactly one place — the parcel — which is why the cart's `total_weight` field resolver adds `Σ parcel.tareWeight` rather than summing item weights that already include it.
:::

Items with no dimensions — legacy products, or anything with `no_shipping_required` — contribute no parcel candidate. If no item in a shipment carries dimensions, no parcel is sent and the carrier falls back to its own defaults.

## Related Documentation

- [Package Management](/docs/development/knowledge-base/package-management) — the design behind parcel sizing and the `cartPackages` processor.
- [Product API](./product.md) — assigning `package_id` to a product.
- [Shipment API](./shipment.md) — where the parcel is handed to the carrier.
- [Shipping Provider API](./shipping-provider.md) — weight-based shipping rates, which read the same weights.
