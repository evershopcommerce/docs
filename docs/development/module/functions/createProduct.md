---
sidebar_position: 47
keywords:
- createProduct
- catalog
- product
- CRUD
groups:
- catalog
sidebar_label: createProduct
title: createProduct
description: Create a new product with inventory, attributes, and images.
---

# createProduct

Create a new product with related data including inventory, attributes, descriptions, and images.

## Import

```typescript
import { createProduct } from "@evershop/evershop/catalog/services";
import type { ProductData } from "@evershop/evershop/catalog/services";
```

## Syntax

```typescript
createProduct(data: ProductData, context?: Record<string, any>): Promise<Product>
```

### Parameters

**`data`**

**Type:** `ProductData`

Product data object containing:

```typescript
{
  name: string;              // Product name (required)
  url_key?: string;          // URL-friendly key
  status: string;            // Product status (required)
  sku: string;               // Stock keeping unit (required)
  price: number;             // Product price (required)
  group_id: number;          // Product group ID (required)
  visibility?: string;       // Product visibility
  qty: number;               // Quantity (required)
  manage_stock: boolean;     // Whether to manage stock
  stock_availability: boolean; // Stock availability
  attributes?: ProductAttributeData[]; // Product attributes
  images?: string[];         // Image paths
  [key: string]: any;        // Additional fields
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object passed to hooks for extensibility.

## Return Value

Returns a `Promise<Product>` with the created product data including generated IDs.

## Examples

### Basic Product Creation

```typescript
import { createProduct } from "@evershop/evershop/catalog/services";

const productData = {
  name: "Wireless Mouse",
  sku: "MOUSE-001",
  status: "1",
  price: 29.99,
  group_id: 1,
  visibility: "visible",
  qty: 100,
  manage_stock: true,
  stock_availability: true
};

try {
  const product = await createProduct(productData);
  console.log(`Product created with ID: ${product.product_id}`);
} catch (error) {
  console.error("Failed to create product:", error.message);
}
```

### With Attributes

```typescript
import { createProduct } from "@evershop/evershop/catalog/services";

const productData = {
  name: "Gaming Laptop",
  sku: "LAPTOP-001",
  status: "1",
  price: 1299.99,
  group_id: 1,
  visibility: "visible",
  qty: 10,
  manage_stock: true,
  stock_availability: true,
  attributes: [
    { attribute_code: "color", value: "Black" },
    { attribute_code: "brand", value: "TechCorp" },
    { attribute_code: "warranty", value: "2" }
  ]
};

const product = await createProduct(productData);
```

### With Images

```typescript
import { createProduct } from "@evershop/evershop/catalog/services";

const productData = {
  name: "Smartphone",
  sku: "PHONE-001",
  status: "1",
  price: 699.99,
  group_id: 1,
  visibility: "visible",
  qty: 50,
  manage_stock: true,
  stock_availability: true,
  images: [
    "/media/catalog/products/phone-001-front.jpg",
    "/media/catalog/products/phone-001-back.jpg"
  ]
};

const product = await createProduct(productData);
```

### Complete Example

```typescript
import { createProduct } from "@evershop/evershop/catalog/services";

const productData = {
  name: "Premium Headphones",
  url_key: "premium-headphones",
  sku: "HEAD-001",
  status: "1",
  price: 199.99,
  group_id: 1,
  visibility: "visible",
  category_id: 5,
  qty: 30,
  manage_stock: true,
  stock_availability: true,
  description: "High-quality wireless headphones with noise cancellation",
  meta_title: "Premium Headphones - Best Sound Quality",
  meta_description: "Shop premium wireless headphones",
  attributes: [
    { attribute_code: "color", value: "Silver" },
    { attribute_code: "wireless", value: "1" }
  ],
  images: [
    "/media/catalog/products/head-001-main.jpg"
  ]
};

try {
  const product = await createProduct(productData, { user_id: 123 });
  console.log("Product created successfully:", product);
} catch (error) {
  console.error("Error:", error.message);
}
```

```typescript
try {
  const product = await createProduct(productData);
} catch (error) {
  if (error.message.includes('duplicate key')) {
    console.error('SKU already exists');
  } else {
    console.error('Creation failed:', error.message);
  }
}
```

## See Also

- [updateProduct](/docs/development/module/functions/updateProduct) - Update existing product
- [deleteProduct](/docs/development/module/functions/deleteProduct) - Delete product
- [getProductsBaseQuery](/docs/development/module/functions/getProductsBaseQuery) - Query products
