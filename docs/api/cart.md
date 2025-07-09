---
sidebar_position: 1
hide_table_of_contents: true
keywords:
- EverShop api
sidebar_label: Cart
title: Cart REST API
description: Use the REST API to interact with EverShop carts.
---

# Cart API

Use the REST API to interact with EverShop carts.

## Create a new cart

Use this endpoint to create a new cart.

<Api
  method="POST"
  url="/api/carts"
  requestSchema={{
  "type": "object",
  "properties": {
    "customer_full_name": {
      "type": "string"
    },
    "customer_email": {
      "type": ["string"],
      "format": "email",
      "errorMessage": {
        "type": "Email is invalid"
      }
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": {
            "type": "string"
          },
          "qty": {
            "type": "integer"
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

## Add item to cart

Use this endpoint to add item to cart.

import Api from '@site/src/components/rest/Api';

<Api
  method="POST"
  url="/api/cart/{id}/items"
  requestSchema={{
  "type": "object",
  "properties": {
    "sku": {
      "type": "string"
    },
    "qty": {
      "type": [
        "string",
        "integer"
      ],
      "pattern": "^[1-9][0-9]*$"
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

## Remove item from cart

Use this endpoint to remove item from cart.

<Api
  method="DELETE"
  url="/api/cart/{id}/items/{itemId}"
  responseSample={`{
  "data": {
    "item": {
      "cart_item_id": 1138,
      "uuid": "19fa0c23bbd24edeaa3885940cf59f80",
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

 ## Add customer info

Use this endpoint to add customer email to cart.

<Api
  method="POST"
  url="/api/carts/{id}/contacts"
  requestSchema={{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
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
    "data":{"email":"paypal@gmail.com"}}
}`}
  isPrivate={false}
 />

 <hr/>

## Add address

Use this endpoint to add address (Billing or Shipping) to cart.

<Api
  method="POST"
  url="/api/carts/{id}/addresses"
  requestSchema={{
  "type": "object",
  "properties": {
    "address": {
      "type": "object",
      "properties": {
        "full_name": {
          "type": "string"
        },
        "telephone": {
          "type": [
            "string",
            "number"
          ]
        },
        "address_1": {
          "type": "string"
        },
        "address_2": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "province": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "postcode": {
          "type": "string"
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
      ]
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

## Add shipping method

Use this endpoint to add shipping method to cart.

<Api
  method="POST"
  url="/api/carts/{id}/shippingMethods"
  requestSchema={{
  "type": "object",
  "properties": {
    "method_code": {
      "type": "string"
    },
    "method_name": {
      "type": "string"
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

## Add payment method

Use this endpoint to add payment method to cart.

<Api
  method="POST"
  url="/api/carts/{id}/paymentMethods"
  requestSchema={{
  "type": "object",
  "properties": {
    "method_code": {
      "type": "string"
    },
    "method_name": {
      "type": "string"
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
