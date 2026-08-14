---
sidebar_position: 9
keywords:
- registerWidget
- widget
- registration
- component
groups:
- widgets
sidebar_label: registerWidget
title: registerWidget
description: Register a new widget in the widget manager.
---

# registerWidget

Register a new widget in the widget manager during the bootstrap phase.

## Import

```ts
import { registerWidget } from '@evershop/evershop/lib/widget';
```

## Syntax

```ts
registerWidget(widget: Widget): boolean
```

### Parameters

**`widget`**

**Type:** `Widget`

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>type</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Unique widget type id. Must match <code>/^[a-zA-Z_][a-zA-Z0-9_]*$/</code> — letters, digits and underscores, and it may not <strong>start</strong> with a digit.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Display name in the admin panel and page-builder palette.</td>
    </tr>
    <tr>
      <td><code>component</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Absolute path to the storefront component (a <code>.js</code> file with an uppercase basename).</td>
    </tr>
    <tr>
      <td><code>settingComponent</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Absolute path to the admin settings component (same file rules).</td>
    </tr>
    <tr>
      <td><code>previewComponent</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Absolute path to the palette hover-preview component (same file rules). Registration throws without it.</td>
    </tr>
    <tr>
      <td><code>enabled</code></td>
      <td><code>boolean</code></td>
      <td>Yes</td>
      <td>Whether the widget is offered to merchants.</td>
    </tr>
    <tr>
      <td><code>defaultSettings</code></td>
      <td><code>Record&lt;string, any&gt;</code></td>
      <td>Yes</td>
      <td>Initial settings for a newly-added instance. Validated against <code>schema</code> at registration.</td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Short explanation shown in the palette.</td>
    </tr>
    <tr>
      <td><code>category</code></td>
      <td><code>WidgetCategory</code></td>
      <td>No</td>
      <td>One of <code>'content'</code>, <code>'commerce'</code>, <code>'navigation'</code>, <code>'marketing'</code>, <code>'layout'</code>.</td>
    </tr>
    <tr>
      <td><code>icon</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>A lucide-react icon name from the curated map (e.g. <code>Columns</code>, <code>Type</code>, <code>Image</code>). Unknown names fall back to <code>Layers</code>.</td>
    </tr>
    <tr>
      <td><code>schema</code></td>
      <td><code>WidgetSchemaDefinition</code></td>
      <td>No</td>
      <td>JSON Schema (draft-07) for the settings object. Optional for backward compatibility — omitting it logs a warning and will become an error in a future version.</td>
    </tr>
    <tr>
      <td><code>graphql</code></td>
      <td><code>&#123; typeDefs: string; settingsType: string &#125;</code></td>
      <td>No</td>
      <td>SDL fragment plus the name of the settings type that joins the <code>WidgetSettings</code> union.</td>
    </tr>
  </tbody>
</table>

:::warning `defaultSettings`, not `default_settings`
The field is camelCase. TypeScript rejects `default_settings` outright; in plain JavaScript it is accepted and ignored, leaving `defaultSettings` undefined. If the widget also declares a `schema`, registration then throws — `undefined` is not an object — so the mistake surfaces at boot. Without a schema it fails silently, and every new instance starts with no settings.
:::

## Return Value

Returns `boolean`:
- `true` if the widget was successfully registered
- `false` if a widget with the same type already exists (a warning is logged)

Invalid input throws rather than returning `false`.

## Examples

### Basic Usage

```ts
import path from 'path';
import { registerWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  registerWidget({
    type: 'banner_slider',
    name: 'Banner Slider',
    description: 'Display a banner slider',
    category: 'marketing',
    enabled: true,
    settingComponent: path.resolve(
      import.meta.dirname,
      'components/BannerSliderSetting.js'
    ),
    component: path.resolve(
      import.meta.dirname,
      'components/BannerSlider.js'
    ),
    previewComponent: path.resolve(
      import.meta.dirname,
      'components/BannerSliderPreview.js'
    ),
    defaultSettings: {
      slides: [],
      autoplay: true
    }
  });
}
```

:::info `__dirname` does not exist in extensions
Extensions are ESM, where `__dirname` is `undefined` — `path.resolve(undefined, …)` throws. Use `import.meta.dirname`.
:::

### Complete Widget Registration

```ts
import path from 'path';
import { registerWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  registerWidget({
    type: 'product_carousel',
    name: 'Product Carousel',
    description: 'Display products in a carousel',
    category: 'commerce',
    icon: 'Image',
    enabled: true,
    settingComponent: path.resolve(
      import.meta.dirname,
      'components/ProductCarouselSetting.js'
    ),
    component: path.resolve(
      import.meta.dirname,
      'components/ProductCarousel.js'
    ),
    previewComponent: path.resolve(
      import.meta.dirname,
      'components/ProductCarouselPreview.js'
    ),
    defaultSettings: {
      limit: 10,
      autoplay: true,
      interval: 5000
    },
    schema: {
      type: 'object',
      additionalProperties: true,
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 50 },
        autoplay: { type: 'boolean' },
        interval: { type: 'integer', minimum: 1000 }
      }
    },
    graphql: {
      typeDefs: `
        type ProductCarouselSettings {
          limit: Int
          autoplay: Boolean
          interval: Int
        }
      `,
      settingsType: 'ProductCarouselSettings'
    }
  });
}
```

## The preview component

`previewComponent` renders the hover-preview card in the page-builder Widgets palette. It receives **no props**, so it must render a self-contained stylized mock (rectangles, lines, placeholder text) that works without runtime data or context. It is bundled into the admin build under the key `admin_widget_preview_<type>`.

```tsx title="components/ProductCarouselPreview.tsx"
import React from 'react';

export default function ProductCarouselPreview() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 w-12 rounded bg-gray-200" />
      ))}
    </div>
  );
}
```

## Validation Rules

Every rule below **throws** on violation.

### Widget type
- Must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/` — letters, digits, underscores; cannot start with a digit; no spaces or dashes.
- Cannot be empty.
- A duplicate type does not throw: registration is skipped and `false` is returned with a warning.

### Component paths
- `component`, `settingComponent` **and** `previewComponent` are all required.
- Each must resolve to an **existing** file with a `.js` extension (paths point at compiled output, not the `.tsx` source).
- Each base filename must start with an uppercase letter.

### Schema and default settings
- `schema` must compile under AJV — an invalid JSON Schema throws `Widget "<type>" has an invalid JSON Schema: …`.
- `defaultSettings` must validate against `schema`, otherwise `Widget "<type>" has defaultSettings that don't match its schema: …`.

### GraphQL block
- `graphql.typeDefs` must parse as SDL.
- `graphql.settingsType` must be one of the object types declared in `graphql.typeDefs`, otherwise `graphql.settingsType "<name>" is not declared in graphql.typeDefs`.
- Two widgets declaring the same SDL type name collide when the schema is assembled and throw at build time.

### Registry lock
- Must be called during bootstrap. After `getAllWidgets()` or `getEnabledWidgets()` runs, the manager is frozen and any further registration throws.

## Bootstrap Location

Widgets must be registered in the extension's bootstrap file:

```ts title="extensions/my-extension/src/bootstrap.ts"
import path from 'path';
import { registerWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  registerWidget({
    type: 'custom_widget',
    name: 'Custom Widget',
    category: 'content',
    enabled: true,
    settingComponent: path.resolve(
      import.meta.dirname,
      'components/CustomWidgetSetting.js'
    ),
    component: path.resolve(
      import.meta.dirname,
      'components/CustomWidget.js'
    ),
    previewComponent: path.resolve(
      import.meta.dirname,
      'components/CustomWidgetPreview.js'
    ),
    defaultSettings: {}
  });
}
```

## See Also

- [updateWidget](/docs/development/module/functions/updateWidget) - Update an existing widget
- [removeWidget](/docs/development/module/functions/removeWidget) - Remove a widget
- [getAllWidgets](/docs/development/module/functions/getAllWidgets) - Query the widget registry
- [Widget Development](/docs/development/module/widget-development) - Full widget guide
