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

### getEnabledWidgets

```typescript
getEnabledWidgets(): Widget[]
```

Returns only widgets where `enabled === true`. It reads through the same underlying call as `getAllWidgets()` and therefore freezes the registry too.

:::warning Both of these freeze the registry
After the first call to **either** `getAllWidgets()` or `getEnabledWidgets()`, the widget manager becomes read-only. Any later `registerWidget`, `updateWidget` or `removeWidget` throws. `getWidget()` and `hasWidget()` are safe — they do not freeze anything.
:::

### Returned shape

Both functions return frozen copies of the registered widget objects, with three generated component keys added:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>componentKey</code></td>
      <td>Bundle key for the storefront component, derived from the <code>component</code> path.</td>
    </tr>
    <tr>
      <td><code>settingComponentKey</code></td>
      <td>Bundle key for the admin settings component, derived from the <code>settingComponent</code> path.</td>
    </tr>
    <tr>
      <td><code>previewComponentKey</code></td>
      <td>Bundle key for the page-builder palette preview. Unlike the other two it is derived from the widget type, not the path — it is always <code>admin_widget_preview_&lt;type&gt;</code>.</td>
    </tr>
  </tbody>
</table>

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
