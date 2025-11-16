---
sidebar_position: 88
keywords:
- updatePaymentStatus
- oms
- order management
- payment
groups:
- oms
sidebar_label: updatePaymentStatus
title: updatePaymentStatus
description: Update order payment status.
---

# updatePaymentStatus

Update the payment status of an order.

## Import

```typescript
import { updatePaymentStatus } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
updatePaymentStatus(orderId: number, status: string, conn?: PoolClient): Promise<void>
```

### Parameters

**`orderId`**

**Type:** `number`

Order ID (not UUID).

**`status`**

**Type:** `string`

New payment status.

**`conn`** (optional)

**Type:** `PoolClient`

Database connection. If not provided, creates new connection.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Update

```typescript
import { updatePaymentStatus } from "@evershop/evershop/oms/services";

await updatePaymentStatus(123, 'paid');
```

## See Also

- [cancelOrder](/docs/development/module/functions/cancelOrder) - Cancel order
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) - Update shipment status
