---
sidebar_position: 28
keywords:
  - RESTful API
  - API endpoints
  - API authentication
  - Request validation
sidebar_label: RESTful API Routes
title: RESTful API Routes
description: Learn how to build and manage RESTful API endpoints in EverShop to provide robust backend functionality with proper authentication and validation.
---

# RESTful API Routes

EverShop provides a comprehensive system for building RESTful API endpoints that power your store's backend functionality. This document explains how to create, structure, and secure these endpoints.

:::info
Before diving into API routes, it's recommended to familiarize yourself with the [extension structure](/docs/development/module/extension-overview) to understand how extensions are organized in EverShop.
:::

## API Organization

EverShop's RESTful APIs are located in the `api` folder of each module. Below is an example of the API structure in the `catalog` module:

```bash
catalog
├── api
│   ├── createProduct
│   │   ├── ... // Middleware functions
│   │   └── route.json
│   ├── updateProduct
│   │   ├── ... // Middleware functions
│   │   └── route.json
│   ├── createCategory
│   │   ├── ... // Middleware functions
│   │   └── route.json
│   ├── updateCategory
│   │   ├── ... // Middleware functions
│   │   └── route.json
│   ├── createAttribute
│   │   ├── ... // Middleware functions
│   │   └── route.json
│   └── updateAttribute
│       ├── ... // Middleware functions
│       └── route.json

```

## API Folder Structure

The `api` folder contains the following organization:

- `global` - Contains middleware functions that apply to all API endpoints. For example, the `auth` middleware that handles authentication for all secured endpoints.

- `<apiID>` - Individual folders representing specific API endpoints. For example, the `createProduct` folder contains all the components needed for the product creation API.

## Single API Endpoint Structure

Each API endpoint folder contains middleware functions and a route definition file. Here's an example structure:

```bash
├── createProduct
│   ├── [context]bodyParser[auth].ts
│   ├── saveProduct.ts
│   └── route.json
```

The middleware functions handle the request processing, while the `route.json` file defines how the endpoint is accessed.

## API Route Definition

Every API endpoint requires a `route.json` file that specifies the HTTP methods, path, and access restrictions. For example, here's the route definition for a product deletion API:

```json
{
  "methods": ["DELETE"],
  "path": "/products/:id",
  "access": "private"
}
```

:::warning
The folder name is used as the routeId, so ensure each folder name is unique and contains only URL-safe characters. The routeId is important for correctly routing and identifying API endpoints.
:::

:::info
For more detailed information on routing patterns and options, refer to the [routing system documentation](/docs/development/knowledge-base/routing-system).
:::

## API Authentication

The `access` property in the `route.json` file controls endpoint security:

- `public` - The endpoint can be accessed without authentication
- `private` - The endpoint requires authentication (admin user credentials)

:::warning
For security best practices, endpoints without an explicitly defined `access` property are treated as `private` by default, requiring authentication to access.
:::

## API Request Data Validation

EverShop allows you to define validation schemas for API request data using a `payloadSchema.json` file in the API endpoint folder. This ensures that incoming data meets your requirements before processing.

Here's an example schema for product creation:

```json title="createProduct/payloadSchema.json"
{
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
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"]
    },
    "sku": {
      "type": "string"
    },
    "price": {
      "type": ["string", "number"],
      "pattern": "^\\d+(\\.\\d{1,2})?$"
    },
    "weight": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+(\\.[0-9]{1,2})?$"
    },
    "qty": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+$"
    },
    "manage_stock": {
      "type": ["string", "number"],
      "enum": [0, 1, "0", "1"]
    },
    "stock_availability": {
      "type": ["string", "number"],
      "enum": [0, 1, "0", "1"]
    },
    "group_id": {
      "type": ["string", "integer"],
      "pattern": "^[0-9]+$"
    },
    "visibility": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"]
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
            "type": ["string", "array"],
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
        "type": ["string", "integer"],
        "pattern": "^[0-9]+$"
      }
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
            "enum": ["select", "multiselect"]
          },
          "is_required": {
            "type": ["string", "integer"],
            "enum": [0, 1, "0", "1"],
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
                  "type": ["string", "number"],
                  "pattern": "^\\d+(\\.\\d{1,2})?$"
                }
              }
            }
          }
        },
        "required": ["option_name", "option_type", "values"],
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
}
```

When a request is made to the API endpoint, the request data is automatically validated against this schema. If validation fails, an appropriate error response is sent to the client with details about the validation issues.

:::info
EverShop uses [Ajv JSON schema validator](https://ajv.js.org/) for request payload validation, providing robust and flexible validation capabilities.
:::

## API Middleware Functions

EverShop's API endpoints are powered by middleware functions that process requests sequentially. You can create as many middleware functions as needed for each API endpoint, allowing for modular and maintainable code.

:::info
For more details on how middleware functions work in EverShop, refer to the [middleware system documentation](/docs/development/knowledge-base/middleware-system).
:::

### Sharing Middleware Across Endpoints

For efficiency, you may need to reuse middleware functions across multiple API endpoints. EverShop provides a convenient way to share middleware:

1. **Endpoint-Specific Sharing**: Create a special folder named after the endpoints that should share middleware (e.g., `createProduct+updateProduct`) in the `api` directory. Place shared middleware functions in this folder, and they'll be executed for both endpoints.

2. **Global Sharing**: For middleware that should run for all API endpoints, place it in the `api/global` folder.

These special shared middleware folders should contain only middleware functions without a `route.json` file, as they don't define endpoints themselves but enhance existing ones.

## Best Practices for API Development

When developing APIs for EverShop, consider these best practices:

1. **Proper Validation**: Always define comprehensive validation schemas for request data
2. **Access Control**: Set appropriate `access` levels for your endpoints
3. **Modular Design**: Break complex operations into multiple middleware functions
4. **Error Handling**: Provide clear error responses with appropriate HTTP status codes
5. **Documentation**: Comment your code and keep API contracts consistent
