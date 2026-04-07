---
sidebar_position: 37
title: ItemQuantity
description: A headless render props component and hook for managing cart item quantities with debouncing and validation.
keywords:
  - EverShop ItemQuantity
  - quantity selector
  - cart quantity
  - headless component
  - theme development
groups:
  - components
---

# ItemQuantity

## Description

A headless component that provides quantity management for cart items with automatic cart updates, debouncing, min/max validation, and loading states. Available as both a render props component and a `useItemQuantity` hook.

## Role in Theming

ItemQuantity is one of EverShop's **headless components** — it owns the quantity update logic while leaving all UI decisions to its parent:

- **ItemQuantity renders nothing.** It returns only what its `children` function renders.
- **Theme developers do not override ItemQuantity.** Instead, they override the parent components that consume it (typically `DefaultCartItemList` which uses it inside each cart item row).
- **The logic stays stable across themes.** Debounced cart updates, min/max validation, optimistic UI, and error recovery are all encapsulated in ItemQuantity.

ItemQuantity is unique among EverShop's headless components because it also exposes its logic as a **hook** (`useItemQuantity`), giving theme developers a choice between the render props pattern and direct hook usage.

## Theme Override Points

ItemQuantity is consumed inside cart item components. Theme developers override the parent to change the quantity UI:

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
      <td>DefaultCartItemList</td>
      <td>cart</td>
      <td><code>themes/&lt;name&gt;/src/pages/cart/DefaultCartItemList.tsx</code></td>
    </tr>
  </tbody>
</table>

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

### With Input Field (Hook)

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

### Theme Override Example

A theme developer overrides the cart item layout and uses `useItemQuantity` hook for a custom quantity control:

**`themes/my-theme/src/pages/cart/DefaultCartItemList.tsx`**

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';
import { useItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function QuantityControl({ item }) {
  const { quantity, increase, decrease, loading } = useItemQuantity({
    cartItemId: item.cartItemId,
    initialValue: item.qty,
    min: 1,
    max: 20
  });

  return (
    <select
      value={quantity}
      onChange={(e) => {/* handled by hook */}}
      disabled={loading}
    >
      {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

function DefaultCartItemList() {
  return (
    <CartItems>
      {({ items, isEmpty, onRemoveItem }) => {
        if (isEmpty) return <p>Your cart is empty</p>;

        return (
          <div className="my-theme-cart">
            {items.map(item => (
              <div key={item.cartItemId} className="my-theme-cart-row">
                <span>{item.productName}</span>
                <QuantityControl item={item} />
                <span>{item.subTotal.text}</span>
                <button onClick={() => onRemoveItem(item.cartItemId)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      }}
    </CartItems>
  );
}

export default DefaultCartItemList;

export const layout = {
  areaId: 'shoppingCartLeft',
  sortOrder: 10
};
```

## Behavior

### Debouncing

Updates are debounced by default (500ms). Set `debounce={0}` for immediate updates. The `decrease` and `increase` functions use debouncing, but blur events trigger immediate updates.

### Validation

Quantity is clamped between `min` and `max` values. Invalid input is ignored, empty input becomes 0 and is clamped on blur.

### Cart Updates

Uses `cartDispatch.updateItem` with `action: 'increase'` or `action: 'decrease'` and the quantity difference. On failure, reverts to previous quantity.

## Features

- **Headless**: Renders no UI — full control via render props or hook
- **Debounced Updates**: Waits 500ms before updating cart (configurable)
- **Min/Max Validation**: Enforces quantity limits
- **Loading State**: Disables controls during updates
- **Error Recovery**: Reverts to previous value on failure
- **Input Integration**: Pre-configured input props via `inputProps`
- **Optimistic UI**: Updates immediately, syncs with server

## Related Components

- [CartItems](CartItems.md) - Cart display component
- [CartContext](CartContext.md) - Cart state management
- [AddToCart](AddToCart.md) - Add to cart component

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
