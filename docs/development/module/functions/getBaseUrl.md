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

## Resolution order

The base URL is resolved from the first source that yields a value:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>#</th>
      <th>Source</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><code>EVERSHOP_HOME_URL</code> environment variable</td>
      <td>Takes precedence over <strong>every</strong> config file. Trimmed; an empty value is treated as unset.</td>
    </tr>
    <tr>
      <td>2</td>
      <td><code>shop.homeUrl</code> config</td>
      <td>The usual place to set it for a fixed deployment.</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Localhost on <code>PORT</code> (default <code>3000</code>)</td>
      <td>Development fallback.</td>
    </tr>
  </tbody>
</table>

### `EVERSHOP_HOME_URL`

```bash
EVERSHOP_HOME_URL=https://myshop.com
```

This is the right knob for container and platform deployments, where the public URL is injected at run time rather than baked into a config file.

:::danger A malformed value fails boot
`EVERSHOP_HOME_URL` is validated at startup. If it is set but is not a parseable absolute URL, or its protocol is not `http:`/`https:`, the process throws and exits — every absolute link and email the store generates would otherwise be broken. Leaving it unset (or empty) is fine; the store then falls back to `shop.homeUrl`.
:::

### Config file

```json
{
  "shop": {
    "homeUrl": "https://myshop.com"
  }
}
```

## Notes

- Always removes trailing slashes from the returned URL
- `EVERSHOP_HOME_URL` overrides `shop.homeUrl`, not the other way round
- Useful for generating absolute URLs in emails, RSS feeds, sitemaps or API responses

## See Also

- [buildAbsoluteUrl](/docs/development/module/functions/buildAbsoluteUrl) - Build an absolute URL from a route ID
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
