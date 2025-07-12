---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Shopping Cart
  - E-commerce API
  - REST API
  - Checkout Process
sidebar_label: Cart
title: Cart REST API
description: Comprehensive guide to managing shopping carts in EverShop using the Cart REST API. Learn how to create carts, add items, manage customer information, and configure checkout options.
---

# Cart API

## Overview

The Cart API provides endpoints for managing shopping carts in your EverShop store. These endpoints allow you to create carts, add or remove items, set customer information, specify shipping and billing addresses, and select shipping and payment methods.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create a New Cart

Creates a new shopping cart in the system. You can optionally include customer information and initial cart items.

<Api
method="POST"
url="/api/carts"
requestSchema={{
"type": "object",
"properties": {
"customer_full_name": {
"type": "string",
"description": "Full name of the customer"
},
"customer_email": {
"type": ["string"],
"format": "email",
"description": "Email address of the customer",
"errorMessage": {
"type": "Email is invalid"
}
},
"items": {
"type": "array",
"description": "Array of items to add to the cart",
"items": {
"type": "object",
"properties": {
"sku": {
"type": "string",
"description": "Product SKU to add to cart"
},
"qty": {
"type": "integer",
"description": "Quantity of the product to add"
}
},
"required": ["sku", "qty"],
"additionalProperties": true,
"errorMessage": {
"properties": {
"sku": "Sku is required",
"qty": "Qty is invalid"
}
}
}
}
},
"required": ["items"],
"errorMessage": {
"required": {
"items": "Must provide at least one item"
}
},
"additionalProperties": true
}
}
responseSample={`{
  "data": {
    "items": {
      "cart_item_id": "2sl0ifz1etgldt28vm9",
      "uuid": "4a6e5c9e0062489e82a472aeda0211be",
      "product_id": 2,
      "product_sku": "NJC90842-Blue-S",
      "group_id": 1,
      "product_name": "Lite racer adapt 3.0 shoes",
      "thumbnail": "/assets/catalog/7385/1316/plv1138-Blue-thumb.png",
      "product_weight": 5.4,
      "product_price": 823,
      "product_price_incl_tax": 823,
      "qty": 10,
      "final_price": 823,
      "tax_percent": 0,
      "tax_amount": 0,
      "final_price_incl_tax": 823,
      "variant_group_id": 62,
      "variant_options": "[{\"attribute_code\":\"size\",\"attribute_name\":\"Size\",\"attribute_id\":2,\"option_id\":25,\"option_text\":\"S\"},{\"attribute_code\":\"color\",\"attribute_name\":\"Color\",\"attribute_id\":3,\"option_id\":8,\"option_text\":\"Blue\"}]",
      "product_custom_options": null,
      "productUrl": "/product/lite-racer-adapt-3.0-shoes",
      "removeUrl": "/api/cart/mine/items/4a6e5c9e0062489e82a472aeda0211be",
      "discount_amount": 0,
      "total": 8230
    },
    "count": 3,
    "cartId": "251ca17e754f4473a9bdf97c85509a4a"
  }
}`}
isPrivate={false}
/>

<hr />

### Add Item to Cart

Adds a product to an existing cart. Specify the product SKU and quantity to add.

<Api
method="POST"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f/items"
requestSchema={{
  "type": "object",
  "properties": {
    "sku": {
      "type": "string",
      "description": "Product SKU to add to cart"
    },
    "qty": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[1-9][0-9]*$",
      "description": "Quantity of the product to add (must be positive)"
    }
  },
  "required": [
    "sku",
    "qty"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "sku": "Sku is required",
      "qty": "Qty is invalid"
    }
  }
}}
responseSample={`{
  "data": {
    "item": [
      {
        "cart_item_id": "2sl0ifz1etgldt28vm9",
        "uuid": "4a6e5c9e0062489e82a472aeda0211be",
        "product_id": 2,
        "product_sku": "NJC90842-Blue-S",
        "group_id": 1,
        "product_name": "Lite racer adapt 3.0 shoes",
        "thumbnail": "/assets/catalog/7385/1316/plv1138-Blue-thumb.png",
        "product_weight": 5.4,
        "product_price": 823,
        "product_price_incl_tax": 823,
        "qty": 10,
        "final_price": 823,
        "tax_percent": 0,
        "tax_amount": 0,
        "final_price_incl_tax": 823,
        "variant_group_id": 62,
        "variant_options": "[{\"attribute_code\":\"size\",\"attribute_name\":\"Size\",\"attribute_id\":2,\"option_id\":25,\"option_text\":\"S\"},{\"attribute_code\":\"color\",\"attribute_name\":\"Color\",\"attribute_id\":3,\"option_id\":8,\"option_text\":\"Blue\"}]",
        "product_custom_options": null,
        "productUrl": "/product/lite-racer-adapt-3.0-shoes",
        "removeUrl": "/api/cart/mine/items/4a6e5c9e0062489e82a472aeda0211be",
        "discount_amount": 0,
        "total": 8230
      }
    ],
    "count": 3,
    "cartId": "251ca17e754f4473a9bdf97c85509a4a"
  }
}`}
isPrivate={false}
/>

<hr />

### Remove Item from Cart

Removes a specific item from the cart. Requires the cart ID and the item ID to be removed.

<Api
method="DELETE"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f/items/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "item": {
      "cart_item_id": 1138,
      "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
      "product_id": 1,
      "product_sku": "NJC90842-Blue-X",
      "group_id": 1,
      "product_name": "Lite racer adapt 3.0 shoes",
      "thumbnail": "/assets/catalog/1817/5605/plv1138-Blue-thumb.png",
      "product_weight": 5.4,
      "product_price": 823,
      "product_price_incl_tax": 823,
      "qty": 10,
      "final_price": 823,
      "tax_percent": 0,
      "tax_amount": 0,
      "final_price_incl_tax": 823,
      "variant_group_id": 62,
      "variant_options": "[{\"attribute_code\":\"size\",\"attribute_name\":\"Size\",\"attribute_id\":2,\"option_id\":4,\"option_text\":\"X\"},{\"attribute_code\":\"color\",\"attribute_name\":\"Color\",\"attribute_id\":3,\"option_id\":8,\"option_text\":\"Blue\"}]",
      "product_custom_options": null,
      "productUrl": "/product/lite-racer-adapt-3.0-shoes",
      "removeUrl": "/api/cart/mine/items/19fa0c23bbd24edeaa3885940cf59f80",
      "discount_amount": 0,
      "total": 8230
    }
  }
}`}
isPrivate={false}
/>

<hr />

### Add Customer Information

Associates a customer email with the cart. This is a required step in the checkout process before adding addresses.

<Api
method="POST"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f/contacts"
requestSchema={{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "Customer's email address"
    }
  },
  "required": [
    "email"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "cart_id": "Cart id is required",
      "email": "Email is required"
    }
  }
}}
responseSample={`{
    "data": {
      "email": "customer@example.com"
    }
}`}
isPrivate={false}
/>

<hr/>

### Add Address

Adds a shipping or billing address to the cart. Both address types are required to complete the checkout process.

<Api
method="POST"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f/addresses"
requestSchema={{
  "type": "object",
  "properties": {
    "address": {
      "type": "object",
      "description": "Address information",
      "properties": {
        "full_name": {
          "type": "string",
          "description": "Full name of the recipient"
        },
        "telephone": {
          "type": [
            "string",
            "number"
          ],
          "description": "Contact telephone number"
        },
        "address_1": {
          "type": "string",
          "description": "Street address, line 1"
        },
        "address_2": {
          "type": "string",
          "description": "Street address, line 2 (optional)"
        },
        "city": {
          "type": "string",
          "description": "City name"
        },
        "province": {
          "type": "string",
          "description": "State/Province/Region"
        },
        "country": {
          "type": "string",
          "description": "Country code (e.g., US, CA)"
        },
        "postcode": {
          "type": "string",
          "description": "Postal or ZIP code"
        }
      },
      "required": [
        "full_name",
        "telephone",
        "address_1",
        "city",
        "province",
        "country",
        "postcode"
      ],
      "additionalProperties": true
    },
    "type": {
      "type": "string",
      "enum": [
        "shipping",
        "billing"
      ],
      "description": "Type of address (shipping or billing)"
    }
  },
  "required": [
    "address",
    "type"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "cart_id": "Cart id is required",
      "address": "Address is required",
      "type": "Address type is required"
    }
  }
}}
responseSample={`{
  "data": {
    "cart_address_id": 461,
    "uuid": "9c79451aa63211edb46b60d819134f39",
    "full_name": "John Doe",
    "postcode": "5000",
    "telephone": "123456",
    "country": "US",
    "province": "CA",
    "city": "California",
    "address_1": "1234 Main St",
    "address_2": null
  }
}`}
isPrivate={false}
/>

<hr/>

### Add Shipping Method

Specifies the shipping method to be used for the order. This step is required after adding a shipping address and before placing the order.

<Api
method="POST"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f/shippingMethods"
requestSchema={{
  "type": "object",
  "properties": {
    "method_code": {
      "type": "string",
      "description": "Unique code identifying the shipping method"
    },
    "method_name": {
      "type": "string",
      "description": "Display name of the shipping method"
    }
  },
  "required": [
    "method_code",
    "method_name"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "method_code": "Method code is required",
      "method_name": "Method name is required"
    }
  }
}}
responseSample={`{
  "data": {
    "method": {
      "code": "free_shipping",
      "name": "Free Shipping"
    }
  }
}`}
isPrivate={false}
/>

<hr/>

### Add Payment Method

Specifies the payment method to be used for the order. This is the final step required before placing the order.

<Api
method="POST"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f/paymentMethods"
requestSchema={{
  "type": "object",
  "properties": {
    "method_code": {
      "type": "string",
      "description": "Unique code identifying the payment method"
    },
    "method_name": {
      "type": "string",
      "description": "Display name of the payment method"
    }
  },
  "required": [
    "method_code",
    "method_name"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "method_code": "Method code is required",
      "method_name": "Method name is required"
    }
  }
}}
responseSample={`{
  "data": {
    "method": {
      "code": "paypal",
      "name": "Paypal"
    }
  }
}`}
isPrivate={false}
/>

<hr/>

### Get Cart

Retrieves detailed information about a specific cart including items, addresses, and selected shipping and payment methods.

<Api
method="GET"
url="/api/cart/363ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "cart_id": "251ca17e754f4473a9bdf97c85509a4a",
    "uuid": "251ca17e754f4473a9bdf97c85509a4a",
    "currency": "USD",
    "customer_email": "customer@example.com",
    "customer_full_name": "John Doe",
    "user_ip": "192.168.1.1",
    "status": 1,
    "total_qty": 3,
    "total_weight": 16.2,
    "shipping_fee_excl_tax": 0,
    "shipping_fee_incl_tax": 0,
    "discount_amount": 0,
    "sub_total": 8230,
    "tax_amount": 0,
    "grand_total": 8230,
    "shipping_address_id": 460,
    "billing_address_id": 461,
    "shipping_method": "free_shipping",
    "shipping_method_name": "Free Shipping",
    "payment_method": "paypal",
    "payment_method_name": "PayPal",
    "items": [
      {
        "cart_item_id": "2sl0ifz1etgldt28vm9",
        "uuid": "4a6e5c9e0062489e82a472aeda0211be",
        "product_id": 2,
        "product_sku": "NJC90842-Blue-S",
        "product_name": "Lite racer adapt 3.0 shoes",
        "thumbnail": "/assets/catalog/7385/1316/plv1138-Blue-thumb.png",
        "qty": 10,
        "final_price": 823,
        "final_price_incl_tax": 823,
        "tax_percent": 0,
        "tax_amount": 0,
        "discount_amount": 0,
        "total": 8230
      }
    ],
    "shipping_address": {
      "cart_address_id": 460,
      "uuid": "9c79451aa63211edb46b60d819134f39",
      "full_name": "John Doe",
      "postcode": "5000",
      "telephone": "123456",
      "country": "US",
      "province": "CA",
      "city": "California",
      "address_1": "1234 Main St",
      "address_2": null
    },
    "billing_address": {
      "cart_address_id": 461,
      "uuid": "9c79451aa63211edb46b60d819134f39",
      "full_name": "John Doe",
      "postcode": "5000",
      "telephone": "123456",
      "country": "US",
      "province": "CA",
      "city": "California",
      "address_1": "1234 Main St",
      "address_2": null
    }
  }
}`}
isPrivate={false}
/>

## Error Handling

All endpoints may return the following error responses:

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 400         | Bad Request - Invalid parameters       |
| 401         | Unauthorized - Authentication required |
| 403         | Forbidden - Insufficient permissions   |
| 404         | Not Found - Cart or item not found     |
| 500         | Server Error - Something went wrong    |

Error responses follow this format:

```json
{
  "error": {
    "status": 404,
    "message": "Cart not found"
  }
}
```

## Checkout Process Flow

The typical checkout process follows these steps:

1. **Create a Cart** - Initialize a new cart for the customer
2. **Add Items** - Add products to the cart
3. **Add Customer Information** - Provide customer email
4. **Add Addresses** - Provide shipping and billing addresses
5. **Add Shipping Method** - Select a shipping method
6. **Add Payment Method** - Select a payment method
7. **Place Order** - Convert the cart to an order (see Order API)

## Best Practices

1. **Error Handling** - Always handle API errors gracefully in your frontend application
2. **Validation** - Validate customer inputs before submitting to the API
3. **Security** - Use HTTPS for all API calls to ensure data security
