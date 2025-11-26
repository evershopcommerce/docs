---
sidebar_position: 38
title: MiniCart
description: A floating cart widget with icon and dropdown for quick cart access.
keywords:
  - EverShop MiniCart
  - mini cart
  - cart widget
groups:
  - components
---

# MiniCart

## Description

A mini cart widget that displays a cart icon with item count and a dropdown showing cart contents. Auto-opens when items are added. Supports custom icon and dropdown components.

## Import

```typescript
import { MiniCart } from '@components/frontStore/cart/MiniCart';
```

## Usage

```tsx
import { MiniCart } from '@components/frontStore/cart/MiniCart';

function Header() {
  return (
    <header>
      <MiniCart cartUrl="/cart" />
    </header>
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
      <td>cartUrl</td>
      <td>string</td>
      <td>No</td>
      <td>'/cart'</td>
      <td>URL to full cart page</td>
    </tr>
    <tr>
      <td>dropdownPosition</td>
      <td>'left' | 'right'</td>
      <td>No</td>
      <td>'right'</td>
      <td>Dropdown alignment</td>
    </tr>
    <tr>
      <td>showItemCount</td>
      <td>boolean</td>
      <td>No</td>
      <td>true</td>
      <td>Show item count badge</td>
    </tr>
    <tr>
      <td>CartIconComponent</td>
      <td>React.FC</td>
      <td>No</td>
      <td>-</td>
      <td>Custom icon component</td>
    </tr>
    <tr>
      <td>CartDropdownComponent</td>
      <td>React.FC</td>
      <td>No</td>
      <td>-</td>
      <td>Custom dropdown component</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>No</td>
      <td>''</td>
      <td>Additional CSS classes</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>boolean</td>
      <td>No</td>
      <td>false</td>
      <td>Disable cart interaction</td>
    </tr>
  </tbody>
</table>

## Examples

### Basic Usage

```tsx
import { MiniCart } from '@components/frontStore/cart/MiniCart';

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="logo">My Store</div>
      <nav>...</nav>
      <MiniCart />
    </header>
  );
}
```

### Custom Position

```tsx
import { MiniCart } from '@components/frontStore/cart/MiniCart';

function Header() {
  return (
    <div className="header">
      <MiniCart 
        dropdownPosition="left"
        cartUrl="/checkout/cart"
      />
    </div>
  );
}
```

### Without Item Count

```tsx
import { MiniCart } from '@components/frontStore/cart/MiniCart';

function Navigation() {
  return (
    <nav>
      <MiniCart showItemCount={false} />
    </nav>
  );
}
```

### Custom Icon Component

```tsx
import { MiniCart } from '@components/frontStore/cart/MiniCart';

function CustomIcon({ totalQty, onClick, isOpen, disabled }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`custom-cart-icon ${isOpen ? 'active' : ''}`}
    >
      <ShoppingBagIcon />
      {totalQty > 0 && (
        <span className="badge">{totalQty}</span>
      )}
    </button>
  );
}

function Header() {
  return (
    <MiniCart CartIconComponent={CustomIcon} />
  );
}
```

### Custom Dropdown Component

```tsx
import { MiniCart } from '@components/frontStore/cart/MiniCart';

function CustomDropdown({ cart, onClose, cartUrl }) {
  if (!cart?.items?.length) {
    return (
      <div className="empty-cart">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="custom-dropdown">
      <h3>Cart Items</h3>
      {cart.items.map(item => (
        <div key={item.cartItemId}>
          {item.productName} - {item.qty}
        </div>
      ))}
      <a href={cartUrl}>View Cart</a>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

function Header() {
  return (
    <MiniCart CartDropdownComponent={CustomDropdown} />
  );
}
```

## Custom Component Props

### CartIconComponent Props

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
      <td>totalQty</td>
      <td>number</td>
      <td>Total items in cart</td>
    </tr>
    <tr>
      <td>onClick</td>
      <td>() =&gt; void</td>
      <td>Toggle dropdown handler</td>
    </tr>
    <tr>
      <td>isOpen</td>
      <td>boolean</td>
      <td>Dropdown open state</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>boolean</td>
      <td>Disabled state</td>
    </tr>
    <tr>
      <td>showItemCount</td>
      <td>boolean</td>
      <td>Show count badge</td>
    </tr>
    <tr>
      <td>syncStatus</td>
      <td>object</td>
      <td>Cart sync status</td>
    </tr>
  </tbody>
</table>

### CartDropdownComponent Props

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
      <td>cart</td>
      <td>CartData | null</td>
      <td>Cart data object</td>
    </tr>
    <tr>
      <td>dropdownPosition</td>
      <td>'left' | 'right'</td>
      <td>Alignment position</td>
    </tr>
    <tr>
      <td>onClose</td>
      <td>() =&gt; void</td>
      <td>Close dropdown handler</td>
    </tr>
    <tr>
      <td>cartUrl</td>
      <td>string</td>
      <td>Full cart page URL</td>
    </tr>
    <tr>
      <td>setIsDropdownOpen</td>
      <td>(open: boolean) =&gt; void</td>
      <td>Control dropdown state</td>
    </tr>
  </tbody>
</table>

## Behavior

### Auto-Open on Add

The dropdown automatically opens when an item is successfully added to the cart. This is triggered by the cart sync status.

### Click Handling

Clicking the cart icon toggles the dropdown. When disabled, clicks are ignored.

### Default Components

If no custom components are provided, uses:
- `DefaultMiniCartIcon` - Shopping bag icon with badge
- `DefaultMiniCartDropdown` - Dropdown with items list

## Features

- **Item Count Badge**: Shows total quantity in cart
- **Auto-Open**: Opens when items added
- **Custom Components**: Replace icon or dropdown
- **Position Control**: Left or right alignment
- **Disabled State**: Prevent interaction when needed
- **Sync Status**: Shows loading/syncing states
- **Responsive**: Works on mobile and desktop

## Related Components

- [CartContext](CartContext.md) - Cart state management
- [CartItems](CartItems.md) - Cart display component
- [CartSummaryItems](CartSummaryItems.md) - Summary display
- [AddToCart](AddToCart.md) - Add to cart button
