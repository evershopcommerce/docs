---
sidebar_position: 11
keywords:
- removeWidget
- widget
- unregister
- delete
groups:
- widgets
sidebar_label: removeWidget
title: removeWidget
description: Remove a widget from the widget manager.
---

# removeWidget

Remove a widget from the widget manager during the bootstrap phase.

## Import

```typescript
import { removeWidget } from '@evershop/evershop/lib/widget';
```

## Syntax

```typescript
removeWidget(widgetName: string): boolean
```

### Parameters

**`widgetName`**

**Type:** `string`

The type of the widget to remove.

## Return Value

Returns `boolean`:
- `true` if the widget was successfully removed
- `false` if the widget was not found

## Examples

### Basic Usage

```typescript
import { removeWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  // Remove a widget from the manager
  removeWidget('old_banner_widget');
}
```

### Remove Multiple Widgets

```typescript
import { removeWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  // Remove deprecated widgets
  removeWidget('legacy_slider');
  removeWidget('old_carousel');
  removeWidget('deprecated_gallery');
}
```

### Conditional Removal

```typescript
import { removeWidget } from '@evershop/evershop/lib/widget';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

export default function bootstrap() {
  // Remove widget based on configuration
  const useLegacyWidgets = getConfig('widgets.useLegacy', false);
  
  if (!useLegacyWidgets) {
    removeWidget('legacy_product_list');
  }
}
```

## Bootstrap Location

Widgets must be removed in the bootstrap file:

```typescript
// extensions/my-extension/bootstrap.ts
import { removeWidget } from '@evershop/evershop/lib/widget';

export default function bootstrap() {
  // Remove a core widget you don't want to use
  removeWidget('default_banner');
}
```

## Notes

- Must be called during bootstrap phase before the widget manager is frozen
- Throws an error if called after `getAllWidgets()` or `getEnabledWidgets()` has been called
- Logs a warning if the widget type is not found
- Useful for extensions that want to completely remove core widgets
- Consider using `updateWidget` to disable a widget instead of removing it

## See Also

- [registerWidget](/docs/development/module/functions/registerWidget) - Register a new widget
- [updateWidget](/docs/development/module/functions/updateWidget) - Update an existing widget
