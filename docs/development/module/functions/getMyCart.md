---
sidebar_position: 60
keywords:
- getMyCart
- checkout
- cart
- session
groups:
- checkout
sidebar_label: getMyCart
title: getMyCart
description: Get cart by session ID or customer ID.
---

# getMyCart

Get the current cart for a customer.

## Import

```typescript
import { getMyCart } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
getMyCart(sid: string, customerId?: number): Promise<Cart | null>
```

### Parameters

**`sid`** The session ID.

**Type:** `string`

Session ID.

**`customerId`** The customer ID.

**Type:** `number` (optional)

Customer ID.

## Return Value

Returns `Promise<Cart | null>`. Returns `null` if no cart found.

## Examples

### Get Cart by Session

```typescript
import { getMyCart } from "@evershop/evershop/checkout/services";

const cart = await getMyCart(sessionId);

if (cart) {
  console.log(`Cart has ${cart.getItems().length} items`);
}
```

### In Middleware

```typescript
import { getMyCart } from "@evershop/evershop/checkout/services";
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function cartMiddleware(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => Promise<void>
) {
  const sessionId = request.session.id;
  const customerId = request.getCurrentCustomer()?.customer_id;
  
  const cart = await getMyCart(sessionId, customerId);
  
  request.locals.cart = cart;
  
  await next();
}
```

## See Also

- [createNewCart](/docs/development/module/functions/createNewCart) - Create new cart
- [getCartByUUID](/docs/development/module/functions/getCartByUUID) - Get cart by UUID
