---
sidebar_position: 43
title: ProductSorting
description: A component for sorting products with customizable options and sort direction toggle.
keywords:
  - EverShop ProductSorting
  - product sorting
  - sort products
groups:
  - components
---

# ProductSorting

## Description

A product sorting component with dropdown and direction toggle. Syncs with URL parameters and updates page data. Supports custom rendering for sort select and direction button.

## Import

```typescript
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';
```

## Usage

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';

function ProductPage() {
  return (
    <ProductSorting
      sortOptions={[
        { code: '', name: 'Default' },
        { code: 'price', name: 'Price' },
        { code: 'name', name: 'Name' }
      ]}
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
      <td>sortOptions</td>
      <td>SortOption[]</td>
      <td>No</td>
      <td>Default options</td>
      <td>Available sort options</td>
    </tr>
    <tr>
      <td>defaultSortBy</td>
      <td>string</td>
      <td>No</td>
      <td>''</td>
      <td>Default sort field</td>
    </tr>
    <tr>
      <td>defaultSortOrder</td>
      <td>'asc' | 'desc'</td>
      <td>No</td>
      <td>'asc'</td>
      <td>Default sort direction</td>
    </tr>
    <tr>
      <td>showSortDirection</td>
      <td>boolean</td>
      <td>No</td>
      <td>true</td>
      <td>Show direction toggle button</td>
    </tr>
    <tr>
      <td>enableUrlUpdate</td>
      <td>boolean</td>
      <td>No</td>
      <td>true</td>
      <td>Update URL on sort change</td>
    </tr>
    <tr>
      <td>onSortChange</td>
      <td>(sortState) =&gt; void</td>
      <td>No</td>
      <td>-</td>
      <td>Custom sort change handler</td>
    </tr>
    <tr>
      <td>renderSortSelect</td>
      <td>RenderFunction</td>
      <td>No</td>
      <td>-</td>
      <td>Custom select renderer</td>
    </tr>
    <tr>
      <td>renderSortDirection</td>
      <td>RenderFunction</td>
      <td>No</td>
      <td>-</td>
      <td>Custom direction renderer</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>No</td>
      <td>''</td>
      <td>Additional CSS classes</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>boolean</td>
      <td>No</td>
      <td>false</td>
      <td>Disable sorting controls</td>
    </tr>
  </tbody>
</table>

## Type Definitions

### SortOption

```typescript
interface SortOption {
  code: string;      // Sort field code
  name: string;      // Display name
  label?: string;    // Optional label (overrides name)
  disabled?: boolean; // Disable this option
}
```

### SortState

```typescript
interface SortState {
  sortBy: string;           // Current sort field
  sortOrder: 'asc' | 'desc'; // Sort direction
}
```

## Examples

### Basic Sorting

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';

function CategoryPage() {
  return (
    <div className="toolbar">
      <ProductSorting />
    </div>
  );
}
```

### Custom Sort Options

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';

function ProductListing() {
  return (
    <ProductSorting
      sortOptions={[
        { code: '', name: 'Relevance' },
        { code: 'price', name: 'Price' },
        { code: 'name', name: 'Name' },
        { code: 'newest', name: 'Newest First' },
        { code: 'rating', name: 'Customer Rating' }
      ]}
      defaultSortBy="price"
      defaultSortOrder="asc"
    />
  );
}
```

### Without Direction Toggle

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';

function SearchResults() {
  return (
    <ProductSorting
      showSortDirection={false}
      sortOptions={[
        { code: 'relevance', name: 'Most Relevant' },
        { code: 'price_low', name: 'Price: Low to High' },
        { code: 'price_high', name: 'Price: High to Low' }
      ]}
    />
  );
}
```

### Custom Sort Handler

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';
import { useState } from 'react';

function CustomSort() {
  const [products, setProducts] = useState([]);

  const handleSortChange = async ({ sortBy, sortOrder }) => {
    const sorted = await fetchSortedProducts(sortBy, sortOrder);
    setProducts(sorted);
  };

  return (
    <ProductSorting
      enableUrlUpdate={false}
      onSortChange={handleSortChange}
    />
  );
}
```

### Custom Select Renderer

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';

function StyledSort() {
  return (
    <ProductSorting
      renderSortSelect={({ options, value, onChange, disabled }) => (
        <div className="custom-select">
          <label>Sort by:</label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="styled-select"
          >
            {options.map(option => (
              <option 
                key={option.code} 
                value={option.code}
                disabled={option.disabled}
              >
                {option.label || option.name}
              </option>
            ))}
          </select>
        </div>
      )}
    />
  );
}
```

### Custom Direction Button

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';

function CustomDirection() {
  return (
    <ProductSorting
      renderSortDirection={({ sortOrder, onToggle, disabled }) => (
        <button
          onClick={onToggle}
          disabled={disabled}
          className="direction-btn"
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      )}
    />
  );
}
```

### Complete Toolbar

```tsx
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting';
import { useCategory } from '@components/frontStore/catalog/CategoryContext';

function CategoryToolbar() {
  const category = useCategory();

  return (
    <div className="category-toolbar">
      <div className="results-count">
        {category.products.total} Products
      </div>

      <ProductSorting
        sortOptions={[
          { code: '', name: 'Featured' },
          { code: 'price', name: 'Price' },
          { code: 'name', name: 'Name' },
          { code: 'newest', name: 'New Arrivals' }
        ]}
        defaultSortBy=""
        defaultSortOrder="asc"
        className="ml-auto"
      />
    </div>
  );
}
```

## Default Sort Options

If no `sortOptions` prop is provided, these defaults are used:

- **Default**: No sorting (empty code)
- **Price**: Sort by price
- **Name**: Sort by name

## Related Components

- [ProductList](ProductList.md) - Product listing display
- [ProductFilter](ProductFilter.md) - Product filtering
- [CategoryContext](CategoryContext.md) - Category page context
