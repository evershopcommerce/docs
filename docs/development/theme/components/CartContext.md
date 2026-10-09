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
import { CartProvider, useCartState, useCartDispatch } from '@components/frontStore/cart/CartContext';
```

## Setup

Wrap your application with the CartProvider:

```tsx
import { CartProvider } from '@components/frontStore/cart/CartContext';

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
import { useCartState } from '@components/frontStore/cart/CartContext';

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
import { useCartDispatch } from '@components/frontStore/cart/CartContext';

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
  recipient: 'John Doe',
  address_line_1: '123 Main St',
  locality: 'New York',
  administrative_area: 'US-NY',
  postal_code: '10001',
  country: 'US',
  telephone: '+1 212 555 0100'
});
```

:::warning The `Address` type is snake_case and country-dependent
The keys are the shared address columns: `recipient` (or `given_name` + `family_name`), `organization`, `address_line_1..3`, `dependent_locality`, `locality`, `administrative_area`, `postal_code`, `sorting_code`, `country`, `telephone`, `extra`. Which ones are required follows the country's address schema. Passing an unknown key (`fullName`, `province`) is rejected with `unknown_field`; a validation failure throws an `Error` whose `errors` property is the server's `[{ field, code, message }]` array, which the address form maps onto its inputs with `form.setError`.
:::

### addBillingAddress

Add billing address:

```tsx
const { addBillingAddress } = useCartDispatch();

await addBillingAddress({
  recipient: 'John Doe',
  address_line_1: '123 Main St',
  locality: 'New York',
  administrative_area: 'US-NY',
  postal_code: '10001',
  country: 'US',
  telephone: '+1 212 555 0100'
});

// A logged-in customer can reuse a saved address instead:
await addBillingAddress({ customerAddressUuid: savedAddress.uuid });
```

### addPaymentMethod

Select payment method:

```tsx
const { addPaymentMethod } = useCartDispatch();

await addPaymentMethod('stripe', 'Credit Card');
```

### addShippingMethod

Select a shipping method. The signature is `addShippingMethod(code, name, providerCode)` — **all three arguments are required**:

```tsx
const { data } = useCartState();
const { addShippingMethod } = useCartDispatch();

// Always thread the values straight off `availableShippingMethods`.
const method = data.availableShippingMethods[0];

await addShippingMethod(method.code, method.name, method.providerCode);
```

:::danger `providerCode` is required
`addShippingMethod` throws `Cannot add shipping method: providerCode is required` when the third argument is missing or empty — there is no silent fallback to `'core'`.

`providerCode` identifies which shipping provider the method came from (core, USPS, EasyPost, …). The server uses it to route validation to that provider's `validateMethod`; passing the wrong one makes the selection fail with "method no longer available". Read it from `availableShippingMethods[].providerCode` — the GraphQL field is non-nullable (`String!`), so it is always present.
:::

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

Fetch shipping methods for an address. Signature: `fetchAvailableShippingMethods(params: ShippingAddressParams)`.

```tsx
const { fetchAvailableShippingMethods } = useCartDispatch();
const { data } = useCartState();

await fetchAvailableShippingMethods({
  country: 'US',
  administrativeArea: 'US-CA', // optional, a region key
  locality: 'Cupertino',       // optional
  dependentLocality: undefined, // optional (wards, neighbourhoods)
  postalCode: '95014'          // optional
});

// The checkout derives these from the country's address schema: every
// geographic field of the schema (C, S, Z, D tokens) plus the country, and
// re-fetches only when one of them changes — never on a name or telephone edit.

// The result is written back onto cart state:
data.availableShippingMethods.forEach((method) => {
  console.log(method.providerCode, method.code, method.name, method.cost?.text);
});
```

It runs a GraphQL query, writes the result to `data.availableShippingMethods`, and toggles `loadingStates.fetchingShippingMethods`. Each entry has this shape:

```typescript
interface AvailableShippingMethod {
  providerCode: string; // required — pass through to addShippingMethod
  code: string;
  name: string;
  cost?: {
    value: number;
    text: string;
  };
}
```

:::info
Throws `Cannot fetch shipping methods: cart not initialized` when the cart has no UUID yet.
:::

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
import { useCartState, useCartDispatch } from '@components/frontStore/cart/CartContext';

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
