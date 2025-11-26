---
sidebar_position: 30
title: ProductNoThumbnail
description: A placeholder SVG icon displayed when a product has no thumbnail image.
hide_table_of_contents: true
keywords:
  - EverShop ProductNoThumbnail
  - placeholder
  - product image
groups:
  - components
---

# ProductNoThumbnail

## Description

A simple SVG placeholder icon displayed when a product has no thumbnail image. Shows a gray box icon to indicate missing product imagery.

## Import

```typescript
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail';
```

## Usage

```tsx
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      {product.image ? (
        <img src={product.image} alt={product.name} />
      ) : (
        <ProductNoThumbnail width={200} height={200} />
      )}
    </div>
  );
}
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>width</td>
      <td>number</td>
      <td>100</td>
      <td>Width of the SVG in pixels</td>
    </tr>
    <tr>
      <td>height</td>
      <td>number</td>
      <td>100</td>
      <td>Height of the SVG in pixels</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>Additional CSS classes</td>
    </tr>
  </tbody>
</table>

## Example: Product Grid

```tsx
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail';

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="product-item">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} />
          ) : (
            <ProductNoThumbnail width={300} height={300} />
          )}
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

## Example: With Custom Styling

```tsx
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail';

function ProductPlaceholder() {
  return (
    <div className="product-image-container">
      <ProductNoThumbnail 
        width={400} 
        height={400}
        className="opacity-50 bg-gray-100 rounded-lg p-4"
      />
    </div>
  );
}
```

## Related Components

- [Image](Image.md) - Optimized image component
- [StaticImage](StaticImage.md) - Static asset images
