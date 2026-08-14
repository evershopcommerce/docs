---
sidebar_position: 22
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Shipping Provider
  - Shipping Method
  - Shipping Rate
  - Shipping Zone
  - REST API
sidebar_label: Shipping Provider
title: Shipping Provider REST API
description: Attach shipping providers to zones and configure the built-in Core provider's methods and per-zone rates with the EverShop REST API. Replaces the removed zone-methods endpoints.
---

import Api from '@site/src/components/rest/Api';

# Shipping Provider API

## Overview

Shipping zones no longer own methods. A zone owns **provider attachments**, and each provider decides what methods it offers inside that zone. EverShop ships one provider, `core`, whose methods and per-zone rates are admin-managed through the endpoints on this page.

The full configuration path is:

1. Create a **zone** — the geography. See the [Shipping Zone API](./shipping-zone.md).
2. **Attach a provider** to the zone. Creating a zone attaches `core` automatically.
3. For `core`, create **methods** (zone-independent options such as "Standard" or "Express").
4. Give each method a per-zone **rate**, which is what determines the price in that zone.

:::danger These endpoints replace the removed zone-methods API
The following routes were removed and now return `404`:

- `POST /api/shippingZones/{id}/methods`
- `PATCH /api/shippingZones/{zone_id}/methods/{method_id}`
- `DELETE /api/shippingZones/{zone_id}/methods/{method_id}`
- `POST /api/shippingMethods`
- `PATCH /api/shippingMethods/{id}`

Migrate to `/api/shippingZones/{zone_id}/providers[...]` for attachments and `/api/shippingProviders/core/methods` plus `/api/shippingProviders/core/rates` for the Core provider's configuration.

Two payload fields disappeared with them. `calculation_type` (`flat_rate` / `price_based_rate` / `weight_based_rate` / `api`) no longer exists at all — the shape of the cost is inferred from **which cost field you populate** on the rate. And `condition_type` now accepts only `"price"`, `"weight"` or `null`; the old `"none"` value is rejected by the schema.
:::

:::info Providers live in an in-memory registry
There is no `shipping_provider` table. Providers are registered with `registerShippingProvider(...)` from a module's `bootstrap.ts`, and `shipping_zone_provider.provider_code` is a soft reference into that registry. Codes must be unique across all installed extensions, and registration after bootstrap throws.
:::

## Zone Provider Attachments

### Attach A Provider To A Zone

Makes a registered provider offer its methods inside the zone. `{zone_id}` is the zone **uuid**.

<Api
method="POST"
url="/api/shippingZones/a1b2c3d4-e5f6-7890-abcd-ef1234567890/providers"
requestSchema={{
  "type": "object",
  "properties": {
    "provider_code": {
      "type": "string",
      "minLength": 1
    },
    "config": {
      "type": "object"
    },
    "is_enabled": {
      "type": "boolean"
    },
    "sort_order": {
      "type": "integer"
    }
  },
  "required": ["provider_code"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "shipping_zone_provider_id": 8,
    "uuid": "b7c3f1a2-4d5e-4a6b-9c8d-0e1f2a3b4c5d",
    "zone_id": 3,
    "provider_code": "core",
    "is_enabled": true,
    "sort_order": 0,
    "config": {}
  }
}`}
/>

`config` holds per-zone provider configuration, whose shape the provider declares through `zoneConfigFields` — a per-zone markup percentage, for example. The endpoint accepts any object; the admin UI is what validates it against the declared fields. The `core` provider declares no zone config fields, so its attachments carry `{}`.

Defaults: `config` `{}`, `is_enabled` `true`, `sort_order` `0`. `additionalProperties` is `false`, so an unrecognised key is rejected.

Errors: `400 Invalid zone id`, `400 Shipping provider "x" is not registered`, `400 Provider "x" is already attached to this zone`.

<hr />

### Update A Zone Provider Attachment

Patches the attachment identified by `(zone uuid, provider_code)`. Only the fields present in the body are written.

<Api
method="PATCH"
url="/api/shippingZones/a1b2c3d4-e5f6-7890-abcd-ef1234567890/providers/core"
requestSchema={{
  "type": "object",
  "properties": {
    "is_enabled": {
      "type": "boolean"
    },
    "config": {
      "type": "object"
    },
    "sort_order": {
      "type": "integer"
    }
  },
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "shipping_zone_provider_id": 8,
    "uuid": "b7c3f1a2-4d5e-4a6b-9c8d-0e1f2a3b4c5d",
    "zone_id": 3,
    "provider_code": "core",
    "is_enabled": false,
    "sort_order": 0,
    "config": {}
  }
}`}
/>

`provider_code` itself cannot be changed — detach and re-attach instead.

Errors: `400 Invalid zone id`, `400 Provider is not attached to this zone`.

<hr />

### Detach A Provider From A Zone

Removes the attachment row. Takes no request body.

<Api
method="DELETE"
url="/api/shippingZones/a1b2c3d4-e5f6-7890-abcd-ef1234567890/providers/core"
responseSample={`{
  "data": {
    "detached": true
  }
}`}
/>

Detaching is non-destructive to provider-internal data. Core's `core_shipping_method_rate` rows are keyed on the zone, not on the attachment, so re-attaching later re-exposes the existing rates without re-entering them.

There is no registry validation on this route — an attachment whose provider is no longer installed can still be cleaned up. Deleting a zone that does not exist returns `400 Invalid zone id`; detaching a provider that was never attached succeeds silently.

<hr />

## Core Provider Methods

A Core method is the logical, zone-independent shipping option. It carries no price — the price lives on a rate.

### Create A Core Method

<Api
method="POST"
url="/api/shippingProviders/core/methods"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "is_enabled": {
      "type": "boolean"
    },
    "sort_order": {
      "type": "integer"
    },
    "default_carrier_code": {
      "type": ["string", "null"]
    },
    "default_service_code": {
      "type": ["string", "null"]
    }
  },
  "required": ["name"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "core_shipping_method_id": 4,
    "uuid": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
    "name": "Standard Shipping",
    "is_enabled": true,
    "sort_order": 10,
    "default_carrier_code": null,
    "default_service_code": null
  }
}`}
/>

Method names are unique. Defaults: `is_enabled` `true`, `sort_order` `0`, both default codes `null`.

The returned `uuid` is the value that surfaces as `AvailableShippingMethod.code` at the storefront and that you send back as `method_code` when selecting a method on a cart.

#### The two `default_*` fields are fulfillment hints

Neither is ever shown to a customer, and neither is validated by core.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Field</th>
      <th className="text-left">What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>default_carrier_code</code></td>
      <td>Written into <code>shipping_method_data.snapshot.carrier</code> at checkout. The admin ship dialog uses it to pre-select the carrier dropdown.</td>
    </tr>
    <tr>
      <td><code>default_service_code</code></td>
      <td>Written into <code>shipping_method_data.snapshot.serviceCode</code> at checkout, then threaded into the carrier's label request so the label prints for the service the customer actually paid for. Free-form — service codes are carrier-specific vocabulary such as <code>FEDEX_GROUND</code>.</td>
    </tr>
  </tbody>
</table>

Errors: `400 A Core method with name "x" already exists`.

<hr />

### Update A Core Method

`{id}` is the method **uuid**. Only the fields present in the body are written.

<Api
method="PATCH"
url="/api/shippingProviders/core/methods/0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "is_enabled": {
      "type": "boolean"
    },
    "sort_order": {
      "type": "integer"
    },
    "default_carrier_code": {
      "type": ["string", "null"]
    },
    "default_service_code": {
      "type": ["string", "null"]
    }
  },
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "core_shipping_method_id": 4,
    "uuid": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
    "name": "Standard Shipping",
    "is_enabled": false,
    "sort_order": 10,
    "default_carrier_code": "custom",
    "default_service_code": null
  }
}`}
/>

Errors: `400 Core method not found`, `400 A Core method with name "x" already exists`.

<hr />

### Delete A Core Method

`{id}` is the method **uuid**. Takes no request body. Deleting a method cascades to all of its `core_shipping_method_rate` rows.

<Api
method="DELETE"
url="/api/shippingProviders/core/methods/0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510"
responseSample={`{
  "data": {
    "core_shipping_method_id": 4,
    "uuid": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
    "name": "Standard Shipping",
    "is_enabled": true,
    "sort_order": 10,
    "default_carrier_code": null,
    "default_service_code": null
  }
}`}
/>

Carts that had already selected the deleted method surface a "method no longer available" error on the next recompute and have the selection cleared, so the customer re-picks at checkout.

Errors: `400 Core method not found`.

<hr />

## Core Provider Rates

A rate binds one Core method to one zone and says what it costs there. Exactly one rate may exist per `(method, zone)` pair.

### How the cost is chosen

There is no `calculation_type` field. The provider inspects the rate's cost fields in a fixed order and uses the first one that is populated:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Priority</th>
      <th className="text-left">Field</th>
      <th className="text-left">Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><code>cost</code></td>
      <td>Flat rate. Any non-null value wins outright, so null the other two when you want tiers.</td>
    </tr>
    <tr>
      <td>2</td>
      <td><code>price_based_cost</code></td>
      <td>Tiered by cart value. Array of <code>{"{ min_price, cost }"}</code>.</td>
    </tr>
    <tr>
      <td>3</td>
      <td><code>weight_based_cost</code></td>
      <td>Tiered by cart weight. Array of <code>{"{ min_weight, cost }"}</code>.</td>
    </tr>
    <tr>
      <td>—</td>
      <td>none populated</td>
      <td>The rate is silently skipped at quote time. Treat this as a misconfiguration.</td>
    </tr>
  </tbody>
</table>

Tiers are sorted by their minimum and the highest tier whose minimum is less than or equal to the cart value wins, so each tier's range is closed at the bottom and ended by the next tier's minimum. A cart below the lowest tier costs `0`.

### How the condition gates the rate

`condition_type` decides whether the rate applies at all, independently of how the cost is computed.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Value</th>
      <th className="text-left">Behaviour</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>null</code></td>
      <td>The rate always applies. <code>min</code> and <code>max</code> are ignored.</td>
    </tr>
    <tr>
      <td><code>"price"</code></td>
      <td>The cart's value must fall in the half-open interval <code>[min, max)</code>.</td>
    </tr>
    <tr>
      <td><code>"weight"</code></td>
      <td>The cart's weight must fall in the half-open interval <code>[min, max)</code>.</td>
    </tr>
  </tbody>
</table>

The interval is half-open on purpose: a cart sitting exactly on `max` is excluded, so adjacent rates no longer both match at the boundary. A `null` bound is simply unbounded on that side. The old `"none"` value is not accepted — use `null`.

### Create A Rate

<Api
method="POST"
url="/api/shippingProviders/core/rates"
requestSchema={{
  "type": "object",
  "properties": {
    "method_id": {
      "type": "string"
    },
    "zone_id": {
      "type": "string"
    },
    "is_enabled": {
      "type": "boolean"
    },
    "cost": {
      "type": ["string", "number", "null"]
    },
    "condition_type": {
      "type": ["string", "null"],
      "enum": ["price", "weight", null]
    },
    "min": {
      "type": ["string", "number", "null"]
    },
    "max": {
      "type": ["string", "number", "null"]
    },
    "price_based_cost": {
      "type": ["array", "null"]
    },
    "weight_based_cost": {
      "type": ["array", "null"]
    }
  },
  "required": ["method_id", "zone_id"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "core_shipping_method_rate_id": 11,
    "uuid": "c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f",
    "method_id": 4,
    "zone_id": 3,
    "is_enabled": true,
    "cost": "5.99",
    "condition_type": null,
    "min": null,
    "max": null,
    "price_based_cost": null,
    "weight_based_cost": null
  }
}`}
/>

`method_id` and `zone_id` are **uuids** in the request body; the response echoes the resolved numeric ids. Everything else defaults to `null`, except `is_enabled`, which defaults to `true`.

A free-shipping-over-100 rate, tiered by cart value:

```json
{
  "method_id": "0f1c8b7a-9d3e-4f2a-a1b6-77d4c2e9b510",
  "zone_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "is_enabled": true,
  "cost": null,
  "condition_type": null,
  "min": null,
  "max": null,
  "price_based_cost": [
    { "min_price": 0, "cost": 9.95 },
    { "min_price": 100, "cost": 0 }
  ],
  "weight_based_cost": null
}
```

An express rate restricted to carts under 20 weight units:

```json
{
  "method_id": "6b3d9e1f-2a4c-4d7e-8b90-1c2d3e4f5a6b",
  "zone_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "cost": 24.5,
  "condition_type": "weight",
  "min": 0,
  "max": 20,
  "price_based_cost": null,
  "weight_based_cost": null
}
```

Errors: `400 Core method not found`, `400 Invalid zone id`, `400 A rate for this method and zone already exists. Edit it instead.`

<hr />

### Update A Rate

`{uuid}` is the rate **uuid**. This is a full state replacement rather than a merge — every field you omit is written as `null` (`is_enabled` falls back to `true`). Send the complete rate state, including explicit `null`s for the cost branches you are not using.

<Api
method="PATCH"
url="/api/shippingProviders/core/rates/c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f"
requestSchema={{
  "type": "object",
  "properties": {
    "is_enabled": {
      "type": "boolean"
    },
    "cost": {
      "type": ["string", "number", "null"]
    },
    "condition_type": {
      "type": ["string", "null"],
      "enum": ["price", "weight", null]
    },
    "min": {
      "type": ["string", "number", "null"]
    },
    "max": {
      "type": ["string", "number", "null"]
    },
    "price_based_cost": {
      "type": ["array", "null"]
    },
    "weight_based_cost": {
      "type": ["array", "null"]
    }
  },
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "core_shipping_method_rate_id": 11,
    "uuid": "c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f",
    "method_id": 4,
    "zone_id": 3,
    "is_enabled": true,
    "cost": "7.99",
    "condition_type": null,
    "min": null,
    "max": null,
    "price_based_cost": null,
    "weight_based_cost": null
  }
}`}
/>

The method and zone bindings are fixed at creation and cannot be patched. To move a rate, delete it and create a new one.

Errors: `400 Core shipping rate not found`.

<hr />

### Delete A Rate

`{uuid}` is the rate **uuid**. Takes no request body. The method itself survives; it simply stops being offered in that zone until a new rate is created.

<Api
method="DELETE"
url="/api/shippingProviders/core/rates/c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f"
responseSample={`{
  "data": {
    "deleted": true
  }
}`}
/>

Errors: `400 Core shipping rate not found`.

<hr />

## Related Documentation

- [Shipping Provider Development](/docs/development/knowledge-base/shipping-provider-development) — writing your own provider.
- [Shipping Zone API](./shipping-zone.md) — creating and editing the geography.
- [Shipping Method API](./shipping-method.md) — selecting a method on a cart at checkout.
- [Shipment API](./shipment.md) — fulfilling the order once it is placed.
