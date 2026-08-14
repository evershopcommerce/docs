---
sidebar_position: 1
hide_table_of_contents: true
keywords:
- EverShop api
sidebar_label: Variant
title: Product Variant REST API
description: Use the REST API to interact with EverShop variants. Create, update, delete, and get variants.
---

# Product Variant API

Use the REST API to interact with EverShop product variant.

## Create a variant group

Use this endpoint to create a variant group.

import Api from '@site/src/components/rest/Api';

<Api
  method="POST"
  url="/api/variantGroups"
  requestSchema={{
  "type": "object",
  "properties": {
    "attribute_codes": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "attribute_group_id": {
      "type": [
        "integer",
        "string"
      ],
      "pattern": "^[0-9]+$"
    }
  },
  "required": [
    "attribute_codes"
  ],
  "additionalProperties": true
}}
  responseSample={`{
  "data": {
    "variant_group_id": 8,
    "uuid": "99a7b39ca63211edb46b60d819134f39",
    "attribute_group_id": 1,
    "attribute_one": 4,
    "attribute_two": 2,
    "attribute_three": 3,
    "attribute_four": 5,
    "attribute_five": 6
  }
}`}
 />

<hr />

## Search variant candidates

Use this endpoint to find products that can still be added to a variant group. It backs the product picker in the admin variant editor.

The result set is deliberately narrow: only products whose `variant_group_id` **is null** are returned — a product already belonging to a group is never a candidate. There is no status or visibility filter, and no pagination; every unassigned product is returned in one response.

<Api
  method="GET"
  url="/api/variants?keyword=blue"
  responseSample={`{
  "data": {
    "variants": [
      {
        "variant_product_id": 281,
        "sku": "TSHIRT-BLUE-M",
        "name": "Blue T-Shirt (M)",
        "status": 1,
        "price": 45,
        "qty": 123,
        "gallery": "/assets/catalog/281/blue-back.jpg",
        "image": {},
        "images": [
          {
            "url": "/assets/catalog/281/blue-front.jpg",
            "path": "/assets/catalog/281/blue-front.jpg"
          },
          {
            "url": "/assets/catalog/281/blue-back.jpg",
            "path": "/assets/catalog/281/blue-back.jpg"
          }
        ],
        "attributes": [
          {
            "product_attribute_value_index_id": 902,
            "uuid": "3f2a1b7c-9d4e-4a10-8b52-6c7d8e9f0a1b",
            "product_id": 281,
            "attribute_id": 2,
            "option_id": 5,
            "option_text": "Blue"
          },
          {
            "product_attribute_value_index_id": 903,
            "uuid": "4a3b2c8d-0e5f-4b21-9c63-7d8e9f0a1b2c",
            "product_id": 281,
            "attribute_id": 3,
            "option_id": 6,
            "option_text": "M"
          }
        ]
      }
    ]
  }
}`}
 />

### Query Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>keyword</td>
      <td>string</td>
      <td>No</td>
      <td>Case-sensitive <code>LIKE '%keyword%'</code> match against the product <b>name</b> or <b>sku</b>. Omit it to list every unassigned product.</td>
    </tr>
  </tbody>
</table>

### Response Fields

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>variant_product_id</code></td>
      <td>The numeric <code>product_id</code>, renamed. This is the value to send as <code>product_id</code> when adding the product to a group.</td>
    </tr>
    <tr>
      <td><code>images</code></td>
      <td>The product's main image followed by each gallery image, each an object carrying <code>url</code> and <code>path</code>. Rows are collapsed per product, so a product with three gallery images produces one entry with four images, not four entries.</td>
    </tr>
    <tr>
      <td><code>attributes</code></td>
      <td>Raw <code>product_attribute_value_index</code> rows for the product — one per attribute that has a value, carrying <code>attribute_id</code>, <code>option_id</code> and <code>option_text</code>.</td>
    </tr>
  </tbody>
</table>

:::caution `image` is always an empty object
The handler builds `image` from a column name that the query aliases away, so the value is always `undefined` and serializes as `{}`. Use `images[0]` for the main image; the raw gallery column also leaks through as a top-level `gallery` string.
:::

<hr />

## Add variant item

Use this endpoint to add a product to a variant group.

<Api
  method="POST"
  url="/api/variantGroups/{id}/items"
  requestSchema={{
  "type": "object",
  "properties": {
    "product_id": {
      "type": "string"
    }
  },
  "required": [
    "product_id"
  ],
  "additionalProperties": true
}}
  responseSample={`{
  "data": {
    "id": "r57hfgh5656",
    "attributes": [
      {
        "attribute_id": 2,
        "attribute_code": "color",
        "option_id": 5
      },
      {
        "attribute_id": 3,
        "attribute_code": "size",
        "option_id": 6
      }
    ],
    "product": {
      "product_id": 281,
      "uuid": "99a7b39ca63211edb46b60d819134f39",
      "variant_group_id": 2,
      "visibility": 1,
      "group_id": 4,
      "image": null,
      "sku": "skuUpdated",
      "price": 45,
      "qty": 123,
      "weight": 17,
      "manage_stock": 1,
      "stock_availability": 1,
      "tax_class": null,
      "status": 1,
      "created_at": "2023-02-07 00:01:46",
      "updated_at": "2023-02-07 00:01:46"
    }
  }
}`}
 />

<hr />

## Unlink Variant

Removes a product from its variant group. The product is not deleted, but it will no longer be associated with the variant group.

:::warning The id goes in the body, not the path
Despite the `/api/variants/{id}` route shape, the handler reads `request.body.id` — the
`:id` path segment is ignored. Send the product id in the request body; a request that
relies on the path parameter alone unlinks nothing.
:::

<Api
  method="DELETE"
  url="/api/variants/{id}"
  responseSample={`{
  "data": {}
}`}
 />
