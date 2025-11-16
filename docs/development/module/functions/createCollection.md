---
sidebar_position: 53
keywords:
- createCollection
- catalog
- collection
- CRUD
groups:
- catalog
sidebar_label: createCollection
title: createCollection
description: Create a new collection.
---

# createCollection

Create a new product collection.

## Import

```typescript
import { createCollection } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
createCollection(data: CollectionData, context?: Record<string, any>): Promise<Collection>
```

### Parameters

**`data`**

**Type:** `CollectionData`

```typescript
{
  name: string;        // Required
  code: string;        // Required
  description: string; // Required
  [key: string]: any;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Collection>` with created collection data.

## Examples

### Basic Collection

```typescript
import { createCollection } from "@evershop/evershop/catalog/services";

const collection = await createCollection({
  name: "Summer Sale",
  code: "summer-2025",
  description: "Summer collection items"
});
```

## See Also

- [updateCollection](/docs/development/module/functions/updateCollection) - Update collection
- [deleteCollection](/docs/development/module/functions/deleteCollection) - Delete collection
- [getCollectionsBaseQuery](/docs/development/module/functions/getCollectionsBaseQuery) - Query collections
