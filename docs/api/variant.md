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

<Api
  method="DELETE"
  url="/api/variants/{id}"
  responseSample={`{
  "data": {
    "success": true
  }
}`}
 />
