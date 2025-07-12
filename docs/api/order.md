---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop api
sidebar_label: Order
title: Order REST API
description: Use the REST API to interact with EverShop orders.
---

# Order API

Use the REST API to interact with EverShop orders.

## Create an order

Use this endpoint to create an order.

import Api from '@site/src/components/rest/Api';

<Api
method="POST"
url="/api/orders"
requestSchema={{
  "type": "object",
  "properties": {
    "cart_id": {
      "type": "string"
    }
  },
  "required": [
    "cart_id"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "cart_id": "Cart id is required"
    }
  }
}}
responseSample={`{
  "data": {
    "order_id": 274,
    "uuid": "fd0b4f0fd6704ed0b53fa0c64ae7df3c",
    "integration_order_id": null,
    "order_number": "10274",
    "cart_id": 990,
    "currency": "USD",
    "customer_id": 20,
    "customer_email": "paypal@gmail.com",
    "customer_full_name": "0JO7SFxSIpNiY53eNltN",
    "user_ip": null,
    "sid": "09d34c21-4af3-4db8-a38b-335ebf6d45fa",
    "user_agent": null,
    "coupon": null,
    "shipping_fee_excl_tax": 0,
    "shipping_fee_incl_tax": 0,
    "discount_amount": 0,
    "sub_total": 12345,
    "total_qty": 15,
    "total_weight": 81,
    "tax_amount": 0,
    "shipping_note": null,
    "grand_total": 12345,
    "shipping_method": "free",
    "shipping_method_name": "Free Shipping",
    "shipping_address_id": 551,
    "payment_method": "paypal",
    "payment_method_name": "Paypal",
    "billing_address_id": 552,
    "shipment_status": "unfullfilled",
    "payment_status": "pending",
    "created_at": "2023-02-07 14:18:04",
    "updated_at": "2023-02-07 14:18:04",
    "items": [
      {
        "order_item_id": 306,
        "uuid": "dc651b93008d475e9de6d85983586a2e",
        "order_item_order_id": 274,
        "product_id": 3,
        "referer": null,
        "product_sku": "NJC90842-Black-X",
        "product_name": "Lite racer adapt 3.0 shoes",
        "thumbnail": "/assets/catalog/8953/8037/plv3663-Black-thumb.png",
        "product_weight": 5.4,
        "product_price": 823,
        "product_price_incl_tax": 823,
        "qty": 15,
        "final_price": 823,
        "final_price_incl_tax": 823,
        "tax_percent": 0,
        "tax_amount": 0,
        "discount_amount": 0,
        "total": 12345,
        "variant_group_id": 62,
        "variant_options": "[{\"attribute_code\":\"size\",\"attribute_name\":\"Size\",\"attribute_id\":2,\"option_id\":4,\"option_text\":\"X\"},{\"attribute_code\":\"color\",\"attribute_name\":\"Color\",\"attribute_id\":3,\"option_id\":14,\"option_text\":\"Black\"}]",
        "product_custom_options": null,
        "requested_data": null
      }
    ],
    "shipping_address": {
      "order_address_id": 551,
      "uuid": "e0fbebaca66c11edb46b60d819134f39",
      "full_name": "The Nguyen",
      "postcode": "5000",
      "telephone": "123456",
      "country": "VN",
      "province": "Ho Chi Minh",
      "city": "Ho Chi Minh",
      "address_1": "Thu Duc ho chi minh",
      "address_2": null
    },
    "billing_address": {
      "order_address_id": 552,
      "uuid": "e0fd1671a66c11edb46b60d819134f39",
      "full_name": "The Nguyen",
      "postcode": "5000",
      "telephone": "123456",
      "country": "VN",
      "province": "Ho Chi Minh",
      "city": "Ho Chi Minh",
      "address_1": "Thu Duc ho chi minh",
      "address_2": null
    },
    "links": [
      {
        "rel": "edit",
        "href": "/admin/order/edit/fd0b4f0fd6704ed0b53fa0c64ae7df3c",
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

## Create a shipment

Use this endpoint to create a shipment for an order.

<Api
method="POST"
url="/api/orders/433ba97f-8be7-4be9-be3f-a9f341f2b89f/shipments"
requestSchema={{
  "type": "object",
  "properties": {
    "carrier_name": {
      "type": "string"
    },
    "tracking_number": {
      "type": "string"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "shipment_id": 50,
    "shipment_order_id": 12,
    "uuid": "dcc16767a5c311edb46b60d819134f39",
    "carrier_name": "fedex",
    "tracking_number": "1223",
    "created_at": "2023-02-06 09:13:35",
    "updated_at": "2023-02-06 09:13:35"
  }
}`}
/>

 <hr />

## Update a shipment

Use this endpoint to update a shipment.

<Api
method="PATCH"
url="/api//orders/433ba97f-8be7-4be9-be3f-a9f341f2b89f/shipments/23de497f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "carrier_name": {
      "type": "string"
    },
    "tracking_number": {
      "type": "string"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "shipment_id": 50,
    "shipment_order_id": 12,
    "uuid": "dcc16767a5c311edb46b60d819134f39",
    "carrier_name": "fedex",
    "tracking_number": "1223",
    "created_at": "2023-02-06 09:13:35",
    "updated_at": "2023-02-06 09:13:35"
  }
}`}
/>
