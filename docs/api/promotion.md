---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Promotion API
  - Coupon API
  - E-commerce API
  - Discount API
sidebar_label: Promotion
title: Promotion REST API
description: Use the EverShop REST API to manage promotions and coupons - create, update, delete, and apply promotional discounts to customer orders.
---

# Promotion API

The Promotion API allows you to programmatically manage promotional offers and discount coupons in your EverShop store. This RESTful interface provides endpoints for creating, updating, deleting, and applying coupons.

## Endpoints

### Create a Coupon

Creates a new discount coupon in your EverShop store with the specified attributes.

import Api from '@site/src/components/rest/Api';

<Api
method="POST"
url="/api/coupons"
requestSchema={{
  "type": "object",
  "properties": {
    "coupon": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9]+$",
      "minLength": 1,
      "errorMessage": {
        "type": "Coupon code must be a string",
        "pattern": "Coupon code can only contain letters and numbers (a-z, A-Z, 0-9)",
        "minLength": "Coupon code is required and cannot be empty"
      }
    },
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1],
      "errorMessage": {
        "type": "Status must be a string or number",
        "enum": "Status must be either 0, 1, '0', or '1'"
      }
    },
    "description": {
      "type": "string",
      "errorMessage": {
        "type": "Description must be a string"
      }
    },
    "discount_amount": {
      "type": ["string", "number"],
      "pattern": "^\\d*\\.?\\d*$",
      "errorMessage": {
        "type": "Discount amount must be a string or number",
        "pattern": "Discount amount must be a valid number (e.g., 10, 10.5, 10.99)"
      }
    },
    "free_shipping": {
      "type": ["string", "integer", "boolean"],
      "enum": ["0", "1", 0, 1, true, false],
      "errorMessage": {
        "type": "Free shipping must be a boolean, number, or string",
        "enum": "Free shipping must be either 0, 1, '0', '1', true, or false"
      }
    },
    "discount_type": {
      "type": "string",
      "errorMessage": {
        "type": "Discount type must be a string"
      }
    },
    "target_products": {
      "type": "object",
      "properties": {
        "maxQty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Max quantity must be a string or number",
            "pattern": "Max quantity must be a valid whole number (e.g., 1, 10, 100)"
          }
        },
        "products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string",
                "errorMessage": {
                  "type": "Product condition key must be a string"
                }
              },
              "operator": {
                "type": "string",
                "enum": ["IN", "NOT IN", "=", "!=", ">", ">=", "<", "<="],
                "errorMessage": {
                  "type": "Operator must be a string",
                  "enum": "Operator must be one of: IN, NOT IN, =, !=, >, >=, <, <="
                }
              },
              "value": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "number"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": [
                        "string",
                        "number",
                        "boolean",
                        "null",
                        "array",
                        "object"
                      ]
                    }
                  }
                ],
                "errorMessage": {
                  "anyOf": "Value must be a string, number, or array"
                }
              }
            },
            "required": ["key", "operator", "value"],
            "additionalProperties": true,
            "errorMessage": {
              "type": "Product condition must be an object",
              "required": {
                "key": "Product condition key is required",
                "operator": "Product condition operator is required",
                "value": "Product condition value is required"
              }
            }
          },
          "errorMessage": {
            "type": "Products must be an array"
          }
        }
      },
      "errorMessage": {
        "type": "Target products must be an object"
      }
    },
    "condition": {
      "type": "object",
      "properties": {
        "order_total": {
          "type": ["string", "number"],
          "pattern": "^\\d*\\.?\\d*$",
          "errorMessage": {
            "type": "Order total must be a string or number",
            "pattern": "Order total must be a valid number (e.g., 100, 100.50)"
          }
        },
        "order_qty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Order quantity must be a string or number",
            "pattern": "Order quantity must be a valid whole number (e.g., 1, 5, 10)"
          }
        },
        "required_products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string",
                "errorMessage": {
                  "type": "Required product key must be a string"
                }
              },
              "operator": {
                "type": "string",
                "enum": ["IN", "NOT IN", "=", "!=", ">", ">=", "<", "<="],
                "errorMessage": {
                  "type": "Operator must be a string",
                  "enum": "Operator must be one of: IN, NOT IN, =, !=, >, >=, <, <="
                }
              },
              "qty": {
                "type": ["string", "integer"],
                "pattern": "^[0-9]*$",
                "errorMessage": {
                  "type": "Quantity must be a string or number",
                  "pattern": "Quantity must be a valid whole number (e.g., 1, 5, 10)"
                }
              },
              "value": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "number"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": [
                        "string",
                        "number",
                        "boolean",
                        "null",
                        "array",
                        "object"
                      ]
                    }
                  }
                ],
                "errorMessage": {
                  "anyOf": "Value must be a string, number, or array"
                }
              }
            },
            "required": ["key", "qty", "operator", "value"],
            "additionalProperties": true,
            "errorMessage": {
              "type": "Required product condition must be an object",
              "required": {
                "key": "Required product key is required",
                "qty": "Required product quantity is required",
                "operator": "Required product operator is required",
                "value": "Required product value is required"
              }
            }
          },
          "errorMessage": {
            "type": "Required products must be an array"
          }
        },
        "additionalProperties": true
      },
      "errorMessage": {
        "type": "Condition must be an object"
      }
    },
    "user_condition": {
      "type": "object",
      "properties": {
        "groups": {
          "type": "array",
          "items": {
            "type": ["string", "integer"],
            "pattern": "^[0-9]*$",
            "errorMessage": {
              "type": "Group ID must be a string or number",
              "pattern": "Group ID must be a valid number"
            }
          },
          "errorMessage": {
            "type": "Customer groups must be an array"
          }
        },
        "emails": {
          "type": "array",
          "items": {
            "type": "string",
            "errorMessage": {
              "type": "Email must be a string"
            }
          },
          "errorMessage": {
            "type": "Customer emails must be an array"
          }
        },
        "purchased": {
          "type": "number",
          "errorMessage": {
            "type": "Purchased amount must be a number"
          }
        }
      },
      "additionalProperties": true,
      "errorMessage": {
        "type": "User condition must be an object"
      }
    },
    "max_uses_time_per_coupon": {
      "type": "string",
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Max uses per coupon must be a string",
        "pattern": "Max uses per coupon must be a valid number (e.g., 1, 10, 100)"
      }
    },
    "max_uses_time_per_customer": {
      "type": "string",
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Max uses per customer must be a string",
        "pattern": "Max uses per customer must be a valid number (e.g., 1, 5, 10)"
      }
    },
    "start_date": {
      "anyOf": [
        { "type": "string", "format": "date" },
        { "type": "string", "maxLength": 0 },
        { "type": "null" }
      ],
      "default": null,
      "errorMessage": {
        "anyOf": "Start date must be a valid date string, empty string, or null (e.g., 2025-01-01)"
      }
    },
    "end_date": {
      "anyOf": [
        { "type": "string", "format": "date" },
        { "type": "string", "maxLength": 0 },
        { "type": "null" }
      ],
      "default": null,
      "errorMessage": {
        "anyOf": "End date must be a valid date string, empty string, or null (e.g., 2025-12-31)"
      }
    }
  },
  "buyx_gety": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "buy_qty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Buy quantity must be a string or number",
            "pattern": "Buy quantity must be a valid whole number (e.g., 1, 2, 5)"
          }
        },
        "get_qty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Get quantity must be a string or number",
            "pattern": "Get quantity must be a valid whole number (e.g., 1, 2, 5)"
          }
        },
        "max_y": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Max Y must be a string or number",
            "pattern": "Max Y must be a valid whole number (e.g., 1, 5, 10)"
          }
        },
        "sku": {
          "type": "string",
          "minLength": 1,
          "errorMessage": {
            "type": "SKU must be a string",
            "minLength": "SKU is required and cannot be empty"
          }
        }
      },
      "required": ["buy_qty", "get_qty", "max_y", "sku"],
      "additionalProperties": true,
      "errorMessage": {
        "type": "Buy X Get Y item must be an object",
        "required": {
          "buy_qty": "Buy quantity is required",
          "get_qty": "Get quantity is required",
          "max_y": "Max Y is required",
          "sku": "SKU is required"
        }
      }
    },
    "errorMessage": {
      "type": "Buy X Get Y must be an array"
    }
  },
  "start_date": {
    "type": "string",
    "format": "date",
    "errorMessage": {
      "type": "Start date must be a string",
      "format": "Start date must be a valid date (e.g., 2025-01-01)"
    }
  },
  "end_date": {
    "type": "string",
    "format": "date",
    "errorMessage": {
      "type": "End date must be a string",
      "format": "End date must be a valid date (e.g., 2025-12-31)"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "coupon_id": 30,
    "uuid": "d63601a5a67311edb46b60d819134f39",
    "status": 1,
    "description": "y2RFMOdn9LuiUtob5n1c",
    "discount_amount": 10,
    "free_shipping": 0,
    "discount_type": "fixed_discount_to_entire_order",
    "coupon": "y2RFMOdn9LuiUtob5n1c",
    "used_time": 0,
    "target_products": null,
    "condition": null,
    "user_condition": null,
    "buyx_gety": null,
    "max_uses_time_per_coupon": null,
    "max_uses_time_per_customer": null,
    "start_date": null,
    "end_date": null,
    "created_at": "2023-02-07 15:07:53",
    "updated_at": "2023-02-07 15:07:53",
    "links": [
      {
        "rel": "couponGrid",
        "href": "/admin/coupons",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/coupon/edit/d63601a5a67311edb46b60d819134f39",
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

### Update a Coupon

Updates an existing coupon with new attribute values.

<Api
method="PATCH"
url="/api/coupons/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "coupon": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9]+$",
      "minLength": 1,
      "errorMessage": {
        "type": "Coupon code must be a string",
        "pattern": "Coupon code can only contain letters and numbers (a-z, A-Z, 0-9)",
        "minLength": "Coupon code is required and cannot be empty"
      }
    },
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1],
      "errorMessage": {
        "type": "Status must be a string or number",
        "enum": "Status must be either 0, 1, '0', or '1'"
      }
    },
    "description": {
      "type": "string",
      "errorMessage": {
        "type": "Description must be a string"
      }
    },
    "discount_amount": {
      "type": ["string", "number"],
      "pattern": "^\\d*\\.?\\d*$",
      "errorMessage": {
        "type": "Discount amount must be a string or number",
        "pattern": "Discount amount must be a valid number (e.g., 10, 10.5, 10.99)"
      }
    },
    "free_shipping": {
      "type": ["string", "integer", "boolean"],
      "enum": ["0", "1", 0, 1, true, false],
      "errorMessage": {
        "type": "Free shipping must be a boolean, number, or string",
        "enum": "Free shipping must be either 0, 1, '0', '1', true, or false"
      }
    },
    "discount_type": {
      "type": "string",
      "errorMessage": {
        "type": "Discount type must be a string"
      }
    },
    "target_products": {
      "type": "object",
      "properties": {
        "maxQty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Max quantity must be a string or number",
            "pattern": "Max quantity must be a valid whole number (e.g., 1, 10, 100)"
          }
        },
        "products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string",
                "errorMessage": {
                  "type": "Product condition key must be a string"
                }
              },
              "operator": {
                "type": "string",
                "enum": ["IN", "NOT IN", "=", "!=", ">", ">=", "<", "<="],
                "errorMessage": {
                  "type": "Operator must be a string",
                  "enum": "Operator must be one of: IN, NOT IN, =, !=, >, >=, <, <="
                }
              },
              "value": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "number"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": [
                        "string",
                        "number",
                        "boolean",
                        "null",
                        "array",
                        "object"
                      ]
                    }
                  }
                ],
                "errorMessage": {
                  "anyOf": "Value must be a string, number, or array"
                }
              }
            },
            "required": ["key", "operator", "value"],
            "additionalProperties": true,
            "errorMessage": {
              "type": "Product condition must be an object",
              "required": {
                "key": "Product condition key is required",
                "operator": "Product condition operator is required",
                "value": "Product condition value is required"
              }
            }
          },
          "errorMessage": {
            "type": "Products must be an array"
          }
        }
      },
      "errorMessage": {
        "type": "Target products must be an object"
      }
    },
    "condition": {
      "type": "object",
      "properties": {
        "order_total": {
          "type": ["string", "number"],
          "pattern": "^\\d*\\.?\\d*$",
          "errorMessage": {
            "type": "Order total must be a string or number",
            "pattern": "Order total must be a valid number (e.g., 100, 100.50)"
          }
        },
        "order_qty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Order quantity must be a string or number",
            "pattern": "Order quantity must be a valid whole number (e.g., 1, 5, 10)"
          }
        },
        "required_products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string",
                "errorMessage": {
                  "type": "Required product key must be a string"
                }
              },
              "operator": {
                "type": "string",
                "enum": ["IN", "NOT IN", "=", "!=", ">", ">=", "<", "<="],
                "errorMessage": {
                  "type": "Operator must be a string",
                  "enum": "Operator must be one of: IN, NOT IN, =, !=, >, >=, <, <="
                }
              },
              "qty": {
                "type": ["string", "integer"],
                "pattern": "^[0-9]*$",
                "errorMessage": {
                  "type": "Quantity must be a string or number",
                  "pattern": "Quantity must be a valid whole number (e.g., 1, 5, 10)"
                }
              },
              "value": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "number"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": [
                        "string",
                        "number",
                        "boolean",
                        "null",
                        "array",
                        "object"
                      ]
                    }
                  }
                ],
                "errorMessage": {
                  "anyOf": "Value must be a string, number, or array"
                }
              }
            },
            "required": ["key", "qty", "operator", "value"],
            "additionalProperties": true,
            "errorMessage": {
              "type": "Required product condition must be an object",
              "required": {
                "key": "Required product key is required",
                "qty": "Required product quantity is required",
                "operator": "Required product operator is required",
                "value": "Required product value is required"
              }
            }
          },
          "errorMessage": {
            "type": "Required products must be an array"
          }
        },
        "additionalProperties": true
      },
      "errorMessage": {
        "type": "Condition must be an object"
      }
    },
    "user_condition": {
      "type": "object",
      "properties": {
        "groups": {
          "type": "array",
          "items": {
            "type": ["string", "integer"],
            "pattern": "^[0-9]*$",
            "errorMessage": {
              "type": "Group ID must be a string or number",
              "pattern": "Group ID must be a valid number"
            }
          },
          "errorMessage": {
            "type": "Customer groups must be an array"
          }
        },
        "emails": {
          "type": "array",
          "items": {
            "type": "string",
            "errorMessage": {
              "type": "Email must be a string"
            }
          },
          "errorMessage": {
            "type": "Customer emails must be an array"
          }
        },
        "purchased": {
          "type": "number",
          "errorMessage": {
            "type": "Purchased amount must be a number"
          }
        }
      },
      "additionalProperties": true,
      "errorMessage": {
        "type": "User condition must be an object"
      }
    },
    "max_uses_time_per_coupon": {
      "type": "string",
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Max uses per coupon must be a string",
        "pattern": "Max uses per coupon must be a valid number (e.g., 1, 10, 100)"
      }
    },
    "max_uses_time_per_customer": {
      "type": "string",
      "pattern": "^[0-9]*$",
      "errorMessage": {
        "type": "Max uses per customer must be a string",
        "pattern": "Max uses per customer must be a valid number (e.g., 1, 5, 10)"
      }
    },
    "start_date": {
      "anyOf": [
        { "type": "string", "format": "date" },
        { "type": "string", "maxLength": 0 },
        { "type": "null" }
      ],
      "default": null,
      "errorMessage": {
        "anyOf": "Start date must be a valid date string, empty string, or null (e.g., 2025-01-01)"
      }
    },
    "end_date": {
      "anyOf": [
        { "type": "string", "format": "date" },
        { "type": "string", "maxLength": 0 },
        { "type": "null" }
      ],
      "default": null,
      "errorMessage": {
        "anyOf": "End date must be a valid date string, empty string, or null (e.g., 2025-12-31)"
      }
    }
  },
  "buyx_gety": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "buy_qty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Buy quantity must be a string or number",
            "pattern": "Buy quantity must be a valid whole number (e.g., 1, 2, 5)"
          }
        },
        "get_qty": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Get quantity must be a string or number",
            "pattern": "Get quantity must be a valid whole number (e.g., 1, 2, 5)"
          }
        },
        "max_y": {
          "type": ["string", "integer"],
          "pattern": "^[0-9]*$",
          "errorMessage": {
            "type": "Max Y must be a string or number",
            "pattern": "Max Y must be a valid whole number (e.g., 1, 5, 10)"
          }
        },
        "sku": {
          "type": "string",
          "minLength": 1,
          "errorMessage": {
            "type": "SKU must be a string",
            "minLength": "SKU is required and cannot be empty"
          }
        }
      },
      "required": ["buy_qty", "get_qty", "max_y", "sku"],
      "additionalProperties": true,
      "errorMessage": {
        "type": "Buy X Get Y item must be an object",
        "required": {
          "buy_qty": "Buy quantity is required",
          "get_qty": "Get quantity is required",
          "max_y": "Max Y is required",
          "sku": "SKU is required"
        }
      }
    },
    "errorMessage": {
      "type": "Buy X Get Y must be an array"
    }
  },
  "start_date": {
    "type": "string",
    "format": "date",
    "errorMessage": {
      "type": "Start date must be a string",
      "format": "Start date must be a valid date (e.g., 2025-01-01)"
    }
  },
  "end_date": {
    "type": "string",
    "format": "date",
    "errorMessage": {
      "type": "End date must be a string",
      "format": "End date must be a valid date (e.g., 2025-12-31)"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "coupon_id": 30,
    "uuid": "d63601a5a67311edb46b60d819134f39",
    "status": 1,
    "description": "y2RFMOdn9LuiUtob5n1c",
    "discount_amount": 10,
    "free_shipping": 0,
    "discount_type": "fixed_discount_to_entire_order",
    "coupon": "y2RFMOdn9LuiUtob5n1c",
    "used_time": 0,
    "target_products": null,
    "condition": null,
    "user_condition": null,
    "buyx_gety": null,
    "max_uses_time_per_coupon": null,
    "max_uses_time_per_customer": null,
    "start_date": null,
    "end_date": null,
    "created_at": "2023-02-07 15:07:53",
    "updated_at": "2023-02-07 15:07:53",
    "links": [
      {
        "rel": "couponGrid",
        "href": "/admin/coupons",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/coupon/edit/d63601a5a67311edb46b60d819134f39",
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
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>string</td>
      <td>Yes</td>
      <td>The UUID of the coupon to update</td>
    </tr>
  </tbody>
</table>

<hr />

### Delete a Coupon

Removes a coupon from your EverShop store.

<Api
method="DELETE"
url="/api/coupons/{id}"
responseSample={`{
  "data": {
    "coupon_id": 30,
    "uuid": "d63601a5a67311edb46b60d819134f39",
    "status": 1,
    "description": "TRNfYH0X7kQL4Evddsy6",
    "discount_amount": 20,
    "free_shipping": 0,
    "discount_type": "fixed_discount_to_entire_order",
    "coupon": "TRNfYH0X7kQL4Evddsy6",
    "used_time": 0,
    "target_products": null,
    "condition": null,
    "user_condition": null,
    "buyx_gety": null,
    "max_uses_time_per_coupon": null,
    "max_uses_time_per_customer": null,
    "start_date": null,
    "end_date": null,
    "created_at": "2023-02-07 15:07:53",
    "updated_at": "2023-02-07 15:07:53"
  }
}`}
/>

### Path Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>string</td>
      <td>Yes</td>
      <td>The UUID of the coupon to delete</td>
    </tr>
  </tbody>
</table>

### Apply a Coupon

Applies a coupon code to a specific shopping cart.

<Api
method="POST"
url="/api/carts/{cart_id}/coupons"
requestSchema={{
  "type": "object",
  "properties": {
    "coupon": {
      "type": "string"
    }
  },
  "required": [
    "coupon"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "coupon": "Coupon is invalid"
    }
  }
}}
responseSample={`{
    "data": {
      "coupon": "coupon"
    }
}`}
/>

### Path Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>cart_id</td>
      <td>string</td>
      <td>Yes</td>
      <td>The UUID of the cart to apply the coupon to</td>
    </tr>
  </tbody>
</table>

### Remove a Coupon from Cart

Removes a previously applied coupon from a shopping cart.

<Api
method="DELETE"
url="/api/carts/{cart_id}/coupons/{coupon}"
responseSample={`{
  "data": {
    "success": true
  }
}`}
/>

### Path Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>cart_id</td>
      <td>string</td>
      <td>Yes</td>
      <td>The UUID of the cart</td>
    </tr>
    <tr>
      <td>coupon</td>
      <td>string</td>
      <td>Yes</td>
      <td>The coupon code to remove from the cart</td>
    </tr>
  </tbody>
</table>

#### Discount Types

EverShop supports various discount types that can be specified in the `discount_type` parameter:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Discount Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>fixed_discount_to_entire_order</td>
      <td>Applies a fixed amount discount to the entire order</td>
    </tr>
    <tr>
      <td>percentage_discount_to_entire_order</td>
      <td>Applies a percentage discount to the entire order</td>
    </tr>
    <tr>
      <td>fixed_discount_to_specific_products</td>
      <td>Applies a fixed amount discount to specific products only</td>
    </tr>
    <tr>
      <td>percentage_discount_to_specific_products</td>
      <td>Applies a percentage discount to specific products only</td>
    </tr>
    <tr>
      <td>buy_x_get_y</td>
      <td>Buy X quantity of products, get Y quantity free</td>
    </tr>
  </tbody>
</table>
