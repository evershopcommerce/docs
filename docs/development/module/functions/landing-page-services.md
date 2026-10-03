---
sidebar_position: 137
since: 2.2.1
keywords:
- createLandingPage
- updateLandingPage
- deleteLandingPage
- duplicateLandingPage
- replaceHomepage
- cloneWidgetBody
- findFreeUrlKey
- buildBackupIdentity
- getLandingPagesBaseQuery
- syncLandingPageUrlRewrite
- landing page
- promotion
groups:
- promotion
sidebar_label: Landing Page Services
title: Landing Page Functions
description: Create, update, delete and duplicate promotion landing pages.
---

# Landing Page Functions

A landing page is a promotion-owned page whose body is built entirely from page-builder widgets. It lives in the `landing_page` table, is served at the root-level friendly URL `/<url_key>` (mapped to the internal `landingPageView` route), and its content is a set of `widget_placement` rows scoped by the page's URN.

## Import

```ts
import {
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  duplicateLandingPage,
  getLandingPagesBaseQuery,
  syncLandingPageUrlRewrite,
  deleteLandingPageUrlRewrite
} from '@evershop/evershop/promotion/services';
```

```ts
import type { LandingPageData } from '@evershop/evershop/promotion/services';
```

## The data shape

```ts
interface LandingPageData {
  name: string;
  url_key: string;
  status?: boolean | number | string;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  publish_start?: string | null;
  publish_end?: string | null;
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>Required on create. Minimum length 1.</td>
    </tr>
    <tr>
      <td><code>url_key</code></td>
      <td>Required on create. Must match <code>^[a-z0-9]+(?:-[a-z0-9]+)*$</code> — lowercase, digits, single hyphens. Unique across the table, and checked for collisions against other URL owners.</td>
    </tr>
    <tr>
      <td><code>status</code></td>
      <td>Accepts <code>true</code>, <code>false</code>, <code>0</code>, <code>1</code>, <code>'0'</code>, <code>'1'</code>. Normalised to a boolean before the write.</td>
    </tr>
    <tr>
      <td><code>publish_start</code> / <code>publish_end</code></td>
      <td>Timestamps bounding the publish window. An empty string is normalised to <code>null</code> (a cleared datetime field posts <code>''</code>, which <code>TIMESTAMPTZ</code> rejects). <code>null</code> bounds mean open-ended.</td>
    </tr>
  </tbody>
</table>

Every write runs inside its own transaction: it opens a connection, `startTransaction`, does the work, and commits — or rolls back and rethrows.

---

## createLandingPage

```ts
createLandingPage(data: LandingPageData, context: object): Promise<LandingPage>
```

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
      <td><code>data</code></td>
      <td><code>LandingPageData</code></td>
      <td>The page. <code>name</code> and <code>url_key</code> are required here.</td>
    </tr>
    <tr>
      <td><code>context</code></td>
      <td><code>object</code></td>
      <td>Hook context, bound as <code>this</code> inside hook callbacks. Pass <code>&#123;&#125;</code> when you have nothing to add.</td>
    </tr>
  </tbody>
</table>

### Return Value

The inserted `landing_page` row.

### What it does

1. Runs the inbound data through the `landingPageDataBeforeCreate` registry value, then normalises it.
2. Validates against the landing-page JSON schema with `name` and `url_key` required.
3. Asserts the `url_key` is not already taken by another URL owner.
4. Inserts the row.
5. Writes the `url_rewrite` row mapping `/<url_key>` → `/landing/<url_key>`.

### Throws

<table className="table-auto not-prose">
  <thead>
    <tr><th>Condition</th><th>Message</th></tr>
  </thead>
  <tbody>
    <tr><td><code>context</code> is a non-object truthy value</td><td><code>Context must be an object</code></td></tr>
    <tr><td>Schema validation fails</td><td>The first AJV error message</td></tr>
    <tr><td><code>url_key</code> collides with an existing URL</td><td>Raised by the URL-key availability check</td></tr>
  </tbody>
</table>

### Example

```ts
import { createLandingPage } from '@evershop/evershop/promotion/services';

const page = await createLandingPage(
  {
    name: 'Black Friday 2026',
    url_key: 'black-friday-2026',
    status: true,
    meta_title: 'Black Friday — up to 50% off',
    publish_start: '2026-11-25T00:00:00Z',
    publish_end: '2026-12-02T00:00:00Z'
  },
  {}
);

console.log(page.uuid);
```

### Hooks

`createLandingPage` (whole call) and `insertLandingPageData` (just the insert). Helpers: `hookBeforeCreateLandingPage`, `hookAfterCreateLandingPage`, `hookBeforeInsertLandingPageData`, `hookAfterInsertLandingPageData`.

---

## updateLandingPage

```ts
updateLandingPage(uuid: string, data: Partial<LandingPageData>, context: object): Promise<LandingPage>
```

Patch a landing page. Every field is optional — an update with no changed columns is tolerated rather than throwing.

### What it does

1. Runs the data through `landingPageDataBeforeUpdate`, normalises and validates it.
2. Loads the current row.
3. If `url_key` changed, asserts the new slug is free.
4. Updates the row.
5. Re-syncs the `url_rewrite` entry to the (possibly new) `url_key`.
6. **On a rename, records a 302 redirect** `/<oldKey>` → `/<newKey>`, keyed by the page's URN, so existing links keep working.

### Throws

<table className="table-auto not-prose">
  <thead>
    <tr><th>Condition</th><th>Message</th></tr>
  </thead>
  <tbody>
    <tr><td>No such page</td><td><code>Requested landing page not found</code></td></tr>
    <tr><td><code>context</code> is a non-object truthy value</td><td><code>Context must be an object</code></td></tr>
    <tr><td>Schema validation fails</td><td>The first AJV error message</td></tr>
    <tr><td>The new <code>url_key</code> is taken</td><td>Raised by the URL-key availability check</td></tr>
  </tbody>
</table>

### Example

```ts
import { updateLandingPage } from '@evershop/evershop/promotion/services';

// Renaming keeps the old URL alive as a 302.
await updateLandingPage(
  pageUuid,
  { url_key: 'black-friday', status: true },
  {}
);
```

### Hooks

`updateLandingPage` and `updateLandingPageData`, with the four matching helpers.

---

## deleteLandingPage

```ts
deleteLandingPage(uuid: string, context: object): Promise<LandingPage>
```

Delete a landing page and everything hanging off it. Returns the row as it was before deletion.

### What it does, in one transaction

1. Purges historical redirect aliases for the page's URN, so old URLs stop 302ing.
2. Removes the `url_rewrite` row, so `/<url_key>` stops resolving.
3. Deletes the page body — every `widget_placement` row whose `entity_urn` is this page.
4. Deletes every `widget_instance` that was placed **only** on this page (an instance still placed elsewhere survives). Raw SQL; cms widget hooks do not fire.
5. Deletes the `landing_page` row.

:::warning The body does not cascade
`widget_placement.entity_urn` is a plain `varchar` with no foreign key to `landing_page`. Dropping the entity row alone would orphan every placement, which is why step 3 is explicit. If you write your own landing-page teardown, you must delete placements by URN yourself.
:::

### Throws

`Invalid landing page id` when no row matches the UUID, plus `Context must be an object`.

### Hooks

`deleteLandingPage` and `deleteLandingPageData`.

---

## duplicateLandingPage

```ts
duplicateLandingPage(uuid: string, context: object): Promise<LandingPage>
```

Deep-clone a landing page. Returns the new row.

### What the copy looks like

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Value on the copy</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>status</code></td><td><code>false</code> — the copy is always an unpublished draft</td></tr>
    <tr><td><code>name</code></td><td><code>&lt;source name&gt; (copy)</code></td></tr>
    <tr><td><code>url_key</code></td><td><code>&lt;source key&gt;-copy</code>, or <code>-copy-2</code>, <code>-copy-3</code>, … until free (<code>url_key</code> is UNIQUE)</td></tr>
    <tr><td><code>description</code>, <code>meta_title</code>, <code>meta_description</code>, <code>publish_start</code>, <code>publish_end</code></td><td>Copied verbatim</td></tr>
  </tbody>
</table>

### Deep clone, not shallow

Widget **settings** live on `widget_instance`, not on `widget_placement`. A placement-only copy would leave both pages pointing at the same instances, so editing the copy would silently mutate the original. `duplicateLandingPage` therefore clones each referenced `widget_instance` and repoints the cloned placements at the new instances and the new page URN.

### Throws

`Invalid landing page id` when the source does not exist, plus `Context must be an object`.

### Example

```ts
import { duplicateLandingPage } from '@evershop/evershop/promotion/services';

const draft = await duplicateLandingPage(pageUuid, {});
// draft.status === false, draft.url_key === 'black-friday-copy'
```

### Hooks

`duplicateLandingPageData`, with `hookBeforeDuplicateLandingPageData` / `hookAfterDuplicateLandingPageData`.

---

## getLandingPagesBaseQuery

```ts
getLandingPagesBaseQuery(): SelectQuery
```

A fresh `select().from('landing_page')` query. This is the base every landing-page listing builds on — GraphQL collections, admin grids, your own filters. Each call returns a new query object, so it is safe to mutate.

```ts
import { getLandingPagesBaseQuery } from '@evershop/evershop/promotion/services';
import { pool } from '@evershop/evershop/lib/postgres';

const query = getLandingPagesBaseQuery();
query.where('status', '=', true);
query.orderBy('landing_page_id', 'DESC');
const rows = await query.execute(pool);
```

---

## syncLandingPageUrlRewrite

```ts
syncLandingPageUrlRewrite(
  connection: PoolClient,
  landingPage: { uuid: string; url_key: string }
): Promise<void>
```

Keep a landing page's `url_rewrite` row in sync with its current `url_key`. Writes `request_path: '/<url_key>'` → `target_path: '/landing/<url_key>'`, keyed on `entity_uuid` so a rename overwrites the single row in place.

The CRUD services above already call it; you need it only when you write `landing_page` rows directly — a data migration, an importer.

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
      <td><code>connection</code></td>
      <td><code>PoolClient</code></td>
      <td><strong>Required.</strong> There is no default — pass the transaction client doing the write.</td>
    </tr>
    <tr>
      <td><code>landingPage</code></td>
      <td><code>&#123; uuid, url_key &#125;</code></td>
      <td>The page whose rewrite should be written.</td>
    </tr>
  </tbody>
</table>

The companion `deleteLandingPageUrlRewrite(connection, uuid)` removes the row.

```ts
import { syncLandingPageUrlRewrite } from '@evershop/evershop/promotion/services';

await syncLandingPageUrlRewrite(connection, {
  uuid: page.uuid,
  url_key: page.url_key
});
```

## replaceHomepage

```ts
replaceHomepage(uuid: string, context: { userId: number; routeId?: string; expectedFingerprints?: { homepage: string; landingPage: string } }): Promise<ReplaceHomepageResult>
preflightReplaceHomepage(uuid: string, userId: number): Promise<PreflightResult>
```

The service behind **Replace homepage with this page**. `preflightReplaceHomepage` runs the read-only checks the dialog shows; `replaceHomepage` performs the replacement in one transaction:

1. Takes `pg_try_advisory_xact_lock` (another run in progress → `REPLACE_IN_PROGRESS`), locks the landing page and the homepage placements, and compares the fingerprints from preflight (`HOMEPAGE_CHANGED` on mismatch).
2. Refuses when an active or upcoming rollout plan touches the homepage (`HOMEPAGE_ROLLOUT_ACTIVE`); cancels ended plans that touched it (plan rows only, changesets kept).
3. Discards the unpublished page-builder operations that touch the homepage in every open changeset; the changeset rows are never deleted.
4. Creates a **disabled** backup landing page (name `Homepage backup <yyyy-LL-dd HH:mm>`, url_key `homepage-backup-…`) through the create pipeline, copies the homepage instances and placements into it with fresh uuids, removes the homepage placements, and deletes originals left with no placement.
5. Clones the landing page's body onto route `homepage` (`landing_page_content` → `content`, container children re-pointed), then re-checks and commits.

"Touching the homepage" is decided by the operation's **target** (placement uuid, instance uuid, payload route), not only by the route stamped on it.

### Throws

`ReplaceHomepageError` with `code` ∈ `LANDING_PAGE_NOT_FOUND` (404), `HOMEPAGE_ROLLOUT_ACTIVE`, `HOMEPAGE_CHANGED`, `HOMEPAGE_ENTITY_SCOPED`, `REPLACE_IN_PROGRESS` (409) and, for `HOMEPAGE_ROLLOUT_ACTIVE`, a `rolloutPlans` array.

### Hooks

`replaceHomepage` (outer, no connection), and the inner, transaction-joined `createHomepageBackup`, `snapshotHomepage` and `cloneWidgetBody`. Helper pairs: `hookBefore/AfterReplaceHomepage`, `hookBefore/AfterCreateHomepageBackup`, `hookBefore/AfterSnapshotHomepage`.

---

## cloneWidgetBody

```ts
cloneWidgetBody(conn: PoolClient, opts: {
  from: { route: string | null; entityUrn: string | null };
  to: { route: string | null; entityUrn: string | null };
  areaMap?: Record<string, string>;
  excludeAreas?: string[];
  theme: 'active' | 'preserve';
  activeTheme?: string | null;
}): Promise<{ clonedInstances: number; clonedPlacements: number; instanceUuidMap: Map<string, string> }>
```

Copies every placement in one scope, together with the instances behind them, into another scope with fresh uuids. Container-child areas (`columnsContainer_<parent uuid>_col_<i>`) are re-pointed at the copied parent. `theme: 'preserve'` copies every theme bucket and keeps each row's theme (what `duplicateLandingPage` uses); `theme: 'active'` copies only the active bucket and stamps it. Set-based (three statements regardless of body size). Writes both tables directly — cms widget hooks and processors do not fire.

---

## findFreeUrlKey

```ts
findFreeUrlKey(isTaken: (candidate: string) => Promise<boolean>, base: string, suffix?: string): Promise<string>
```

Returns `base` (or `<base>-<suffix>`) if free, else appends `-2`, `-3`, … Used by Duplicate (`-copy`) and by the homepage backup.

---

## buildBackupIdentity

```ts
buildBackupIdentity(now: Date, timezone: string | null, replacedByName: string): { name: string; urlKeyBase: string; description: string; zone: string }
```

Pure. Formats the backup's name and url_key base in the store timezone, falling back to UTC when the zone is empty or invalid. `HOMEPAGE_BACKUP_URL_KEY_PREFIX` (`homepage-backup-`) is the contract that identifies backups.

---

## See Also

- [Landing Page API](/docs/api/landing-page) — The REST endpoints behind the admin UI
- [Page Builder](/docs/development/knowledge-base/page-builder) — How the page body is composed from widgets
- [URL Redirects](/docs/development/knowledge-base/url-redirects) — The rename-redirect machinery
- [URN](/docs/development/module/functions/urn) — `PromotionUrn.landingPage(uuid)`, the key placements are scoped by
