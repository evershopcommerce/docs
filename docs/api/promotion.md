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

## Create a Coupon

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
      "pattern": "^[a-zA-Z0-9]+$"
    },
    "status": {
      "type": [
        "string",
        "integer"
      ],
      "enum": [
        "0",
        "1",
        0,
        1
      ]
    },
    "description": {
      "type": "string"
    },
    "discount_amount": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^\\d*\\.?\\d*$"
    },
    "free_shipping": {
      "type": [
        "string",
        "integer"
      ],
      "enum": [
        "0",
        "1",
        0,
        1
      ]
    },
    "discount_type": {
      "type": "string"
    },
    "target_products": {
      "type": "object",
      "properties": {
        "maxQty": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string"
              },
              "operator": {
                "type": "string",
                "enum": [
                  "IN",
                  "NOT IN",
                  "=",
                  "!=",
                  ">",
                  ">=",
                  "<",
                  "<="
                ]
              },
              "value": {
                "type": [
                  "string",
                  "number"
                ],
                "pattern": "^\\d*\\.?\\d*$"
              }
            },
            "required": [
              "key",
              "operator",
              "value"
            ],
            "additionalProperties": true
          }
        }
      }
    },
    "condition": {
      "type": "object",
      "properties": {
        "order_total": {
          "type": [
            "string",
            "number"
          ],
          "pattern": "^\\d*\\.?\\d*$"
        },
        "order_qty": {
          "type": [
            "string",
            "integer"
          ],
          "format": "digits"
        },
        "required_products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string"
              },
              "operator": {
                "type": "string",
                "enum": [
                  "IN",
                  "NOT IN",
                  "=",
                  "!=",
                  ">",
                  ">=",
                  "<",
                  "<="
                ]
              },
              "qty": {
                "type": [
                  "string",
                  "integer"
                ],
                "pattern": "^[0-9]*$"
              },
              "value": {
                "type": [
                  "string",
                  "number"
                ],
                "pattern": "^\\d*\\.?\\d*$"
              }
            },
            "required": [
              "key",
              "qty",
              "operator",
              "value"
            ],
            "additionalProperties": true
          }
        },
        "additionalProperties": true
      }
    },
    "user_condition": {
      "type": "object",
      "properties": {
        "groups": {
          "type": "array",
          "items": {
            "type": [
              "string",
              "integer"
            ],
            "pattern": "^[0-9]*$"
          }
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "purchased": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^\\d*\\.?\\d*$"
        }
      },
      "additionalProperties": true
    },
    "max_uses_time_per_coupon": {
      "type": "string",
      "pattern": "^[0-9]*$"
    },
    "max_uses_time_per_customer": {
      "type": "string",
      "pattern": "integer"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    },
    "end_date": {
      "type": "string",
      "format": "date"
    }
  },
  "buyx_gety": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "buy_qty": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "get_qty": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "max_y": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "sku": {
          "type": "string"
        }
      },
      "required": [
        "buy_qty",
        "get_qty",
        "max_y",
        "sku"
      ],
      "additionalProperties": true
    }
  },
  "start_date": {
    "type": "string",
    "format": "date"
  },
  "end_date": {
    "type": "string",
    "format": "date"
  },
  "required": [
    "coupon",
    "status",
    "discount_amount",
    "discount_type"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "coupon": "Coupon is invalid",
      "status": "Status is invalid",
      "discount_amount": "Discount amount is invalid"
    }
  }
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

## Update a Coupon

Updates an existing coupon with new attribute values.

<Api
method="PATCH"
url="/api/coupons/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "coupon": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9]+$"
    },
    "status": {
      "type": [
        "string",
        "integer"
      ],
      "enum": [
        "0",
        "1",
        0,
        1
      ]
    },
    "description": {
      "type": "string"
    },
    "discount_amount": {
      "type": [
        "string",
        "number"
      ],
      "pattern": "^\\d*\\.?\\d*$"
    },
    "free_shipping": {
      "type": [
        "string",
        "integer"
      ],
      "enum": [
        "0",
        "1",
        0,
        1
      ]
    },
    "discount_type": {
      "type": "string"
    },
    "target_products": {
      "type": "object",
      "properties": {
        "maxQty": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string"
              },
              "operator": {
                "type": "string",
                "enum": [
                  "IN",
                  "NOT IN",
                  "=",
                  "!=",
                  ">",
                  ">=",
                  "<",
                  "<="
                ]
              },
              "value": {
                "type": [
                  "string",
                  "number"
                ],
                "pattern": "^\\d*\\.?\\d*$"
              }
            },
            "required": [
              "key",
              "operator",
              "value"
            ],
            "additionalProperties": true
          }
        }
      }
    },
    "condition": {
      "type": "object",
      "properties": {
        "order_total": {
          "type": [
            "string",
            "number"
          ],
          "pattern": "^\\d*\\.?\\d*$"
        },
        "order_qty": {
          "type": [
            "string",
            "integer"
          ],
          "format": "digits"
        },
        "required_products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string"
              },
              "operator": {
                "type": "string",
                "enum": [
                  "IN",
                  "NOT IN",
                  "=",
                  "!=",
                  ">",
                  ">=",
                  "<",
                  "<="
                ]
              },
              "qty": {
                "type": [
                  "string",
                  "integer"
                ],
                "pattern": "^[0-9]*$"
              },
              "value": {
                "type": [
                  "string",
                  "number"
                ],
                "pattern": "^\\d*\\.?\\d*$"
              }
            },
            "required": [
              "key",
              "qty",
              "operator",
              "value"
            ],
            "additionalProperties": true
          }
        },
        "additionalProperties": true
      }
    },
    "user_condition": {
      "type": "object",
      "properties": {
        "groups": {
          "type": "array",
          "items": {
            "type": [
              "string",
              "integer"
            ],
            "pattern": "^[0-9]*$"
          }
        },
        "emails": {
          "type": "string"
        },
        "purchased": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^\\d*\\.?\\d*$"
        }
      },
      "additionalProperties": true
    },
    "max_uses_time_per_coupon": {
      "type": "string",
      "pattern": "^[0-9]*$"
    },
    "max_uses_time_per_customer": {
      "type": "string",
      "pattern": "integer"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    },
    "end_date": {
      "type": "string",
      "format": "date"
    }
  },
  "buyx_gety": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "buy_qty": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "get_qty": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "max_y": {
          "type": [
            "string",
            "integer"
          ],
          "pattern": "^[0-9]*$"
        },
        "sku": {
          "type": "string"
        }
      },
      "required": [
        "buy_qty",
        "get_qty",
        "max_y",
        "sku"
      ],
      "additionalProperties": true
    }
  },
  "start_date": {
    "type": "string",
    "format": "date"
  },
  "end_date": {
    "type": "string",
    "format": "date"
  },
  "required": [
    "coupon"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "coupon": "Coupon is invalid",
      "status": "Status is invalid",
      "discount_amount": "Discount amount is invalid"
    }
  }
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

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| id        | string | Yes      | The UUID of the coupon to update |

<hr />

## Delete a Coupon

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

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| id        | string | Yes      | The UUID of the coupon to delete |

## Apply a Coupon

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

| Parameter | Type   | Required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| cart_id   | string | Yes      | The UUID of the cart to apply the coupon to |

## Get a Coupon

Retrieves detailed information about a specific coupon.

<Api
method="GET"
url="/api/coupons/{id}"
responseSample={`{
  "data": {
    "coupon_id": 30,
    "uuid": "d63601a5a67311edb46b60d819134f39",
    "status": 1,
    "description": "Summer Sale Discount",
    "discount_amount": 10,
    "free_shipping": 0,
    "discount_type": "fixed_discount_to_entire_order",
    "coupon": "SUMMER10",
    "used_time": 5,
    "target_products": null,
    "condition": {
      "order_total": 50
    },
    "user_condition": null,
    "buyx_gety": null,
    "max_uses_time_per_coupon": "100",
    "max_uses_time_per_customer": "1",
    "start_date": "2023-06-01",
    "end_date": "2023-08-31",
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

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| id        | string | Yes      | The UUID of the coupon to retrieve |

## List Coupons

Retrieves a paginated list of coupons from your EverShop store.

<Api
method="GET"
url="/api/coupons"
responseSample={`{
  "data": [
    {
      "coupon_id": 30,
      "uuid": "d63601a5a67311edb46b60d819134f39",
      "status": 1,
      "description": "Summer Sale Discount",
      "discount_amount": 10,
      "free_shipping": 0,
      "discount_type": "fixed_discount_to_entire_order",
      "coupon": "SUMMER10",
      "used_time": 5,
      "max_uses_time_per_coupon": "100",
      "start_date": "2023-06-01",
      "end_date": "2023-08-31",
      "links": [
        {
          "rel": "edit",
          "href": "/admin/coupon/edit/d63601a5a67311edb46b60d819134f39",
          "action": "GET",
          "types": [
            "text/xml"
          ]
        }
      ]
    },
    // More coupons...
  ],
  "total": 8,
  "currentPage": 1,
  "limit": 20,
  "links": [
    {
      "rel": "first",
      "href": "/api/coupons?page=1",
      "action": "GET"
    },
    {
      "rel": "last",
      "href": "/api/coupons?page=1",
      "action": "GET"
    }
  ]
}`}
/>

### Query Parameters

| Parameter | Type    | Required | Description                                        |
| --------- | ------- | -------- | -------------------------------------------------- |
| page      | integer | No       | Page number for pagination (default: 1)            |
| limit     | integer | No       | Number of coupons per page (default: 20, max: 100) |
| sort      | string  | No       | Field to sort by (e.g., "coupon", "created_at")    |
| order     | string  | No       | Sort order ("asc" or "desc")                       |
| status    | integer | No       | Filter by status (0 = disabled, 1 = enabled)       |
| coupon    | string  | No       | Filter by coupon code                              |
| keyword   | string  | No       | Search coupons by keyword                          |

## Remove a Coupon from Cart

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

| Parameter | Type   | Required | Description                             |
| --------- | ------ | -------- | --------------------------------------- |
| cart_id   | string | Yes      | The UUID of the cart                    |
| coupon    | string | Yes      | The coupon code to remove from the cart |

## Discount Types

EverShop supports various discount types that can be specified in the `discount_type` parameter:

| Discount Type                            | Description                                               |
| ---------------------------------------- | --------------------------------------------------------- |
| fixed_discount_to_entire_order           | Applies a fixed amount discount to the entire order       |
| percentage_discount_to_entire_order      | Applies a percentage discount to the entire order         |
| fixed_discount_to_specific_products      | Applies a fixed amount discount to specific products only |
| percentage_discount_to_specific_products | Applies a percentage discount to specific products only   |
| buy_x_get_y                              | Buy X quantity of products, get Y quantity free           |

## Troubleshooting

### Common Error Codes

| Status Code | Description      | Solution                                      |
| ----------- | ---------------- | --------------------------------------------- |
| 400         | Bad Request      | Check your request payload for invalid data   |
| 401         | Unauthorized     | Ensure your API credentials are correct       |
| 404         | Not Found        | Verify the coupon ID exists                   |
| 409         | Conflict         | The coupon code may already be in use         |
| 422         | Validation Error | The coupon conditions are not met by the cart |
| 500         | Server Error     | Contact support if the issue persists         |
