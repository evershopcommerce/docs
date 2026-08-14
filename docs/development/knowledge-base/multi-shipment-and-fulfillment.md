---
sidebar_position: 47
keywords:
  - multi shipment
  - fulfillment
  - shipment status
  - shipment rollup
  - partial shipment
  - carrier
  - OMS
sidebar_label: Multi-Shipment and Fulfillment
title: Multi-Shipment and Fulfillment
description: How EverShop models many shipments per order, how per-shipment phases roll up into the order-level shipment status, and the service APIs extension authors must use.
---

# Multi-Shipment and Fulfillment

Before EverShop 2.2.1, an order had exactly one shipment. `createShipment` threw if you called it twice, the shipment status lived on the *order* row, and there was no item-level association between an order line and the parcel that carried it.

In 2.2.1 the relationship became **one-to-many**. An order can now have any number of shipments, each with its own status, carrier, tracking number, and item set. The order's `shipment_status` column survives, but it is no longer something you set — it is a **derived rollup** recomputed from item quantities after every shipment write.

This page is the contract for extension authors: the data model, the status vocabulary, the rollup math, and the three breaking changes you will hit if you carry 2.1.x code forward.

## Breaking changes at a glance

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>What changed</th>
      <th>2.1.x</th>
      <th>2.2.1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>order</code> ↔ <code>shipment</code></td>
      <td>1:1 — second <code>createShipment</code> threw</td>
      <td>1:N — unlimited shipments per order</td>
    </tr>
    <tr>
      <td><code>order.shipment_status</code></td>
      <td>Writable status code</td>
      <td>Derived rollup — <strong>never write it directly</strong></td>
    </tr>
    <tr>
      <td><code>updateShipmentStatus</code></td>
      <td><code>(orderId, status, connection?)</code></td>
      <td><code>(shipmentUuid, status, connection?)</code></td>
    </tr>
    <tr>
      <td><code>createShipment</code></td>
      <td><code>(orderUuid, carrier, trackingNumber, connection?)</code></td>
      <td><code>(orderUuid, payload, connection?)</code> — legacy form <strong>throws</strong></td>
    </tr>
    <tr>
      <td><code>registerShipmentStatus</code></td>
      <td><code>&#123; name, badge, isDefault?, isCancelable? &#125;</code></td>
      <td><code>&#123; name, badge, phase &#125;</code> — <code>phase</code> required, the two flags removed</td>
    </tr>
    <tr>
      <td>Pre-shipped shipment state</td>
      <td><code>pending</code> / <code>processing</code> shipment statuses</td>
      <td>Removed — a shipment row exists only because something shipped</td>
    </tr>
    <tr>
      <td><code>markDelivered</code></td>
      <td><code>(orderId, connection?)</code></td>
      <td><code>(shipmentUuid, connection?)</code></td>
    </tr>
  </tbody>
</table>

## The data model

### `shipment`

One row per physical parcel (or per carrier hand-off). The columns that matter to extension authors:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Column</th>
      <th>Type</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>shipment_id</code></td><td><code>int</code></td><td>Identity primary key</td></tr>
    <tr><td><code>uuid</code></td><td><code>uuid</code></td><td>The key every public service and REST route uses</td></tr>
    <tr><td><code>shipment_order_id</code></td><td><code>int</code></td><td>FK to <code>order</code></td></tr>
    <tr><td><code>status</code></td><td><code>varchar</code></td><td>A registered shipment status code. Defaults to <code>shipped</code></td></tr>
    <tr><td><code>carrier</code></td><td><code>varchar</code></td><td>Carrier registry code — no DB FK, so uninstalling a carrier extension is safe</td></tr>
    <tr><td><code>tracking_number</code></td><td><code>varchar</code></td><td>Nullable — carriers with no tracking capability leave it null</td></tr>
    <tr><td><code>shipped_at</code> / <code>delivered_at</code> / <code>canceled_at</code></td><td><code>timestamptz</code></td><td>First-occurrence timestamps, never cleared once set</td></tr>
    <tr><td><code>label_url</code> / <code>label_format</code></td><td><code>varchar</code></td><td>Carrier-hosted label. EverShop never stores the binary</td></tr>
    <tr><td><code>carrier_shipment_id</code> / <code>carrier_metadata</code> / <code>tracking_url</code></td><td><code>varchar</code> / <code>jsonb</code> / <code>varchar</code></td><td>Carrier-extension scratch space, passed back verbatim on later carrier calls</td></tr>
  </tbody>
</table>

The `phase` is **not** a column. It is derived at read time from the status registration, so the config stays the single source of truth and the DB can never drift from it.

### `shipment_item`

The junction table that makes the rollup possible.

```sql
CREATE TABLE "shipment_item" (
  "shipment_item_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "uuid"             UUID NOT NULL DEFAULT gen_random_uuid(),
  "shipment_id"      INT NOT NULL REFERENCES "shipment" ("shipment_id") ON DELETE CASCADE,
  "order_item_id"    INT NOT NULL REFERENCES "order_item" ("order_item_id") ON DELETE CASCADE,
  "qty"              INT NOT NULL CHECK ("qty" > 0),
  "created_at"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "SHIPMENT_ITEM_UUID_UNIQUE" UNIQUE ("uuid"),
  CONSTRAINT "SHIPMENT_ITEM_UNIQUE"      UNIQUE ("shipment_id", "order_item_id")
);
```

`UNIQUE (shipment_id, order_item_id)` means one row per (shipment, order line) pair — shipping more of the same line inside the same shipment is an update, not a second row. There is no status column: an item's fulfillment state is its shipment's phase.

## Phases and statuses

Two vocabularies, deliberately separate.

**Phase** is hardcoded and cannot be extended:

```ts
// modules/oms/types/shipmentPhase.ts
export type ShipmentPhase = 'shipped' | 'delivered' | 'canceled';
```

There is no `pending` phase. Stock is deducted at order placement, so a shipment row exists **if and only if** something was actually shipped — modelling a pre-shipped reservation would be state without meaning. `createShipment` hardcodes the new row's status to `shipped`. "Nothing shipped yet" is expressed at the order level by the rollup value `pending`, not by a shipment row.

**Status** is the human-visible label and is extensible. The built-in set is three entries:

```json title="Defaults registered by modules/oms/bootstrap.ts"
{
  "oms": {
    "order": {
      "shipmentStatus": {
        "shipped":   { "name": "Shipped",   "badge": "warning",     "phase": "shipped" },
        "delivered": { "name": "Delivered", "badge": "success",     "phase": "delivered" },
        "canceled":  { "name": "Canceled",  "badge": "destructive", "phase": "canceled" }
      }
    }
  }
}
```

### Warning: `registerShipmentStatus` now requires `phase`

`phase` is validated at runtime, before the duplicate-code check. A registration without it throws:

```ts title="extensions/my-carrier/src/bootstrap.ts"
import { registerShipmentStatus } from '@evershop/evershop/oms/services';

export default () => {
  // Correct — every status declares the phase the rollup math should bucket it into.
  registerShipmentStatus('out_for_delivery', {
    name: 'Out for Delivery',
    badge: 'warning',
    phase: 'shipped'
  });

  registerShipmentStatus('returned_to_sender', {
    name: 'Returned to Sender',
    badge: 'destructive',
    phase: 'canceled'
  });
};
```

Omitting `phase`, or passing anything outside `shipped | delivered | canceled`, throws:

```
Shipment status "out_for_delivery" must declare phase: 'shipped' | 'delivered' | 'canceled'.
```

`isDefault` and `isCancelable` were **removed** from the `ShipmentStatus` type. The initial status is decided by `createShipment` — hardcoded to `shipped` — not by a flag; cancelability moved to the order-level `shipmentRollupCancelable` map described below. Neither flag is read anywhere any more, so leaving them in a hand-written `config/default.json` block is a silent no-op. What the configuration schema *does* enforce is that every entry carries `name`, `badge`, and `phase`, so a config-declared status missing `phase` fails validation at startup.

:::warning
The configuration JSON schema still lists `pending` among the accepted `phase` values for backwards compatibility with old config files, but nothing in the runtime supports it: `registerShipmentStatus` rejects it, and `updateShipmentStatus`'s phase-transition table has no `pending` entry. Never declare a `pending`-phase shipment status.
:::

### Registering canonical carrier statuses

Core ships `CANONICAL_SHIPMENT_STATUSES` — an AfterShip/Shippo/EasyPost-aligned set (`in_transit`, `out_for_delivery`, `attempt_fail`, `available_for_pickup`, `exception`, `returned`, `expired`) so multiple carrier extensions converge on the same codes instead of inventing their own. Core does **not** auto-register them; that is the extension's call, and duplicate registration throws:

```ts title="extensions/my-carrier/src/bootstrap.ts"
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

## The order-level rollup

`order.shipment_status` holds one of **seven** derived values:

```ts
// modules/oms/types/orderShipmentRollup.ts
export type OrderShipmentRollup =
  | 'pending'
  | 'partially_shipped'
  | 'shipped'
  | 'partially_delivered'
  | 'delivered'
  | 'partially_canceled'
  | 'canceled';
```

The three `partially_*` values are **order-level words only**. A single shipment can never be `partially_shipped`, and none of the three is a registered shipment status — they exist purely as rollup output.

### The math is item-based, not shipment-based

The rollup counts quantities, not shipments. For every **shippable** order line (`order_item.no_shipping_required = FALSE`), it sums `shipment_item.qty` grouped by the covering shipment's phase:

```sql
SELECT oi.order_item_id,
       oi.qty AS qty_ordered,
       s.status,
       SUM(si.qty) AS qty
  FROM order_item oi
  LEFT JOIN shipment_item si ON si.order_item_id = oi.order_item_id
  LEFT JOIN shipment s       ON s.shipment_id    = si.shipment_id
 WHERE oi.order_item_order_id = $1
   AND oi.no_shipping_required = FALSE
 GROUP BY oi.order_item_id, oi.qty, s.status;
```

Application code buckets the statuses into phases (from the registry) and derives the predicates:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Predicate</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>allDelivered</code></td><td>Every shippable line has <code>qty_delivered === qty_ordered</code></td></tr>
    <tr><td><code>anyDelivered</code></td><td>Some line has <code>qty_delivered &gt; 0</code></td></tr>
    <tr><td><code>allShipped</code></td><td>Every line has <code>qty_shipped + qty_delivered === qty_ordered</code></td></tr>
    <tr><td><code>anyShipped</code></td><td>Some line has <code>qty_shipped + qty_delivered &gt; 0</code></td></tr>
    <tr><td><code>allCanceled</code></td><td>Every line has <code>qty_canceled &gt;= qty_ordered</code></td></tr>
    <tr><td><code>anyCanceled</code></td><td>Some line has <code>qty_canceled &gt; 0</code></td></tr>
    <tr><td><code>allPending</code></td><td>Every line has <code>qty_shipped === 0</code> and <code>qty_delivered === 0</code></td></tr>
  </tbody>
</table>

Canceled shipments contribute zero to `qty_shipped` and `qty_delivered`, so canceling a shipment effectively releases its items back into the unshipped pool while still being counted by `qty_canceled`.

### Short-circuits

Two checks run **before** any item math:

1. `order.status === 'canceled'` → rollup is `canceled`. Whole-order cancellation lives on `order.status`; the rollup mirrors it.
2. No shippable items at all (an all-digital order) → rollup is `delivered`. "Fully shipped" is vacuously true, which lets the PSO mapping complete digital orders on payment via `paid:delivered → completed`.

### The rule map and its priority

The predicate-to-output mapping is config, under `oms.order.shipmentRollup`:

```json title="Defaults registered by modules/oms/bootstrap.ts"
{
  "oms": {
    "order": {
      "shipmentRollup": {
        "all:delivered": "delivered",
        "any:delivered": "partially_delivered",
        "all:shipped": "shipped",
        "any:shipped": "partially_shipped",
        "all:canceled": "canceled",
        "any:canceled": "partially_canceled",
        "all:pending": "pending"
      }
    }
  }
}
```

**The evaluation order is fixed in code, not by key order in the object.** The resolver walks the predicates in this sequence and returns the first match, falling back to `pending`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>#</th>
      <th>Predicate key</th>
      <th>Why it sits here</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td><code>all:delivered</code></td><td>Most complete state wins</td></tr>
    <tr><td>2</td><td><code>any:delivered</code></td><td>Delivery beats shipping progress</td></tr>
    <tr><td>3</td><td><code>all:shipped</code></td><td></td></tr>
    <tr><td>4</td><td><code>any:shipped</code></td><td></td></tr>
    <tr><td>5</td><td><code>all:canceled</code></td><td>After shipping — real shipping progress outranks cancellation</td></tr>
    <tr><td>6</td><td><code>any:canceled</code></td><td><code>all</code> ⊂ <code>any</code>, so <code>all:canceled</code> must precede it</td></tr>
    <tr><td>7</td><td><code>all:pending</code></td><td>Last — canceled items also satisfy <code>allPending</code> and would mask rules 5 and 6</td></tr>
  </tbody>
</table>

You can rewrite the map from a bootstrap with `addProcessor('shipmentRollup', ...)`, but you cannot reorder the evaluation.

Worked examples, all assuming `order.status !== 'canceled'`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Order state (shippable lines only)</th>
      <th>Matching rule</th>
      <th>Rollup</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>3 lines, all delivered</td><td><code>all:delivered</code></td><td><code>delivered</code></td></tr>
    <tr><td>3 lines, 2 shipped + 1 delivered</td><td><code>any:delivered</code></td><td><code>partially_delivered</code></td></tr>
    <tr><td>3 lines, all shipped, none delivered</td><td><code>all:shipped</code></td><td><code>shipped</code></td></tr>
    <tr><td>3 lines, 1 shipped, 2 untouched</td><td><code>any:shipped</code></td><td><code>partially_shipped</code></td></tr>
    <tr><td>qty 3 on one line, 2 shipped in one parcel</td><td><code>any:shipped</code></td><td><code>partially_shipped</code></td></tr>
    <tr><td>3 lines, every shipment canceled</td><td><code>all:canceled</code></td><td><code>canceled</code></td></tr>
    <tr><td>3 lines, one line's shipment canceled, rest untouched</td><td><code>any:canceled</code></td><td><code>partially_canceled</code></td></tr>
    <tr><td>3 lines, nothing shipped</td><td><code>all:pending</code></td><td><code>pending</code></td></tr>
    <tr><td>2 physical (delivered) + 1 digital</td><td><code>all:delivered</code> over the 2 shippable lines</td><td><code>delivered</code></td></tr>
    <tr><td>All-digital order</td><td>short-circuit</td><td><code>delivered</code></td></tr>
  </tbody>
</table>

### `order_item.no_shipping_required` vs `order.no_shipping_required`

Both columns exist and both are maintained. The invariant, enforced by the cart field resolvers that feed `orderCreator`, is:

```ts
order.no_shipping_required === order.items.every((i) => i.no_shipping_required);
```

The rollup math reads the **item-level** flag, because the order-level flag says nothing useful about a mixed cart (it would be `false` and give you no way to know which lines to skip). The order-level flag remains a denormalized convenience for resolvers that only need a fast "does this order need shipping at all?" answer without joining `order_item`.

Digital lines are excluded at three layers: the rollup SQL filters them, `getUnshippedItems` filters them, and `createShipment` rejects a payload containing one with `Item <sku> does not require shipping and cannot be in a shipment`.

### Cancelability

Cancelability is a policy question about the whole order, so it is keyed on the rollup vocabulary — not on per-shipment statuses:

```json title="Defaults registered by modules/oms/bootstrap.ts"
{
  "oms": {
    "order": {
      "shipmentRollupCancelable": {
        "pending": true,
        "partially_shipped": true,
        "shipped": true,
        "partially_delivered": true,
        "delivered": false,
        "partially_canceled": true,
        "canceled": true
      }
    }
  }
}
```

`cancelOrder` reads this map alongside the payment side's per-status `isCancelable`; either side returning `false` blocks the cancel. Tighten it from a bootstrap when the merchant's carrier policy differs:

```ts title="extensions/strict-fulfillment/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  addProcessor('shipmentRollupCancelable', (map) => ({
    ...map,
    // No cancellations once anything is physically in transit.
    shipped: false,
    partially_delivered: false
  }));
};
```

### Display names and badges

Because `partially_*` are not registered statuses, the admin UI cannot render them through `getShipmentStatusList()`. It uses a separate display map:

```ts
// modules/oms/services/rollupDisplay.ts
export const ROLLUP_DISPLAY: Record<OrderShipmentRollup, { name: string; badge: string }> = {
  pending:             { name: 'Pending',             badge: 'default'     },
  partially_shipped:   { name: 'Partially Shipped',   badge: 'warning'     },
  shipped:             { name: 'Shipped',             badge: 'warning'     },
  partially_delivered: { name: 'Partially Delivered', badge: 'warning'     },
  delivered:           { name: 'Delivered',           badge: 'success'     },
  partially_canceled:  { name: 'Partially Canceled',  badge: 'warning'     },
  canceled:            { name: 'Canceled',            badge: 'destructive' }
};

export function getRollupDisplay(): typeof ROLLUP_DISPLAY;
```

`getRollupDisplay()` resolves the map through the `rollupDisplay` processor, so you can relabel or rebadge any rollup value:

```ts title="extensions/my-labels/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  addProcessor('rollupDisplay', (display) => ({
    ...display,
    partially_shipped: { name: 'Part Shipped', badge: 'default' }
  }));
};
```

The GraphQL `Order.shipmentStatus` resolver goes through this map and returns `{ code, name, badge }`. External GraphQL consumers written against 2.1.x will start seeing codes they have never met — `partially_shipped`, `partially_delivered`, `partially_canceled` — so treat the field as an open enum.

## Services

Everything below is exported from `@evershop/evershop/oms/services`.

### Never write `order.shipment_status` yourself

:::danger
`order.shipment_status` is a cached projection. `createShipment`, `updateShipmentStatus`, and order creation all call `recomputeOrderShipmentStatus` — and `cancelOrder` reaches it too, by cancelling each shipment through `updateShipmentStatus` — which overwrites the column with the freshly computed rollup. A direct `update('order').given({ shipment_status: ... })` is not rejected — it is simply **silently overwritten** by the next shipment write, and until then it makes `order.shipment_status` disagree with the item math.

To move fulfillment state, change a shipment: `updateShipmentStatus(shipmentUuid, status)`.
:::

```ts
import { recomputeOrderShipmentStatus } from '@evershop/evershop/oms/services';

async function recomputeOrderShipmentStatus(
  orderId: number,
  connection?: PoolClient | typeof pool,
  preloadedOrder?: RollupOrderSummary
): Promise<OrderShipmentRollup>;
```

It resolves the rollup, writes it, and returns it. The write step is itself the `changeShipmentStatus` hook target, which is what triggers the OMS bootstrap's `hookAfter('changeShipmentStatus')` and the PSO-mapping recompute of `order.status`. Call it directly only if you wrote `shipment` or `shipment_item` rows behind the services' back.

### `createShipment`

```ts
import { createShipment } from '@evershop/evershop/oms/services';

interface CreateShipmentPayload {
  /** Required, non-empty. Digital items are rejected. */
  items: Array<{ order_item_id: number; qty: number }>;
  /** Required. Must be a registered carrier code. */
  carrier: string;
  /** Optional. When absent and the carrier implements createLabel, a label is purchased. */
  tracking_number?: string;
  /** Defaults to true. Rides along on the shipment_created event. */
  notifyCustomer?: boolean;
}

createShipment(
  orderUuid: string,
  payload: CreateShipmentPayload,
  connection?: PoolClient
): Promise<CreateShipmentResult>;
```

```ts
const result = await createShipment(order.uuid, {
  items: [
    { order_item_id: 42, qty: 2 },
    { order_item_id: 43, qty: 1 }
  ],
  carrier: 'custom',
  tracking_number: '1Z999AA10123456784',
  notifyCustomer: true
});
// result: { shipment, items, labelCreated }
```

:::danger
The legacy positional signature `createShipment(orderUuid, carrier, trackingNumber, connection?)` **throws**:

```
createShipment now requires { items, carrier, tracking_number? }. The legacy
(orderUuid, carrier, trackingNumber) signature is removed in A3. Update callers;
see wiki/multi-shipment-design.md → Services.
```

There is no silent fallback, because the legacy call produced a shipment with no items — impossible under the `CHECK (qty > 0)` constraint on `shipment_item` and meaningless to the rollup. Dispatch happens on the second argument: pass an object containing `items` and you get the new path.
:::

The service runs in two phases on purpose. Phase 1 validates the payload, rejects digital lines, checks per-item remaining quantity, and — if the carrier implements `createLabel` and no tracking number was supplied — makes the carrier API call **outside** any transaction. Phase 2 opens the transaction, takes `pg_advisory_xact_lock` on the order, re-validates quantities under the lock, inserts the `shipment` and `shipment_item` rows with `status = 'shipped'`, recomputes the rollup, and logs the activity. If phase 2 fails after a label was purchased, the service attempts a compensating `voidLabel`.

### `updateShipmentStatus`

```ts
import { updateShipmentStatus } from '@evershop/evershop/oms/services';

updateShipmentStatus(
  shipmentUuid: string,
  status: string,
  connection?: PoolClient
): Promise<void>;
```

Keyed by **shipment uuid**, not order id. It loads the shipment, validates the status against the registry, enforces the phase transition, writes the status plus the first-occurrence timestamp for the new phase, recomputes the order rollup, and emits events.

Allowed phase transitions:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>From phase</th>
      <th>To phase</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>shipped</code></td><td><code>shipped</code> (relabel), <code>delivered</code>, <code>canceled</code></td></tr>
    <tr><td><code>delivered</code></td><td><code>delivered</code> only — terminal</td></tr>
    <tr><td><code>canceled</code></td><td><code>canceled</code> only — terminal</td></tr>
  </tbody>
</table>

Same-phase moves are always allowed, which is how a carrier extension advances `shipped → in_transit → out_for_delivery` without leaving the phase. Anything else throws `Cannot transition shipment from phase X to phase Y`.

Timestamps are first-occurrence and never cleared, so a shipment that was relabelled several times inside the `shipped` phase keeps its original `shipped_at`.

### `markDelivered`

```ts
import { markDelivered } from '@evershop/evershop/oms/services';

markDelivered(shipmentUuid: string, connection?: PoolClient): Promise<void>;
```

A thin wrapper over `updateShipmentStatus(shipmentUuid, 'delivered', connection)`. Also keyed by shipment uuid now.

### Read services

```ts
import {
  getShipmentsForOrder,
  getUnshippedItems,
  getOrderShipmentRollup
} from '@evershop/evershop/oms/services';
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Service</th>
      <th>Signature</th>
      <th>Returns</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getShipmentsForOrder</code></td>
      <td><code>(orderIdOrUuid, connection?)</code></td>
      <td>Every shipment on the order with its <code>items</code> embedded, ordered by <code>created_at ASC</code>. Empty array when the order does not exist</td>
    </tr>
    <tr>
      <td><code>getUnshippedItems</code></td>
      <td><code>(orderIdOrUuid, connection?)</code></td>
      <td><code>&#123; order_item_id, uuid, product_sku, product_name, qty_ordered, qty_unshipped &#125;[]</code>, shippable lines only. Canceled shipments release their qty back into <code>qty_unshipped</code></td>
    </tr>
    <tr>
      <td><code>getOrderShipmentRollup</code></td>
      <td><code>(orderIdOrUuid, connection?)</code></td>
      <td>The live rollup value — the same answer <code>order.shipment_status</code> should hold. Throws if the order does not exist</td>
    </tr>
  </tbody>
</table>

All three accept either a numeric `order_id` or an order `uuid`, so callers do not have to normalize first.

```ts
// Build a "ship the rest" payload from what is still outstanding.
const remaining = await getUnshippedItems(order.uuid);
const items = remaining
  .filter((line) => line.qty_unshipped > 0)
  .map((line) => ({ order_item_id: line.order_item_id, qty: line.qty_unshipped }));

if (items.length > 0) {
  await createShipment(order.uuid, { items, carrier: 'custom' });
}
```

## Hooks and events

Every service in the fulfillment path is hookable. Register from a `bootstrap.ts` — the hook system locks once bootstrap finishes.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Hook key</th>
      <th>Wraps</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>createShipment</code></td><td>The whole create call</td></tr>
    <tr><td><code>validateShipmentItems</code></td><td>Payload validation — runs twice, once pre-lock and once under the lock</td></tr>
    <tr><td><code>insertShipment</code> / <code>insertShipmentItems</code></td><td>The two row writes</td></tr>
    <tr><td><code>updateShipmentStatus</code></td><td>The whole status change</td></tr>
    <tr><td><code>validateShipmentStatusBeforeUpdate</code></td><td>The registry check</td></tr>
    <tr><td><code>changeShipmentStatusForShipment</code></td><td>The per-shipment row write</td></tr>
    <tr><td><code>resolveShipmentRollup</code></td><td>The pure predicate-to-output resolution</td></tr>
    <tr><td><code>recomputeOrderShipmentStatus</code></td><td>Compute plus write of the order rollup</td></tr>
    <tr><td><code>changeShipmentStatus</code></td><td>Just the <code>order.shipment_status</code> write; the OMS PSO recompute already listens here</td></tr>
    <tr><td><code>markDelivered</code></td><td>The delivered wrapper</td></tr>
  </tbody>
</table>

Typed helpers are exported for each, so you rarely need the raw string:

```ts title="extensions/my-fulfillment/src/bootstrap.ts"
import { hookAfterUpdateShipmentStatus } from '@evershop/evershop/oms/services';

export default () => {
  hookAfterUpdateShipmentStatus(async function (shipmentUuid, status) {
    // Use a function expression, not an arrow — the hook context is bound to `this`.
    if (status === 'delivered') {
      await notifyWarehouse(shipmentUuid);
    }
  });
};
```

Events emitted along the way:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Event</th>
      <th>Payload</th>
      <th>When</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>shipment_created</code></td><td><code>&#123; shipmentId, orderId, notifyCustomer &#125;</code></td><td>After the create transaction commits</td></tr>
    <tr><td><code>shipment_label_created</code></td><td><code>&#123; shipmentId, orderId, labelUrl, trackingNumber &#125;</code></td><td>Only when a label was purchased in that call</td></tr>
    <tr><td><code>shipment_status_changed</code></td><td><code>&#123; shipmentId, orderId, from, to, phase &#125;</code></td><td>Every status change</td></tr>
    <tr><td><code>shipment_delivered</code></td><td><code>&#123; shipmentId, orderId &#125;</code></td><td>Additionally, when the new phase is <code>delivered</code></td></tr>
  </tbody>
</table>

Subscribe by dropping a handler at `subscribers/shipment_created/notifyWms.ts` in your module. `notifyCustomer` is a hint carried from the admin dialog: the built-in email subscriber returns early when it is `false`, and your subscriber should respect it too.

## GraphQL surface

```graphql
type Order {
  shipmentStatus: ShipmentStatus   # the rollup, rendered through ROLLUP_DISPLAY
  shipments: [Shipment!]!
  shipment: Shipment @deprecated(reason: "Use shipments. Returns the earliest shipment for back-compat.")
}

type Shipment {
  shipmentId: Int!
  uuid: String!
  status: ShipmentStatus!
  phase: String!
  carrier: String
  carrierName: String
  trackingNumber: String
  trackingUrl: String
  labelUrl: String
  items: [ShipmentItem!]!
  shippedAt: DateTime
  deliveredAt: DateTime
  canceledAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime
}

type ShipmentItem {
  uuid: String!
  orderItemId: Int!
  qty: Int!
  productSku: String
  productName: String
  thumbnail: String
}
```

`Order.shipment` (singular) is deprecated and returns the earliest shipment by `created_at`. `unshippedItems` lives on the admin schema only (`Order.admin.graphql`) — referencing it from a storefront query fails at schema build.

Note that `Shipment.shippedAt` can be null on a delivered shipment if the status jumped straight to `delivered`. Templates should fall back to `deliveredAt` or `createdAt` rather than assuming it is populated.

## REST routes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Path</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>GET</code></td><td><code>/api/orders/:id/shipments</code></td><td>List an order's shipments</td></tr>
    <tr><td><code>POST</code></td><td><code>/api/orders/:id/shipments</code></td><td>Create a shipment</td></tr>
    <tr><td><code>PATCH</code></td><td><code>/api/shipments/:shipment_uuid</code></td><td>Update carrier / tracking</td></tr>
    <tr><td><code>POST</code></td><td><code>/api/shipments/:shipment_uuid/markDelivered</code></td><td>Mark delivered</td></tr>
    <tr><td><code>POST</code></td><td><code>/api/shipments/:shipment_uuid/cancel</code></td><td>Cancel a shipment</td></tr>
    <tr><td><code>DELETE</code></td><td><code>/api/shipments/:shipment_uuid/label</code></td><td>Void a purchased label</td></tr>
  </tbody>
</table>

All are `private` access, and every per-shipment route is keyed by `shipment_uuid`.

Two order-scoped routes survive as back-compat wrappers and should not be used in new code: `POST /api/deliveries`, which sweeps *every* non-delivered, non-canceled shipment on the order into `delivered`, and `PATCH /api/orders/:order_id/shipments/:shipment_id`, superseded by the uuid-keyed `PATCH /api/shipments/:shipment_uuid`.

## Migration checklist for 2.1.x extensions

1. Replace `createShipment(orderUuid, carrier, tracking)` with the payload form and supply real `items`.
2. Replace `updateShipmentStatus(orderId, status)` and `markDelivered(orderId)` with the shipment-uuid forms — iterate `getShipmentsForOrder(orderId)` if you only hold an order.
3. Add `phase` to every `registerShipmentStatus` call and delete `isDefault` / `isCancelable`.
4. Delete any direct write to `order.shipment_status`; move the intent to a shipment status change or a `shipmentRollup` processor.
5. If you registered a `pending` or `processing` shipment status, drop it — pre-ship state now lives at the order level as the `pending` rollup.
6. Widen any code that switches on `order.shipment_status` to handle `partially_shipped`, `partially_delivered`, and `partially_canceled`.
7. If you moved order status on shipment cancellation, note that `*:canceled` now maps to `processing`, not `canceled` — only payment-side cancellation cancels an order.

## See Also

- [Order Status Management](./order-status-management) — payment statuses, PSO mapping, and how `order.status` is derived
- [Registry and Processors](./registry-and-processors) — `addProcessor` semantics behind `shipmentRollup` and `rollupDisplay`
- [Events and Subscribers](./events-and-subscribers) — subscribing to the shipment events
- [Data Migration](./data-migration) — writing your own `Version-X.Y.Z.ts` migrations
- [Zero-Total Checkout](./zero-total-checkout) — the other 2.2.1 order-pipeline change

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
