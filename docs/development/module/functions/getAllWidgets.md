---
sidebar_position: 119
keywords:
- getAllWidgets
- getEnabledWidgets
- getWidget
- hasWidget
- widget
groups:
- widgets
sidebar_label: getAllWidgets
title: Widget Query Functions
description: Retrieve registered widgets from the widget manager.
---

# Widget Query Functions

Functions for querying the widget registry. All imported from `@evershop/evershop/lib/widget`.

## Import

```typescript
import {
  getAllWidgets,
  getEnabledWidgets,
  getWidget,
  hasWidget
} from '@evershop/evershop/lib/widget';
```

## Functions

### getAllWidgets

```typescript
getAllWidgets(): Widget[]
```

Returns all registered widgets (both enabled and disabled).

:::warning
After the first call to `getAllWidgets()`, the widget manager becomes read-only. No new widgets can be registered.
:::

### getEnabledWidgets

```typescript
getEnabledWidgets(): Widget[]
```

Returns only widgets where `enabled === true`.

### getWidget

```typescript
getWidget(widgetType: string): Widget | undefined
```

Returns a single widget by its type identifier.

### hasWidget

```typescript
hasWidget(widgetType: string): boolean
```

Checks if a widget with the given type is registered.

## Examples

```typescript
import { getEnabledWidgets, getWidget, hasWidget } from '@evershop/evershop/lib/widget';

const widgets = getEnabledWidgets();
console.log(`${widgets.length} widgets available`);

if (hasWidget('collection_products')) {
  const widget = getWidget('collection_products');
  console.log(widget.name); // 'Collection products'
}
```

## See Also

- [registerWidget](/docs/development/module/functions/registerWidget) — Register a widget
- [updateWidget](/docs/development/module/functions/updateWidget) — Update a widget
- [removeWidget](/docs/development/module/functions/removeWidget) — Remove a widget
- [Widget Development](/docs/development/module/widget-development) — Full widget guide
