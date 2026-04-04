---
sidebar_position: 15
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Widget
  - CMS Widget
sidebar_label: Widget
title: Widget REST API
description: Use the EverShop REST API to manage CMS widgets.
---

import Api from '@site/src/components/rest/Api';

# Widget API

Widgets are configurable UI components that can be placed on storefront pages through the admin panel.

## Endpoints

### Create a Widget

Creates a new widget instance with type, area placement, and settings.

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
      "type": "string"
    },
    "status": {
      "type": ["string", "integer"],
      "enum": [0, 1, "0", "1"]
    },
    "area": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Area IDs where the widget should appear"
    },
    "route": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Route IDs where the widget is active"
    },
    "sort_order": {
      "type": ["string", "integer"]
    },
    "settings": {
      "type": "object",
      "description": "Widget-specific configuration"
    }
  }
}}
responseSample={`{
  "data": {
    "widget_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "collection_products",
    "name": "Featured Products",
    "status": 1,
    "setting": {
      "collection": "summer-sale",
      "count": 4
    },
    "sort_order": 10
  }
}`}
/>

<hr/>

### Update a Widget

Updates an existing widget's settings, placement, or status.

<Api
method="PATCH"
url="/api/widgets/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "status": {
      "type": ["string", "integer"],
      "enum": [0, 1, "0", "1"]
    },
    "area": {
      "type": "array",
      "items": { "type": "string" }
    },
    "route": {
      "type": "array",
      "items": { "type": "string" }
    },
    "sort_order": {
      "type": ["string", "integer"]
    },
    "settings": {
      "type": "object"
    }
  }
}}
responseSample={`{
  "data": {
    "widget_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Featured Products Updated",
    "status": 1
  }
}`}
/>

<hr/>

### Delete a Widget

Permanently removes a widget instance.

<Api
method="DELETE"
url="/api/widgets/{id}"
responseSample={`{
  "data": {
    "widget_id": 5,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}`}
/>
