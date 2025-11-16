---
sidebar_position: 42
keywords:
- getCategoriesBaseQuery
- catalog
- category
- query builder
groups:
- catalog
sidebar_label: getCategoriesBaseQuery
title: getCategoriesBaseQuery
description: Get base query for categories with description joined.
---

# getCategoriesBaseQuery

Get a base `SelectQuery` for querying categories with category descriptions joined.

## Import

```typescript
import { getCategoriesBaseQuery } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
getCategoriesBaseQuery(): SelectQuery
```

### Parameters

None.

## Return Value

Returns a `SelectQuery` object with:
- Base table: `category`
- Left join: `category_description` on `category_description_category_id = category_id`

## Examples

### Basic Usage

```typescript
import { getCategoriesBaseQuery } from "@evershop/evershop/catalog/services";

const query = getCategoriesBaseQuery();

// Load all active categories
const categories = await query
  .where('status', '=', 1)
  .execute(pool);
```

### Get Single Category

```typescript
import { getCategoriesBaseQuery } from "@evershop/evershop/catalog/services";

const query = getCategoriesBaseQuery();

// Load category by URL key
const category = await query
  .where('url_key', '=', 'electronics')
  .load(pool);

console.log(category.name);
console.log(category.description);
```

## See Also

- [select](/docs/development/module/functions/select) - Create SELECT queries
- [getProductsBaseQuery](/docs/development/module/functions/getProductsBaseQuery) - Get base query for products
- [getCollectionsBaseQuery](/docs/development/module/functions/getCollectionsBaseQuery) - Get base query for collections
