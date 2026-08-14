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
description: Select a shipping method on an EverShop cart with the REST API, and list the available methods with GraphQL.
---

# Shipping Method API

Shipping methods in EverShop are produced by **shipping providers**. A provider is registered at bootstrap (the built-in one has the code `core`) and attached to one or more shipping zones. When a cart has a shipping address, every provider attached to a matching zone is asked for its methods, and the merged list is what the customer picks from.

That split drives the API surface:

- **Listing** available methods is a **GraphQL** query on the cart — the list depends on the cart's contents and destination, so it cannot be a static REST collection.
- **Selecting** a method is the single REST endpoint documented below.

:::warning Removed endpoints
`GET /api/shippingMethods` and `GET /api/carts/{cart_id}/shippingMethods` no longer exist. Read the available methods with the GraphQL query below, and the currently selected one with `Cart.shippingMethodData`.
:::

import Api from '@site/src/components/rest/Api';

## List Available Shipping Methods (GraphQL)

Query `Cart.availableShippingMethods` against the storefront endpoint `POST /graphql`. The destination arguments are optional — when omitted the cart's saved shipping address is used.

```graphql
query AvailableShippingMethods($cartId: String!) {
  cart(id: $cartId) {
    availableShippingMethods(country: "US", province: "CA", postcode: "90001") {
      id
      providerCode
      code
      name
      cost {
        value
        text
      }
      carrier
      serviceCode
      delivery {
        minBusinessDays
        maxBusinessDays
        estimatedDate
      }
    }
  }
}
```

Both `providerCode` and `code` are required when the customer commits to a method — keep them together as you carry the selection through your UI.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>String!</td>
      <td>Alias of <code>code</code>, kept for backward compatibility</td>
    </tr>
    <tr>
      <td>providerCode</td>
      <td>String!</td>
      <td>Code of the provider that produced this method. Send it back as <code>provider_code</code> when selecting</td>
    </tr>
    <tr>
      <td>code</td>
      <td>String!</td>
      <td>Provider-opaque method identifier. Send it back as <code>method_code</code></td>
    </tr>
    <tr>
      <td>name</td>
      <td>String!</td>
      <td>Customer-facing method name</td>
    </tr>
    <tr>
      <td>cost</td>
      <td>Price!</td>
      <td>Quoted cost in the cart's currency</td>
    </tr>
    <tr>
      <td>carrier</td>
      <td>String</td>
      <td>Customer-facing carrier label (e.g. <code>USPS</code>). Usually null for Core-only stores</td>
    </tr>
    <tr>
      <td>serviceCode</td>
      <td>String</td>
      <td>Fulfillment metadata used when buying a label. Never display it</td>
    </tr>
    <tr>
      <td>delivery</td>
      <td>DeliveryWindow</td>
      <td>Estimated delivery window when the provider supplies one</td>
    </tr>
  </tbody>
</table>

:::info `method_code` is opaque
Do not hardcode values like `"standard"` or `"express"`. The code is whatever the provider chooses to emit — the built-in Core provider returns the `core_shipping_method.uuid` of the admin-defined method. Always read the code from `availableShippingMethods` and echo it back verbatim.
:::

<hr />

## Set Shipping Method for Cart

Applies a selected shipping method to a shopping cart. The server re-quotes the method against the cart's current state and stores an enriched snapshot in `cart.shipping_method_data`.

<Api
method="POST"
url="/api/carts/{cart_id}/shippingMethods"
requestSchema={{
  "type": "object",
  "properties": {
    "provider_code": {
      "type": "string",
      "minLength": 1,
      "description": "Code of the registered shipping provider that produced the method (e.g. 'core'). Take it from availableShippingMethods.providerCode"
    },
    "method_code": {
      "type": "string",
      "minLength": 1,
      "description": "Provider-opaque method code. Take it from availableShippingMethods.code"
    }
  },
  "required": [
    "provider_code",
    "method_code"
  ],
  "additionalProperties": true,
  "errorMessage": {
    "properties": {
      "provider_code": "Provider code is required",
      "method_code": "Method code is required"
    }
  }
}}
responseSample={`{
  "data": {
    "method": {
      "code": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
      "provider_code": "core"
    }
  }
}`}
isPrivate={false}
/>

:::danger `provider_code` is mandatory
Earlier releases defaulted the provider to `core` when the field was absent. That default is gone: a payload without `provider_code` is rejected with `400 provider_code is required`. Silently defaulting routed non-core selections through Core's validator and surfaced later as a misleading "method no longer available" error.
:::

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

### Reading Back the Selection

The `cart.shipping_method` and `cart.shipping_method_name` columns were dropped, along with their `order` counterparts. The selection now lives in the `shipping_method_data` JSONB column, exposed as `Cart.shippingMethodData`:

```graphql
query SelectedShippingMethod($cartId: String!) {
  cart(id: $cartId) {
    shippingMethodData {
      providerCode
      methodCode
      snapshot {
        code
        name
        cost {
          value
          text
        }
        carrier
      }
      fingerprint
      quotedAt
    }
  }
}
```

The underlying column looks like this:

```json
{
  "provider_code": "core",
  "method_code": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
  "snapshot": {
    "code": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
    "name": "Standard Shipping",
    "cost": 5.99,
    "carrier": "usps",
    "serviceCode": "usps_ground_advantage"
  },
  "fingerprint": "3d0f9a...",
  "quotedAt": "2025-04-04T09:12:44.201Z"
}
```

`fingerprint` and `quotedAt` are cart-only. When the cart's items, address, or totals change, the snapshot is re-quoted against the provider automatically — a method that no longer applies raises the shipping-quote error described below.

<hr />

## Managing Providers, Methods and Rates

Creating the methods that customers see is an admin task and lives on different endpoints:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Endpoint</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>POST /api/shippingZones/:zone_id/providers</code></td>
      <td>Attach a provider to a zone</td>
    </tr>
    <tr>
      <td><code>PATCH /api/shippingZones/:zone_id/providers/:provider_code</code></td>
      <td>Enable/disable or reconfigure an attachment</td>
    </tr>
    <tr>
      <td><code>DELETE /api/shippingZones/:zone_id/providers/:provider_code</code></td>
      <td>Detach a provider from a zone</td>
    </tr>
    <tr>
      <td><code>POST /api/shippingProviders/core/methods</code></td>
      <td>Create a Core shipping method</td>
    </tr>
    <tr>
      <td><code>POST /api/shippingProviders/core/rates</code></td>
      <td>Give a Core method a per-zone rate</td>
    </tr>
  </tbody>
</table>

See the [Shipping Zone API](./shipping-zone.md) for the full schemas.

<hr />

## Troubleshooting

### Shipping Quote Errors

When the selection cannot be quoted, the endpoint answers `400` with a provider-specific reason in `error.message`. These are user-facing strings — surface them at checkout rather than a generic failure.

<table className="not-prose table-auto">
  <thead>
    <tr>
      <th>Message</th>
      <th>Cause</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>provider_code is required</td>
      <td>The payload omitted <code>provider_code</code></td>
    </tr>
    <tr>
      <td>Missing provider_code or method_code</td>
      <td>One of the two fields was present but empty</td>
    </tr>
    <tr>
      <td>Shipping provider "x" is not registered</td>
      <td>No provider with that code is registered at bootstrap</td>
    </tr>
    <tr>
      <td>Shipping address is required</td>
      <td>The cart has no shipping address, so no zone can be resolved</td>
    </tr>
    <tr>
      <td>We do not ship to this address</td>
      <td>No shipping zone matches the cart's destination</td>
    </tr>
    <tr>
      <td>Invalid cart</td>
      <td>No cart exists with the supplied <code>cart_id</code></td>
    </tr>
  </tbody>
</table>

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
      <td>A missing field, an unknown cart, or a shipping-quote rejection. Read <code>error.message</code></td>
    </tr>
    <tr>
      <td>401</td>
      <td>Unauthorized</td>
      <td>Only relevant on the admin provider/method endpoints — check your access token</td>
    </tr>
    <tr>
      <td>429</td>
      <td>Too Many Requests</td>
      <td>The <code>/api/**</code> tier allows 120 requests per minute per IP. Back off using the <code>Retry-After</code> header</td>
    </tr>
    <tr>
      <td>500</td>
      <td>Server Error</td>
      <td>Unexpected failure while saving the cart. Check the server logs</td>
    </tr>
  </tbody>
</table>
