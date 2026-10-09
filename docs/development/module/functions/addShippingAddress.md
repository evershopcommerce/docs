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
  recipient?: string;            // or given_name + family_name in split-name stores
  telephone?: string;
  organization?: string;
  address_line_1?: string;
  address_line_2?: string;
  address_line_3?: string;
  dependent_locality?: string;   // region key where the country enumerates the level
  locality?: string;
  administrative_area?: string;  // e.g. US-CA
  postal_code?: string;
  sorting_code?: string;
  country: string;               // ISO 3166-1 alpha-2
  extra?: Record<string, unknown>;
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
  recipient: "John Doe",
  telephone: "+1 212 555 1234",
  address_line_1: "123 Main St",
  locality: "New York",
  administrative_area: "US-NY",
  postal_code: "10001",
  country: "US"
});

// Which fields are required follows the country's address schema (Hong Kong
// has no postal code, Germany no administrative area). Invalid input throws an
// AddressValidationError with `errors: [{ field, code, message }]`; a shipping
// address must also be in a country a shipping zone covers.

console.log(`Address ID: ${address.cart_address_id}`);
```

## See Also

- [saveCart](/docs/development/module/functions/saveCart) - Save cart
- [createOrder](/docs/development/module/functions/createOrder) - Create order
