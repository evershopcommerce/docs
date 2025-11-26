---
sidebar_position: 61
keywords:
- createNewCart
- checkout
- cart
groups:
- checkout
sidebar_label: createNewCart
title: createNewCart
description: Create a new shopping cart.
---

# createNewCart

Create a new shopping cart for a session.

## Import

```typescript
import { createNewCart } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
createNewCart(sid: string, customer?: CustomerData): Promise<Cart>
```

### Parameters

**`sid`**

**Type:** `string`

Session ID.

**`customer`**

**Type:** `CustomerData` (optional)

Customer data object:

```typescript
{
  customer_id?: number;
  email?: string;
  group_id?: number;
  full_name?: string;
}
```

## Return Value

Returns `Promise<Cart>` with new cart instance.

## Examples

### Create Guest Cart

```typescript
import { createNewCart } from "@evershop/evershop/checkout/services";

const cart = await createNewCart(sessionId);
console.log(`Created cart: ${cart.getId()}`);
```

### Create Cart for Customer

```typescript
import { createNewCart } from "@evershop/evershop/checkout/services";

const cart = await createNewCart(sessionId, {
  customer_id: 123,
  email: "customer@example.com",
  group_id: 1,
  full_name: "John Doe"
});
```

### In Middleware

```typescript
import { createNewCart, getMyCart } from "@evershop/evershop/checkout/services";
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function ensureCart(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => Promise<void>
) {
  const sessionId = request.session.id;
  let cart = await getMyCart(sessionId);
  
  if (!cart) {
    const customer = request.getCurrentCustomer();
    cart = await createNewCart(sessionId, customer || {});
  }
  
  request.locals.cart = cart;
  await next();
}
```

## See Also

- [getMyCart](/docs/development/module/functions/getMyCart) - Get existing cart
- [saveCart](/docs/development/module/functions/saveCart) - Save cart
