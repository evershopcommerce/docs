---
sidebar_position: 53
keywords:
  - URL redirect
  - url_redirect
  - url_rewrite
  - 302 redirect
  - SEO
  - url_key
sidebar_label: URL Redirects
title: URL Redirects
description: How EverShop keeps old entity URLs alive after a url_key or category change — the url_redirect table, where redirects are captured, chain collapse, and the bare-slug fallback.
---

# URL Redirects

Rename a product's `url_key` and its old friendly URL used to 404. EverShop now records the change and answers the old path with an HTTP **302** pointing at the new one.

The subsystem is three pieces: a `url_redirect` table owned by the `base` module, **capture** inside the entity write services, and one storefront middleware that fires only on a would-be-404.

## `url_redirect` is not `url_rewrite`

These two tables look similar and do completely different jobs.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th></th>
      <th><code>url_rewrite</code></th>
      <th><code>url_redirect</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>What it does</td>
      <td>Internal rewrite. The friendly path is resolved to an internal route and the response is a <strong>200</strong> at the requested URL.</td>
      <td>HTTP redirect. The old path answers <strong>302</strong> and the browser re-requests the new one.</td>
    </tr>
    <tr>
      <td>Rows per entity</td>
      <td>Exactly one — the current canonical path. A rename overwrites it in place.</td>
      <td>Zero or many — one per historical path the entity used to live at.</td>
    </tr>
    <tr>
      <td>Keyed on</td>
      <td><code>entity_uuid</code></td>
      <td><code>from_path</code> (UNIQUE)</td>
    </tr>
    <tr>
      <td>Entity reference</td>
      <td><code>entity_uuid</code> + <code>entity_type</code></td>
      <td><code>entity_urn</code> (nullable — manual redirects have none)</td>
    </tr>
    <tr>
      <td>Owned by</td>
      <td>The domain modules that write it</td>
      <td>The <code>base</code> module</td>
    </tr>
  </tbody>
</table>

Because the rewrite row is overwritten on rename, the old path is simply gone from `url_rewrite` — which is exactly why a separate table is needed. Keeping the two physically separate also means the redirect feature required **zero** changes to `url_rewrite` writers, resolvers or `buildUrl`.

### Schema

Created in `modules/base/migration/Version-1.0.4.ts`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Column</th>
      <th>Type</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>url_redirect_id</code></td><td><code>INT</code> identity</td><td>Primary key.</td></tr>
    <tr><td><code>from_path</code></td><td><code>varchar</code></td><td>The old friendly path. <strong>UNIQUE</strong> — it is the lookup key, so it must resolve to exactly one target. Unbounded, to match <code>url_rewrite.request_path</code>: deep category paths exceed 255 characters.</td></tr>
    <tr><td><code>to_path</code></td><td><code>varchar</code></td><td>The new friendly path. Never an internal path like <code>/product/&lt;uuid&gt;</code> — the browser's follow-up request must re-resolve through the normal route and rewrite machinery.</td></tr>
    <tr><td><code>entity_urn</code></td><td><code>varchar(255)</code></td><td>Nullable. <code>urn:evershop:&lt;service&gt;:&lt;type&gt;:&lt;uuid&gt;</code>. Partial index where not null; used for per-entity cleanup.</td></tr>
    <tr><td><code>source</code></td><td><code>varchar</code></td><td><code>'auto'</code> (default) or <code>'manual'</code>. Everything captured today is <code>auto</code>.</td></tr>
    <tr><td><code>created_at</code></td><td><code>timestamptz</code></td><td>Defaults to <code>now()</code>.</td></tr>
  </tbody>
</table>

`Version-1.0.5.ts` adds an index on `to_path`, because every capture runs a collapse step keyed on it (see below).

There is **no `language` column** and **no `type` column**, both deliberately. See [Locale-agnostic by design](#locale-agnostic-by-design) and the next section.

## Every automatic redirect is a 302

Not a 301. This is a decision, not an oversight.

A 301 is effectively irreversible at the edge: browsers and CDNs cache it hard, so a later revert — or a redirect row that gets cleaned up — stays invisible to clients stuck on the cached response. Renames are routine and frequently undone, so a 302 keeps them revertible. There is no `type` column in the table; if a manual-redirect UI ever wants permanent redirects, adding `type smallint DEFAULT 302` is a trivial additive migration.

**The one 301 in the system** is structural, not a `url_redirect` row: retiring the legacy `/page/<key>` CMS URL in favour of the root-level `/<key>`. That is a permanent scheme change, so it is hardcoded in `modules/cms/pages/frontStore/cmsPageView/index.ts`:

```ts
const incomingPath = request.localePath ?? request.originalUrl.split('?')[0];
if (incomingPath.startsWith('/page/')) {
  return response.redirect(301, localizeUrl(`/${request.params.url_key}`));
}
```

Only a literal `/page/*` request reaches the handler with a `/page/` path — the rewritten `/<key>` request arrives with a `/<key>` path — so there is no loop. The page also emits a canonical link pointing at the root-level URL.

## What gets captured

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Entity</th>
      <th>Trigger</th>
      <th>Scope</th>
      <th>Where</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Product</td>
      <td><code>url_key</code> change <strong>or</strong> category change (assign, unassign, move)</td>
      <td>The product, plus every sibling in its variant group when the category is propagated to the group</td>
      <td><code>modules/catalog/services/product/updateProduct.ts</code></td>
    </tr>
    <tr>
      <td>Category</td>
      <td><code>url_key</code> change <strong>or</strong> reparent</td>
      <td>The whole subtree — the category, its descendant categories and their products</td>
      <td><code>modules/catalog/services/category/updateCategory.ts</code></td>
    </tr>
    <tr>
      <td>CMS page</td>
      <td><code>url_key</code> change</td>
      <td>The page</td>
      <td><code>modules/cms/services/page/updatePage.ts</code></td>
    </tr>
    <tr>
      <td>Landing page</td>
      <td><code>url_key</code> change</td>
      <td>The landing page</td>
      <td><code>modules/promotion/services/landingPage/updateLandingPage.ts</code></td>
    </tr>
  </tbody>
</table>

A product's URL is `/<category-path>/<url_key>` when it is categorised and `/<url_key>` when it is not, so **a category change moves the URL exactly as a rename does**. Same for a category: its URL is its ancestors' keys plus its own, so a reparent moves the whole subtree. Both are captured.

Two consequences worth knowing:

- A product has exactly **one** `url_rewrite` row. A categorised product is reachable only at its nested path; the root `/<key>` was never live for it. Capture therefore reads the entity's *current* `request_path` as the old path and builds the new path structurally from the new category prefix plus the new key — it never assumes a root `/<key>` old path.
- Nothing is captured at **creation**. A product born categorised — for example through the duplicate flow, which prefills the source's category — never had a root URL, so no redirect exists for it. The [bare-slug fallback](#the-bare-slug-fallback) covers that case instead.

### Capture runs inside the write transaction

Capture is called from the update **service**, on the service's own transaction connection — **not** from a post-commit event subscriber. Two reasons the subscriber cannot do it:

1. **A subscriber runs post-commit and reads the collapsed latest state.** The `*_updated` database triggers emit `row_to_json(NEW)` only, so the subscriber has to re-read the entity — by which time it holds the newest slug. On a rapid `shoe → boot → sneaker`, both events read `sneaker` and the `/boot` hop is lost forever.
2. **It is not atomic with the entity write**, and wrapping it in a fresh connection and transaction re-introduces the connection-release pitfall around `getConnection()`.

The update service is the only place that holds both the old and the new value at once, in one transaction. `url_rewrite` is rebuilt post-commit by the per-row triggers and their subscribers, so the paths read during capture are still the old ones — no race.

Redirect capture is internal machinery (`modules/base/services/recordRedirect.ts`), not a public export. If you write a service that changes an entity's `url_key`, follow the same pattern: read the old path from `url_rewrite` on the transaction connection before writing, compute the new path, and record inside the same transaction.

## Chain collapse

Recording a redirect is three steps, in this order, so that reads are always a **single hop**:

1. **Reclaim** — delete any redirect whose `from_path` equals the path that is now going live. A stale row sitting on a live path would shadow it or create a loop. The `alpha → beta → alpha` revert is the canonical case: reverting must delete the `/alpha → /beta` row before `/alpha` can serve anything.
2. **Collapse** — repoint every redirect whose `to_path` equals the path being vacated onto the new target. This is what turns `A→B` plus `B→C` into `A→C`. It is path-based, so it catches cross-entity and manual chains too, not only this entity's.
3. **Upsert** — write the new `from_path → to_path` hop, keyed on `from_path`.

Self-redirects (`from == to`) are dropped before any of this runs.

Fan-out cases — a category subtree, a variant group — use a batched form that performs the same reclaim, collapse and upsert **set-based in three statements regardless of how many rows move**, instead of one round trip per descendant holding row locks for the length of the transaction. Inputs are de-duplicated on `from_path`, last one wins, matching the upsert's conflict behaviour.

The subtree path math itself is a pure, unit-tested module (`modules/catalog/services/redirect/pathRemap.ts`). Remapping is **boundary-anchored and leading-prefix only**, which fixes two classic substring bugs: renaming `/shoe` never sweeps the sibling `/shoe-sale`, and a descendant that repeats the segment maps `/cat/cat-toy` to `/animal/cat-toy` rather than mangling it to `/animal/animal-toy`. The `category_updated` subscriber's `url_rewrite` cascade uses the same remap in SQL, so the recorded targets always equal the paths `url_rewrite` actually ends up with.

## Cleanup on delete

Deleting an entity clears its historical aliases, keyed on `entity_urn`. Without this, a freed slug that another entity later takes would be shadowed by a stale redirect pointing somewhere unrelated.

- `clearRedirectsForEntity(connection, entityUrn)` — one entity. Called from `deleteProduct`, `deletePage` and `deleteLandingPage`.
- `clearRedirectsForEntities(connection, entityUrns)` — many, in one statement.

The multi-entity form exists because a category delete cascades **in the database, outside the service**: an `AFTER DELETE` trigger recursively removes every descendant sub-category without ever calling `deleteCategory`, and `product.category_id` is `ON DELETE SET NULL`, uncategorising every product in the subtree. So `deleteCategory` first walks the subtree with a recursive CTE and clears the aliases of the category *and* all descendants, and — before the delete lands, while `url_rewrite` still holds the nested paths — records a nested-to-root redirect for every product about to be uncategorised. The `AFTER UPDATE` product trigger rebuilds each rewrite to the root path post-commit, so the recorded target matches what the store will actually serve.

Keying cleanup on `from_path` would be a no-op: the reclaim step already guarantees no row exists whose `from_path` is an entity's *current* path. Only `entity_urn` identifies the historical aliases.

:::note There is no garbage-collection cron
Redirect rows are not aged out or swept on a schedule. Nothing purges rows whose `to_path` later goes dead because a *different* entity was deleted. The only cron jobs EverShop registers are `generateSitemap` and `recomputeProductRecommendations` — see [Cron Jobs](./cron-jobs).
:::

## The request-time middleware

`modules/base/pages/frontStore/all/redirect.ts` is a site-wide front-store middleware. It no-ops unless the request is a would-be-404:

```ts
if (request.currentRoute?.id !== 'notFound') {
  next();
  return;
}
if (request.method !== 'GET' && request.method !== 'HEAD') {
  next();
  return;
}
```

`all` and `global` middlewares are **not** skipped on a 404 — only routed-level middlewares are — so a middleware gated on `currentRoute.id === 'notFound'` still runs, before the 404 body renders, and can send a redirect instead. That keeps the whole feature self-contained in the `base` module with no change to the core request chain.

It is an **active** middleware: it declares three parameters and either calls `next()` or sends the response and returns without calling `next()`. See [The Middleware System](./middleware-system).

Lookup order:

1. **Recorded redirect.** Look up `url_redirect` by `from_path`. On a hit, 302 to `to_path`.
2. **Bare-slug fallback.** Otherwise, try the single-segment fallback below.

### Guards

- **GET and HEAD only.** A mutating request is never answered with a 3xx.
- **Query strings are preserved.** The stored paths are query-free; the incoming query is re-appended to the redirect target.
- **The locale prefix is rebuilt.** The lookup uses the locale-stripped path and the target is passed through `localizeUrl`, so `/de/old-key` redirects to `/de/new-key`.
- **The self-guard compares query-free values.** It tests the stored `to_path` against the incoming path, both without a query string. Comparing a target that already has the query appended would put the query on one side only, and a residual `from == to` row hit with `?q=…` would pass the guard and bounce forever. A degenerate self-row falls through to the fallback rather than dead-ending.

### The bare-slug fallback

After a `url_redirect` miss, a **single-segment** would-be-404 `/<key>` is matched against the tail of live `url_rewrite` rows (`LIKE '%/<key>'`, with LIKE wildcards in the slug escaped so `_` and `%` match literally) and 302s to that canonical path.

This exists because bare-slug reachability would otherwise be history-dependent: only entities that once lived at the root earn a captured redirect. A product born categorised never had a root URL. The fallback makes `/<key>` behave the same either way, always targets the **current** canonical path — so it can never go stale — and needs no new rows.

Deliberate limits:

- **Single segment only.** Deeper stale paths are covered by real captured redirects; matching arbitrary `/<junk>/<key>` would mint an unbounded alias space.
- **Deterministic pick.** Slugs are not globally unique across entities, so results are ordered by `url_rewrite_id` and the oldest row wins, rather than leaving it to scan order.
- **Self-guard.** `%` matches the empty string, so `/<key>` can match its own rewrite row; that case falls through to the 404.

## Locale-agnostic by design

EverShop localises URLs with a **path prefix** (`/de/<slug>`), not by translating slugs. A given entity has one slug across every locale.

That is why `url_redirect` has no `language` column: `from_path` alone is both the unique key and the lookup key. Capture stores the canonical unprefixed path and the middleware re-adds the prefix with `localizeUrl` at request time. For the same reason `url_rewrite.language` was **dropped** — it was always `'en'` and never read.

If you add an entity type with its own friendly URLs, store canonical unprefixed paths and let the locale layer handle prefixes. Do not encode a locale into `from_path`.

## What is not implemented

- **No admin CRUD for manual redirects.** The `source` column reserves `'manual'` and the schema supports entity-less rows, but nothing writes them yet and there is no UI.
- **No 301 support** for automatic redirects, by design (see above).
- **No garbage collection.** No cron sweep ages out old rows or repairs redirects whose target went dead because another entity was deleted.
- **No public export.** `recordRedirect`, `recordRedirectsBatch`, `clearRedirectsForEntity` and `clearRedirectsForEntities` are internal to the `base` module and are not part of the `@evershop/evershop` public API surface.

## See also

- [The Routing System](./routing-system) — matcher order and the `url_rewrite` fallback the redirect middleware sits behind.
- [The Middleware System](./middleware-system) — `all` middlewares, active vs passive handlers, and ordering syntax.
- [Events and Subscribers](./events-and-subscribers) — why `*_updated` payloads force capture into the write service.
- [Database Schema Migration](./data-migration) — how the `Version-X.Y.Z.ts` migrations that created these tables are applied.
- [Sitemap & robots.txt](./sitemap) — the other SEO subsystem, and the home of the one redirect-adjacent cron job.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
