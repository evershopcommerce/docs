---
sidebar_position: 131
since: 2.2.1
keywords:
- registerUrnSchema
- getUrnSchema
- hasUrnSchema
- listUrnSchemas
- UrnService
- URN
- entity identity
groups:
- utilities
sidebar_label: URN
title: URN Functions
description: Build, parse and register stable cross-module entity identifiers.
---

# URN Functions

A **URN** is EverShop's stable, portable reference to an entity:

```
urn:evershop:<service>:<type>:<uuid>
```

for example `urn:evershop:catalog:product:7afebbbd-69f6-4e2c-84c5-5b899173b867`.

URNs exist because entity URLs are not stable. A widget that stored `/women/shoes` broke the moment somebody renamed the category. A URN stores identity instead of a URL and resolves to the current URL at request time. They are also the cross-module handle: the CMS module can reference a catalog product without importing catalog code or knowing its table layout.

:::info URNs are derived, not stored
There is no `urn` column anywhere. URNs are **built on demand** from an entity's `uuid` — usually in a GraphQL resolver, or when a page-builder widget saves a link. The entity tables are untouched.
:::

## Import

```ts
import {
  registerUrnSchema,
  getUrnSchema,
  hasUrnSchema,
  listUrnSchemas,
  UrnService,
  CatalogUrn,
  CmsUrn,
  OmsUrn,
  BlogUrn,
  CustomerUrn,
  PromotionUrn
} from '@evershop/evershop/lib/urn';
```

```ts
import type { UrnSchema, UrnParts } from '@evershop/evershop/lib/urn';
```

:::warning Importing this module has a side effect
`lib/urn` registers the core schemas at module-load time. Importing it — even only for the `UrnService` class — triggers that registration. This is why core types are always available without any bootstrap step.
:::

## Types

```ts
interface UrnSchema {
  service: string;
  type: string;
  description: string;
}

interface UrnParts {
  raw: string;
  scheme: string;    // always 'urn'
  platform: string;  // always 'evershop'
  service: string;
  type: string;
  uuid: string;
}
```

## Built-in schemas

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Service</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>catalog</code></td><td><code>product</code></td><td>Catalog product</td></tr>
    <tr><td><code>catalog</code></td><td><code>category</code></td><td>Product category</td></tr>
    <tr><td><code>cms</code></td><td><code>widget_instance</code></td><td>Page builder widget instance</td></tr>
    <tr><td><code>cms</code></td><td><code>widget_placement</code></td><td>Widget placement on a route + area</td></tr>
    <tr><td><code>cms</code></td><td><code>page</code></td><td>CMS page</td></tr>
    <tr><td><code>oms</code></td><td><code>order</code></td><td>Customer order</td></tr>
    <tr><td><code>customer</code></td><td><code>customer</code></td><td>Customer account</td></tr>
    <tr><td><code>blog</code></td><td><code>post</code></td><td>Blog post</td></tr>
    <tr><td><code>blog</code></td><td><code>category</code></td><td>Blog category</td></tr>
    <tr><td><code>blog</code></td><td><code>tag</code></td><td>Blog tag</td></tr>
    <tr><td><code>promotion</code></td><td><code>landing_page</code></td><td>Promotion landing page</td></tr>
  </tbody>
</table>

:::note There is no `catalog:collection` schema
Collections are non-navigable groupings — they have no public page — so they are referenced by `code` in widget settings, not by URN.
:::

---

## registerUrnSchema

```ts
registerUrnSchema(schema: UrnSchema): void
```

Register a `(service, type)` pair so `UrnService.build` and `UrnService.parse` will accept it. Call this from your module's `bootstrap.ts`.

### Parameters

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
      <td><code>schema.service</code></td>
      <td><code>string</code></td>
      <td>The owning service / module, e.g. <code>'reviews'</code>.</td>
    </tr>
    <tr>
      <td><code>schema.type</code></td>
      <td><code>string</code></td>
      <td>The entity type within that service, e.g. <code>'review'</code>.</td>
    </tr>
    <tr>
      <td><code>schema.description</code></td>
      <td><code>string</code></td>
      <td>Human-readable label. Required.</td>
    </tr>
  </tbody>
</table>

### Return Value

`void`.

### Throws

`URN schema already registered: <service>:<type>` when the pair is already in the registry. Registration is not idempotent — guard with `hasUrnSchema` if two of your entry points might both register.

### Example

```ts title="extensions/reviews/src/bootstrap.ts"
import { registerUrnSchema } from '@evershop/evershop/lib/urn';

export default () => {
  registerUrnSchema({
    service: 'reviews',
    type: 'review',
    description: 'Product review'
  });
};
```

---

## getUrnSchema

```ts
getUrnSchema(service: string, type: string): UrnSchema | undefined
```

Look up a registered schema. Returns `undefined` when the pair is unknown — it never throws.

```ts
import { getUrnSchema } from '@evershop/evershop/lib/urn';

getUrnSchema('catalog', 'product');
// { service: 'catalog', type: 'product', description: 'Catalog product' }
```

---

## hasUrnSchema

```ts
hasUrnSchema(service: string, type: string): boolean
```

`true` when the pair is registered. Use it as the guard before a conditional `registerUrnSchema`, or to check whether an extension that owns a type is installed.

---

## listUrnSchemas

```ts
listUrnSchemas(): UrnSchema[]
```

Every registered schema, in registration order. Useful for building admin pickers that enumerate linkable entity types.

---

## UrnService

A static class — there is nothing to instantiate.

### UrnService.build

```ts
UrnService.build(service: string, type: string, uuid: string): string
```

Compose a URN string. **Throws** when `(service, type)` is not registered:

```
Cannot build URN: (service="x", type="y") is not registered.
Call registerUrnSchema() in your module bootstrap.
```

### UrnService.parse

```ts
UrnService.parse(raw: string): UrnParts
```

Parse a URN into its parts. **Throws** on:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Condition</th>
      <th>Message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Wrong segment count (not exactly 5 colon-separated parts)</td>
      <td><code>Invalid URN "…": expected 5 segments, got N</code></td>
    </tr>
    <tr>
      <td>Scheme is not <code>urn</code></td>
      <td><code>Invalid URN scheme: "…" (expected "urn")</code></td>
    </tr>
    <tr>
      <td>Platform is not <code>evershop</code></td>
      <td><code>Invalid URN platform: "…" (expected "evershop")</code></td>
    </tr>
    <tr>
      <td>Unregistered <code>(service, type)</code></td>
      <td><code>Unknown URN type: "s:t". Not registered in UrnRegistry.</code></td>
    </tr>
  </tbody>
</table>

### UrnService.isValid

```ts
UrnService.isValid(raw: string): boolean
```

`true` when `raw` parses cleanly **and** its type is registered. This is the standard "is this a URN or a plain URL?" test — a plain `/about` or `https://…` returns `false`.

### UrnService.extractUuid

```ts
UrnService.extractUuid(raw: string): string
```

Shorthand for `UrnService.parse(raw).uuid`. Throws under the same conditions as `parse`.

### Example

```ts
import { UrnService } from '@evershop/evershop/lib/urn';

const urn = UrnService.build('catalog', 'product', product.uuid);
// 'urn:evershop:catalog:product:7afebbbd-…'

if (UrnService.isValid(stored)) {
  const { service, type, uuid } = UrnService.parse(stored);
}
```

---

## Built-in URN helpers

Thin typo-proof wrappers over `UrnService.build`. Prefer them over hand-writing the service/type strings.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Helper</th>
      <th>Method</th>
      <th>Produces</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan={2}><code>CatalogUrn</code></td>
      <td><code>product(uuid)</code></td>
      <td><code>urn:evershop:catalog:product:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>category(uuid)</code></td>
      <td><code>urn:evershop:catalog:category:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td rowSpan={3}><code>CmsUrn</code></td>
      <td><code>widgetInstance(uuid)</code></td>
      <td><code>urn:evershop:cms:widget_instance:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>widgetPlacement(uuid)</code></td>
      <td><code>urn:evershop:cms:widget_placement:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>page(uuid)</code></td>
      <td><code>urn:evershop:cms:page:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>OmsUrn</code></td>
      <td><code>order(uuid)</code></td>
      <td><code>urn:evershop:oms:order:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td rowSpan={3}><code>BlogUrn</code></td>
      <td><code>post(uuid)</code></td>
      <td><code>urn:evershop:blog:post:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>category(uuid)</code></td>
      <td><code>urn:evershop:blog:category:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>tag(uuid)</code></td>
      <td><code>urn:evershop:blog:tag:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>CustomerUrn</code></td>
      <td><code>customer(uuid)</code></td>
      <td><code>urn:evershop:customer:customer:&lt;uuid&gt;</code></td>
    </tr>
    <tr>
      <td><code>PromotionUrn</code></td>
      <td><code>landingPage(uuid)</code></td>
      <td><code>urn:evershop:promotion:landing_page:&lt;uuid&gt;</code></td>
    </tr>
  </tbody>
</table>

```ts
import { CatalogUrn, CmsUrn } from '@evershop/evershop/lib/urn';

// Typically inside a GraphQL resolver — derived, never stored.
const resolvers = {
  Product: {
    urn: ({ uuid }) => CatalogUrn.product(uuid)
  }
};

const pageUrn = CmsUrn.page(page.uuid);
```

## Registering a linkable type end to end

A custom entity that should be selectable in the page-builder link picker needs **both** a URN schema and a link loader, registered from the same bootstrap:

```ts title="extensions/reviews/src/bootstrap.ts"
import { registerUrnSchema } from '@evershop/evershop/lib/urn';
import {
  registerLinkLoader,
  linkLoaderFromBatch
} from '@evershop/evershop/lib/widget/linkResolver';
import { select } from '@evershop/evershop/lib/postgres/query';

export default () => {
  registerUrnSchema({
    service: 'reviews',
    type: 'review',
    description: 'Product review'
  });

  registerLinkLoader(
    'reviews',
    'review',
    linkLoaderFromBatch(async (uuids, pool) => {
      if (uuids.length === 0) return [];
      const rows = await select('uuid', 'slug')
        .from('review')
        .where('uuid', 'IN', [...uuids])
        .execute(pool);
      const m = new Map(rows.map((r) => [r.uuid, `/reviews/${r.slug}`]));
      return uuids.map((u) => m.get(u) ?? null);
    })
  );
};
```

Register the schema **first** — a link loader for an unregistered `(service, type)` never fires, because `resolveLink` rejects the URN at parse time before it reaches any loader.

## See Also

- [Link Resolver](/docs/development/module/functions/link-resolver) — Turning URNs into current URLs at request time
- [Widget Link Fields](/docs/development/module/widget-link-fields) — The page-builder link picker that produces URNs
- [Widget Development](/docs/development/module/widget-development) — Building widgets that store links
