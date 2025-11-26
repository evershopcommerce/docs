---
sidebar_position: 48
keywords:
- updateProduct
- catalog
- product
- CRUD
groups:
- catalog
sidebar_label: updateProduct
title: updateProduct
description: Update an existing product.
---

# updateProduct

Update an existing product and its related data.

## Import

```typescript
import { updateProduct } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
updateProduct(uuid: string, data: ProductData, context?: Record<string, any>): Promise<Product>
```

### Parameters

**`uuid`**

**Type:** `string`

Product UUID to update.

**`data`**

**Type:** `ProductData`

Product data to update. All fields are optional.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Product>` with updated product data.

## Examples

### Update Price

```typescript
import { updateProduct } from "@evershop/evershop/catalog/services";

await updateProduct('product-uuid-123', {
  price: 39.99
});
```

### Update Stock

```typescript
import { updateProduct } from "@evershop/evershop/catalog/services";

await updateProduct('product-uuid-123', {
  qty: 50,
  stock_availability: true
});
```

### Update Multiple Fields

```typescript
import { updateProduct } from "@evershop/evershop/catalog/services";

const updated = await updateProduct('product-uuid-123', {
  name: "Updated Product Name",
  price: 49.99,
  status: "1",
  qty: 100,
  attributes: [
    { attribute_code: "color", value: "Blue" }
  ]
});
```

## See Also

- [createProduct](/docs/development/module/functions/createProduct) - Create product
- [deleteProduct](/docs/development/module/functions/deleteProduct) - Delete product
