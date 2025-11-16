---
sidebar_position: 37
title: ItemQuantity
description: A render props component and hook for managing cart item quantities with debouncing and validation.
keywords:
  - EverShop ItemQuantity
  - quantity selector
  - cart quantity
groups:
  - components
---

# ItemQuantity

## Description

Provides quantity management for cart items with automatic cart updates, debouncing, min/max validation, and loading states. Available as both a hook and render props component.

## Import

```typescript
import { ItemQuantity, useItemQuantity } from '@components/frontStore/cart/ItemQuantity';
```

## Usage

### As Render Props Component

```tsx
import { ItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function CartItem({ item }) {
  return (
    <ItemQuantity cartItemId={item.cartItemId} initialValue={item.qty}>
      {({ quantity, increase, decrease, loading }) => (
        <div>
          <button onClick={decrease} disabled={loading}>-</button>
          <span>{quantity}</span>
          <button onClick={increase} disabled={loading}>+</button>
        </div>
      )}
    </ItemQuantity>
  );
}
```

### As Hook

```tsx
import { useItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function CartItem({ item }) {
  const { quantity, increase, decrease, inputProps } = useItemQuantity({
    cartItemId: item.cartItemId,
    initialValue: item.qty,
    min: 1,
    max: 10
  });

  return (
    <div>
      <button onClick={decrease}>-</button>
      <input {...inputProps} />
      <button onClick={increase}>+</button>
    </div>
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
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>cartItemId</td>
      <td>string</td>
      <td>Yes</td>
      <td>-</td>
      <td>Cart item ID to update</td>
    </tr>
    <tr>
      <td>initialValue</td>
      <td>number</td>
      <td>No</td>
      <td>1</td>
      <td>Initial quantity value</td>
    </tr>
    <tr>
      <td>min</td>
      <td>number</td>
      <td>No</td>
      <td>1</td>
      <td>Minimum quantity allowed</td>
    </tr>
    <tr>
      <td>max</td>
      <td>number</td>
      <td>No</td>
      <td>Infinity</td>
      <td>Maximum quantity allowed</td>
    </tr>
    <tr>
      <td>debounce</td>
      <td>number</td>
      <td>No</td>
      <td>500</td>
      <td>Debounce delay in ms</td>
    </tr>
    <tr>
      <td>onChange</td>
      <td>(qty: number) =&gt; void</td>
      <td>No</td>
      <td>-</td>
      <td>Called when quantity changes</td>
    </tr>
    <tr>
      <td>onSuccess</td>
      <td>() =&gt; void</td>
      <td>No</td>
      <td>-</td>
      <td>Called on successful update</td>
    </tr>
    <tr>
      <td>onFailure</td>
      <td>(error: Error) =&gt; void</td>
      <td>No</td>
      <td>-</td>
      <td>Called on update failure</td>
    </tr>
    <tr>
      <td>children</td>
      <td>RenderFunction</td>
      <td>Yes*</td>
      <td>-</td>
      <td>Render function (component only)</td>
    </tr>
  </tbody>
</table>

## Return Values

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>quantity</td>
      <td>number</td>
      <td>Current quantity value</td>
    </tr>
    <tr>
      <td>loading</td>
      <td>boolean</td>
      <td>True when cart is updating</td>
    </tr>
    <tr>
      <td>increase</td>
      <td>() =&gt; void</td>
      <td>Increment quantity by 1</td>
    </tr>
    <tr>
      <td>decrease</td>
      <td>() =&gt; void</td>
      <td>Decrement quantity by 1</td>
    </tr>
    <tr>
      <td>setQuantity</td>
      <td>(qty: number) =&gt; void</td>
      <td>Set specific quantity</td>
    </tr>
    <tr>
      <td>inputProps</td>
      <td>object</td>
      <td>Props to spread on input element</td>
    </tr>
  </tbody>
</table>

## Examples

### Basic Quantity Selector

```tsx
import { ItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function QuantitySelector({ item }) {
  return (
    <ItemQuantity cartItemId={item.cartItemId} initialValue={item.qty}>
      {({ quantity, increase, decrease, loading }) => (
        <div className="quantity-selector">
          <button 
            onClick={decrease} 
            disabled={loading || quantity <= 1}
          >
            -
          </button>
          <span>{quantity}</span>
          <button onClick={increase} disabled={loading}>
            +
          </button>
        </div>
      )}
    </ItemQuantity>
  );
}
```

### With Input Field

```tsx
import { useItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function QuantityInput({ item }) {
  const { inputProps, increase, decrease, loading } = useItemQuantity({
    cartItemId: item.cartItemId,
    initialValue: item.qty,
    min: 1,
    max: 99
  });

  return (
    <div className="flex gap-2">
      <button onClick={decrease} disabled={loading}>-</button>
      <input {...inputProps} className="w-16 text-center" />
      <button onClick={increase} disabled={loading}>+</button>
    </div>
  );
}
```

### With Stock Limit

```tsx
import { ItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function CartItemRow({ item }) {
  return (
    <ItemQuantity 
      cartItemId={item.cartItemId} 
      initialValue={item.qty}
      max={item.product.stockQuantity}
    >
      {({ quantity, increase, decrease, loading }) => (
        <div>
          <span>{item.productName}</span>
          <div className="quantity-controls">
            <button onClick={decrease} disabled={loading}>-</button>
            <span>{quantity}</span>
            <button 
              onClick={increase} 
              disabled={loading || quantity >= item.product.stockQuantity}
            >
              +
            </button>
          </div>
          <span>In stock: {item.product.stockQuantity}</span>
        </div>
      )}
    </ItemQuantity>
  );
}
```

### With Callbacks

```tsx
import { useItemQuantity } from '@components/frontStore/cart/ItemQuantity';
import { useState } from 'react';

function CartItem({ item }) {
  const [message, setMessage] = useState('');

  const { quantity, increase, decrease, loading } = useItemQuantity({
    cartItemId: item.cartItemId,
    initialValue: item.qty,
    debounce: 300,
    onChange: (qty) => {
      console.log('Quantity changed to:', qty);
    },
    onSuccess: () => {
      setMessage('Updated successfully');
      setTimeout(() => setMessage(''), 2000);
    },
    onFailure: (error) => {
      setMessage(`Error: ${error.message}`);
    }
  });

  return (
    <div>
      <button onClick={decrease}>-</button>
      <span>{quantity}</span>
      <button onClick={increase}>+</button>
      {loading && <span>Updating...</span>}
      {message && <div>{message}</div>}
    </div>
  );
}
```

### Complete Cart Item

```tsx
import { ItemQuantity } from '@components/frontStore/cart/ItemQuantity';
import { Image } from '@components/common/Image';

function CartItem({ item, onRemove }) {
  return (
    <div className="cart-item">
      <Image src={item.thumbnail} alt={item.productName} width={80} height={80} />
      
      <div className="item-details">
        <h3>{item.productName}</h3>
        <p>{item.productPrice.text}</p>
      </div>

      <ItemQuantity 
        cartItemId={item.cartItemId} 
        initialValue={item.qty}
        min={1}
        max={10}
        debounce={500}
      >
        {({ quantity, increase, decrease, loading, inputProps }) => (
          <div className="quantity-wrapper">
            <label>Quantity:</label>
            <div className="controls">
              <button 
                onClick={decrease}
                disabled={loading || quantity <= 1}
                className="btn-decrease"
              >
                -
              </button>
              <input 
                {...inputProps} 
                className="quantity-input"
              />
              <button 
                onClick={increase}
                disabled={loading || quantity >= 10}
                className="btn-increase"
              >
                +
              </button>
            </div>
            {loading && <span className="loading">Updating...</span>}
          </div>
        )}
      </ItemQuantity>

      <button onClick={() => onRemove(item.cartItemId)}>Remove</button>
    </div>
  );
}
```

## Features

- **Debounced Updates**: Waits 500ms before updating cart (configurable)
- **Min/Max Validation**: Enforces quantity limits
- **Loading State**: Disables controls during updates
- **Error Recovery**: Reverts to previous value on failure
- **Input Integration**: Pre-configured input props
- **Callbacks**: Success/failure/change handlers
- **Optimistic UI**: Updates immediately, syncs with server
- **Smart Diff**: Only sends changed quantity to server

## Behavior

### Debouncing

Updates are debounced by default (500ms). Set `debounce={0}` for immediate updates. The `decrease` and `increase` functions use debouncing, but blur events trigger immediate updates.

### Validation

Quantity is clamped between `min` and `max` values. Invalid input is ignored, empty input becomes 0 and is clamped on blur.

### Cart Updates

Uses `cartDispatch.updateItem` with `action: 'increase'` or `action: 'decrease'` and the quantity difference. On failure, reverts to previous quantity.

## Related Components

- [CartItems](CartItems.md) - Cart display component
- [CartContext](CartContext.md) - Cart state management
- [AddToCart](AddToCart.md) - Add to cart component
