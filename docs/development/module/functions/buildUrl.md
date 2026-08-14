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

Returns `string` - the relative URL path, **localized** to the current locale.

## Locale prefixing

`buildUrl` runs its result through `applyLocalePrefix`, so storefront links carry the active locale:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Situation</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Default storefront locale</td>
      <td>No prefix — <code>/checkout</code></td>
    </tr>
    <tr>
      <td>Non-default storefront locale (e.g. <code>de</code>)</td>
      <td><code>/de/checkout</code></td>
    </tr>
    <tr>
      <td>Home route on a non-default locale</td>
      <td><code>/de</code> (never <code>/de/</code>)</td>
    </tr>
    <tr>
      <td>Admin route, or any call made in an admin context</td>
      <td>Never prefixed</td>
    </tr>
    <tr>
      <td>Any <code>/api</code> or <code>/api/*</code> path</td>
      <td>Never prefixed</td>
    </tr>
  </tbody>
</table>

The prefix is applied isomorphically: during SSR from the per-render locale context, and in the browser from `window.eContext`. Outside any locale context — before the locale middleware runs — the prefix logic is dormant and paths come back unprefixed.

### `localizeUrl` for already-built URLs

`buildUrl` needs a **route id**, and its locale source is not populated during GraphQL resolution. When you already have a URL string — a `url_rewrite` entity path inside a resolver, for instance — use `localizeUrl` instead:

```ts
import { localizeUrl } from '@evershop/evershop/lib/locale/localeContext';

const url = localizeUrl(urlRewrite.request_path); // '/de/my-product' on a de request
```

Both functions delegate to the same `applyLocalePrefix` primitive, so they agree on admin, default-locale and `/api/*` handling.

## Examples

### Basic Route

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Simple route without parameters
const url = buildUrl('homepage');
// Returns: "/"

const url = buildUrl('productGrid');
// Returns: "/admin/products"
```

### With Route Parameters

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// The parameter keys must match the `:placeholders` in the route's path.
// `productView` is /product/:uuid and `categoryView` is /category/:uuid, so both
// take `uuid`. A wrong key throws `Could not build url for route ...`.
const url = buildUrl('productView', { uuid: product.uuid });
// Returns: "/product/2f1c9e8a-..."

const url = buildUrl('categoryView', { uuid: category.uuid });
// Returns: "/category/8b3d7f21-..."

// Only the CMS and landing page routes take a url_key:
const pageUrl = buildUrl('cmsPageView', { url_key: 'about-us' });
// Returns: "/page/about-us"
```

### With Query String

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Route with query parameters
const url = buildUrl(
  'productGrid',
  {},
  {
    page: 2,
    limit: 20
  }
);
// Returns: "/admin/products?page=2&limit=20"
```

### With Both Parameters and Query

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Route with both route params and query string
const url = buildUrl(
  'categoryView',
  { uuid: category.uuid },
  { page: 1, sort: 'price' }
);
// Returns: "/category/8b3d7f21-...?page=1&sort=price"
```

### Array Query Parameters

```typescript
import { buildUrl } from '@evershop/evershop/lib/router';

// Query with array values
const url = buildUrl(
  'productGrid',
  {},
  {
    color: ['red', 'blue', 'green'],
    size: ['M', 'L']
  }
);
// Returns: "/admin/products?color[]=red&color[]=blue&color[]=green&size[]=M&size[]=L"
```

### In React Components

```typescript
import React from 'react';
import { buildUrl } from '@evershop/evershop/lib/router';

export default function ProductCard({ product }) {
  const productUrl = buildUrl('productView', { uuid: product.uuid });

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
const nextPageUrl = buildUrl('productGrid', {}, { page: currentPage + 1 });
const prevPageUrl = buildUrl('productGrid', {}, { page: currentPage - 1 });

// Build filtered URLs
const filteredUrl = buildUrl(
  'productGrid',
  {},
  {
    price_min: 10,
    price_max: 100,
    brand: 'Nike'
  }
);
```

## Notes

- Returns relative URL paths (without domain)
- Applies the storefront locale prefix — never for admin routes and never for `/api/*`
- Route must be registered in the router
- Throws error if route ID doesn't exist
- Query parameters are automatically URL-encoded
- Array values are formatted with `[]` suffix
- `null` and `undefined` query values are skipped
- Isomorphic — safe during SSR and on the client

## See Also

- [buildAbsoluteUrl](/docs/development/module/functions/buildAbsoluteUrl) - Build absolute URLs (server-side)
- [Translation](/docs/development/knowledge-base/translation) - Locales and the URL prefix scheme
