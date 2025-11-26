---
sidebar_position: 36
title: CartSummaryItems
description: A component for displaying cart items in a summary format with thumbnails and quantities.
keywords:
  - EverShop CartSummaryItems
  - cart summary
  - order summary
groups:
  - components
---

# CartSummaryItems

## Description

Displays cart items in a compact summary format, ideal for checkout or order review pages. Shows product thumbnails with quantity badges, variant options, and line totals. Includes loading skeleton and empty state.

## Import

```typescript
import { CartSummaryItemsList } from '@components/frontStore/cart/CartSummaryItems';
```

## Usage

```tsx
import { CartSummaryItemsList } from '@components/frontStore/cart/CartSummaryItems';
import { useCartState } from '@components/frontStore/cart/CartContext';

function OrderSummary() {
  const { data: cart, loading } = useCartState();
  const items = cart?.items || [];

  return (
    <CartSummaryItemsList
      items={items}
      loading={loading}
      showPriceIncludingTax={true}
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
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>items</td>
      <td>CartItem[]</td>
      <td>Yes</td>
      <td>Array of cart items to display</td>
    </tr>
    <tr>
      <td>loading</td>
      <td>boolean</td>
      <td>Yes</td>
      <td>Shows skeleton loader when true</td>
    </tr>
    <tr>
      <td>showPriceIncludingTax</td>
      <td>boolean</td>
      <td>No</td>
      <td>Display prices with tax included</td>
    </tr>
  </tbody>
</table>

## Examples

### Basic Summary

```tsx
import { CartSummaryItemsList } from '@components/frontStore/cart/CartSummaryItems';
import { useCartState } from '@components/frontStore/cart/CartContext';

function CheckoutSummary() {
  const { data: cart, loading } = useCartState();

  return (
    <div>
      <h2>Order Summary</h2>
      <CartSummaryItemsList
        items={cart?.items || []}
        loading={loading}
      />
    </div>
  );
}
```

## Related Components

- [CartItems](CartItems.md) - Full cart display with editing
- [CartContext](CartContext.md) - Cart state management
- [Image](Image.md) - Image component
- [ProductNoThumbnail](ProductNoThumbnail.md) - Image placeholder
