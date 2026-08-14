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
createOrder(cart: Cart): Promise<CreateOrderResult>
```

### Parameters

**`cart`**

**Type:** `Cart`

Cart instance to convert to order.

## Return Value

Returns `Promise<CreateOrderResult>` — the inserted `order` row plus an `insertId` property. The main fields:

```typescript
{
  order_id: number;
  uuid: string;
  order_number: string;
  cart_id: number;
  currency: string;
  customer_id: number | null;
  customer_email: string | null;
  grand_total: string;
  payment_method: string | null;
  payment_method_name: string | null;
  shipping_method_data: Record<string, unknown> | null;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  status: string | null;
  payment_status: string;
  shipment_status: string;
  insertId: number;
  // ... and more fields
}
```

:::warning No `shipping_method` column
The `order.shipping_method` and `order.shipping_method_name` varchar columns were dropped. The shipping selection is now a single JSONB column, `shipping_method_data`, holding the structured snapshot taken at checkout (method code, name, carrier, service code, …). Read it instead of the old string fields.
:::

Monetary columns are PostgreSQL `numeric` and come back from the driver as **strings**, not numbers.

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
