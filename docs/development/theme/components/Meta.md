---
sidebar_position: 31
title: Meta
description: A component for adding HTML meta tags with validation and helper functions.
keywords:
  - EverShop Meta
  - meta tags
  - SEO
groups:
  - components
---

# Meta

## Description

A component for adding HTML meta tags to your pages. Includes validation, sanitization, and helper components for common meta tag types like Open Graph, Twitter Cards, and SEO tags.

## Import

```typescript
import { Meta } from '@components/common/Meta';
```

## Basic Usage

```tsx
import { Meta } from '@components/common/Meta';

function Page() {
  return (
    <>
      <Meta name="description" content="Product description" />
      <Meta name="keywords" content="electronics, gadgets" />
    </>
  );
}
```

## Meta Component Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>Meta name attribute (description, keywords, etc.)</td>
    </tr>
    <tr>
      <td>property</td>
      <td>string</td>
      <td>Meta property attribute (og:title, og:image, etc.)</td>
    </tr>
    <tr>
      <td>content</td>
      <td>string</td>
      <td>Meta content value</td>
    </tr>
    <tr>
      <td>charset</td>
      <td>string</td>
      <td>Character encoding (typically "utf-8")</td>
    </tr>
    <tr>
      <td>httpEquiv</td>
      <td>string</td>
      <td>HTTP equivalent header</td>
    </tr>
    <tr>
      <td>itemProp</td>
      <td>string</td>
      <td>Schema.org microdata property</td>
    </tr>
  </tbody>
</table>

## Helper Components

### MetaDescription

```tsx
import { MetaDescription } from '@components/common/Meta';

<MetaDescription description="A brief description of the page" />
```

### MetaKeywords

```tsx
import { MetaKeywords } from '@components/common/Meta';

<MetaKeywords keywords="electronics, gadgets, tech" />
// or with array
<MetaKeywords keywords={['electronics', 'gadgets', 'tech']} />
```

### MetaViewport

```tsx
import { MetaViewport } from '@components/common/Meta';

<MetaViewport />
// or with custom settings
<MetaViewport width="device-width" initialScale={1} />
```

### MetaOpenGraph

```tsx
import { MetaOpenGraph } from '@components/common/Meta';

<MetaOpenGraph
  type="product"
  title="Product Name"
  description="Product description"
  image="https://example.com/image.jpg"
  url="https://example.com/product"
  siteName="My Store"
/>
```

### MetaTwitterCard

```tsx
import { MetaTwitterCard } from '@components/common/Meta';

<MetaTwitterCard
  card="summary_large_image"
  site="@mystore"
  title="Product Name"
  description="Product description"
  image="https://example.com/image.jpg"
/>
```

### MetaRobots

```tsx
import { MetaRobots } from '@components/common/Meta';

<MetaRobots index={true} follow={true} />
// or prevent indexing
<MetaRobots index={false} follow={false} />
```

## Complete Example

```tsx
import {
  MetaDescription,
  MetaKeywords,
  MetaOpenGraph,
  MetaTwitterCard,
  MetaRobots
} from '@components/common/Meta';

function ProductPage({ product }) {
  return (
    <>
      <MetaDescription description={product.description} />
      <MetaKeywords keywords={product.keywords} />
      
      <MetaOpenGraph
        type="product"
        title={product.name}
        description={product.description}
        image={product.image}
        url={`https://example.com/products/${product.slug}`}
        siteName="My Store"
      />
      
      <MetaTwitterCard
        card="summary_large_image"
        title={product.name}
        description={product.description}
        image={product.image}
      />
      
      <MetaRobots index={true} follow={true} />
    </>
  );
}
```

## Validation

The component validates props in development mode:
- Requires at least one identifier (name, property, charset, etc.)
- Validates that required attributes have content
- Checks for conflicting attributes
- Warns about invalid values

## Features

- **Type Safe**: Full TypeScript support with strict types
- **Validation**: Development-time validation of props
- **Sanitization**: Automatically sanitizes and trims values
- **Helper Components**: Pre-configured helpers for common tags
- **SEO Ready**: Supports Open Graph, Twitter Cards, and robots
- **Schema.org**: Support for microdata via itemProp

## Related Components

- [Area](Area.md) - Component container system
