---
sidebar_position: 49
keywords:
- deleteProduct
- catalog
- product
- CRUD
groups:
- catalog
sidebar_label: deleteProduct
title: deleteProduct
description: Delete a product.
---

# deleteProduct

Delete a product and its related data.

## Import

```typescript
import { deleteProduct } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
deleteProduct(uuid: string, context?: Record<string, any>): Promise<Product>
```

### Parameters

**`uuid`**

**Type:** `string`

Product UUID to delete.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Product>` with deleted product data.

## Examples

### Basic Delete

```typescript
import { deleteProduct } from "@evershop/evershop/catalog/services";

const deleted = await deleteProduct('product-uuid-123');
console.log(`Deleted product: ${deleted.name}`);
```

### With Context

```typescript
import { deleteProduct } from "@evershop/evershop/catalog/services";

await deleteProduct('product-uuid-123', {
  user_id: 456,
  reason: 'discontinued'
});
```

## See Also

- [createProduct](/docs/development/module/functions/createProduct) - Create product
- [updateProduct](/docs/development/module/functions/updateProduct) - Update product
