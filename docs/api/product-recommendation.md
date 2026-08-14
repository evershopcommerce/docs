---
sidebar_position: 19
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Related Products
  - Cross Sell
  - Product Recommendations
sidebar_label: Product Recommendations
title: Product Recommendations REST API
description: Use the EverShop REST API to manage manual recommendation picks and rebuild co-purchase statistics.
---

import Api from '@site/src/components/rest/Api';

# Product Recommendations API

Manual recommendation picks are directional links from one product to another, typed `related` or `cross_sell`. (The Upsell shelf takes no manual links — it derives from the related-products rules.) All endpoints require admin authentication.

## Endpoints

### Add a product link

Links a product to the product identified by `product_id` (both are product UUIDs). Rejects self-links, links to a variant of the same group (they can never render — the shelf excludes the viewed product's own variants), and duplicates of the same `(product, linked product, type)`.

<Api
method="POST"
url="/api/products/{product_id}/links"
requestSchema={{
  "type": "object",
  "properties": {
    "linked_product_id": {
      "type": "string",
      "description": "UUID of the product to link"
    },
    "type": {
      "type": "string",
      "enum": ["related", "cross_sell"]
    },
    "sort_order": {
      "type": "integer",
      "description": "Pin position within the manual prefix (optional, default 0)"
    }
  },
  "required": ["linked_product_id", "type"]
}}
responseSample={`{
  "success": true,
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "product_id": 14,
    "linked_product_id": 76,
    "type": "related",
    "sort_order": 1
  }
}`}
/>

<hr/>

### Update a product link

Updates the pin position of a link. The link must belong to the product in the path.

<Api
method="PATCH"
url="/api/products/{product_id}/links/{link_uuid}"
requestSchema={{
  "type": "object",
  "properties": {
    "sort_order": {
      "type": "integer"
    }
  },
  "required": ["sort_order"]
}}
responseSample={`{
  "success": true,
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "sort_order": 3
  }
}`}
/>

<hr/>

### Remove a product link

<Api
method="DELETE"
url="/api/products/{product_id}/links/{link_uuid}"
responseSample={`{
  "success": true,
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}`}
/>

<hr/>

### Rebuild co-purchase statistics

Rebuilds the frequently-bought-together statistics from the full order history — the same job that runs nightly. Safe to call while the nightly job runs; concurrent rebuilds are serialized.

<Api
method="POST"
url="/api/recommendationStats"
responseSample={`{
  "success": true,
  "data": {
    "computedAt": "2026-07-16T02:00:01.000Z",
    "totalOrderCount": 49019,
    "pairCount": 194158
  }
}`}
/>
