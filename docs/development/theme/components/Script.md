---
sidebar_position: 32
title: Script
description: A component for adding script tags with validation and helper functions.
keywords:
  - EverShop Script
  - script tags
  - JavaScript
groups:
  - components
---

# Script

## Description

A component for adding script tags to your pages. Supports external scripts, inline scripts, modules, and JSON-LD with validation and sanitization.

## Import

```typescript
import { Script } from '@components/common/Script';
```

## Basic Usage

```tsx
import { Script } from '@components/common/Script';

// External script
<Script src="/path/to/script.js" />

// Inline script
<Script>
  {`console.log('Hello World');`}
</Script>
```

## Script Component Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Prop</th>
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
      <td>External script URL</td>
    </tr>
    <tr>
      <td>async</td>
      <td>boolean</td>
      <td>false</td>
      <td>Load script asynchronously</td>
    </tr>
    <tr>
      <td>defer</td>
      <td>boolean</td>
      <td>false</td>
      <td>Defer script execution</td>
    </tr>
    <tr>
      <td>type</td>
      <td>string</td>
      <td>'text/javascript'</td>
      <td>Script type (module, importmap, etc.)</td>
    </tr>
    <tr>
      <td>crossOrigin</td>
      <td>'anonymous' | 'use-credentials'</td>
      <td>-</td>
      <td>CORS settings</td>
    </tr>
    <tr>
      <td>integrity</td>
      <td>string</td>
      <td>-</td>
      <td>Subresource integrity hash</td>
    </tr>
    <tr>
      <td>nonce</td>
      <td>string</td>
      <td>-</td>
      <td>Content Security Policy nonce</td>
    </tr>
    <tr>
      <td>fetchPriority</td>
      <td>'high' | 'low' | 'auto'</td>
      <td>'auto'</td>
      <td>Resource fetch priority</td>
    </tr>
  </tbody>
</table>

## Helper Components

### ScriptExternal

For loading external JavaScript files:

```tsx
import { ScriptExternal } from '@components/common/Script';

<ScriptExternal 
  src="https://cdn.example.com/script.js" 
  async={true}
/>
```

### ScriptModule

For ES modules:

```tsx
import { ScriptModule } from '@components/common/Script';

// External module
<ScriptModule src="/path/to/module.js" />

// Inline module
<ScriptModule>
  {`import { something } from './module.js';`}
</ScriptModule>
```

### ScriptInline

For inline JavaScript:

```tsx
import { ScriptInline } from '@components/common/Script';

<ScriptInline>
  {`
    console.log('Inline script');
    window.myVar = 'value';
  `}
</ScriptInline>
```

### ScriptJSON

For JSON-LD structured data:

```tsx
import { ScriptJSON } from '@components/common/Script';

<ScriptJSON
  id="product-schema"
  data={{
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Product Name",
    "price": "99.99"
  }}
/>
```

### ScriptImportMap

For import maps:

```tsx
import { ScriptImportMap } from '@components/common/Script';

<ScriptImportMap
  imports={{
    "react": "https://cdn.example.com/react.js",
    "react-dom": "https://cdn.example.com/react-dom.js"
  }}
/>
```

## Examples

### Loading Analytics

```tsx
import { ScriptExternal } from '@components/common/Script';

<ScriptExternal
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  async={true}
/>
```

### Inline Configuration

```tsx
import { ScriptInline } from '@components/common/Script';

<ScriptInline>
  {`
    window.appConfig = {
      apiUrl: '${process.env.API_URL}',
      debug: ${process.env.NODE_ENV === 'development'}
    };
  `}
</ScriptInline>
```

### Product Schema

```tsx
import { ScriptJSON } from '@components/common/Script';

function ProductPage({ product }) {
  return (
    <>
      <ScriptJSON
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.image,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "USD"
          }
        }}
      />
    </>
  );
}
```

### With Integrity Hash

```tsx
import { ScriptExternal } from '@components/common/Script';

<ScriptExternal
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossOrigin="anonymous"
/>
```

## Validation Rules

The component validates in development mode:
- Cannot have both `src` and inline content
- Cannot use both `async` and `defer`
- `async` and `defer` only work with external scripts
- `integrity` requires `src` attribute

## Features

- **Type Safe**: Full TypeScript support
- **Validation**: Development-time prop validation
- **Sanitization**: Automatically sanitizes props
- **Helper Components**: Pre-configured for common patterns
- **CSP Support**: Nonce attribute for Content Security Policy
- **Module Support**: ES module and import map support
- **JSON-LD**: Easy structured data with ScriptJSON

## Related Components

- [Meta](Meta.md) - HTML meta tags component
- [Area](Area.md) - Component container system
