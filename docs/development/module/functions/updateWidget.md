---
sidebar_position: 10
keywords:
- updateWidget
- widget
- modification
- override
groups:
- widgets
sidebar_label: updateWidget
title: updateWidget
description: Update properties of an existing widget.
---

# updateWidget

Update properties of an existing widget. Useful for extensions to modify core widgets.

## Import

```typescript
import { updateWidget } from '@evershop/evershop/lib/widget';
```

## Syntax

```typescript
updateWidget(widgetType: string, updates: Partial<Widget>): boolean
```

### Parameters

**`widgetType`**

**Type:** `string`

The type of the widget to update.

**`updates`**

**Type:** `Partial<Widget>`

An object containing the properties to update. Can include any widget property.

## Return Value

Returns `boolean`:
- `true` if the widget was successfully updated
- `false` if the update failed

## Examples

### Update Widget Component

```typescript
import { updateWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  // Override the component of a core widget
  updateWidget('banner_slider', {
    component: path.resolve(import.meta.dirname, 'components/CustomBannerSlider.js')
  });
}
```

### Update Settings Component

```typescript
import { updateWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  // Replace the settings component
  updateWidget('product_carousel', {
    settingComponent: path.resolve(import.meta.dirname, 'components/CustomSettings.js')
  });
}
```

### Update Multiple Properties

```typescript
import { updateWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  updateWidget('product_list', {
    name: 'Enhanced Product List',
    description: 'Product list with additional features',
    component: path.resolve(import.meta.dirname, 'components/EnhancedProductList.js'),
    defaultSettings: {
      limit: 20,
      showFilters: true
    }
  });
}
```

### Disable a Widget

```typescript
import { updateWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  // Disable a widget without removing it
  updateWidget('old_widget', {
    enabled: false
  });
}
```

## Validation Rules

### Component Paths
When updating `component` or `settingComponent`:
- Must be valid, resolvable paths to existing .js files
- Base filename must start with an uppercase letter
- If validation fails, an error is thrown

:::warning `previewComponent` is not validated on update
Unlike `registerWidget`, `updateWidget` does **not** check `previewComponent` — it is copied onto the widget like any other plain property. A wrong or non-existent path fails silently here and surfaces later as a broken admin bundle (the palette's hover preview card cannot resolve `admin_widget_preview_<type>`). Double-check the path yourself when overriding it.
:::

### Schema and GraphQL
- Passing `updates.schema` discards the compiled validator and re-validates: an invalid JSON Schema, or a `defaultSettings` value that no longer matches the new schema, throws.
- Passing `updates.graphql` re-validates the SDL: unparsable `typeDefs`, or a `settingsType` not declared in them, throws.
- Changing `defaultSettings` alone does **not** re-run validation. Pass `schema` alongside it when you want the pair checked.

### Widget Existence
- The widget type must already exist in the manager
- Throws an error if the widget is not found

## Bootstrap Location

Updates must be made in the bootstrap file:

```typescript
// extensions/my-extension/bootstrap.ts
import { updateWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  // Customize a core widget
  updateWidget('banner_slider', {
    component: path.resolve(import.meta.dirname, 'components/MyBannerSlider.js')
  });
}
```

## Notes

- Must be called during bootstrap phase before the widget manager is frozen
- Throws an error if called after `getAllWidgets()` or `getEnabledWidgets()` has been called
- Only updates the properties provided in the `updates` object
- Validates component paths if `component` or `settingComponent` are being updated (but **not** `previewComponent`)
- The settings field is `defaultSettings` (camelCase) — a `default_settings` key is written onto the widget as a meaningless extra property
- Useful for third-party extensions to modify core widgets
- Cannot change the widget type itself

## See Also

- [registerWidget](/docs/development/module/functions/registerWidget) - Register a new widget
- [removeWidget](/docs/development/module/functions/removeWidget) - Remove a widget
