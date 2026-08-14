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

// Use `.andWhere()`, never `.where()`. This builder already carries a
// `product_collection.collection_id = 3` predicate, and `query.where()` REPLACES
// the whole WHERE clause instead of adding to it — you would silently get
// products from every collection.
const products = await query
  .andWhere('product.status', '=', true)
  .execute(pool);
```

:::danger Never call `.where()` on a builder you were handed
`Query.where()` assigns a fresh `Where` to the query, discarding any conditions the
factory already set. Always add to an existing builder with `.andWhere()` / `.orWhere()`.
:::

### With Additional Filters

```typescript
import { getProductsByCollectionBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

const query = getProductsByCollectionBaseQuery(3);

// Filter by price range.
// `.orderBy()` lives on SelectQuery, not on the `Where` that `.andWhere()` returns,
// so call it on the query handle rather than chaining it onto the conditions.
query.andWhere('product.status', '=', true);
query.andWhere('product.price', '>=', 20);
query.andWhere('product.price', '<=', 100);
query.orderBy('product.price', 'ASC');

const products = await query.execute(pool);
```

## See Also

- [getProductsBaseQuery](/docs/development/module/functions/getProductsBaseQuery) - Get base query for products
- [getProductsByCategoryBaseQuery](/docs/development/module/functions/getProductsByCategoryBaseQuery) - Get products by category
- [getCollectionsBaseQuery](/docs/development/module/functions/getCollectionsBaseQuery) - Get base query for collections
