---
sidebar_position: 45
title: SearchBox
description: A search component with autocomplete dropdown and customizable rendering.
keywords:
  - EverShop SearchBox
  - product search
  - autocomplete
groups:
  - components
---

# SearchBox

## Description

A search component with optional autocomplete suggestions. Displays a search icon that opens a fullscreen search input with dropdown results. Supports custom rendering and search functions.

## Import

```typescript
import { SearchBox } from '@components/frontStore/catalog/SearchBox';
```

## Usage

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function Header() {
  return (
    <SearchBox searchPageUrl="/search" />
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
      <td>searchPageUrl</td>
      <td>string</td>
      <td>Yes</td>
      <td>-</td>
      <td>Search results page URL</td>
    </tr>
    <tr>
      <td>enableAutocomplete</td>
      <td>boolean</td>
      <td>No</td>
      <td>false</td>
      <td>Enable autocomplete dropdown</td>
    </tr>
    <tr>
      <td>autocompleteDelay</td>
      <td>number</td>
      <td>No</td>
      <td>300</td>
      <td>Debounce delay in ms</td>
    </tr>
    <tr>
      <td>minSearchLength</td>
      <td>number</td>
      <td>No</td>
      <td>2</td>
      <td>Minimum characters to search</td>
    </tr>
    <tr>
      <td>maxResults</td>
      <td>number</td>
      <td>No</td>
      <td>10</td>
      <td>Maximum results to show</td>
    </tr>
    <tr>
      <td>onSearch</td>
      <td>(query) =&gt; Promise&lt;SearchResult[]&gt;</td>
      <td>No</td>
      <td>-</td>
      <td>Custom search function</td>
    </tr>
    <tr>
      <td>renderSearchInput</td>
      <td>RenderFunction</td>
      <td>No</td>
      <td>-</td>
      <td>Custom input renderer</td>
    </tr>
    <tr>
      <td>renderSearchResults</td>
      <td>RenderFunction</td>
      <td>No</td>
      <td>-</td>
      <td>Custom results renderer</td>
    </tr>
    <tr>
      <td>renderSearchIcon</td>
      <td>() =&gt; ReactNode</td>
      <td>No</td>
      <td>-</td>
      <td>Custom search icon</td>
    </tr>
    <tr>
      <td>renderCloseIcon</td>
      <td>() =&gt; ReactNode</td>
      <td>No</td>
      <td>-</td>
      <td>Custom close icon</td>
    </tr>
  </tbody>
</table>

## Type Definitions

### SearchResult

```typescript
interface SearchResult {
  id: string;
  title: string;
  url?: string;
  image?: string;
  price?: string;
  type?: 'product' | 'category' | 'page';
  [key: string]: any;  // Extended fields
}
```

## Examples

### Basic Search

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function Header() {
  return (
    <header>
      <div className="logo">My Store</div>
      <SearchBox searchPageUrl="/search" />
    </header>
  );
}
```

### With Autocomplete

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function Header() {
  return (
    <SearchBox
      searchPageUrl="/search"
      enableAutocomplete={true}
      minSearchLength={3}
      maxResults={8}
      autocompleteDelay={400}
    />
  );
}
```

### Custom Search Function

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function CustomSearch() {
  const handleSearch = async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    
    return data.results.map(item => ({
      id: item.id,
      title: item.name,
      url: item.url,
      image: item.thumbnail,
      price: item.price,
      type: 'product'
    }));
  };

  return (
    <SearchBox
      searchPageUrl="/search"
      enableAutocomplete={true}
      onSearch={handleSearch}
    />
  );
}
```

### Custom Input Renderer

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function StyledSearch() {
  return (
    <SearchBox
      searchPageUrl="/search"
      enableAutocomplete={true}
      renderSearchInput={({ value, onChange, onKeyDown, placeholder, ref }) => (
        <div className="custom-search-input">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="styled-input"
          />
        </div>
      )}
    />
  );
}
```

### Custom Results Renderer

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function CustomResults() {
  return (
    <SearchBox
      searchPageUrl="/search"
      enableAutocomplete={true}
      renderSearchResults={({ results, query, onSelect, isLoading }) => (
        <div className="custom-results">
          {isLoading && <div>Loading...</div>}
          
          {!isLoading && results.length === 0 && (
            <div>No results for "{query}"</div>
          )}
          
          {!isLoading && results.map(result => (
            <div 
              key={result.id}
              onClick={() => onSelect(result)}
              className="result-item"
            >
              <img src={result.image} alt={result.title} />
              <div>
                <h4>{result.title}</h4>
                <p>{result.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
}
```

### Custom Icons

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

function IconSearch() {
  return (
    <SearchBox
      searchPageUrl="/search"
      renderSearchIcon={() => (
        <MagnifyingGlassIcon className="w-6 h-6" />
      )}
      renderCloseIcon={() => (
        <XMarkIcon className="w-6 h-6" />
      )}
    />
  );
}
```

### Complete Example

```tsx
import { SearchBox } from '@components/frontStore/catalog/SearchBox';
import { useState } from 'react';

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="logo">
          <a href="/">My Store</a>
        </div>

        <nav className="main-nav">
          <a href="/products">Products</a>
          <a href="/categories">Categories</a>
        </nav>

        <div className="header-actions">
          <SearchBox
            searchPageUrl="/search"
            enableAutocomplete={true}
            minSearchLength={2}
            maxResults={10}
            autocompleteDelay={300}
          />
          <a href="/cart">Cart</a>
        </div>
      </div>
    </header>
  );
}
```

## Related Components

- [SearchContext](SearchContext.md) - Search results page context
- [ProductList](ProductList.md) - Product listing display
- [Image](Image.md) - Image component
