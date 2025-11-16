---
sidebar_position: 27
title: Image
description: An optimized image component with automatic responsive srcset generation and lazy loading support.
hide_table_of_contents: false
keywords:
  - EverShop Image
  - responsive images
  - image optimization
  - lazy loading
groups:
  - components
---

# Image

## Description

An optimized image component that automatically generates responsive image srcsets, handles lazy loading, and integrates with EverShop's image API for on-the-fly resizing and optimization. Provides better performance and user experience with minimal configuration.

## Import

```typescript
import { Image } from '@components/common/Image';
```

## Usage

```tsx
import { Image } from '@components/common/Image';

function ProductCard() {
  return (
    <Image
      src="/media/catalog/product.jpg"
      width={800}
      height={600}
      alt="Product name"
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
      <td>src</td>
      <td>string</td>
      <td>-</td>
      <td>Image source path (required)</td>
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
      <td>decoding</td>
      <td>'async' | 'auto' | 'sync'</td>
      <td>'async'</td>
      <td>Image decoding strategy</td>
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
    <tr>
      <td>objectFit</td>
      <td>'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'unset'</td>
      <td>'unset'</td>
      <td>CSS object-fit property</td>
    </tr>
    <tr>
      <td>style</td>
      <td>React.CSSProperties</td>
      <td>-</td>
      <td>Additional inline styles</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class name</td>
    </tr>
  </tbody>
</table>

## Example: Product Image

```tsx
import { Image } from '@components/common/Image';

function ProductImage({ product }) {
  return (
    <Image
      src={product.image}
      width={800}
      height={800}
      alt={product.name}
      quality={85}
      objectFit="cover"
    />
  );
}
```

## Example: Lazy Loading

```tsx
import { Image } from '@components/common/Image';

function ProductGallery({ products }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product, index) => (
        <Image
          key={product.id}
          src={product.image}
          width={400}
          height={400}
          alt={product.name}
          loading={index < 6 ? 'eager' : 'lazy'}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ))}
    </div>
  );
}
```

## Example: Hero Banner with Priority

```tsx
import { Image } from '@components/common/Image';

function HeroBanner() {
  return (
    <div className="hero">
      <Image
        src="/media/banner/hero.jpg"
        width={1920}
        height={600}
        alt="Welcome banner"
        priority={true}
        loading="eager"
        objectFit="cover"
        sizes="100vw"
        quality={90}
      />
    </div>
  );
}
```

## Example: Responsive Sizes

```tsx
import { Image } from '@components/common/Image';

function ResponsiveImage() {
  return (
    <Image
      src="/media/product/item.jpg"
      width={1200}
      height={800}
      alt="Product"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      loading="lazy"
    />
  );
}
```

## Example: Thumbnail with Cover

```tsx
import { Image } from '@components/common/Image';

function Thumbnail({ src, alt }) {
  return (
    <div className="w-24 h-24">
      <Image
        src={src}
        width={200}
        height={200}
        alt={alt}
        objectFit="cover"
        quality={70}
        className="rounded-lg"
      />
    </div>
  );
}
```

## Automatic Srcset Generation

The component automatically generates a responsive srcset based on:

1. **Parsed sizes**: Extracts size breakpoints from the `sizes` prop
2. **Smart filtering**: Only includes sizes up to 3x the original width
3. **Fallback sizes**: Adds 50% and 75% of original width if needed
4. **Minimum size**: Filters out sizes below 200px
5. **Original width**: Always includes the original width

Example generated srcset:
```html
<img
  srcset="
    /images?src=product.jpg&w=400&q=75 400w,
    /images?src=product.jpg&w=600&q=75 600w,
    /images?src=product.jpg&w=800&q=75 800w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  src="/images?src=product.jpg&w=800&q=75"
/>
```

## Image API Integration

The component uses EverShop's image API endpoint:
```
/images?src={path}&w={width}&q={quality}
```

Parameters:
- **src**: Encoded image path
- **w**: Target width in pixels
- **q**: Quality (0-100)

The API automatically:
- Resizes images on-demand
- Optimizes file size
- Caches processed images
- Serves appropriate format

## Sizes Attribute

The `sizes` attribute tells the browser how much space the image will occupy:

```tsx
// Full width on mobile, half width on tablet, third on desktop
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

// Fixed width
sizes="400px"

// Full viewport width
sizes="100vw"
```

## Loading Strategies

### Eager Loading
```tsx
<Image loading="eager" />
```
- Loads immediately
- Use for above-the-fold images
- Best for hero images, logos

### Lazy Loading
```tsx
<Image loading="lazy" />
```
- Loads when near viewport
- Use for below-the-fold images
- Improves initial page load

## Priority Flag

Set `priority={true}` for critical images:
```tsx
<Image priority={true} loading="eager" />
```

This adds `itemProp="preload"` to help optimize loading of important images.

## Object Fit Options

Control how images fill their container:

- **contain**: Image scaled to fit, maintaining aspect ratio
- **cover**: Image fills container, may crop edges
- **fill**: Image stretched to fill container
- **none**: Original size, may overflow
- **scale-down**: Smaller of contain or none
- **unset**: Default browser behavior

```tsx
<Image objectFit="cover" /> // Fills container, crops overflow
<Image objectFit="contain" /> // Fits inside, shows all image
```

## Responsive Behavior

The component includes automatic responsive styling:

```css
{
  maxWidth: '100%',      // Never exceed container
  height: 'auto',        // Maintain aspect ratio
  aspectRatio: 'w / h'   // Modern aspect ratio
}
```

This ensures images are always responsive without additional CSS.

## Quality Guidelines

Recommended quality values:

- **90-100**: Hero images, feature photos
- **80-90**: Product detail images
- **70-80**: Product listing images
- **60-70**: Thumbnails, avatars
- **40-60**: Background patterns

Lower quality = smaller file size = faster loading.

## Performance Best Practices

1. **Use Lazy Loading**: Set `loading="lazy"` for below-fold images
2. **Optimize Quality**: Use appropriate quality for image purpose
3. **Set Correct Sizes**: Provide accurate sizes attribute for better srcset selection
4. **Prioritize Critical Images**: Use `priority={true}` for above-fold images
5. **Specify Dimensions**: Always provide width and height to prevent layout shift

## Accessibility

Always provide meaningful `alt` text:

```tsx
// Good
<Image alt="Red cotton t-shirt, front view" />

// Avoid
<Image alt="image1" />
<Image alt="" /> // Only for decorative images
```

## TypeScript Support

The component is fully typed and extends `React.ImgHTMLAttributes<HTMLImageElement>`, so all standard img attributes are supported:

```tsx
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Description"
  className="rounded-lg"
  onClick={handleClick}
  data-testid="product-image"
/>
```

## Features

- **Automatic Srcset**: Generates responsive image sources
- **Lazy Loading**: Native browser lazy loading support
- **Image Optimization**: Integration with image API
- **Aspect Ratio**: Automatic aspect ratio calculation
- **Quality Control**: Configurable compression quality
- **Object Fit**: CSS object-fit support
- **Priority Loading**: Preload critical images
- **Type Safe**: Full TypeScript support
- **Accessible**: Requires alt text
- **Responsive**: Auto-scales to container

## Related Components

- [Area](Area.md) - Component container system
- [AppProvider](AppProvider.md) - App context provider
