---
sidebar_position: 2
title: useAppState
description: A React hook that provides access to the global application state.
keywords:
  - EverShop useAppState
  - app context hook
  - React hook
groups:
  - contexts
---

# useAppState

## Description

A React hook that provides access to the global application state. Returns the current application context including GraphQL response data, configuration, props map, widgets, and fetching state.

## Import

```typescript
import { useAppState } from '@components/common/context/app';
```

## Usage

```tsx
import { useAppState } from '@components/common/context/app';

function ProductList() {
  const { graphqlResponse, config, fetching } = useAppState();
  
  const products = graphqlResponse.products || [];
  
  if (fetching) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Return Value

Returns an `AppStateContextValue` object with the following properties:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>graphqlResponse</code></td>
      <td><code>Record&lt;string, any&gt;</code></td>
      <td>The GraphQL response data for the current page.</td>
    </tr>
    <tr>
      <td><code>config</code></td>
      <td><code>Config</code></td>
      <td>Application configuration including page meta, tax settings, and catalog settings.</td>
    </tr>
    <tr>
      <td><code>propsMap</code></td>
      <td><code>Record&lt;string, any[]&gt;</code></td>
      <td>Map of component props organized by component ID.</td>
    </tr>
    <tr>
      <td><code>widgets</code></td>
      <td><code>any[]</code></td>
      <td>Array of widget configurations (optional).</td>
    </tr>
    <tr>
      <td><code>fetching</code></td>
      <td><code>boolean</code></td>
      <td>Whether page data is currently being fetched.</td>
    </tr>
  </tbody>
</table>

## Config Type

```typescript
interface Config {
  pageMeta: PageMetaInfo;
  tax: {
    priceIncludingTax: boolean;
  };
  catalog: {
    imageDimensions: { width: number; height: number };
  };
}
```

## Example: Using Configuration

```tsx
import { useAppState } from '@components/common/context/app';

function ProductPrice({ price }) {
  const { config } = useAppState();
  const priceIncludesTax = config.tax.priceIncludingTax;
  
  return (
    <div className="product-price">
      <span className="amount">${price}</span>
      <span className="tax-info">
        {priceIncludesTax ? '(incl. tax)' : '(excl. tax)'}
      </span>
    </div>
  );
}
```

## Related

- [AppProvider](AppProvider.md) - The provider component that wraps the application
- [useAppDispatch](useAppDispatch.md) - Hook to access methods for updating the state
