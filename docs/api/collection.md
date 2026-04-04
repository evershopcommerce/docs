---
sidebar_position: 8
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Collection
  - Product Collection
sidebar_label: Collection
title: Collection REST API
description: Use the EverShop REST API to manage product collections.
---

import Api from '@site/src/components/rest/Api';

# Collection API

## Endpoints

### Create a Collection

Creates a new product collection.

<Api
method="POST"
url="/api/collections"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "code": {
      "type": "string"
    }
  }
}}
responseSample={`{
  "data": {
    "collection_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Summer Sale",
    "code": "summer-sale",
    "description": "Products on sale for summer"
  }
}`}
/>

<hr/>

### Update a Collection

Updates an existing product collection.

<Api
method="PATCH"
url="/api/collections/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "code": {
      "type": "string"
    }
  }
}}
responseSample={`{
  "data": {
    "collection_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Summer Sale 2024",
    "code": "summer-sale"
  }
}`}
/>

<hr/>

### Delete a Collection

Permanently removes a collection. Products in the collection are not deleted.

<Api
method="DELETE"
url="/api/collections/{id}"
responseSample={`{
  "data": {
    "collection_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}`}
/>

<hr/>

### Add Product to Collection

Adds an existing product to a collection.

<Api
method="POST"
url="/api/collections/{collection_id}/products"
requestSchema={{
  "type": "object",
  "properties": {
    "product_id": {
      "type": "string"
    }
  },
  "required": ["product_id"]
}}
responseSample={`{
  "data": {
    "success": true
  }
}`}
/>

<hr/>

### Remove Product from Collection

Removes a product from a collection. The product itself is not deleted.

<Api
method="DELETE"
url="/api/collections/{collection_id}/products/{product_id}"
responseSample={`{
  "data": {
    "success": true
  }
}`}
/>

<hr/>

### Get Collection Data with GraphQL

EverShop uses GraphQL for querying collection data. For detailed information on how to query collections, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
