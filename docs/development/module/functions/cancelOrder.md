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
description: Cancel an order, release an uncaptured authorization and restock inventory.
---

# cancelOrder

Cancel an order: release an uncaptured payment authorization, update the payment and shipment status, and restock inventory. It is the service behind `POST /api/orders/:id/cancel`.

## Import

```typescript
import { cancelOrder } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
cancelOrder(uuid: string, reason: string | undefined): Promise<void>
```

### Parameters

**`uuid`**

**Type:** `string`

The order **uuid** (`order.uuid`), not the numeric `order_id`.

**`reason`**

**Type:** `string | undefined`

The cancellation reason. It is written to the order activity log. Pass `undefined` for none; the argument itself cannot be left out in TypeScript.

## Return Value

Returns `Promise<void>`.

## Behavior

Everything runs in one database transaction, in this order:

1. Loads the order and validates it. The payment status must not be flagged `isCancelable: false`, and `oms.order.shipmentRollupCancelable` must allow the order's shipment rollup (a `delivered` order cannot be canceled by default).
2. If the payment status is flagged `isVoidable` and the payment method has a `void` handler, calls the handler to release the authorization. If it throws, the whole cancellation rolls back.
3. Sets the payment status to `canceled`.
4. Cancels the shipments that are not final.
5. Adds the activity `Order canceled (<reason>)`.
6. Returns the stock of the canceled items.
7. Emits `order_canceled` with `{ orderId, reason }`. The customer receives the cancellation email, which can be switched off with `system.notification_emails.order_canceled.enabled`.

`cancelOrder` does not refund money that was already captured. A captured order is not cancelable: refund it first with [refundOrder](/docs/development/module/functions/refundOrder).

## Errors

- `Order not found`
- `Order is not cancelable at this status` — the payment status or the shipment rollup does not allow it.
- Any error thrown by the payment method's `void` handler.
- `Invalid status` — the `canceled` payment status is not registered.

## Hooks

`cancelOrder` is hookable. Hook `cancelOrder`, or one of its steps: `validateStatus`, `updatePaymentStatusToCancel`, `updateShipmentStatusToCancel` and `reStockAfterCancel`, with `hookBefore` and `hookAfter` from `@evershop/evershop/lib/util/hookable`.

## Examples

```typescript
import { cancelOrder } from "@evershop/evershop/oms/services";

await cancelOrder('order-uuid-123', 'Customer requested cancellation');
```

## See Also

- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) - Update payment status
- [refundOrder](/docs/development/module/functions/refundOrder) - Refund a captured payment
- [Order API: Cancel An Order](/docs/api/order#cancel-an-order) - The REST endpoint
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) - Update shipment status
