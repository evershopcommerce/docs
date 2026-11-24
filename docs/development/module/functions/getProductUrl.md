---
slug: getproducturl
sidebar_position: 145
keywords:
- getProductUrl
- getProductUrls
- catalog
- product
- URL
- url_rewrite
groups:
- catalog
sidebar_label: getProductUrl
title: getProductUrl
description: Get the storefront URL of a product, or of many products in one query.
---

# getProductUrl

Returns the storefront URL of a product: its friendly path from `url_rewrite` (for example `/men/basic-tee`, with the category path when the product is in a category), or the product page route `/product/<uuid>` when the product has no rewrite yet. `getProductUrls` does the same for a list of products with one query, however long the list.

The GraphQL `Product.url` field, the cart item's `productUrl` and widget links to products all use it, so a URL you build with it is the one the storefront shows.

## Import

```typescript
import {
  getProductUrl,
  getProductUrls
} from '@evershop/evershop/catalog/services';
```

## Syntax

```typescript
getProductUrl(
  product: string | { uuid: string },
  options?: { absolute?: boolean },
  connection?: Pool | PoolClient
): Promise<string>

getProductUrls(
  uuids: string[],
  options?: { absolute?: boolean },
  connection?: Pool | PoolClient
): Promise<string[]>
```

### Parameters

**`product`** / **`uuids`**

The product's `uuid`, or an object with a `uuid` (such as a product row). `getProductUrls` takes a list of uuids and returns the URLs in the same order, repeats included. A value that is not a uuid gets the route URL and does not affect the others.

**`options.absolute`**

**Type:** `boolean` (optional, default `false`)

Prefix the store's base URL, for emails, feeds and other places outside the storefront. The base URL is the `EVERSHOP_HOME_URL` environment variable, else the `shop.homeUrl` config value, else `http://localhost:<PORT>`.

**`connection`**

**Type:** `Pool | PoolClient` (optional, default: the shared pool)

The database connection to read `url_rewrite` with. Pass your client to read inside your transaction. The function never releases a client you pass; releasing it stays your job.

## Return Value

The URL path (`/men/basic-tee`), or the absolute URL (`https://shop.com/men/basic-tee`) with `absolute: true`.

The path has no language prefix. In a storefront request, pass it through `localizeUrl` if your store uses more than one language, as `Product.url` does.

The route URL `/product/<uuid>` is built from the loaded routes. The web app, the event process (subscribers) and the cron process (jobs) load them at start. In a script of your own that loads no routes, a product without a rewrite throws `Route productView is not existed`.

## Examples

### A link in an email (a subscriber)

```typescript
import { getProductUrl } from '@evershop/evershop/catalog/services';

const url = await getProductUrl(product, { absolute: true });
// https://shop.com/men/basic-tee
```

### Many products at once (a feed)

```typescript
import { getProductUrls } from '@evershop/evershop/catalog/services';

const uuids = products.map((p) => p.uuid);
const urls = await getProductUrls(uuids, { absolute: true });
products.forEach((p, i) => {
  feed.push({ id: p.sku, link: urls[i] });
});
```

## See Also

- [buildAbsoluteUrl](/docs/development/module/functions/buildabsoluteurl) - Absolute URL from a route ID
- [buildUrl](/docs/development/module/functions/buildurl) - URL from a route ID
