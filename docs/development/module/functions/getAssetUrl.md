---
slug: getasseturl
sidebar_position: 146
keywords:
- getAssetUrl
- asset URL
- image URL
- file storage
- S3
- Azure Blob
- Cloudinary
groups:
- utilities
sidebar_label: getAssetUrl
title: getAssetUrl
description: Get the absolute URL of a stored file, from local storage or any cloud storage.
---

# getAssetUrl

Returns the absolute URL of a stored file (a product image, an order item thumbnail, a blog post image, a logo), for places outside the storefront page: emails, feeds and social sharing tags.

What a file's stored value looks like depends on the storage:

- **Local storage** stores a site-relative path, such as `/assets/catalog/9424/1250/tee.jpg`. `getAssetUrl` puts the store's base URL in front.
- **Any other storage** (S3, Azure Blob, Google Cloud Storage, Cloudinary, a CDN, or a storage extension) stores the full URL already. `getAssetUrl` returns it as it is.

So the same code works whatever storage the store uses.

## Import

```typescript
import { getAssetUrl } from '@evershop/evershop/lib/util/getAssetUrl';
```

## Syntax

```typescript
getAssetUrl(path: string): string
```

### Parameters

**`path`**

**Type:** `string`

The stored value: a site-relative path, or a full URL. A value with a scheme (`https://`, `http://`, `data:`) counts as a full URL.

## Return Value

The absolute URL:

- A site-relative path gets the base URL in front.
- A full URL is returned as it is.
- A protocol-relative value (`//cdn.example.com/a.jpg`) gets the scheme of the base URL, because an email or a crawler has no page to take it from.
- A `javascript:`, `vbscript:` or `file:` value is not a file URL, so it becomes an empty string.
- An empty value stays empty.

The base URL is the `EVERSHOP_HOME_URL` environment variable, else the `shop.homeUrl` config value, else `http://localhost:<PORT>` (see [getBaseUrl](/docs/development/module/functions/getbaseurl)).

## Examples

### An image in an email

```typescript
import { getAssetUrl } from '@evershop/evershop/lib/util/getAssetUrl';

getAssetUrl('/assets/catalog/9424/1250/tee.jpg');
// https://shop.com/assets/catalog/9424/1250/tee.jpg

getAssetUrl('https://myshop.blob.core.windows.net/media/catalog/tee.jpg');
// https://myshop.blob.core.windows.net/media/catalog/tee.jpg (as it is)
```

## Notes

- Do not prefix a stored value with `getBaseUrl()` yourself. With cloud storage, that gives a broken URL such as `https://shop.comhttps://bucket.s3…`.
- The URL points to the file itself, served by your storage, so it does not depend on the image allowlist of the `/images` endpoint.
- For a resized copy of an image (a fixed width, another format), use [getImageUrl](/docs/development/module/functions/getimageurl).

## See Also

- [getImageUrl](/docs/development/module/functions/getimageurl) - URL of a resized image
- [getBaseUrl](/docs/development/module/functions/getbaseurl) - The store's base URL
- [getProductUrl](/docs/development/module/functions/getproducturl) - A product's storefront URL
