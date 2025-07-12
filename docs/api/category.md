---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Product Categories
  - Catalog Management
  - E-commerce API
  - REST API
sidebar_label: Category
title: Category REST API
description: Comprehensive guide to managing product categories in EverShop. Learn how to create, update, retrieve, and delete categories using the REST API.
---

# Category API

## Overview

The Category API provides endpoints for managing product categories in your EverShop store. Categories help organize your product catalog into a hierarchical structure, improving navigation and product discoverability for your customers.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create a Category

Creates a new product category in the system. Categories can be organized in a hierarchical structure by specifying a parent category.

<Api
method="POST"
url="/api/categories"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the category displayed to customers"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the category"
    },
    "image": {
      "type": "string",
      "description": "URL or path to the category image"
    },
    "meta_title": {
      "type": "string",
      "description": "Meta title for SEO purposes"
    },
    "meta_description": {
      "type": "string",
      "description": "Meta description for SEO purposes"
    },
    "meta_keywords": {
      "type": "string",
      "description": "Meta keywords for SEO purposes"
    },
    "url_key": {
      "type": "string",
      "description": "URL-friendly identifier for the category"
    },
    "status": {
      "type": [
        "integer",
        "string"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ],
      "description": "Category status: 1 for enabled, 0 for disabled"
    },
    "include_in_nav": {
      "type": [
        "integer",
        "string"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ],
      "description": "Whether to include this category in navigation menus: 1 for yes, 0 for no"
    },
    "parent_id": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]*$",
      "description": "ID of the parent category (if this is a subcategory)"
    },
    "position": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]*$",
      "description": "Position for sorting categories in listings"
    }
  },
  "required": [
    "name",
    "description",
    "status",
    "url_key",
    "meta_title",
    "meta_description"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "category_id": 103,
    "uuid": "9ab75946a63211edb46b60d819134f39",
    "status": 1,
    "parent_id": 16,
    "include_in_nav": 0,
    "position": 22,
    "created_at": "2023-02-07 00:01:47",
    "updated_at": "2023-02-07 00:01:47",
    "category_description_id": 82,
    "category_description_category_id": 103,
    "name": "Athletic Shoes",
    "short_description": null,
    "description": "High-performance athletic shoes for sports and training",
    "image": "/assets/catalog/categories/athletic-shoes.jpg",
    "meta_title": "Athletic Shoes | Performance Footwear",
    "meta_keywords": "athletic shoes, running shoes, training footwear",
    "meta_description": "Shop our selection of high-performance athletic shoes for all your training needs",
    "url_key": "athletic-shoes",
    "links": [
      {
        "rel": "categoryGrid",
        "href": "/admin/categories",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/category/athletic-shoes",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/categories/edit/9ab75946a63211edb46b60d819134f39",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

<hr />

### Update a Category

Modifies an existing product category. You can update any of the category attributes, including its hierarchical position in the catalog.

<Api
method="PATCH"
url="/api/categories/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the category displayed to customers"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the category"
    },
    "image": {
      "type": "string",
      "description": "URL or path to the category image"
    },
    "meta_title": {
      "type": "string",
      "description": "Meta title for SEO purposes"
    },
    "meta_description": {
      "type": "string",
      "description": "Meta description for SEO purposes"
    },
    "meta_keywords": {
      "type": "string",
      "description": "Meta keywords for SEO purposes"
    },
    "url_key": {
      "type": "string",
      "description": "URL-friendly identifier for the category"
    },
    "status": {
      "type": [
        "integer",
        "string"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ],
      "description": "Category status: 1 for enabled, 0 for disabled"
    },
    "include_in_nav": {
      "type": [
        "integer",
        "string"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ],
      "description": "Whether to include this category in navigation menus: 1 for yes, 0 for no"
    },
    "parent_id": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]*$",
      "description": "ID of the parent category (if this is a subcategory)"
    },
    "position": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]*$",
      "description": "Position for sorting categories in listings"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "category_id": 103,
    "uuid": "9ab75946a63211edb46b60d819134f39",
    "status": 1,
    "parent_id": 16,
    "include_in_nav": 1,
    "position": 22,
    "created_at": "2023-02-07 00:01:47",
    "updated_at": "2023-02-07 00:01:47",
    "category_description_id": 82,
    "category_description_category_id": 103,
    "name": "Athletic Shoes",
    "short_description": null,
    "description": "High-performance athletic shoes for sports and training",
    "image": "/assets/catalog/categories/athletic-shoes.jpg",
    "meta_title": "Athletic Shoes | Performance Footwear",
    "meta_keywords": "athletic shoes, running shoes, training footwear",
    "meta_description": "Shop our selection of high-performance athletic shoes for all your training needs",
    "url_key": "athletic-shoes",
    "links": [
      {
        "rel": "categoryGrid",
        "href": "/admin/categories",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/category/athletic-shoes",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/categories/edit/433ba97f-8be7-4be9-be3f-a9f341f2b89f",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

<hr />

### Delete a Category

Permanently removes a product category from the system. Note that this does not automatically delete associated products.

<Api
method="DELETE"
url="/api/categories/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "category_id": 103,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "status": 0,
    "parent_id": 16,
    "include_in_nav": 0,
    "position": 22,
    "created_at": "2023-02-07 00:01:47",
    "updated_at": "2023-02-07 00:01:48",
    "category_description_id": null,
    "category_description_category_id": null,
    "name": null,
    "short_description": null,
    "description": null,
    "image": null,
    "meta_title": null,
    "meta_keywords": null,
    "meta_description": null,
    "url_key": null
  }
}`}
/>

<hr />

### Get a Category

Retrieves detailed information about a specific product category.

<Api
method="GET"
url="/api/categories/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "category_id": 103,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "status": 1,
    "parent_id": 16,
    "include_in_nav": 1,
    "position": 22,
    "created_at": "2023-02-07 00:01:47",
    "updated_at": "2023-02-07 00:01:47",
    "category_description_id": 82,
    "category_description_category_id": 103,
    "name": "Athletic Shoes",
    "short_description": null,
    "description": "High-performance athletic shoes for sports and training",
    "image": "/assets/catalog/categories/athletic-shoes.jpg",
    "meta_title": "Athletic Shoes | Performance Footwear",
    "meta_keywords": "athletic shoes, running shoes, training footwear",
    "meta_description": "Shop our selection of high-performance athletic shoes for all your training needs",
    "url_key": "athletic-shoes",
    "path": [
      {
        "category_id": 16,
        "name": "Shoes",
        "url_key": "shoes"
      },
      {
        "category_id": 103,
        "name": "Athletic Shoes",
        "url_key": "athletic-shoes"
      }
    ]
  }
}`}
/>

<hr />

### List All Categories

Retrieves a paginated list of all product categories in the system.

<Api
method="GET"
url="/api/categories"
responseSample={`{
  "data": [
    {
      "category_id": 16,
      "uuid": "7ab75946a63211edb46b60d819134f39",
      "status": 1,
      "parent_id": null,
      "include_in_nav": 1,
      "position": 1,
      "created_at": "2023-02-06 10:01:47",
      "updated_at": "2023-02-06 10:01:47",
      "name": "Shoes",
      "description": "All types of footwear",
      "image": "/assets/catalog/categories/shoes.jpg",
      "url_key": "shoes",
      "children": [
        {
          "category_id": 103,
          "name": "Athletic Shoes",
          "url_key": "athletic-shoes"
        },
        {
          "category_id": 104,
          "name": "Casual Shoes",
          "url_key": "casual-shoes"
        }
      ]
    },
    {
      "category_id": 17,
      "uuid": "8ab75946a63211edb46b60d819134f39",
      "status": 1,
      "parent_id": null,
      "include_in_nav": 1,
      "position": 2,
      "created_at": "2023-02-06 10:02:47",
      "updated_at": "2023-02-06 10:02:47",
      "name": "Clothing",
      "description": "Apparel for all occasions",
      "image": "/assets/catalog/categories/clothing.jpg",
      "url_key": "clothing"
    }
  ],
  "links": {
    "first": "/api/categories?page=1",
    "last": "/api/categories?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "/api/categories",
    "per_page": 20,
    "to": 2,
    "total": 2
  }
}`}
/>

## Error Handling

All endpoints may return the following error responses:

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 400         | Bad Request - Invalid parameters       |
| 401         | Unauthorized - Authentication required |
| 403         | Forbidden - Insufficient permissions   |
| 404         | Not Found - Category doesn't exist     |
| 500         | Server Error - Something went wrong    |

Error responses follow this format:

```json
{
  "error": {
    "status": 404,
    "message": "Category not found"
  }
}
```

## Best Practices

1. **Hierarchical Structure**: Create a logical category hierarchy that helps customers find products easily
2. **SEO Optimization**: Use descriptive, keyword-rich values for meta titles, descriptions, and URL keys
3. **URL Keys**: Create unique, short, and descriptive URL keys for better SEO and user experience
4. **Navigation**: Use the include_in_nav field strategically to keep navigation menus clean and focused
5. **Category Images**: Use high-quality, consistent images for categories to enhance visual appeal
