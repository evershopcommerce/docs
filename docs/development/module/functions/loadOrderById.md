---
sidebar_position: 125
keywords:
- loadOrderById
- loadOrderByUUID
- order
- OMS
groups:
- oms
sidebar_label: loadOrderById
title: Order Loader Functions
description: Load order data with items and addresses.
---

# Order Loader Functions

Load complete order data including items, shipping address, and billing address.

## Import

```typescript
import { loadOrderById, loadOrderByUUID } from '@evershop/evershop/oms/services';
```

## loadOrderById

```typescript
loadOrderById(orderId: number): Promise<OrderDetails | null>
```

Load an order by its database ID.

## loadOrderByUUID

```typescript
loadOrderByUUID(uuid: string): Promise<OrderDetails | null>
```

Load an order by its UUID.

## Return Type

```typescript
type OrderDetails = OrderRow & {
  items: OrderItemRow[];
  shippingAddress: OrderAddressRow | null;
  billingAddress: OrderAddressRow | null;
};
```

## Examples

```typescript
import { loadOrderById } from '@evershop/evershop/oms/services';

const order = await loadOrderById(2070);
if (order) {
  console.log(order.order_number);       // '12070'
  console.log(order.items.length);        // 3
  console.log(order.shippingAddress);     // { full_name: 'John', ... }
}
```

## See Also

- [cancelOrder](/docs/development/module/functions/cancelOrder) — Cancel an order
- [createShipment](/docs/development/module/functions/createShipment) — Create a shipment
