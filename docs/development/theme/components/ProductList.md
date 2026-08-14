---
sidebar_position: 42
title: ProductList
description: A component for displaying product listings in grid or list layout with loading and empty states.
keywords:
  - EverShop ProductList
  - product listing
  - product grid
groups:
  - components
---

# ProductList

## Description

Displays an array of products in grid or list layout. Includes loading skeleton, empty state, and customizable rendering. Supports responsive columns and add to cart functionality.

## Import

```typescript
import { ProductList } from '@components/frontStore/catalog/ProductList';
```

## Usage

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';

function CategoryPage({ products }) {
  return (
    <ProductList
      products={products}
      layout="grid"
      gridColumns={4}
    />
  );
}
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Required</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>products</td>
      <td>ProductData[]</td>
      <td>Yes</td>
      <td>[]</td>
      <td>Array of products to display</td>
    </tr>
    <tr>
      <td>imageWidth</td>
      <td>number</td>
      <td>No</td>
      <td><code>800</code> (grid) / <code>320</code> (list)</td>
      <td>Base target width in pixels. The height is <strong>derived</strong>, not passed — see below.</td>
    </tr>
    <tr>
      <td>isLoading</td>
      <td>boolean</td>
      <td>No</td>
      <td>false</td>
      <td>Show loading skeleton</td>
    </tr>
    <tr>
      <td>emptyMessage</td>
      <td>string | ReactNode</td>
      <td>No</td>
      <td>'No products found'</td>
      <td>Empty state message</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>No</td>
      <td>''</td>
      <td>Additional CSS classes</td>
    </tr>
    <tr>
      <td>layout</td>
      <td>'grid' | 'list'</td>
      <td>No</td>
      <td>'grid'</td>
      <td>Display layout mode</td>
    </tr>
    <tr>
      <td>gridColumns</td>
      <td>number</td>
      <td>No</td>
      <td>4</td>
      <td>Number of columns (1-6)</td>
    </tr>
    <tr>
      <td>showAddToCart</td>
      <td>boolean</td>
      <td>No</td>
      <td>false</td>
      <td>Show add to cart buttons</td>
    </tr>
    <tr>
      <td>customAddToCartRenderer</td>
      <td>(product) =&gt; ReactNode</td>
      <td>No</td>
      <td>-</td>
      <td>Custom add to cart renderer</td>
    </tr>
    <tr>
      <td>renderItem</td>
      <td>(product) =&gt; ReactNode</td>
      <td>No</td>
      <td>-</td>
      <td>Custom product item renderer</td>
    </tr>
  </tbody>
</table>

## Image Sizing

`ProductList` takes **no `imageHeight` prop**. The height comes from the store's configured original product image dimensions (the admin Catalog setting, surfaced to the client as `config.catalog.imageDimensions`), so every placement renders at the store's true aspect ratio:

```tsx
const catalogDimensions = useCatalogImageDimensions();
const baseWidth = imageWidth ?? (layout === 'list' ? 320 : 800);
const { width, height } = deriveProductImageSize(baseWidth, catalogDimensions);
```

Two consequences worth knowing:

- **The defaults are ~2× the CSS display width**, deliberately — DPR-2 / retina screens stay sharp and the `<Image>` `srcset` covers the rest. `800` for grid, `320` for list. They are not the rendered pixel size.
- **`deriveProductImageSize` clamps** the requested width to the store's original width, so it never asks for an upscale. When no usable original is configured it falls back to a square box at the requested width (the fallback original is `1200 × 1200`).

Pass `imageWidth` only when a placement genuinely needs a different resolution ceiling — a narrow sidebar shelf, for example. To change the aspect ratio for the whole store, change the Catalog image setting rather than the component.

:::warning Removed prop
`imageHeight` no longer exists on `ProductList`. Passing it is a no-op: React drops the unknown prop and the height is derived regardless. If your theme still passes `imageWidth`/`imageHeight` as a matched square pair, drop the height and let the store's aspect ratio drive it.
:::

## Examples

### Basic Grid Layout

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';

function Products({ products }) {
  return (
    <ProductList
      products={products}
      layout="grid"
      gridColumns={3}
    />
  );
}
```

### List Layout

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';

function SearchResults({ products }) {
  return (
    <ProductList
      products={products}
      layout="list"
    />
  );
}
```

The `list` layout already defaults `imageWidth` to `320`. Override it only to change the resolution ceiling — the height still follows the store's aspect ratio.

### With Loading State

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';
import { useState, useEffect } from 'react';

function CategoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <ProductList
      products={products}
      isLoading={loading}
      gridColumns={4}
    />
  );
}
```

### With Add to Cart

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';

function ShopPage({ products }) {
  return (
    <ProductList
      products={products}
      showAddToCart={true}
      gridColumns={4}
    />
  );
}
```

### Custom Empty Message

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';

function SearchResults({ products, searchTerm }) {
  return (
    <ProductList
      products={products}
      emptyMessage={
        <div>
          <p>No results found for "{searchTerm}"</p>
          <a href="/products">Browse all products</a>
        </div>
      }
    />
  );
}
```

### Custom Product Renderer

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';
import { Image } from '@components/common/Image';

function FeaturedProducts({ products }) {
  return (
    <ProductList
      products={products}
      gridColumns={3}
      renderItem={(product) => (
        <div className="featured-product">
          <div className="badge">Featured</div>
          {product.image && (
            <Image 
              src={product.image.url} 
              alt={product.name}
              width={300}
              height={300}
            />
          )}
          <h3>{product.name}</h3>
          <p className="price">{product.price.regular.text}</p>
          <a href={product.url}>View Details</a>
        </div>
      )}
    />
  );
}
```

### Custom Add to Cart Button

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function ProductGrid({ products }) {
  return (
    <ProductList
      products={products}
      showAddToCart={true}
      customAddToCartRenderer={(product) => (
        <AddToCart 
          product={{ sku: product.sku, isInStock: product.inventory.isInStock }}
          qty={1}
        >
          {/* children is (state, actions) => ReactNode — two arguments,
              not one destructured object. */}
          {(state, actions) => (
            <button
              onClick={actions.addToCart}
              disabled={!state.canAddToCart}
              className="custom-add-btn"
            >
              {state.isLoading ? 'Adding...' : 'Quick Add'}
            </button>
          )}
        </AddToCart>
      )}
    />
  );
}
```

### Complete Example

```tsx
import { ProductList } from '@components/frontStore/catalog/ProductList';
import { useCategory } from '@components/frontStore/catalog/CategoryContext';
import { useState } from 'react';

function CategoryProducts() {
  const category = useCategory();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [columns, setColumns] = useState(4);

  return (
    <div className="category-products">
      {/* Controls */}
      <div className="controls">
        <div className="layout-toggle">
          <button 
            onClick={() => setLayout('grid')}
            className={layout === 'grid' ? 'active' : ''}
          >
            Grid
          </button>
          <button 
            onClick={() => setLayout('list')}
            className={layout === 'list' ? 'active' : ''}
          >
            List
          </button>
        </div>

        {layout === 'grid' && (
          <select value={columns} onChange={(e) => setColumns(Number(e.target.value))}>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
            <option value={5}>5 Columns</option>
          </select>
        )}

        <span>{category.products.total} products</span>
      </div>

      {/* Product List */}
      <ProductList
        products={category.products.items}
        layout={layout}
        gridColumns={columns}
        showAddToCart={true}
        emptyMessage="No products in this category"
        className="mt-8"
      />
    </div>
  );
}
```

## Grid Columns

Responsive grid columns based on `gridColumns` prop:

- **1**: Single column (all screens)
- **2**: 1 column mobile, 2 columns desktop
- **3**: 1 mobile, 2 tablet, 3 desktop
- **4**: 1 mobile, 2 tablet, 4 desktop (default)
- **5**: 1 mobile, 2 tablet, 5 desktop
- **6**: 1 mobile, 2 tablet, 6 desktop

## List Layout

In list layout:
- Products displayed vertically
- Full width items
- `imageWidth` defaults to `320` instead of `800`; the height still follows the store's configured aspect ratio

## States

### Loading State

Shows skeleton placeholders matching the layout and column count.

### Empty State

Displays `emptyMessage` when no products exist.

### Loaded State

Renders product items using default or custom renderer.

## Features

- **Flexible Layout**: Grid or list display
- **Responsive Grid**: Auto-adjusts columns for mobile/tablet/desktop
- **Loading Skeleton**: Animated placeholders
- **Empty State**: Customizable no-results message
- **Custom Rendering**: Full control over product display
- **Add to Cart**: Built-in or custom add to cart
- **Image Sizing**: Height derived from the store's configured aspect ratio; `imageWidth` overridable per placement
- **Type Safe**: Full TypeScript support

## Related Components

- [ProductContext](ProductContext.md) - Product data interface
- [CategoryContext](CategoryContext.md) - Category page context
- [AddToCart](AddToCart.md) - Add to cart component
- [Image](Image.md) - Image component
