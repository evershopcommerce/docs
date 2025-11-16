---
sidebar_position: 31
keywords:
- buildUrl
- router
- URL
- route
- link
groups:
- utilities
sidebar_label: buildUrl
title: buildUrl
description: Build a URL from a route ID and parameters.
---

# buildUrl

Build a URL from a route ID with optional parameters and query strings.

## Import

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';
```

## Syntax

```typescript
buildUrl(routeId: string, params?: Record<string, any>, query?: Record<string, any>): string
```

### Parameters

**`routeId`**

**Type:** `string`

The unique identifier of the route.

**`params`**

**Type:** `Record<string, any>` (optional)

Route parameters to replace placeholders in the route path.

**`query`**

**Type:** `Record<string, any>` (optional)

Query string parameters to append to the URL.

## Return Value

Returns `string` - the relative URL path.

## Examples

### Basic Route

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Simple route without parameters
const url = buildUrl('homepage');
// Returns: "/"

const url = buildUrl('productListing');
// Returns: "/products"
```

### With Route Parameters

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Route with parameters
const url = buildUrl('productView', { id: '123' });
// Returns: "/product/123"

const url = buildUrl('categoryView', { slug: 'electronics' });
// Returns: "/category/electronics"
```

### With Query String

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Route with query parameters
const url = buildUrl('productListing', {}, { 
  page: 2, 
  limit: 20 
});
// Returns: "/products?page=2&limit=20"
```

### With Both Parameters and Query

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Route with both route params and query string
const url = buildUrl(
  'categoryView',
  { slug: 'electronics' },
  { page: 1, sort: 'price' }
);
// Returns: "/category/electronics?page=1&sort=price"
```

### Array Query Parameters

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Query with array values
const url = buildUrl('productListing', {}, {
  color: ['red', 'blue', 'green'],
  size: ['M', 'L']
});
// Returns: "/products?color[]=red&color[]=blue&color[]=green&size[]=M&size[]=L"
```

### In React Components

```typescript
import React from 'react';
import { buildUrl } from '@evershop/evershop/lib/router';

export default function ProductCard({ product }) {
  const productUrl = buildUrl('productView', { id: product.product_id });
  
  return (
    <a href={productUrl}>
      <h3>{product.name}</h3>
    </a>
  );
}
```

### Dynamic Links

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Build pagination links
const currentPage = 2;
const nextPageUrl = buildUrl('productListing', {}, { page: currentPage + 1 });
const prevPageUrl = buildUrl('productListing', {}, { page: currentPage - 1 });

// Build filtered URLs
const filteredUrl = buildUrl('productListing', {}, {
  price_min: 10,
  price_max: 100,
  brand: 'Nike'
});
```

## Notes

- Returns relative URL paths (without domain)
- Route must be registered in the router
- Throws error if route ID doesn't exist
- Query parameters are automatically URL-encoded
- Array values are formatted with `[]` suffix
- `null` and `undefined` query values are skipped
- Used on both client and server side

## See Also

- [buildAbsoluteUrl](/docs/development/module/functions/buildAbsoluteUrl) - Build absolute URLs (server-side)
