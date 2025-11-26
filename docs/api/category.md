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
      "minLength": 1,
      "errorMessage": {
        "type": "Category name must be a string",
        "minLength": "Category name is required and cannot be empty"
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
    "image": {
      "type": "string",
      "errorMessage": {
        "type": "Image path must be a string"
      }
    },
    "meta_title": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Meta title must be a string",
        "minLength": "Meta title is required and cannot be empty"
      }
    },
    "meta_description": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Meta description must be a string",
        "minLength": "Meta description is required and cannot be empty"
      }
    },
    "meta_keywords": {
      "type": "string",
      "errorMessage": {
        "type": "Meta keywords must be a string"
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
    "status": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Status must be a number or string",
        "enum": "Status must be either 0, 1, '0', or '1'"
      }
    },
    "include_in_nav": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Include in navigation must be a number or string",
        "enum": "Include in navigation must be either 0, 1, '0', or '1'"
      }
    },
    "parent_id": {
      "type": ["string", "number", "null"],
      "pattern": "^[0-9]+$",
      "default": null,
      "errorMessage": {
        "type": "Parent ID must be a string, number, or null",
        "pattern": "Parent ID must be a valid numeric ID"
      }
    },
    "position": {
      "type": ["string", "integer"],
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Position must be a string or number",
        "pattern": "Position must be a valid number (e.g., 0, 1, 10)"
      }
    }
  },
  "required": [
    "name",
    "description",
    "status",
    "meta_title",
    "meta_description"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "required": {
      "name": "Category name is required",
      "description": "Category description is required",
      "status": "Category status is required",
      "meta_title": "Meta title is required",
      "meta_description": "Meta description is required"
    }
  }
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
      "minLength": 1,
      "errorMessage": {
        "type": "Category name must be a string",
        "minLength": "Category name is required and cannot be empty"
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
    "image": {
      "type": "string",
      "errorMessage": {
        "type": "Image path must be a string"
      }
    },
    "meta_title": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Meta title must be a string",
        "minLength": "Meta title is required and cannot be empty"
      }
    },
    "meta_description": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Meta description must be a string",
        "minLength": "Meta description is required and cannot be empty"
      }
    },
    "meta_keywords": {
      "type": "string",
      "errorMessage": {
        "type": "Meta keywords must be a string"
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
    "status": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Status must be a number or string",
        "enum": "Status must be either 0, 1, '0', or '1'"
      }
    },
    "include_in_nav": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"],
      "errorMessage": {
        "type": "Include in navigation must be a number or string",
        "enum": "Include in navigation must be either 0, 1, '0', or '1'"
      }
    },
    "parent_id": {
      "type": ["string", "number", "null"],
      "pattern": "^[0-9]+$",
      "default": null,
      "errorMessage": {
        "type": "Parent ID must be a string, number, or null",
        "pattern": "Parent ID must be a valid numeric ID"
      }
    },
    "position": {
      "type": ["string", "integer"],
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Position must be a string or number",
        "pattern": "Position must be a valid number (e.g., 0, 1, 10)"
      }
    }
  },
  "required": [
    "name",
    "description",
    "status",
    "meta_title",
    "meta_description"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "required": {
      "name": "Category name is required",
      "description": "Category description is required",
      "status": "Category status is required",
      "meta_title": "Meta title is required",
      "meta_description": "Meta description is required"
    }
  }
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

### Get Category Data with GraphQL

EverShop uses GraphQL for querying category data. For detailed information on how to query categories, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
