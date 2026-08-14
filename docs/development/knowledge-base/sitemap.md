---
sidebar_position: 52
keywords:
  - sitemap
  - robots.txt
  - evershop sitemap
  - SEO
  - hreflang
sidebar_label: Sitemap & robots.txt
title: Sitemap & robots.txt
description: EverShop automatically generates and serves a search-engine sitemap (sitemap.xml) and a robots.txt, including hreflang alternates for multi-language stores.
---

# Sitemap & robots.txt

EverShop automatically generates a [sitemap](https://www.sitemaps.org/) and serves it at `/sitemap.xml`, so search engines can discover every public page of your store. It also serves a default `robots.txt` that points crawlers at the sitemap. Both are on by default — there is nothing to configure to get a working sitemap.

## What it does

- Enumerates every public storefront URL — products, categories, CMS pages, landing pages, blog content, and the homepage — and writes them into a **sitemap index** (`/sitemap.xml`) plus one child file per content type (`/sitemap-products.xml`, `/sitemap-categories.xml`, …).
- Regenerates on a schedule (every 30 minutes by default) with a **cron job**, but only does the work when something actually changed.
- Serves the files as static files once generated, so requests cost nothing extra.
- Emits `hreflang` alternate links when your store has more than one language enabled.
- Serves a sensible default `robots.txt` (with an absolute `Sitemap:` line) when you don't provide your own.

## How it works

The sitemap files are written to your project's `public/` folder. EverShop serves everything in `public/` as static files, so once `public/sitemap.xml` exists a request for `/sitemap.xml` is served directly from disk — no application code runs.

Three things keep it up to date:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Mechanism</th>
      <th>When</th>
      <th>What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Static serving</td><td>Every request, when the file exists</td><td>Streams the file from <code>public/</code>. The common case.</td></tr>
    <tr><td>Cron job</td><td>Every 30 minutes</td><td>Rebuilds the files if the content changed (or the last build is older than <code>maxAge</code>).</td></tr>
    <tr><td>On-demand</td><td>A request for a missing sitemap file</td><td>Generates the set on the spot, then serves it. Covers the first request after startup.</td></tr>
  </tbody>
</table>

The "did anything change" check is a cheap fingerprint over each content type — the count of included URLs, their newest `updated_at`, and a hash of the URLs themselves — plus the set of enabled languages. Hashing the URLs means a change like assigning a product to a category (which changes its URL) is detected even though the product's `updated_at` isn't affected. If the fingerprint is unchanged and the files are fresh, regeneration is skipped.

## What is included

Each content type contributes the URLs that are actually reachable on the storefront:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Content</th>
      <th>Included when</th>
      <th>Last modified</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Products</td><td>Enabled and visible</td><td>Product <code>updated_at</code></td></tr>
    <tr><td>Categories</td><td>Enabled</td><td>Category <code>updated_at</code></td></tr>
    <tr><td>CMS pages</td><td>Published</td><td>Page <code>updated_at</code></td></tr>
    <tr><td>Landing pages</td><td>Enabled and within the publish window</td><td>Landing page <code>updated_at</code></td></tr>
    <tr><td>Blog posts</td><td>Published</td><td>Post <code>updated_at</code></td></tr>
    <tr><td>Blog categories</td><td>Published</td><td>Category <code>updated_at</code></td></tr>
    <tr><td>Blog tags</td><td>All</td><td>Tag <code>created_at</code></td></tr>
    <tr><td>Static routes</td><td>Listed in <code>sitemap.staticPaths</code> (default: the homepage)</td><td>—</td></tr>
  </tbody>
</table>

The URL of each entry is its friendly URL — the same path a visitor sees, including nested category paths for products (for example `/women/shoes/awesome-shoes`).

:::note
Google uses the `<lastmod>` value but ignores `<changefreq>` and `<priority>`. EverShop still emits `changefreq`/`priority` because other search engines use them; you can tune or ignore them via configuration.
:::

## Multi-language stores

EverShop serves each enabled language on a shared URL prefix — the default language unprefixed (`/shoes`) and each additional language prefixed (`/de/shoes`, `/fr/shoes`). When more than one language is enabled, the sitemap lists **every** language variant of each URL and connects them with `hreflang` alternate links (including a self-reference and `x-default`), which is what Google expects for localized pages:

```xml
<url>
  <loc>https://example.com/shoes</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://example.com/shoes"/>
  <xhtml:link rel="alternate" hreflang="de" href="https://example.com/de/shoes"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/shoes"/>
</url>
```

A single-language store pays no overhead — the sitemap contains just the canonical URLs, with no `hreflang` markup. The enabled languages come from your store's language settings; there is nothing sitemap-specific to configure.

## Configuration

Everything lives under the `sitemap` key in your configuration file (`config/default.json` or an environment-specific file). All keys are optional — these are the defaults:

```json
{
  "sitemap": {
    "enabled": true,
    "schedule": "*/30 * * * *",
    "maxUrlsPerFile": 50000,
    "maxAge": 86400000,
    "hreflang": true,
    "staticPaths": ["/"],
    "changefreq": {
      "product": "daily",
      "category": "daily",
      "cmsPage": "weekly",
      "landingPage": "weekly",
      "static": "daily"
    },
    "priority": {
      "product": 0.7,
      "category": 0.8,
      "cmsPage": 0.5,
      "landingPage": 0.6,
      "static": 1.0
    },
    "robots": {
      "enabled": true,
      "disallow": ["/admin/", "/checkout", "/account", "/cart", "/api/"]
    }
  }
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Key</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>enabled</code></td><td>Turn the whole feature on or off.</td></tr>
    <tr><td><code>schedule</code></td><td>Cron expression for the regeneration job.</td></tr>
    <tr><td><code>maxUrlsPerFile</code></td><td>Split a content type into multiple child files once it exceeds this many URLs (the sitemaps.org limit is 50,000).</td></tr>
    <tr><td><code>maxAge</code></td><td>Force a full regeneration when the last build is older than this many milliseconds, regardless of the change check.</td></tr>
    <tr><td><code>hreflang</code></td><td>Emit <code>hreflang</code> alternates on multi-language stores.</td></tr>
    <tr><td><code>staticPaths</code></td><td>Fixed storefront paths to include (for example <code>["/", "/blog"]</code>).</td></tr>
    <tr><td><code>changefreq</code> / <code>priority</code></td><td>Per-content-type hints (used by some search engines; ignored by Google).</td></tr>
    <tr><td><code>robots</code></td><td>Whether to serve a dynamic <code>robots.txt</code>, and which paths to disallow.</td></tr>
  </tbody>
</table>

The store's base URL (used for the absolute `<loc>` values and the `robots.txt` `Sitemap:` line) comes from `shop.homeUrl`, or the `EVERSHOP_HOME_URL` environment variable. Set it so the sitemap contains fully-qualified production URLs.

## robots.txt

If your store does **not** already have a `robots.txt`, EverShop serves a dynamic default that disallows non-indexable areas and advertises the sitemap with an absolute URL:

```text
User-agent: *
Disallow: /admin/
Disallow: /checkout
Disallow: /account
Disallow: /cart
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

A physical `robots.txt` always wins. Your theme may ship one in its `public/` folder — if so, that file is served and the dynamic default (and the `robotsTxt` setting below) do not apply. To use the dynamic version, remove the theme's `robots.txt`; to keep a static one, add your own `Sitemap:` line to it.

When no physical file exists, you can override the dynamic default entirely with a `robotsTxt` setting (raw text), saved through the settings API.

## Adding your own URLs (extensions)

The sitemap collects URLs from **collectors**. Core registers collectors for products, categories, CMS pages, landing pages, static routes, and blog (posts, categories, tags) — and **an extension registers its own the exact same way**, from its `bootstrap` file. Anything you register participates in everything below automatically: multi-language `hreflang`, 50,000-per-file chunking, the change-detection skip, cron + on-demand regeneration, and serving at `/sitemap-<name>.xml` with an entry in the index. No other wiring.

There are two ways, depending on whether your entity already has `url_rewrite` rows.

### If your entity has `url_rewrite` rows

This is the common case (it's how products, categories, and blog work). Use `createEntityCollector` — you only describe the table, filter, and hints:

```ts
import {
  registerSitemapCollector,
  createEntityCollector
} from '@evershop/evershop/base/services/sitemap';

export default function () {
  registerSitemapCollector(
    createEntityCollector({
      name: 'brands',          // served at /sitemap-brands.xml
      table: 'brand',
      entityType: 'brand',     // the entity_type your url_rewrite rows use
      where: 'e.status = 1',   // optional SQL filter over the entity alias `e` (default: all rows)
      updatedAtColumn: 'updated_at', // optional; use e.g. 'created_at' if there's no updated_at
      changefreq: 'weekly',
      priority: 0.6
    })
  );
}
```

It joins `url_rewrite`, reads each row's `request_path` for the URL and your timestamp column for `<lastmod>`, and implements the change fingerprint for you (including the path hash).

### If your entity has custom URLs

Return one entry per public URL. Each entry's `path` is a **canonical, root-relative** path — do **not** prepend your domain or a locale prefix; EverShop turns it into the absolute, localized `<loc>`:

```ts
import { registerSitemapCollector } from '@evershop/evershop/base/services/sitemap';
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/evershop/lib/postgres/query';

export default function () {
  registerSitemapCollector({
    name: 'authors',
    async collect() {
      const rows = await select('slug', 'updated_at')
        .from('author')
        .where('active', '=', true)
        .execute(pool);
      return rows.map((row) => ({
        path: `/author/${row.slug}`, // → https://yourstore.com/author/<slug>
        lastmod: new Date(row.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: 0.5
      }));
    }
  });
}
```

### Rules and the optional fingerprint

- **Register from `bootstrap`.** The registry locks after bootstrap; calling `registerSitemapCollector` from a request or middleware throws.
- **`name` is the child file name** (`sitemap-<name>.xml`) and appears in the index — keep it a lowercase, URL-safe slug.
- **`collect()` returns canonical root-relative paths** — the pipeline handles the base URL, locale prefixing, and `hreflang`.

To join the "skip when unchanged" optimization, implement `getFingerprint()` — the count of included URLs, their newest modification timestamp, and a hash of the paths (so a URL change is detected even when timestamps don't move):

```ts
registerSitemapCollector({
  name: 'authors',
  async collect() {
    /* ... */
  },
  async getFingerprint() {
    return { count: 42, maxUpdatedAt: '2026-07-05T10:00:00.000Z', pathsHash: 'abc123' };
  }
});
```

`createEntityCollector` does this for you; a hand-written collector that omits `getFingerprint()` still works — it just forces a full regeneration on every run.

## Regenerating on demand

You can trigger a regeneration programmatically — for example from an admin action:

```ts
import { generateSitemap } from '@evershop/evershop/base/services/sitemap';

await generateSitemap({ force: true });
```

Without `force`, generation is skipped when nothing changed.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
