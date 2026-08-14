---
sidebar_position: 24
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Metafield
  - Metafield Definition
  - Custom Fields
  - REST API
sidebar_label: Metafield Definition
title: Metafield Definition REST API
description: Define and manage EverShop metafields — typed custom fields on products, categories, collections, customers, orders and the shop itself — and write their values through the REST API.
---

import Api from '@site/src/components/rest/Api';

# Metafield Definition API

## Overview

A **metafield definition** declares a typed custom field on some kind of entity: a "Care instructions" long text on products, a "Gift message" short text on orders, a "Loyalty tier" choice on customers. The definition describes the field; the **values** live in each entity's `meta_data` JSONB column and are validated against the definition on every write.

A definition is identified by the triple `(ownerType, namespace, key)`, which is unique.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Part</th>
      <th className="text-left">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>ownerType</code></td>
      <td>What kind of entity carries the field. Open varchar, so an extension can introduce its own owner without core enumerating it.</td>
    </tr>
    <tr>
      <td><code>namespace</code></td>
      <td>Grouping, defaults to <code>custom</code>. Themes and extensions should declare fields in their own namespace and leave <code>custom</code> to the merchant.</td>
    </tr>
    <tr>
      <td><code>key</code></td>
      <td>The field's identifier within the namespace.</td>
    </tr>
  </tbody>
</table>

Core wires these owner types end to end — a definition on any other owner will exist, but nothing renders or edits it until an extension wires the owner:

`product`, `category`, `collection`, `customer`, `order`, `shop`, `blog_post`, `blog_category`

:::info This REST API is the only way to write a definition
There is no GraphQL mutation for definitions and no standalone admin page or grid for them. The admin surfaces that do exist — the "Custom Fields" section on the product, category and collection edit forms, and the page-builder's metafield drawer — are clients of these very endpoints. GraphQL exposes a **read-only** admin query, `metafieldDefinitions(ownerType: String!)`, mirroring `GET /api/metafield-definitions`.
:::

:::warning Request keys and response keys differ
Requests use `fieldKey` and `fieldType`. Responses use `key` and `type`. The other properties keep the same name in both directions. Error messages about immutability also use the response names — changing `fieldKey` reports `"key" cannot be changed after creation`.
:::

## Definition Endpoints

### List Definitions

Returns every definition for one owner type, ordered by `position` ascending with the internal id as a stable tie-breaker.

<Api
method="GET"
url="/api/metafield-definitions?ownerType=product"
responseSample={`{
  "data": [
    {
      "uuid": "3f2b6c8d-1a4e-4b90-8c7d-5e6f0a1b2c3d",
      "ownerType": "product",
      "namespace": "custom",
      "key": "care_instructions",
      "name": "Care instructions",
      "description": "Shown on the product page under the description",
      "type": "long_text",
      "isList": false,
      "required": false,
      "translatable": false,
      "visibleToCustomer": true,
      "validations": [
        { "type": "size", "max": 2000 }
      ],
      "appearance": {
        "placeholder": "Machine wash cold"
      },
      "subFields": [],
      "position": 0
    }
  ]
}`}
/>

:::caution `ownerType` is a required query parameter
Calling `GET /api/metafield-definitions` with no `ownerType` returns `400 ownerType query parameter is required`. There is no "list everything" mode.
:::

`provisionedByTheme` appears on the definition only when a theme seeded it; merchant- and extension-created fields omit the property entirely.

<hr />

### Create A Definition

<Api
method="POST"
url="/api/metafield-definitions"
requestSchema={{
  "type": "object",
  "properties": {
    "ownerType": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "ownerType must be a string",
        "minLength": "ownerType is required"
      }
    },
    "namespace": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_]*$",
      "errorMessage": {
        "pattern": "namespace must start with a letter and contain only lowercase letters, digits, or underscores"
      }
    },
    "fieldKey": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_]*$",
      "errorMessage": {
        "pattern": "fieldKey must start with a letter and contain only lowercase letters, digits, or underscores"
      }
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "minLength": "Field name is required"
      }
    },
    "description": {
      "type": "string"
    },
    "fieldType": {
      "type": "string",
      "enum": [
        "short_text",
        "long_text",
        "rich_text",
        "integer",
        "number",
        "boolean",
        "date",
        "color",
        "url",
        "group"
      ],
      "errorMessage": {
        "enum": "fieldType must be one of the supported metafield types"
      }
    },
    "isList": {
      "type": "boolean"
    },
    "required": {
      "type": "boolean"
    },
    "translatable": {
      "type": "boolean"
    },
    "visibleToCustomer": {
      "type": "boolean"
    },
    "validations": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "appearance": {
      "type": "object"
    },
    "subFields": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "position": {
      "type": "integer"
    },
    "provisionedByActiveTheme": {
      "type": "boolean"
    }
  },
  "required": ["ownerType", "fieldKey", "name", "fieldType"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "uuid": "3f2b6c8d-1a4e-4b90-8c7d-5e6f0a1b2c3d",
    "ownerType": "product",
    "namespace": "custom",
    "key": "care_instructions",
    "name": "Care instructions",
    "description": "Shown on the product page under the description",
    "type": "long_text",
    "isList": false,
    "required": false,
    "translatable": false,
    "visibleToCustomer": true,
    "validations": [
      { "type": "size", "max": 2000 }
    ],
    "appearance": {
      "placeholder": "Machine wash cold"
    },
    "subFields": [],
    "position": 0
  }
}`}
/>

`additionalProperties` is `false` — an unrecognised key is rejected with `Unknown property in body — check the payload keys`.

Defaults: `namespace` `"custom"`, `isList` `false`, `required` `false`, `translatable` `false`, `visibleToCustomer` `true`, `validations` `[]`, `appearance` `{}`, `subFields` `[]`, `position` `0`.

Errors: `409` when `(ownerType, namespace, fieldKey)` already exists — `A metafield definition "custom.care_instructions" already exists for "product"`. `400` for schema violations and for a descriptor that will not compile (see `subFields` below).

<hr />

## The Definition Schema

### Field types

`fieldType` is a closed, core-defined enum backed by a Postgres enum type.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Type</th>
      <th className="text-left">Accepted value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>short_text</code>, <code>long_text</code>, <code>url</code></td>
      <td>String.</td>
    </tr>
    <tr>
      <td><code>rich_text</code></td>
      <td>EverShop block-editor content, validated opaquely as an array of rows. A list holds one document per item as <code>{"{ content: Row[] }"}</code>. Structurally empty content counts as unset.</td>
    </tr>
    <tr>
      <td><code>integer</code></td>
      <td>Integer.</td>
    </tr>
    <tr>
      <td><code>number</code></td>
      <td>Number.</td>
    </tr>
    <tr>
      <td><code>boolean</code></td>
      <td>Boolean.</td>
    </tr>
    <tr>
      <td><code>date</code></td>
      <td>String in JSON Schema <code>date</code> format.</td>
    </tr>
    <tr>
      <td><code>color</code></td>
      <td>String matching <code>^#([0-9a-fA-F]{"{6}"})$</code> — six hex digits, no shorthand, no alpha.</td>
    </tr>
    <tr>
      <td><code>group</code></td>
      <td>Object composed from <code>subFields</code>. Requires a non-empty <code>subFields</code> array.</td>
    </tr>
  </tbody>
</table>

### `isList`

When `true`, the stored value is an array of the field's type instead of a single value. This applies at every level, including inside a group's sub-fields. It is immutable after creation, because flipping it would invalidate every stored value.

### `translatable` and `visibleToCustomer`

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Property</th>
      <th className="text-left">Default</th>
      <th className="text-left">Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>translatable</code></td>
      <td><code>false</code></td>
      <td>Marks the field as intended to vary per locale. Stored and returned, but core does not yet fork storage on it — theme provisioning warns when a declared field sets it.</td>
    </tr>
    <tr>
      <td><code>visibleToCustomer</code></td>
      <td><code>true</code></td>
      <td>Gates the storefront audience. Fields with <code>false</code> are dropped when metafields are shaped for a customer-facing response, so admin-only notes never leak.</td>
    </tr>
  </tbody>
</table>

### `subFields`

Only meaningful for `fieldType: "group"`, where it is required and must be non-empty. Each entry is a recursive field descriptor with the same shape as a definition minus the placement metadata:

```json
{
  "ownerType": "product",
  "fieldKey": "warranty",
  "name": "Warranty",
  "fieldType": "group",
  "subFields": [
    {
      "key": "duration_months",
      "name": "Duration (months)",
      "type": "integer",
      "validations": [{ "type": "range", "min": 0, "max": 120 }]
    },
    {
      "key": "provider",
      "name": "Provider",
      "type": "short_text"
    }
  ]
}
```

Sub-field descriptors use `key` and `type` — the `fieldKey` / `fieldType` spelling applies only to the top level of the request body. Keys stay camelCase all the way down, including inside the persisted JSONB.

Groups may nest, but the root group counts as level 1 and the maximum depth is **3**. Exceeding it is rejected with `400 Group nesting exceeds max depth 3 at "<key>"`. A non-group field must not carry `subFields`; the database enforces the "sub-fields if and only if group" invariant with a `CHECK` constraint.

### `validations`

An array of rule objects compiled into the JSON Schema used to validate values.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Rule</th>
      <th className="text-left">Properties</th>
      <th className="text-left">Compiles to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>size</code></td>
      <td><code>min</code>, <code>max</code> (numbers)</td>
      <td><code>minLength</code> / <code>maxLength</code> — string length.</td>
    </tr>
    <tr>
      <td><code>range</code></td>
      <td><code>min</code>, <code>max</code> (numbers)</td>
      <td><code>minimum</code> / <code>maximum</code> — numeric bounds.</td>
    </tr>
    <tr>
      <td><code>regexp</code></td>
      <td><code>pattern</code> (string)</td>
      <td><code>pattern</code>.</td>
    </tr>
    <tr>
      <td><code>choices</code></td>
      <td><code>values</code> (array of string or number)</td>
      <td><code>enum</code>.</td>
    </tr>
  </tbody>
</table>

Unrecognised rule types are ignored rather than rejected. Validations do not apply to `group` fields — nest them on the sub-fields instead — and `rich_text` is validated only as an array.

### `appearance`

A free-form object, but only one key carries meaning: `placeholder`, a string rendered as the input's placeholder in the admin editor. Theme provisioning emits a warning for any other key.

### `position`

Integer sort order within the owner type, default `0`. Ties break on internal id, so the list order stays stable across updates.

<hr />

### Update A Definition

`{uuid}` is the definition **uuid**. Only the fields present in the body are written.

<Api
method="PATCH"
url="/api/metafield-definitions/3f2b6c8d-1a4e-4b90-8c7d-5e6f0a1b2c3d"
requestSchema={{
  "type": "object",
  "properties": {
    "ownerType": {
      "type": "string"
    },
    "namespace": {
      "type": "string"
    },
    "fieldKey": {
      "type": "string"
    },
    "fieldType": {
      "type": "string"
    },
    "isList": {
      "type": "boolean"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "minLength": "Field name cannot be empty"
      }
    },
    "description": {
      "type": "string"
    },
    "required": {
      "type": "boolean"
    },
    "translatable": {
      "type": "boolean"
    },
    "visibleToCustomer": {
      "type": "boolean"
    },
    "validations": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "appearance": {
      "type": "object"
    },
    "subFields": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "position": {
      "type": "integer"
    }
  },
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "uuid": "3f2b6c8d-1a4e-4b90-8c7d-5e6f0a1b2c3d",
    "ownerType": "product",
    "namespace": "custom",
    "key": "care_instructions",
    "name": "Care & washing",
    "description": "Shown on the product page under the description",
    "type": "long_text",
    "isList": false,
    "required": true,
    "translatable": false,
    "visibleToCustomer": true,
    "validations": [
      { "type": "size", "max": 4000 }
    ],
    "appearance": {
      "placeholder": "Machine wash cold"
    },
    "subFields": [],
    "position": 2
  }
}`}
/>

:::danger Five properties are immutable
`ownerType`, `namespace`, `fieldKey`, `fieldType` and `isList` are fixed at creation. They are accepted in the request body so a client can round-trip a whole definition, but the value must match what is already stored:

- Sending an **unchanged** value is a no-op.
- Sending a **different** value fails with `400 "<field>" cannot be changed after creation`, where `<field>` is the internal name — `ownerType`, `namespace`, `key`, `type` or `isList`.

Changing any of them would invalidate the values already stored across every row of the owner's table. To restructure a field, create a new definition and migrate the values.
:::

Every other property can be changed freely, including `required` — tightening it does not retroactively reject stored rows, but the next write to any entity of that owner type must supply a value.

When `validations` or `subFields` change, the whole descriptor is recompiled first; a result that will not compile (depth overflow, a malformed group) is rejected with `400` and nothing is written.

Errors: `404 Metafield definition "<uuid>" not found`, `400` for immutability and compilation failures, and `Unknown property in body — check the payload keys` for an unrecognised key.

<hr />

### Delete A Definition

`{uuid}` is the definition **uuid**. Takes no request body.

<Api
method="DELETE"
url="/api/metafield-definitions/3f2b6c8d-1a4e-4b90-8c7d-5e6f0a1b2c3d"
responseSample={`{
  "data": {
    "uuid": "3f2b6c8d-1a4e-4b90-8c7d-5e6f0a1b2c3d"
  }
}`}
/>

:::danger Deleting a definition destroys its values store-wide
The delete and the value cleanup run in one transaction. Removing the row emits `metafield_definition_deleted`, and each owning module's prune subscriber strips that key out of the `meta_data` of **every** row of its table. There is no undo and no per-entity scope — this is not a soft delete.
:::

Errors: `404 Metafield definition "<uuid>" not found`, and the `409` described below.

#### The theme-provenance guard

A definition seeded by a theme's `theme.json` carries the theme's id in `provisioned_by_theme`. Deleting such a definition is refused with `409` when that theme is either the **active** theme or still present in `theme_install_state`:

```
"custom.care_instructions" is provisioned by theme "mytheme" — deleting it would
drop stored values store-wide and the theme will re-seed it. Pass force to delete
anyway.
```

The refusal is not merely protective bookkeeping: the theme would re-seed the definition empty at the next boot, so the delete would destroy every stored value and hand back a blank field.

Override it with the `force` query parameter:

```
DELETE /api/metafield-definitions/{uuid}?force=true
```

Only the exact string `true` counts. The guard also self-disables in two cases: when `provisionedByTheme` is unset (merchant- or extension-created fields, and rows predating the column), and when the naming theme is neither active nor installed — an orphaned attribution left behind by an uninstalled theme.

`POST /api/metafield-definitions` can opt a new definition into this protection with `provisionedByActiveTheme: true`, which stamps `provisioned_by_theme` with the server-resolved active theme. That is what the page-builder drawer sends when a designer adds a field the theme is going to depend on.

<hr />

## Writing Metafield Values

Definitions describe the shape; these endpoints write the data. The payload is always the same:

```json
{
  "metafields": {
    "custom": {
      "care_instructions": "Machine wash cold, line dry",
      "warranty": {
        "duration_months": 24,
        "provider": "Acme"
      }
    }
  }
}
```

`metafields` is keyed **namespace → key → value**. It is exempt from HTML escaping so rich content survives the round trip.

:::warning These writes replace the whole value set
Validation walks every definition for the owner type and rebuilds `meta_data` from scratch. A key you omit is not preserved — it is erased. Read the current values first and send them back alongside your change.

At the same time, unknown keys are silently dropped rather than rejected, and repeater `_id` markers are stripped. So the response is the authoritative record of what was stored.
:::

Validation rejects the request with `400` on the first failure, scoped to the field: `"custom.care_instructions": must NOT have more than 2000 characters`, or `"custom.care_instructions" is required` when a `required` field resolves to empty. Blank values — `null`, `undefined`, `""`, an empty group, a structurally empty `rich_text` document — are treated as not provided rather than validated, so untouched optional fields never block a save.

### Update Shop Metafields

Store-wide values, held in a one-row singleton table rather than on any entity.

<Api
method="PATCH"
url="/api/shop/metafields"
requestSchema={{
  "type": "object",
  "properties": {
    "metafields": {
      "type": "object",
      "errorMessage": {
        "type": "Custom fields must be an object"
      }
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "metaData": {
      "custom": {
        "support_hours": "Mon-Fri 9-5",
        "returns_window_days": 30
      }
    }
  }
}`}
/>

<hr />

### Update Order Metafields

`{id}` is the order **uuid**.

<Api
method="PATCH"
url="/api/orders/2f8a1c40-9d31-4c5b-8f6e-3b1a7d0e5c92/metafields"
requestSchema={{
  "type": "object",
  "properties": {
    "metafields": {
      "type": "object",
      "errorMessage": {
        "type": "Custom fields must be an object"
      }
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "metaData": {
      "custom": {
        "gift_message": "Happy birthday!",
        "packing_note": "Fragile"
      }
    }
  }
}`}
/>

Errors: `404 Order not found`.

<hr />

### Update Customer Metafields

`{id}` is the customer **uuid**.

<Api
method="PATCH"
url="/api/customers/8c4e2b70-5f19-4a3d-b26c-9e0f1a2b3c4d/metafields"
requestSchema={{
  "type": "object",
  "properties": {
    "metafields": {
      "type": "object",
      "errorMessage": {
        "type": "Custom fields must be an object"
      }
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "metaData": {
      "custom": {
        "loyalty_tier": "gold",
        "birthday": "1990-04-17"
      }
    }
  }
}`}
/>

Errors: `404 Customer not found`.

<hr />

### Products, Categories And Collections

These three owners have **no** dedicated `/metafields` endpoint. Send a `metafields` object inside the ordinary create or update payload instead, with the same namespace → key → value shape and the same whole-set replacement semantics:

- `POST /api/products` and `PATCH /api/products/{id}` — see the [Product API](./product.md).
- `POST /api/categories` and `PATCH /api/categories/{id}` — see the [Category API](./category.md).
- `POST /api/collections` and `PATCH /api/collections/{id}` — see the [Collection API](./collection.md).

<hr />

## Reading Metafield Values With GraphQL

Each owning type exposes two audience-gated fields:

```graphql
metafields(namespace: String): [Metafield!]!
metafield(namespace: String!, key: String!): Metafield
```

A `Metafield` carries `namespace`, `key`, `type` and `value`. Resolution is gated by who is asking: with no logged-in admin user the resolver runs as the `customer` audience and drops every definition marked `visibleToCustomer: false`.

Alongside them, the admin schema exposes `metaData: JSON` — the raw, ungated blob. It is admin-only precisely because it does no audience filtering.

Definitions themselves are readable through the admin-only `metafieldDefinitions(ownerType: String!)` query. See the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).

## Related Documentation

- [Metafields (Custom Fields)](/docs/development/knowledge-base/metafields) — the model, theme provisioning and rendering.
- [Product API](./product.md), [Category API](./category.md), [Collection API](./collection.md) — inline metafield writes.
- [Order API](./order.md) and [Customer API](./customer.md) — the entities behind the dedicated value endpoints.
