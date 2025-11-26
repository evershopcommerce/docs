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

## Endpoints

### Create a Product

Creates a new product in your EverShop store with the specified attributes.

import Api from '@site/src/components/rest/Api';

<Api
method="POST"
url="/api/products"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Product name must be a string",
        "minLength": "Product name is required and cannot be empty"
      }
    },
    "description": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "errorMessage": {
              "type": "Description block ID must be a string"
            }
          },
          "size": {
            "type": "number",
            "errorMessage": {
              "type": "Description block size must be a number"
            }
          },
          "columns": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "errorMessage": {
                    "type": "Column ID must be a string"
                  }
                },
                "size": {
                  "type": "number",
                  "errorMessage": {
                    "type": "Column size must be a number"
                  }
                },
                "data": {
                  "type": "object",
                  "errorMessage": {
                    "type": "Column data must be an object"
                  }
                }
              },
              "required": ["id", "size", "data"],
              "errorMessage": {
                "required": {
                  "id": "Column ID is required",
                  "size": "Column size is required",
                  "data": "Column data is required"
                }
              }
            },
            "errorMessage": {
              "type": "Columns must be an array"
            }
          }
        },
        "required": ["id", "size", "columns"],
        "errorMessage": {
          "required": {
            "id": "Description block ID is required",
            "size": "Description block size is required",
            "columns": "Description block columns are required"
          }
        }
      },
      "default": [],
      "errorMessage": {
        "type": "Description must be an array"
      }
    },
    "short_description": {
      "type": "string",
      "errorMessage": {
        "type": "Short description must be a string"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^\\S+$",
      "errorMessage": {
        "type": "URL key must be a string",
        "pattern": "URL key cannot contain spaces"
      }
    },
    "meta_title": {
      "type": "string",
      "errorMessage": {
        "type": "Meta title must be a string"
      }
    },
    "meta_description": {
      "type": "string",
      "skipEscape": true,
      "errorMessage": {
        "type": "Meta description must be a string"
      }
    },
    "meta_keywords": {
      "type": "string",
      "errorMessage": {
        "type": "Meta keywords must be a string"
      }
    },
    "status": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Status must be a boolean, number, or string",
        "enum": "Status must be either 0, 1, '0', '1', true, or false"
      }
    },
    "sku": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "SKU must be a string",
        "minLength": "SKU is required and cannot be empty"
      }
    },
    "price": {
      "type": ["string", "number"],
      "pattern": "^\\d+(\\.\\d{1,2})?$",
      "errorMessage": {
        "type": "Price must be a string or number",
        "pattern": "Price must be a valid number with maximum 2 decimal places (e.g., 10.99)"
      }
    },
    "weight": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+(\\.[0-9]{1,2})?$",
      "errorMessage": {
        "type": "Weight must be a string or number",
        "pattern": "Weight must be a valid number with maximum 2 decimal places (e.g., 1.50)"
      }
    },
    "qty": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+$",
      "errorMessage": {
        "type": "Quantity must be a string or number",
        "pattern": "Quantity must be a whole number (e.g., 10, 100)"
      }
    },
    "tax_class": {
      "type": ["string", "number", "null"],
      "pattern": "^[0-9]+$",
      "default": null,
      "errorMessage": {
        "type": "Tax class must be a string, number, or null",
        "pattern": "Tax class must be a valid numeric ID"
      }
    },
    "manage_stock": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Manage stock must be a boolean, number, or string",
        "enum": "Manage stock must be either 0, 1, '0', '1', true, or false"
      }
    },
    "stock_availability": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Stock availability must be a boolean, number, or string",
        "enum": "Stock availability must be either 0, 1, '0', '1', true, or false"
      }
    },
    "group_id": {
      "type": ["string", "integer"],
      "pattern": "^[0-9]+$",
      "errorMessage": {
        "type": "Group ID must be a string or number",
        "pattern": "Group ID must be a valid numeric ID"
      }
    },
    "visibility": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Visibility must be a boolean, number, or string",
        "enum": "Visibility must be either 0, 1, '0', '1', true, or false"
      }
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string",
        "errorMessage": {
          "type": "Image path must be a string"
        }
      },
      "errorMessage": {
        "type": "Images must be an array"
      }
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "attribute_code": {
            "type": "string",
            "errorMessage": {
              "type": "Attribute code must be a string"
            }
          },
          "value": {
            "type": ["string", "array"],
            "items": {
              "type": "string",
              "errorMessage": {
                "type": "Attribute value item must be a string"
              }
            },
            "errorMessage": {
              "type": "Attribute value must be a string or array"
            }
          }
        },
        "errorMessage": {
          "type": "Attribute must be an object"
        }
      },
      "errorMessage": {
        "type": "Attributes must be an array"
      }
    },
    "category_id": {
      "type": ["string", "number", "null"],
      "pattern": "^[0-9]+$",
      "default": null,
      "errorMessage": {
        "type": "Category ID must be a string, number, or null",
        "pattern": "Category ID must be a valid numeric ID"
      }
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "option_name": {
            "type": "string",
            "minLength": 1,
            "errorMessage": {
              "type": "Option name must be a string",
              "minLength": "Option name is required and cannot be empty"
            }
          },
          "option_type": {
            "type": "string",
            "enum": ["select", "multiselect"],
            "errorMessage": {
              "type": "Option type must be a string",
              "enum": "Option type must be either 'select' or 'multiselect'"
            }
          },
          "is_required": {
            "type": ["string", "integer"],
            "enum": [0, 1, "0", "1"],
            "default": 0,
            "errorMessage": {
              "type": "Is required must be a string or number",
              "enum": "Is required must be either 0, 1, '0', or '1'"
            }
          },
          "values": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "properties": {
                "value": {
                  "type": "string",
                  "minLength": 1,
                  "errorMessage": {
                    "type": "Option value must be a string",
                    "minLength": "Option value is required and cannot be empty"
                  }
                },
                "extra_price": {
                  "type": ["string", "number"],
                  "pattern": "^\\d+(\\.\\d{1,2})?$",
                  "errorMessage": {
                    "type": "Extra price must be a string or number",
                    "pattern": "Extra price must be a valid number with maximum 2 decimal places (e.g., 5.99)"
                  }
                }
              },
              "errorMessage": {
                "type": "Option value item must be an object"
              }
            },
            "errorMessage": {
              "type": "Option values must be an array",
              "minItems": "At least one option value is required"
            }
          }
        },
        "required": ["option_name", "option_type", "values"],
        "additionalProperties": true,
        "errorMessage": {
          "type": "Option must be an object",
          "required": {
            "option_name": "Option name is required",
            "option_type": "Option type is required",
            "values": "Option values are required"
          }
        }
      },
      "errorMessage": {
        "type": "Options must be an array"
      }
    }
  },
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

### Update a Product

Updates an existing product with new attribute values.

<Api
method="PATCH"
url="/api/products/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Product name must be a string",
        "minLength": "Product name is required and cannot be empty"
      }
    },
    "description": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "errorMessage": {
              "type": "Description block ID must be a string"
            }
          },
          "size": {
            "type": "number",
            "errorMessage": {
              "type": "Description block size must be a number"
            }
          },
          "columns": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "errorMessage": {
                    "type": "Column ID must be a string"
                  }
                },
                "size": {
                  "type": "number",
                  "errorMessage": {
                    "type": "Column size must be a number"
                  }
                },
                "data": {
                  "type": "object",
                  "errorMessage": {
                    "type": "Column data must be an object"
                  }
                }
              },
              "required": ["id", "size", "data"],
              "errorMessage": {
                "required": {
                  "id": "Column ID is required",
                  "size": "Column size is required",
                  "data": "Column data is required"
                }
              }
            },
            "errorMessage": {
              "type": "Columns must be an array"
            }
          }
        },
        "required": ["id", "size", "columns"],
        "errorMessage": {
          "required": {
            "id": "Description block ID is required",
            "size": "Description block size is required",
            "columns": "Description block columns are required"
          }
        }
      },
      "default": [],
      "errorMessage": {
        "type": "Description must be an array"
      }
    },
    "short_description": {
      "type": "string",
      "errorMessage": {
        "type": "Short description must be a string"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^\\S+$",
      "errorMessage": {
        "type": "URL key must be a string",
        "pattern": "URL key cannot contain spaces"
      }
    },
    "meta_title": {
      "type": "string",
      "errorMessage": {
        "type": "Meta title must be a string"
      }
    },
    "meta_description": {
      "type": "string",
      "skipEscape": true,
      "errorMessage": {
        "type": "Meta description must be a string"
      }
    },
    "meta_keywords": {
      "type": "string",
      "errorMessage": {
        "type": "Meta keywords must be a string"
      }
    },
    "status": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Status must be a boolean, number, or string",
        "enum": "Status must be either 0, 1, '0', '1', true, or false"
      }
    },
    "sku": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "SKU must be a string",
        "minLength": "SKU is required and cannot be empty"
      }
    },
    "price": {
      "type": ["string", "number"],
      "pattern": "^\\d+(\\.\\d{1,2})?$",
      "errorMessage": {
        "type": "Price must be a string or number",
        "pattern": "Price must be a valid number with maximum 2 decimal places (e.g., 10.99)"
      }
    },
    "weight": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+(\\.[0-9]{1,2})?$",
      "errorMessage": {
        "type": "Weight must be a string or number",
        "pattern": "Weight must be a valid number with maximum 2 decimal places (e.g., 1.50)"
      }
    },
    "qty": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+$",
      "errorMessage": {
        "type": "Quantity must be a string or number",
        "pattern": "Quantity must be a whole number (e.g., 10, 100)"
      }
    },
    "tax_class": {
      "type": ["string", "number", "null"],
      "pattern": "^[0-9]+$",
      "default": null,
      "errorMessage": {
        "type": "Tax class must be a string, number, or null",
        "pattern": "Tax class must be a valid numeric ID"
      }
    },
    "manage_stock": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Manage stock must be a boolean, number, or string",
        "enum": "Manage stock must be either 0, 1, '0', '1', true, or false"
      }
    },
    "stock_availability": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Stock availability must be a boolean, number, or string",
        "enum": "Stock availability must be either 0, 1, '0', '1', true, or false"
      }
    },
    "group_id": {
      "type": ["string", "integer"],
      "pattern": "^[0-9]+$",
      "errorMessage": {
        "type": "Group ID must be a string or number",
        "pattern": "Group ID must be a valid numeric ID"
      }
    },
    "visibility": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false],
      "errorMessage": {
        "type": "Visibility must be a boolean, number, or string",
        "enum": "Visibility must be either 0, 1, '0', '1', true, or false"
      }
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string",
        "errorMessage": {
          "type": "Image path must be a string"
        }
      },
      "errorMessage": {
        "type": "Images must be an array"
      }
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "attribute_code": {
            "type": "string",
            "errorMessage": {
              "type": "Attribute code must be a string"
            }
          },
          "value": {
            "type": ["string", "array"],
            "items": {
              "type": "string",
              "errorMessage": {
                "type": "Attribute value item must be a string"
              }
            },
            "errorMessage": {
              "type": "Attribute value must be a string or array"
            }
          }
        },
        "errorMessage": {
          "type": "Attribute must be an object"
        }
      },
      "errorMessage": {
        "type": "Attributes must be an array"
      }
    },
    "category_id": {
      "type": ["string", "number", "null"],
      "pattern": "^[0-9]+$",
      "default": null,
      "errorMessage": {
        "type": "Category ID must be a string, number, or null",
        "pattern": "Category ID must be a valid numeric ID"
      }
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "option_name": {
            "type": "string",
            "minLength": 1,
            "errorMessage": {
              "type": "Option name must be a string",
              "minLength": "Option name is required and cannot be empty"
            }
          },
          "option_type": {
            "type": "string",
            "enum": ["select", "multiselect"],
            "errorMessage": {
              "type": "Option type must be a string",
              "enum": "Option type must be either 'select' or 'multiselect'"
            }
          },
          "is_required": {
            "type": ["string", "integer"],
            "enum": [0, 1, "0", "1"],
            "default": 0,
            "errorMessage": {
              "type": "Is required must be a string or number",
              "enum": "Is required must be either 0, 1, '0', or '1'"
            }
          },
          "values": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "properties": {
                "value": {
                  "type": "string",
                  "minLength": 1,
                  "errorMessage": {
                    "type": "Option value must be a string",
                    "minLength": "Option value is required and cannot be empty"
                  }
                },
                "extra_price": {
                  "type": ["string", "number"],
                  "pattern": "^\\d+(\\.\\d{1,2})?$",
                  "errorMessage": {
                    "type": "Extra price must be a string or number",
                    "pattern": "Extra price must be a valid number with maximum 2 decimal places (e.g., 5.99)"
                  }
                }
              },
              "errorMessage": {
                "type": "Option value item must be an object"
              }
            },
            "errorMessage": {
              "type": "Option values must be an array",
              "minItems": "At least one option value is required"
            }
          }
        },
        "required": ["option_name", "option_type", "values"],
        "additionalProperties": true,
        "errorMessage": {
          "type": "Option must be an object",
          "required": {
            "option_name": "Option name is required",
            "option_type": "Option type is required",
            "values": "Option values are required"
          }
        }
      },
      "errorMessage": {
        "type": "Options must be an array"
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

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>string</td>
      <td>The UUID of the product to update</td>
      <td>Yes</td>
    </tr>
  </tbody>
</table>

### Update Parameters

All parameters are optional for updates. Only include the parameters you want to modify. See the Create a Product section for detailed parameter descriptions.

<hr/>

### Delete a Product

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

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>string</td>
      <td>The UUID of the product to delete</td>
      <td>Yes</td>
    </tr>
  </tbody>
</table>

### Get Product Data with GraphQL

EverShop uses GraphQL for querying product data. For detailed information on how to query products, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
