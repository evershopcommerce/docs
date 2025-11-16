---
sidebar_position: 51
keywords:
- updateCategory
- catalog
- category
- CRUD
groups:
- catalog
sidebar_label: updateCategory
title: updateCategory
description: Update an existing category.
---

# updateCategory

Update an existing category and its description.

## Import

```typescript
import { updateCategory } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
updateCategory(uuid: string, data: CategoryData, context?: Record<string, any>): Promise<Category>
```

### Parameters

**`uuid`**

**Type:** `string`

Category UUID to update.

**`data`**

**Type:** `CategoryData`

Category data to update. All fields are optional.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Category>` with updated category data.

## Examples

### Update Name

```typescript
import { updateCategory } from "@evershop/evershop/catalog/services";

await updateCategory('category-uuid-123', {
  name: "Updated Category Name"
});
```

### Update Status

```typescript
import { updateCategory } from "@evershop/evershop/catalog/services";

await updateCategory('category-uuid-123', {
  status: 0
});
```

### Update Multiple Fields

```typescript
import { updateCategory } from "@evershop/evershop/catalog/services";

const updated = await updateCategory('category-uuid-123', {
  name: "New Electronics",
  url_key: "new-electronics",
  description: "Latest electronic devices",
  position: 10
});
```

## See Also

- [createCategory](/docs/development/module/functions/createCategory) - Create category
- [deleteCategory](/docs/development/module/functions/deleteCategory) - Delete category
