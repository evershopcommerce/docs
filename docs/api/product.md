---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Product API
  - E-commerce API
  - RESTful API
sidebar_label: Product
title: Product REST API
description: Use the EverShop REST API to manage products - create, update, delete, and retrieve product information efficiently.
---

# Product API

The Product API allows you to programmatically manage products in your EverShop store. This RESTful interface provides endpoints for creating, updating, retrieving, and deleting products.

## Create a Product

Creates a new product in your EverShop store with the specified attributes.

import Api from '@site/src/components/rest/Api';

<Api
method="POST"
url="/api/products"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "short_description": {
      "type": "string"
    },
    "url_key": {
      "type": "string",
      "pattern": "^\\S+$"
    },
    "meta_title": {
      "type": "string"
    },
    "meta_description": {
      "type": "string"
    },
    "meta_keywords": {
      "type": "string"
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
      ]
    },
    "sku": {
      "type": "string"
    },
    "price": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^\\d+(\\.\\d{1,2})?$"
    },
    "weight": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^[0-9]+(\\.[0-9]{1,2})?$"
    },
    "qty": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^[0-9]+$"
    },
    "manage_stock": {
      "type": [
        "string",
        "number"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ]
    },
    "stock_availability": {
      "type": [
        "string",
        "number"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ]
    },
    "group_id": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]+$"
    },
    "visibility": {
      "type": [
        "integer",
        "string"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ]
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "attribute_code": {
            "type": "string"
          },
          "value": {
            "type": [
              "string",
              "array"
            ],
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "category_id": {
      "type": [
        "string",
        "integer",
        "null"
      ],
      "pattern": "^[0-9]+$"
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "option_name": {
            "type": "string"
          },
          "option_type": {
            "type": "string",
            "enum": [
              "select",
              "multiselect"
            ]
          },
          "is_required": {
            "type": [
              "string",
              "integer"
            ],
            "enum": [
              0,
              1,
              "0",
              "1"
            ],
            "default": 0
          },
          "values": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "value": {
                  "type": "string"
                },
                "extra_price": {
                  "type": [
                    "string",
                    "number"
                  ],
                  "pattern": "^\\d+(\\.\\d{1,2})?$"
                }
              }
            }
          }
        },
        "required": [
          "option_name",
          "option_type",
          "values"
        ],
        "additionalProperties": true
      }
    }
  },
  "required": [
    "name",
    "meta_title",
    "url_key",
    "status",
    "sku",
    "qty",
    "price",
    "weight",
    "group_id",
    "visibility"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "product_id": 281,
    "uuid": "99a7b39ca63211edb46b60d819134f39",
    "variant_group_id": null,
    "visibility": 1,
    "group_id": 4,
    "image": null,
    "sku": "Q7Oq0kxZIMQ5isUyJRbg",
    "price": 43,
    "qty": 123,
    "weight": 17,
    "manage_stock": 1,
    "stock_availability": 1,
    "tax_class": null,
    "status": 0,
    "created_at": "2023-02-07 00:01:46",
    "updated_at": "2023-02-07 00:01:46",
    "product_description_id": 351,
    "product_description_product_id": 281,
    "name": "Q7Oq0kxZIMQ5isUyJRbg",
    "description": null,
    "short_description": null,
    "url_key": "Q7Oq0kxZIMQ5isUyJRbg",
    "meta_title": "Q7Oq0kxZIMQ5isUyJRbg",
    "meta_description": null,
    "meta_keywords": null,
    "links": [
      {
        "rel": "productGrid",
        "href": "/admin/products",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/product/Q7Oq0kxZIMQ5isUyJRbg",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/products/edit/99a7b39ca63211edb46b60d819134f39",
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

## Update a Product

Updates an existing product with new attribute values.

<Api
method="PATCH"
url="/api/products/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "short_description": {
      "type": "string"
    },
    "url_key": {
      "type": "string",
      "pattern": "^\\S+$"
    },
    "meta_title": {
      "type": "string"
    },
    "meta_description": {
      "type": "string"
    },
    "meta_keywords": {
      "type": "string"
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
      ]
    },
    "sku": {
      "type": "string"
    },
    "price": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^\\d+(\\.\\d{1,2})?$"
    },
    "weight": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^[0-9]+(\\.[0-9]{1,2})?$"
    },
    "qty": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^[0-9]+$"
    },
    "manage_stock": {
      "type": [
        "string",
        "number"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ]
    },
    "stock_availability": {
      "type": [
        "string",
        "number"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ]
    },
    "group_id": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]+$"
    },
    "visibility": {
      "type": [
        "integer",
        "string"
      ],
      "enum": [
        0,
        1,
        "0",
        "1"
      ]
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "attribute_code": {
            "type": "string"
          },
          "value": {
            "type": [
              "string",
              "array"
            ],
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "categories": {
      "type": "array",
      "items": {
        "type": [
          "string",
          "integer"
        ],
        "pattern": "^[0-9]+$"
      }
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "option_id": {
            "type": "number"
          },
          "option_name": {
            "type": "string"
          },
          "option_type": {
            "type": "string",
            "enum": [
              "select",
              "multiselect"
            ]
          },
          "is_required": {
            "type": [
              "string",
              "integer"
            ],
            "enum": [
              0,
              1,
              "0",
              "1"
            ],
            "default": 0
          },
          "values": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "value_id": {
                  "type": "number"
                },
                "value": {
                  "type": "string"
                },
                "extra_price": {
                  "type": [
                    "string",
                    "number"
                  ],
                  "pattern": "^\\d+(\\.\\d{1,2})?$"
                }
              },
              "required": [
                "value",
                "extra_price"
              ]
            }
          }
        },
        "required": [
          "option_name",
          "option_type",
          "values"
        ],
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "product_id": 281,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "variant_group_id": null,
    "visibility": 1,
    "group_id": 4,
    "image": null,
    "sku": "Q7Oq0kxZIMQ5isUyJRbg",
    "price": 43,
    "qty": 123,
    "weight": 17,
    "manage_stock": 1,
    "stock_availability": 1,
    "tax_class": null,
    "status": 0,
    "created_at": "2023-02-07 00:01:46",
    "updated_at": "2023-02-07 00:01:46",
    "product_description_id": 351,
    "product_description_product_id": 281,
    "name": "Q7Oq0kxZIMQ5isUyJRbg",
    "description": null,
    "short_description": null,
    "url_key": "Q7Oq0kxZIMQ5isUyJRbg",
    "meta_title": "Q7Oq0kxZIMQ5isUyJRbg",
    "meta_description": null,
    "meta_keywords": null,
    "links": [
      {
        "rel": "productGrid",
        "href": "/admin/products",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/product/Q7Oq0kxZIMQ5isUyJRbg",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/products/edit/99a7b39ca63211edb46b60d819134f39",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| id        | string | Yes      | The UUID of the product to update |

### Update Parameters

All parameters are optional for updates. Only include the parameters you want to modify. See the Create a Product section for detailed parameter descriptions.

<hr/>

## Delete a Product

Removes a product from your EverShop store.

<Api
method="DELETE"
url="/api/products/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "product_id": 281,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "variant_group_id": null,
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
    "updated_at": "2023-02-07 00:01:46",
    "product_description_id": null,
    "product_description_product_id": null,
    "name": null,
    "description": null,
    "short_description": null,
    "url_key": null,
    "meta_title": null,
    "meta_description": null,
    "meta_keywords": null
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| id        | string | Yes      | The UUID of the product to delete |

## Get a Product

Retrieves detailed information about a specific product.

<Api
method="GET"
url="/api/products/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "product_id": 281,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "variant_group_id": null,
    "visibility": 1,
    "group_id": 4,
    "image": null,
    "sku": "Q7Oq0kxZIMQ5isUyJRbg",
    "price": 43,
    "qty": 123,
    "weight": 17,
    "manage_stock": 1,
    "stock_availability": 1,
    "tax_class": null,
    "status": 0,
    "created_at": "2023-02-07 00:01:46",
    "updated_at": "2023-02-07 00:01:46",
    "product_description_id": 351,
    "product_description_product_id": 281,
    "name": "Q7Oq0kxZIMQ5isUyJRbg",
    "description": null,
    "short_description": null,
    "url_key": "Q7Oq0kxZIMQ5isUyJRbg",
    "meta_title": "Q7Oq0kxZIMQ5isUyJRbg",
    "meta_description": null,
    "meta_keywords": null,
    "images": [],
    "attributes": [],
    "options": [],
    "categories": [],
    "links": [
      {
        "rel": "productGrid",
        "href": "/admin/products",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/product/Q7Oq0kxZIMQ5isUyJRbg",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/products/edit/99a7b39ca63211edb46b60d819134f39",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                         |
| --------- | ------ | -------- | ----------------------------------- |
| id        | string | Yes      | The UUID of the product to retrieve |

## List Products

Retrieves a paginated list of products from your EverShop store.

<Api
method="GET"
url="/api/products"
responseSample={`{
  "data": [
    {
      "product_id": 281,
      "uuid": "99a7b39ca63211edb46b60d819134f39",
      "variant_group_id": null,
      "visibility": 1,
      "group_id": 4,
      "image": null,
      "sku": "Q7Oq0kxZIMQ5isUyJRbg",
      "price": 43,
      "qty": 123,
      "weight": 17,
      "manage_stock": 1,
      "stock_availability": 1,
      "tax_class": null,
      "status": 0,
      "created_at": "2023-02-07 00:01:46",
      "updated_at": "2023-02-07 00:01:46",
      "name": "Q7Oq0kxZIMQ5isUyJRbg",
      "url_key": "Q7Oq0kxZIMQ5isUyJRbg",
      "links": [
        {
          "rel": "view",
          "href": "/product/Q7Oq0kxZIMQ5isUyJRbg",
          "action": "GET",
          "types": [
            "text/xml"
          ]
        },
        {
          "rel": "edit",
          "href": "/admin/products/edit/99a7b39ca63211edb46b60d819134f39",
          "action": "GET",
          "types": [
            "text/xml"
          ]
        }
      ]
    },
    // More products...
  ],
  "total": 42,
  "currentPage": 1,
  "limit": 20,
  "links": [
    {
      "rel": "first",
      "href": "/api/products?page=1",
      "action": "GET"
    },
    {
      "rel": "last",
      "href": "/api/products?page=3",
      "action": "GET"
    },
    {
      "rel": "next",
      "href": "/api/products?page=2",
      "action": "GET"
    }
  ]
}`}
/>

## Best Practices

1. **Rate Limiting**: Be mindful of API rate limits to avoid being throttled.
2. **Batch Processing**: For bulk operations, consider creating products in batches.
3. **Error Handling**: Always implement proper error handling for API responses.
4. **Unique SKUs**: Ensure all products have unique SKUs to avoid conflicts.
5. **Image URLs**: For product images, provide publicly accessible URLs.

## Troubleshooting

### Common Error Codes

| Status Code | Description       | Solution                                    |
| ----------- | ----------------- | ------------------------------------------- |
| 400         | Bad Request       | Check your request payload for invalid data |
| 401         | Unauthorized      | Ensure your API credentials are correct     |
| 404         | Not Found         | Verify the product ID exists                |
| 409         | Conflict          | The SKU or URL key may already be in use    |
| 429         | Too Many Requests | Reduce your API call frequency              |
| 500         | Server Error      | Contact support if the issue persists       |
