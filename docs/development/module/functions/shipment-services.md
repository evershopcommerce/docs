---
sidebar_position: 134
since: 2.2.1
keywords:
- getShipmentsForOrder
- getUnshippedItems
- getOrderShipmentRollup
- resolveShipmentRollupForOrder
- aggregateRollupStats
- recomputeOrderShipmentStatus
- getRollupDisplay
- getPhaseOf
- CANONICAL_SHIPMENT_STATUSES
- voidShipmentLabel
- updateShipmentStatusFromCarrier
- registerCarrier
- oms
- fulfillment
groups:
- oms
sidebar_label: Shipment Services
title: Shipment & Fulfillment Functions
description: Read shipments, compute the order shipment rollup, and integrate carriers.
---

# Shipment & Fulfillment Functions

An order can have **many shipments**, each covering a subset of its items. Two different vocabularies come out of that:

- A **per-shipment status** (`shipped`, `delivered`, `canceled`, plus anything an extension registers) — the `shipment.status` column. Each maps to a **phase**: `'shipped' | 'delivered' | 'canceled'`.
- An **order-level rollup** stored on `order.shipment_status` — `pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`. It is *derived from the items*, never registered, and has no phase.

Everything on this page is reachable from one barrel.

## Import

```ts
import {
  getShipmentsForOrder,
  getUnshippedItems,
  getOrderShipmentRollup,
  resolveShipmentRollupForOrder,
  aggregateRollupStats,
  recomputeOrderShipmentStatus,
  getRollupDisplay,
  ROLLUP_DISPLAY,
  getPhaseOf,
  CANONICAL_SHIPMENT_STATUSES,
  voidShipmentLabel,
  updateShipmentStatusFromCarrier,
  registerCarrier,
  getCarrier,
  getAllCarriers
} from '@evershop/evershop/oms/services';
```

```ts
import type {
  ShipmentPhase,
  OrderShipmentRollup,
  Carrier,
  CarrierCapabilities,
  CarrierMethodContext,
  CreateLabelInput,
  LabelResult,
  TrackingResult,
  Parcel,
  CarrierStatusMeta
} from '@evershop/evershop/oms/services';
```

:::note Some result types are not re-exported
`ShipmentWithItems`, `UnshippedItem`, `RollupStats`, `RollupOrderSummary` and `RawRollupRow` are declared in their source files but the barrel re-exports only the **functions** from those modules. They are shown below as shapes for reference; you cannot `import type` them from `@evershop/evershop/oms/services`. Let TypeScript infer them from the call, or declare your own structural type.
:::

---

## Reads

### getShipmentsForOrder

```ts
getShipmentsForOrder(
  orderIdOrUuid: number | string,
  connection?: PoolClient | Pool
): Promise<ShipmentWithItems[]>
```

Every shipment on the order with its `shipment_item` rows embedded, ordered `created_at ASC, shipment_id ASC` so consumers get a deterministic sequence.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>orderIdOrUuid</code></td>
      <td><code>number | string</code></td>
      <td>A numeric <code>order_id</code> or an <code>order.uuid</code>. Both forms are accepted.</td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td><code>PoolClient | Pool</code></td>
      <td>Optional. Defaults to the shared <code>pool</code>. Pass a transaction client to read your own uncommitted writes.</td>
    </tr>
  </tbody>
</table>

Returns `[]` when the order does not exist — it does not throw.

```ts
const shipments = await getShipmentsForOrder(orderUuid);
for (const s of shipments) {
  console.log(s.uuid, s.status, s.tracking_number, s.items.length);
}
```

### getUnshippedItems

```ts
getUnshippedItems(
  orderIdOrUuid: number | string,
  connection?: PoolClient | Pool
): Promise<UnshippedItem[]>
```

Items that still have quantity left to ship. This is what drives the admin's ship dialog.

```ts
interface UnshippedItem {
  order_item_id: number;
  uuid: string;
  product_sku: string;
  product_name: string;
  qty_ordered: number;
  qty_unshipped: number;
}
```

Semantics worth knowing:

- Only shipments whose status maps to the **`shipped` or `delivered`** phase count against the remainder. `canceled` shipments release their items back to the pool.
- Items flagged `no_shipping_required` (digital products) **never** appear — the admin UI can therefore never attempt to ship them.
- Returns `[]` for an unknown order.

### getOrderShipmentRollup

```ts
getOrderShipmentRollup(
  orderIdOrUuid: number | string,
  connection?: PoolClient | Pool
): Promise<OrderShipmentRollup>
```

Compute the order's rolled-up shipment status. A pure read — it returns the same answer the cached `order.shipment_status` column should already hold if recomputes have kept up.

**Throws** `Order not found: <idOrUuid>` when the order does not exist. (This is the one read on this page that throws rather than returning an empty value.)

---

## Rollup computation

### resolveShipmentRollupForOrder

```ts
resolveShipmentRollupForOrder(
  orderId: number,
  connection?: PoolClient | Pool,
  preloadedOrder?: RollupOrderSummary
): Promise<OrderShipmentRollup>
```

The engine behind `getOrderShipmentRollup`. Takes a numeric `order_id` only. Pass `preloadedOrder` (`{ order_id, order_status }`) to skip one query when you already have the row.

**Throws** `Order <id> not found` when no `preloadedOrder` is given and the order does not exist.

**Hookable** as `resolveShipmentRollup` — use `hookBeforeResolveShipmentRollup` / `hookAfterResolveShipmentRollup` (also exported) to override the math, for example to model returns.

Two short-circuits run before any rule:

1. `order.status === 'canceled'` → `'canceled'`.
2. Zero shippable items (an all-digital order) → `'delivered'`. "Fully shipped" is vacuously true.

Otherwise the predicate rules from `oms.order.shipmentRollup` are applied in a fixed priority order: `all:delivered`, `any:delivered`, `all:shipped`, `any:shipped`, `all:canceled`, `any:canceled`, `all:pending`, falling back to `'pending'`. Shipping progress deliberately outranks cancellation, and `all:canceled` precedes `any:canceled` because `all ⊂ any`. Override the map with `addProcessor('shipmentRollup', …)`.

### aggregateRollupStats

```ts
aggregateRollupStats(rows: RawRollupRow[]): RollupStats
```

The pure aggregation step, exposed so callers and tests can drive the math without a database.

```ts
interface RollupStats {
  shippableItemsCount: number;
  allDelivered: boolean;
  anyDelivered: boolean;
  allShipped: boolean;
  anyShipped: boolean;
  allCanceled: boolean;
  anyCanceled: boolean;
  allPending: boolean;
}
```

Input rows are one per `(order_item, distinct shipment status that ever covered that item)`, with `qty_ordered` and the summed `qty`. Canceled quantities are tracked separately, so an item that was canceled and then re-shipped reads as shipped.

### recomputeOrderShipmentStatus

```ts
recomputeOrderShipmentStatus(
  orderId: number,
  connection?: PoolClient | Pool,
  preloadedOrder?: RollupOrderSummary
): Promise<OrderShipmentRollup>
```

Recompute the rollup **and persist it** to `order.shipment_status`. Returns the new value.

Core calls this after every per-shipment status change and after `cancelOrder`. You need it only when you write `shipment` or `shipment_item` rows yourself.

**Hookable at two layers:**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Hook key</th>
      <th>Wraps</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>recomputeOrderShipmentStatus</code></td>
      <td>The whole compute-and-write cycle. Helpers: <code>hookBeforeRecomputeOrderShipmentStatus</code> / <code>hookAfterRecomputeOrderShipmentStatus</code>.</td>
    </tr>
    <tr>
      <td><code>changeShipmentStatus</code></td>
      <td>Just the database write of the rollup. Helpers: <code>hookBeforeChangeShipmentStatus</code> / <code>hookAfterChangeShipmentStatus</code>. Core's own <code>hookAfter</code> here drives the order-status recompute through <code>psoMapping</code>.</td>
    </tr>
  </tbody>
</table>

:::warning The `status` argument on `changeShipmentStatus` is a rollup value
It is one of the seven `OrderShipmentRollup` values, never a per-shipment status code. A `psoMapping` written against a custom per-shipment status will never match.
:::

---

## Display and phases

### getRollupDisplay

```ts
getRollupDisplay(): Record<OrderShipmentRollup, { name: string; badge: string }>
```

Display data for the seven rollup values. Rollup values are **not** entries in the shipment-status registry, so looking `partially_shipped` up in `getShipmentStatusList()` returns `undefined` — use this map instead.

`ROLLUP_DISPLAY` is the unprocessed default; `getRollupDisplay()` returns it after any `addProcessor('rollupDisplay', …)` overrides.

<table className="table-auto not-prose">
  <thead>
    <tr><th>Rollup</th><th>Name</th><th>Badge</th></tr>
  </thead>
  <tbody>
    <tr><td><code>pending</code></td><td>Pending</td><td><code>default</code></td></tr>
    <tr><td><code>partially_shipped</code></td><td>Partially Shipped</td><td><code>warning</code></td></tr>
    <tr><td><code>shipped</code></td><td>Shipped</td><td><code>warning</code></td></tr>
    <tr><td><code>partially_delivered</code></td><td>Partially Delivered</td><td><code>warning</code></td></tr>
    <tr><td><code>delivered</code></td><td>Delivered</td><td><code>success</code></td></tr>
    <tr><td><code>partially_canceled</code></td><td>Partially Canceled</td><td><code>warning</code></td></tr>
    <tr><td><code>canceled</code></td><td>Canceled</td><td><code>destructive</code></td></tr>
  </tbody>
</table>

### getPhaseOf

```ts
getPhaseOf(statusCode: string): ShipmentPhase
```

Map a **per-shipment** status code to its phase (`'shipped' | 'delivered' | 'canceled'`), reading the `oms.order.shipmentStatus` registry.

**Throws** `Invalid status: <statusCode>` for an unregistered code. Passing a rollup value such as `partially_shipped` throws for exactly this reason.

```ts
getPhaseOf('in_transit');  // 'shipped'
getPhaseOf('returned');    // 'canceled'
```

### CANONICAL_SHIPMENT_STATUSES

```ts
const CANONICAL_SHIPMENT_STATUSES: Record<string, ShipmentStatus>
```

A recommended status vocabulary aligned with AfterShip / Shippo / EasyPost, so multiple carrier extensions converge on the same codes instead of inventing their own.

<table className="table-auto not-prose">
  <thead>
    <tr><th>Code</th><th>Name</th><th>Badge</th><th>Phase</th></tr>
  </thead>
  <tbody>
    <tr><td><code>in_transit</code></td><td>In Transit</td><td><code>default</code></td><td><code>shipped</code></td></tr>
    <tr><td><code>out_for_delivery</code></td><td>Out for Delivery</td><td><code>warning</code></td><td><code>shipped</code></td></tr>
    <tr><td><code>attempt_fail</code></td><td>Delivery Attempt Failed</td><td><code>warning</code></td><td><code>shipped</code></td></tr>
    <tr><td><code>available_for_pickup</code></td><td>Available for Pickup</td><td><code>warning</code></td><td><code>shipped</code></td></tr>
    <tr><td><code>exception</code></td><td>Exception</td><td><code>destructive</code></td><td><code>shipped</code></td></tr>
    <tr><td><code>returned</code></td><td>Returned</td><td><code>destructive</code></td><td><code>canceled</code></td></tr>
    <tr><td><code>expired</code></td><td>Expired</td><td><code>destructive</code></td><td><code>canceled</code></td></tr>
  </tbody>
</table>

Core does **not** auto-register these — that is the extension's call. `delivered` is intentionally absent; it already ships in the OMS defaults.

```ts title="extensions/my-carrier/src/bootstrap.ts"
import {
  CANONICAL_SHIPMENT_STATUSES,
  registerShipmentStatus,
  getShipmentStatusList
} from '@evershop/evershop/oms/services';

export default () => {
  for (const [code, detail] of Object.entries(CANONICAL_SHIPMENT_STATUSES)) {
    if (!getShipmentStatusList()[code]) {
      registerShipmentStatus(code, detail);
    }
  }
};
```

The guard matters: `registerShipmentStatus` throws on a duplicate code, so two extensions registering the same canonical status without it will blow up the second bootstrap.

---

## Labels and carrier convergence

### voidShipmentLabel

```ts
voidShipmentLabel(shipmentUuid: string, conn?: PoolClient): Promise<void>
```

Void a previously purchased shipping label. Clears `label_url` and `label_format` but **keeps** `tracking_number` — the carrier may still surface the original in their portal. Emits `shipment_label_voided` and writes an order activity log entry.

**Throws** on:

<table className="table-auto not-prose">
  <thead>
    <tr><th>Condition</th><th>Message</th></tr>
  </thead>
  <tbody>
    <tr><td>No such shipment</td><td><code>Shipment not found: &lt;uuid&gt;</code></td></tr>
    <tr><td>No purchased label</td><td><code>Shipment &lt;uuid&gt; has no purchased label to void</code></td></tr>
    <tr><td>Terminal phase (<code>delivered</code> / <code>canceled</code>)</td><td><code>Cannot void label for shipment &lt;uuid&gt; — already in terminal phase '&lt;phase&gt;'</code></td></tr>
    <tr><td>Shipment has no carrier code</td><td><code>Shipment &lt;uuid&gt; has no carrier code — cannot void label</code></td></tr>
    <tr><td>Carrier not registered</td><td><code>Carrier '&lt;code&gt;' is not registered — install the carrier extension to void this label</code></td></tr>
    <tr><td>Carrier has no <code>voidLabel</code></td><td><code>Carrier '&lt;code&gt;' does not implement voidLabel</code></td></tr>
    <tr><td>Label but no tracking number</td><td><code>… inconsistent state, refusing to void</code></td></tr>
    <tr><td>Carrier API rejects the void</td><td>Propagated from the carrier</td></tr>
  </tbody>
</table>

Hookable as `voidShipmentLabel` (the whole call) and `callCarrierVoidLabel` (just the network call). `hookBeforeVoidShipmentLabel` / `hookAfterVoidShipmentLabel` are exported.

### updateShipmentStatusFromCarrier

```ts
updateShipmentStatusFromCarrier(
  carrierCode: string,
  trackingNumber: string,
  statusCode: string,
  meta?: CarrierStatusMeta
): Promise<void>
```

The convergence helper for carrier polling loops and webhook handlers: drive a shipment's registered status from a carrier-observed status.

```ts
interface CarrierStatusMeta {
  message?: string;    // "Out for delivery" — appended to the activity log
  location?: string;   // "Distribution Center, Newark NJ" — appended to the activity log
  timestamp?: string;  // Carrier event time. Informational only; not persisted.
}
```

:::warning It never throws — it logs and returns
This is deliberate, so a polling loop or webhook endpoint can iterate confidently and a single bad event cannot 500 the caller. Every one of these silently returns:

- Missing `carrierCode`, `trackingNumber` or `statusCode`.
- An unknown `statusCode` (the carrier may emit vocabulary you do not track).
- No non-terminal shipment for that `(carrier, trackingNumber)` — terminal shipments are excluded so a stale webhook cannot reactivate a closed shipment.
- A phase-impossible transition rejected by `updateShipmentStatus` (for example `delivered → shipped` from an out-of-order webhook).

An unregistered carrier code is logged but **not** fatal — the helper proceeds anyway, since an extension may be uninstalled while its webhook endpoint still receives in-flight events. Check your debug log when a status refuses to move.
:::

When several non-terminal shipments share a tracking number, the newest by `created_at` wins; that situation is a misconfiguration the helper does not try to disambiguate.

Hookable as `updateShipmentStatusFromCarrier`.

---

## Carrier registry

```ts
registerCarrier(carrier: Carrier): void
getCarrier(code: string | null | undefined): Carrier | undefined
getAllCarriers(): Carrier[]
```

An in-memory registry — nothing is persisted, there is no `carrier` table and no admin "carrier settings" page. Merchant intent is already expressed by which carrier is picked in the ship dialog and by `default_carrier_code` on Core shipping methods.

### registerCarrier

Call from `bootstrap.ts`. **Throws** on:

<table className="table-auto not-prose">
  <thead>
    <tr><th>Condition</th><th>Message</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Called after bootstrap (the registry is locked alongside hooks and the value registry)</td>
      <td><code>Cannot register carrier '&lt;code&gt;' after bootstrap. Call registerCarrier from your extension's bootstrap.ts.</code></td>
    </tr>
    <tr>
      <td>Missing <code>code</code> or <code>name</code></td>
      <td><code>registerCarrier requires both code and name. Got: …</code></td>
    </tr>
    <tr>
      <td>Duplicate code</td>
      <td><code>Carrier with code '&lt;code&gt;' is already registered. Codes must be unique across all installed extensions.</code></td>
    </tr>
  </tbody>
</table>

```ts title="extensions/my-carrier/src/bootstrap.ts"
import { registerCarrier } from '@evershop/evershop/oms/services';

export default () => {
  registerCarrier({
    code: 'my_carrier',
    name: 'My Carrier',
    description: 'Label + tracking integration'
  });
};
```

### getCarrier / getAllCarriers

`getCarrier` returns `undefined` for an unknown or nullish code — it never throws. `getAllCarriers` returns every registered carrier in registration order. Core ships one built-in, `custom` ("Custom / Other"), with no capabilities: no `createLabel`, no tracking URL. Creating a shipment with it simply records that a shipment exists.

## See Also

- [Multi-shipment and Fulfillment](/docs/development/knowledge-base/multi-shipment-and-fulfillment) — The full model
- [Carrier Development](/docs/development/knowledge-base/carrier-development) — Implementing the `Carrier` contract
- [createShipment](/docs/development/module/functions/createShipment) — Creating a shipment
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) — Advancing one shipment
- [getOrderStatusList](/docs/development/module/functions/getOrderStatusList) — The registered status lists
- [Order Status Management](/docs/development/knowledge-base/order-status-management) — Statuses and `psoMapping`
