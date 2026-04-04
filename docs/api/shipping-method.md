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

<table className="not-prose table-auto">
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
      <td>The UUID of the cart to apply the shipping method to</td>
    </tr>
  </tbody>
</table>

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

<table className="not-prose table-auto">
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
      <td>The UUID of the cart to retrieve the shipping method for</td>
    </tr>
  </tbody>
</table>

## Troubleshooting

### Common Error Codes

<table className="not-prose table-auto">
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Description</th>
      <th>Solution</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>400</td>
      <td>Bad Request</td>
      <td>Check that the shipping method code is valid</td>
    </tr>
    <tr>
      <td>401</td>
      <td>Unauthorized</td>
      <td>Ensure your API credentials are correct</td>
    </tr>
    <tr>
      <td>404</td>
      <td>Not Found</td>
      <td>Verify the cart ID exists</td>
    </tr>
    <tr>
      <td>422</td>
      <td>Unprocessable Entity</td>
      <td>The cart may be missing required information (like shipping address)</td>
    </tr>
    <tr>
      <td>500</td>
      <td>Server Error</td>
      <td>Contact support if the issue persists</td>
    </tr>
  </tbody>
</table>
