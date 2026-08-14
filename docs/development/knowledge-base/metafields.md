---
sidebar_position: 54
keywords:
  - metafield
  - custom field
  - meta_data
  - entity metadata
sidebar_label: Metafields
title: Metafields (Custom Fields)
description: Metafields let you attach typed, validated custom data to EverShop entities — products, categories, customers, orders, and more — store it in a JSONB column, and read it back through GraphQL.
---

# Metafields (Custom Fields)

**Metafields** are typed, validated custom fields you can attach to EverShop entities. A metafield **definition** describes one field — its type, validations, and which entity it belongs to — and each entity stores its **values** in a `meta_data` JSONB column. Definitions are ordinary database rows managed at runtime, so — unlike widgets or cron jobs — there is **no bootstrap registration and no registry lock**.

## Overview

The system has two halves:

- **Definitions** live in the shared `metafield_definition` table. A definition is keyed by an **owner type** (`product`, `category`, …), a **namespace** (default `custom`), and a **field key**. It carries the field's type, validation rules, and a `visible_to_customer` flag.
- **Values** live on the owning entity. Every metafield-capable table has a `meta_data jsonb NOT NULL DEFAULT '{}'` column shaped as `{ namespace: { key: value } }`. The store-wide `shop` owner has no entity table, so its values live in a single-row `metafield_shop` table.

Because the owner type is an open `varchar` (no foreign key, no enum), any module or extension can attach metafields to its own entities.

## Field types

A definition's type is one of ten values:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Type</th>
      <th>Stored value</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>short_text</code></td><td>string</td><td>Single-line text</td></tr>
    <tr><td><code>long_text</code></td><td>string</td><td>Multi-line text</td></tr>
    <tr><td><code>rich_text</code></td><td>block-editor <code>Row[]</code></td><td>The same content format as the CMS text widget</td></tr>
    <tr><td><code>integer</code></td><td>number</td><td>Whole numbers</td></tr>
    <tr><td><code>number</code></td><td>number</td><td>Decimals allowed</td></tr>
    <tr><td><code>boolean</code></td><td>boolean</td><td>True / false</td></tr>
    <tr><td><code>date</code></td><td>string</td><td><code>YYYY-MM-DD</code></td></tr>
    <tr><td><code>color</code></td><td>string</td><td>Hex color <code>#RRGGBB</code></td></tr>
    <tr><td><code>url</code></td><td>string</td><td>A URL</td></tr>
    <tr><td><code>group</code></td><td>object</td><td>A set of sub-fields (see below)</td></tr>
  </tbody>
</table>

Any type can be a **list** by setting `isList: true` — the stored value becomes an array of that type.

A **group** bundles sub-fields (each itself a `FieldDescriptor`) into an object; a group with `isList: true` stores an array of objects. Group nesting is capped at **three levels deep**.

### Validations

Each field can carry declarative validation rules, enforced server-side with [AJV](https://ajv.js.org/):

<table className="table-auto not-prose">
  <thead>
    <tr><th>Rule</th><th>Applies to</th><th>Constrains</th></tr>
  </thead>
  <tbody>
    <tr><td><code>size</code></td><td>text</td><td>Minimum and maximum string length (<code>min</code>, <code>max</code>)</td></tr>
    <tr><td><code>range</code></td><td>numeric</td><td>Minimum and maximum value (<code>min</code>, <code>max</code>)</td></tr>
    <tr><td><code>regexp</code></td><td>text</td><td>A regular-expression <code>pattern</code> the value must match</td></tr>
    <tr><td><code>choices</code></td><td>text / numeric</td><td>A predefined set of <code>values</code>; renders as a dropdown in the admin</td></tr>
  </tbody>
</table>

A validation rule is an object such as `{ "type": "size", "max": 120 }` or `{ "type": "choices", "values": ["a", "b"] }`. Validations also work on group sub-fields — for example, a `choices` rule on a sub-field renders a select in the admin repeater.

## Entities that support metafields

Eight owner types are wired end to end (value column, write path, GraphQL exposure, admin editor, and value cleanup on definition delete):

<table className="table-auto not-prose">
  <thead>
    <tr><th>Owner type</th><th>Value storage</th><th>Module</th></tr>
  </thead>
  <tbody>
    <tr><td><code>product</code></td><td><code>product.meta_data</code></td><td>catalog</td></tr>
    <tr><td><code>category</code></td><td><code>category.meta_data</code></td><td>catalog</td></tr>
    <tr><td><code>collection</code></td><td><code>collection.meta_data</code></td><td>catalog</td></tr>
    <tr><td><code>customer</code></td><td><code>customer.meta_data</code></td><td>customer</td></tr>
    <tr><td><code>order</code></td><td><code>order.meta_data</code></td><td>oms</td></tr>
    <tr><td><code>shop</code></td><td><code>metafield_shop</code> (singleton)</td><td>base</td></tr>
    <tr><td><code>blog_post</code></td><td><code>blog_post.meta_data</code></td><td>blog</td></tr>
    <tr><td><code>blog_category</code></td><td><code>blog_category.meta_data</code></td><td>blog</td></tr>
  </tbody>
</table>

A definition can be created for any owner-type string, but only these eight render and edit out of the box. Wiring a **new** owner type is an extension task (a `meta_data` column, a write path, a GraphQL field, and a prune subscriber).

## Declaring a definition from an extension

Metafield definitions are database rows, not a bootstrap-locked registry — so an extension declares one in a **migration**, not in `bootstrap.ts`. (Bootstrap runs *before* migrations, so the table may not exist yet on a fresh install.) Use `INSERT … ON CONFLICT DO NOTHING` so the migration is idempotent and never clobbers a merchant's own definition:

```ts
import { execute, type PoolClient } from '@evershop/postgres-query-builder';

export default async (connection: PoolClient): Promise<void> => {
  await execute(
    connection,
    `INSERT INTO "metafield_definition"
       ("owner_type", "namespace", "field_key", "name", "field_type", "visible_to_customer")
     VALUES ('product', 'loyalty', 'points', 'Loyalty points', 'integer', TRUE)
     ON CONFLICT ("owner_type", "namespace", "field_key") DO NOTHING`
  );
};
```

For programmatic creation at runtime (for example, from a subscriber or an admin action), use the library service. It compiles and validates the descriptor, rejects duplicates, and emits a `metafield_definition_created` event:

```ts
import { createMetafieldDefinition } from '@evershop/evershop/lib/metafield';

await createMetafieldDefinition({
  ownerType: 'product',
  namespace: 'loyalty',
  key: 'points',
  name: 'Loyalty points',
  type: 'integer',
  validations: [{ type: 'range', min: 0 }]
});
```

Five owner types ship an owner-scoped helper that bakes in the owner type: `addProductMetafieldDefinition`, `addCategoryMetafieldDefinition` and `addCollectionMetafieldDefinition` from `@evershop/evershop/catalog/services`, `addCustomerMetafieldDefinition` from `@evershop/evershop/customer/services`, and `addOrderMetafieldDefinition` from `@evershop/evershop/oms/services`. There is **no** `addBlogPostMetafieldDefinition`, `addBlogCategoryMetafieldDefinition` or publicly-exported `addShopMetafieldDefinition` — for those owners, call `createMetafieldDefinition` with an explicit `ownerType`.

```ts
import { addProductMetafieldDefinition } from '@evershop/evershop/catalog/services';

await addProductMetafieldDefinition({
  namespace: 'loyalty',
  key: 'points',
  name: 'Loyalty points',
  type: 'integer'
});
```

:::note
`ownerType`, `namespace`, `key`, `type`, and `isList` are **immutable** after creation — changing any of them would orphan the stored values. `name`, `description`, `validations`, and `visibleToCustomer` can be updated.
:::

Merchants can also create and edit definitions with no code, from the **Custom fields** card that appears on each entity's edit page in the admin.

## Writing values

**Products, categories, collections, and blog entities** accept a `metafields` key in their ordinary create/update API payload; it is folded into the `meta_data` column on save:

```json
{
  "name": "Ethiopia Yirgacheffe",
  "metafields": {
    "loyalty": { "points": 50 }
  }
}
```

**Customers, orders, and the shop** are edit-only through dedicated endpoints — `PATCH /api/customers/:id/metafields`, `PATCH /api/orders/:id/metafields`, and `PATCH /api/shop/metafields` — each taking `{ "metafields": { … } }`.

**Some** owners also expose service functions for extension code — `setProductMetafields(id, values)` writes the full set, and `setProductMetafield(id, namespace, key, value)` writes a single field (a blank value removes the key).

<table className="table-auto not-prose">
  <thead>
    <tr><th>Owner type</th><th>Service functions</th><th>Import path</th></tr>
  </thead>
  <tbody>
    <tr><td><code>product</code>, <code>category</code>, <code>collection</code></td><td><code>set&lt;Owner&gt;Metafields</code>, <code>set&lt;Owner&gt;Metafield</code></td><td><code>@evershop/evershop/catalog/services</code></td></tr>
    <tr><td><code>customer</code></td><td><code>setCustomerMetafields</code>, <code>setCustomerMetafield</code></td><td><code>@evershop/evershop/customer/services</code></td></tr>
    <tr><td><code>order</code></td><td><code>setOrderMetafields</code>, <code>setOrderMetafield</code></td><td><code>@evershop/evershop/oms/services</code></td></tr>
    <tr><td><code>shop</code></td><td><code>setShopMetafields</code>, <code>setShopMetafield</code>, <code>getShopMetaData</code> — <strong>no public export path</strong> (the <code>base</code> module has no service barrel in <code>package.json</code> exports). Use the <code>PATCH /api/shop/metafields</code> endpoint instead.</td><td>—</td></tr>
    <tr><td><code>blog_post</code>, <code>blog_category</code></td><td><strong>None.</strong> Write values through the blog create/update API payload.</td><td>—</td></tr>
  </tbody>
</table>

Values are validated against the owner's definitions before they are written: unknown keys are dropped, required fields are enforced, and each value is checked against its compiled schema.

## Reading values with GraphQL

Every metafield-capable type exposes two storefront-visible fields — `metafields(namespace)` and `metafield(namespace, key)` — returning the shared `Metafield` type:

```graphql
query {
  product(id: "…") {
    metafields(namespace: "loyalty") {
      namespace
      key
      type
      value
    }
    metafield(namespace: "loyalty", key: "points") {
      value
    }
  }
}
```

```graphql
type Metafield {
  namespace: String!
  key: String!
  type: MetafieldType!
  value: JSON
}
```

Shop metafields are read from the `setting` root, which is available on any page:

```graphql
query {
  setting {
    metafields(namespace: "custom") {
      key
      value
    }
  }
}
```

A few things to know about the read path:

- **Audience gating.** Fields whose definition has `visibleToCustomer: false` are dropped from customer-facing responses. On the storefront a request always resolves as the `customer` audience, so admin-only fields never leak.
- **Every defined field appears.** A field with no stored value comes back with `value: null` rather than being absent — the list is driven by the definitions, not by what happens to be stored.
- **Raw values are admin-only.** The unfiltered `meta_data` object is exposed as `metaData: JSON` on the admin schema only; the storefront sees the shaped, audience-gated `metafields` fields.

### Request-scoped caching

Shaping metafields loads the owner's definitions from the database. To keep listing pages efficient — a category page rendering `metafields` on 48 product cards would otherwise issue 48 identical definition queries — resolution is memoized **per request**. A definition cache is created once per GraphQL request and shared across every resolver, so each owner type's definitions are loaded **once per request** regardless of how many entities render. The cache lives and dies with the request, so an admin editing a definition sees the change on the very next page load — there is no stale cross-request cache to invalidate.

## Theme-provisioned definitions

A definition carries an optional `provisioned_by_theme` attribution column. Themes declare the metafields they depend on, and the provisioner seeds them at install/boot, stamping the theme name onto each row it creates. Rows created by hand (admin UI, migration, `createMetafieldDefinition`) leave the column `NULL`. A definition that already exists and is *unowned* can be claimed by the first theme that seeds it — first seeder wins.

The base module seeds one such definition itself: `shop / custom / copyright` (`modules/base/migration/Version-1.0.6.ts`), a `short_text` field that drives the storefront footer copyright line. The `themeConfig` GraphQL resolver overlays its value onto `themeConfig.copyRight`, so the merchant-edited value wins and the config value is only the fallback.

## Deleting a definition

Deleting a definition (`DELETE /api/metafield-definitions/:uuid`) removes the row and emits a `metafield_definition_deleted` event. Each owning module has a subscriber that **prunes** the deleted key from every row of its table's `meta_data`, so no orphaned values are left behind. Because this runs through the event system, cleanup is asynchronous — the values are already invisible to GraphQL (shaping is definition-driven) and are physically removed shortly after.

:::warning
**409 theme-provenance guard.** If the definition's `provisioned_by_theme` names the currently active theme — or any theme present in `theme_install_state` — the delete is **refused with a 409**. Deleting it would fire the store-wide prune and drop every stored value, and the theme would just re-seed the definition empty at the next boot.

Pass `?force=true` to override:

```bash
curl -X DELETE "https://mystore.com/api/metafield-definitions/<uuid>?force=true" \
  -H "Authorization: Bearer $TOKEN"
```

The guard self-disables on databases that predate the attribution column, and never applies to definitions with `provisioned_by_theme` unset.
:::

## See also

- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — the fold processors that move `metafields` payloads into `meta_data`
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — the mechanism behind value pruning
- [GraphQL](/docs/development/knowledge-base/graphql) — how the schema is assembled per module
- [Database](/docs/development/knowledge-base/database) — the typed query builder and JSONB columns

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
