---
sidebar_position: 50
title: Pagination
description: A headless render props component for building paginated navigation with URL sync and page data fetching.
keywords:
  - EverShop Pagination
  - pagination
  - page navigation
  - headless component
  - theme development
groups:
  - components
---

# Pagination

## Description

A headless render props component that provides pagination state and navigation functions. It manages page calculation, URL synchronization, page data fetching via AppContext, and scroll behavior — but renders no UI of its own. Also exports a `usePaginationLogic` hook and pre-built renderers.

## Role in Theming

Pagination is one of EverShop's **headless components** — it owns the pagination logic while leaving all UI decisions to its parent:

- **Pagination renders nothing.** It returns only what its `children` function renders.
- **Theme developers do not override Pagination.** Instead, they override the parent components that consume it (`CategoryProductsPagination`, `SearchProductsPagination`).
- **The logic stays stable across themes.** URL parameter updates, GraphQL page data fetching, history state management, scroll-to-top behavior, and page validation are all encapsulated in Pagination.

## Theme Override Points

Pagination is consumed by these components, which are the actual override targets for theme developers:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parent Component</th>
      <th>Route</th>
      <th>Override Path in Theme</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CategoryProductsPagination</td>
      <td>categoryView</td>
      <td><code>themes/&lt;name&gt;/src/pages/categoryView/CategoryProductsPagination.tsx</code></td>
    </tr>
    <tr>
      <td>SearchProductsPagination</td>
      <td>catalogSearch</td>
      <td><code>themes/&lt;name&gt;/src/pages/catalogSearch/SearchProductsPagination.tsx</code></td>
    </tr>
  </tbody>
</table>

## Import

```typescript
import {
  Pagination,
  usePaginationLogic,
  DefaultPaginationRenderer,
  CompactPaginationRenderer,
  InputPaginationRenderer
} from '@components/frontStore/Pagination';
```

## Usage

```tsx
import { Pagination } from '@components/frontStore/Pagination';

function ProductPagination({ total, limit, currentPage }) {
  return (
    <Pagination total={total} limit={limit} currentPage={currentPage}>
      {({ currentPage, totalPages, hasNext, hasPrev, goToNext, goToPrev, goToPage, getPageNumbers, isCurrentPage, isLoading }) => (
        <nav>
          <button onClick={goToPrev} disabled={!hasPrev || isLoading}>
            Previous
          </button>
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              disabled={isCurrentPage(page) || isLoading}
              className={isCurrentPage(page) ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button onClick={goToNext} disabled={!hasNext || isLoading}>
            Next
          </button>
        </nav>
      )}
    </Pagination>
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
      <td>total</td>
      <td>number</td>
      <td>Yes</td>
      <td>-</td>
      <td>Total number of items</td>
    </tr>
    <tr>
      <td>limit</td>
      <td>number</td>
      <td>Yes</td>
      <td>-</td>
      <td>Items per page</td>
    </tr>
    <tr>
      <td>currentPage</td>
      <td>number</td>
      <td>Yes</td>
      <td>-</td>
      <td>Current page number</td>
    </tr>
    <tr>
      <td>onPageChange</td>
      <td>(page: number) =&gt; void</td>
      <td>No</td>
      <td>-</td>
      <td>Callback when page changes</td>
    </tr>
    <tr>
      <td>scrollToTop</td>
      <td>boolean</td>
      <td>No</td>
      <td>true</td>
      <td>Scroll to top on page change</td>
    </tr>
    <tr>
      <td>scrollBehavior</td>
      <td>'auto' | 'smooth'</td>
      <td>No</td>
      <td>'smooth'</td>
      <td>Scroll animation behavior</td>
    </tr>
    <tr>
      <td>children</td>
      <td>(props: PaginationRenderProps) =&gt; ReactNode</td>
      <td>Yes</td>
      <td>-</td>
      <td>Render function receiving pagination props</td>
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
      <td>currentPage</td>
      <td>number</td>
      <td>Current page number</td>
    </tr>
    <tr>
      <td>totalPages</td>
      <td>number</td>
      <td>Total number of pages</td>
    </tr>
    <tr>
      <td>total</td>
      <td>number</td>
      <td>Total number of items</td>
    </tr>
    <tr>
      <td>limit</td>
      <td>number</td>
      <td>Items per page</td>
    </tr>
    <tr>
      <td>hasNext</td>
      <td>boolean</td>
      <td>True if there is a next page</td>
    </tr>
    <tr>
      <td>hasPrev</td>
      <td>boolean</td>
      <td>True if there is a previous page</td>
    </tr>
    <tr>
      <td>startItem</td>
      <td>number</td>
      <td>First item index on current page</td>
    </tr>
    <tr>
      <td>endItem</td>
      <td>number</td>
      <td>Last item index on current page</td>
    </tr>
    <tr>
      <td>goToPage</td>
      <td>(page: number) =&gt; Promise&lt;void&gt;</td>
      <td>Navigate to specific page</td>
    </tr>
    <tr>
      <td>goToNext</td>
      <td>() =&gt; Promise&lt;void&gt;</td>
      <td>Navigate to next page</td>
    </tr>
    <tr>
      <td>goToPrev</td>
      <td>() =&gt; Promise&lt;void&gt;</td>
      <td>Navigate to previous page</td>
    </tr>
    <tr>
      <td>goToFirst</td>
      <td>() =&gt; Promise&lt;void&gt;</td>
      <td>Navigate to first page</td>
    </tr>
    <tr>
      <td>goToLast</td>
      <td>() =&gt; Promise&lt;void&gt;</td>
      <td>Navigate to last page</td>
    </tr>
    <tr>
      <td>getPageNumbers</td>
      <td>(range?: number) =&gt; number[]</td>
      <td>Get visible page numbers (default range: 5)</td>
    </tr>
    <tr>
      <td>isCurrentPage</td>
      <td>(page: number) =&gt; boolean</td>
      <td>Check if page is active</td>
    </tr>
    <tr>
      <td>isValidPage</td>
      <td>(page: number) =&gt; boolean</td>
      <td>Check if page number is valid</td>
    </tr>
    <tr>
      <td>isLoading</td>
      <td>boolean</td>
      <td>True during page navigation</td>
    </tr>
    <tr>
      <td>getDisplayText</td>
      <td>() =&gt; string</td>
      <td>Returns "Showing X-Y of Z results"</td>
    </tr>
    <tr>
      <td>getPageInfo</td>
      <td>() =&gt; &#123; showing: string; total: string &#125;</td>
      <td>Returns showing range and total as strings</td>
    </tr>
  </tbody>
</table>

## Pre-Built Renderers

Pagination exports three ready-to-use renderers that can be passed the render props directly:

### DefaultPaginationRenderer

Full page number navigation with ellipsis for large page counts.

```tsx
import { Pagination, DefaultPaginationRenderer } from '@components/frontStore/Pagination';

function ProductPagination({ total, limit, currentPage }) {
  return (
    <Pagination total={total} limit={limit} currentPage={currentPage}>
      {(renderProps) => (
        <DefaultPaginationRenderer renderProps={renderProps} showInfo />
      )}
    </Pagination>
  );
}
```

### CompactPaginationRenderer

Previous/Next buttons with page info text.

```tsx
import { Pagination, CompactPaginationRenderer } from '@components/frontStore/Pagination';

function ProductPagination({ total, limit, currentPage }) {
  return (
    <Pagination total={total} limit={limit} currentPage={currentPage}>
      {(renderProps) => (
        <CompactPaginationRenderer renderProps={renderProps} />
      )}
    </Pagination>
  );
}
```

### InputPaginationRenderer

Page number input with First/Last buttons.

```tsx
import { Pagination, InputPaginationRenderer } from '@components/frontStore/Pagination';

function ProductPagination({ total, limit, currentPage }) {
  return (
    <Pagination total={total} limit={limit} currentPage={currentPage}>
      {(renderProps) => (
        <InputPaginationRenderer renderProps={renderProps} />
      )}
    </Pagination>
  );
}
```

## usePaginationLogic Hook

For direct usage without the render props wrapper:

```tsx
import { usePaginationLogic } from '@components/frontStore/Pagination';

function CustomPagination({ total, limit, currentPage }) {
  const {
    currentPage: page,
    totalPages,
    hasNext,
    hasPrev,
    goToPage,
    goToNext,
    goToPrev,
    isLoading
  } = usePaginationLogic(total, limit, currentPage);

  return (
    <div>
      <button onClick={goToPrev} disabled={!hasPrev}>Prev</button>
      <span>{page} / {totalPages}</span>
      <button onClick={goToNext} disabled={!hasNext}>Next</button>
    </div>
  );
}
```

## Examples

### Theme Override Example

A theme developer overrides `CategoryProductsPagination` to use a compact pagination style. Create this file in your theme:

**`themes/my-theme/src/pages/categoryView/CategoryProductsPagination.tsx`**

```tsx
import { Pagination } from '@components/frontStore/Pagination';

function CategoryProductsPagination({ total, limit, currentPage }) {
  if (total <= limit) return null;

  return (
    <Pagination total={total} limit={limit} currentPage={currentPage}>
      {({ currentPage, totalPages, hasNext, hasPrev, goToNext, goToPrev, getDisplayText, isLoading }) => (
        <div className="my-theme-pagination">
          <p>{getDisplayText()}</p>
          <div className="controls">
            <button
              onClick={goToPrev}
              disabled={!hasPrev || isLoading}
              className="my-theme-prev-btn"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={goToNext}
              disabled={!hasNext || isLoading}
              className="my-theme-next-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Pagination>
  );
}

export default CategoryProductsPagination;

export const layout = {
  areaId: 'categoryPageMain',
  sortOrder: 50
};
```

## Behavior

### URL Synchronization

Page changes update the URL `page` query parameter and push to browser history. This enables back/forward navigation and shareable URLs.

### Page Data Fetching

Navigation triggers `AppContextDispatch.fetchPageData()` with the new URL, which refetches the GraphQL page data for the new page.

### Scroll to Top

By default, page changes scroll to the top of the page with smooth animation. Disable with `scrollToTop={false}` or change to instant with `scrollBehavior="auto"`.

### Page Validation

`goToPage` clamps the page number between 1 and totalPages. Navigating to the current page is a no-op. Navigation is blocked while a fetch is in progress.

## Features

- **Headless**: Renders no UI — full control via render props
- **URL Sync**: Page parameter synced with URL
- **Page Data Fetch**: Automatically fetches new page data
- **Scroll Management**: Configurable scroll-to-top on navigation
- **Pre-Built Renderers**: Three ready-to-use renderer components
- **Hook API**: `usePaginationLogic` for direct usage
- **Display Helpers**: getDisplayText, getPageInfo for common UI patterns
- **Loading State**: Tracks navigation loading state
- **Type Safe**: Full TypeScript support

## Related Components

- [ProductFilter](ProductFilter.md) - Product filtering
- [ProductList](ProductList.md) - Product listing

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
