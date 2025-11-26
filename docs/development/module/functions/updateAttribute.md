---
sidebar_position: 57
keywords:
- updateAttribute
- catalog
- attribute
- CRUD
groups:
- catalog
sidebar_label: updateAttribute
title: updateAttribute
description: Update an existing product attribute.
---

# updateAttribute

Update an existing product attribute, including options and group assignments.

## Import

```typescript
import { updateAttribute } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
updateAttribute(uuid: string, data: AttributeData, context?: Record<string, any>): Promise<Attribute>
```

### Parameters

**`uuid`**

**Type:** `string`

Attribute UUID to update.

**`data`**

**Type:** `AttributeData`

Attribute data to update. All fields are optional.

```typescript
{
  attribute_name?: string;
  type?: string;
  is_required?: boolean;
  display_on_frontend?: boolean;
  groups?: number[];
  options?: { option_text: string, option_id?: string | number }[];
  [key: string]: any;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Attribute>` with updated attribute data.

## Examples

### Update Name

```typescript
import { updateAttribute } from "@evershop/evershop/catalog/services";

await updateAttribute('attribute-uuid-123', {
  attribute_name: "Updated Name"
});
```

## See Also

- [createAttribute](/docs/development/module/functions/createAttribute) - Create attribute
- [deleteAttribute](/docs/development/module/functions/deleteAttribute) - Delete attribute
