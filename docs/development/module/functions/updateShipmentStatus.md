---
sidebar_position: 89
keywords:
- updateShipmentStatus
- oms
- order management
- shipment
groups:
- oms
sidebar_label: updateShipmentStatus
title: updateShipmentStatus
description: Update order shipment status.
---

# updateShipmentStatus

Update the shipment status of an order.

## Import

```typescript
import { updateShipmentStatus } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
updateShipmentStatus(orderId: number, status: string, conn?: PoolClient): Promise<void>
```

### Parameters

**`orderId`**

**Type:** `number`

Order ID (not UUID).

**`status`**

**Type:** `string`

New shipment status.

**`conn`** (optional)

**Type:** `PoolClient`

Database connection. If not provided, creates new connection.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Update

```typescript
import { updateShipmentStatus } from "@evershop/evershop/oms/services";

await updateShipmentStatus(123, 'shipped');
```

## See Also

- [cancelOrder](/docs/development/module/functions/cancelOrder) - Cancel order
- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) - Update payment status
