---
sidebar_position: 111
keywords:
- registerShipmentStatus
- shipment status
- OMS
groups:
- oms
sidebar_label: registerShipmentStatus
title: registerShipmentStatus
description: Register a custom shipment status in the OMS system.
---

# registerShipmentStatus

Register a new **per-shipment** status. Must be called during bootstrap.

## Import

```ts
import { registerShipmentStatus } from '@evershop/evershop/oms/services';
```

## Syntax

```ts
registerShipmentStatus(
  id: string,
  detail: ShipmentStatus,
  psoMapping?: Record<string, string>
): void
```

### Parameters

**`id`** — Unique status identifier, non-empty and without spaces. Example: `'in_transit'`. Registering an id that already exists throws; use `addProcessor('shipmentStatus', ...)` to mutate an existing entry instead.

**`detail`** — `ShipmentStatus`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Display name shown in the admin panel.</td>
    </tr>
    <tr>
      <td><code>badge</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Badge variant — <code>default</code>, <code>success</code>, <code>warning</code>, <code>destructive</code>, <code>outline</code>.</td>
    </tr>
    <tr>
      <td><code>phase</code></td>
      <td><code>'shipped' | 'delivered' | 'canceled'</code></td>
      <td>Yes</td>
      <td>The lifecycle bucket this status belongs to. Drives transition validation, the timestamp columns and the order-level rollup math.</td>
    </tr>
  </tbody>
</table>

:::danger `phase` is required
`registerShipmentStatus` throws `Shipment status "<id>" must declare phase: 'shipped' | 'delivered' | 'canceled'.` when `phase` is missing or is not one of those three values. There is no fourth phase and there is no `pending` phase — a `shipment` row only exists because something actually shipped.
:::

:::warning `isDefault` and `isCancelable` were removed
They are no longer part of `ShipmentStatus`. The starting status is decided by `createShipment` (always `shipped`), not by a per-status flag. Cancelability is now driven by the `oms.order.shipmentRollupCancelable` map, keyed on the **order-level rollup value**, and is overridable with `addProcessor('shipmentRollupCancelable', ...)`.
:::

**`psoMapping`** (optional) — Extra `{paymentStatus}:{orderShipmentRollup}` → `orderStatus` entries merged into `oms.order.psoMapping`.

:::caution The second segment is the rollup, not this status
`psoMapping` keys match `order.shipment_status`, which holds an order-level **rollup** value (`pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`) — never a per-shipment status code. A mapping written against your custom status id will never match. See [registerPSOStatusMapping](/docs/development/module/functions/registerPSOStatusMapping).
:::

## Examples

### Register a custom in-transit status

```ts
import { registerShipmentStatus } from '@evershop/evershop/oms/services';

export default () => {
  registerShipmentStatus('in_transit', {
    name: 'In Transit',
    badge: 'default',
    phase: 'shipped'
  });
};
```

Because `in_transit` sits in the `shipped` phase, a shipment can move `shipped → in_transit` (same phase), and later `in_transit → delivered` or `in_transit → canceled`.

### Register a terminal status

```ts
import { registerShipmentStatus } from '@evershop/evershop/oms/services';

export default () => {
  registerShipmentStatus('returned_to_sender', {
    name: 'Returned to Sender',
    badge: 'destructive',
    phase: 'canceled'
  });
};
```

## Canonical statuses

Core registers only `shipped`, `delivered` and `canceled`. For carrier integrations, `CANONICAL_SHIPMENT_STATUSES` provides a shared vocabulary aligned with the AfterShip / Shippo / EasyPost status sets, so multiple carrier extensions converge on the same codes instead of inventing their own:

```ts
import {
  CANONICAL_SHIPMENT_STATUSES,
  getShipmentStatusList,
  registerShipmentStatus
} from '@evershop/evershop/oms/services';

export default () => {
  for (const [code, detail] of Object.entries(CANONICAL_SHIPMENT_STATUSES)) {
    if (!getShipmentStatusList()[code]) {
      registerShipmentStatus(code, detail);
    }
  }
};
```

The constant covers `in_transit`, `out_for_delivery`, `attempt_fail`, `available_for_pickup` and `exception` (phase `shipped`), plus `returned` and `expired` (phase `canceled`). Core does **not** auto-register them — that is the extension's call. The `getShipmentStatusList()` guard matters: registering a code twice throws.

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [registerOrderStatus](/docs/development/module/functions/registerOrderStatus)
- [registerPSOStatusMapping](/docs/development/module/functions/registerPSOStatusMapping)
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
