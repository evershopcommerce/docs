---
sidebar_position: 58
keywords:
- deleteAttribute
- catalog
- attribute
- CRUD
groups:
- catalog
sidebar_label: deleteAttribute
title: deleteAttribute
description: Delete a product attribute.
---

# deleteAttribute

Delete a product attribute and its related data.

## Import

```typescript
import { deleteAttribute } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
deleteAttribute(uuid: string, context?: Record<string, any>): Promise<Attribute>
```

### Parameters

**`uuid`**

**Type:** `string`

Attribute UUID to delete.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Attribute>` with deleted attribute data.

## Examples

### Basic Delete

```typescript
import { deleteAttribute } from "@evershop/evershop/catalog/services";

const deleted = await deleteAttribute('attribute-uuid-123');
console.log(`Deleted: ${deleted.attribute_name}`);
```

### With Error Handling

```typescript
import { deleteAttribute } from "@evershop/evershop/catalog/services";

try {
  await deleteAttribute('attribute-uuid-123');
} catch (error) {
  if (error.message.includes('variant group')) {
    console.error('Attribute is used in variant groups');
  } else if (error.message.includes('Invalid attribute id')) {
    console.error('Attribute not found');
  }
}
```

## See Also

- [createAttribute](/docs/development/module/functions/createAttribute) - Create attribute
- [updateAttribute](/docs/development/module/functions/updateAttribute) - Update attribute
