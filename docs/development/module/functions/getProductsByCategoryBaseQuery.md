---
sidebar_position: 45
keywords:
- getProductsByCategoryBaseQuery
- catalog
- product
- category
- query builder
groups:
- catalog
sidebar_label: getProductsByCategoryBaseQuery
title: getProductsByCategoryBaseQuery
description: Get base query for products filtered by category with optional subcategories.
---

# getProductsByCategoryBaseQuery

Get a base `SelectQuery` for querying products filtered by a specific category, with optional support for including products from subcategories.

## Import

```typescript
import { getProductsByCategoryBaseQuery } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
getProductsByCategoryBaseQuery(
  categoryId: number,
  fromSubCategories?: boolean
): Promise<SelectQuery>
```

### Parameters

**`categoryId`**

**Type:** `number`

The category ID to filter products by.

**`fromSubCategories`**

**Type:** `boolean` (optional, default: `false`)

Whether to include products from subcategories recursively.

## Return Value

Returns a `Promise<SelectQuery>` with:
- Base query from `getProductsBaseQuery()`
- Additional filter by category ID(s)

## Examples

### Get Products from Single Category

```typescript
import { getProductsByCategoryBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

// Get products from category ID 5
const query = await getProductsByCategoryBaseQuery(5);

const products = await query
  .where('status', '=', 1)
  .execute(pool);
```

## See Also

- [getProductsBaseQuery](/docs/development/module/functions/getProductsBaseQuery) - Get base query for products
- [getProductsByCollectionBaseQuery](/docs/development/module/functions/getProductsByCollectionBaseQuery) - Get products by collection
- [getCategoriesBaseQuery](/docs/development/module/functions/getCategoriesBaseQuery) - Get base query for categories
