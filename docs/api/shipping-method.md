---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Shipping Method API
  - E-commerce API
  - RESTful API
  - Shipping Options
sidebar_label: Shipping Method
title: Shipping Method API
description: Use the EverShop REST API to retrieve available shipping methods for customer orders.
---

# Shipping Method API

The Shipping Method API allows you to programmatically retrieve available shipping methods for orders in your EverShop store. These methods can be presented to customers during checkout to provide shipping options.

## Get Available Shipping Methods

Retrieves all available shipping methods that can be applied to orders in your store.

import Api from '@site/src/components/rest/Api';

<Api
method="GET"
url="/api/shippingMethods"
responseSample={`{
  "data": {
    "methods": [
      {
        "code": "free",
        "name": "Free Shipping"
      },
      {
        "code": "standard",
        "name": "Standard Shipping",
        "cost": 5.99
      },
      {
        "code": "express",
        "name": "Express Shipping",
        "cost": 15.99
      }
    ]
  }
}`}
isPrivate={false}
/>

## Set Shipping Method for Cart

Applies a selected shipping method to a specific shopping cart.

<Api
method="POST"
url="/api/carts/{cart_id}/shippingMethods"
requestSchema={{
  "type": "object",
  "properties": {
    "method_code": {
      "type": "string"
    }
  },
  "required": [
    "method_code"
  ],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "shipping_method": "standard",
    "shipping_fee_excl_tax": 5.99,
    "shipping_fee_incl_tax": 5.99
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                                          |
| --------- | ------ | -------- | ---------------------------------------------------- |
| cart_id   | string | Yes      | The UUID of the cart to apply the shipping method to |

## Get Cart Shipping Method

Retrieves the currently selected shipping method for a specific cart.

<Api
method="GET"
url="/api/carts/{cart_id}/shippingMethods"
responseSample={`{
  "data": {
    "shipping_method": "standard",
    "shipping_fee_excl_tax": 5.99,
    "shipping_fee_incl_tax": 5.99
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                                              |
| --------- | ------ | -------- | -------------------------------------------------------- |
| cart_id   | string | Yes      | The UUID of the cart to retrieve the shipping method for |

## Troubleshooting

### Common Error Codes

| Status Code | Description          | Solution                                                             |
| ----------- | -------------------- | -------------------------------------------------------------------- |
| 400         | Bad Request          | Check that the shipping method code is valid                         |
| 401         | Unauthorized         | Ensure your API credentials are correct                              |
| 404         | Not Found            | Verify the cart ID exists                                            |
| 422         | Unprocessable Entity | The cart may be missing required information (like shipping address) |
| 500         | Server Error         | Contact support if the issue persists                                |
