---
sidebar_position: 50
keywords:
- createCategory
- catalog
- category
- CRUD
groups:
- catalog
sidebar_label: createCategory
title: createCategory
description: Create a new category.
---

# createCategory

Create a new category with description.

## Import

```typescript
import { createCategory } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
createCategory(data: CategoryData, context?: Record<string, any>): Promise<Category>
```

### Parameters

**`data`**

**Type:** `CategoryData`

```typescript
{
  name: string;         // Required
  url_key: string;      // Required
  status?: number;
  parent_id?: number;
  position?: number;
  description?: string;
  [key: string]: any;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Category>` with created category data.

## Examples

### Basic Category

```typescript
import { createCategory } from "@evershop/evershop/catalog/services";

const category = await createCategory({
  name: "Electronics",
  url_key: "electronics"
});
```

### With Parent Category

```typescript
import { createCategory } from "@evershop/evershop/catalog/services";

const subcategory = await createCategory({
  name: "Laptops",
  url_key: "laptops",
  parent_id: 5,
  status: 1
});
```

## See Also

- [updateCategory](/docs/development/module/functions/updateCategory) - Update category
- [deleteCategory](/docs/development/module/functions/deleteCategory) - Delete category
- [getCategoriesBaseQuery](/docs/development/module/functions/getCategoriesBaseQuery) - Query categories
