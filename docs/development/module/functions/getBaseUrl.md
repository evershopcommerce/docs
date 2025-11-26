---
sidebar_position: 8
keywords:
- getBaseUrl
- base URL
- shop URL
- home URL
groups:
- utilities
sidebar_label: getBaseUrl
title: getBaseUrl
description: Get the base URL of the shop.
---

# getBaseUrl

Get the base URL of the shop, retrieved from configuration or defaulting to localhost.

## Import

```typescript
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';
```

## Syntax

```typescript
getBaseUrl(): string
```

### Parameters

None.

## Return Value

Returns a `string` containing the base URL without trailing slashes.

## Examples

### Basic Usage

```typescript
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';

const baseUrl = getBaseUrl();
// Returns: 'https://myshop.com' or 'http://localhost:3000'
```

### Building Full URLs

```typescript
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';

const baseUrl = getBaseUrl();
const productUrl = `${baseUrl}/product/${product.url_key}`;
const categoryUrl = `${baseUrl}/category/${category.url_key}`;
```

### Email Templates

```typescript
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';

const emailData = {
  shopUrl: getBaseUrl(),
  orderLink: `${getBaseUrl()}/account/orders/${orderId}`,
  logoUrl: `${getBaseUrl()}/assets/logo.png`
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

If not configured, it defaults to `http://localhost:{PORT}` where PORT is from the application configuration.

## Notes

- Always removes trailing slashes from the returned URL
- Returns the value from `shop.homeUrl` configuration
- Falls back to `http://localhost:{PORT}` if not configured
- Useful for generating absolute URLs in emails, RSS feeds, or API responses

## See Also

- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
