---
sidebar_position: 43
keywords:
- getCollectionsBaseQuery
- catalog
- collection
- query builder
groups:
- catalog
sidebar_label: getCollectionsBaseQuery
title: getCollectionsBaseQuery
description: Get base query for collections.
---

# getCollectionsBaseQuery

Get a base `SelectQuery` for querying collections.

## Import

```typescript
import { getCollectionsBaseQuery } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
getCollectionsBaseQuery(): SelectQuery
```

### Parameters

None.

## Return Value

Returns a `SelectQuery` object with base table `collection`.

## Examples

### Basic Usage

```typescript
import { getCollectionsBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

const query = getCollectionsBaseQuery();

// Load all collections
const collections = await query.execute(pool);
```

### Get Single Collection

```typescript
import { getCollectionsBaseQuery } from "@evershop/evershop/catalog/services";
import { pool } from "@evershop/evershop/lib/postgres";

const query = getCollectionsBaseQuery();

// Load collection by code
const collection = await query
  .where('code', '=', 'summer-sale')
  .load(pool);

console.log(collection.name);
console.log(collection.description);
```

## See Also

- [select](/docs/development/module/functions/select) - Create SELECT queries
- [getCategoriesBaseQuery](/docs/development/module/functions/getCategoriesBaseQuery) - Get base query for categories
- [getProductsBaseQuery](/docs/development/module/functions/getProductsBaseQuery) - Get base query for products
- [getProductsByCollectionBaseQuery](/docs/development/module/functions/getProductsByCollectionBaseQuery) - Get products by collection
