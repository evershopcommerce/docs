---
sidebar_position: 56
keywords:
- createAttribute
- catalog
- attribute
- CRUD
groups:
- catalog
sidebar_label: createAttribute
title: createAttribute
description: Create a new product attribute.
---

# createAttribute

Create a new product attribute with options and group assignments.

## Import

```typescript
import { createAttribute } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
createAttribute(data: AttributeData, context?: Record<string, any>): Promise<Attribute>
```

### Parameters

**`data`**

**Type:** `AttributeData`

```typescript
{
  attribute_code: string;     // Required
  attribute_name: string;     // Required
  type: string;               // Required (text, textarea, select, multiselect, date)
  is_required: boolean;       // Required
  display_on_frontend?: boolean;
  groups: number[];           // Required - attribute group IDs
  options?: { option_text: string }[]; // For select/multiselect types
  [key: string]: any;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Attribute>` with created attribute data.

## Examples

### Text Attribute

```typescript
import { createAttribute } from "@evershop/evershop/catalog/services";

const attribute = await createAttribute({
  attribute_code: "brand",
  attribute_name: "Brand",
  type: "text",
  is_required: false,
  display_on_frontend: true,
  groups: [1, 2]
});
```

### Select Attribute with Options

```typescript
import { createAttribute } from "@evershop/evershop/catalog/services";

const attribute = await createAttribute({
  attribute_code: "color",
  attribute_name: "Color",
  type: "select",
  is_required: true,
  display_on_frontend: true,
  groups: [1],
  options: [
    { option_text: "Red" },
    { option_text: "Blue" },
    { option_text: "Green" }
  ]
});
```

## See Also

- [updateAttribute](/docs/development/module/functions/updateAttribute) - Update attribute
- [deleteAttribute](/docs/development/module/functions/deleteAttribute) - Delete attribute
