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

```typescript
import { registerWidget } from '@evershop/evershop/lib/widget';
```

## Syntax

```typescript
registerWidget(widget: Widget): boolean
```

### Parameters

**`widget`**

**Type:** `Widget`

The widget object to register. Must include:
- `type` - Unique widget type identifier (alphanumeric and underscores only)
- `settingComponent` - Path to the settings component (must be a .js file starting with uppercase)
- `component` - Path to the main component (must be a .js file starting with uppercase)
- `enabled` - Whether the widget is enabled
- Other optional properties

## Return Value

Returns `boolean`:
- `true` if the widget was successfully registered
- `false` if a widget with the same type already exists

## Examples

### Basic Usage

```typescript
import { registerWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  registerWidget({
    type: 'banner_slider',
    name: 'Banner Slider',
    description: 'Display a banner slider',
    enabled: true,
    settingComponent: path.resolve(__dirname, 'components/BannerSliderSettings.js'),
    component: path.resolve(__dirname, 'components/BannerSlider.js')
  });
}
```

### Complete Widget Registration

```typescript
import { registerWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  registerWidget({
    type: 'product_carousel',
    name: 'Product Carousel',
    description: 'Display products in a carousel',
    enabled: true,
    category: 'product',
    default_settings: {
      limit: 10,
      autoplay: true,
      interval: 5000
    },
    settingComponent: path.resolve(__dirname, 'components/ProductCarouselSettings.js'),
    component: path.resolve(__dirname, 'components/ProductCarousel.js')
  });
}
```

## Validation Rules

### Widget Type
- Must contain only letters, numbers, and underscores
- Cannot be empty or contain spaces
- Must be unique across all registered widgets

### Component Paths
- Must be valid, resolvable paths to existing .js files
- Base filename must start with an uppercase letter
- Both `settingComponent` and `component` are required

## Bootstrap Location

Widgets must be registered in the bootstrap file:

```typescript
// extensions/my-extension/bootstrap.ts
import { registerWidget } from '@evershop/evershop/lib/widget';
import path from 'path';

export default function bootstrap() {
  registerWidget({
    type: 'custom_widget',
    name: 'Custom Widget',
    enabled: true,
    settingComponent: path.resolve(__dirname, 'components/CustomSettings.js'),
    component: path.resolve(__dirname, 'components/CustomWidget.js')
  });
}
```

## Notes

- Must be called during bootstrap phase before the widget manager is frozen
- Throws an error if called after `getAllWidgets()` or `getEnabledWidgets()` has been called
- Logs a warning if a widget with the same type already exists
- Validates component paths and naming conventions
- Widget manager becomes read-only after first retrieval of widgets

## See Also

- [updateWidget](/docs/development/module/functions/updateWidget) - Update an existing widget
- [removeWidget](/docs/development/module/functions/removeWidget) - Remove a widget
