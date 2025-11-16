---
sidebar_position: 46
keywords:
- getProductsByCollectionBaseQuery
- catalog
- product
- collection
- query builder
groups:
- catalog
sidebar_label: getProductsByCollectionBaseQuery
title: getProductsByCollectionBaseQuery
description: Get base query for products filtered by collection.
---

# getProductsByCollectionBaseQuery

Get a base `SelectQuery` for querying products filtered by a specific collection.

## Import

```typescript
import { getProductsByCollectionBaseQuery } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
getProductsByCollectionBaseQuery(collectionId: number): SelectQuery
```

### Parameters

**`collectionId`**

**Type:** `number`

The collection ID to filter products by.

## Return Value

Returns a `SelectQuery` with:
- Base query from `getProductsBaseQuery()`
- Left join to `product_collection` table
- Filter by collection ID

## Examples

### Basic Usage

```typescript
import { getProductsByCollectionBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

// Get products from collection ID 3
const query = getProductsByCollectionBaseQuery(3);

const products = await query
  .where('status', '=', 1)
  .execute(pool);
```

### With Additional Filters

```typescript
import { getProductsByCollectionBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

const query = getProductsByCollectionBaseQuery(3);

// Filter by price range
const products = await query
  .where('status', '=', 1)
  .andWhere('price', '>=', 20)
  .andWhere('price', '<=', 100)
  .orderBy('price', 'ASC')
  .execute(pool);
```

## See Also

- [getProductsBaseQuery](/docs/development/module/functions/getProductsBaseQuery) - Get base query for products
- [getProductsByCategoryBaseQuery](/docs/development/module/functions/getProductsByCategoryBaseQuery) - Get products by category
- [getCollectionsBaseQuery](/docs/development/module/functions/getCollectionsBaseQuery) - Get base query for collections
