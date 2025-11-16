---
sidebar_position: 52
keywords:
- deleteCategory
- catalog
- category
- CRUD
groups:
- catalog
sidebar_label: deleteCategory
title: deleteCategory
description: Delete a category.
---

# deleteCategory

Delete a category and its related data.

## Import

```typescript
import { deleteCategory } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
deleteCategory(uuid: string, context?: Record<string, any>): Promise<Category>
```

### Parameters

**`uuid`**

**Type:** `string`

Category UUID to delete.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Category>` with deleted category data.

## Examples

### Basic Delete

```typescript
import { deleteCategory } from "@evershop/evershop/catalog/services";

const deleted = await deleteCategory('category-uuid-123');
console.log(`Deleted: ${deleted.name}`);
```

### With Error Handling

```typescript
import { deleteCategory } from "@evershop/evershop/catalog/services";

try {
  await deleteCategory('category-uuid-123');
} catch (error) {
  if (error.message.includes('Invalid category id')) {
    console.error('Category not found');
  }
}
```

## See Also

- [createCategory](/docs/development/module/functions/createCategory) - Create category
- [updateCategory](/docs/development/module/functions/updateCategory) - Update category
