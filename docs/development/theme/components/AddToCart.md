---
sidebar_position: 34
title: AddToCart
description: A headless render props component that provides add-to-cart logic without rendering any UI.
keywords:
  - EverShop AddToCart
  - add to cart
  - shopping cart
  - headless component
  - theme development
groups:
  - components
---

# AddToCart

## Description

A headless render props component that provides state and actions for adding products to the cart. It handles cart dispatch, stock validation, loading states, and error management — but renders no UI of its own.

## Role in Theming

AddToCart is one of EverShop's **headless components** — it owns the business logic while leaving all UI decisions to its parent. This design exists specifically for theme development:

- **AddToCart renders nothing.** It returns only what its `children` function renders.
- **Theme developers do not override AddToCart.** Instead, they override the parent components that consume it (`ProductSingleForm`, `ProductListItemRender`).
- **The logic stays stable across themes.** Cart dispatch, stock checks, error handling, and loading state management are encapsulated in AddToCart. Theme changes cannot break cart behavior.

This creates a clean boundary:

```
┌──────────────────────────────────────────────────┐
│  Theme layer (what you override)                 │
│  ProductSingleForm / ProductListItemRender       │
│  — layout, styling, animations, custom UI        │
├──────────────────────────────────────────────────┤
│  Core layer (stable contract)                    │
│  AddToCart                                       │
│  — cart dispatch, validation, error handling      │
└──────────────────────────────────────────────────┘
```

## Theme Override Points

AddToCart is consumed by these components, which are the actual override targets for theme developers:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parent Component</th>
      <th>Route</th>
      <th>Override Path in Theme</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ProductSingleForm</td>
      <td>productView</td>
      <td><code>themes/&lt;name&gt;/src/pages/productView/ProductSingleForm.tsx</code></td>
    </tr>
    <tr>
      <td>ProductListItemRender</td>
      <td>categoryView, catalogSearch</td>
      <td><code>themes/&lt;name&gt;/src/pages/categoryView/ProductListItemRender.tsx</code></td>
    </tr>
  </tbody>
</table>

## Import

```typescript
import { AddToCart } from '@components/frontStore/cart/AddToCart';
```

## Usage

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function ProductButton({ product }) {
  return (
    <AddToCart product={product} qty={1}>
      {(state, actions) => (
        <button
          onClick={actions.addToCart}
          disabled={!state.canAddToCart || state.isLoading}
        >
          {state.isLoading ? 'Adding...' : 'Add to Cart'}
        </button>
      )}
    </AddToCart>
  );
}
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>product</td>
      <td>ProductInfo</td>
      <td>Yes</td>
      <td>Product information (sku, isInStock)</td>
    </tr>
    <tr>
      <td>qty</td>
      <td>number</td>
      <td>Yes</td>
      <td>Quantity to add</td>
    </tr>
    <tr>
      <td>onSuccess</td>
      <td>(qty: number) =&gt; void</td>
      <td>No</td>
      <td>Callback on successful add</td>
    </tr>
    <tr>
      <td>onError</td>
      <td>(error: string) =&gt; void</td>
      <td>No</td>
      <td>Callback on error</td>
    </tr>
    <tr>
      <td>children</td>
      <td>(state: AddToCartState, actions: AddToCartActions) =&gt; ReactNode</td>
      <td>Yes</td>
      <td>Render function receiving state and actions</td>
    </tr>
  </tbody>
</table>

## ProductInfo Interface

```typescript
interface ProductInfo {
  sku: string;        // Product SKU
  isInStock: boolean; // Stock availability
}
```

## State Object

The render function receives a state object:

```typescript
interface AddToCartState {
  isLoading: boolean;      // True when adding to cart
  error: string | null;    // Error message if any
  canAddToCart: boolean;    // True if product can be added
  isInStock: boolean;       // Stock availability
}
```

## Actions Object

The render function receives an actions object:

```typescript
interface AddToCartActions {
  addToCart: () => Promise<void>;  // Add product to cart
  clearError: () => void;           // Clear error state
}
```

## Examples

### Basic Button

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function BuyButton({ product }) {
  return (
    <AddToCart product={product} qty={1}>
      {(state, actions) => (
        <button
          onClick={actions.addToCart}
          disabled={!state.canAddToCart || state.isLoading}
        >
          {state.isLoading ? 'Adding...' : 'Add to Cart'}
        </button>
      )}
    </AddToCart>
  );
}
```

### With Error Display and Callbacks

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function ProductAddToCart({ product }) {
  const handleSuccess = (qty) => {
    // Show toast notification
  };

  const handleError = (error) => {
    // Show error notification
  };

  return (
    <AddToCart
      product={product}
      qty={1}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {(state, actions) => (
        <div>
          <button
            onClick={actions.addToCart}
            disabled={!state.canAddToCart || state.isLoading}
          >
            {state.isLoading ? 'Adding...' : 'Add to Cart'}
          </button>

          {state.error && (
            <div className="error">
              {state.error}
              <button onClick={actions.clearError}>Dismiss</button>
            </div>
          )}

          {!state.isInStock && (
            <p className="out-of-stock">Out of Stock</p>
          )}
        </div>
      )}
    </AddToCart>
  );
}
```

### Theme Override Example

A theme developer overrides `ProductSingleForm` to provide a completely custom add-to-cart experience. Create this file in your theme:

**`themes/my-theme/src/pages/productView/ProductSingleForm.tsx`**

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';
import { useState } from 'react';

function ProductSingleForm({ product }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="my-theme-product-form">
      <div className="quantity-picker">
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
        <span>{qty}</span>
        <button onClick={() => setQty(qty + 1)}>+</button>
      </div>

      <AddToCart
        product={{ sku: product.sku, isInStock: product.inventory.isInStock }}
        qty={qty}
        onSuccess={() => {
          // Custom success animation
        }}
      >
        {(state, actions) => (
          <button
            className="my-theme-add-btn"
            onClick={actions.addToCart}
            disabled={!state.canAddToCart || state.isLoading}
          >
            {state.isLoading && <span className="spinner" />}
            {!state.isLoading && state.isInStock && 'Add to Cart'}
            {!state.isInStock && 'Sold Out'}
          </button>
        )}
      </AddToCart>
    </div>
  );
}

export default ProductSingleForm;

export const layout = {
  areaId: 'productPageMiddleRight',
  sortOrder: 30
};
```

The theme version completely replaces the core `ProductSingleForm` UI, but reuses AddToCart for all cart logic.

## Features

- **Headless**: Renders no UI — full control via render props
- **Loading State**: Automatic loading state management
- **Error Handling**: Built-in error management with clearError action
- **Validation**: Checks stock availability and quantity
- **Callbacks**: onSuccess and onError hooks for parent composition
- **Type Safe**: Full TypeScript support
- **Cart Integration**: Uses CartContext automatically

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
- [CartItems](CartItems.md) - Cart items display component
- [Coupon](Coupon.md) - Coupon management component

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
