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
description: Update the status of a single shipment.
---

# updateShipmentStatus

Update the status of **one shipment**, keyed by the shipment UUID. The order-level `shipment_status` rollup is recomputed afterwards.

## Import

```ts
import { updateShipmentStatus } from "@evershop/evershop/oms/services";
```

## Syntax

```ts
updateShipmentStatus(
  shipmentUuid: string,
  status: string,
  conn?: PoolClient
): Promise<void>
```

:::danger Breaking change
This function is keyed on the **shipment UUID**, not the order id. The old `updateShipmentStatus(orderId, status)` form is gone — an order can have many shipments, so there is no single shipment status to set from an order id. To move a whole order, load its shipments and call this per shipment.
:::

### Parameters

**`shipmentUuid`**

**Type:** `string`

The `shipment.uuid` of the shipment to update. Throws `Shipment not found: <uuid>` when it does not exist.

**`status`**

**Type:** `string`

The target per-shipment status code. Must be registered in `oms.order.shipmentStatus` (core registers `shipped`, `delivered`, `canceled`), otherwise throws `Invalid status: <status>`.

**`conn`** (optional)

**Type:** `PoolClient`

An existing connection with an open transaction. When omitted, the function opens and commits its own.

## Return Value

Returns `Promise<void>`.

## Examples

### Mark a shipment delivered

```ts
import { updateShipmentStatus } from "@evershop/evershop/oms/services";

await updateShipmentStatus('3f1c2b7a-8d4e-4f21-9d0b-2c9a51f6e0aa', 'delivered');
```

### Update every shipment on an order

```ts
import {
  getShipmentsForOrder,
  updateShipmentStatus
} from "@evershop/evershop/oms/services";

// getShipmentsForOrder accepts an order id or an order uuid
const shipments = await getShipmentsForOrder(orderUuid);
for (const shipment of shipments) {
  await updateShipmentStatus(shipment.uuid, 'delivered');
}
```

## Phase transitions

Every registered shipment status declares a `phase` (`shipped`, `delivered` or `canceled`). Transitions are validated by phase, not by status code:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>From phase</th>
      <th>Allowed target phases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipped</code></td>
      <td><code>shipped</code>, <code>delivered</code>, <code>canceled</code></td>
    </tr>
    <tr>
      <td><code>delivered</code></td>
      <td><code>delivered</code> (terminal)</td>
    </tr>
    <tr>
      <td><code>canceled</code></td>
      <td><code>canceled</code> (terminal)</td>
    </tr>
  </tbody>
</table>

Same-phase moves are always allowed, so `in_transit → out_for_delivery` (both `shipped`) is fine. Anything else throws `Cannot transition shipment from phase <from> to phase <to>`.

The first time a shipment enters a phase, the corresponding timestamp column is stamped: `shipped_at`, `delivered_at` or `canceled_at`. Re-entering the same phase does not overwrite it.

## Order rollup

After the shipment row is written, `recomputeOrderShipmentStatus()` recalculates the order-level `order.shipment_status` from all of the order's shipments and their item quantities. That rollup value is one of `pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled` — and it, not the per-shipment status, is what the `psoMapping` matches to re-resolve `order.status`.

## Events

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Event</th>
      <th>When</th>
      <th>Payload</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipment_status_changed</code></td>
      <td>Always, after commit</td>
      <td><code>&#123; shipmentId, orderId, from, to, phase &#125;</code></td>
    </tr>
    <tr>
      <td><code>shipment_delivered</code></td>
      <td>When the new status's phase is <code>delivered</code></td>
      <td><code>&#123; shipmentId, orderId &#125;</code></td>
    </tr>
  </tbody>
</table>

## Notes

- Hookable at `updateShipmentStatus`, `validateShipmentStatusBeforeUpdate` and `changeShipmentStatusForShipment`.
- Events are emitted after the commit when the function owns the transaction; when you pass your own `conn`, they are routed through it so subscribers never observe uncommitted state.

## See Also

- [createShipment](/docs/development/module/functions/createShipment) - Create a shipment
- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus) - Register a custom shipment status
- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) - Update payment status
