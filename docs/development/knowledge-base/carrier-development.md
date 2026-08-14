---
sidebar_position: 46
keywords:
  - carrier
  - shipping label
  - tracking
  - fulfillment
  - shipment
  - registerCarrier
sidebar_label: Carrier Development
title: Carrier Development
description: Build a carrier integration for EverShop — register it at bootstrap, implement optional label, tracking and pickup capabilities, and drive shipment status from carrier events.
---

# Carrier Development

A **carrier** is the fulfillment-time counterpart to a shipping provider. Where a provider answers *"what can I offer this cart and what does it cost?"* at checkout, a carrier answers *"take this shipment — give me a label and a tracking number, and tell me when its status changes."*

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Primitive</th>
      <th>Runs at</th>
      <th>Answers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Shipping provider</td>
      <td>Checkout (quote time)</td>
      <td>Which methods can I offer this cart, and what do they cost?</td>
    </tr>
    <tr>
      <td>Carrier</td>
      <td>Shipment creation (fulfillment time)</td>
      <td>Produce a label and tracking number; report live status.</td>
    </tr>
  </tbody>
</table>

The two registrations are independent. A FedEx extension typically registers **both** — a provider so customers see FedEx-quoted rates, and a carrier so admins get labels and live tracking — sharing one internal API client. An aggregator like Shippo registers one provider and one carrier that fans out to dozens of underlying carriers. A tracking-only integration registers just a carrier.

## Breaking change: unregistered carrier codes now throw

:::danger Read this first
`createShipment` validates the carrier code against the registry. Any code that is not registered throws:

```
Unknown carrier '<code>'. Install or register the carrier extension first.
```

Before 2.2, `carrier` on a shipment was a free-text config value — a store could type `dhl`, `royal-mail`, or anything else. Those strings now have nothing to resolve against. **The four pretend built-ins (`default`, `fedex`, `usps`, `ups`) were removed**, so a store that relied on them will fail to create shipments until a real carrier is registered.
:::

What breaks and how to fix it:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Situation</th>
      <th>Result</th>
      <th>Fix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Admin ships with a free-text carrier string</td>
      <td><code>createShipment</code> throws before any DB write</td>
      <td>Use the built-in <code>custom</code> carrier, or install/write a carrier extension that registers that code</td>
    </tr>
    <tr>
      <td>An integration calls <code>createShipment</code> with the old positional signature</td>
      <td>Throws — the legacy <code>(orderUuid, carrier, trackingNumber)</code> form is removed</td>
      <td>Pass the payload object: <code>createShipment(orderUuid, &#123; items, carrier, tracking_number? &#125;)</code></td>
    </tr>
    <tr>
      <td>Existing shipment rows carry an unregistered carrier code</td>
      <td>No throw. <code>Shipment.carrierName</code> resolves to <code>null</code>, <code>Shipment.trackingUrl</code> to <code>null</code></td>
      <td>Historical rows are inert and safe; register the carrier to restore display and tracking links</td>
    </tr>
  </tbody>
</table>

Validation happens in `validateShipmentItems`, in **phase 1** of `createShipment` — before the transaction opens and before any label is purchased. There is no partial state to clean up.

### The built-in `custom` carrier

Core registers exactly one carrier, from `modules/oms/bootstrap.ts`:

```ts
registerCarrier({
  code: 'custom',
  name: 'Custom / Other',
  description:
    'Generic fallback for shipping without a specific carrier integration.'
});
```

It implements **no** capability methods. It exists so the admin carrier dropdown is never empty out of the box, and so a shop can record "yes, a shipment exists" with no carrier-side artifact at all. It is not a pretend integration — it is an explicit *"no integration"* marker. Shipments created against it get `tracking_number = null` unless the admin supplies one, and every tracking-related UI element stays hidden.

## Registering a carrier

```ts title="extensions/my-carrier/src/bootstrap.ts"
import { registerCarrier } from '@evershop/evershop/oms/services';

export default async () => {
  registerCarrier({
    code: 'acme-express',
    name: 'ACME Express',
    description: 'Regional overnight courier.',
    generateTrackingUrl: ({ trackingNumber }) =>
      `https://track.acme.example/${encodeURIComponent(trackingNumber)}`
  });
};
```

Implementation: `modules/oms/services/carrier/registry.ts`. The registry is a plain in-memory `Map` — **it persists nothing**. There is no `carrier` DB table, no admin carrier-settings page, and no global enable/disable toggle. A merchant who does not want to use a carrier simply does not select it in the ship dialog and does not set it as a method's `default_carrier_code`; both of those are real persisted choices, so a separate toggle would have been duplicate state.

Secrets and per-shop configuration read from `process.env` inside your extension. Core provides no carrier-config storage.

### Registration throws

```ts
// 1. Called after bootstrap — locked in bin/lib/startUp.js alongside hooks
//    and the processor registry: lockHooks(); lockRegistry(); lockCarrierRegistry();
// Error: Cannot register carrier 'acme-express' after bootstrap.
//        Call registerCarrier from your extension's bootstrap.ts.

// 2. Missing code or name.
// Error: registerCarrier requires both code and name. Got: {"code":"x"}

// 3. Duplicate code across installed extensions.
// Error: Carrier with code 'fedex' is already registered.
//        Codes must be unique across all installed extensions.
```

### Reading the registry

```ts
import { getCarrier, getAllCarriers } from '@evershop/evershop/oms/services';

const carrier = getCarrier('acme-express'); // Carrier | undefined
const all = getAllCarriers();               // Carrier[]
```

Both are **synchronous** — unlike the shipping-provider registry, which is async. `getCarrier(null)` and `getCarrier(undefined)` return `undefined` rather than throwing.

## The `Carrier` interface

Defined in `modules/oms/types/carrier.ts`; the types are re-exported from `@evershop/evershop/oms/services`.

```ts
export interface Carrier {
  /** Stable code, lowercase, kebab/snake — e.g. `fedex`, `dhl-express`. */
  code: string;
  name: string;
  description?: string;

  generateTrackingUrl?: (ctx: CarrierMethodContext) => string | null;
  createLabel?: (input: CreateLabelInput) => Promise<LabelResult>;
  voidLabel?: (ctx: CarrierMethodContext) => Promise<void>;
  fetchStatus?: (ctx: CarrierMethodContext) => Promise<TrackingResult | null>;
  schedulePickup?: (request: PickupRequest) => Promise<PickupResult>;
}
```

**All five capability methods are optional.** Only `code` and `name` are required. A regional courier with no API registers `generateTrackingUrl` alone and everything else stays dark in the admin UI. This is the central design point: you implement exactly what your carrier supports, and the platform adapts.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Capability</th>
      <th>Sync?</th>
      <th>Called by</th>
      <th>What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>generateTrackingUrl</code></td>
      <td>Yes</td>
      <td><code>Shipment.trackingUrl</code> GraphQL resolver, shipment emails</td>
      <td>Pure URL composition. Returns <code>null</code> if the carrier has no public tracking page.</td>
    </tr>
    <tr>
      <td><code>createLabel</code></td>
      <td>No</td>
      <td><code>createShipment</code>, phase 1</td>
      <td>Purchase postage. Must throw on failure.</td>
    </tr>
    <tr>
      <td><code>voidLabel</code></td>
      <td>No</td>
      <td><code>voidShipmentLabel</code>; also the compensating path in <code>createShipment</code></td>
      <td>Refund/cancel a purchased label.</td>
    </tr>
    <tr>
      <td><code>fetchStatus</code></td>
      <td>No</td>
      <td>Your own polling job or webhook handler</td>
      <td>Read live status. Returns <code>null</code> for "no scans yet".</td>
    </tr>
    <tr>
      <td><code>schedulePickup</code></td>
      <td>No</td>
      <td>Admin bulk operations</td>
      <td>Book a collection.</td>
    </tr>
  </tbody>
</table>

### `CarrierMethodContext` — the durable envelope

Every method that operates on an **existing** shipment receives the same three-field envelope, read straight off the shipment row:

```ts
export interface CarrierMethodContext {
  trackingNumber: string;
  carrierShipmentId?: string;
  metadata?: Record<string, unknown>;
}
```

None of it is derived from request input. `carrierShipmentId` matters because carriers like UPS void and query by their own internal shipment id, not the customer-visible tracking number. `metadata` is how aggregators identify the underlying sub-carrier without re-querying their own side tables — a Shippo carrier reads `ctx.metadata.underlyingCarrier` to pick the right tracking URL template.

Carriers must never need to dereference core-internal shipment ids. That would force DB access inside a carrier, which the envelope exists to avoid.

### `createLabel` input and result

```ts
export interface CreateLabelInput {
  orderNumber: string;
  orderId: number;
  shipFrom: CarrierAddress;
  shipTo: CarrierAddress;
  items: CarrierItem[];
  parcel?: Parcel;
  /** Service code in the carrier's vocabulary. Optional. */
  serviceCode?: string;
}

export interface LabelResult {
  trackingNumber: string;
  labelUrl: string;
  labelFormat: string;
  carrierShipmentId?: string;
  metadata?: Record<string, unknown>;
  /** Aggregator-supplied public tracking page. Wins over generateTrackingUrl. */
  trackingUrl?: string;
}
```

Note there is **no `shipmentId`** on the input. `createLabel` is called *before* the shipment row is inserted — the network call happens outside the transaction so a failed insert can void the label cleanly. Correlate via `orderNumber` / `orderId`.

`CarrierItem` carries per-unit `weight` (from `order_item.product_weight`, in the store weight unit), per-unit `unitPrice` (from `order_item.final_price` — the tax-exclusive post-discount transaction value, the correct customs basis, in the order's currency), and `dimensions` snapshotted on the order item at placement. Customs-aware carriers never have to guess declared values.

`Parcel` is per-shipment: weight is goods **plus** packaging tare, while per-item weights stay goods-only, so tare enters the label exactly once.

**`labelUrl` is required and must be a URL.** EverShop never stores label binaries. Shippo, EasyPost and FedEx all host the PDF on their own CDN. If your upstream returns raw bytes, upload them to your own storage and return that URL — that is your extension's job, not core's.

### `fetchStatus` result

```ts
export interface TrackingResult {
  /** A code in the CARRIER's vocabulary, e.g. `out_for_delivery`. */
  statusCode: string;
  message?: string;
  location?: string;
  /** Carrier-reported phase, when known. Optional sanity check. */
  phase?: ShipmentPhase;
}
```

Core does not call `fetchStatus` for you. Polling loops and webhook routes are extension territory — see [Driving status from carrier events](#driving-status-from-carrier-events).

## Capabilities and the capability-gated admin UI

Core derives a capability snapshot by testing which methods are functions:

```ts
export function getCarrierCapabilities(c: Carrier): CarrierCapabilities {
  return {
    generateTrackingUrl: typeof c.generateTrackingUrl === 'function',
    createLabel: typeof c.createLabel === 'function',
    voidLabel: typeof c.voidLabel === 'function',
    fetchStatus: typeof c.fetchStatus === 'function',
    schedulePickup: typeof c.schedulePickup === 'function'
  };
}
```

`getCarrierCapabilities` lives in `modules/oms/types/carrier.ts` and is used internally by the admin GraphQL resolver; it is not part of the published package export surface. What extensions consume is the **admin GraphQL surface** it produces:

```graphql
type Carrier {
  code: String!
  name: String!
  description: String
  capabilities: CarrierCapabilities!
}

type CarrierCapabilities {
  generateTrackingUrl: Boolean!
  createLabel: Boolean!
  voidLabel: Boolean!
  fetchStatus: Boolean!
  schedulePickup: Boolean!
}

extend type Query {
  carriers: [Carrier!]!
  carrier(code: String!): Carrier
}
```

Both queries read the in-memory registry directly — no DB join, no persisted carrier state. The type is **admin-schema only** (`Carrier.admin.graphql`); the storefront never sees it. That is also why `Shipment` exposes carrier information as two flat server-resolved scalars, `carrierName` and `trackingUrl`, rather than a `Carrier` object reference: referencing an admin-only type from a storefront-visible type would fail the storefront schema build.

The admin UI conditions every tracking-related element on that snapshot:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>UI element</th>
      <th>Shown when</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Tracking-number input (create + edit forms)</td>
      <td><code>hasTrackingCapability(carrier)</code> — any of <code>generateTrackingUrl</code>, <code>createLabel</code>, <code>voidLabel</code>, <code>fetchStatus</code></td>
    </tr>
    <tr>
      <td>"Track →" link on the shipment row</td>
      <td><code>Shipment.trackingUrl !== null</code></td>
    </tr>
    <tr>
      <td>"Print Label" button</td>
      <td><code>Shipment.labelUrl !== null</code></td>
    </tr>
    <tr>
      <td>"Void Label" button</td>
      <td>Carrier has <code>voidLabel</code>, a label exists, and the shipment is still in the <code>shipped</code> phase</td>
    </tr>
    <tr>
      <td>"Generate shipping label" option in the ship dialog</td>
      <td>Carrier has <code>createLabel</code></td>
    </tr>
  </tbody>
</table>

The predicate lives in one place — `hasTrackingCapability` in `modules/oms/pages/admin/orderEdit/Shipments/carrierCaps.ts`. The rule: if a carrier implements none of the four tracking-related methods, prompting for a tracking number is misleading, because nothing would ever consume it. That is exactly the `custom` carrier's situation.

## Where the results persist

`createShipment` writes the `LabelResult` onto the `shipment` row:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Column</th>
      <th>From</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipment.tracking_number</code></td>
      <td><code>LabelResult.trackingNumber</code>, or the admin-supplied value</td>
      <td>Customer-visible tracking number. Nullable.</td>
    </tr>
    <tr>
      <td><code>shipment.label_url</code></td>
      <td><code>LabelResult.labelUrl</code></td>
      <td>Carrier-hosted label URL. Never the binary. Null when the admin supplied their own tracking number.</td>
    </tr>
    <tr>
      <td><code>shipment.label_format</code></td>
      <td><code>LabelResult.labelFormat</code></td>
      <td>MIME type — <code>application/pdf</code>, <code>image/png</code>, <code>application/zpl</code> — so the admin knows what to render on Print.</td>
    </tr>
    <tr>
      <td><code>shipment.carrier_shipment_id</code></td>
      <td><code>LabelResult.carrierShipmentId</code></td>
      <td>Carrier's internal shipment id (e.g. UPS's <code>ShipmentIdentificationNumber</code>). Passed back on every later call.</td>
    </tr>
    <tr>
      <td><code>shipment.carrier_metadata</code></td>
      <td><code>LabelResult.metadata</code></td>
      <td>Aggregator blob — underlying carrier, rate id, label id. Passed back as <code>ctx.metadata</code>.</td>
    </tr>
    <tr>
      <td><code>shipment.tracking_url</code></td>
      <td><code>LabelResult.trackingUrl</code></td>
      <td>Persisted public tracking page. <strong>Wins over <code>generateTrackingUrl</code></strong> when set.</td>
    </tr>
    <tr>
      <td><code>shipment.carrier</code></td>
      <td><code>CreateShipmentPayload.carrier</code></td>
      <td>The registry code. Soft reference — no FK, so uninstalling an extension leaves history intact.</td>
    </tr>
  </tbody>
</table>

The `Shipment.trackingUrl` resolver applies persisted-wins precedence:

```ts
if (trackingUrl) return trackingUrl;          // persisted from LabelResult
if (!trackingNumber) return null;
const c = getCarrier(carrier);
return c?.generateTrackingUrl?.({
  trackingNumber,
  carrierShipmentId: carrierShipmentId ?? undefined,
  metadata: carrierMetadata ?? undefined
}) ?? null;
```

Aggregators must return `trackingUrl` from `createLabel`. `generateTrackingUrl` is synchronous and the envelope deliberately carries no underlying-carrier hint, so an aggregator cannot reconstruct the URL after the fact.

`voidShipmentLabel(shipmentUuid, conn?)` clears `label_url` and `label_format` but **keeps `tracking_number`** — the carrier may still surface the original purchase in their portal. It refuses when there is no label, when the carrier is unregistered or lacks `voidLabel`, or when the shipment has left the `shipped` phase (a delivered or canceled label cannot be voided). It emits `shipment_label_voided`.

## `createShipment`: the two-phase flow

```ts
import { createShipment } from '@evershop/evershop/oms/services';

await createShipment(orderUuid, {
  items: [{ order_item_id: 42, qty: 2 }],
  carrier: 'acme-express',
  tracking_number: undefined,  // omit to trigger createLabel
  notifyCustomer: true         // default true
});
```

**Phase 1 — no DB writes, no lock held.** Load the order. Validate `items` is non-empty, reject digital items, check per-item qty against what is already shipped across non-canceled shipments, and validate the carrier is registered. Then resolve the tracking number:

- `tracking_number` supplied → use it, no carrier call.
- absent **and** the carrier implements `createLabel` → build a `CreateLabelInput` and call the carrier **outside the transaction**.
- absent **and** the carrier has no `createLabel` → create the shipment with `tracking_number = null`. This is the `custom` carrier path, and every downstream consumer degrades gracefully.

**Phase 2 — transaction with a per-order advisory lock.** Acquire `pg_advisory_xact_lock`, re-validate quantities under the lock (a concurrent admin may have committed an overlapping shipment), insert the `shipment` row with `status = 'shipped'`, insert `shipment_item` rows, recompute the order rollup, write an activity log, commit.

**Post-commit.** Emit `shipment_created` (`{ shipmentId, orderId, notifyCustomer }`) and, when a label was purchased, `shipment_label_created` (`{ shipmentId, orderId, labelUrl, trackingNumber }`).

Why the label call sits outside the transaction: it is an HTTP request that can take seconds or hang. Holding an open Postgres connection **and** the per-order advisory lock for that window would block every other shipment operation on the order. The trade-off is that a label can be purchased and the insert can still fail — so the failure path calls `carrier.voidLabel` as compensation, and logs the orphan tracking number if the carrier has no void support.

That is the practical reason to implement `voidLabel` whenever your carrier's API allows it.

New shipments land in the **`shipped`** phase directly. There is no pre-ship reservation state: stock is deducted at order placement, so a shipment row exists if and only if something actually shipped.

## Shipment statuses and `CANONICAL_SHIPMENT_STATUSES`

Every shipment status declares a **phase** — one of `pending | shipped | delivered | canceled`. The phase enum is hardcoded and drives the order-level rollup math; statuses on top of it are extensible.

Core ships three:

```ts
shipped:   { name: 'Shipped',   badge: 'warning',     phase: 'shipped'   }
delivered: { name: 'Delivered', badge: 'success',     phase: 'delivered' }
canceled:  { name: 'Canceled',  badge: 'destructive', phase: 'canceled'  }
```

Carrier extensions almost always need more. To stop every extension inventing its own vocabulary, core exports a recommended set aligned with the AfterShip / Shippo / EasyPost conventions:

```ts
import {
  CANONICAL_SHIPMENT_STATUSES,
  getShipmentStatusList,
  registerShipmentStatus
} from '@evershop/evershop/oms/services';

// In your extension's bootstrap:
for (const [code, detail] of Object.entries(CANONICAL_SHIPMENT_STATUSES)) {
  if (!getShipmentStatusList()[code]) {
    registerShipmentStatus(code, detail);
  }
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Code</th>
      <th>Name</th>
      <th>Phase</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>in_transit</code></td><td>In Transit</td><td><code>shipped</code></td></tr>
    <tr><td><code>out_for_delivery</code></td><td>Out for Delivery</td><td><code>shipped</code></td></tr>
    <tr><td><code>attempt_fail</code></td><td>Delivery Attempt Failed</td><td><code>shipped</code></td></tr>
    <tr><td><code>available_for_pickup</code></td><td>Available for Pickup</td><td><code>shipped</code></td></tr>
    <tr><td><code>exception</code></td><td>Exception</td><td><code>shipped</code></td></tr>
    <tr><td><code>returned</code></td><td>Returned</td><td><code>canceled</code></td></tr>
    <tr><td><code>expired</code></td><td>Expired</td><td><code>canceled</code></td></tr>
  </tbody>
</table>

:::caution
Core does **not** auto-register these — that is the extension's call. `registerShipmentStatus` throws on a duplicate code, so two extensions registering the same status without the `getShipmentStatusList()` guard will break the second one's bootstrap. Always guard.

`delivered` is deliberately absent from the constant: the `delivered` phase has one canonical name and core already registers it.
:::

`registerShipmentStatus(id, detail, psoMapping?)` validates that `id` is non-empty and space-free and that `detail.phase` is one of the valid phases. `isDefault` and `isCancelable` are **not** part of the shipment-status shape — the initial status is decided by `createShipment`, and cancelability is driven by the order-level `oms.order.shipmentRollupCancelable` config map.

## Driving status from carrier events

Core owns no polling loop and no webhook route. Your extension runs its own [cron job](./cron-jobs) or [API route](./api-routes), calls `fetchStatus` (or receives a webhook), and converges through one helper:

```ts
import { updateShipmentStatusFromCarrier } from '@evershop/evershop/oms/services';

await updateShipmentStatusFromCarrier(
  'acme-express',        // carrierCode
  '1Z999AA10123456784',  // trackingNumber
  'out_for_delivery',    // a REGISTERED shipment status code
  {                      // optional CarrierStatusMeta
    message: 'On vehicle for delivery',
    location: 'Distribution Center, Newark NJ',
    timestamp: '2026-08-11T07:02:00Z'
  }
);
```

What it does, in order:

1. Returns early if any of `carrierCode` / `trackingNumber` / `statusCode` is missing.
2. Logs (but does **not** refuse) when the carrier is not registered — an extension may be uninstalled while its webhook endpoint still receives in-flight events.
3. Validates `statusCode` against `oms.order.shipmentStatus`. **Unknown codes are logged and silently ignored** — carriers emit vocabulary you may not track. Map the carrier's codes onto registered ones before calling.
4. Finds the most-recent **non-terminal** shipment for `(carrier, tracking_number)`. Terminal phases (`delivered`, `canceled`) are excluded so a stale webhook cannot reactivate a closed shipment. Newest wins if several match.
5. Calls `updateShipmentStatus(uuid, statusCode)`. Phase-impossible transitions (`delivered → shipped` from an out-of-order webhook) throw inside that service; the helper logs and swallows them.
6. Appends `meta.message` / `meta.location` to the order activity log.

**It returns `void` and never throws.** That is the point: a polling loop or webhook handler can iterate over hundreds of shipments without a single bad event 500-ing the caller.

It is `hookable` as `updateShipmentStatusFromCarrier`, with `hookBeforeUpdateShipmentStatusFromCarrier` / `hookAfterUpdateShipmentStatusFromCarrier` exported alongside it.

Downstream, `updateShipmentStatus` sets the first-occurrence timestamps (`shipped_at`, `delivered_at`, `canceled_at` — never cleared once set), recomputes the order's `shipment_status` rollup, and emits `shipment_status_changed` (`{ shipmentId, orderId, from, to, phase }`) plus `shipment_delivered` when the new phase is `delivered`.

## The provider ↔ carrier bridge

Two nullable columns on `core_shipping_method` let a merchant pre-wire fulfillment from the checkout method:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Column</th>
      <th>Threads to</th>
      <th>Consumed by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>default_carrier_code</code></td>
      <td><code>shipping_method_data.snapshot.carrier</code></td>
      <td>The New Shipment dialog, to pre-select the carrier dropdown</td>
    </tr>
    <tr>
      <td><code>default_service_code</code></td>
      <td><code>shipping_method_data.snapshot.serviceCode</code></td>
      <td><code>createShipment.buildCreateLabelInput</code>, written onto <code>CreateLabelInput.serviceCode</code></td>
    </tr>
  </tbody>
</table>

Both are **soft hints, never customer-facing** — pure fulfillment metadata. The service code is free-form varchar because service vocabularies are carrier-specific (`FEDEX_GROUND`, `usps_priority`); core does not validate it. When the merchant sets one, the label is bought for exactly the service the customer paid for; when they do not, `CreateLabelInput.serviceCode` is `undefined` and your carrier falls through to its own default.

Any provider can populate the same fields by returning `carrier` and `serviceCode` on its `ShippingMethod` objects — the core provider just happens to source them from admin-managed columns. See [Shipping Provider Development](./shipping-provider-development).

## Worked example: a complete carrier

A carrier with four of the five capabilities, reading its credentials from the environment.

```ts title="extensions/acme-carrier/src/bootstrap.ts"
import { registerCarrier } from '@evershop/evershop/oms/services';
import type {
  Carrier,
  CarrierMethodContext,
  CreateLabelInput,
  LabelResult,
  TrackingResult
} from '@evershop/evershop/oms/services';

const API = 'https://api.acme.example/v1';

function credentials(): { key: string; account: string } {
  const key = process.env.ACME_API_KEY;
  const account = process.env.ACME_ACCOUNT_NUMBER;
  if (!key || !account) {
    throw new Error(
      'acme-express requires ACME_API_KEY and ACME_ACCOUNT_NUMBER in the environment.'
    );
  }
  return { key, account };
}

async function call<T>(path: string, body: unknown): Promise<T> {
  const { key } = credentials();
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    // Throwing is required: createShipment relies on it to roll back cleanly.
    throw new Error(`ACME ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

const acmeCarrier: Carrier = {
  code: 'acme-express',
  name: 'ACME Express',
  description: 'Regional overnight courier with label printing and tracking.',

  // Synchronous, pure composition. No network, no credentials.
  generateTrackingUrl({ trackingNumber }: CarrierMethodContext): string | null {
    if (!trackingNumber) return null;
    return `https://track.acme.example/${encodeURIComponent(trackingNumber)}`;
  },

  async createLabel(input: CreateLabelInput): Promise<LabelResult> {
    const { account } = credentials();
    const res = await call<{
      tracking: string;
      label: { url: string; mime: string };
      shipment_id: string;
      rate_id: string;
    }>('/shipments', {
      account,
      reference: input.orderNumber,
      // serviceCode arrives from core_shipping_method.default_service_code via
      // the order's shipping-method snapshot. Undefined → ACME's own default.
      service: input.serviceCode ?? 'ACME_OVERNIGHT',
      from: input.shipFrom,
      to: input.shipTo,
      parcel: input.parcel,
      customs: input.items.map((i) => ({
        sku: i.sku,
        description: i.name,
        quantity: i.qty,
        unit_weight: i.weight,
        unit_value: i.unitPrice
      }))
    });

    return {
      trackingNumber: res.tracking,
      // Must be a URL — EverShop never stores label binaries.
      labelUrl: res.label.url,
      labelFormat: res.label.mime,
      // Persisted to shipment.carrier_shipment_id; ACME voids by this, not by
      // the tracking number.
      carrierShipmentId: res.shipment_id,
      // Persisted to shipment.carrier_metadata; handed back on every later call.
      metadata: { rateId: res.rate_id }
    };
  },

  async voidLabel(ctx: CarrierMethodContext): Promise<void> {
    await call('/shipments/void', {
      shipment_id: ctx.carrierShipmentId,
      tracking: ctx.trackingNumber
    });
  },

  async fetchStatus(ctx: CarrierMethodContext): Promise<TrackingResult | null> {
    const res = await call<{
      status: string;
      description?: string;
      location?: string;
    }>('/tracking', { tracking: ctx.trackingNumber });

    // No scans yet.
    if (!res.status) return null;

    return {
      statusCode: res.status,
      message: res.description,
      location: res.location
    };
  }

  // schedulePickup intentionally not implemented — ACME has no pickup API,
  // so the admin bulk-pickup action stays hidden for this carrier.
};

export default async () => {
  registerCarrier(acmeCarrier);
};
```

Register the statuses this carrier can emit, in the same bootstrap:

```ts title="extensions/acme-carrier/src/bootstrap.ts (continued)"
import {
  CANONICAL_SHIPMENT_STATUSES,
  getShipmentStatusList,
  registerShipmentStatus
} from '@evershop/evershop/oms/services';

export default async () => {
  registerCarrier(acmeCarrier);

  // Guarded: another carrier extension may have registered these already.
  for (const [code, detail] of Object.entries(CANONICAL_SHIPMENT_STATUSES)) {
    if (!getShipmentStatusList()[code]) {
      registerShipmentStatus(code, detail);
    }
  }
};
```

And the polling job that closes the loop:

```ts title="extensions/acme-carrier/src/services/pollAcmeTracking.ts"
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';
import {
  getCarrier,
  updateShipmentStatusFromCarrier
} from '@evershop/evershop/oms/services';

const STATUS_MAP: Record<string, string> = {
  PICKED_UP: 'in_transit',
  IN_TRANSIT: 'in_transit',
  ON_VEHICLE: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED_ATTEMPT: 'attempt_fail',
  RETURNED_TO_SENDER: 'returned'
};

export async function pollAcmeTracking(): Promise<void> {
  const carrier = getCarrier('acme-express');
  if (!carrier?.fetchStatus) return;

  const shipments = await select()
    .from('shipment')
    .where('carrier', '=', 'acme-express')
    .and('status', 'IN', ['shipped', 'in_transit', 'out_for_delivery'])
    .execute(pool);

  for (const s of shipments) {
    if (!s.tracking_number) continue;
    const result = await carrier.fetchStatus({
      trackingNumber: s.tracking_number,
      carrierShipmentId: s.carrier_shipment_id ?? undefined,
      metadata: s.carrier_metadata ?? undefined
    });
    if (!result) continue;

    const mapped = STATUS_MAP[result.statusCode];
    if (!mapped) continue; // unknown ACME code — nothing registered for it

    // Never throws. Bad events are logged and skipped.
    await updateShipmentStatusFromCarrier(
      'acme-express',
      s.tracking_number,
      mapped,
      { message: result.message, location: result.location }
    );
  }
}
```

Wire it up with `registerJob` from your bootstrap — see [Cron Jobs](./cron-jobs).

With this carrier installed, the admin UI lights up: the ship dialog offers "Generate shipping label", the shipment row shows "Track →" and "Print Label", and "Void Label" appears while the shipment is still in the `shipped` phase. Swap in a carrier that only implements `generateTrackingUrl` and every one of those except "Track →" disappears — no UI code changes required.

## See Also

- [Shipping Provider Development](./shipping-provider-development) — the quote-time counterpart, and the `default_carrier_code` / `default_service_code` bridge
- [Order Status Management](./order-status-management) — statuses, phases, and the PSO mapping
- [Events and Subscribers](./events-and-subscribers) — reacting to `shipment_created`, `shipment_status_changed`, `shipment_delivered`
- [Cron Jobs](./cron-jobs) — running a tracking poller
- [API Routes](./api-routes) — exposing a carrier webhook endpoint
- [Registry and Processors](./registry-and-processors) — how registration and the bootstrap lock work

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
