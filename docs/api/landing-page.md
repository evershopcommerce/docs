---
sidebar_position: 26
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Landing Page
  - Campaign Page
  - Promotion
  - REST API
sidebar_label: Landing Pages
title: Landing Page REST API
description: Reference for EverShop's landing page REST API — create, update, delete and duplicate campaign landing pages whose body is built entirely in the page builder.
---

import Api from '@site/src/components/rest/Api';

# Landing Page API

## Overview

A **landing page** is a first-class entity in the `promotion` module, intended for campaign pages. It carries metadata — name, url key, short description, SEO fields, status and a publish window — and it is served at a **root-level URL**, `/<url_key>`.

The thing that makes it different from a [CMS page](./cms-page.md) is that **there is no content field**. A landing page has no `content` column and no editor payload. Its body is a set of entity-scoped `widget_placement` rows, built in the page builder, addressed by the URN `urn:evershop:promotion:landing_page:<uuid>`. Creating a landing page over REST creates an empty shell; the body is composed afterwards at `/admin/page-builder/edit/landingPageView?entity=<uuid>`. See [Page Builder](/docs/development/knowledge-base/page-builder) for how entity-scoped placements render.

There are **four endpoints**, all `access: private` — every one requires an admin access token (see [Authentication](./authentication.md)). Every `{id}` path parameter is the landing page's **uuid**, not its integer primary key.

## Endpoints

### Create A Landing Page

Creates the landing page row and its `url_rewrite` entry in one transaction, so `/<url_key>` starts resolving immediately. Responds **200**.

`name` and `url_key` are the only required fields. `url_key` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` — lowercase alphanumeric segments separated by single hyphens.

<Api
method="POST"
url="/api/landing-pages"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "description": "Display name. Also the fallback meta title"
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "description": "Slug served at root level as /<url_key>"
    },
    "status": {
      "type": ["boolean", "integer", "string"],
      "enum": [true, false, 0, 1, "0", "1"],
      "description": "Published flag. Coerced to boolean; defaults to false (draft)"
    },
    "description": {
      "type": ["string", "null"],
      "description": "Short description. Metadata only — it is NOT rendered in the page body"
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    },
    "publish_start": {
      "type": ["string", "null"],
      "description": "ISO timestamp. Before it, the page 404s to the public"
    },
    "publish_end": {
      "type": ["string", "null"],
      "description": "ISO timestamp. From it, the page 404s to the public"
    }
  },
  "required": ["name", "url_key"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "landing_page_id": 4,
    "uuid": "c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042",
    "status": false,
    "name": "Black Friday 2026",
    "url_key": "black-friday-2026",
    "description": "Doorbuster deals, one day only.",
    "meta_title": "Black Friday 2026 | Our Store",
    "meta_description": "Shop our biggest deals of the year.",
    "publish_start": "2026-11-27 00:00:00+00",
    "publish_end": "2026-11-28 00:00:00+00",
    "created_at": "2026-08-12 09:12:44",
    "updated_at": "2026-08-12 09:12:44",
    "links": [
      {
        "rel": "landingPageGrid",
        "href": "/admin/landing-pages",
        "action": "GET",
        "types": ["text/xml"]
      },
      {
        "rel": "edit",
        "href": "/admin/landing-page/edit/c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042",
        "action": "GET",
        "types": ["text/xml"]
      },
      {
        "rel": "view",
        "href": "/black-friday-2026",
        "action": "GET",
        "types": ["text/xml"]
      }
    ]
  }
}`}
/>

Note the `view` link: it is the **root-level** path `/<url_key>`, not the internal `/landing/<url_key>` route.

<hr />

### Update A Landing Page

Partial update — no field is required, and any field you omit is left untouched. Responds **200** with the updated row and the same `links` block as create.

Renaming the `url_key` does three things in the same transaction:

1. Validates the new slug with `assertUrlKeyAvailable` (see [URL key rules](#url-key-rules) below).
2. Rewrites the `url_rewrite` row so `/<new-key>` resolves.
3. Records a **302 redirect** from `/<old-key>` to `/<new-key>`, so links already in the wild keep working.

The page body is not affected by a rename — placements are keyed by the page's URN, not its slug.

<Api
method="PATCH"
url="/api/landing-pages/c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "description": "Changing it rewrites the root URL and records a 302 from the old one"
    },
    "status": {
      "type": ["boolean", "integer", "string"],
      "enum": [true, false, 0, 1, "0", "1"]
    },
    "description": {
      "type": ["string", "null"]
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    },
    "publish_start": {
      "type": ["string", "null"],
      "description": "An empty string is coerced to null so a cleared date field is accepted"
    },
    "publish_end": {
      "type": ["string", "null"],
      "description": "An empty string is coerced to null so a cleared date field is accepted"
    }
  },
  "required": [],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "landing_page_id": 4,
    "uuid": "c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042",
    "status": true,
    "name": "Black Friday 2026",
    "url_key": "bf-2026",
    "description": "Doorbuster deals, one day only.",
    "meta_title": "Black Friday 2026 | Our Store",
    "meta_description": "Shop our biggest deals of the year.",
    "publish_start": "2026-11-27 00:00:00+00",
    "publish_end": "2026-11-28 00:00:00+00",
    "created_at": "2026-08-12 09:12:44",
    "updated_at": "2026-08-12 11:35:02",
    "links": [
      {
        "rel": "landingPageGrid",
        "href": "/admin/landing-pages",
        "action": "GET",
        "types": ["text/xml"]
      },
      {
        "rel": "edit",
        "href": "/admin/landing-page/edit/c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042",
        "action": "GET",
        "types": ["text/xml"]
      },
      {
        "rel": "view",
        "href": "/bf-2026",
        "action": "GET",
        "types": ["text/xml"]
      }
    ]
  }
}`}
/>

<hr />

### Delete A Landing Page

Removes the page and everything that points at it, in one transaction. Responds **200** with the row as it was before deletion.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Cleaned up</th>
      <th>Why it is explicit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Redirect aliases</td>
      <td>Historical <code>/&lt;old-key&gt;</code> 302s recorded by past renames are purged by URN, so they stop resolving.</td>
    </tr>
    <tr>
      <td><code>url_rewrite</code> row</td>
      <td>Removed so <code>/&lt;url_key&gt;</code> stops resolving at root level.</td>
    </tr>
    <tr>
      <td><code>widget_placement</code> rows</td>
      <td><code>entity_urn</code> is a plain varchar with no foreign key to <code>landing_page</code>, so nothing cascades. The body is deleted explicitly by URN.</td>
    </tr>
  </tbody>
</table>

:::note Widget instances are not deleted
Only the placements are removed. The `widget_instance` rows that were used exclusively by this page survive as orphans. They render nowhere (a widget with no placement has no area to attach to), but they remain in the database and in the legacy widget grid.
:::

<Api
method="DELETE"
url="/api/landing-pages/c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042"
responseSample={`{
  "data": {
    "landing_page_id": 4,
    "uuid": "c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042",
    "status": true,
    "name": "Black Friday 2026",
    "url_key": "bf-2026",
    "description": "Doorbuster deals, one day only.",
    "meta_title": "Black Friday 2026 | Our Store",
    "meta_description": "Shop our biggest deals of the year.",
    "publish_start": "2026-11-27 00:00:00+00",
    "publish_end": "2026-11-28 00:00:00+00",
    "created_at": "2026-08-12 09:12:44",
    "updated_at": "2026-08-12 11:35:02"
  }
}`}
/>

<hr />

### Duplicate A Landing Page

Deep-clones a landing page — metadata **and** the whole page-builder body — as an unpublished draft. Responds **200** with the copy plus an `edit` link. Takes no request body.

What the copy gets:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Value in the copy</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td><code>&lt;source name&gt; (copy)</code></td></tr>
    <tr><td><code>url_key</code></td><td><code>&lt;source key&gt;-copy</code>, then <code>-copy-2</code>, <code>-copy-3</code>… until free (the column is <code>UNIQUE</code>)</td></tr>
    <tr><td><code>status</code></td><td>Always <code>false</code> — the copy is a draft regardless of the source</td></tr>
    <tr><td><code>description</code>, SEO, <code>publish_start</code>, <code>publish_end</code></td><td>Copied verbatim</td></tr>
    <tr><td>Body</td><td>Deep-cloned (see below)</td></tr>
  </tbody>
</table>

The body clone is genuinely deep, and that matters. Widget **settings live on `widget_instance`**, so copying only the placements would leave both pages pointing at the same instances — editing a headline on the copy would silently change the original. Instead the service clones each distinct source `widget_instance` (same `name`, `type`, `settings`, `status` and `theme`, new uuid), builds an old-to-new id map, and inserts one new `widget_placement` per source placement pointing at the cloned instance and stamped with the **new** page's URN. New URN plus new instance id means there is no collision with the `widget_placement_unique` index.

A `url_rewrite` row is created for the copy too, so `/<url_key>-copy` resolves right away — though the page 404s to the public until it is published, since the copy is a draft.

<Api
method="POST"
url="/api/landing-pages/c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042/duplicate"
responseSample={`{
  "data": {
    "landing_page_id": 9,
    "uuid": "5b0f4a19-7d2e-4c88-9a31-6e0c2f7b8d15",
    "status": false,
    "name": "Black Friday 2026 (copy)",
    "url_key": "bf-2026-copy",
    "description": "Doorbuster deals, one day only.",
    "meta_title": "Black Friday 2026 | Our Store",
    "meta_description": "Shop our biggest deals of the year.",
    "publish_start": "2026-11-27 00:00:00+00",
    "publish_end": "2026-11-28 00:00:00+00",
    "created_at": "2026-08-12 12:04:10",
    "updated_at": "2026-08-12 12:04:10",
    "links": [
      {
        "rel": "edit",
        "href": "/admin/landing-page/edit/5b0f4a19-7d2e-4c88-9a31-6e0c2f7b8d15",
        "action": "GET",
        "types": ["text/xml"]
      }
    ]
  }
}`}
/>

<hr />

## Notes

### Root-level serving and URL collisions

A landing page is served at `/<url_key>`, the same mechanism CMS pages use: a `url_rewrite` row maps `request_path = '/<url_key>'` to the internal route `landingPageView` (`/landing/:url_key`). A literal request to `/landing/<key>` **301-redirects** to the root path, so the internal path never becomes canonical.

`url_rewrite` only enforces uniqueness on `entity_uuid`, not on `request_path`, so a landing page and a CMS page really can both claim `/about-us`. The fallback resolver breaks the tie with an explicit precedence:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Precedence</th>
      <th><code>entity_type</code></th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0 (wins)</td><td><code>landing_page</code></td></tr>
    <tr><td>1</td><td><code>cms_page</code></td></tr>
    <tr><td>2</td><td><code>product</code></td></tr>
    <tr><td>3</td><td><code>category</code></td></tr>
    <tr><td>4</td><td>anything else</td></tr>
  </tbody>
</table>

Ties within a type fall back to the oldest `url_rewrite_id`. **Landing pages win every collision**, regardless of which entity claimed the slug first.

### URL key rules

`assertUrlKeyAvailable` runs on create, and on update whenever `url_key` changes. It rejects a slug that:

- equals a single-segment static storefront route (`/cart`, `/account`, …) — the route matcher runs before the `url_rewrite` fallback, so the page would be permanently unreachable;
- equals an enabled language code — the locale-prefix stripper consumes it first;
- is already owned by another **landing page**.

Cross-type collisions are deliberately allowed, because the precedence table above resolves them.

### Visibility is computed per request

There is no cron job flipping a status. `landingPageView` computes liveness on every request: the page is public only when `status = true` **and** `now >= publish_start` (or it is null) **and** `now < publish_end` (or it is null). Anything else 404s.

The one exception is the page builder: a request carrying a valid `?changeset=<token>` renders the page even when it is a draft or outside its window, so a campaign page can be built before it goes live. That check is possession-based — see [Page Builder](/docs/development/knowledge-base/page-builder#the-preview-overlay-and-its-authorization-model).

### Linking to a landing page

Widget links store a URN, `urn:evershop:promotion:landing_page:<uuid>`, not a baked URL — so a later `url_key` rename is followed automatically. The URN is resolved to the current `/<url_key>` at request time by a batched link loader registered from the promotion module's bootstrap. See [Widget Link Fields](/docs/development/module/widget-link-fields).

### Reading landing pages with GraphQL

The REST surface above is write-only. Query landing pages through the admin GraphQL schema (`landingPage`, `landingPages`) or, on the storefront, `currentLandingPage` — which resolves only while the current route is `landingPageView`.
