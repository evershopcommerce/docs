---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Payment Methods
  - E-commerce Payments
  - Payment Gateway Integration
  - REST API
sidebar_label: Payment Methods
title: Payment Method API
description: List the payment methods available to an EverShop cart with GraphQL, and apply one to the cart with the REST API.
---

# Payment Method API

## Overview

Payment methods are registered in-process at bootstrap (`registerPaymentMethod`) and each one carries an optional validator that is evaluated against the current cart. Because availability depends on cart state — most visibly the grand total — the list is exposed as a **GraphQL** field on the cart, not as a static REST collection.

:::warning Removed endpoint
`GET /api/paymentMethods` does not exist. Use the GraphQL query below.
:::

import Api from '@site/src/components/rest/Api';

## List Available Payment Methods (GraphQL)

Query `Cart.availablePaymentMethods` against the storefront endpoint `POST /graphql`.

```graphql
query AvailablePaymentMethods($cartId: String!) {
  cart(id: $cartId) {
    availablePaymentMethods {
      code
      name
    }
  }
}
```

```json
{
  "data": {
    "cart": {
      "availablePaymentMethods": [
        { "code": "cod", "name": "Cash On Delivery" },
        { "code": "paypal", "name": "PayPal" },
        { "code": "stripe", "name": "Credit Card" }
      ]
    }
  }
}
```

### Zero-Total Carts

A cart whose `grand_total` is `0` — fully discounted, free products, a 100% coupon — collapses to exactly **one** available method, the built-in `zero_checkout`:

```json
{
  "data": {
    "cart": {
      "availablePaymentMethods": [
        { "code": "zero_checkout", "name": "No payment required" }
      ]
    }
  }
}
```

Every gateway method is filtered out centrally, and `zero_checkout` hides itself whenever the total is above zero or unknown. A storefront that hardcodes a gateway code will fail on these carts, so always render the returned list rather than a fixed set.

<hr />

## Apply a Payment Method to a Cart

<Api
method="POST"
url="/api/carts/{cart_id}/paymentMethods"
requestSchema={{
  "type": "object",
  "properties": {
    "method_code": {
      "type": "string",
      "description": "Code of an available payment method, taken from availablePaymentMethods"
    }
  },
  "required": [
    "method_code"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "method_code": "Method code is required"
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
  </tbody>
</table>

## Registering a Payment Method

Custom gateways are added from a module's `bootstrap.ts` with `registerPaymentMethod`. See the [payment method development guide](/docs/development/knowledge-base/payment-method-development) for the full contract.
