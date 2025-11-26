---
sidebar_position: 87
keywords:
- cancelOrder
- oms
- order management
groups:
- oms
sidebar_label: cancelOrder
title: cancelOrder
description: Cancel an order and restock inventory.
---

# cancelOrder

Cancel an order, update payment and shipment status, and restock inventory.

## Import

```typescript
import { cancelOrder } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
cancelOrder(uuid: string, reason?: string): Promise<void>
```

### Parameters

**`uuid`**

**Type:** `string`

Order UUID.

**`reason`** (optional)

**Type:** `string`

Cancellation reason.

## Return Value

Returns `Promise<void>`.

## Examples

```typescript
import { cancelOrder } from "@evershop/evershop/oms/services";

await cancelOrder('order-uuid-123', 'Customer requested cancellation');
```

## See Also

- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) - Update payment status
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) - Update shipment status
