---
sidebar_position: 33
title: Cart Context
description: React context for managing shopping cart state and operations.
keywords:
  - EverShop Cart
  - cart context
  - shopping cart
  - useCartState
  - useCartDispatch
groups:
  - contexts
---

# Cart Context

## Description

A React context that manages the shopping cart state and provides methods for cart operations like adding items, updating quantities, applying coupons, and managing checkout information.

## Import

```typescript
import { CartProvider, useCartState, useCartDispatch } from '@components/frontStore/cart/cartContext';
```

## Setup

Wrap your application with the CartProvider:

```tsx
import { CartProvider } from '@components/frontStore/cart/cartContext';

function App({ cart, query, addMineCartItemApi }) {
  return (
    <CartProvider
      cart={cart}
      query={query}
      addMineCartItemApi={addMineCartItemApi}
    >
      {/* Your app components */}
    </CartProvider>
  );
}
```

## Hooks

### useCartState

Access cart state and data:

```tsx
import { useCartState } from '@components/frontStore/cart/cartContext';

function CartSummary() {
  const { data, loading, loadingStates } = useCartState();

  return (
    <div>
      <p>Items: {data.totalQty}</p>
      <p>Total: {data.grandTotal.text}</p>
      {loading && <span>Loading...</span>}
    </div>
  );
}
```

### useCartDispatch

Access cart operations:

```tsx
import { useCartDispatch } from '@components/frontStore/cart/cartContext';

function AddToCartButton({ sku }) {
  const { addItem } = useCartDispatch();

  const handleAdd = async () => {
    await addItem({ sku, qty: 1 });
  };

  return <button onClick={handleAdd}>Add to Cart</button>;
}
```

## Cart State Structure

```typescript
interface CartState {
  data: CartData;           // Cart data
  loading: boolean;         // Overall loading state
  loadingStates: {          // Specific loading states
    addingItem: boolean;
    removingItem: string | null;
    updatingItem: string | null;
    addingPaymentMethod: boolean;
    addingShippingMethod: boolean;
    addingShippingAddress: boolean;
    addingBillingAddress: boolean;
    addingContactInfo: boolean;
    applyingCoupon: boolean;
    removingCoupon: boolean;
    fetchingShippingMethods: boolean;
  };
  syncStatus: {
    syncing: boolean;       // Sync in progress
    synced: boolean;        // Last sync successful
    trigger?: string;       // What triggered the sync
  };
}
```

## Cart Operations

### addItem

Add a product to the cart:

```tsx
const { addItem } = useCartDispatch();

await addItem({ sku: 'PROD-123', qty: 2 });
```

### removeItem

Remove an item from the cart:

```tsx
const { removeItem } = useCartDispatch();
const { data } = useCartState();

const handleRemove = async (itemId) => {
  await removeItem(itemId);
};
```

### updateItem

Update item quantity:

```tsx
const { updateItem } = useCartDispatch();

// Increase quantity
await updateItem(itemId, { qty: 1, action: 'increase' });

// Decrease quantity
await updateItem(itemId, { qty: 1, action: 'decrease' });
```

### addShippingAddress

Add shipping address:

```tsx
const { addShippingAddress } = useCartDispatch();

await addShippingAddress({
  fullName: 'John Doe',
  address1: '123 Main St',
  city: 'New York',
  province: 'NY',
  postcode: '10001',
  country: 'US',
  telephone: '555-0100'
});
```

### addBillingAddress

Add billing address:

```tsx
const { addBillingAddress } = useCartDispatch();

await addBillingAddress({
  fullName: 'John Doe',
  address1: '123 Main St',
  city: 'New York',
  province: 'NY',
  postcode: '10001',
  country: 'US',
  telephone: '555-0100'
});
```

### addPaymentMethod

Select payment method:

```tsx
const { addPaymentMethod } = useCartDispatch();

await addPaymentMethod('stripe', 'Credit Card');
```

### addShippingMethod

Select shipping method:

```tsx
const { addShippingMethod } = useCartDispatch();

await addShippingMethod('standard', 'Standard Shipping');
```

### addContactInfo

Add customer contact information:

```tsx
const { addContactInfo } = useCartDispatch();

await addContactInfo({ email: 'customer@example.com' });
```

### applyCoupon

Apply a discount coupon:

```tsx
const { applyCoupon } = useCartDispatch();

await applyCoupon('SUMMER20');
```

### removeCoupon

Remove applied coupon:

```tsx
const { removeCoupon } = useCartDispatch();

await removeCoupon();
```

### fetchAvailableShippingMethods

Fetch shipping methods for an address:

```tsx
const { fetchAvailableShippingMethods } = useCartDispatch();

await fetchAvailableShippingMethods({
  country: 'US',
  province: 'CA',
  postcode: '90210'
});
```

## Helper Methods

### isShippingRequired

Check if cart requires shipping:

```tsx
const { isShippingRequired } = useCartDispatch();

if (isShippingRequired()) {
  // Show shipping form
}
```

### isReadyForCheckout

Check if cart is ready for checkout:

```tsx
const { isReadyForCheckout } = useCartDispatch();

const canCheckout = isReadyForCheckout();
```

### getErrors

Get validation errors:

```tsx
const { getErrors } = useCartDispatch();

const errors = getErrors();
errors.forEach(error => {
  console.log(error.message);
});
```

### getId

Get cart UUID:

```tsx
const { getId } = useCartDispatch();

const cartId = getId();
```

### clearError

Clear error state:

```tsx
const { clearError } = useCartDispatch();

clearError();
```

## Complete Example

```tsx
import { useCartState, useCartDispatch } from '@components/frontStore/cart/cartContext';

function CartPage() {
  const { data, loading, loadingStates } = useCartState();
  const { removeItem, updateItem, applyCoupon } = useCartDispatch();

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQty = async (itemId, action) => {
    try {
      await updateItem(itemId, { qty: 1, action });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  return (
    <div>
      <h1>Shopping Cart</h1>
      
      {loading && <div>Loading...</div>}
      
      {data.items.map(item => (
        <div key={item.cartItemId}>
          <h3>{item.productName}</h3>
          <p>Price: {item.productPrice.text}</p>
          <p>Qty: {item.qty}</p>
          
          <button
            onClick={() => handleUpdateQty(item.cartItemId, 'increase')}
            disabled={loadingStates.updatingItem === item.cartItemId}
          >
            +
          </button>
          
          <button
            onClick={() => handleUpdateQty(item.cartItemId, 'decrease')}
            disabled={loadingStates.updatingItem === item.cartItemId}
          >
            -
          </button>
          
          <button
            onClick={() => handleRemove(item.cartItemId)}
            disabled={loadingStates.removingItem === item.cartItemId}
          >
            Remove
          </button>
        </div>
      ))}
      
      <div>
        <h3>Summary</h3>
        <p>Subtotal: {data.subTotal.text}</p>
        <p>Shipping: {data.shippingFeeExclTax.text}</p>
        <p>Tax: {data.taxAmount.text}</p>
        <p>Total: {data.grandTotal.text}</p>
      </div>
    </div>
  );
}
```

## Loading States

Use specific loading states for better UX:

```tsx
const { loadingStates } = useCartState();

// Check if adding item
if (loadingStates.addingItem) {
  // Show loading spinner
}

// Check if specific item is being removed
if (loadingStates.removingItem === itemId) {
  // Show loading on that item
}

// Check if updating specific item
if (loadingStates.updatingItem === itemId) {
  // Show loading on that item
}
```

## Error Handling

```tsx
const { data } = useCartState();
const { clearError } = useCartDispatch();

useEffect(() => {
  if (data.error) {
    alert(data.error);
    clearError();
  }
}, [data.error]);
```

## Sync Status

Monitor cart synchronization with server:

```tsx
const { syncStatus } = useCartState();

if (syncStatus.syncing) {
  // Show syncing indicator
}

if (syncStatus.synced) {
  // Show success message
}

// Check what triggered the sync
console.log(syncStatus.trigger); // e.g., 'addItem', 'applyCoupon'
```

## Features

- **State Management**: Centralized cart state with React Context
- **Loading States**: Granular loading states for each operation
- **Error Handling**: Built-in error management
- **Retry Logic**: Automatic retry for failed requests
- **Sync Status**: Track synchronization with server
- **Type Safe**: Full TypeScript support
- **Extensible**: Support for custom fields via extensions
- **GraphQL Integration**: Uses urql for data fetching

## Related Components

- [AppProvider](AppProvider.md) - App context provider
- [useAppState](useAppState.md) - App state hook
