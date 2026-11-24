---
slug: getimageurl
sidebar_position: 147
keywords:
- getImageUrl
- image URL
- resize image
- og:image
- email image
groups:
- utilities
sidebar_label: getImageUrl
title: getImageUrl
description: Get the absolute URL of a resized image, served by the store's image endpoint.
---

# getImageUrl

Returns the absolute URL of a resized copy of an image, served by the store's image endpoint `/images`. Use it where an image must have a fixed size or format and an absolute URL: emails, social sharing tags (`og:image`) and feeds.

The endpoint reads the image (from local storage, or from the full URL of a cloud storage), resizes it, converts it and caches the result.

:::caution A full URL is fetched only from an allowed host
For a full URL, the endpoint fetches only from a host on the image allowlist. The S3, Google Cloud Storage and Azure hosts of your storage settings are allowed automatically. Any other host (Cloudinary, a CDN, a storage extension) must be added with `IMAGE_ALLOWED_HOSTS` or `registerAllowedImageHostsProvider`, or the endpoint answers 404. See [The `/images` proxy allowlist](/docs/development/knowledge-base/file-storage#the-images-proxy-allowlist). To use the original file without the endpoint, use [getAssetUrl](/docs/development/module/functions/getasseturl).
:::

## Import

```typescript
import { getImageUrl } from '@evershop/evershop/lib/util/getImageUrl';
```

## Syntax

```typescript
getImageUrl(
  src: string,
  options: {
    width: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
  }
): string
```

### Parameters

**`src`**

**Type:** `string`

The image's stored value, as it is: a site-relative path (local storage) or a full URL (any other storage, from an allowed host). Do not add the base URL to it.

**`options`**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>width</code></td>
      <td><code>number</code></td>
      <td>Required. The width in pixels.</td>
    </tr>
    <tr>
      <td><code>height</code></td>
      <td><code>number</code></td>
      <td>Optional. With it, the image is scaled to fit inside width × height and padded to exactly that size: transparent for <code>png</code>, <code>webp</code> and <code>avif</code>, black for <code>jpeg</code>. Without it, only the width is set and there is no padding.</td>
    </tr>
    <tr>
      <td><code>quality</code></td>
      <td><code>number</code></td>
      <td>Optional, 1 to 100. The endpoint's default is 75.</td>
    </tr>
    <tr>
      <td><code>format</code></td>
      <td><code>string</code></td>
      <td>Optional: <code>jpeg</code>, <code>png</code>, <code>webp</code> or <code>avif</code>. The endpoint's default is <code>webp</code>. Use <code>png</code> or <code>jpeg</code> in emails, because some email clients do not show WebP or AVIF.</td>
    </tr>
  </tbody>
</table>

## Return Value

The absolute URL, for example `https://shop.com/images?src=%2Fassets%2Fcatalog%2Ftee.jpg&w=1200&q=80&h=675&f=png`.

The parameters always come in the same order, so one image with the same options always gets the same URL. An option that is `undefined` or `null` is left out. The URL does not depend on the loaded routes, so it works in any process (the web app, subscribers, cron jobs, scripts).

## Examples

### A social sharing image

`origin_image` is the stored value of a row in the `product_image` table. With GraphQL data, use `product.image.url`.

```typescript
import { getImageUrl } from '@evershop/evershop/lib/util/getImageUrl';

const image = getImageUrl(productImage.origin_image, {
  width: 1200,
  height: 675,
  quality: 80,
  format: 'png'
});
```

### A logo in an email

```typescript
import { getImageUrl } from '@evershop/evershop/lib/util/getImageUrl';

const logoSrc = getImageUrl(logo, { width: 400, quality: 85, format: 'png' });
```

## Notes

- In a React component, build the relative URL (`/images?src=…`), or use the `Image` component. `getImageUrl` reads the server configuration, so it cannot run in the browser.
- For the original file without resizing, use [getAssetUrl](/docs/development/module/functions/getasseturl).

## See Also

- [getAssetUrl](/docs/development/module/functions/getasseturl) - Absolute URL of a stored file
- [getBaseUrl](/docs/development/module/functions/getbaseurl) - The store's base URL
