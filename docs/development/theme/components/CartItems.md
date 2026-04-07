---
sidebar_position: 35
title: CartItems
description: A headless render props component that provides cart items data and operations without rendering UI.
keywords:
  - EverShop CartItems
  - cart items
  - shopping cart
  - headless component
  - theme development
groups:
  - components
---

# CartItems

## Description

A headless render props component that provides cart items data and operations. It reads from CartContext and exposes items, loading states, item count, and a remove handler — but renders no UI of its own.

## Role in Theming

CartItems is one of EverShop's **headless components** — it owns the data access and operations while leaving all UI decisions to its parent:

- **CartItems renders nothing.** It returns only what its `children` function renders.
- **Theme developers do not override CartItems.** Instead, they override the parent components that consume it (`DefaultCartItemList`, `DefaultMiniCartDropdown`).
- **The data layer stays stable across themes.** Item data extraction, tax display logic, loading states, and remove operations are encapsulated in CartItems.

## Theme Override Points

CartItems is consumed by these components, which are the actual override targets for theme developers:

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
    <tr>
      <td>DefaultMiniCartDropdown</td>
      <td>all (via MiniCart)</td>
      <td><code>themes/&lt;name&gt;/src/pages/all/DefaultMiniCartDropdown.tsx</code></td>
    </tr>
  </tbody>
</table>

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
}
```

## Price Fields

Different price fields available:

- **productPrice**: Base product price
- **productPriceInclTax**: Base price with tax
- **finalPrice**: Price after discounts (excl. tax)
- **finalPriceInclTax**: Price after discounts (incl. tax)
- **lineTotal**: Item total (qty x price, excl. tax)
- **lineTotalInclTax**: Item total (qty x price, incl. tax)
- **subTotal**: Subtotal for the item

Use `showPriceIncludingTax` to determine which price to display.

## Examples

### Basic Cart List

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';

function ShoppingCart() {
  return (
    <CartItems>
      {({ items, loading, isEmpty, onRemoveItem }) => {
        if (loading) {
          return <div>Loading cart...</div>;
        }

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

### With Tax-Aware Pricing

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

### Theme Override Example

A theme developer overrides `DefaultCartItemList` to provide a custom cart item layout. Create this file in your theme:

**`themes/my-theme/src/pages/cart/DefaultCartItemList.tsx`**

```tsx
import { CartItems } from '@components/frontStore/cart/CartItems';
import { ItemQuantity } from '@components/frontStore/cart/ItemQuantity';

function DefaultCartItemList() {
  return (
    <CartItems>
      {({ items, loading, isEmpty, showPriceIncludingTax, onRemoveItem }) => {
        if (isEmpty) {
          return (
            <div className="my-theme-empty-cart">
              <p>Nothing here yet</p>
              <a href="/products">Start Shopping</a>
            </div>
          );
        }

        return (
          <div className="my-theme-cart-items">
            {items.map(item => {
              const price = showPriceIncludingTax
                ? item.finalPriceInclTax
                : item.finalPrice;

              return (
                <div key={item.cartItemId} className="my-theme-cart-item">
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={item.productName} />
                  )}
                  <div>
                    <h3>{item.productName}</h3>
                    <p>{price.text}</p>
                    {item.variantOptions?.map(opt => (
                      <span key={opt.attributeCode}>
                        {opt.attributeName}: {opt.optionText}
                      </span>
                    ))}
                  </div>
                  <ItemQuantity
                    cartItemId={item.cartItemId}
                    initialValue={item.qty}
                  >
                    {({ quantity, increase, decrease, loading: qtyLoading }) => (
                      <div>
                        <button onClick={decrease} disabled={qtyLoading}>-</button>
                        <span>{quantity}</span>
                        <button onClick={increase} disabled={qtyLoading}>+</button>
                      </div>
                    )}
                  </ItemQuantity>
                  <button onClick={() => onRemoveItem(item.cartItemId)}>
                    Remove
                  </button>
                </div>
              );
            })}
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

## Features

- **Headless**: Renders no UI — full control via render props
- **Loading State**: Automatic loading management
- **Empty State**: isEmpty flag for easy empty cart handling
- **Item Count**: Total items count
- **Remove Handler**: Built-in remove functionality
- **Tax Configuration**: Respects tax display settings
- **Type Safe**: Full TypeScript support

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
- [AddToCart](AddToCart.md) - Add to cart component
- [ItemQuantity](ItemQuantity.md) - Item quantity management
- [CartTotalSummary](CartTotalSummary.md) - Cart totals display

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
