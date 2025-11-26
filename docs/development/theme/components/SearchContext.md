---
sidebar_position: 44
title: SearchContext
description: Context for accessing search result page data including keyword, products, and filters.
keywords:
  - EverShop SearchContext
  - search results
  - product search
groups:
  - components
---

# SearchContext

## Description

Provides search result page data to child components. Used only on search result pages to access search keyword, products, and active filters.

## Import

```typescript
import { SearchProvider, useSearch } from '@components/frontStore/catalog/SearchContext';
```

## Usage

### Setup Provider

```tsx
import { SearchProvider } from '@components/frontStore/catalog/SearchContext';

function SearchPage({ searchData }) {
  return (
    <SearchProvider searchData={searchData}>
      {/* Search page components */}
    </SearchProvider>
  );
}
```

### Access Search Data

```tsx
import { useSearch } from '@components/frontStore/catalog/SearchContext';

function SearchResults() {
  const { keyword, products } = useSearch();

  return (
    <div>
      <h1>Search results for "{keyword}"</h1>
      <p>{products.total} products found</p>
    </div>
  );
}
```

## API

### SearchProvider Props

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
      <td>searchData</td>
      <td>SearchPageData</td>
      <td>Yes</td>
      <td>Search data object</td>
    </tr>
    <tr>
      <td>children</td>
      <td>ReactNode</td>
      <td>Yes</td>
      <td>Child components</td>
    </tr>
  </tbody>
</table>

### useSearch Hook

Returns the complete `SearchPageData` object. Throws error if used outside `SearchProvider`.

## SearchPageData Interface

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
      <td>keyword</td>
      <td>string</td>
      <td>Search keyword/term</td>
    </tr>
    <tr>
      <td>url</td>
      <td>string</td>
      <td>Search page URL</td>
    </tr>
    <tr>
      <td>products</td>
      <td>SearchProducts</td>
      <td>Product search results</td>
    </tr>
  </tbody>
</table>

### SearchProducts Interface

```typescript
interface SearchProducts {
  items: ProductData[];        // Array of products
  currentFilters: FilterInput[]; // Active filters
  total: number;                // Total result count
}
```

## Examples

### Search Header

```tsx
import { useSearch } from '@components/frontStore/catalog/SearchContext';

function SearchHeader() {
  const { keyword, products } = useSearch();

  return (
    <div className="search-header">
      <h1>Search Results</h1>
      <p>
        Found <strong>{products.total}</strong> results for "{keyword}"
      </p>
    </div>
  );
}
```

### Product Results

```tsx
import { useSearch } from '@components/frontStore/catalog/SearchContext';
import { ProductList } from '@components/frontStore/catalog/ProductList';

function SearchResults() {
  const { products } = useSearch();

  return (
    <ProductList
      products={products.items}
      emptyMessage={`No products found`}
    />
  );
}
```

## Related Components

- [ProductList](ProductList.md) - Product listing display
- [ProductFilter](ProductFilter.md) - Product filtering
- [CategoryContext](CategoryContext.md) - Category page context
- [ProductContext](ProductContext.md) - Single product context
