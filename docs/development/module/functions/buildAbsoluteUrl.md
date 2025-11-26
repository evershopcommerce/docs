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

const url = buildAbsoluteUrl('productListing');
// Returns: "https://myshop.com/products"
```

### With Parameters

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Route with parameters
const url = buildAbsoluteUrl('productView', { id: '123' });
// Returns: "https://myshop.com/product/123"

const url = buildAbsoluteUrl('categoryView', { slug: 'electronics' });
// Returns: "https://myshop.com/category/electronics"
```

### In Email Templates

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Generate URLs for emails
const orderUrl = buildAbsoluteUrl('orderView', { orderId: order.order_id });
const resetPasswordUrl = buildAbsoluteUrl('resetPassword', { token: token });

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
      url: buildAbsoluteUrl('productView', { id: product.product_id })
    }
  });
}
```

### Social Sharing

```typescript
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Generate shareable URLs
const productUrl = buildAbsoluteUrl('productView', { id: product.product_id });

const shareData = {
  url: productUrl,
  title: product.name,
  description: product.description
};
```

## Configuration

The base URL is configured in `config/default.json`:

```json
{
  "shop": {
    "homeUrl": "https://myshop.com"
  }
}
```

If not configured, defaults to `http://localhost:{PORT}`.

## Notes

- **Server-side only** - includes full domain
- Uses `shop.homeUrl` from configuration
- Falls back to localhost if homeUrl not configured
- Automatically removes trailing slashes
- Does not support query parameters (use `buildUrl` then concatenate)
- Used for emails, redirects, API responses, and social sharing
- For relative URLs, use `buildUrl()` instead

## See Also

- [buildUrl](/docs/development/module/functions/buildUrl) - Build relative URLs
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
