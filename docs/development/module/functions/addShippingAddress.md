---
sidebar_position: 68
keywords:
- addShippingAddress
- checkout
- shipping
- address
groups:
- checkout
sidebar_label: addShippingAddress
title: addShippingAddress
description: Add shipping address to cart.
---

# addShippingAddress

Add or update shipping address for a cart.

## Import

```typescript
import { addShippingAddress } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
addShippingAddress(
  cartUUID: string, 
  addressData: Address, 
  context?: Record<string, any>
): Promise<Address>
```

### Parameters

**`cartUUID`**

**Type:** `string`

Cart UUID.

**`addressData`**

**Type:** `Address`

Address data object:

```typescript
{
  full_name: string;
  telephone: string;
  address_1: string;
  address_2?: string;
  city: string;
  province: string;
  postcode: string;
  country: string;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<Address>` with created/updated address including `cart_address_id`.

## Examples

### Add Shipping Address

```typescript
import { addShippingAddress } from "@evershop/evershop/checkout/services";

const address = await addShippingAddress('cart-uuid-123', {
  full_name: "John Doe",
  telephone: "555-1234",
  address_1: "123 Main St",
  city: "New York",
  province: "NY",
  postcode: "10001",
  country: "US"
});

console.log(`Address ID: ${address.cart_address_id}`);
```

## See Also

- [saveCart](/docs/development/module/functions/saveCart) - Save cart
- [createOrder](/docs/development/module/functions/createOrder) - Create order
