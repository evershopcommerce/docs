---
sidebar_position: 54
keywords:
- updateCollection
- catalog
- collection
- CRUD
groups:
- catalog
sidebar_label: updateCollection
title: updateCollection
description: Update an existing collection.
---

# updateCollection

Update an existing product collection.

## Import

```typescript
import { updateCollection } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
updateCollection(uuid: string, data: CollectionData, context?: Record<string, any>): Promise<Collection>
```

### Parameters

**`uuid`**

**Type:** `string`

Collection UUID to update.

**`data`**

**Type:** `CollectionData`

Collection data to update. All fields are optional.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Collection>` with updated collection data.

## Examples

### Update Name

```typescript
import { updateCollection } from "@evershop/evershop/catalog/services";

await updateCollection('collection-uuid-123', {
  name: "Updated Collection Name"
});
```

### Update Multiple Fields

```typescript
import { updateCollection } from "@evershop/evershop/catalog/services";

const updated = await updateCollection('collection-uuid-123', {
  name: "Winter Sale",
  description: "Winter collection items on sale"
});
```

## See Also

- [createCollection](/docs/development/module/functions/createCollection) - Create collection
- [deleteCollection](/docs/development/module/functions/deleteCollection) - Delete collection
