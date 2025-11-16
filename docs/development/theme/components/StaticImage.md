---
sidebar_position: 28
title: StaticImage
description: A wrapper component for rendering static images from the theme or public assets folder.
hide_table_of_contents: true
keywords:
  - EverShop StaticImage
  - static assets
  - theme images
groups:
  - components
---

# StaticImage

## Description

A wrapper around the Image component specifically designed for rendering static images from your theme's public folder or the application's public assets. Automatically resolves the correct path based on the active theme and base URL.

## Import

```typescript
import { StaticImage } from '@components/common/StaticImage';
```

## Usage

```tsx
import { StaticImage } from '@components/common/StaticImage';

function Logo() {
  return (
    <StaticImage
      subPath="logo.png"
      width={200}
      height={60}
      alt="Company Logo"
    />
  );
}
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>subPath</td>
      <td>string</td>
      <td>-</td>
      <td>Path relative to /assets/ folder (required)</td>
    </tr>
    <tr>
      <td>width</td>
      <td>number</td>
      <td>-</td>
      <td>Intrinsic width of the image (required)</td>
    </tr>
    <tr>
      <td>height</td>
      <td>number</td>
      <td>-</td>
      <td>Intrinsic height of the image (required)</td>
    </tr>
    <tr>
      <td>alt</td>
      <td>string</td>
      <td>-</td>
      <td>Alternative text for accessibility (required)</td>
    </tr>
    <tr>
      <td>quality</td>
      <td>number</td>
      <td>75</td>
      <td>Image quality (0-100)</td>
    </tr>
    <tr>
      <td>loading</td>
      <td>'eager' | 'lazy'</td>
      <td>'eager'</td>
      <td>Loading strategy</td>
    </tr>
    <tr>
      <td>objectFit</td>
      <td>'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'unset'</td>
      <td>'unset'</td>
      <td>CSS object-fit property</td>
    </tr>
    <tr>
      <td>priority</td>
      <td>boolean</td>
      <td>false</td>
      <td>Marks image for preloading</td>
    </tr>
    <tr>
      <td>sizes</td>
      <td>string</td>
      <td>'100vw'</td>
      <td>Responsive sizes attribute</td>
    </tr>
  </tbody>
</table>

All other props from the [Image](Image.md) component are also supported.

## Example: Logo

```tsx
import { StaticImage } from '@components/common/StaticImage';

function Header() {
  return (
    <header>
      <StaticImage
        subPath="logo.svg"
        width={180}
        height={50}
        alt="EverShop Logo"
        priority={true}
      />
    </header>
  );
}
```

## Example: Theme Icon

```tsx
import { StaticImage } from '@components/common/StaticImage';

function SocialLinks() {
  return (
    <div className="social-icons">
      <a href="https://facebook.com">
        <StaticImage
          subPath="icons/facebook.svg"
          width={32}
          height={32}
          alt="Facebook"
        />
      </a>
      <a href="https://twitter.com">
        <StaticImage
          subPath="icons/twitter.svg"
          width={32}
          height={32}
          alt="Twitter"
        />
      </a>
    </div>
  );
}
```

## Example: Banner Image

```tsx
import { StaticImage } from '@components/common/StaticImage';

function PromoBanner() {
  return (
    <div className="promo-banner">
      <StaticImage
        subPath="banners/summer-sale.jpg"
        width={1200}
        height={400}
        alt="Summer Sale - Up to 50% Off"
        quality={85}
        objectFit="cover"
        sizes="100vw"
      />
    </div>
  );
}
```

## Example: Placeholder Image

```tsx
import { StaticImage } from '@components/common/StaticImage';

function ProductPlaceholder() {
  return (
    <StaticImage
      subPath="placeholder/product.png"
      width={400}
      height={400}
      alt="Product image placeholder"
      loading="lazy"
    />
  );
}
```

## Example: Background Pattern

```tsx
import { StaticImage } from '@components/common/StaticImage';

function DecorativeSection() {
  return (
    <div className="relative">
      <StaticImage
        subPath="patterns/dots.svg"
        width={800}
        height={600}
        alt=""
        quality={60}
        className="absolute inset-0 opacity-10"
      />
      <div className="relative z-10">
        <h2>Content here</h2>
      </div>
    </div>
  );
}
```

## File Organization

Place static images in your theme's public folder:

```
themes/
  your-theme/
    public/
      logo.png
      icons/
        facebook.svg
        twitter.svg
      banners/
        hero.jpg
      patterns/
        dots.svg
      placeholder/
        product.png
        
```

Then reference them with `subPath`:
```tsx
<StaticImage subPath="logo.png" />
<StaticImage subPath="icons/facebook.svg" />
<StaticImage subPath="banners/hero.jpg" />
```

## See Also

- [Static Assets Management](/docs/development/knowledge-base/static-file-serving) - Guide on managing static assets

## Related Components

- [Image](Image.md) - Base image component with optimization
- [Area](Area.md) - Component container system
- [useAppState](useAppState.md) - Access app context data
