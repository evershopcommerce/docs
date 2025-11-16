---
sidebar_position: 55
keywords:
- deleteCollection
- catalog
- collection
- CRUD
groups:
- catalog
sidebar_label: deleteCollection
title: deleteCollection
description: Delete a collection.
---

# deleteCollection

Delete a product collection.

## Import

```typescript
import { deleteCollection } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
deleteCollection(uuid: string, context?: Record<string, any>): Promise<Collection>
```

### Parameters

**`uuid`**

**Type:** `string`

Collection UUID to delete.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Collection>` with deleted collection data.

## Examples

### Basic Delete

```typescript
import { deleteCollection } from "@evershop/evershop/catalog/services";

const deleted = await deleteCollection('collection-uuid-123');
console.log(`Deleted: ${deleted.name}`);
```

### With Error Handling

```typescript
import { deleteCollection } from "@evershop/evershop/catalog/services";

try {
  await deleteCollection('collection-uuid-123');
} catch (error) {
  if (error.message.includes('Invalid collection id')) {
    console.error('Collection not found');
  }
}
```

## See Also

- [createCollection](/docs/development/module/functions/createCollection) - Create collection
- [updateCollection](/docs/development/module/functions/updateCollection) - Update collection
