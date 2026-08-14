---
sidebar_position: 130
since: 2.2.1
keywords:
- registerSitemapCollector
- createEntityCollector
- createStaticCollector
- generateSitemap
- getSitemapCollectors
- sitemap
- seo
groups:
- utilities
sidebar_label: Sitemap Collectors
title: Sitemap Collector Functions
description: Register sources of sitemap URLs and generate the sitemap set.
---

# Sitemap Collector Functions

The sitemap is assembled from **collectors** — each collector is a named source of canonical, root-relative URLs. Core ships five (products, categories, CMS pages, landing pages, static paths); the blog module registers three more. Extensions add their own from `bootstrap.ts`.

The pipeline is: collectors emit `SitemapEntry` paths → the generator expands each into one absolute, localized URL per enabled locale → the renderer serializes them into `sitemap-<name>.xml` children plus a `sitemap.xml` index.

## Import

```ts
import {
  registerSitemapCollector,
  getSitemapCollectors,
  createEntityCollector,
  createStaticCollector,
  generateSitemap
} from '@evershop/evershop/base/services/sitemap';
```

The sitemap feature lives in the `base` module, so the export path mirrors that.

## Types

```ts
interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: SitemapChangeFreq;
  priority?: number;
}

interface CollectorStat {
  count: number;
  maxUpdatedAt: string | null;
  pathsHash?: string | null;
}

interface SitemapCollector {
  name: string;
  collect(): Promise<SitemapEntry[]>;
  getFingerprint?(): Promise<CollectorStat>;
}
```

`SitemapChangeFreq` is the sitemaps.org vocabulary: `'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'`.

Every type on this page is importable from the same path — `SitemapEntry`, `SitemapUrlRecord`, `SitemapAlternate`, `CollectorStat`, `SitemapCollector`, `SitemapChangeFreq`, `EntityCollectorSpec`, `StaticCollectorSpec`, `GenerateOptions`, `GenerateResult`. The two exceptions are `SitemapStorage` and `SitemapConfig`: they appear in the `GenerateOptions` signature but are **not** re-exported, so those two override slots are effectively internal.

:::warning `path` must be canonical and root-relative
A collector emits exactly a `url_rewrite.request_path` — `/women/shoes/awesome-shoes`. Never an absolute URL, never a locale prefix. The base URL and the `/<locale>` prefixes are applied later by the generator.
:::

---

## registerSitemapCollector

```ts
registerSitemapCollector(collector: SitemapCollector): void
```

Register a source of sitemap URLs. Internally routes through `addProcessor('sitemapCollectors', …)`, so ordering follows module load order.

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
      <td><code>collector</code></td>
      <td><code>SitemapCollector</code></td>
      <td>The collector. Its <code>name</code> doubles as the child-file basename (<code>sitemap-&lt;name&gt;.xml</code>), so it must be a URL-safe slug.</td>
    </tr>
  </tbody>
</table>

### Return Value

`void`.

### Throws

Registration goes through the value registry, which is **locked once every module's `bootstrap.ts` has run**. Calling `registerSitemapCollector` from a middleware, a resolver or an API handler throws:

```
Registry is locked. Most likely you are trying to add a processor from a middleware.
Consider using a bootstrap file to add processors
```

### Example

```ts title="extensions/my-extension/src/bootstrap.ts"
import {
  registerSitemapCollector,
  createEntityCollector
} from '@evershop/evershop/base/services/sitemap';

export default () => {
  registerSitemapCollector(
    createEntityCollector({
      name: 'lookbooks',
      table: 'lookbook',
      entityType: 'lookbook',
      where: 'e.status = true',
      changefreq: 'weekly',
      priority: 0.5
    })
  );
};
```

---

## getSitemapCollectors

```ts
getSitemapCollectors(): SitemapCollector[]
```

The registered collectors, in registration order. Synchronous — reads the registry's already-resolved value.

### Example

```ts
import { getSitemapCollectors } from '@evershop/evershop/base/services/sitemap';

const names = getSitemapCollectors().map((c) => c.name);
// ['products', 'categories', 'cms-pages', 'landing-pages', 'static', ...]
```

---

## createEntityCollector

```ts
createEntityCollector(spec: EntityCollectorSpec): SitemapCollector
```

Build a collector that enumerates an entity's live friendly URLs by joining the entity table to `url_rewrite`. This is the shortcut for **any** entity that has `url_rewrite` rows — which is every entity EverShop gives a friendly URL.

### Parameters

**`spec`**

**Type:** `EntityCollectorSpec`

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
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Collector name and child-file basename (<code>sitemap-&lt;name&gt;.xml</code>). URL-safe slug.</td>
    </tr>
    <tr>
      <td><code>table</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>The entity table, aliased <code>e</code> in the generated SQL.</td>
    </tr>
    <tr>
      <td><code>entityType</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>The <code>url_rewrite.entity_type</code> value for this entity. Bound as a query parameter.</td>
    </tr>
    <tr>
      <td><code>where</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>SQL boolean expression over the alias <code>e</code>, e.g. <code>'e.status = true'</code>. Defaults to <code>'true'</code> (all rows).</td>
    </tr>
    <tr>
      <td><code>updatedAtColumn</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Timestamp column driving <code>&lt;lastmod&gt;</code>. Defaults to <code>'updated_at'</code>; pass <code>'created_at'</code> for tables that have no <code>updated_at</code>.</td>
    </tr>
    <tr>
      <td><code>changefreq</code></td>
      <td><code>SitemapChangeFreq</code></td>
      <td>No</td>
      <td>Emitted on every entry produced by this collector.</td>
    </tr>
    <tr>
      <td><code>priority</code></td>
      <td><code>number</code></td>
      <td>No</td>
      <td>0.0 – 1.0. Emitted on every entry.</td>
    </tr>
  </tbody>
</table>

:::danger `table`, `entityType`, `where` and `updatedAtColumn` are interpolated
Only `entityType` is bound as a parameter; the rest are interpolated into the SQL string. They are meant to be **trusted constants written by you**, never user input.
:::

### Return Value

A `SitemapCollector` whose `collect()` reads `request_path` + the timestamp column, and whose `getFingerprint()` runs the same join as a `count` / `max(updated_at)` / `md5(string_agg(request_path))`. The `pathsHash` means a URL change that leaves `updated_at` untouched (a category move, an async `url_rewrite` rebuild) still flips the fingerprint.

### Example

```ts title="modules/blog/bootstrap.ts (core)"
registerSitemapCollector(
  createEntityCollector({
    name: 'blog-tags',
    table: 'blog_tag',
    entityType: 'blog_tag',
    updatedAtColumn: 'created_at',
    changefreq: 'monthly',
    priority: 0.3
  })
);
```

---

## createStaticCollector

```ts
createStaticCollector(spec: StaticCollectorSpec): SitemapCollector
```

A config-driven collector for fixed storefront paths. No database access.

### Parameters

**`spec`**

**Type:** `StaticCollectorSpec`

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
      <td><code>paths</code></td>
      <td><code>string[]</code></td>
      <td>Yes</td>
      <td>Root-relative paths. Anything not starting with <code>/</code> is silently skipped.</td>
    </tr>
    <tr>
      <td><code>changefreq</code></td>
      <td><code>SitemapChangeFreq</code></td>
      <td>No</td>
      <td>Applied to every path.</td>
    </tr>
    <tr>
      <td><code>priority</code></td>
      <td><code>number</code></td>
      <td>No</td>
      <td>Applied to every path.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Defaults to <code>'static'</code>. Override it when registering a second static collector, otherwise both write <code>sitemap-static.xml</code>.</td>
    </tr>
  </tbody>
</table>

### Return Value

A `SitemapCollector`. Its fingerprint is an md5 of the sorted path list, so adding, removing or swapping a path triggers a regenerate.

### Example

```ts title="extensions/my-extension/src/bootstrap.ts"
import {
  registerSitemapCollector,
  createStaticCollector
} from '@evershop/evershop/base/services/sitemap';

export default () => {
  registerSitemapCollector(
    createStaticCollector({
      name: 'marketing',
      paths: ['/about', '/contact', '/size-guide'],
      changefreq: 'monthly',
      priority: 0.4
    })
  );
};
```

---

## generateSitemap

```ts
generateSitemap(options?: GenerateOptions): Promise<GenerateResult>
```

Generate the whole sitemap set (index + per-collector children) into storage. Normally driven by a cron job and by the cold-path request handler; exposed for a programmatic "regenerate now".

### Parameters

**`options`**

**Type:** `GenerateOptions` (optional)

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
      <td><code>force</code></td>
      <td><code>boolean</code></td>
      <td>Rebuild even when the fingerprint is unchanged.</td>
    </tr>
    <tr>
      <td><code>collectors</code></td>
      <td><code>SitemapCollector[]</code></td>
      <td>Override the registered collectors. Defaults to <code>getSitemapCollectors()</code>.</td>
    </tr>
    <tr>
      <td><code>storage</code></td>
      <td><code>SitemapStorage</code></td>
      <td>Override the storage backend.</td>
    </tr>
    <tr>
      <td><code>config</code></td>
      <td><code>SitemapConfig</code></td>
      <td>Override the resolved sitemap config.</td>
    </tr>
    <tr>
      <td><code>baseUrl</code></td>
      <td><code>string</code></td>
      <td>Defaults to <code>getBaseUrl()</code>.</td>
    </tr>
    <tr>
      <td><code>locales</code></td>
      <td><code>string[]</code></td>
      <td>Defaults to <code>await getEnabledLanguages()</code>.</td>
    </tr>
    <tr>
      <td><code>defaultLocale</code></td>
      <td><code>string</code></td>
      <td>Defaults to <code>await getStoreLanguage()</code>.</td>
    </tr>
    <tr>
      <td><code>clock</code></td>
      <td><code>() =&gt; number</code></td>
      <td>Epoch-ms clock, injectable for deterministic tests. Defaults to <code>Date.now</code>.</td>
    </tr>
  </tbody>
</table>

### Return Value

`Promise<GenerateResult>`:

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
      <td><code>generated</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code> when the run was skipped because the fingerprint was unchanged and the cached files are fresh and all present.</td>
    </tr>
    <tr>
      <td><code>files</code></td>
      <td><code>string[]</code></td>
      <td><code>['sitemap.xml', 'sitemap-products.xml', …]</code></td>
    </tr>
    <tr>
      <td><code>fingerprint</code></td>
      <td><code>string</code></td>
      <td>The fingerprint computed for this run.</td>
    </tr>
    <tr>
      <td><code>urlCount</code></td>
      <td><code>number</code></td>
      <td>Total URL records written (or the cached count when skipped).</td>
    </tr>
  </tbody>
</table>

### Example

```ts
import { generateSitemap } from '@evershop/evershop/base/services/sitemap';

const result = await generateSitemap({ force: true });
console.log(result.generated, result.urlCount, result.files.length);
```

### Notes

- **Single-flight.** Concurrent callers share one in-progress generation (per process); the second caller gets the first caller's promise rather than launching its own run.
- **A collector without `getFingerprint` disables skipping** for the whole run — every generation becomes a full rebuild. Implement it when you can summarize your set cheaply.
- A collector that returns zero entries produces no child file at all.
- Children are written first, then the index, then the meta file — so a crash mid-write never advertises a child that is not on disk.

## See Also

- [Sitemap](/docs/development/knowledge-base/sitemap) — The full sitemap guide (config keys, storage, cron, robots.txt)
- [addProcessor](/docs/development/module/functions/addProcessor) — The registry primitive `registerSitemapCollector` is built on
- [Settings Getters](/docs/development/module/functions/settings-getters) — `getEnabledLanguages` / `getStoreLanguage`, where the locale expansion gets its list
