---
sidebar_position: 49
title: Coupon
description: A headless render props component for managing coupon application and removal.
keywords:
  - EverShop Coupon
  - coupon code
  - discount
  - headless component
  - theme development
groups:
  - components
---

# Coupon

## Description

A headless render props component that provides state and actions for applying and removing coupon codes. It handles cart dispatch, validation, loading states, and error management — but renders no UI of its own.

## Role in Theming

Coupon is one of EverShop's **headless components** — it owns the coupon business logic while leaving all UI decisions to its parent:

- **Coupon renders nothing.** It returns only what its `children` function renders.
- **Theme developers do not override Coupon.** Instead, they override the parent components that consume it (`CouponForm`, or the cart/checkout pages that include them).
- **The logic stays stable across themes.** Coupon validation, apply/remove dispatch, error handling, and state tracking are all encapsulated in Coupon.

## Theme Override Points

Coupon is consumed by these components, which are the actual override targets for theme developers:

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
      <td>CouponForm</td>
      <td>cart, checkout</td>
      <td><code>themes/&lt;name&gt;/src/pages/cart/CouponForm.tsx</code></td>
    </tr>
    <tr>
      <td>CartTotalSummary (Discount section)</td>
      <td>cart, checkout</td>
      <td><code>themes/&lt;name&gt;/src/pages/cart/ShoppingCart.tsx</code></td>
    </tr>
  </tbody>
</table>

## Import

```typescript
import { Coupon } from '@components/frontStore/Coupon';
```

## Usage

```tsx
import { Coupon } from '@components/frontStore/Coupon';
import { useState } from 'react';

function CouponInput() {
  const [code, setCode] = useState('');

  return (
    <Coupon>
      {(state, actions) => (
        <div>
          {state.hasActiveCoupon ? (
            <div>
              <span>Applied: {state.appliedCoupon}</span>
              <button
                onClick={actions.removeCoupon}
                disabled={state.isLoading}
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter coupon code"
              />
              <button
                onClick={() => actions.applyCoupon(code)}
                disabled={!state.canApplyCoupon || state.isLoading}
              >
                Apply
              </button>
            </div>
          )}
          {state.error && <p className="error">{state.error}</p>}
        </div>
      )}
    </Coupon>
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
      <td>onApplySuccess</td>
      <td>(couponCode: string) =&gt; void</td>
      <td>No</td>
      <td>Callback when coupon is applied successfully</td>
    </tr>
    <tr>
      <td>onRemoveSuccess</td>
      <td>() =&gt; void</td>
      <td>No</td>
      <td>Callback when coupon is removed successfully</td>
    </tr>
    <tr>
      <td>onError</td>
      <td>(error: string) =&gt; void</td>
      <td>No</td>
      <td>Callback on error</td>
    </tr>
    <tr>
      <td>children</td>
      <td>(state: CouponState, actions: CouponActions) =&gt; ReactNode</td>
      <td>Yes</td>
      <td>Render function receiving state and actions</td>
    </tr>
  </tbody>
</table>

## State Object

The render function receives a state object:

```typescript
interface CouponState {
  isLoading: boolean;         // True during any cart operation
  error: string | null;       // Error message if any
  appliedCoupon: string | null; // Currently applied coupon code
  canApplyCoupon: boolean;    // True if a coupon can be applied (cart ready, no active coupon)
  canRemoveCoupon: boolean;   // True if a coupon can be removed (cart ready, has active coupon)
  hasActiveCoupon: boolean;   // True if a coupon is currently applied
}
```

## Actions Object

The render function receives an actions object:

```typescript
interface CouponActions {
  applyCoupon: (code: string) => Promise<void>;  // Apply a coupon code
  removeCoupon: () => Promise<void>;              // Remove the applied coupon
  clearError: () => void;                          // Clear error state
}
```

## Examples

### Basic Coupon Form

```tsx
import { Coupon } from '@components/frontStore/Coupon';
import { useState } from 'react';

function BasicCouponForm() {
  const [code, setCode] = useState('');

  return (
    <Coupon
      onApplySuccess={(applied) => {
        setCode('');
      }}
    >
      {(state, actions) => {
        if (state.hasActiveCoupon) {
          return (
            <div className="applied-coupon">
              <span>Coupon: {state.appliedCoupon}</span>
              <button
                onClick={actions.removeCoupon}
                disabled={state.isLoading}
              >
                Remove
              </button>
            </div>
          );
        }

        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              actions.applyCoupon(code);
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              disabled={state.isLoading}
            />
            <button
              type="submit"
              disabled={!state.canApplyCoupon || state.isLoading || !code.trim()}
            >
              {state.isLoading ? 'Applying...' : 'Apply'}
            </button>
            {state.error && (
              <p className="error">
                {state.error}
                <button onClick={actions.clearError}>Dismiss</button>
              </p>
            )}
          </form>
        );
      }}
    </Coupon>
  );
}
```

### Theme Override Example

A theme developer overrides `CouponForm` to provide a custom coupon input experience. Create this file in your theme:

**`themes/my-theme/src/pages/cart/CouponForm.tsx`**

```tsx
import { Coupon } from '@components/frontStore/Coupon';
import { useState } from 'react';

function CouponForm() {
  const [code, setCode] = useState('');
  const [expanded, setExpanded] = useState(false);

  return (
    <Coupon
      onApplySuccess={() => {
        setCode('');
        setExpanded(false);
      }}
      onError={(error) => {
        // Custom error handling
      }}
    >
      {(state, actions) => {
        if (state.hasActiveCoupon) {
          return (
            <div className="my-theme-coupon-applied">
              <span>Discount applied: {state.appliedCoupon}</span>
              <button onClick={actions.removeCoupon} disabled={state.isLoading}>
                Remove
              </button>
            </div>
          );
        }

        if (!expanded) {
          return (
            <button
              className="my-theme-coupon-toggle"
              onClick={() => setExpanded(true)}
            >
              Have a coupon code?
            </button>
          );
        }

        return (
          <div className="my-theme-coupon-form">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
            />
            <button
              onClick={() => actions.applyCoupon(code)}
              disabled={!state.canApplyCoupon || state.isLoading}
            >
              {state.isLoading ? 'Applying...' : 'Apply'}
            </button>
            <button onClick={() => setExpanded(false)}>Cancel</button>
            {state.error && <p>{state.error}</p>}
          </div>
        );
      }}
    </Coupon>
  );
}

export default CouponForm;
```

## Features

- **Headless**: Renders no UI — full control via render props
- **Apply/Remove**: Full coupon lifecycle management
- **Validation**: Checks cart readiness and duplicate coupon application
- **Loading State**: Automatic loading state management
- **Error Handling**: Built-in error management with clearError action
- **Callbacks**: onApplySuccess, onRemoveSuccess, and onError hooks
- **Type Safe**: Full TypeScript support
- **Cart Integration**: Uses CartContext automatically

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
- [CartTotalSummary](CartTotalSummary.md) - Cart totals (uses Coupon in discount section)
- [AddToCart](AddToCart.md) - Add to cart component

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
