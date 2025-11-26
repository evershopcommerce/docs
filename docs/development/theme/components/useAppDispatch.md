---
sidebar_position: 3
title: useAppDispatch
description: A React hook that provides dispatch functions to update the global application state.
keywords:
  - EverShop useAppDispatch
  - app context dispatch
  - React hook
groups:
  - contexts
---

# useAppDispatch

## Description

A React hook that provides access to methods for updating the global application state. Returns dispatch functions to set data directly or fetch new page data from the server.

## Import

```typescript
import { useAppDispatch } from '@components/common/context/app';
```

## Usage

```tsx
import { useAppDispatch } from '@components/common/context/app';

function NavigationLink({ href, children }) {
  const { fetchPageData } = useAppDispatch();
  
  const handleClick = async (e) => {
    e.preventDefault();
    const url = new URL(href, window.location.origin);
    url.searchParams.append('ajax', 'true');
    await fetchPageData(url.toString());
    window.history.pushState({}, '', href);
  };
  
  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
```

## Methods

### fetchPageData

Fetches page data from the server and updates the application context. The URL should include `ajax=true` parameter to get JSON response instead of full HTML.

```typescript
fetchPageData(url: string | URL): Promise<void>
```

## Example: Client-Side Navigation

```tsx
import { useAppDispatch } from '@components/common/context/app';

function ProductLink({ productUrl }) {
  const { fetchPageData } = useAppDispatch();
  
  const navigateToProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Fetch page data with ajax parameter
      const url = new URL(productUrl, window.location.origin);
      url.searchParams.append('ajax', 'true');
      
      await fetchPageData(url.toString());
      
      // Update browser history
      window.history.pushState({}, '', productUrl);
    } catch (error) {
      console.error('Failed to load product:', error);
    }
  };
  
  return (
    <a href={productUrl} onClick={navigateToProduct}>
      View Product
    </a>
  );
}
```

## Example: Refreshing Current Page

```tsx
import { useAppDispatch } from '@components/common/context/app';

function RefreshButton() {
  const { fetchPageData } = useAppDispatch();
  
  const refreshPage = async () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('ajax', 'true');
    
    await fetchPageData(currentUrl.toString());
  };
  
  return (
    <button onClick={refreshPage}>
      Refresh Page Data
    </button>
  );
}
```

## Related

- [AppProvider](AppProvider.md) - The provider component that wraps the application
- [useAppState](useAppState.md) - Hook to access the application state
