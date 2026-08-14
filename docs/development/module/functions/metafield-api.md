---
sidebar_position: 133
since: 2.2.1
keywords:
- createMetafieldDefinition
- updateMetafieldDefinition
- deleteMetafieldDefinition
- listMetafieldDefinitions
- getMetafieldDefinition
- validateMetafields
- shapeMetafields
- buildProjection
- provisionThemeMetafields
- createDefinitionCache
- setProductMetafield
- metafields
groups:
- utilities
- catalog
sidebar_label: Metafield API
title: Metafield API Functions
description: Define, validate, shape and provision custom metafields on core entities.
---

# Metafield API Functions

Metafields attach merchant-defined structured data to core entities. A **definition** describes one field (its owner type, namespace, key, data type, validations); the **values** live in the owning table's `meta_data` JSONB column.

Two layers make up the public surface:

- `@evershop/evershop/lib/metafield` — owner-agnostic: definition CRUD, validation, output shaping, theme provisioning.
- The per-module service barrels — owner-scoped convenience wrappers with the owner baked in (`addProductMetafieldDefinition`, `setOrderMetafield`, …).

## Import

```ts
import {
  createMetafieldDefinition,
  updateMetafieldDefinition,
  deleteMetafieldDefinition,
  listMetafieldDefinitions,
  getMetafieldDefinition,
  validateMetafields,
  validateMetafield,
  shapeMetafields,
  buildProjection,
  provisionThemeMetafields,
  createDefinitionCache,
  listDefinitionsCached,
  compileField,
  WIRED_METAFIELD_OWNERS
} from '@evershop/evershop/lib/metafield';
```

```ts
import type {
  MetafieldDefinition,
  FieldDescriptor,
  MetafieldType,
  Validation,
  MetaData,
  ShapedMetafield,
  CreateDefinitionInput,
  UpdateDefinitionInput
} from '@evershop/evershop/lib/metafield';
```

:::info Definitions are **not** bootstrap-locked
Unlike widgets, carriers or payment methods, metafield definitions are ordinary database rows. They can be created, updated and deleted at runtime — from the admin UI, from a REST call, from a migration, from a cron job. There is no registry and no lock. The only thing that runs at boot is theme provisioning.
:::

## Types

```ts
type MetafieldType =
  | 'short_text' | 'long_text' | 'rich_text'
  | 'integer' | 'number' | 'boolean'
  | 'date' | 'color' | 'url' | 'group';

interface FieldDescriptor {
  key: string;
  name: string;
  description?: string;
  type: MetafieldType;
  isList?: boolean;
  required?: boolean;
  translatable?: boolean;
  validations?: Validation[];
  appearance?: Record<string, unknown>;
  subFields?: FieldDescriptor[];
}

interface MetafieldDefinition extends FieldDescriptor {
  uuid: string;
  ownerType: string;
  namespace: string;
  visibleToCustomer: boolean;
  position: number;
  provisionedByTheme?: string;
}

/** Values, keyed namespace -> field key -> value. */
type MetaData = Record<string, Record<string, unknown>>;
```

`group` fields nest via `subFields`; the root group is level 1 and the maximum depth is **3** (`MAX_DEPTH`).

## Owner types

`WIRED_METAFIELD_OWNERS` lists the owners with complete wiring — a `meta_data` column, a write path, a prune subscriber, storefront GraphQL and an admin card:

```ts
['product', 'category', 'collection', 'customer', 'order', 'shop', 'blog_post', 'blog_category']
```

`owner_type` is an open `varchar`, so other strings are accepted — but a definition for an unwired owner is silently inert. The theme-manifest validator warns about them.

---

## Definition CRUD

### createMetafieldDefinition

```ts
createMetafieldDefinition(
  input: CreateDefinitionInput
): Promise<MetafieldDefinition>
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>ownerType</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>One of the wired owners (or a custom string).</td>
    </tr>
    <tr>
      <td><code>key</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Field key, unique per <code>(ownerType, namespace)</code>.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Admin-facing label.</td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td><code>MetafieldType</code></td>
      <td>Yes</td>
      <td>Data type.</td>
    </tr>
    <tr>
      <td><code>namespace</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Defaults to <code>'custom'</code>.</td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Help text.</td>
    </tr>
    <tr>
      <td><code>isList</code></td>
      <td><code>boolean</code></td>
      <td>No</td>
      <td>Repeatable field. Defaults to <code>false</code>.</td>
    </tr>
    <tr>
      <td><code>required</code></td>
      <td><code>boolean</code></td>
      <td>No</td>
      <td>Defaults to <code>false</code>.</td>
    </tr>
    <tr>
      <td><code>translatable</code></td>
      <td><code>boolean</code></td>
      <td>No</td>
      <td>Defaults to <code>false</code>.</td>
    </tr>
    <tr>
      <td><code>visibleToCustomer</code></td>
      <td><code>boolean</code></td>
      <td>No</td>
      <td>Defaults to <code>true</code>. <code>false</code> hides the field from the storefront audience.</td>
    </tr>
    <tr>
      <td><code>validations</code></td>
      <td><code>Validation[]</code></td>
      <td>No</td>
      <td><code>size</code> / <code>range</code> / <code>regexp</code> / <code>choices</code>.</td>
    </tr>
    <tr>
      <td><code>appearance</code></td>
      <td><code>Record&lt;string, unknown&gt;</code></td>
      <td>No</td>
      <td>UI hints. <code>appearance.placeholder</code> is the single source of a storefront default.</td>
    </tr>
    <tr>
      <td><code>subFields</code></td>
      <td><code>FieldDescriptor[]</code></td>
      <td>No</td>
      <td>Only for <code>type: 'group'</code>.</td>
    </tr>
    <tr>
      <td><code>position</code></td>
      <td><code>number</code></td>
      <td>No</td>
      <td>Sort order. Defaults to <code>0</code>.</td>
    </tr>
    <tr>
      <td><code>provisionedByTheme</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Theme attribution. Setting it opts the row into the deletion guard below.</td>
    </tr>
  </tbody>
</table>

**Returns** the created `MetafieldDefinition` and emits `metafield_definition_created`.

**Throws** (errors carry a `status` property):

<table className="table-auto not-prose">
  <thead>
    <tr><th>Status</th><th>Condition</th></tr>
  </thead>
  <tbody>
    <tr><td><code>400</code></td><td><code>ownerType</code>, <code>key</code>, <code>name</code> or <code>type</code> missing.</td></tr>
    <tr><td><code>400</code></td><td>The descriptor does not compile — nesting deeper than 3 levels, a malformed group, an unusable validation.</td></tr>
    <tr><td><code>409</code></td><td><code>A metafield definition "&lt;namespace&gt;.&lt;key&gt;" already exists for "&lt;ownerType&gt;"</code>.</td></tr>
  </tbody>
</table>

```ts
import { createMetafieldDefinition } from '@evershop/evershop/lib/metafield';

const def = await createMetafieldDefinition({
  ownerType: 'product',
  namespace: 'spec',
  key: 'care_instructions',
  name: 'Care instructions',
  type: 'long_text',
  visibleToCustomer: true,
  validations: [{ type: 'size', max: 500 }]
});
```

### updateMetafieldDefinition

```ts
updateMetafieldDefinition(
  uuid: string,
  patch: UpdateDefinitionInput
): Promise<MetafieldDefinition>
```

Patches the mutable fields: `name`, `description`, `required`, `translatable`, `visibleToCustomer`, `validations`, `appearance`, `subFields`, `position`. Emits `metafield_definition_updated`.

**Throws:**

<table className="table-auto not-prose">
  <thead>
    <tr><th>Status</th><th>Condition</th></tr>
  </thead>
  <tbody>
    <tr><td><code>404</code></td><td><code>Metafield definition "&lt;uuid&gt;" not found</code>.</td></tr>
    <tr><td><code>400</code></td><td><code>"&lt;field&gt;" cannot be changed after creation</code> — the immutable set is <code>ownerType</code>, <code>namespace</code>, <code>key</code>, <code>type</code>, <code>isList</code>. Passing the same value is a no-op; passing a different one throws.</td></tr>
    <tr><td><code>400</code></td><td>The patched descriptor no longer compiles.</td></tr>
  </tbody>
</table>

### deleteMetafieldDefinition

```ts
deleteMetafieldDefinition(
  uuid: string,
  opts?: { force?: boolean }
): Promise<void>
```

Deletes the definition and, in the same transaction, emits `metafield_definition_deleted` with `{ ownerType, namespace, fieldKey }`. Each owning module's prune subscriber strips that key from every row of its table's `meta_data` — so **deleting a definition drops the stored values store-wide**.

**Throws:**

<table className="table-auto not-prose">
  <thead>
    <tr><th>Status</th><th>Condition</th></tr>
  </thead>
  <tbody>
    <tr><td><code>404</code></td><td><code>Metafield definition "&lt;uuid&gt;" not found</code>.</td></tr>
    <tr><td><code>409</code></td><td>Theme-provenance guard — see below.</td></tr>
  </tbody>
</table>

:::danger The 409 theme-provenance guard
A definition carrying `provisionedByTheme` is protected when that theme is the **active** theme, or when it appears in `theme_install_state`. Deleting it would drop values store-wide *and* the theme would re-seed the field empty at the next boot. The error reads:

```
"<namespace>.<key>" is provisioned by theme "<theme>" — deleting it would drop
stored values store-wide and the theme will re-seed it. Pass force to delete anyway.
```

Pass `{ force: true }` to override. Rows created before the attribution column existed have no `provisionedByTheme`, so the guard self-disables for them.
:::

### listMetafieldDefinitions

```ts
listMetafieldDefinitions(ownerType: string): Promise<MetafieldDefinition[]>
```

All definitions for an owner, ordered by `position ASC` then by the serial primary key (a deterministic tie-break — `position` defaults to `0` for every row, so without it the order reshuffles on every update).

### getMetafieldDefinition

```ts
getMetafieldDefinition(uuid: string): Promise<MetafieldDefinition | null>
```

One definition by UUID, or `null`. Does not throw.

---

## validateMetafields

```ts
validateMetafields(ownerType: string, input?: MetaData): Promise<MetaData>
```

Validate a full values object against an owner's definitions and return **the object to persist**. Defaults applied, unknown keys dropped, repeater `_id` keys stripped.

Blank values (`undefined`, `null`, `''`, structurally-empty rich text) are normalised to "not provided" rather than validated — the admin form serializes every field on submit, so without this a single untouched optional `date` would fail AJV and abort the whole save.

**Returns** a `MetaData` object safe to write into `meta_data`.

**Throws** (status `400`) on the first failure, with a field-scoped message:

- `"<namespace>.<key>" is required`
- `"<namespace>.<key>": <ajv message>`

```ts
import { validateMetafields } from '@evershop/evershop/lib/metafield';
import { update } from '@evershop/evershop/lib/postgres/query';

const metaData = await validateMetafields('product', {
  spec: { care_instructions: 'Machine wash cold' }
});

await update('product')
  .given({ meta_data: metaData })
  .where('product_id', '=', productId)
  .execute(pool);
```

### validateMetafield

```ts
validateMetafield(
  ownerType: string,
  namespace: string,
  key: string,
  value: unknown
): Promise<unknown>
```

Validate a single field for partial / out-of-band writes. Returns the cleaned value, or `undefined` when the value is blank and the field is optional.

**Throws** (status `400`) on `No metafield "<namespace>.<key>" on "<ownerType>"`, on a required-but-blank value, or on an AJV failure.

---

## shapeMetafields

```ts
shapeMetafields(
  metaData: MetaData,
  ownerType: string,
  opts: {
    audience: 'admin' | 'customer';
    namespace?: string;
    cache?: DefinitionCache;
  }
): Promise<ShapedMetafield[]>
```

Zip a stored `meta_data` object with its owner's definitions for output. Every defined field appears in the result, with `value: null` when unset — so the consumer sees the full schema, not just the populated keys.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>audience</code></td>
      <td><code>'admin' | 'customer'</code></td>
      <td><strong>Required.</strong> <code>'customer'</code> drops every definition with <code>visibleToCustomer: false</code>. There is deliberately no "return everything" overload — the audience is mandatory so a caller cannot accidentally leak hidden fields.</td>
    </tr>
    <tr>
      <td><code>namespace</code></td>
      <td><code>string</code></td>
      <td>Restrict output to one namespace.</td>
    </tr>
    <tr>
      <td><code>cache</code></td>
      <td><code>DefinitionCache</code></td>
      <td>Request-scoped memo. Without it, every resolved field costs a definitions <code>SELECT</code>.</td>
    </tr>
  </tbody>
</table>

**Returns** `ShapedMetafield[]` — `{ namespace, key, type, value }`.

```ts
import { shapeMetafields } from '@evershop/evershop/lib/metafield';

const fields = await shapeMetafields(product.meta_data, 'product', {
  audience: 'customer',
  cache: context.metafieldDefinitionCache
});
```

---

## createDefinitionCache

```ts
createDefinitionCache(): DefinitionCache
listDefinitionsCached(ownerType: string, cache?: DefinitionCache): Promise<MetafieldDefinition[]>
```

`DefinitionCache` is a `Map<string, Promise<MetafieldDefinition[]>>`. Create one **per request** and pass it to `shapeMetafields`; core builds one at both GraphQL context sites and exposes it as `context.metafieldDefinitionCache`.

It stores **promises, not results**, so 48 card resolvers all missing an empty cache in the same tick share one in-flight query instead of racing 48 identical `SELECT`s.

:::warning Request-scoped on purpose
Definitions are runtime-mutable from the admin, so a process-lifetime or TTL cache would need an invalidation story. Per-request is always fresh and needs none. Do not hoist a `DefinitionCache` to module scope.
:::

```ts
import { createDefinitionCache } from '@evershop/evershop/lib/metafield';

const context = {
  metafieldDefinitionCache: createDefinitionCache()
};
```

---

## buildProjection

```ts
buildProjection(entries: ManifestMetafieldDefinition[]): MetafieldProjection
```

Pure function: turn a theme's `theme.json` `metafieldDefinitions[]` array into a projection map keyed `owner.namespace.key`.

```ts
interface ProjectedDescriptor {
  type: MetafieldType;
  isList?: boolean;
  visibleToCustomer: boolean;
  name: string;
  description?: string;
  placeholder?: string;
}

type MetafieldProjection = Record<string, ProjectedDescriptor>;
```

Entries missing `ownerType`, `namespace`, `key` or `type` are skipped rather than throwing.

The projection is what the storefront `<Metafield>` component knows about the **declared** fields, independent of what the database currently holds. It exists because a customer-audience GraphQL response cannot distinguish "unset" from "hidden" from "not defined yet" — all three are simply absent. Without the declaration, a `visibleToCustomer: false` field's `value ?? defaultValue` would render its default publicly.

`loadThemeMetafieldProjection()` is the companion that reads the active theme's manifest synchronously and calls `buildProjection`. It never throws — a broken manifest returns `{}` rather than breaking rendering.

---

## provisionThemeMetafields

```ts
provisionThemeMetafields(
  themeId: string,
  entries: ManifestMetafieldDefinition[],
  pool: Pool
): Promise<ProvisionResult>
```

Ensure a theme's declared metafield definitions exist. Idempotent and always safe to re-run — core runs it at `theme:active` and at every server boot after migrations, in its own transaction.

Per declared entry:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Situation</th>
      <th>Outcome</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>No definition with that <code>(ownerType, namespace, key)</code></td>
      <td><strong>seeded</strong> — atomic <code>INSERT … ON CONFLICT DO NOTHING</code>, stamped <code>provisioned_by_theme</code>, plus a <code>metafield_definition_created</code> event.</td>
    </tr>
    <tr>
      <td>Exists, immutables (<code>type</code>, <code>isList</code>) match</td>
      <td><strong>adopted</strong> — attribution claimed only when the row is unowned (first seeder wins). Mutable drift is warned about and kept; nothing is auto-patched.</td>
    </tr>
    <tr>
      <td>Exists, immutables differ</td>
      <td><strong>conflict</strong> — reported, never applied, never claimed. <code>updateMetafieldDefinition</code> could not converge them anyway.</td>
    </tr>
    <tr>
      <td>Attributed to this theme but no longer declared</td>
      <td><strong>retired</strong> — a read-time report only. The definition stays in place; nothing is deleted.</td>
    </tr>
  </tbody>
</table>

**Returns** `ProvisionResult`:

```ts
interface ProvisionResult {
  seeded: string[];      // 'owner.namespace.key' refs
  adopted: string[];
  retired: string[];
  conflicts: Array<{ ref: string; details: ProvisionConflictDetail[] }>;
  warnings: ManifestDefinitionIssue[];
  errors: ManifestDefinitionIssue[];
  skipped: boolean;      // true when the attribution column doesn't exist yet
}
```

`skipped: true` means the database has not run this core version's migrations yet (for example `theme:active` on a project whose server has never booted this version). Callers degrade gracefully instead of erroring.

Supporting exports: `provisioningAvailable(pool)` (does the attribution column exist?), `validateManifestMetafieldDefinitions(entries)` (strict manifest lint returning `{ errors, warnings }`), `classifyIncumbent(declared, incumbent)` and `refOf({ ownerType, namespace, key })`.

:::note `required` is rejected in theme manifests
Seeding a required definition would make `validateMetafields` reject **every** entity save store-wide until values are backfilled, so the manifest validator refuses it.
:::

---

## Owner-scoped service helpers

Each wired owner that has a service barrel exposes the same three functions with the owner baked in.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Owner</th>
      <th>Import path</th>
      <th>Functions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>product</code></td>
      <td rowSpan={3}><code>@evershop/evershop/catalog/services</code></td>
      <td><code>addProductMetafieldDefinition</code>, <code>setProductMetafields</code>, <code>setProductMetafield</code></td>
    </tr>
    <tr>
      <td><code>category</code></td>
      <td><code>addCategoryMetafieldDefinition</code>, <code>setCategoryMetafields</code>, <code>setCategoryMetafield</code></td>
    </tr>
    <tr>
      <td><code>collection</code></td>
      <td><code>addCollectionMetafieldDefinition</code>, <code>setCollectionMetafields</code>, <code>setCollectionMetafield</code></td>
    </tr>
    <tr>
      <td><code>order</code></td>
      <td><code>@evershop/evershop/oms/services</code></td>
      <td><code>addOrderMetafieldDefinition</code>, <code>setOrderMetafields</code>, <code>setOrderMetafield</code></td>
    </tr>
    <tr>
      <td><code>customer</code></td>
      <td><code>@evershop/evershop/customer/services</code></td>
      <td><code>addCustomerMetafieldDefinition</code>, <code>setCustomerMetafields</code>, <code>setCustomerMetafield</code></td>
    </tr>
  </tbody>
</table>

### Signatures

```ts
addProductMetafieldDefinition(
  input: Omit<CreateDefinitionInput, 'ownerType'>
): Promise<MetafieldDefinition>

setProductMetafields(
  productId: number,
  values: MetaData,
  connection?: Pool | PoolClient
): Promise<void>

setProductMetafield(
  productId: number,
  namespace: string,
  key: string,
  value: unknown,
  connection?: Pool | PoolClient
): Promise<void>
```

The category, collection, order and customer variants are identical apart from the first parameter (`categoryId`, `collectionId`, `orderId`, `customerId`) and the table they write. `connection` defaults to the shared `pool`.

- **`set…Metafields`** is the form-save path: it runs `validateMetafields` and writes `meta_data` **wholesale**. Anything not in `values` is erased.
- **`set…Metafield`** is the out-of-band path (an extension writing a computed value): a targeted `jsonb_set` merge that creates the namespace object if missing and leaves every other key alone. A blank value **removes** the key rather than storing a JSON `null`.

```ts
import {
  addProductMetafieldDefinition,
  setProductMetafield
} from '@evershop/evershop/catalog/services';

await addProductMetafieldDefinition({
  namespace: 'spec',
  key: 'thread_count',
  name: 'Thread count',
  type: 'integer',
  validations: [{ type: 'range', min: 1, max: 2000 }]
});

// Later, from a subscriber — touches only this one key.
await setProductMetafield(productId, 'spec', 'thread_count', 400);
```

### Owners with no service functions

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Owner</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shop</code></td>
      <td>Helpers exist in the source (<code>addShopMetafieldDefinition</code>, <code>getShopMetaData</code>, <code>setShopMetafields</code>, <code>setShopMetafield</code>) but live in <code>modules/base/services/</code>, which is <strong>not reachable through the package exports map</strong> — only <code>./base/services/sitemap</code> is exported. Use the owner-agnostic <code>lib/metafield</code> functions with <code>ownerType: 'shop'</code>, or the admin REST endpoint.</td>
    </tr>
    <tr>
      <td><code>blog_post</code></td>
      <td rowSpan={2}>No owner-scoped service functions exist at all, and there is no <code>./blog/services</code> entry in the exports map. The blog module folds submitted <code>metafields</code> into <code>meta_data</code> through its own registry processors. Use <code>createMetafieldDefinition</code> / <code>validateMetafields</code> directly with <code>ownerType: 'blog_post'</code> or <code>'blog_category'</code>.</td>
    </tr>
    <tr>
      <td><code>blog_category</code></td>
    </tr>
  </tbody>
</table>

Do not go hunting for `addBlogPostMetafieldDefinition` or an importable `addShopMetafieldDefinition` — they are not part of the public API.

## See Also

- [Metafields](/docs/development/knowledge-base/metafields) — Concepts, admin UI and the storage model
- [Theme Metafields](/docs/development/theme/metafields) — Declaring fields in `theme.json`
- [Metafield Definition API](/docs/api/metafield-definition) — The REST endpoints behind the admin UI
