---
sidebar_position: 56
keywords:
  - page builder
  - changeset
  - rollout plan
  - widget placement
  - widget instance
  - editable route
sidebar_label: Page Builder
title: Page Builder
description: How the EverShop page builder works under the hood — the draft changeset model, the preview overlay, publish and scheduled rollouts, and how to make your own storefront route page-builder-editable.
---

# Page Builder

The **page builder** is the visual editor merchandisers use to add, configure, reorder and remove widgets on storefront routes. It lives in the `pageBuilder` core module and it never writes to the storefront's source tables while you edit — every action is recorded as an operation on a **draft changeset**, and the storefront preview is produced by overlaying that changeset in memory at request time.

This page documents the parts a developer touches: how to opt a route in, where widget data actually lives, and how draft, preview, publish and rollout interact.

## Editor routes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Route</th>
      <th>Route ID</th>
      <th>What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/admin/page-builder</code></td>
      <td><code>pageBuilder</code></td>
      <td>Not a list page. It <strong>302-redirects straight into the editor</strong>, preferring <code>homepage</code> and otherwise taking the first editable route. Only when no route is editable does it fall through to an empty-state picker.</td>
    </tr>
    <tr>
      <td><code>/admin/page-builder/edit/:routeId</code></td>
      <td><code>pageBuilderEdit</code></td>
      <td>The editor itself: topbar, widget palette, layers panel, settings drawer, and an iframe rendering the storefront route with the draft overlay applied.</td>
    </tr>
  </tbody>
</table>

The redirect lives in `modules/pageBuilder/pages/admin/pageBuilder/index.ts`; the editor entry middleware is `modules/pageBuilder/pages/admin/pageBuilderEdit/index.ts`. Requesting `/admin/page-builder/edit/<routeId>` for a route that is not editable returns **404**.

Two optional query parameters change the editor session:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>?session=&lt;rollout-plan-uuid&gt;</code></td>
      <td>Opens the changeset behind an existing rollout plan instead of the admin's draft (rollout-edit mode). An unknown uuid, or a rollout whose changeset was already published, silently falls back to the draft.</td>
    </tr>
    <tr>
      <td><code>?entity=&lt;uuid&gt;</code> / <code>?pbScope=route</code></td>
      <td>Scopes the session to a single entity on an entity-scoped route (see <a href="#entity-scoped-placements">Entity-scoped placements</a>). <code>pbScope=route</code> forces route-level editing even when an entity uuid is present.</td>
    </tr>
  </tbody>
</table>

## Making a route page-builder-editable

This is the one thing most developers need. A storefront route opts in with a single flag in its `route.json`:

```json
{
  "methods": ["GET"],
  "path": "/lookbook/:url_key",
  "name": "Lookbook page",
  "editable": true
}
```

Both `name` and `editable` matter:

- **`"editable": true`** — read by `lib/router/scanForRoutes.js` (`editable: routeJson?.editable === true`, so the default is `false`), carried onto the route object by `lib/router/registerFrontStoreRoute.js`, and filtered by `modules/pageBuilder/pages/admin/pageBuilder/index.ts`. The filter is `!route.isApi && !route.isAdmin && route.editable === true && typeof route.path === 'string'` — **admin and API routes can never be editable**, no matter what their `route.json` says.
- **`"name"`** — the admin `Query.routes` resolver drops any route without a `name`, so a nameless route never reaches the page-switcher even with `editable: true`.

The flag surfaces in the admin GraphQL schema as `Route.editableInPageBuilder` (renamed for clarity; the `route.json` key itself stays `editable` for backwards compatibility):

```graphql
query {
  routes {
    id
    name
    path
    editableInPageBuilder
    previewPath
  }
}
```

### Routes with URL parameters

The editor iframe needs a concrete URL. `Route.previewPath` supplies it: for a static route it equals `path`; for a route with a `:param` segment the resolver substitutes a sample entity from a table of samplers (`PREVIEW_SAMPLERS` in `modules/base/graphql/types/Route/Route.admin.resolvers.js`), keyed by route ID:

```ts
categoryView: {
  param: 'uuid',
  sql: 'SELECT uuid FROM category ORDER BY category_id LIMIT 1'
}
```

A sampler may also declare `format(value)` when the public URL differs from the internal route path (`cmsPageView` uses it because CMS pages are served at root-level `/<url_key>`, not at `/page/<url_key>`). When there is no sampler, or the query returns nothing, `previewPath` falls back to the raw `path` — the editor shell still works, but the canvas renders whatever the route does with an unresolved parameter.

### The 13 core editable routes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Route ID</th>
      <th>Path</th>
      <th>Module</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>homepage</code></td><td><code>/</code></td><td>cms</td></tr>
    <tr><td><code>cmsPageView</code></td><td><code>/page/:url_key</code></td><td>cms</td></tr>
    <tr><td><code>catalogSearch</code></td><td><code>/search</code></td><td>catalog</td></tr>
    <tr><td><code>categoryView</code></td><td><code>/category/:uuid</code></td><td>catalog</td></tr>
    <tr><td><code>productView</code></td><td><code>/product/:uuid</code></td><td>catalog</td></tr>
    <tr><td><code>cart</code></td><td><code>/cart</code></td><td>checkout</td></tr>
    <tr><td><code>checkout</code></td><td><code>/checkout</code></td><td>checkout</td></tr>
    <tr><td><code>account</code></td><td><code>/account</code></td><td>customer</td></tr>
    <tr><td><code>landingPageView</code></td><td><code>/landing/:url_key</code></td><td>promotion</td></tr>
    <tr><td><code>blogHome</code></td><td><code>/blog</code></td><td>blog</td></tr>
    <tr><td><code>blogPostView</code></td><td><code>/blogPost/:uuid</code></td><td>blog</td></tr>
    <tr><td><code>blogCategoryView</code></td><td><code>/blogCategory/:uuid</code></td><td>blog</td></tr>
    <tr><td><code>blogTagView</code></td><td><code>/blogTag/:uuid</code></td><td>blog</td></tr>
  </tbody>
</table>

Every other core storefront route is deliberately not editable. Extensions add their own by shipping `"editable": true` in their route's `route.json` — no registration call, no bootstrap hook.

## Widget storage: instance + placement

The page builder rides on a widget schema that changed in `modules/cms/migration/Version-1.3.0.ts`. If you have code that predates it, this is the breaking part:

- The **`widget` table was renamed to `widget_instance`**, and `widget_id` to `widget_instance_id`.
- The `route`, `area` and `sort_order` columns were **dropped from the instance** and moved into a new **`widget_placement`** table — one row per widget instance x route x area cell.

```
widget_instance      the thing        (type, name, settings JSONB, status, theme)
widget_placement     where it appears (widget_instance_id, route, area, sort_order, entity_urn, theme)
```

`widget_placement.sort_order` is `REAL`, not `INT`, precisely so the editor can drop a widget between two neighbours by midpoint arithmetic without renumbering the rest of the area. A unique index `widget_placement_unique` on `(widget_instance_id, route, area, COALESCE(entity_urn, ''))` prevents duplicate cells while still allowing several entity-scoped placements of the same widget.

One instance can carry many placements — that is how "show this banner on cart and checkout too" works, and why editing the widget's settings changes it everywhere at once.

### Widgets are scoped to a theme

`Version-1.1.0.ts` of the `pageBuilder` module added a nullable `theme TEXT` column to `widget_instance`, `widget_placement`, `changeset` and `rollout_plan`, backfilled from `config.system.theme`. `modules/cms/services/widget/loadWidgetInstances.js` filters both widget tables by the active theme on every storefront request:

```sql
SELECT ... FROM widget_placement p
INNER JOIN widget_instance wi ON wi.widget_instance_id = p.widget_instance_id
WHERE p.theme IS NOT DISTINCT FROM $1
```

`NULL` is the "no custom theme" bucket, which is why the predicate is `IS NOT DISTINCT FROM` and not `=`. Any query you write against these tables must do the same — a plain `theme = $1` silently drops every row belonging to a store running without a custom theme.

Content built under theme A is invisible while theme B is active. It is not deleted; switching back makes it reappear.

## The draft changeset model

Three tables, created by `modules/pageBuilder/migration/Version-1.0.0.ts`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Table</th>
      <th>What it holds</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>changeset</code></td>
      <td>An editing session. Carries <code>name</code>, a unique <code>token</code> (the preview secret), <code>published_at</code>, <code>created_by</code>, <code>theme</code>, and <code>route_cursors JSONB</code>.</td>
    </tr>
    <tr>
      <td><code>changeset_operation</code></td>
      <td>One row per insert / update / delete against <code>widget_instance</code> or <code>widget_placement</code>. Holds <code>route</code>, <code>entity_urn</code>, <code>old_payload</code>, <code>new_payload</code> and <code>change_order</code>. <code>changeset_id</code> cascades on delete.</td>
    </tr>
    <tr>
      <td><code>rollout_plan</code></td>
      <td>A schedule entry: <code>name</code>, <code>changeset_id</code>, <code>start_time</code>, <code>end_time</code> (nullable = indefinite), its own <code>route_cursors</code> snapshot and <code>theme</code>.</td>
    </tr>
  </tbody>
</table>

All timestamps are `TIMESTAMP WITH TIME ZONE`.

An operation never states its type — the type is **inferred from which payloads are set** (`modules/pageBuilder/services/applyOperationToSource.ts`):

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th><code>old_payload</code></th>
      <th><code>new_payload</code></th>
      <th>Operation</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>null</td><td>set</td><td>INSERT</td></tr>
    <tr><td>set</td><td>set</td><td>UPDATE</td></tr>
    <tr><td>set</td><td>null</td><td>DELETE</td></tr>
    <tr><td>null</td><td>null</td><td>rejected — the API returns 400</td></tr>
  </tbody>
</table>

Payloads reference entities by **UUID**, never by auto-increment ID, and `entity_urn` is a registered URN (`urn:evershop:cms:widget_instance:<uuid>` or `urn:evershop:cms:widget_placement:<uuid>`). The publish path resolves UUIDs to integer foreign keys at apply time, so a changeset created before a row existed still applies cleanly.

### One draft per (admin, theme)

`modules/pageBuilder/services/getOrCreateDraftChangeset.ts` resolves the session:

```ts
const changeset = await getOrCreateDraftChangeset({ userId, theme: activeTheme });
```

The draft is named `pb-draft-<userId>` and is reused until the admin publishes it, saves it as a rollout plan, or discards it. It is **not** per route — a single draft carries operations for every route the admin touches during the session, because each `changeset_operation` row carries its own `route` column.

Uniqueness is enforced by a partial unique index added in `Version-1.1.0.ts`:

```sql
CREATE UNIQUE INDEX idx_changeset_user_theme_open
  ON changeset(created_by, COALESCE(theme, ''))
  WHERE published_at IS NULL AND name LIKE 'pb-draft-%'
```

The `name LIKE 'pb-draft-%'` predicate is deliberate: a rollout-backed changeset stays open on purpose and must be able to coexist with a fresh draft owned by the same admin.

## The preview overlay and its authorization model

When a storefront request carries `?changeset=<token>`, `loadWidgetInstances.js` overlays that changeset's operations on top of the source tables — in memory, for that request only:

```
loadWidgetInstances.js
  ├── SELECT widget_instance  WHERE theme IS NOT DISTINCT FROM <active>
  ├── SELECT widget_placement WHERE theme IS NOT DISTINCT FROM <active>
  ├── loadActiveOps({ previewChangesetToken })      → the operations to apply
  └── applyOverlayToWidgets(widgetMap, placementMap, ops)
```

`modules/pageBuilder/services/loadActiveOps.ts` has two branches, and they differ only in which cursor map they filter by:

- **Preview** (a token is present) — returns that changeset's operations, filtered by `changeset.route_cursors`, i.e. the editor's live undo/redo position.
- **Production** (no token) — returns the union of operations from every rollout plan where `start_time <= NOW() AND (end_time IS NULL OR end_time > NOW())` and whose theme matches, filtered by `rollout_plan.route_cursors`.

`applyOverlayToWidgets.ts` is a pure in-memory function that applies the conflict-resolution table:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Source state</th>
      <th>Operation</th>
      <th>Outcome</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Present</td><td>INSERT</td><td>Overwrites (defensive — <code>change_order</code> should prevent it)</td></tr>
    <tr><td>Present</td><td>UPDATE</td><td>Merged into the in-memory copy</td></tr>
    <tr><td>Present</td><td>DELETE</td><td>Removed, cascading dependent placements in memory</td></tr>
    <tr><td>Missing</td><td>INSERT</td><td>Added</td></tr>
    <tr><td>Missing</td><td>UPDATE</td><td>Silently skipped — a publish-side delete wins</td></tr>
    <tr><td>Missing</td><td>DELETE</td><td>No-op</td></tr>
  </tbody>
</table>

:::warning Possession of the token is the authorization
The editor iframe loads a **storefront** URL, which gets the storefront session — not the admin one. There is therefore no admin-session check on the preview path. `changeset.token` is a v4 UUID with a `UNIQUE` constraint, and any request that presents a valid token gets the overlay.

Treat preview tokens as secrets. A leaked `?changeset=<token>` link lets an anonymous visitor see unpublished content (it does not let them modify anything — every write goes through the authenticated API). If you build tooling that logs full URLs, strip the `changeset` parameter.
:::

A second guard runs before the overlay: the `frontStore/all` middleware backed by `modules/pageBuilder/services/enforcePreviewThemeMatch.ts` compares the changeset's theme with the active theme and responds 409 (JSON) or 302 (browser) on a mismatch. `loadWidgetInstances` re-checks it and keeps the overlay inert as defence in depth.

Two behaviours ride on the same possession-based trust:

- `modules/pageBuilder/services/isValidPreviewToken.ts` lets a **scheduled or draft landing page** render inside the editor before its publish window opens — without the bypass, the canvas would show a 404 for exactly the page you are building.
- The overlay applies on any route, so previewing a widget added to `all` shows it on every page you navigate to inside the iframe.

## Publish vs rollout plans

There are two ways for a changeset to reach shoppers.

### Publish — immediate and transactional

`POST /api/page-builder/changesets/:id/publish` runs `modules/pageBuilder/services/publishChangeset.ts`, which walks the operations in `change_order ASC`, applies each one to the source tables via `applyOperationToSource`, and stamps `published_at`. The whole walk is one transaction: any failure rolls back and the changeset stays unpublished.

Two consequences worth knowing:

- Publishing is **one-shot**. A published changeset is immutable — `addChangesetOperation`, `moveCurrentChange` and `discardChangeset` all reject it with 400.
- Publishing **deletes any `rollout_plan` rows pointing at that changeset**, in the same transaction. Do not hold a rollout plan ID across a publish call.

### Rollout plan — scheduled overlay, never baked in

A rollout plan does not modify source tables at all. It is a window during which `loadActiveOps` folds the changeset's operations into every storefront request. Cancelling the plan (`DELETE /api/page-builder/rollout-plans/:id`) stops it on the very next request — there is no scheduler and no cron job — and preserves the changeset.

Overlaps are rejected: `createRolloutPlan` and `updateRolloutPlan` both refuse a window that intersects an existing active-or-upcoming plan (the PATCH excludes the plan being edited so an in-place edit can keep its own window). Scope is global for v1.

### The two-cursor system

A rollout-backed changeset stays editable, which creates a problem: the editor's live state must not leak to shoppers on every keystroke. It is solved with two cursor maps:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Cursor map</th>
      <th>Who reads it</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>changeset.route_cursors</code></td>
      <td>The editor and the preview branch of <code>loadActiveOps</code> — the merchandiser's live view.</td>
    </tr>
    <tr>
      <td><code>rollout_plan.route_cursors</code></td>
      <td>The production branch of <code>loadActiveOps</code> — the snapshot the storefront actually renders.</td>
    </tr>
  </tbody>
</table>

`createRolloutPlan` snapshots the changeset's cursors into the plan. From then on the editor advances `changeset.route_cursors` freely, and `POST /rollout-plans/:id/sync` is the explicit "Save" that promotes the editor's cursors to the live ones.

Two behaviours follow from the snapshot being live:

- **Undo has a floor.** `moveCurrentChange` refuses to move a route's cursor below `rollout_plan.route_cursors[route]` — that state is what shoppers currently see.
- **Discard means revert, not delete.** On a rollout-backed changeset, `discardChangeset` restores the cursors to the rollout's snapshot and deletes only the operations above it. The response carries `rollout: true` and `changesetDeleted: false`; API consumers must branch on that flag rather than assuming the changeset is gone.

## Per-route undo/redo

`changeset.route_cursors` is a JSONB map from route ID to the highest applied `change_order`:

```json
{ "homepage": 12, "cart": 5 }
```

An operation is applied **iff `op.change_order <= route_cursors[op.route]`**, defaulting to `0` when the route is absent from the map. `change_order` itself is globally monotonic across the whole changeset — only the *apply window* is per route. Undoing on the homepage does not touch the cart's cursor.

- `addChangesetOperation` truncates the redo stack **for that route only** (`DELETE ... WHERE route = $route AND change_order > cursor`), allocates `change_order = MAX(change_order) + 1` across the whole changeset, then advances that route's cursor.
- `moveCurrentChange` walks to the next/previous `change_order` restricted to the given route, and returns post-move `canUndo` / `canRedo`.
- `publishChangeset` and the preview branch of `loadActiveOps` filter with `op.change_order <= COALESCE((cs.route_cursors ->> op.route)::int, 0)`, so an undone operation never renders and never publishes.

Concurrency is handled by a `SELECT ... FROM changeset WHERE changeset_id = $1 FOR UPDATE` at the top of `addChangesetOperation`, which serialises parallel auto-save requests on the same changeset. `Version-1.2.0.ts` adds a belt-and-braces unique index on `(changeset_id, change_order)` after collapsing any duplicate pairs left behind by pre-lock builds.

:::note `change_order` is server-allocated
The endpoint requires a `change_order` in the body and validates it as a non-negative integer, then **discards it** and allocates its own under the row lock. Do not rely on the value you sent coming back.
:::

## Entity-scoped placements

`widget_placement.entity_urn` is `NULL` for a normal route-level placement. When it is set, the placement only renders on the request that resolves to that exact entity.

A route joins this system by setting `request.locals.pageBuilderEntityUrn` in its frontStore handler:

```ts
request.locals = request.locals ?? {};
request.locals.pageBuilderEntityUrn = PromotionUrn.landingPage(landingPage.uuid);
```

`loadWidgetInstances` then accepts placements where `entity_urn IS NULL` **or** `entity_urn` equals the request's URN. When the same widget has both at the same `(area, sort_order)` cell, the entity-scoped placement wins.

The admin side is registered from `bootstrap.ts` via `lib/util/entityScopeRegistry.ts`, which tells the editor how to resolve `?entity=<uuid>` into a URN plus a preview path and how to enumerate selectable entities. Landing pages are the reference implementation — see the [Landing Page API](/docs/api/landing-page). CMS pages are deliberately **route-level only**: they are not registered in the entity-scope registry, so the editor shows no entity selector for `cmsPageView`.

## Common pitfalls

- **`"editable": true` on an admin or API route.** The picker filters those out unconditionally. Only frontStore routes can be edited.
- **Omitting `"name"` from `route.json`.** `Query.routes` drops nameless routes, so the route never appears in the page switcher even with the flag set.
- **Querying `widget` instead of `widget_instance`.** The table was renamed in `cms/migration/Version-1.3.0.ts`, and `route`/`area`/`sort_order` no longer live on it.
- **Filtering theme with `theme = $1`.** Use `IS NOT DISTINCT FROM` (SQL) or `===` (JS). `NULL` is the "no custom theme" bucket, and a plain equality drops it.
- **Assuming discard deletes the changeset.** On a rollout-backed changeset it is a revert to the saved snapshot. Read `data.rollout` and `data.changesetDeleted` in the response.
- **Holding a rollout plan ID across a publish.** `publishChangeset` deletes rollout plans referencing the changeset in the same transaction.
- **Treating a preview token as a public link.** Possession is the authorization.
- **Assuming an active rollout modified the database.** It did not. Rollouts are pure request-time overlay; only publish writes to source tables.

## See also

- [Widget Development](/docs/development/module/widget-development) — authoring a widget type
- [Widget Link Fields](/docs/development/module/widget-link-fields) — URN-based links and the mandatory `previewComponent`
- [Page Builder API](/docs/api/page-builder) — the ten changeset and rollout-plan endpoints
- [Landing Page API](/docs/api/landing-page) — entity-scoped pages built entirely in the page builder
- [Routing System](/docs/development/knowledge-base/routing-system) — how `route.json` is scanned and registered

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
