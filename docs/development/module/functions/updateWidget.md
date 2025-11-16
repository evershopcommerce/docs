---
sidebar_position: 10
keywords:
- updateWidget
- widget
- modification
- override
groups:
- core
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
    component: path.resolve(__dirname, 'components/CustomBannerSlider.js')
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
    settingComponent: path.resolve(__dirname, 'components/CustomSettings.js')
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
    component: path.resolve(__dirname, 'components/EnhancedProductList.js'),
    default_settings: {
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
    component: path.resolve(__dirname, 'components/MyBannerSlider.js')
  });
}
```

## Notes

- Must be called during bootstrap phase before the widget manager is frozen
- Throws an error if called after `getAllWidgets()` or `getEnabledWidgets()` has been called
- Only updates the properties provided in the `updates` object
- Validates component paths if `component` or `settingComponent` are being updated
- Useful for third-party extensions to modify core widgets
- Cannot change the widget type itself

## See Also

- [registerWidget](/docs/development/module/functions/registerWidget) - Register a new widget
- [removeWidget](/docs/development/module/functions/removeWidget) - Remove a widget
