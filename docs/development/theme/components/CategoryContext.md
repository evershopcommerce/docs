---
sidebar_position: 39
title: CategoryContext
description: Context for accessing category page data including products, filters, and metadata.
keywords:
  - EverShop CategoryContext
  - category page
  - product listing
groups:
  - components
---

# CategoryContext

## Description

Provides category page data to child components. Used only on category pages to access category information, products, filters, and price ranges.

## Import

```typescript
import { CategoryProvider, useCategory } from '@components/frontStore/catalog/CategoryContext';
```

## Usage

### Setup Provider

```tsx
import { CategoryProvider } from '@components/frontStore/catalog/CategoryContext';

function CategoryPage({ category }) {
  return (
    <CategoryProvider category={category}>
      {/* Category page components */}
    </CategoryProvider>
  );
}
```

### Access Category Data

```tsx
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function CategoryHeader() {
  const category = useCategory();

  return (
    <div>
      <h1>{category.name}</h1>
      {category.description && <div>{category.description}</div>}
      {category.image && <img src={category.image.url} alt={category.image.alt} />}
    </div>
  );
}
```

## API

### CategoryProvider Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>category</td>
      <td>CategoryData</td>
      <td>Yes</td>
      <td>Category data object</td>
    </tr>
    <tr>
      <td>children</td>
      <td>ReactNode</td>
      <td>Yes</td>
      <td>Child components</td>
    </tr>
  </tbody>
</table>

### useCategory Hook

Returns the complete `CategoryData` object. Throws error if used outside `CategoryProvider`.

## CategoryData Interface

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>categoryId</td>
      <td>number</td>
      <td>Category ID</td>
    </tr>
    <tr>
      <td>uuid</td>
      <td>string</td>
      <td>Category UUID</td>
    </tr>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>Category name</td>
    </tr>
    <tr>
      <td>description</td>
      <td>Array&lt;Row&gt;</td>
      <td>Rich text description</td>
    </tr>
    <tr>
      <td>url</td>
      <td>string</td>
      <td>Category URL</td>
    </tr>
    <tr>
      <td>image</td>
      <td>object</td>
      <td>Category image (url, alt)</td>
    </tr>
    <tr>
      <td>showProducts</td>
      <td>boolean</td>
      <td>Whether to display products</td>
    </tr>
    <tr>
      <td>products</td>
      <td>CategoryProducts</td>
      <td>Product listing data</td>
    </tr>
    <tr>
      <td>availableAttributes</td>
      <td>FilterableAttribute[]</td>
      <td>Filterable attributes</td>
    </tr>
    <tr>
      <td>children</td>
      <td>CategoryFilter[]</td>
      <td>Child categories</td>
    </tr>
    <tr>
      <td>priceRange</td>
      <td>object</td>
      <td>Price range (min, max)</td>
    </tr>
  </tbody>
</table>

### CategoryProducts Interface

```typescript
interface CategoryProducts {
  items: ProductData[];        // Array of products
  currentFilters: FilterInput[]; // Active filters
  total: number;                // Total product count
}
```

### Price Range Object

```typescript
interface PriceRange {
  min: number;        // Minimum price value
  minText: string;    // Formatted min price
  max: number;        // Maximum price value
  maxText: string;    // Formatted max price
}
```

## Examples

### Display Category Info

```tsx
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function CategoryInfo() {
  const { name, description, image, products } = useCategory();

  return (
    <div className="category-info">
      {image && (
        <img src={image.url} alt={image.alt} className="category-banner" />
      )}
      <h1>{name}</h1>
      {description && <div className="description">{description}</div>}
      <p>{products.total} products</p>
    </div>
  );
}
```

### Product Listing

```tsx
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function ProductList() {
  const { products, showProducts } = useCategory();

  if (!showProducts) {
    return null;
  }

  return (
    <div className="product-grid">
      {products.items.map(product => (
        <div key={product.productId}>
          <h3>{product.name}</h3>
          <p>{product.price.text}</p>
        </div>
      ))}
    </div>
  );
}
```

### Price Filter

```tsx
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function PriceFilter() {
  const { priceRange } = useCategory();

  return (
    <div className="price-filter">
      <h3>Price Range</h3>
      <p>From {priceRange.minText} to {priceRange.maxText}</p>
      <input 
        type="range" 
        min={priceRange.min} 
        max={priceRange.max}
      />
    </div>
  );
}
```

### Subcategories

```tsx
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function Subcategories() {
  const { children } = useCategory();

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="subcategories">
      <h3>Shop by Category</h3>
      <ul>
        {children.map(child => (
          <li key={child.categoryId}>
            <a href={child.url}>{child.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Active Filters Display

```tsx
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function ActiveFilters() {
  const { products } = useCategory();

  if (products.currentFilters.length === 0) {
    return null;
  }

  return (
    <div className="active-filters">
      <h4>Active Filters:</h4>
      {products.currentFilters.map((filter, index) => (
        <span key={index} className="filter-tag">
          {filter.key}: {filter.value}
        </span>
      ))}
    </div>
  );
}
```

### Complete Category Page

```tsx
import { CategoryProvider, useCategory } from '@components/frontStore/catalog/CategoryContext';
import { Image } from '@components/common/Image';

function CategoryPageContent() {
  const category = useCategory();
  const { name, description, image, products, priceRange, children } = category;

  return (
    <div className="category-page">
      {/* Category Header */}
      <div className="category-header">
        {image && <Image src={image.url} alt={image.alt} width={1200} height={400} />}
        <h1>{name}</h1>
        {description && <div className="description">{description}</div>}
      </div>

      {/* Subcategories */}
      {children.length > 0 && (
        <div className="subcategories">
          <h3>Categories</h3>
          <div className="category-grid">
            {children.map(child => (
              <a key={child.categoryId} href={child.url}>
                {child.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      {category.showProducts && (
        <>
          <div className="results-bar">
            <p>{products.total} products found</p>
            {products.currentFilters.length > 0 && (
              <div className="active-filters">
                {products.currentFilters.map((filter, i) => (
                  <span key={i}>{filter.key}: {filter.value}</span>
                ))}
              </div>
            )}
          </div>

          <div className="product-listing">
            {products.items.map(product => (
              <div key={product.productId} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.price.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CategoryPage({ categoryData }) {
  return (
    <CategoryProvider category={categoryData}>
      <CategoryPageContent />
    </CategoryProvider>
  );
}
```

## Features

- **Category Metadata**: Name, description, image, URL
- **Product Listing**: Filtered products with pagination
- **Filter Support**: Current filters and available attributes
- **Price Range**: Min/max prices for filtering
- **Subcategories**: Child category navigation
- **Extended Fields**: Support for custom fields
- **Type Safe**: Full TypeScript support
- **Error Handling**: Throws error if used outside provider

## Usage Notes

- Only available on category pages
- Must wrap components in `CategoryProvider`
- The `useCategory` hook throws error if used outside provider
- Description is rich text (array of Row objects)
- Extended fields allow custom category data

## Related Components

- [ProductFilter](ProductFilter.md) - Product filtering
- [ProductContext](ProductContext.md) - Single product context
- [Image](Image.md) - Image component
