---
sidebar_position: 14
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Shipping Zone
  - Shipping Provider
  - Shipping Method
sidebar_label: Shipping Zone
title: Shipping Zone REST API
description: Use the EverShop REST API to manage shipping zones, attach shipping providers to them, and configure Core shipping methods and rates.
---

import Api from '@site/src/components/rest/Api';

# Shipping Zone API

A shipping zone is a set of countries, optionally narrowed to regions within a country (states, provinces, or any level a country enumerates — the keys an address stores, such as `US-CA` or `VN-SG`). Zones no longer own methods directly — they own **provider attachments**. Configuring shipping is three steps:

1. Create a **zone** — the geography.
2. Attach a **provider** to the zone (`core`, or one supplied by an extension).
3. For the built-in `core` provider, define **methods** and give each one a per-zone **rate**.

:::warning Removed endpoints
`POST /api/shippingZones/{id}/methods`, `PATCH /api/shippingZones/{zone_id}/methods/{method_id}` and `DELETE /api/shippingZones/{zone_id}/methods/{method_id}` no longer exist. Their replacements are the provider endpoints (`/api/shippingZones/:zone_id/providers[...]`) and the Core provider endpoints (`/api/shippingProviders/core/methods` and `/api/shippingProviders/core/rates`) documented below.

The `calculation_type` field is gone entirely — the shape of the cost is inferred from which cost field you set on a rate. `condition_type` accepts only `"price"`, `"weight"` or `null`; the old `"none"` value is rejected.
:::

## Zones

### Create a Shipping Zone

Creates a shipping zone. Only `name` is required by the payload schema, but the request is rejected with `400 At least one country is required` unless the normalized country list is non-empty — so send `countries` (preferred) or the legacy `country`.

Creating a zone automatically attaches the built-in `core` provider to it.

<Api
method="POST"
url="/api/shippingZones"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "countries": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Preferred. ISO country codes covered by this zone. Takes precedence over the legacy country field"
    },
    "country": {
      "type": "string",
      "description": "Legacy single-country field. New clients should send countries"
    },
    "regions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "country": { "type": "string", "minLength": 2, "maxLength": 2 },
          "level": {
            "type": "string",
            "enum": ["administrative_area", "locality", "dependent_locality"],
            "description": "The region level of the key. Defaults to administrative_area"
          },
          "key": { "type": "string", "minLength": 1, "description": "An active region key of that country, for example US-CA" }
        },
        "required": ["country", "key"]
      },
      "description": "Region restrictions per country. A country with no entries is covered whole"
    }
  },
  "required": ["name"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "shipping_zone_id": 3,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "North America"
  }
}`}
/>

A multi-country zone with region restrictions:

```json
{
  "name": "North America",
  "countries": ["US", "CA"],
  "regions": [
    { "country": "US", "key": "US-CA" },
    { "country": "US", "key": "US-OR" },
    { "country": "CA", "key": "CA-BC" }
  ]
}
```

Every key must be an **active** region key of its country (`regions(country)` in GraphQL lists them). A key the data has retired — for example a Vietnamese province absorbed in the 2025 merger — is rejected with `400`. When a zone covers a country the store does not sell to, the zone is still saved and the response carries a `warnings` array naming the conflict; nothing is deleted or rewritten.

:::info `shipping_zone.country` was dropped
Countries live in the `shipping_zone_country` table and regions in `shipping_zone_region` (`zone_id`, `country`, `level`, `region_key`; unique per zone, country, level and key), both keyed by zone. The zone row itself carries only `name`, so the create response does not echo the geography back.
:::

<hr/>

### Update a Shipping Zone

Replaces the zone's name, countries and regions. Country and region rows are replaced wholesale, not merged — send the complete lists every time. The same "at least one country" rule applies.

<Api
method="PATCH"
url="/api/shippingZones/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "countries": {
      "type": "array",
      "items": { "type": "string" }
    },
    "country": {
      "type": "string",
      "description": "Legacy single-country field"
    },
    "regions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "country": { "type": "string" },
          "level": { "type": "string", "enum": ["administrative_area", "locality", "dependent_locality"] },
          "key": { "type": "string" }
        },
        "required": ["country", "key"]
      },
      "description": "Region restrictions per country: { country, level (default administrative_area), key }"
    }
  },
  "required": ["name"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}`}
/>

`{id}` is the zone **uuid**.

<hr/>

### Delete a Shipping Zone

Permanently removes a shipping zone along with its country, region, provider-attachment and rate rows.

<Api
method="DELETE"
url="/api/shippingZones/{id}"
responseSample={`{
  "data": {
    "shipping_zone_id": 3,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "North America"
  }
}`}
/>

<hr/>

## Providers, Methods and Rates

A zone on its own offers nothing. Shipping options come from **providers** attached
to the zone, and — for the built-in Core provider — from the methods and rates
configured beneath it.

Those endpoints have their own reference:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>What you want to do</th>
      <th>Where</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Attach, update or detach a provider on a zone</td>
      <td><a href="./shipping-provider">Shipping Provider API</a></td>
    </tr>
    <tr>
      <td>Create, update or delete a Core method</td>
      <td><a href="./shipping-provider">Shipping Provider API</a></td>
    </tr>
    <tr>
      <td>Create, update or delete a Core rate (flat, price-tiered or weight-tiered)</td>
      <td><a href="./shipping-provider">Shipping Provider API</a></td>
    </tr>
    <tr>
      <td>Build a provider of your own</td>
      <td><a href="../development/knowledge-base/shipping-provider-development">Shipping Provider Development</a></td>
    </tr>
  </tbody>
</table>

<hr/>

## Selecting a Method at Checkout

Once zones, providers, methods and rates exist, the storefront reads the available methods from GraphQL and applies one with `POST /api/carts/:cart_id/shippingMethods`. See the [Shipping Method API](./shipping-method.md).
