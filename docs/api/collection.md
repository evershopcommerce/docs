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
      "type": "array",
      "description": "Block-editor rows, not a plain string — the same shape as the category and product description field.",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "size": {
            "type": "number"
          },
          "columns": {
            "type": "array",
            "items": {
              "type": "object"
            }
          }
        },
        "required": ["id", "size", "columns"]
      },
      "default": [],
      "errorMessage": {
        "type": "Description must be an array"
      }
    },
    "code": {
      "type": "string"
    },
    "metafields": {
      "type": "object",
      "description": "Values for the metafield definitions registered against the 'collection' owner type, keyed by namespace, then by the definition's key (the default namespace is 'custom'). Folded into the collection's meta_data column",
      "errorMessage": {
        "type": "Custom fields must be an object"
      }
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "collection_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Summer Sale",
    "code": "summer-sale",
    "description": [{ "id": "row-1", "size": 12, "columns": [{ "id": "col-1", "size": 12, "data": { "blocks": [] } }] }]
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
      "type": "array",
      "description": "Block-editor rows, not a plain string — the same shape as the category and product description field.",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "size": {
            "type": "number"
          },
          "columns": {
            "type": "array",
            "items": {
              "type": "object"
            }
          }
        },
        "required": ["id", "size", "columns"]
      },
      "default": [],
      "errorMessage": {
        "type": "Description must be an array"
      }
    },
    "code": {
      "type": "string"
    },
    "metafields": {
      "type": "object",
      "description": "Values for the metafield definitions registered against the 'collection' owner type, keyed by namespace, then by the definition's key (the default namespace is 'custom'). Folded into the collection's meta_data column",
      "errorMessage": {
        "type": "Custom fields must be an object"
      }
    }
  },
  "additionalProperties": true
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
  "success": true,
  "data": {
    "product_id": 14,
    "collection_id": 3
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
  "success": true,
  "data": {
    "product_id": "8f2b...",
    "collection_id": "3a91..."
  }
}`}
/>

<hr/>

### Get Collection Data with GraphQL

EverShop uses GraphQL for querying collection data. For detailed information on how to query collections, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
