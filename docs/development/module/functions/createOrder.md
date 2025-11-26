---
sidebar_position: 66
keywords:
- createOrder
- orderCreator
- checkout
- order
groups:
- checkout
sidebar_label: createOrder
title: createOrder
description: Create an order from a cart.
---

# createOrder

Create an order from a validated cart.

## Import

```typescript
import { createOrder } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
createOrder(cart: Cart, context?: Record<string, any>): Promise<OrderCreateResult>
```

### Parameters

**`cart`**

**Type:** `Cart`

Cart instance to convert to order.

**`context`**

**Type:** `Record<string, any>` (optional)

Context object for hooks.

## Return Value

Returns `Promise<OrderCreateResult>` with order data including:

```typescript
{
  order_id: number;
  uuid: string;
  order_number: string;
  cart_id: number;
  customer_id: number;
  customer_email: string;
  grand_total: number;
  payment_method: string;
  shipping_method: string;
  status: string;
  // ... and more fields
}
```

## Examples

### Basic Order Creation

```typescript
import { createOrder } from "@evershop/evershop/checkout/services";
import { getCartByUUID } from "@evershop/evershop/checkout/services";

const cart = await getCartByUUID(cartUuid);
const order = await createOrder(cart);

console.log(`Order created: ${order.order_number}`);
```

## Notes

- Cart is disabled after successful order creation
- Order number is auto-generated
- Uses hookable pattern for extensibility
- Sets default order status from config

## See Also

- [getMyCart](/docs/development/module/functions/getMyCart) - Get cart
