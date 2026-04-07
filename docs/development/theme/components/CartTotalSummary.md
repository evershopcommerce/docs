---
sidebar_position: 48
title: CartTotalSummary
description: A headless render props component that provides cart totals data for custom summary displays.
keywords:
  - EverShop CartTotalSummary
  - cart totals
  - cart summary
  - headless component
  - theme development
groups:
  - components
---

# CartTotalSummary

## Description

A headless render props component that provides cart summary data including subtotal, discount, shipping, tax, and grand total. When no `children` function is provided, it renders a `DefaultCartSummary` with Area-based extension points. When `children` is provided, it acts as a pure headless component.

## Role in Theming

CartTotalSummary is one of EverShop's **headless components** — it owns the data extraction and tax-aware price formatting while leaving UI decisions to its parent:

- **With no children**, CartTotalSummary renders a default summary layout with Areas (`cartSummaryBeforeSubTotal`, `cartSummaryAfterSubTotal`, etc.) that extensions can inject into.
- **With children**, it renders nothing of its own — only what the `children` function returns.
- **Theme developers override the parent components** that use CartTotalSummary (`ShoppingCart`, `Checkout`) to change the summary layout.
- **The data logic stays stable across themes.** Tax-inclusive/exclusive price selection, loading state derivation, and cart data extraction are encapsulated.

## Theme Override Points

CartTotalSummary is consumed by these components, which are the actual override targets for theme developers:

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
      <td>ShoppingCart</td>
      <td>cart</td>
      <td><code>themes/&lt;name&gt;/src/pages/cart/ShoppingCart.tsx</code></td>
    </tr>
    <tr>
      <td>Checkout</td>
      <td>checkout</td>
      <td><code>themes/&lt;name&gt;/src/pages/checkout/Checkout.tsx</code></td>
    </tr>
  </tbody>
</table>

## Import

```typescript
import {
  CartTotalSummary,
  DefaultCartSummary,
  Subtotal,
  Discount,
  Shipping,
  Tax,
  Total
} from '@components/frontStore/cart/CartTotalSummary';
```

## Usage

### With Default Renderer

When no children are provided, it renders the built-in summary layout:

```tsx
import { CartTotalSummary } from '@components/frontStore/cart/CartTotalSummary';

function CartSummary() {
  return <CartTotalSummary />;
}
```

### As Headless Component

Pass a children function to take full control of the rendering:

```tsx
import { CartTotalSummary } from '@components/frontStore/cart/CartTotalSummary';

function CustomCartSummary() {
  return (
    <CartTotalSummary>
      {({ subTotal, total, loading, taxAmount, showPriceIncludingTax }) => (
        <div className="my-summary">
          <div>Subtotal: {subTotal}</div>
          {!showPriceIncludingTax && <div>Tax: {taxAmount}</div>}
          <div>Total: {total}</div>
        </div>
      )}
    </CartTotalSummary>
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
      <td>No</td>
      <td>Optional render function. If omitted, DefaultCartSummary is used.</td>
    </tr>
  </tbody>
</table>

## Render Function Props

When children is provided, the render function receives:

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
      <td>loading</td>
      <td>boolean</td>
      <td>True when any cart operation is in progress</td>
    </tr>
    <tr>
      <td>showPriceIncludingTax</td>
      <td>boolean</td>
      <td>Whether prices include tax (from store config)</td>
    </tr>
    <tr>
      <td>noShippingRequired</td>
      <td>boolean</td>
      <td>True when cart has no shippable items</td>
    </tr>
    <tr>
      <td>subTotal</td>
      <td>string</td>
      <td>Formatted subtotal (tax-inclusive or exclusive based on config)</td>
    </tr>
    <tr>
      <td>discountAmount</td>
      <td>string</td>
      <td>Formatted discount amount</td>
    </tr>
    <tr>
      <td>coupon</td>
      <td>string | undefined</td>
      <td>Applied coupon code, if any</td>
    </tr>
    <tr>
      <td>shippingMethod</td>
      <td>string | undefined</td>
      <td>Selected shipping method name</td>
    </tr>
    <tr>
      <td>shippingCost</td>
      <td>string | undefined</td>
      <td>Formatted shipping cost</td>
    </tr>
    <tr>
      <td>taxAmount</td>
      <td>string</td>
      <td>Formatted total tax amount</td>
    </tr>
    <tr>
      <td>total</td>
      <td>string</td>
      <td>Formatted grand total</td>
    </tr>
  </tbody>
</table>

## Exported Sub-Components

CartTotalSummary also exports individual summary row components used by `DefaultCartSummary`. Theme developers can import and compose these individually:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Component</th>
      <th>Props</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Subtotal</td>
      <td>subTotal, loading</td>
      <td>Subtotal row</td>
    </tr>
    <tr>
      <td>Discount</td>
      <td>discountAmount, coupon, loading</td>
      <td>Discount row with coupon form/remove</td>
    </tr>
    <tr>
      <td>Shipping</td>
      <td>method, cost, noShippingRequired, loading</td>
      <td>Shipping method and cost row</td>
    </tr>
    <tr>
      <td>Tax</td>
      <td>showPriceIncludingTax, amount, loading</td>
      <td>Tax row (hidden when prices include tax)</td>
    </tr>
    <tr>
      <td>Total</td>
      <td>total, totalTaxAmount, priceIncludingTax, loading</td>
      <td>Grand total row</td>
    </tr>
  </tbody>
</table>

## Examples

### Custom Summary Layout

```tsx
import { CartTotalSummary } from '@components/frontStore/cart/CartTotalSummary';

function MinimalSummary() {
  return (
    <CartTotalSummary>
      {({ subTotal, total, coupon, discountAmount, loading }) => (
        <div className="summary">
          <div className="row">
            <span>Subtotal</span>
            <span>{subTotal}</span>
          </div>
          {coupon && (
            <div className="row discount">
              <span>Discount ({coupon})</span>
              <span>{discountAmount}</span>
            </div>
          )}
          <div className="row total">
            <span>Total</span>
            <span>{loading ? '...' : total}</span>
          </div>
        </div>
      )}
    </CartTotalSummary>
  );
}
```

### Theme Override Example

A theme developer overrides the cart page summary. Create this file in your theme:

**`themes/my-theme/src/pages/cart/ShoppingCart.tsx`**

```tsx
import { CartTotalSummary } from '@components/frontStore/cart/CartTotalSummary';
import { CartItems } from '@components/frontStore/cart/CartItems';

function ShoppingCart() {
  return (
    <div className="my-theme-cart">
      <CartItems>
        {({ items, isEmpty, onRemoveItem }) => (
          /* Custom cart items layout */
          <div>{/* ... */}</div>
        )}
      </CartItems>

      <CartTotalSummary>
        {({
          subTotal,
          total,
          taxAmount,
          shippingMethod,
          shippingCost,
          showPriceIncludingTax,
          noShippingRequired,
          loading
        }) => (
          <div className="my-theme-summary">
            <div>Subtotal: {subTotal}</div>
            {shippingMethod && !noShippingRequired && (
              <div>Shipping ({shippingMethod}): {shippingCost}</div>
            )}
            {!showPriceIncludingTax && <div>Tax: {taxAmount}</div>}
            <div className="grand-total">
              Total: {loading ? 'Calculating...' : total}
            </div>
          </div>
        )}
      </CartTotalSummary>
    </div>
  );
}

export default ShoppingCart;

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
```

## Default Cart Summary Areas

When using CartTotalSummary without children, the `DefaultCartSummary` renders with these Area extension points (in order):

1. `cartSummaryBeforeSubTotal`
2. `cartSummaryAfterSubTotal`
3. `cartSummaryBeforeDiscount`
4. `cartSummaryAfterDiscount`
5. `cartSummaryBeforeShipping`
6. `cartSummaryAfterShipping`
7. `cartSummaryBeforeTax`
8. `cartSummaryAfterTax`
9. `cartSummaryBeforeTotal`
10. `cartSummaryAfterTotal`

Extensions can inject components into these areas without overriding the entire summary.

## Features

- **Headless or Default**: Works as headless (with children) or renders a default layout (without children)
- **Tax-Aware**: Automatically selects tax-inclusive or exclusive prices based on store config
- **Loading State**: Derives loading from all cart operation states
- **Area Extension Points**: Default renderer includes Areas for extension injection
- **Composable Sub-Components**: Individual row components can be imported and reused
- **Type Safe**: Full TypeScript support

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
- [CartItems](CartItems.md) - Cart items display
- [Coupon](Coupon.md) - Coupon management

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
