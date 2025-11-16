---
sidebar_position: 41
title: ProductFilter
description: A render props component for managing product filters with attributes, categories, and price ranges.
keywords:
  - EverShop ProductFilter
  - product filters
  - filtering
groups:
  - components
---

# ProductFilter

## Description

A render props component for building product filtering interfaces. Manages filter state, URL updates, and provides helper functions for attribute, category, and price filtering.

## Import

```typescript
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';
```

## Usage

```tsx
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';

function ProductFilters({ currentFilters, availableAttributes, priceRange }) {
  return (
    <ProductFilter
      currentFilters={currentFilters}
      availableAttributes={availableAttributes}
      priceRange={priceRange}
    >
      {({ addFilter, removeFilter, isOptionSelected }) => (
        <div>
          {availableAttributes.map(attr => (
            <div key={attr.attributeCode}>
              <h3>{attr.attributeName}</h3>
              {attr.options.map(option => (
                <label key={option.optionId}>
                  <input
                    type="checkbox"
                    checked={isOptionSelected(attr.attributeCode, option.optionId.toString())}
                    onChange={() => addFilter(attr.attributeCode, 'in', option.optionId.toString())}
                  />
                  {option.optionText}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </ProductFilter>
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
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>currentFilters</td>
      <td>FilterInput[]</td>
      <td>Yes</td>
      <td>Active filters array</td>
    </tr>
    <tr>
      <td>availableAttributes</td>
      <td>FilterableAttribute[]</td>
      <td>No</td>
      <td>Filterable product attributes</td>
    </tr>
    <tr>
      <td>priceRange</td>
      <td>PriceRange</td>
      <td>Yes</td>
      <td>Min/max price range</td>
    </tr>
    <tr>
      <td>categories</td>
      <td>CategoryFilter[]</td>
      <td>No</td>
      <td>Available categories</td>
    </tr>
    <tr>
      <td>setting</td>
      <td>object</td>
      <td>No</td>
      <td>Store settings (language, currency)</td>
    </tr>
    <tr>
      <td>onFilterUpdate</td>
      <td>(filters: FilterInput[]) =&gt; void</td>
      <td>No</td>
      <td>Custom filter update handler</td>
    </tr>
    <tr>
      <td>children</td>
      <td>RenderFunction</td>
      <td>Yes</td>
      <td>Render function receiving filter props</td>
    </tr>
  </tbody>
</table>

## Render Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>currentFilters</td>
      <td>FilterInput[]</td>
      <td>Current active filters</td>
    </tr>
    <tr>
      <td>availableAttributes</td>
      <td>FilterableAttribute[]</td>
      <td>Filterable attributes</td>
    </tr>
    <tr>
      <td>priceRange</td>
      <td>PriceRange</td>
      <td>Price min/max values</td>
    </tr>
    <tr>
      <td>categories</td>
      <td>CategoryFilter[]</td>
      <td>Available categories</td>
    </tr>
    <tr>
      <td>addFilter</td>
      <td>(key, operation, value) =&gt; void</td>
      <td>Add a filter</td>
    </tr>
    <tr>
      <td>removeFilter</td>
      <td>(key) =&gt; void</td>
      <td>Remove filter by key</td>
    </tr>
    <tr>
      <td>removeFilterValue</td>
      <td>(key, value) =&gt; void</td>
      <td>Remove specific value from filter</td>
    </tr>
    <tr>
      <td>toggleFilter</td>
      <td>(key, operation, value) =&gt; void</td>
      <td>Toggle filter on/off</td>
    </tr>
    <tr>
      <td>clearAllFilters</td>
      <td>() =&gt; void</td>
      <td>Clear all active filters</td>
    </tr>
    <tr>
      <td>updateFilter</td>
      <td>(filters) =&gt; void</td>
      <td>Update all filters at once</td>
    </tr>
    <tr>
      <td>hasFilter</td>
      <td>(key) =&gt; boolean</td>
      <td>Check if filter exists</td>
    </tr>
    <tr>
      <td>getFilterValue</td>
      <td>(key) =&gt; string | undefined</td>
      <td>Get filter value by key</td>
    </tr>
    <tr>
      <td>isOptionSelected</td>
      <td>(attributeCode, optionId) =&gt; boolean</td>
      <td>Check if option is selected</td>
    </tr>
    <tr>
      <td>isCategorySelected</td>
      <td>(categoryId) =&gt; boolean</td>
      <td>Check if category is selected</td>
    </tr>
    <tr>
      <td>getSelectedCount</td>
      <td>(attributeCode) =&gt; number</td>
      <td>Count selected options for attribute</td>
    </tr>
    <tr>
      <td>getCategorySelectedCount</td>
      <td>() =&gt; number</td>
      <td>Count selected categories</td>
    </tr>
    <tr>
      <td>isLoading</td>
      <td>boolean</td>
      <td>True when filters are updating</td>
    </tr>
    <tr>
      <td>activeFilterCount</td>
      <td>number</td>
      <td>Number of active filters</td>
    </tr>
  </tbody>
</table>

## Type Definitions

### FilterInput

```typescript
interface FilterInput {
  key: string;                              // Filter key (attribute code)
  operation: 'eq' | 'in' | 'range' | 'gt' | 'lt';  // Filter operation
  value: string;                            // Filter value(s)
}
```

### FilterableAttribute

```typescript
interface FilterableAttribute {
  attributeCode: string;
  attributeName: string;
  attributeId: number;
  options: Array<{
    optionId: number;
    optionText: string;
  }>;
}
```

### PriceRange

```typescript
interface PriceRange {
  min: number;
  minText: string;
  max: number;
  maxText: string;
}
```

## Examples

### Attribute Checkboxes

```tsx
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';

function AttributeFilters({ currentFilters, availableAttributes, priceRange }) {
  return (
    <ProductFilter
      currentFilters={currentFilters}
      availableAttributes={availableAttributes}
      priceRange={priceRange}
    >
      {({ addFilter, removeFilterValue, isOptionSelected, getSelectedCount }) => (
        <div className="filters">
          {availableAttributes.map(attr => (
            <div key={attr.attributeCode} className="filter-group">
              <h3>
                {attr.attributeName}
                {getSelectedCount(attr.attributeCode) > 0 && (
                  <span> ({getSelectedCount(attr.attributeCode)})</span>
                )}
              </h3>
              {attr.options.map(option => (
                <label key={option.optionId}>
                  <input
                    type="checkbox"
                    checked={isOptionSelected(attr.attributeCode, option.optionId.toString())}
                    onChange={() => {
                      if (isOptionSelected(attr.attributeCode, option.optionId.toString())) {
                        removeFilterValue(attr.attributeCode, option.optionId.toString());
                      } else {
                        addFilter(attr.attributeCode, 'in', option.optionId.toString());
                      }
                    }}
                  />
                  {option.optionText}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </ProductFilter>
  );
}
```

### Price Range Filter

```tsx
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';
import { useState } from 'react';

function PriceFilter({ currentFilters, priceRange }) {
  return (
    <ProductFilter
      currentFilters={currentFilters}
      priceRange={priceRange}
    >
      {({ addFilter, removeFilter, hasFilter, getFilterValue }) => {
        const [min, setMin] = useState(priceRange.min);
        const [max, setMax] = useState(priceRange.max);

        const applyPriceFilter = () => {
          addFilter('price', 'range', `${min}-${max}`);
        };

        return (
          <div className="price-filter">
            <h3>Price Range</h3>
            <div>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                min={priceRange.min}
                max={priceRange.max}
              />
              <span>to</span>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                min={priceRange.min}
                max={priceRange.max}
              />
            </div>
            <button onClick={applyPriceFilter}>Apply</button>
            {hasFilter('price') && (
              <button onClick={() => removeFilter('price')}>Clear</button>
            )}
          </div>
        );
      }}
    </ProductFilter>
  );
}
```

### Category Filter

```tsx
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';

function CategoryFilter({ currentFilters, categories, priceRange }) {
  return (
    <ProductFilter
      currentFilters={currentFilters}
      categories={categories}
      priceRange={priceRange}
    >
      {({ toggleFilter, isCategorySelected }) => (
        <div className="category-filter">
          <h3>Categories</h3>
          {categories.map(category => (
            <label key={category.categoryId}>
              <input
                type="checkbox"
                checked={isCategorySelected(category.categoryId.toString())}
                onChange={() => toggleFilter('cat', 'in', category.categoryId.toString())}
              />
              {category.name}
            </label>
          ))}
        </div>
      )}
    </ProductFilter>
  );
}
```

### Active Filters Display

```tsx
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';

function ActiveFilters({ currentFilters, availableAttributes, priceRange }) {
  return (
    <ProductFilter
      currentFilters={currentFilters}
      availableAttributes={availableAttributes}
      priceRange={priceRange}
    >
      {({ currentFilters, removeFilter, clearAllFilters, activeFilterCount }) => {
        if (activeFilterCount === 0) {
          return null;
        }

        return (
          <div className="active-filters">
            <h4>Active Filters ({activeFilterCount})</h4>
            <div className="filter-tags">
              {currentFilters
                .filter(f => !['page', 'limit', 'ob', 'od'].includes(f.key))
                .map((filter, index) => (
                  <span key={index} className="filter-tag">
                    {filter.key}: {filter.value}
                    <button onClick={() => removeFilter(filter.key)}>×</button>
                  </span>
                ))}
            </div>
            <button onClick={clearAllFilters}>Clear All</button>
          </div>
        );
      }}
    </ProductFilter>
  );
}
```

### Complete Filter Panel

```tsx
import { ProductFilter } from '@components/frontStore/catalog/ProductFilter';

function FilterPanel({ currentFilters, availableAttributes, categories, priceRange }) {
  return (
    <ProductFilter
      currentFilters={currentFilters}
      availableAttributes={availableAttributes}
      categories={categories}
      priceRange={priceRange}
    >
      {({
        addFilter,
        removeFilterValue,
        toggleFilter,
        clearAllFilters,
        isOptionSelected,
        isCategorySelected,
        getSelectedCount,
        activeFilterCount,
        isLoading
      }) => (
        <div className="filter-panel">
          {/* Header */}
          <div className="filter-header">
            <h2>Filters</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} disabled={isLoading}>
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="filter-section">
              <h3>Categories</h3>
              {categories.map(cat => (
                <label key={cat.categoryId}>
                  <input
                    type="checkbox"
                    checked={isCategorySelected(cat.categoryId.toString())}
                    onChange={() => toggleFilter('cat', 'in', cat.categoryId.toString())}
                    disabled={isLoading}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {availableAttributes.map(attr => (
            <div key={attr.attributeCode} className="filter-section">
              <h3>
                {attr.attributeName}
                {getSelectedCount(attr.attributeCode) > 0 && (
                  <span className="count">
                    ({getSelectedCount(attr.attributeCode)})
                  </span>
                )}
              </h3>
              <div className="filter-options">
                {attr.options.map(option => {
                  const selected = isOptionSelected(
                    attr.attributeCode,
                    option.optionId.toString()
                  );
                  return (
                    <label key={option.optionId} className={selected ? 'selected' : ''}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          if (selected) {
                            removeFilterValue(attr.attributeCode, option.optionId.toString());
                          } else {
                            addFilter(attr.attributeCode, 'in', option.optionId.toString());
                          }
                        }}
                        disabled={isLoading}
                      />
                      {option.optionText}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="loading-overlay">
              Updating filters...
            </div>
          )}
        </div>
      )}
    </ProductFilter>
  );
}
```

## Filter Operations

- **eq**: Equals (single value)
- **in**: In list (comma-separated values)
- **range**: Between values (min-max)
- **gt**: Greater than
- **lt**: Less than

## Behavior

### URL Management

Filters are synced with URL query parameters. Updates trigger:
1. URL parameter update
2. GraphQL page data fetch
3. History state push

### Multi-Value Filters

The `in` operation supports multiple values (comma-separated). Use `addFilter` to append values or `removeFilterValue` to remove specific values.

### Reserved Keys

The following filter keys are reserved and excluded from active count: `page`, `limit`, `ob`, `od`.

## Features

- **Render Props Pattern**: Flexible UI implementation
- **URL Sync**: Filters synced with URL parameters
- **Multi-Value Support**: Comma-separated values for 'in' operation
- **Loading State**: Shows loading during updates
- **Active Filter Count**: Tracks number of active filters
- **Helper Functions**: isOptionSelected, hasFilter, etc.
- **Auto Page Reset**: Clears page parameter when filtering
- **Type Safe**: Full TypeScript support

## Related Components

- [CategoryContext](CategoryContext.md) - Category page context
- [ProductContext](ProductContext.md) - Product page context
