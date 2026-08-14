---
sidebar_position: 132
since: 2.2.1
keywords:
- registerLinkLoader
- linkLoaderFromBatch
- createLinkLoaders
- resolveLink
- widget links
- URN
groups:
- widgets
sidebar_label: Link Resolver
title: Link Resolver Functions
description: Resolve stored widget link URNs to current URLs, batched per request.
---

# Link Resolver Functions

Widgets used to store link URLs as plain strings baked at edit time. Renaming a category or changing a page slug broke every widget pointing at it. The link resolver fixes that: widgets store a [URN](/docs/development/module/functions/urn), and the URN is resolved to the entity's **current** URL at request time — batched, so a page with N internal links costs at most one query per link kind.

Plain URLs still pass straight through, so pre-URN settings and hand-typed custom links keep working.

## Import

```ts
import {
  registerLinkLoader,
  linkLoaderFromBatch,
  createLinkLoaders,
  resolveLink
} from '@evershop/evershop/lib/widget/linkResolver';
```

```ts
import type {
  LinkBatchFn,
  LinkLoader,
  LinkLoaderFactory,
  LinkLoaders
} from '@evershop/evershop/lib/widget/linkResolver';
```

## Types

```ts
type LinkBatchFn = (
  ids: readonly string[],
  pool: Pool
) => Promise<(string | null)[]>;

type LinkLoader = {
  load: (id: string) => Promise<string | null>;
};

type LinkLoaderFactory = (pool: Pool) => LinkLoader;

/** Loaders keyed by `${service}:${type}`, matching the URN registry's composite key. */
type LinkLoaders = Record<string, LinkLoader>;
```

## Built-in loaders

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Key</th>
      <th>Resolves via</th>
      <th>Fallback</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>catalog:product</code></td>
      <td><code>url_rewrite</code> (<code>entity_type = 'product'</code>)</td>
      <td><code>buildUrl('productView', &#123; uuid &#125;)</code></td>
    </tr>
    <tr>
      <td><code>catalog:category</code></td>
      <td><code>url_rewrite</code> (<code>entity_type = 'category'</code>)</td>
      <td><code>buildUrl('categoryView', &#123; uuid &#125;)</code></td>
    </tr>
    <tr>
      <td><code>cms:page</code></td>
      <td><code>url_rewrite</code> (<code>entity_type = 'cms_page'</code>), then <code>localizeUrl()</code></td>
      <td><code>null</code> — the widget suppresses the anchor</td>
    </tr>
  </tbody>
</table>

The blog module adds `blog:post`, `blog:category` and `blog:tag`; the promotion module adds `promotion:landing_page`. There is no `catalog:collection` loader — collections have no public page.

---

## registerLinkLoader

```ts
registerLinkLoader(
  service: string,
  type: string,
  factory: LinkLoaderFactory
): void
```

Register a loader for a custom URN type. Internally an `addProcessor('linkLoaderFactories', …)` call.

### Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>service</code></td>
      <td><code>string</code></td>
      <td>The URN service segment. Must match a registered URN schema.</td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td><code>string</code></td>
      <td>The URN type segment. Must match a registered URN schema.</td>
    </tr>
    <tr>
      <td><code>factory</code></td>
      <td><code>LinkLoaderFactory</code></td>
      <td>Called once per request with the pg <code>Pool</code>; returns the request-scoped loader. Build it with <code>linkLoaderFromBatch</code>.</td>
    </tr>
  </tbody>
</table>

### Return Value

`void`.

### Throws

The value registry locks once bootstrap completes. Calling `registerLinkLoader` from a middleware, resolver or API handler throws `Registry is locked. …`. Register from `bootstrap.ts`.

:::warning Register the URN schema too
`registerLinkLoader` does **not** register the URN schema. Without a matching `registerUrnSchema(...)` call, `resolveLink` fails to parse the URN and returns `null` before your loader is ever consulted.
:::

### Example

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

---

## linkLoaderFromBatch

```ts
linkLoaderFromBatch(batchFn: LinkBatchFn): LinkLoaderFactory
```

Wrap a batch function into a loader factory. The returned factory builds a tiny request-scoped batcher that coalesces every `.load()` call made in the same microtask into one `batchFn` invocation, and memoizes results for the life of the request.

### Parameters

**`batchFn`**

**Type:** `LinkBatchFn`

Receives `(ids, pool)` and must return an array of URLs (or `null`) **in the same order and of the same length** as `ids`. A short array is padded with `null` — a reordered array silently mislabels links.

### Return Value

A `LinkLoaderFactory` ready to pass to `registerLinkLoader`.

### Example

```ts
import { linkLoaderFromBatch } from '@evershop/evershop/lib/widget/linkResolver';
import { select } from '@evershop/evershop/lib/postgres/query';

const factory = linkLoaderFromBatch(async (uuids, pool) => {
  if (uuids.length === 0) return [];
  const rows = await select('uuid', 'slug')
    .from('blog_post')
    .where('uuid', 'IN', [...uuids])
    .execute(pool);
  const m = new Map(rows.map((r) => [r.uuid, `/blog/${r.slug}`]));
  // Same order as `uuids` — this is the contract.
  return uuids.map((u) => m.get(u) ?? null);
});
```

---

## createLinkLoaders

```ts
createLinkLoaders(pool: Pool): LinkLoaders
```

Instantiate every registered factory into a fresh set of request-scoped loaders. Core calls this once per request in the GraphQL middleware and puts the result on the GraphQL context as `linkLoaders`.

You rarely call it yourself — reach for it only when resolving links outside a GraphQL request (a cron job rendering an email, a script).

### Example

```ts
import { pool } from '@evershop/evershop/lib/postgres';
import {
  createLinkLoaders,
  resolveLink
} from '@evershop/evershop/lib/widget/linkResolver';

const loaders = createLinkLoaders(pool);
const href = await resolveLink(storedValue, loaders);
```

:::danger Do not build one set of loaders and reuse it
The loaders memoize results forever. Their cache is only correct because it dies with the request. A module-level `createLinkLoaders(pool)` will serve stale URLs after the first rename.
:::

---

## resolveLink

```ts
resolveLink(
  value: string | null | undefined,
  loaders: LinkLoaders | undefined
): Promise<string | null>
```

Resolve a stored link value to a current URL.

### Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>value</code></td>
      <td><code>string | null | undefined</code></td>
      <td>A URN, a plain URL, or nothing.</td>
    </tr>
    <tr>
      <td><code>loaders</code></td>
      <td><code>LinkLoaders | undefined</code></td>
      <td>The request-scoped loader set, normally <code>context.linkLoaders</code>.</td>
    </tr>
  </tbody>
</table>

### Return Value

`Promise<string | null>`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Input</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Empty / null / undefined</td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td>Plain URL with a safe scheme</td>
      <td>Returned unchanged</td>
    </tr>
    <tr>
      <td>Plain URL with an unsafe scheme (<code>javascript:</code>, <code>data:</code>, …)</td>
      <td><code>null</code> — the anchor is suppressed rather than becoming an href XSS</td>
    </tr>
    <tr>
      <td>Valid URN with a registered loader</td>
      <td>The loader's answer — the current URL, or <code>null</code> when the entity is gone</td>
    </tr>
    <tr>
      <td>Valid URN with no registered loader</td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td>Malformed URN, or a URN whose <code>(service, type)</code> is unregistered</td>
      <td>Treated as a plain URL and run through the safe-scheme check</td>
    </tr>
  </tbody>
</table>

`resolveLink` never throws.

### Example

```js title="A widget GraphQL resolver"
import { resolveLink } from '@evershop/evershop/lib/widget/linkResolver';

export default {
  MyWidget: {
    ctaUrl: async ({ settings }, _, { linkLoaders }) =>
      (await resolveLink(settings.ctaLink, linkLoaders)) ?? null
  }
};
```

---

## Failure mode: a throwing loader renders a link with no href

The batcher deliberately swallows loader errors:

```ts
try {
  const values = await batchFn(ids, pool);
  batch.forEach(({ resolve }, i) => resolve(values[i] ?? null));
} catch {
  // A loader failure should never break the page — return null for all
  // in-flight ids so widgets render with a missing link instead of a 500.
  batch.forEach(({ resolve }) => resolve(null));
}
```

A bad column name, a dropped table or a transient DB error inside your `batchFn` therefore produces **no error, no log line, and no 500** — every id in that batch simply resolves to `null` and the widget renders without an href. This is the intended trade (a broken link beats a broken storefront), but it means link-loader bugs are invisible from the outside.

This exact bug shipped once in core: the `cms:page` loader selected `url_key` from `cms_page`, but `url_key` lives on `cms_page_description`. The query threw on every request, every page link silently resolved to `null`, and the only symptom was unclickable menu items.

When links come back empty, debug the loader directly rather than looking at the widget:

```ts
import { pool } from '@evershop/evershop/lib/postgres';
import { createLinkLoaders } from '@evershop/evershop/lib/widget/linkResolver';

const loaders = createLinkLoaders(pool);
console.log(await loaders['reviews:review'].load(someUuid));
```

Checklist when a link resolves to `null`:

1. Is the `(service, type)` registered with `registerUrnSchema`? If not, `resolveLink` bails before your loader.
2. Is the loader registered under exactly the same `(service, type)`?
3. Does `batchFn` return an array **the same length and order** as `ids`?
4. Does the entity row still exist?
5. Run `batchFn`'s query by hand — the batcher hid the error.

## See Also

- [URN](/docs/development/module/functions/urn) — The identifier format and its registry
- [Widget Link Fields](/docs/development/module/widget-link-fields) — The admin link picker that produces these values
- [Widget Development](/docs/development/module/widget-development) — Building widgets
- [registerWidget](/docs/development/module/functions/registerWidget) — Widget registration
