---
sidebar_position: 113
keywords:
- registerPSOStatusMapping
- PSO mapping
- order status
- OMS
groups:
- oms
sidebar_label: registerPSOStatusMapping
title: registerPSOStatusMapping
description: Register a mapping from payment+shipment status to order status.
---

# registerPSOStatusMapping

Register a PSO (Payment-Shipment-Order) mapping that determines how the order status is automatically resolved when the payment status or the order's shipment rollup changes.

## Import

```ts
import { registerPSOStatusMapping } from '@evershop/evershop/oms/services';
```

## Syntax

```ts
registerPSOStatusMapping(
  paymentStatus: string | '*',
  shipmentStatus: string | '*',
  orderStatus: string
): void
```

### Parameters

**`paymentStatus`** — A registered payment status id (`pending`, `paid`, `canceled`, …) or `'*'` to match any payment status.

**`shipmentStatus`** — The **order-level shipment rollup value**, or `'*'`. This matches `order.shipment_status`, which is derived from the order's shipments and their item quantities — it is *not* a per-shipment status id.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rollup value</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>pending</code></td><td>Nothing has shipped yet.</td></tr>
    <tr><td><code>partially_shipped</code></td><td>Some items shipped.</td></tr>
    <tr><td><code>shipped</code></td><td>All items shipped.</td></tr>
    <tr><td><code>partially_delivered</code></td><td>Some items delivered.</td></tr>
    <tr><td><code>delivered</code></td><td>All items delivered.</td></tr>
    <tr><td><code>partially_canceled</code></td><td>Some shipments canceled, nothing shipped.</td></tr>
    <tr><td><code>canceled</code></td><td>All shipments canceled.</td></tr>
  </tbody>
</table>

:::danger Custom shipment statuses do not belong here
Registering a mapping against a status you added with `registerShipmentStatus` (for example `paid:in_transit`) will **never match**, because `order.shipment_status` only ever holds one of the seven rollup values above. Your custom status affects the rollup through its `phase`, so map the resulting rollup value instead — `paid:partially_shipped`, `paid:shipped`, and so on.
:::

**`orderStatus`** — The order status id to set when both segments match. It must be a registered order status, otherwise `resolveOrderStatus` throws at runtime.

## Key resolution order

`resolveOrderStatus` looks up, in this order, and takes the first hit:

1. `<paymentStatus>:<rollup>` — exact match
2. `*:<rollup>`
3. `<paymentStatus>:*`
4. `*:*`

Mappings registered through `registerPSOStatusMapping` run as `psoMapping` processors, so they are applied on top of the module defaults and later registrations override earlier ones for the same key.

## Core defaults

Core registers these (from `modules/oms/bootstrap.ts`) — check them before adding your own, so you do not silently change checkout behaviour:

```json
{
  "pending:pending": "new",
  "pending:*": "processing",
  "paid:pending": "processing",
  "paid:partially_shipped": "processing",
  "paid:shipped": "processing",
  "paid:partially_delivered": "processing",
  "paid:delivered": "completed",
  "*:partially_canceled": "processing",
  "*:canceled": "processing",
  "canceled:canceled": "canceled",
  "canceled:*": "canceled"
}
```

Note `*:canceled` → `processing`: canceling every **shipment** no longer cancels the order, so the merchant can re-ship or cancel deliberately. Payment-side cancellation (`canceled:*`, driven by `cancelOrder`) is what cancels the order.

## Examples

```ts
import { registerPSOStatusMapping } from '@evershop/evershop/oms/services';

export default () => {
  // Exact match: fully delivered and paid → completed
  registerPSOStatusMapping('paid', 'delivered', 'completed');

  // Wildcard rollup: a refunded payment closes the order whatever shipped
  registerPSOStatusMapping('refunded', '*', 'closed');

  // Wildcard payment: treat a partially-shipped order as processing
  registerPSOStatusMapping('*', 'partially_shipped', 'processing');
};
```

If you genuinely want shipment cancellation to cancel the order, override the core default explicitly:

```ts
// Overrides the core `*:canceled` → `processing` default
registerPSOStatusMapping('*', 'canceled', 'canceled');
```

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
