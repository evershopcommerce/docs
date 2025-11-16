---
sidebar_position: 34
title: AddToCart
description: A render props component for adding products to the shopping cart.
keywords:
  - EverShop AddToCart
  - add to cart
  - shopping cart
groups:
  - components
---

# AddToCart

## Description

A render props component that provides state and actions for adding products to the cart. Handles loading states, validation, and error management.

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
      <td>RenderFunction</td>
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
  canAddToCart: boolean;   // True if product can be added
  isInStock: boolean;      // Stock availability
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

### With Error Display

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function ProductAddToCart({ product }) {
  return (
    <AddToCart product={product} qty={1}>
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
              <button onClick={actions.clearError}>×</button>
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

### With Quantity Selector

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';
import { useState } from 'react';

function ProductQuantityAdd({ product }) {
  const [qty, setQty] = useState(1);

  return (
    <div>
      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value))}
      />
      
      <AddToCart product={product} qty={qty}>
        {(state, actions) => (
          <button
            onClick={actions.addToCart}
            disabled={!state.canAddToCart || state.isLoading}
          >
            {state.isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </AddToCart>
    </div>
  );
}
```

### With Callbacks

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function ProductCard({ product }) {
  const handleSuccess = (qty) => {
    console.log(`Added ${qty} items to cart`);
    // Show toast notification
  };

  const handleError = (error) => {
    console.error('Failed to add to cart:', error);
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
        <button
          onClick={actions.addToCart}
          disabled={!state.canAddToCart || state.isLoading}
        >
          Add to Cart
        </button>
      )}
    </AddToCart>
  );
}
```

### Complete Example

```tsx
import { AddToCart } from '@components/frontStore/cart/AddToCart';
import { useState } from 'react';

function ProductDetail({ product }) {
  const [qty, setQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="product">
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      
      <div className="quantity-selector">
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value) || 1)}
          min="1"
        />
        <button onClick={() => setQty(qty + 1)}>+</button>
      </div>
      
      <AddToCart
        product={{ sku: product.sku, isInStock: product.inStock }}
        qty={qty}
        onSuccess={(addedQty) => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }}
      >
        {(state, actions) => (
          <div>
            <button
              className="add-to-cart-btn"
              onClick={actions.addToCart}
              disabled={!state.canAddToCart || state.isLoading}
            >
              {state.isLoading && <span>Adding...</span>}
              {!state.isLoading && state.isInStock && <span>Add to Cart</span>}
              {!state.isInStock && <span>Out of Stock</span>}
            </button>
            
            {state.error && (
              <div className="error-message">
                {state.error}
                <button onClick={actions.clearError}>Dismiss</button>
              </div>
            )}
            
            {showSuccess && (
              <div className="success-message">
                Added to cart successfully!
              </div>
            )}
          </div>
        )}
      </AddToCart>
    </div>
  );
}
```

## Features

- **Render Props Pattern**: Flexible UI implementation
- **Loading State**: Automatic loading state management
- **Error Handling**: Built-in error management
- **Validation**: Checks stock and quantity
- **Callbacks**: onSuccess and onError hooks
- **Type Safe**: Full TypeScript support
- **Cart Integration**: Uses cart context automatically

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
- [useCartDispatch](CartContext.md#usecartdispatch) - Cart operations hook
- [useCartState](CartContext.md#usecartstate) - Cart state hook
