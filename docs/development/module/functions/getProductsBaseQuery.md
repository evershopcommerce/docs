---
sidebar_position: 44
keywords:
- getProductsBaseQuery
- catalog
- product
- query builder
groups:
- catalog
sidebar_label: getProductsBaseQuery
title: getProductsBaseQuery
description: Get base query for products with descriptions, inventory, and images joined.
---

# getProductsBaseQuery

Get a base `SelectQuery` for querying products with descriptions, inventory, and main images joined.

## Import

```typescript
import { getProductsBaseQuery } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
getProductsBaseQuery(): SelectQuery
```

### Parameters

None.

## Return Value

Returns a `SelectQuery` object with:
- Base table: `product`
- Left join: `product_description` on `product_description_product_id = product_id`
- Inner join: `product_inventory` on `product_inventory_product_id = product_id`
- Left join: `product_image` (only main image where `is_main = true`)

## Examples

### Basic Usage

```typescript
import { getProductsBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

const query = getProductsBaseQuery();

// Load all visible products
const products = await query
  .where('visibility', '=', 'visible')
  .where('status', '=', 1)
  .execute(pool);
```

### Get Single Product

```typescript
import { getProductsBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

const query = getProductsBaseQuery();

// Load product by SKU
const product = await query
  .where('sku', '=', 'LAPTOP-123')
  .load(pool);

console.log(product.name);
console.log(product.price);
console.log(product.qty);
```

## See Also

- [select](/docs/development/module/functions/select) - Create SELECT queries
- [getCategoriesBaseQuery](/docs/development/module/functions/getCategoriesBaseQuery) - Get base query for categories
- [getProductsByCategoryBaseQuery](/docs/development/module/functions/getProductsByCategoryBaseQuery) - Get products by category
- [getProductsByCollectionBaseQuery](/docs/development/module/functions/getProductsByCollectionBaseQuery) - Get products by collection
