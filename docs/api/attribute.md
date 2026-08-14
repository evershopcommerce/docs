---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Product Attributes
  - E-commerce API
  - REST API
  - Product Management
sidebar_label: Attribute
title: Attribute REST API
description: Comprehensive documentation for managing product attributes in EverShop. Learn how to create, update, delete, and retrieve product attributes using the REST API.
---

# Attribute API

## Overview

The Attribute API provides endpoints for managing product attributes in your EverShop store. Product attributes define specific characteristics of products, such as color, size, material, or any custom properties you need for your catalog.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create An Attribute

Creates a new product attribute in the system. Attributes can be assigned to attribute groups and may include multiple options depending on the attribute type.

<Api
method="POST"
url="/api/attributes"
requestSchema={{
  "type": "object",
  "properties": {
    "attribute_name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Attribute name must be a string",
        "minLength": "Attribute name is required and cannot be empty"
      }
    },
    "attribute_code": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Attribute code must be a string",
        "minLength": "Attribute code is required and cannot be empty"
      }
    },
    "is_required": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Is required must be a number or string",
        "enum": "Is required must be either 0, 1, '0', or '1'"
      }
    },
    "display_on_frontend": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Display on frontend must be a number or string",
        "enum": "Display on frontend must be either 0, 1, '0', or '1'"
      }
    },
    "sort_order": {
      "type": ["string", "integer"],
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Sort order must be a string or number",
        "pattern": "Sort order must be a valid number (e.g., 0, 1, 10)"
      }
    },
    "is_filterable": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Is filterable must be a number or string",
        "enum": "Is filterable must be either 0, 1, '0', or '1'"
      }
    },
    "groups": {
      "type": "array",
      "minItems": 1,
      "items": {
          "type": ["string", "integer"],
          "pattern": "^[1-9][0-9]*$",
          "default": 100000,
          "errorMessage": {
            "type": "Group ID must be a string or number",
            "pattern": "Group ID must be a valid positive number (e.g., 1, 10, 100)"
          }
        },
      "errorMessage": {
        "type": "Groups must be an array",
        "minItems": "At least one group is required"
      }
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "option_text": {
            "type": "string",
            "minLength": 1,
            "errorMessage": {
              "type": "Option text must be a string",
              "minLength": "Option text is required and cannot be empty"
            }
          },
          "option_id": {
            "type": ["string", "integer"],
            "pattern": "^[1-9][0-9]*$",
            "errorMessage": {
              "type": "Option ID must be a string or number",
              "pattern": "Option ID must be a valid positive number (e.g., 1, 10, 100)"
            }
          }
        },
        "required": ["option_text"],
        "errorMessage": {
          "type": "Option must be an object",
          "required": {
            "option_text": "Option text is required"
          }
        }
      },
      "errorMessage": {
        "type": "Options must be an array"
      }
    }
  },
  "required": [
    "attribute_code",
    "attribute_name",
    "type",
    "is_required",
    "display_on_frontend",
    "groups"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "required": {
      "attribute_code": "Attribute code is required",
      "attribute_name": "Attribute name is required",
      "type": "Attribute type is required",
      "is_required": "Is required field is required",
      "display_on_frontend": "Display on frontend field is required",
      "groups": "At least one group must be assigned"
    }
  }
}}
responseSample={`{
  "data": {
    "attribute_id": 99,
    "uuid": "98bd0beea63211edb46b60d819134f39",
    "attribute_code": "GTW5s9bqJ7rP3gDrU5HF",
    "attribute_name": "Text attribute",
    "type": "text",
    "is_required": 1,
    "display_on_frontend": 1,
    "sort_order": 1,
    "is_filterable": 0,
    "links": [
      {
        "rel": "attributeGrid",
        "href": "/admin/attributes",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/attributes/edit/98bd0beea63211edb46b60d819134f39",
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

### Update an Attribute

Modifies an existing product attribute. You can update the attribute name, settings, associated groups, and options.

This is a true partial update — `updateProductAttribute` empties the schema's `required` list, so only the fields you send are written.

:::note `attribute_code` and `type` cannot be changed
Both keys are deleted from the payload before the write, so sending them has no effect and raises no error. To change either, delete the attribute and create a new one.
:::

<Api
method="PATCH"
url="/api/attributes/363ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "attribute_name": {
      "type": "string",
      "description": "Human-readable name of the attribute"
    },
    "attribute_code": {
      "type": "string",
      "description": "Unique code identifier for the attribute"
    },
    "is_required": {
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
      "description": "Whether this attribute is required (1) or optional (0)"
    },
    "display_on_frontend": {
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
      "description": "Whether to display this attribute on product pages (1) or not (0)"
    },
    "sort_order": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[0-9]*$",
      "description": "Position for sorting attributes in listings"
    },
    "is_filterable": {
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
      "description": "Whether this attribute can be used as a filter in product search (1) or not (0)"
    },
    "groups": {
      "type": "array",
      "items": {
        "type": [
          "string",
          "integer"
        ],
        "pattern": "^[0-9]*$"
      },
      "description": "Array of attribute group IDs this attribute belongs to"
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "option_text": {
            "type": "string",
            "description": "Display text for the option"
          },
          "option_id": {
            "type": [
              "string",
              "integer"
            ],
            "pattern": "^[0-9]*$",
            "description": "Unique identifier for the option (required for updating existing options)"
          }
        },
        "required": [
          "option_text"
        ]
      },
      "description": "Array of options for select/multiselect attribute types"
    }
  },
  "required": [],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "attribute_id": 99,
    "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "attribute_code": "GTW5s9bqJ7rP3gDrU5HF",
    "attribute_name": "Text attribute",
    "type": "text",
    "is_required": 1,
    "display_on_frontend": 1,
    "sort_order": 1,
    "is_filterable": 0,
    "links": [
      {
        "rel": "attributeGrid",
        "href": "/admin/attributes",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/attributes/edit/363ba97f-8be7-4be9-be3f-a9f341f2b89f",
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

### Delete an Attribute

Permanently removes a product attribute from the system. Note that this will also remove all associations of this attribute with products.

<Api
method="DELETE"
url="/api/attributes/363ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "attribute_id": 99,
    "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "attribute_code": "GTW5s9bqJ7rP3gDrU5HF",
    "attribute_name": "Text attribute Updated",
    "type": "text",
    "is_required": 1,
    "display_on_frontend": 1,
    "sort_order": 1,
    "is_filterable": 0
  }
}`}
/>

<hr />

### Reading Attributes

:::warning No REST read endpoints
`GET /api/attributes` and `GET /api/attributes/{uuid}` **do not exist**. The catalog module registers no `GET` route for attributes — calling either returns a 404.
:::

Read attribute data through **GraphQL**.

A single attribute is available on both schemas via `Query.attribute(id: Int)`:

```graphql
query Attribute($id: Int) {
  attribute(id: $id) {
    attributeId
    uuid
    attributeCode
    attributeName
    type
    isRequired
    displayOnFrontend
    sortOrder
    isFilterable
    options {
      attributeOptionId
      uuid
      optionText
    }
  }
}
```

The list query `Query.attributes(filters: [FilterInput])` is **admin-only** — it is defined in an `.admin.graphql` file and is therefore absent from the storefront schema. Send it to the authenticated endpoint `POST /admin/graphql`:

```graphql
query Attributes($filters: [FilterInput]) {
  attributes(filters: $filters) {
    items {
      attributeId
      uuid
      attributeCode
      attributeName
      type
      isFilterable
    }
    currentPage
    total
  }
}
```

See the [GraphQL documentation](/docs/development/knowledge-base/graphql) for filters and the full schema.

## Error Handling

All endpoints may return the following error responses:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>400</td>
      <td>Bad Request - Invalid parameters</td>
    </tr>
    <tr>
      <td>401</td>
      <td>Unauthorized - Authentication required</td>
    </tr>
    <tr>
      <td>403</td>
      <td>Forbidden - Insufficient permissions</td>
    </tr>
    <tr>
      <td>404</td>
      <td>Not Found - Attribute doesn't exist</td>
    </tr>
    <tr>
      <td>500</td>
      <td>Server Error - Something went wrong</td>
    </tr>
  </tbody>
</table>

Error responses follow this format:

```json
{
  "error": {
    "status": 404,
    "message": "Attribute not found"
  }
}
```

## Best Practices

1. **Naming Convention**: Use clear, descriptive names for attributes and consistent codes (e.g., `color`, `size`, `material`)
2. **Attribute Types**: Choose the appropriate attribute type (text, select, multiselect, etc.) based on how the data will be used
3. **Group Organization**: Assign attributes to logical groups to keep your product editing interface organized
4. **Filterable Attributes**: Mark attributes as filterable only when they're useful for customers to filter products by (e.g., color, size, price range)
