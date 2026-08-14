---
sidebar_position: 26
keywords:
  - product images
  - image sizing
  - aspect ratio
  - srcset
  - useCatalogImageDimensions
  - deriveProductImageSize
sidebar_label: Images
title: Images And Product Image Sizing
description: How EverShop 2.2.1 derives storefront image dimensions from the store's configured catalog aspect ratio, and what a theme must do differently.
---

# Images And Product Image Sizing

EverShop **2.2.1** changed how storefront product images are sized. Before, each placement carried hardcoded `width` / `height` numbers. Now the **store** owns the aspect ratio and the resolution ceiling, and each placement only chooses a target width — the height is derived.

If your theme passes hardcoded dimensions into product-image components, it is fighting that system: your images will not match the store's configured proportions, and on a store whose original images are not square they will be visibly distorted or cropped inconsistently against core's.

:::danger `ProductList`'s `imageHeight` prop was removed

`ProductList` no longer accepts `imageHeight`. Height is derived from the store's configured aspect ratio. The prop is gone — not deprecated — so a theme still passing it is passing an unknown prop that is silently dropped.

`imageWidth` survives as an **optional base-width override**. In almost every case you should omit it too and let the per-layout defaults apply.
:::

## Where the ratio comes from

The reference aspect ratio and the maximum resolution both come from the **admin Catalog setting** — the "original product image size" a merchant configures for their store.

Server-side, `getProductImageDimensions()` reads the `catalogProductImageWidth` / `catalogProductImageHeight` settings, falling back to the `catalog.product.image.width` / `catalog.product.image.height` config values, then to `1200 × 1200`. The result is injected into the app context on every render as `config.catalog.imageDimensions`.

Client-side, a theme reads it with one hook.

## `useCatalogImageDimensions()`

```tsx
import { useCatalogImageDimensions } from '@components/common/useCatalogImageDimensions.js';

const dimensions = useCatalogImageDimensions();
```

Returns `{ width: number, height: number }` — the store's configured original product image size. Falls back to `{ width: 1200, height: 1200 }` when the value is absent or either dimension is not positive.

This is the store's *original* size. It is never the size you render at; it is the shape you render *in*, and the ceiling you must not exceed.

## `deriveProductImageSize(baseWidth, dimensions)`

```tsx
import { deriveProductImageSize } from '@evershop/evershop/lib/util/deriveProductImageSize';

const { width, height } = deriveProductImageSize(800, dimensions);
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>baseWidth</code></td>
      <td>number</td>
      <td>The placement's target width in pixels — roughly 2× the CSS display width (see below).</td>
    </tr>
    <tr>
      <td><code>original</code></td>
      <td><code>{'{ width?, height? }'}</code> | null | undefined</td>
      <td>The store's original size, i.e. whatever <code>useCatalogImageDimensions()</code> returned.</td>
    </tr>
  </tbody>
</table>

What it does:

- **Clamps `width` to `original.width`** — never request more than the store actually has. No upscaling.
- **Derives `height`** from the original aspect ratio: `round(width × original.height / original.width)`, floored at `1`.
- **Falls back to a square** at `baseWidth` when the original is missing or non-positive.

Pair the two, always:

```tsx
import { useCatalogImageDimensions } from '@components/common/useCatalogImageDimensions.js';
import { Image } from '@components/common/Image.js';
import { deriveProductImageSize } from '@evershop/evershop/lib/util/deriveProductImageSize';

export function ProductTile({ product }) {
  const { width, height } = deriveProductImageSize(
    800,
    useCatalogImageDimensions()
  );

  return (
    <Image
      src={product.image.url}
      alt={product.image.alt || product.name}
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, 33vw"
      loading="lazy"
    />
  );
}
```

## Choosing `baseWidth`: roughly 2× the CSS display width

`baseWidth` is a **rendering** decision, not a layout one. CSS still controls how large the image appears; `width` / `height` only tell the browser the intrinsic size, drive the aspect-ratio box, and set the ceiling for the generated `srcset`.

The rule core follows: **pick about twice the widest CSS size the image will ever display at**, so a DPR-2 (retina) screen has a sharp candidate to pick from. The `<Image>` srcset covers everything below that.

These are the defaults core uses today:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Placement</th>
      <th><code>baseWidth</code></th>
      <th>Component</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Product list — <code>grid</code> layout</td>
      <td><code>800</code></td>
      <td><code>ProductList</code></td>
    </tr>
    <tr>
      <td>Product list — <code>list</code> layout</td>
      <td><code>320</code></td>
      <td><code>ProductList</code></td>
    </tr>
    <tr>
      <td>Product detail — main image</td>
      <td><code>1280</code></td>
      <td><code>Media</code></td>
    </tr>
    <tr>
      <td>Product detail — gallery thumbnails</td>
      <td><code>200</code></td>
      <td><code>Media</code></td>
    </tr>
    <tr>
      <td>Product detail — fullscreen view</td>
      <td><code>1920</code></td>
      <td><code>Media</code></td>
    </tr>
    <tr>
      <td>Cart, checkout and order-summary thumbnails</td>
      <td><code>200</code></td>
      <td><code>DefaultCartItemList</code>, <code>CartSummaryItems</code>, <code>OrderSummaryItems</code></td>
    </tr>
  </tbody>
</table>

If your theme renders product cards much larger or much smaller than core's, change the `baseWidth` — not the height.

## What `<Image>` does with those numbers

[`<Image>`](./components/Image.md) turns `src` + `width` into a `/images` proxy URL plus a responsive `srcset`:

```html
<img
  src="/images?src=%2Fassets%2Fshirt.jpg&w=800&q=75"
  srcset="/images?src=%2Fassets%2Fshirt.jpg&w=400&q=75 400w,
          /images?src=%2Fassets%2Fshirt.jpg&w=600&q=75 600w,
          /images?src=%2Fassets%2Fshirt.jpg&w=800&q=75 800w"
  sizes="(max-width: 768px) 100vw, 33vw"
  width="800"
  height="800"
/>
```

The candidate list is built by `buildImageSrcSet`, which is exported so art-directed `<picture>` sources can serve the same resized candidates:

```tsx
import { buildImageSrcSet } from '@components/common/Image.js';

const srcSet = buildImageSrcSet(src, width, sizes, quality);
```

Its rules: parse the breakpoints out of `sizes`, drop anything above `width × 3`, and — if fewer than two candidates survive — synthesize 50% and 75% of `width` (never below 200px). The intrinsic `width` is always included, and the list is deduplicated and sorted ascending.

The `/images` endpoint is a storefront route that resizes on demand from `src`, `w` and `q` (quality, default `75`).

`<Image>` also stamps three inline styles: `maxWidth: 100%`, `height: auto`, and — the important one — `aspectRatio: "<width> / <height>"`.

## The `aspectRatio: 'auto'` escape hatch

Because the ratio is inline, it beats Tailwind height classes and any stylesheet rule. That is deliberate: catalog grids depend on the hard lock for uniform tiles.

When you need an image to fill a container whose shape you control — a hero band, a bento cell, a mosaic tile — clear it through the `style` prop:

```tsx
<Image
  src={image.url}
  alt={alt}
  width={1800}
  height={1029}
  objectFit="cover"
  className="absolute inset-0 h-full w-full"
  style={{ height: '100%', width: '100%', aspectRatio: 'auto' }}
/>
```

Core uses exactly this in `CategoryInfo` (the category hero), `BentoGrid`, `Section`, `BrandStory`, `CategoryMosaic`, `TieredCategories`, `TrustStrip` and `CollectionSpotlight`.

:::note Do not "fix" this in `<Image>` itself
A theme that overrides `@components/common/Image.js` to drop the inline ratio globally will break every catalog grid at once, since the uniform-box behaviour is what the ratio lock exists for. Clear it per call site.
:::

For art-directed `<picture>` markup (a portrait mobile asset swapped for a landscape desktop one), the inline ratio must go entirely — pass `aspectRatio: undefined` and put real `width` / `height` attributes on each `<source>` so the browser derives the box from the matched source. Core's `Slideshow` widget does this.

## Migrating a theme to 2.2.1

1. **Remove `imageHeight` from every `<ProductList>` usage.** It is no longer a prop.
2. **Remove `imageWidth` too**, unless your tiles are genuinely a different size from core's — then set it to about 2× your CSS width.
3. **Audit any forked product card, gallery or cart-item component** for hardcoded `width={…} height={…}` on product images, and replace them with `deriveProductImageSize(baseWidth, useCatalogImageDimensions())`.
4. **Check non-square stores.** Set the admin Catalog original image size to something like `1200 × 1600` and reload your listing, PDP, cart and checkout. Any placement still rendering a square box is one you missed.
5. **Leave non-product images alone.** Banner, slideshow and CMS widget images carry their own stored dimensions; this system is specific to catalog imagery.

Before:

```tsx
<ProductList products={products} imageWidth={720} imageHeight={720} />
```

After:

```tsx
<ProductList products={products} />
```

## See also

- [Image](./components/Image.md) — the component reference: props, srcset, loading strategies
- [ProductList](./components/ProductList.md) — the listing component
- [Templating](./templating.md) — overriding and extending core components
- [Upgrading To React 19](/blog/upgrading-to-react-19) — the other breaking changes in the 2.2.x line

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
