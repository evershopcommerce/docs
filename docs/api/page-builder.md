---
sidebar_position: 25
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Page Builder
  - Changeset
  - Rollout Plan
  - REST API
sidebar_label: Page Builder
title: Page Builder REST API
description: Reference for EverShop's page builder REST API — create changesets, record widget operations, undo and redo, publish, and schedule or cancel rollout plans.
---

import Api from '@site/src/components/rest/Api';

# Page Builder API

## Overview

The page builder never edits storefront widgets directly. It records every action as an **operation** on a **changeset**, and a changeset reaches shoppers in one of two ways: by being **published** (applied transactionally to the source tables) or by being attached to a **rollout plan** (applied as an in-memory overlay for a scheduled window). The concepts are explained in [Page Builder](/docs/development/knowledge-base/page-builder); this page is the endpoint reference.

There are **ten endpoints**, all `access: private` — every one of them requires an admin access token (see [Authentication](./authentication.md)).

:::warning `{id}` here is the integer primary key, not a uuid
This is the exception to EverShop's usual convention. Every `{id}` on this API is parsed with `Number(...)` and validated with `Number.isInteger(...)`, so it must be a `changeset.changeset_id` or a `rollout_plan.rollout_plan_id`. Passing a uuid returns `400 Invalid changeset id` / `400 Invalid rollout plan id`.

The `?session=` query parameter on the **editor page** (`/admin/page-builder/edit/:routeId`) does take a `rollout_plan.uuid` — do not confuse the two.
:::

Every endpoint sends its own response and returns errors in the standard envelope:

```json
{
  "error": {
    "status": 400,
    "message": "change_order must be a non-negative integer"
  }
}
```

## Changeset endpoints

### Create A Changeset

Creates an empty changeset owned by the authenticated admin and mints a random v4 UUID `token` for previewing it at `<storefront-url>?changeset=<token>`. Responds **201**.

:::note The editor does not use this endpoint
The page builder resolves its session with the server-side `getOrCreateDraftChangeset` service, which is what enforces "one open draft per (admin, theme)" and stamps the draft's `theme` column. This endpoint creates a changeset with `theme = NULL`, so a changeset created here previews correctly only on a store running without a custom theme — otherwise the preview theme guard rejects it with 409/302. Use it for scripted or integration scenarios, not to emulate the editor.
:::

<Api
method="POST"
url="/api/page-builder/changesets"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "description": "Human-readable label for the changeset. Required and trimmed"
    }
  },
  "required": ["name"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "changeset_id": 42,
    "uuid": "9a1c1c1e-0d2f-4a7f-9b64-3d0a8b4f1c22",
    "name": "Spring campaign",
    "route_cursors": {},
    "token": "6f2a0f9d-63cf-4e1a-9d5a-7b1f3a2c8e10",
    "published_at": null,
    "created_by": 1,
    "theme": null,
    "created_at": "2026-08-12 09:41:03",
    "updated_at": "2026-08-12 09:41:03"
  }
}`}
/>

<hr />

### Add An Operation To A Changeset

Records one insert / update / delete against `widget_instance` or `widget_placement`. Responds **201** with the persisted `changeset_operation` row.

The operation type is inferred from the payloads: `(null, set)` is an INSERT, `(set, set)` an UPDATE, `(set, null)` a DELETE. Sending both as `null` is rejected.

Server-side behaviour you cannot override:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Behaviour</th>
      <th>Detail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>change_order</code> is reallocated</td>
      <td>The field is required and validated as a non-negative integer, then discarded. The server allocates <code>MAX(change_order) + 1</code> under a <code>SELECT ... FOR UPDATE</code> row lock on the changeset.</td>
    </tr>
    <tr>
      <td>Redo stack truncation</td>
      <td>Operations on the <strong>same route</strong> with a <code>change_order</code> above that route's cursor are deleted first. Other routes are untouched.</td>
    </tr>
    <tr>
      <td>Theme stamping</td>
      <td>On an INSERT, the changeset's <code>theme</code> is written onto <code>new_payload.theme</code>, overriding any client-supplied value. On an UPDATE or DELETE, a target row belonging to another theme is rejected with <code>400 theme scope violation</code>.</td>
    </tr>
    <tr>
      <td>Ownership</td>
      <td><code>403</code> when the changeset is another admin's <code>pb-draft-*</code> row. Rollout-backed changesets are deliberately shared between admins.</td>
    </tr>
    <tr>
      <td>Immutability</td>
      <td><code>400 Cannot add operations to a published changeset</code>.</td>
    </tr>
  </tbody>
</table>

<Api
method="POST"
url="/api/page-builder/changesets/42/operations"
requestSchema={{
  "type": "object",
  "properties": {
    "route": {
      "type": "string",
      "description": "Route ID this operation belongs to (e.g. homepage). Drives per-route undo/redo"
    },
    "entity_urn": {
      "type": "string",
      "description": "urn:evershop:cms:widget_instance:<uuid> or urn:evershop:cms:widget_placement:<uuid>. Must be a registered URN"
    },
    "old_payload": {
      "type": ["object", "null"],
      "description": "Previous state. Null for an INSERT"
    },
    "new_payload": {
      "type": ["object", "null"],
      "description": "New state. Null for a DELETE"
    },
    "change_order": {
      "type": "integer",
      "minimum": 0,
      "description": "Required and validated, then discarded — the server allocates the real value under a row lock"
    }
  },
  "required": ["route", "entity_urn", "change_order"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "changeset_operation_id": 118,
    "uuid": "b7d2a4e6-4c11-4a3f-8f21-91d0c3a5e004",
    "changeset_id": 42,
    "route": "homepage",
    "entity_urn": "urn:evershop:cms:widget_placement:1f0e9b2a-77c3-4a15-9f0c-2a1b6d8e4c31",
    "old_payload": null,
    "new_payload": {
      "uuid": "1f0e9b2a-77c3-4a15-9f0c-2a1b6d8e4c31",
      "area": "content",
      "route": "homepage",
      "theme": null,
      "sort_order": 15,
      "entity_urn": null,
      "widget_instance_uuid": "5c9d1b77-8a63-4a2b-b0f1-0f4c8e2d7a99"
    },
    "change_order": 7,
    "created_at": "2026-08-12 09:44:19"
  }
}`}
/>

<hr />

### Publish A Changeset

Applies every operation inside the changeset's cursor window to the source tables, in `change_order` ascending order, inside a single transaction, and stamps `published_at`. Responds **200** with the updated changeset row.

Failures roll the whole transaction back and leave the changeset unpublished. Two side effects to plan for:

- The changeset becomes **immutable** — further operation adds, undo/redo and discards are rejected.
- Any `rollout_plan` rows referencing the changeset are **deleted in the same transaction**. Do not hold a rollout plan ID across a publish.

Re-publishing returns `400 Changeset is already published`.

<Api
method="POST"
url="/api/page-builder/changesets/42/publish"
responseSample={`{
  "data": {
    "changeset_id": 42,
    "uuid": "9a1c1c1e-0d2f-4a7f-9b64-3d0a8b4f1c22",
    "name": "Spring campaign",
    "route_cursors": {
      "homepage": 7
    },
    "token": "6f2a0f9d-63cf-4e1a-9d5a-7b1f3a2c8e10",
    "published_at": "2026-08-12 10:02:55",
    "created_by": 1,
    "theme": null,
    "created_at": "2026-08-12 09:41:03",
    "updated_at": "2026-08-12 10:02:55"
  }
}`}
/>

<hr />

### Move The Current Change (Undo / Redo)

Moves one route's cursor in `changeset.route_cursors`. Undo walks to the largest `change_order` strictly below the current one on that route; redo walks to the smallest one strictly above. Neither touches any other route's cursor. Responds **200**.

When the changeset is attached to a rollout plan, undo has a **floor** at `rollout_plan.route_cursors[route]` — that state is what the storefront is currently rendering, so the editor is not allowed to drop below it. Reverting past the floor requires a discard or a rollout cancellation.

Redo with nothing ahead is a silent no-op that returns the unchanged cursor.

<Api
method="POST"
url="/api/page-builder/changesets/42/move-current"
requestSchema={{
  "type": "object",
  "properties": {
    "direction": {
      "type": "string",
      "enum": ["undo", "redo"]
    },
    "route": {
      "type": "string",
      "description": "Route ID whose cursor should move"
    }
  },
  "required": ["direction", "route"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "direction": "undo",
    "route": "homepage",
    "routeCursors": {
      "homepage": 6
    },
    "currentChangeOrder": 6,
    "canUndo": true,
    "canRedo": true
  }
}`}
/>

<hr />

### Discard A Changeset

Two different semantics depending on whether the changeset is attached to a rollout plan. **Read `data.rollout` and `data.changesetDeleted` — do not assume the changeset is gone.** Responds **200**.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Changeset</th>
      <th>Scope</th>
      <th>Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Draft (no rollout plan)</td>
      <td>No <code>?route</code></td>
      <td>Deletes every operation and the changeset row. <code>changesetDeleted: true</code>.</td>
    </tr>
    <tr>
      <td>Draft (no rollout plan)</td>
      <td><code>?route=homepage</code></td>
      <td>Deletes operations on that route and drops its <code>route_cursors</code> entry. If no operations remain anywhere, the changeset row is deleted too.</td>
    </tr>
    <tr>
      <td>Rollout-backed</td>
      <td>No <code>?route</code></td>
      <td><strong>Revert to snapshot.</strong> Restores <code>changeset.route_cursors</code> to the rollout's saved cursors and deletes only the operations above them, across the union of routes in either map. <code>rollout: true</code>, <code>changesetDeleted: false</code>.</td>
    </tr>
    <tr>
      <td>Rollout-backed</td>
      <td><code>?route=homepage</code></td>
      <td>Same revert, restricted to that route.</td>
    </tr>
  </tbody>
</table>

A published changeset cannot be discarded — it is part of the audit trail (`400 Cannot discard a published changeset`).

<Api
method="POST"
url="/api/page-builder/changesets/42/discard?route=homepage"
responseSample={`{
  "data": {
    "discarded": true,
    "mode": "route",
    "route": "homepage",
    "rollout": true,
    "changesetDeleted": false
  }
}`}
/>

## Rollout plan endpoints

A rollout plan makes a changeset visible for a scheduled window **without writing to the source tables**. There is no scheduler: `loadActiveOps` evaluates `start_time <= NOW() AND (end_time IS NULL OR end_time > NOW())` on every storefront request, so creating, editing or cancelling a plan takes effect on the very next request.

### Create A Rollout Plan

Responds **201**. The plan snapshots the changeset's `route_cursors` and inherits its `theme` — from then on the storefront renders the snapshot, not the editor's live cursors, until [Sync](#sync-a-rollout-plan) is called.

Rejections to expect:

- `400` when the proposed window overlaps an existing active-or-upcoming plan. The message lists the conflicting plan names. The overlap check is global for v1.
- `400 Cannot schedule a rollout for a published changeset`.
- `400 end_time must be after start_time`.
- `404` when the changeset does not exist.

On success, a changeset still named `pb-draft-<userId>` is **renamed to the plan's name**, so the admin's draft bucket is freed and their next editor visit mints a fresh draft.

<Api
method="POST"
url="/api/page-builder/rollout-plans"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "changeset_id": {
      "type": "integer",
      "description": "Integer primary key of the changeset to roll out"
    },
    "start_time": {
      "type": "string",
      "description": "ISO timestamp when the overlay starts applying"
    },
    "end_time": {
      "type": ["string", "null"],
      "description": "ISO timestamp when it stops. Null means indefinite"
    }
  },
  "required": ["name", "changeset_id", "start_time"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "rollout_plan_id": 8,
    "uuid": "3c7f9a41-2b6d-4c8e-9a10-5f2b7d4e1c93",
    "name": "Black Friday banner",
    "changeset_id": 42,
    "route_cursors": {
      "homepage": 7
    },
    "theme": null,
    "start_time": "2026-11-27 00:00:00+00",
    "end_time": "2026-12-01 00:00:00+00",
    "created_at": "2026-08-12 10:15:00",
    "updated_at": "2026-08-12 10:15:00"
  }
}`}
/>

<hr />

### List Rollout Plans

Responds **200** with plans plus a summary of the changeset behind each one. Optional `?status` filter, defaulting to `all`. An invalid value returns `400`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th><code>status</code></th>
      <th>Filter</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>active</code></td><td><code>start_time &lt;= NOW() AND (end_time IS NULL OR end_time &gt; NOW())</code></td></tr>
    <tr><td><code>upcoming</code></td><td><code>start_time &gt; NOW()</code></td></tr>
    <tr><td><code>past</code></td><td><code>end_time IS NOT NULL AND end_time &lt;= NOW()</code></td></tr>
    <tr><td><code>all</code></td><td>No time filter (default)</td></tr>
  </tbody>
</table>

Sort order is indefinite plans first (`end_time IS NULL`), then `start_time` descending, then `rollout_plan_id` descending. Each row carries `indefinite: true` when it has no end time. Keys in this response are **camelCase**, unlike the other endpoints on this page, which return raw snake_case database rows.

<Api
method="GET"
url="/api/page-builder/rollout-plans?status=active"
responseSample={`{
  "data": {
    "status": "active",
    "rolloutPlans": [
      {
        "rolloutPlanId": 8,
        "uuid": "3c7f9a41-2b6d-4c8e-9a10-5f2b7d4e1c93",
        "name": "Black Friday banner",
        "changesetId": 42,
        "startTime": "2026-11-27T00:00:00.000Z",
        "endTime": null,
        "createdAt": "2026-08-12T10:15:00.000Z",
        "updatedAt": "2026-08-12T10:15:00.000Z",
        "indefinite": true,
        "changeset": {
          "name": "Black Friday banner",
          "uuid": "9a1c1c1e-0d2f-4a7f-9b64-3d0a8b4f1c22",
          "publishedAt": null,
          "operationCount": 7
        }
      }
    ]
  }
}`}
/>

<hr />

### Update A Rollout Plan's Schedule

Edits the plan's `name`, `start_time` and `end_time`. Responds **200** with the updated row. It runs the same overlap check as create, **excluding the plan being edited**, so an in-place edit can keep its own window.

This endpoint does not touch `route_cursors` or `changeset_id` — moving the live content forward is [Sync](#sync-a-rollout-plan)'s job.

<Api
method="PATCH"
url="/api/page-builder/rollout-plans/8"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "start_time": {
      "type": "string",
      "description": "ISO timestamp"
    },
    "end_time": {
      "type": ["string", "null"],
      "description": "ISO timestamp, or null for indefinite"
    }
  },
  "required": ["name", "start_time"],
  "additionalProperties": false
}}
responseSample={`{
  "data": {
    "rollout_plan_id": 8,
    "uuid": "3c7f9a41-2b6d-4c8e-9a10-5f2b7d4e1c93",
    "name": "Black Friday banner (extended)",
    "changeset_id": 42,
    "route_cursors": {
      "homepage": 7
    },
    "theme": null,
    "start_time": "2026-11-25 00:00:00+00",
    "end_time": "2026-12-05 00:00:00+00",
    "created_at": "2026-08-12 10:15:00",
    "updated_at": "2026-08-12 11:02:31"
  }
}`}
/>

<hr />

### Sync A Rollout Plan

The "Save" action of rollout-edit mode. Copies `changeset.route_cursors` into `rollout_plan.route_cursors`, promoting whatever the editor currently shows to what the storefront renders. Responds **200**.

Idempotent — when the two maps already match, the update rewrites the same JSONB. Syncing a plan whose changeset has been published returns `400 Cannot sync a published changeset`.

<Api
method="POST"
url="/api/page-builder/rollout-plans/8/sync"
responseSample={`{
  "data": {
    "synced": true,
    "routeCursors": {
      "homepage": 11,
      "cart": 3
    }
  }
}`}
/>

<hr />

### Cancel A Rollout Plan

Deletes the plan. The underlying changeset is **preserved** — it stays queryable and can be scheduled again. Responds **200**.

An active rollout stops applying on the next storefront request; a not-yet-started one simply never starts; an already-ended one is just cleaned up.

<Api
method="DELETE"
url="/api/page-builder/rollout-plans/8"
responseSample={`{
  "data": {
    "cancelled": true
  }
}`}
/>

<hr />

## Notes

### Preview a changeset without publishing it

Append the changeset's `token` to any storefront URL:

```bash
curl "https://<your domain>/?changeset=6f2a0f9d-63cf-4e1a-9d5a-7b1f3a2c8e10"
```

**Possession of the token is the authorization.** The storefront request runs under the storefront session, not the admin one, so there is no session check — any request presenting a valid token gets the overlay. Treat tokens as secrets and strip the `changeset` parameter from anything you log or share.

The preview is also theme-guarded: a token whose changeset belongs to a different theme than the active one is rejected with 409 (JSON clients) or 302 (browsers).

### Reading changesets with GraphQL

The admin GraphQL schema exposes `Query.changeset`, `Query.changesets`, `Query.rolloutPlan`, `Query.rolloutPlans` and `Query.activeRolloutPlans`, plus per-route operation counts (`Changeset.operationCountForRoute`, `Changeset.operationCountsByRoute`). Use those for reads — the REST surface above is write-oriented, and only `GET /api/page-builder/rollout-plans` returns a collection.

### Further reading

The model behind these endpoints — draft scoping, the overlay engine, the two-cursor system, per-route undo/redo — is documented in [Page Builder](/docs/development/knowledge-base/page-builder).
