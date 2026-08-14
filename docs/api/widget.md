---
sidebar_position: 15
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Widget
  - CMS Widget
  - Widget Placement
sidebar_label: Widget
title: Widget REST API
description: Use the EverShop REST API to manage CMS widget instances and their placements.
---

import Api from '@site/src/components/rest/Api';

# Widget API

Widgets are configurable UI components rendered into storefront areas. A widget is stored as two things:

- a **widget instance** (`widget_instance`) — the type, name, status, theme and settings;
- zero or more **placements** (`widget_placement`) — one row per `(route, area)` cell, each with its own `sort_order`.

That separation is the main change to be aware of: `area`, `route` and `sort_order` are no longer columns on the widget itself. The primary key column is `widget_instance_id`, and the settings column is `settings` (not `setting`).

## Endpoints

### Create a Widget

Creates a widget instance and its placements.

<Api
method="POST"
url="/api/widgets"
requestSchema={{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "description": "Widget type identifier (must match a registered widget)"
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "status": {
      "type": ["string", "integer"],
      "enum": [0, 1, "0", "1"]
    },
    "settings": {
      "type": "object",
      "description": "Widget-specific configuration, validated against the widget type's registered JSON Schema"
    },
    "placements": {
      "type": "array",
      "description": "Preferred placement shape. One widget_placement row per entry",
      "items": {
        "type": "object",
        "properties": {
          "route": { "type": "string" },
          "area": { "type": "string" },
          "sort_order": { "type": "number" }
        }
      }
    },
    "route": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Legacy. Route IDs, cross-multiplied with area to build placements"
    },
    "area": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Legacy. Area IDs, cross-multiplied with route to build placements"
    },
    "sort_order": {
      "type": ["string", "integer"],
      "description": "Legacy. Shared sort order applied to every placement generated from route x area"
    }
  },
  "required": ["name", "status"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "widget_instance_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "collection_products",
    "name": "Featured Products",
    "status": 1,
    "theme": "eve",
    "settings": {
      "collection": "summer-sale",
      "count": 4
    },
    "links": [
      {
        "rel": "widgetGrid",
        "href": "/admin/widgets",
        "action": "GET",
        "types": ["text/xml"]
      },
      {
        "rel": "edit",
        "href": "/admin/widgets/edit/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "action": "GET",
        "types": ["text/xml"]
      }
    ]
  }
}`}
/>

A create payload using the preferred placement shape:

```json
{
  "type": "collection_products",
  "name": "Featured Products",
  "status": 1,
  "settings": {
    "collection": "summer-sale",
    "count": 4
  },
  "placements": [
    { "route": "homepage", "area": "content", "sort_order": 10 },
    { "route": "categoryView", "area": "beforeFooter", "sort_order": 20 }
  ]
}
```

Placement entries missing `route` or `area` are skipped silently. If you send neither `placements` nor `route`/`area`, the widget is created with zero placements and renders nowhere.

<hr/>

### Update a Widget

Updates the instance and, when the payload touches placement fields, rebuilds its placements.

<Api
method="PATCH"
url="/api/widgets/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "status": {
      "type": ["string", "integer"],
      "enum": [0, 1, "0", "1"]
    },
    "settings": {
      "type": "object"
    },
    "placements": {
      "type": "array",
      "description": "Replaces the widget's route-level placements",
      "items": {
        "type": "object",
        "properties": {
          "route": { "type": "string" },
          "area": { "type": "string" },
          "sort_order": { "type": "number" }
        }
      }
    },
    "route": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Legacy placement input"
    },
    "area": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Legacy placement input"
    },
    "sort_order": {
      "type": ["string", "integer"],
      "description": "Legacy placement input"
    }
  },
  "required": ["status"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "widget_instance_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Featured Products Updated",
    "status": 1,
    "links": [
      {
        "rel": "widgetGrid",
        "href": "/admin/widgets",
        "action": "GET",
        "types": ["text/xml"]
      },
      {
        "rel": "edit",
        "href": "/admin/widgets/edit/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "action": "GET",
        "types": ["text/xml"]
      }
    ]
  }
}`}
/>

Placement replacement rules:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Payload</th>
      <th>Effect on placements</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>placements</code> present</td>
      <td>Route-level placements are deleted and recreated from the list. Entity-scoped placements (the ones the page builder owns) are left untouched</td>
    </tr>
    <tr>
      <td>any of <code>route</code>, <code>area</code>, <code>sort_order</code> present</td>
      <td>All placements are deleted and recreated from the cross-product of <code>route</code> x <code>area</code></td>
    </tr>
    <tr>
      <td>none of the above</td>
      <td>Placements are left untouched</td>
    </tr>
  </tbody>
</table>

<hr/>

### Delete a Widget

Permanently removes a widget instance. Its placements cascade.

<Api
method="DELETE"
url="/api/widgets/{id}"
responseSample={`{
  "data": {
    "widget_instance_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}`}
/>

<hr/>

## Notes

### `{id}` is the instance uuid

Every `/api/widgets/{id}` endpoint resolves the widget by `widget_instance.uuid`. A well-formed but unknown uuid returns `Requested widget not found` on PATCH and `Invalid widget id` on DELETE. Passing the integer `widget_instance_id` is not a "not found" case at all: `uuid` is a Postgres `uuid` column, so the comparison raises `invalid input syntax for type uuid` and both endpoints surface it as a `500`.

### `theme` is stamped on create only

On create, the widget's `theme` is stamped from the active theme after validation, so new widgets land in the current theme's bucket.

On update it is **not** re-stamped. `updateWidget` passes the payload straight to `.given(data)`, so a `theme` value in the PATCH body is written through to the row and can move the widget into another theme's bucket — where the storefront's theme filter will stop matching it. Do not send `theme` on update.

### `settings` is schema-validated

When the widget type was registered with a JSON Schema, `settings` is compiled and validated against it. A mismatch fails the whole request with:

```json
{
  "error": {
    "status": 500,
    "message": "Widget settings failed schema validation: [{\"instancePath\":\"/count\",\"message\":\"must be integer\"}]"
  }
}
```

Widget types registered without a schema skip this step. Note that settings are stored as sent — nothing parses a JSON string into an array or object on your behalf, so send real arrays and objects.
