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

Update the payment status of an order. The order status is re-derived from the new payment status and the shipment rollup afterwards, and it never moves backwards.

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

Database connection. If you pass one, the function joins your transaction and leaves committing to you. If not provided, it opens and commits its own transaction.

## Return Value

Returns `Promise<void>`.

## Errors

Throws `Invalid status` when `status` is not a registered payment status.

## Notes

- `updatePaymentStatus` only changes the status. It writes no payment transaction and emits no event. To capture or refund, use [captureOrder](/docs/development/module/functions/captureOrder), [refundOrder](/docs/development/module/functions/refundOrder) or [recordRefund](/docs/development/module/functions/recordRefund), which call it for you.
- It is hookable. React to a change with `hookAfter('changePaymentStatus', ...)`.

## Examples

### Basic Update

```typescript
import { updatePaymentStatus } from "@evershop/evershop/oms/services";

await updatePaymentStatus(123, 'paid');
```

## See Also

- [cancelOrder](/docs/development/module/functions/cancelOrder) - Cancel order
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) - Update shipment status
