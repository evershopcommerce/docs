---
sidebar_position: 35
title: CartItems
description: A render props component for displaying shopping cart items.
keywords:
  - EverShop CartItems
  - cart items
  - shopping cart
groups:
  - components
---

# CartItems

## Description

A render props component that provides cart items data and operations. Handles loading states and integrates with the cart context to provide item management functionality.

## Import

```typescript
import { CartItems } from '@components/frontStore/cart/CartItems';
```

## Usage

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';

function Cart() {
  return (
    <CartItems>
      {({ items, loading, isEmpty, totalItems, onRemoveItem }) => (
        <div>
          {isEmpty ? (
            <p>Your cart is empty</p>
          ) : (
            <ul>
              {items.map(item => (
                <li key={item.cartItemId}>
                  {item.productName} - {item.qty}
                  <button onClick={() => onRemoveItem(item.cartItemId)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </CartItems>
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
      <td>children</td>
      <td>RenderFunction</td>
      <td>Yes</td>
      <td>Render function receiving cart data</td>
    </tr>
  </tbody>
</table>

## Render Function Props

The render function receives an object with:

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
      <td>items</td>
      <td>CartItem[]</td>
      <td>Array of cart items</td>
    </tr>
    <tr>
      <td>showPriceIncludingTax</td>
      <td>boolean</td>
      <td>Whether to show prices with tax</td>
    </tr>
    <tr>
      <td>loading</td>
      <td>boolean</td>
      <td>True when cart is loading</td>
    </tr>
    <tr>
      <td>isEmpty</td>
      <td>boolean</td>
      <td>True when cart has no items</td>
    </tr>
    <tr>
      <td>totalItems</td>
      <td>number</td>
      <td>Total quantity of items</td>
    </tr>
    <tr>
      <td>onRemoveItem</td>
      <td>(itemId: string) =&gt; Promise&lt;void&gt;</td>
      <td>Function to remove an item</td>
    </tr>
  </tbody>
</table>

## Examples

### Basic Cart List

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';

function ShoppingCart() {
  return (
    <CartItems>
      {({ items, isEmpty, onRemoveItem }) => {
        if (isEmpty) {
          return <p>Your cart is empty</p>;
        }

        return (
          <div>
            {items.map(item => (
              <div key={item.cartItemId}>
                <h3>{item.productName}</h3>
                <p>Price: {item.productPrice.text}</p>
                <p>Quantity: {item.qty}</p>
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
```

### With Loading State

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';

function Cart() {
  return (
    <CartItems>
      {({ items, loading, isEmpty }) => {
        if (loading) {
          return <div>Loading cart...</div>;
        }

        if (isEmpty) {
          return <p>Your cart is empty</p>;
        }

        return (
          <ul>
            {items.map(item => (
              <li key={item.cartItemId}>
                {item.productName} - Qty: {item.qty}
              </li>
            ))}
          </ul>
        );
      }}
    </CartItems>
  );
}
```

### With Price Display

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';

function CartTable() {
  return (
    <CartItems>
      {({ items, showPriceIncludingTax, onRemoveItem }) => (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const price = showPriceIncludingTax
                ? item.finalPriceInclTax
                : item.finalPrice;
              const total = showPriceIncludingTax
                ? item.lineTotalInclTax
                : item.lineTotal;

              return (
                <tr key={item.cartItemId}>
                  <td>{item.productName}</td>
                  <td>{price.text}</td>
                  <td>{item.qty}</td>
                  <td>{total.text}</td>
                  <td>
                    <button onClick={() => onRemoveItem(item.cartItemId)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </CartItems>
  );
}
```

### Complete Example

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';
import { Image } from '@components/common/Image';

function CartPage() {
  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      
      <CartItems>
        {({
          items,
          loading,
          isEmpty,
          totalItems,
          showPriceIncludingTax,
          onRemoveItem
        }) => {
          if (loading) {
            return (
              <div className="loading">
                <p>Loading your cart...</p>
              </div>
            );
          }

          if (isEmpty) {
            return (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <a href="/products">Continue Shopping</a>
              </div>
            );
          }

          return (
            <div className="cart-content">
              <p className="item-count">{totalItems} items in cart</p>
              
              <div className="cart-items-list">
                {items.map(item => {
                  const price = showPriceIncludingTax
                    ? item.finalPriceInclTax
                    : item.finalPrice;

                  return (
                    <div key={item.cartItemId} className="cart-item">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.productName}
                          width={100}
                          height={100}
                        />
                      )}
                      
                      <div className="item-details">
                        <h3>{item.productName}</h3>
                        <p>SKU: {item.productSku}</p>
                        
                        {item.variantOptions && (
                          <div className="options">
                            {item.variantOptions.map(opt => (
                              <span key={opt.attributeCode}>
                                {opt.attributeName}: {opt.optionText}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="item-pricing">
                        <p>Price: {price.text}</p>
                        <p>Quantity: {item.qty}</p>
                        <p className="subtotal">
                          Subtotal: {item.subTotal.text}
                        </p>
                      </div>
                      
                      <button
                        className="remove-btn"
                        onClick={() => onRemoveItem(item.cartItemId)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </CartItems>
    </div>
  );
}
```

## CartItem Interface

Each item in the `items` array has:

```typescript
interface CartItem {
  cartItemId: string;
  productId: string;
  productSku: string;
  productName: string;
  productUrl: string;
  thumbnail?: string;
  qty: number;
  productPrice: { value: number; text: string };
  finalPrice: { value: number; text: string };
  finalPriceInclTax: { value: number; text: string };
  lineTotal: { value: number; text: string };
  lineTotalInclTax: { value: number; text: string };
  subTotal: { value: number; text: string };
  variantOptions?: Array<{
    attributeCode: string;
    attributeName: string;
    optionText: string;
  }>;
  // ... other fields
}
```

## Price Fields

Different price fields available:

- **productPrice**: Base product price
- **productPriceInclTax**: Base price with tax
- **finalPrice**: Price after discounts (excl. tax)
- **finalPriceInclTax**: Price after discounts (incl. tax)
- **lineTotal**: Item total (qty × price, excl. tax)
- **lineTotalInclTax**: Item total (qty × price, incl. tax)
- **subTotal**: Subtotal for the item

Use `showPriceIncludingTax` to determine which price to display.

## Features

- **Render Props Pattern**: Flexible UI implementation
- **Loading State**: Automatic loading management
- **Empty State**: isEmpty flag for easy empty cart handling
- **Item Count**: Total items count
- **Remove Handler**: Built-in remove functionality
- **Tax Configuration**: Respects tax display settings
- **Type Safe**: Full TypeScript support

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
- [AddToCart](AddToCart.md) - Add to cart component
- [Area](Area.md) - Component area system
