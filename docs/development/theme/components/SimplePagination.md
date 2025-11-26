---
sidebar_position: 29
title: SimplePagination
description: A simple pagination component with previous and next navigation buttons.
keywords:
  - EverShop SimplePagination
  - pagination
  - navigation
groups:
  - components
---

# SimplePagination

## Description

A lightweight pagination component that displays item count and provides previous/next navigation. Shows the current count out of total items with chevron buttons for navigating between pages.

## Import

```typescript
import { SimplePagination } from '@components/common/SimplePagination';
```

## Usage

```tsx
import { SimplePagination } from '@components/common/SimplePagination';
import { useState } from 'react';

function ProductList() {
  const [page, setPage] = useState(1);

  return (
    <div>
      {/* Your content here */}
      
      <SimplePagination
        total={150}
        count={20}
        page={page}
        hasNext={true}
        setPage={setPage}
      />
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
      <td>total</td>
      <td>number</td>
      <td>-</td>
      <td>Total number of items (required)</td>
    </tr>
    <tr>
      <td>count</td>
      <td>number</td>
      <td>-</td>
      <td>Current count of visible items (required)</td>
    </tr>
    <tr>
      <td>page</td>
      <td>number</td>
      <td>-</td>
      <td>Current page number (required)</td>
    </tr>
    <tr>
      <td>hasNext</td>
      <td>boolean</td>
      <td>-</td>
      <td>Whether there are more pages (required)</td>
    </tr>
    <tr>
      <td>setPage</td>
      <td>(page: number) =&gt; void</td>
      <td>-</td>
      <td>Callback to update page number (required)</td>
    </tr>
  </tbody>
</table>

## Example: Product Listing

```tsx
import { SimplePagination } from '@components/common/SimplePagination';
import { useState } from 'react';

function ProductListing({ products }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalItems = products.length;
  const currentCount = Math.min(currentPage * itemsPerPage, totalItems);
  const hasMorePages = currentPage * itemsPerPage < totalItems;

  return (
    <div>
      <div className="product-grid">
        {/* Display products */}
      </div>
      
      <SimplePagination
        total={totalItems}
        count={currentCount}
        page={currentPage}
        hasNext={hasMorePages}
        setPage={setCurrentPage}
      />
    </div>
  );
}
```

## Related Components

- [Area](Area.md) - Component container system
- [Image](Image.md) - Optimized image component
