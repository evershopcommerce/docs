---
sidebar_position: 32
keywords:
- buildAbsoluteUrl
- router
- URL
- absolute URL
- server-side
groups:
- utilities
sidebar_label: buildAbsoluteUrl
title: buildAbsoluteUrl
description: Build an absolute URL from a route ID (server-side only).
---

# buildAbsoluteUrl

Build an absolute URL from a route ID with optional parameters. Server-side only.

## Import

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';
```

## Syntax

```typescript
buildAbsoluteUrl(routeId: string, params?: Record<string, any>): string
```

### Parameters

**`routeId`**

**Type:** `string`

The unique identifier of the route.

**`params`**

**Type:** `Record<string, any>` (optional)

Route parameters to replace placeholders in the route path.

## Return Value

Returns `string` - the absolute URL with domain.

## Examples

### Basic Usage

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Simple route
const url = buildAbsoluteUrl('homepage');
// Returns: "https://myshop.com/"

const url = buildAbsoluteUrl('cart');
// Returns: "https://myshop.com/cart"
```

### With Parameters

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Route with parameters. The keys must match the `:placeholders` in the route's
// path: `productView` is /product/:uuid and `categoryView` is /category/:uuid,
// so both take `uuid`. A wrong key throws `Could not build url for route ...`.
const url = buildAbsoluteUrl('productView', { uuid: product.uuid });
// Returns: "https://myshop.com/product/2f1c9e8a-..."

const url = buildAbsoluteUrl('categoryView', { uuid: category.uuid });
// Returns: "https://myshop.com/category/8b3d7f21-..."
```

### In Email Templates

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Generate URLs for emails.
// `orderView` is /account/orders/:uuid — it takes the order's `uuid`.
const orderUrl = buildAbsoluteUrl('orderView', { uuid: order.uuid });

// The reset-password page route is `resetPasswordPage` (/account/reset-password)
// and takes no path parameter — the token rides as a query string, exactly as
// `sendResetPasswordEmail` does it. (`resetPassword` is the POST API route.)
const resetPasswordUrl = `${buildAbsoluteUrl('resetPasswordPage')}?token=${token}`;

const emailData = {
  orderLink: orderUrl,
  resetLink: resetPasswordUrl
};
```

### In Middleware

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

export default async function redirectMiddleware(request, response, next) {
  if (!request.session.customerId) {
    const loginUrl = buildAbsoluteUrl('login');
    response.redirect(loginUrl);
    return;
  }
  
  next();
}
```

### For API Responses

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

export default async function createProduct(request, response) {
  const product = await insertProduct(request.body);
  
  response.json({
    success: true,
    product: {
      ...product,
      url: buildAbsoluteUrl('productView', { uuid: product.uuid })
    }
  });
}
```

### Social Sharing

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Generate shareable URLs
const productUrl = buildAbsoluteUrl('productView', { uuid: product.uuid });

const shareData = {
  url: productUrl,
  title: product.name,
  description: product.description
};
```

## Configuration

`buildAbsoluteUrl` prefixes the path produced by `buildUrl` with `getBaseUrl()`, which resolves in this order:

1. The `EVERSHOP_HOME_URL` environment variable — takes precedence over **every** config file
2. The `shop.homeUrl` config value
3. `http://localhost:{PORT}`

```bash
EVERSHOP_HOME_URL=https://myshop.com
```

```json
{
  "shop": {
    "homeUrl": "https://myshop.com"
  }
}
```

:::danger A malformed `EVERSHOP_HOME_URL` fails boot
The variable is validated at startup: if it is set but is not a parseable absolute `http`/`https` URL, the process throws and exits rather than emitting broken absolute links.
:::

## Notes

- **Server-side only** - includes full domain
- Base URL comes from `EVERSHOP_HOME_URL`, then `shop.homeUrl`, then localhost
- Automatically removes trailing slashes
- Does not support query parameters (use `buildUrl` then concatenate)
- Inherits `buildUrl`'s locale prefixing: a non-default storefront locale produces `https://myshop.com/<locale>/…`
- Used for emails, redirects, API responses, and social sharing
- For relative URLs, use `buildUrl()` instead

## See Also

- [buildUrl](/docs/development/module/functions/buildUrl) - Build relative URLs
- [getBaseUrl](/docs/development/module/functions/getBaseUrl) - Resolve the store base URL
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
