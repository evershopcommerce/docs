---
sidebar_position: 42
keywords:
  - order status
  - payment status
  - shipment status
  - order lifecycle
  - OMS
sidebar_label: Order Status Management
title: Order Status Management
description: Understand how EverShop manages order, payment, and shipment statuses, including state transitions and custom status definitions.
---

# Order Status Management

EverShop tracks orders along three axes:

1. **Payment Status** (`order.payment_status`) — The state of payment for the order (`pending`, `paid`, `canceled`).
2. **Shipment Status** — This one has **two distinct layers**, and confusing them is the most common source of bugs:
   - the **per-shipment status** stored on each row of the `shipment` table (`shipped`, `delivered`, `canceled`, plus any custom statuses an extension registers), and
   - the **order-level shipment rollup** stored in `order.shipment_status`, which is *derived* from all of the order's shipments (`pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`).
3. **Order Status** (`order.status`) — The overall status, automatically resolved from the combination of the payment status and the shipment **rollup**.

:::warning Two different vocabularies
Registered shipment statuses and rollup values are **not the same set**. There is no `pending` shipment status — a `shipment` row only exists because something was actually shipped. `pending` exists only as a rollup value meaning "no items shipped yet". Likewise `partially_shipped`, `partially_delivered`, and `partially_canceled` are rollup-only: no single shipment can ever be in one of them.

See [Multi-Shipment and Fulfillment](./multi-shipment-and-fulfillment) for how the rollup math works.
:::

## How Order Status Is Resolved

When the payment status changes, or when a shipment changes status (which recomputes the order's rollup), EverShop resolves the new order status using a **PSO (Payment-Shipment-Order) mapping**. This mapping defines which order status corresponds to each combination of payment status and shipment rollup.

```
Payment Status Change  → PSO Mapping Lookup → Order Status Update
Shipment Status Change → Rollup Recompute   → PSO Mapping Lookup → Order Status Update
```

This means you never set the order status directly. Instead, you update the payment status or a shipment's status, and both `order.shipment_status` and `order.status` follow automatically.

:::danger `order.shipment_status` is derived
Never write `order.shipment_status` yourself. It is recomputed from the order's shipment rows by `recomputeOrderShipmentStatus` after every per-shipment change. Writing it directly desynchronizes it from the shipment table and will be overwritten by the next recompute. Use `updateShipmentStatus(shipmentUuid, status)` instead.
:::

## Configuring Statuses

All statuses are defined in configuration. The blocks below are the **actual core defaults** from `modules/oms/bootstrap.ts` — anything you put in `config/default.json` is merged on top of them.

### Order Status

```json title="config/default.json"
{
  "oms": {
    "order": {
      "status": {
        "new": {
          "name": "New",
          "badge": "default",
          "isDefault": true,
          "next": ["processing", "canceled"]
        },
        "processing": {
          "name": "Processing",
          "badge": "default",
          "next": ["completed", "canceled"]
        },
        "completed": {
          "name": "Completed",
          "badge": "success",
          "next": ["closed"]
        },
        "canceled": {
          "name": "Canceled",
          "badge": "destructive",
          "next": []
        },
        "closed": {
          "name": "Closed",
          "badge": "outline",
          "next": []
        }
      }
    }
  }
}
```

Each order status has:
- **`name`** — Display name in the admin panel.
- **`badge`** — Visual style. See [Badge Values](#badge-values).
- **`isDefault`** — Whether this is the initial status for new orders.
- **`next`** — Array of statuses this status can transition to. An empty array means the status is final.

The `next` arrays define a topological ordering, and `changeOrderStatus` refuses to move an order backwards along it (`Can not revert the status of the order`).

### Payment Status

```json title="config/default.json"
{
  "oms": {
    "order": {
      "paymentStatus": {
        "pending": {
          "name": "Pending",
          "badge": "default",
          "isDefault": true,
          "isCancelable": true
        },
        "paid": {
          "name": "Paid",
          "badge": "success",
          "isCancelable": false
        },
        "canceled": {
          "name": "Canceled",
          "badge": "destructive",
          "isCancelable": true
        }
      }
    }
  }
}
```

There is no built-in `failed` payment status. If your gateway needs one, register it (see below).

### Shipment Status

These are the statuses of an individual **shipment row**, not of the order.

```json title="config/default.json"
{
  "oms": {
    "order": {
      "shipmentStatus": {
        "shipped": {
          "name": "Shipped",
          "badge": "warning",
          "phase": "shipped"
        },
        "delivered": {
          "name": "Delivered",
          "badge": "success",
          "phase": "delivered"
        },
        "canceled": {
          "name": "Canceled",
          "badge": "destructive",
          "phase": "canceled"
        }
      }
    }
  }
}
```

Every shipment status must declare a **`phase`** — one of `shipped`, `delivered`, or `canceled`. The phase is a fixed, three-value vocabulary that the rollup math and the per-shipment timestamp columns (`shipped_at`, `delivered_at`, `canceled_at`) are hard-wired against. Extensions can register as many statuses as they like, but they cannot add a fourth phase.

Every new shipment starts as `shipped` (hardcoded in `createShipment`), and phase transitions are enforced:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>From phase</th>
      <th>Allowed target phases</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>shipped</code></td><td><code>shipped</code>, <code>delivered</code>, <code>canceled</code></td></tr>
    <tr><td><code>delivered</code></td><td><code>delivered</code> (terminal)</td></tr>
    <tr><td><code>canceled</code></td><td><code>canceled</code> (terminal)</td></tr>
  </tbody>
</table>

Moving between two statuses in the same phase (for example `in_transit` → `out_for_delivery`, both `shipped`) is always allowed.

### The Order-level Shipment Rollup

`order.shipment_status` holds one of seven derived values. They are **not** registered as shipment statuses; their display name and badge come from `getRollupDisplay()` (`modules/oms/services/rollupDisplay.ts`):

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rollup value</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>pending</code></td><td>No items shipped yet</td></tr>
    <tr><td><code>partially_shipped</code></td><td>Some items shipped</td></tr>
    <tr><td><code>shipped</code></td><td>All items shipped</td></tr>
    <tr><td><code>partially_delivered</code></td><td>Some items delivered</td></tr>
    <tr><td><code>delivered</code></td><td>All items delivered</td></tr>
    <tr><td><code>partially_canceled</code></td><td>Some items canceled, nothing shipped or delivered</td></tr>
    <tr><td><code>canceled</code></td><td>All shippable items canceled</td></tr>
  </tbody>
</table>

## PSO Mapping

The PSO mapping connects the payment status and the shipment **rollup** to an order status. These are the core defaults:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "psoMapping": {
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
    }
  }
}
```

The format is `{paymentStatus}:{shipmentRollup}` — the second segment is a **rollup value**, not a per-shipment status. The `*` wildcard matches anything, and lookups are resolved in this order:

1. Exact match — `paid:delivered`
2. Wildcard payment — `*:delivered`
3. Wildcard rollup — `paid:*`
4. Double wildcard — `*:*`

:::info
Note that `*:{rollup}` is checked **before** `{payment}:*`. Core ships **no** `*:*` entry: if no rule matches, `resolveOrderStatus` throws `Can not found a valid order status from the current shipment and payment status`. When you register a custom payment status, make sure at least one mapping covers it.

Shipment-side cancellation deliberately does **not** cancel the order (`*:canceled` → `processing`), so the merchant can re-ship or cancel explicitly. Payment-side cancellation (`canceled:*`) is what cancels an order. `canceled:canceled` is spelled out explicitly because the exact-match lookup runs before `*:canceled` would otherwise shadow `canceled:*`.
:::

## Registering Custom Statuses

EverShop provides dedicated functions to register custom statuses programmatically from your extension's `bootstrap.ts`. All functions are imported from `@evershop/evershop/oms/services`.

All three registration functions **throw** on an empty ID, an ID containing whitespace, or an ID that is already registered. Since they run during bootstrap, an uncaught throw stops the store from starting — guard with `getOrderStatusList()` / `getPaymentStatusList()` / `getShipmentStatusList()` when a status might already exist.

### Register a Payment Status

```ts title="extensions/my-payment/src/bootstrap.ts"
import { registerPaymentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  // Register with inline PSO mapping
  registerPaymentStatus('my_gateway_authorized', {
    name: 'Authorized',
    badge: 'warning',
    isDefault: false,
    isCancelable: true
  }, {
    'my_gateway_authorized:*': 'processing'
  });

  registerPaymentStatus('my_gateway_captured', {
    name: 'Captured',
    badge: 'success',
    isDefault: false,
    isCancelable: false
  }, {
    'my_gateway_captured:*': 'processing',
    'my_gateway_captured:delivered': 'completed'
  });

  registerPaymentStatus('my_gateway_refunded', {
    name: 'Refunded',
    badge: 'destructive',
    isDefault: false,
    isCancelable: false
  }, {
    'my_gateway_refunded:*': 'closed'
  });
};
```

**Signature:**

```typescript
registerPaymentStatus(
  id: string,                              // Unique status ID (no spaces)
  detail: PaymentStatus,                   // Status properties
  psoMapping?: Record<string, string>      // Optional PSO mappings
): void
```

### Register a Shipment Status

```ts title="extensions/my-fulfillment/src/bootstrap.ts"
import { registerShipmentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  registerShipmentStatus('in_transit', {
    name: 'In Transit',
    badge: 'default',
    phase: 'shipped'
  });

  registerShipmentStatus('out_for_delivery', {
    name: 'Out for Delivery',
    badge: 'warning',
    phase: 'shipped'
  });

  registerShipmentStatus('returned', {
    name: 'Returned',
    badge: 'destructive',
    phase: 'canceled'
  });
};
```

**Signature:**

```typescript
registerShipmentStatus(
  id: string,                              // Unique status ID (no spaces)
  detail: ShipmentStatus,                  // { name, badge, phase }
  psoMapping?: Record<string, string>      // Optional PSO mappings
): void

type ShipmentStatus = {
  name: string;
  badge: string;
  phase: 'shipped' | 'delivered' | 'canceled';
};
```

:::danger `phase` is required
`registerShipmentStatus` validates `phase` at runtime and throws when it is missing or not one of the three allowed values:

```bash
Shipment status "in_transit" must declare phase: 'shipped' | 'delivered' | 'canceled'.
```

Because registration happens in `bootstrap.ts`, that throw stops the application from starting. `ShipmentStatus` has **no** `isDefault` and **no** `isCancelable` — both were removed. The starting status is decided by `createShipment` (always `shipped`), and cancelability is a rollup-level policy (`oms.order.shipmentRollupCancelable`), not a per-status flag.
:::

The `psoMapping` argument for a shipment status is keyed on the **rollup**, not on the status ID you are registering. Registering `in_transit` does not create an `in_transit` rollup value — the rollup for that shipment is derived from its `shipped` phase. In practice, custom shipment statuses rarely need a PSO mapping at all.

For carrier integrations, core exports a recommended vocabulary aligned with AfterShip / Shippo / EasyPost so multiple extensions converge on the same codes:

```ts title="extensions/my-carrier/src/bootstrap.ts"
import {
  CANONICAL_SHIPMENT_STATUSES,
  getShipmentStatusList,
  registerShipmentStatus
} from '@evershop/evershop/oms/services';

export default async () => {
  for (const [code, detail] of Object.entries(CANONICAL_SHIPMENT_STATUSES)) {
    if (!getShipmentStatusList()[code]) {
      registerShipmentStatus(code, detail);
    }
  }
};
```

The existence guard matters: registering a status ID that is already registered throws.

### Register an Order Status

```ts title="extensions/my-ext/src/bootstrap.ts"
import { registerOrderStatus } from '@evershop/evershop/oms/services';

export default async () => {
  registerOrderStatus('on_hold', {
    name: 'On Hold',
    badge: 'warning',
    isDefault: false,
    next: ['processing', 'canceled']
  });
};
```

**Signature:**

```typescript
registerOrderStatus(
  id: string,                              // Unique status ID (no spaces)
  detail: OrderStatus                      // Status properties including 'next' transitions
): void
```

### Register PSO Mappings Separately

Use `registerPSOStatusMapping()` to add individual mappings without registering a new status:

```ts
import { registerPSOStatusMapping } from '@evershop/evershop/oms/services';

export default async () => {
  registerPSOStatusMapping('my_gateway_captured', 'delivered', 'completed');
  registerPSOStatusMapping('my_gateway_refunded', '*', 'closed');
};
```

**Signature:**

```typescript
registerPSOStatusMapping(
  paymentStatus: string | '*',    // Payment status ID or '*' for any
  shipmentRollup: string | '*',   // Shipment ROLLUP value or '*' for any
  orderStatus: string             // Resulting order status
): void
```

The middle argument is a rollup value (`pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`), not a per-shipment status.

### Reading Status Lists

Retrieve all registered statuses at runtime:

```ts
import {
  getOrderStatusList,
  getPaymentStatusList,
  getShipmentStatusList,
  getRollupDisplay
} from '@evershop/evershop/oms/services';

const orderStatuses = getOrderStatusList();
const paymentStatuses = getPaymentStatusList();
const shipmentStatuses = getShipmentStatusList();

// Display name + badge for the seven order-level rollup values. The rollup
// values are NOT in getShipmentStatusList().
const rollupDisplay = getRollupDisplay();
```

### Alternative: JSON Configuration

You can also define statuses in config files. This is useful for store-level customization rather than extensions:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "paymentStatus": {
        "my_custom_status": {
          "name": "Custom Status",
          "badge": "warning"
        }
      },
      "psoMapping": {
        "my_custom_status:*": "processing"
      }
    }
  }
}
```

### Status Properties

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Applies to</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td><code>string</code></td><td>All</td><td>Display name in the admin panel (required)</td></tr>
    <tr><td><code>badge</code></td><td><code>string</code></td><td>All</td><td>Visual style (required). See below.</td></tr>
    <tr><td><code>phase</code></td><td><code>string</code></td><td>Shipment status</td><td><strong>Required.</strong> One of <code>shipped</code>, <code>delivered</code>, <code>canceled</code></td></tr>
    <tr><td><code>isDefault</code></td><td><code>boolean</code></td><td>Order, payment status</td><td>Whether this is the initial status for new orders</td></tr>
    <tr><td><code>isCancelable</code></td><td><code>boolean</code></td><td>Payment status</td><td>When <code>true</code>, entering this status can trigger payment cancellation logic</td></tr>
    <tr><td><code>next</code></td><td><code>string[]</code></td><td>Order status</td><td>Allowed transitions from this status</td></tr>
  </tbody>
</table>

There is no `progress` property — it is not read anywhere. Shipment statuses accept neither `isDefault` nor `isCancelable`.

### Badge Values

`badge` maps to a variant of the shared `Badge` component (`components/common/ui/Badge.tsx`). Use one of:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Value</th>
      <th>Typical use</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>default</code></td><td>Neutral / in-progress</td></tr>
    <tr><td><code>success</code></td><td>Paid, delivered, completed</td></tr>
    <tr><td><code>warning</code></td><td>Needs attention, in transit</td></tr>
    <tr><td><code>destructive</code></td><td>Canceled, refunded, failed</td></tr>
    <tr><td><code>outline</code></td><td>Closed / archived</td></tr>
  </tbody>
</table>

`attention` and `critical` are **not** valid badge values — they were never variants of the `Badge` component and fall back to the default style.

### Reacting to Payment Status Changes

Hook into `changePaymentStatus` to perform actions when a payment status changes (e.g., cancel an authorization):

```ts title="extensions/my-payment/src/bootstrap.ts"
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

export default async () => {
  hookAfter('changePaymentStatus', async (order, orderId, status) => {
    if (status !== 'canceled') return;
    if (order.payment_method !== 'my_gateway') return;

    await myProvider.cancelPayment(orderId);
  });
};
```

## Updating Statuses Programmatically

### Update Payment Status

```ts
import { updatePaymentStatus } from '@evershop/evershop/oms/services';

// updatePaymentStatus(orderId: number, status: string, conn?: PoolClient)
await updatePaymentStatus(orderId, 'paid', connection);
// This automatically triggers order status resolution
```

The `conn` argument is optional. When omitted, the function opens and commits its own transaction; when supplied, it joins the caller's transaction.

### Update Shipment Status

```ts
import { updateShipmentStatus } from '@evershop/evershop/oms/services';

// updateShipmentStatus(shipmentUuid: string, status: string, conn?: PoolClient)
await updateShipmentStatus(shipmentUuid, 'delivered', connection);
```

:::warning
The first argument is the **shipment's `uuid`**, not an order ID. The function operates on one shipment row: it validates the status, enforces the phase transition, stamps the matching timestamp column (`shipped_at` / `delivered_at` / `canceled_at`), then recomputes `order.shipment_status` for the parent order — which in turn re-runs the PSO mapping and updates `order.status`.
:::

It also emits two events:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Event</th>
      <th>Payload</th>
      <th>When</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipment_status_changed</code></td>
      <td><code>{'{ shipmentId, orderId, from, to, phase }'}</code></td>
      <td>Every status change</td>
    </tr>
    <tr>
      <td><code>shipment_delivered</code></td>
      <td><code>{'{ shipmentId, orderId }'}</code></td>
      <td>Only when the new status is in the <code>delivered</code> phase</td>
    </tr>
  </tbody>
</table>

### The `order_status_updated` Event

When the order status changes, an `order_status_updated` event is emitted:

```ts
// Event data:
{
  orderId: number;
  before: string;  // Previous order status
  after: string;   // New order status
}
```

You can subscribe to this event to trigger custom logic (e.g., send a notification email):

```ts title="extensions/my-ext/src/subscribers/order_status_updated/notify.ts"
export default async function (data) {
  if (data.after === 'completed') {
    // Send order completion email
  }
}
```

## See Also

- [Multi-Shipment and Fulfillment](./multi-shipment-and-fulfillment) — Shipments, the rollup math, and carriers
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — How to build payment gateways
- [Configuration Guide](/docs/development/knowledge-base/configuration-guide) — OMS configuration reference
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — React to status changes

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
