---
sidebar_position: 45
keywords:
  - shipping provider
  - shipping method
  - shipping rates
  - carrier rates
  - checkout
  - registerShippingProvider
sidebar_label: Shipping Provider Development
title: Shipping Provider Development
description: Build a custom shipping provider for EverShop — register it at bootstrap, implement getMethods, and return live rates to the checkout.
---

# Shipping Provider Development

A **shipping provider** answers one question at checkout: *given this cart and this destination, which shipping methods can I offer and what do they cost?*

Providers are registered in memory at bootstrap, exactly like payment methods and email services. EverShop ships one built-in provider — `core` — backed by admin-configured rates. Everything a third-party integration (USPS, FedEx, EasyPost, Shippo) needs is the same public contract the core provider uses.

:::caution Breaking change in 2.2
The flat `Zone → Method → Rate` model is gone. The `shipping_method` and `shipping_zone_method` tables were **dropped** by `modules/checkout/migration/Version-1.0.9.ts`, along with `cart.shipping_method`, `cart.shipping_method_name`, `order.shipping_method`, `order.shipping_method_name` and `shipping_zone.country`. The `calculate_api` HTTP callback escape hatch is gone too — writing a provider replaces it. See [Migrating from the pre-2.2 model](#migrating-from-the-pre-22-model).
:::

## The model

```
shipping_zone ──< shipping_zone_country      (multi-country zones)
      │        ──< shipping_zone_province
      │
      └──< shipping_zone_provider ──> (registered provider, by code)
                    │
                    └── config: jsonb        (per-zone provider config)
```

A zone is a geographic region. Providers **attach** to zones via `shipping_zone_provider` rows. Attachment carries a soft `provider_code varchar` — not a foreign key — so uninstalling a provider extension leaves inert orphan rows rather than a broken FK.

There is no `shipping_provider` table and no global enable/disable flag. **The in-memory registry is the only source of truth: installed means enabled.** Secrets and account credentials belong in `process.env`, read by the extension itself.

Methods are **not** modeled at the platform level. Each provider owns its own method storage — a table, an upstream API, or nothing at all — and synthesizes methods at runtime inside `getMethods`. The core provider happens to use two internal tables (`core_shipping_method`, `core_shipping_method_rate`); yours does not have to.

## Registering a provider

Call `registerShippingProvider` from your module's `bootstrap.ts`:

```ts title="extensions/my-shipping/src/bootstrap.ts"
import { registerShippingProvider } from '@evershop/evershop/checkout/services';
import type {
  ShippingContext,
  ShippingMethod
} from '@evershop/evershop/types/shippingProvider';

export default async () => {
  registerShippingProvider({
    code: 'flat_express',
    name: 'Flat Express',
    description: 'Single flat rate with a free-shipping threshold.',
    async getMethods(ctx: ShippingContext): Promise<ShippingMethod[]> {
      return [
        {
          code: 'FLAT_EXPRESS_STANDARD',
          name: 'Express (2-3 days)',
          cost: ctx.totalValue >= 100 ? 0 : 12.5
        }
      ];
    }
  });
};
```

### Registration throws

Two failure modes are eager and loud, both by design:

```ts
// 1. Duplicate code — a second extension claiming the same code.
registerShippingProvider({ code: 'core', name: 'Mine', getMethods });
// Error: Shipping provider "core" is already registered. Each provider must
// have a unique code across the system.

// 2. Called after bootstrap — e.g. from a middleware or a request handler.
// The registry is locked in bin/lib/startUp.js right after every module's
// bootstrap runs (lockHooks(); lockRegistry(); lockCarrierRegistry()).
// addProcessor throws on any later registration.
```

`registerShippingProvider` also validates the shape synchronously and throws if `code` or `name` is missing or non-string, or if `getMethods` is not a function.

Implementation: `modules/checkout/services/shipping/registry.ts`.

### Reading the registry

```ts
import {
  getAllShippingProviders,
  getShippingProvider
} from '@evershop/evershop/checkout/services';

const all = await getAllShippingProviders();       // ShippingProvider[]
const usps = await getShippingProvider('usps');    // ShippingProvider | undefined
```

Both are `async` — they resolve through the registry's `getValue` machinery. Order matches registration order, which follows alphabetical module load order.

## The `ShippingProvider` contract

Defined in `src/types/shippingProvider.ts`, importable from `@evershop/evershop/types/shippingProvider`.

```ts
export interface ShippingProvider {
  code: string;
  name: string;
  description?: string;
  zoneConfigFields?: ZoneConfigField[];

  getMethods(ctx: ShippingContext): Promise<ShippingMethod[]>;

  validateMethod?(
    ctx: ShippingContext,
    methodCode: string
  ): Promise<ShippingMethod | null>;

  quoteTtlSeconds?: number;
  quoteTimeoutMs?: number;
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Required</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>code</code></td>
      <td>Yes</td>
      <td>Unique across the system. Persisted on <code>shipping_zone_provider.provider_code</code> and on <code>shipping_method_data.provider_code</code>. Never change it after a release — stored carts and orders reference it.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>Yes</td>
      <td>Display name in the admin provider list and Attach Provider dialog.</td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td>No</td>
      <td>One-liner shown next to the name in admin.</td>
    </tr>
    <tr>
      <td><code>zoneConfigFields</code></td>
      <td>No</td>
      <td>Declares the per-zone configuration form. Values land in <code>shipping_zone_provider.config</code> and come back as <code>ctx.zoneConfig</code>.</td>
    </tr>
    <tr>
      <td><code>getMethods</code></td>
      <td>Yes</td>
      <td>Returns the methods available for this cart + address + zone.</td>
    </tr>
    <tr>
      <td><code>validateMethod</code></td>
      <td>No</td>
      <td>Cheap re-check of one previously selected method. Falls back to a <code>getMethods</code> scan.</td>
    </tr>
    <tr>
      <td><code>quoteTtlSeconds</code></td>
      <td>No</td>
      <td>Quote validity window. Omit for providers whose prices do not expire by time.</td>
    </tr>
    <tr>
      <td><code>quoteTimeoutMs</code></td>
      <td>No</td>
      <td>Per-provider budget for a single <code>getMethods</code> call. Defaults to 5000ms.</td>
    </tr>
  </tbody>
</table>

### `ShippingMethod`

What `getMethods` returns.

```ts
export interface ShippingMethod {
  code: string;
  name: string;
  cost: number;
  taxClass?: string;
  carrier?: string;
  serviceCode?: string;
  delivery?: DeliveryWindow;
  metadata?: Record<string, unknown>;
}

export interface DeliveryWindow {
  minBusinessDays?: number;
  maxBusinessDays?: number;
  /** ISO 8601 date string. */
  estimatedDate?: string;
}
```

Rules that matter:

- **`code` must be stable per provider.** The format is yours (core uses `core_shipping_method.uuid`; a carrier provider uses `USPS_PRIORITY`). Stability is what lets a stored `shipping_method_data.method_code` survive an address change.
- **`cost` must be in `ctx.currency`, tax-exclusive.** `ctx.currency` is directive, not informational. If you cannot quote in that currency, return `[]` and log.
- **`carrier` and `serviceCode` are fulfillment metadata**, threaded through to the shipment. `serviceCode` reaches `CreateLabelInput.serviceCode` at ship time — see [Carrier Development](./carrier-development).
- **`metadata` is opaque to core.** Use it for upstream quote IDs / rate IDs; it is carried verbatim into the stored snapshot.

### `ShippingContext` — the DTO principle

Providers **never** receive the `Cart` object. They never see `CartItem`, `DataObject`, or any class instance from the cart pipeline. The platform builds a plain, read-only DTO once per call and hands that over.

That decoupling is deliberate: your provider does not depend on internal data-loading or field-resolution machinery, so it stays portable and trivially unit-testable with a hand-written context literal.

```ts
export interface ShippingContext {
  origin: Address;
  destination: Address;
  zone: ShippingZoneRow;
  items: ShippingItem[];
  totalWeight: number;
  totalValue: number;
  currency: string;
  zoneConfig: Record<string, unknown>;
  providerConfig: Record<string, unknown>;
}

export interface ShippingItem {
  productId: number;
  sku: string;
  name: string;
  qty: number;
  /** Per-unit GOODS weight (no packaging tare). */
  weight: number;
  /** Tax-exclusive unit price. */
  unitPrice: number;
  /** qty × unitPrice. */
  lineTotal: number;
  noShippingRequired: boolean;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'mm' | 'in';
  };
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Source</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>origin</code></td>
      <td><code>getOriginAddress()</code> — composed from the store settings. Always defined, possibly incomplete.</td>
    </tr>
    <tr>
      <td><code>destination</code></td>
      <td>The cart's shipping address, or the <code>country</code>/<code>province</code>/<code>postcode</code> overrides passed to the rate calculator.</td>
    </tr>
    <tr>
      <td><code>zone</code></td>
      <td>The <code>shipping_zone</code> row currently being evaluated. One call per matching (zone, provider) pair.</td>
    </tr>
    <tr>
      <td><code>items</code></td>
      <td><code>serializeItems(cart)</code> — plain DTOs, numeric fields coerced from PostgreSQL <code>numeric</code> strings.</td>
    </tr>
    <tr>
      <td><code>totalWeight</code> / <code>totalValue</code></td>
      <td>Cart <code>total_weight</code> and <code>sub_total</code> (tax-exclusive).</td>
    </tr>
    <tr>
      <td><code>currency</code></td>
      <td>Cart currency, falling back to the store currency.</td>
    </tr>
    <tr>
      <td><code>zoneConfig</code></td>
      <td><code>shipping_zone_provider.config</code> for this attachment. <code>&#123;&#125;</code> when the provider declares no fields.</td>
    </tr>
    <tr>
      <td><code>providerConfig</code></td>
      <td>Always <code>&#123;&#125;</code>. Reserved — see below.</td>
    </tr>
  </tbody>
</table>

Built by `modules/checkout/services/shipping/buildShippingContext.ts`.

## Configuration: `zoneConfigFields`, not JSON Schema

The original design called for two JSON Schemas — a global `configSchema` and a per-zone `zoneConfigSchema`. **Neither shipped.** What actually exists in 2.2 is one purpose-built field list:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Design concept</th>
      <th>What exists in 2.2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>configSchema</code> (global provider config)</td>
      <td><strong>Removed.</strong> There is no <code>shipping_provider</code> table and no global config form. Secrets and account settings read from <code>process.env</code> inside your extension. <code>ctx.providerConfig</code> is always <code>&#123;&#125;</code>; it survives in the type only so destructuring extensions keep compiling.</td>
    </tr>
    <tr>
      <td><code>zoneConfigSchema</code> (per-zone JSON Schema)</td>
      <td>Replaced by <code>zoneConfigFields: ZoneConfigField[]</code> — an ordered list of field descriptors, not JSON Schema. Values persist to <code>shipping_zone_provider.config</code> (JSONB) and arrive as <code>ctx.zoneConfig</code>.</td>
    </tr>
  </tbody>
</table>

The list is purpose-built because the admin renders it with EverShop's own form components, so the vocabulary is exactly what those components support. Field order is render order.

```ts
export interface ZoneConfigField {
  /** Key in `shipping_zone_provider.config` (and `ctx.zoneConfig`). */
  name: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'toggle';
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string | number | boolean;
  /** Required when type is 'select', ignored otherwise. */
  options?: Array<{ value: string | number; label: string }>;
  /** 'toggle' only. */
  trueLabel?: string;
  falseLabel?: string;
  validation?: {
    required?: string;
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    /** `value` is a regex SOURCE string; the renderer compiles it. */
    pattern?: { value: string; message: string };
  };
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th><code>type</code></th>
      <th>Component</th>
      <th>Stored value</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>text</code></td><td><code>InputField</code></td><td>string</td></tr>
    <tr><td><code>number</code></td><td><code>NumberField</code></td><td>number</td></tr>
    <tr><td><code>textarea</code></td><td><code>TextareaField</code></td><td>string</td></tr>
    <tr><td><code>select</code></td><td><code>SelectField</code></td><td>value from <code>options</code></td></tr>
    <tr><td><code>toggle</code></td><td><code>ToggleField</code></td><td>boolean</td></tr>
  </tbody>
</table>

The descriptor list travels to the browser over the admin GraphQL type `ShippingProvider.zoneConfigFields` (typed `JSON`), which is why `pattern.value` is a regex **source string** rather than a `RegExp` — it must be JSON-serializable. `ZoneConfigFields` (in `AttachProviderDialog.tsx`) compiles it back with `new RegExp(...)` on the client.

A provider with no per-zone configuration simply omits the field, and the Attach Provider dialog shows an informational note instead of a form. The core provider does exactly that — its per-zone variation lives in `core_shipping_method_rate` instead.

## `getMethods` vs `validateMethod`

`getMethods` is the **listing** call: "what can this cart have?" It runs once per matching (zone, provider) pair when the storefront asks for available methods.

`validateMethod` is the **re-check** call: "is the one method the customer already picked still valid, and at what price?" It runs on selection and again whenever the cart changes in a way that could move the price.

Why a separate hook exists: without it, re-checking one method costs a full rate-shop. The default fallback is exactly that —

```ts
const validate =
  provider.validateMethod ??
  (async (ctx, code) => {
    const methods = await provider.getMethods(ctx);
    return methods.find((m) => m.code === code) ?? null;
  });
```

— which is correct but wasteful when the upstream API exposes a single-service quote endpoint. Implement `validateMethod` when your carrier has one. Return `null` to mean *no longer available*; the customer gets a clear error and must reselect.

Both calls must be **safe to repeat with the same inputs**. Results are memoized per request and cached on the cart by fingerprint, but never assume a call happens exactly once.

## The orchestrator, timeouts, and failure isolation

`getAvailableShippingMethods(cartId, country?, province?, postcode?)` in `modules/checkout/services/getAvailableShippingMethods.ts` drives listing:

1. Resolve every zone covering the destination. Overlapping coverage is allowed — all matching zones contribute.
2. Load enabled `shipping_zone_provider` rows for those zones.
3. Cross-reference each attachment's `provider_code` against the registry. **Attachments whose provider is not registered are silently skipped** — an uninstalled extension leaves inert rows, not errors.
4. Fan out over every (zone, provider) pair **in parallel** with `Promise.allSettled`, each wrapped in a timeout.
5. Dedupe by `(providerCode, method.code)`, first occurrence wins.
6. Sort by `cost` ascending.

The per-provider timeout is **5000ms by default**, overridable per provider:

```ts
const methods = await withTimeout(
  provider.getMethods(ctx),
  provider.quoteTimeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS, // 5000
  `Provider ${provider.code} (zone ${zone.shipping_zone_id})`
);
```

A rejected or timed-out provider is logged and skipped. **One broken provider never fails the whole list** — the customer just sees fewer options. This is also why a provider that needs a store origin address should throw a descriptive error rather than silently mis-quoting:

```ts
async getMethods(ctx) {
  if (!ctx.origin?.country || !ctx.origin?.postcode) {
    throw new Error(
      'my-shipping requires a store origin address (country + postcode). ' +
      'Set it under Settings → Store.'
    );
  }
  // ...
}
```

Validation is per-provider on purpose. Core does not read `origin`, so a platform-wide origin requirement would break Core-only stores.

Set `quoteTimeoutMs` above the default only when the upstream is structurally slower — aggregators that rate-shop every connected carrier in one call can legitimately need 10-20 seconds. Keep it as low as is honest: this budget is checkout-blocking time whenever the quote is not served from cache.

## The origin address

```ts
import { getOriginAddress } from '@evershop/evershop/checkout/services';

const origin = await getOriginAddress(); // Promise<Address>
```

There is no dedicated `shop.origin_address` setting. `getOriginAddress` composes the shop's ship-from address from the existing store settings — `getStoreCountry`, `getStoreProvince`, `getStoreCity`, `getStoreAddress`, `getStorePostalCode` — and returns:

```ts
{ country, province, city, address_1, postcode }
```

It always returns a defined object, possibly with null fields. Providers that need specific fields validate them themselves.

## What gets stored: `shipping_method_data`

Both `cart` and `order` carry a single symmetric JSONB column, `shipping_method_data`. There are no flat method columns any more.

```ts
export interface ShippingMethodData {
  provider_code: string;
  method_code: string;
  snapshot: ShippingMethodSnapshot; // === ShippingMethod, copied verbatim
  /** Cart-only. */
  fingerprint?: string;
  /** Cart-only. ISO 8601. */
  quotedAt?: string;
}
```

```json
{
  "provider_code": "usps",
  "method_code": "USPS_PRIORITY",
  "snapshot": {
    "code": "USPS_PRIORITY",
    "name": "USPS Priority Mail",
    "cost": 8.4,
    "carrier": "USPS",
    "delivery": { "minBusinessDays": 1, "maxBusinessDays": 3 }
  },
  "fingerprint": "…",
  "quotedAt": "2026-08-11T09:15:00.000Z"
}
```

**Snapshot semantics.** The snapshot is the provider's `ShippingMethod` copied verbatim at selection time (or at the last successful revalidation). It exists so the cart and the order stay meaningful even if the provider goes offline, changes its prices, or removes the method entirely. `shipping_fee_draft` reads `snapshot.cost` — no DB joins, no HTTP callbacks. Orders keep the snapshot forever and never recompute.

**Fingerprint semantics.** The fingerprint is a hash of the cart state that could change a quote: destination address fields, `totalWeight`, `totalValue`, and an items signature of `(product_id, qty)` pairs. It is **cart-only** — orders never carry one.

The rebuild rule is two-condition:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Customer action</th>
      <th>Fingerprint changes?</th>
      <th>Provider called?</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Page reload within TTL</td><td>No</td><td>No — snapshot trusted</td></tr>
    <tr><td>Page reload after <code>quoteTtlSeconds</code> elapsed</td><td>No</td><td>Yes, once</td></tr>
    <tr><td>Add/remove item, change qty</td><td>Yes</td><td>Yes, once</td></tr>
    <tr><td>Change shipping address</td><td>Yes</td><td>Yes, once</td></tr>
    <tr><td>Change shipping method</td><td>Forced</td><td>Yes, once</td></tr>
  </tbody>
</table>

The store origin is deliberately **not** part of the fingerprint — it changes at admin-config time, not per cart mutation.

Declare `quoteTtlSeconds` only if your quotes genuinely expire. Real-time carrier quotes typically use 900 (15 minutes) up to a few hours. Omit it for table-rate providers.

## Selecting a method: `resolveShippingQuote` and `ShippingQuoteError`

The storefront submits a bare **intent** — `{ provider_code, method_code }` — and the platform enriches it into the full stored value.

```ts
import {
  setShippingMethod,
  resolveShippingQuote,
  ShippingQuoteError
} from '@evershop/evershop/checkout/services';

try {
  await setShippingMethod(cart, {
    provider_code: 'flat_express',
    method_code: 'FLAT_EXPRESS_STANDARD'
  });
} catch (e) {
  if (e instanceof ShippingQuoteError) {
    // User-facing: no provider, no zone, method no longer applies.
  }
  throw e;
}
```

`setShippingMethod` calls `resolveShippingQuote(cart, intent)` and then writes the enriched object with `cart.setData('shipping_method_data', enriched)`.

:::warning
Never call `cart.setData('shipping_method_data', ...)` with a bare intent. Doing so stores a value with no snapshot and no fingerprint, which breaks the shipping fee, the tax fields, and the cache-by-fingerprint path on every subsequent rebuild. Always go through `setShippingMethod`.
:::

`resolveShippingQuote` is shared by the API handler path and the cart field-resolver rebuild path. It:

1. Rejects a missing `provider_code` / `method_code`.
2. Looks up the provider in the registry.
3. Requires a shipping address with a country.
4. Resolves zones for that address.
5. Iterates the zones in resolution order; for each, loads the enabled `shipping_zone_provider` attachment, builds a `ShippingContext`, and calls `validateMethod`. **First zone where the method still validates wins.** Per-zone errors are logged and the loop continues.
6. Returns `{ provider_code, method_code, snapshot, fingerprint, quotedAt }`.

It throws `ShippingQuoteError` for every condition that should surface to a human:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Message</th>
      <th>Cause</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>Missing provider_code or method_code</code></td><td>Malformed intent.</td></tr>
    <tr><td><code>Shipping provider "X" is not registered</code></td><td>Extension not installed, or code typo.</td></tr>
    <tr><td><code>Shipping address is required</code></td><td>Cart has no shipping country yet.</td></tr>
    <tr><td><code>We do not ship to this address</code></td><td>No zone covers the destination.</td></tr>
    <tr><td><code>Selected shipping method is no longer available</code></td><td>Every candidate zone's <code>validateMethod</code> returned <code>null</code>.</td></tr>
  </tbody>
</table>

Any other error propagates as-is.

The REST endpoint is `POST /api/carts/:cart_id/shippingMethods` and both fields are now required:

```json
{
  "provider_code": "flat_express",
  "method_code": "FLAT_EXPRESS_STANDARD"
}
```

## Worked example: a complete custom provider

A weight-banded provider with a per-zone surcharge, a real `validateMethod`, and per-zone configuration.

```ts title="extensions/regional-courier/src/bootstrap.ts"
import { registerShippingProvider } from '@evershop/evershop/checkout/services';
import { error } from '@evershop/evershop/lib/log';
import type {
  ShippingContext,
  ShippingMethod,
  ShippingProvider
} from '@evershop/evershop/types/shippingProvider';

const BANDS = [
  { maxKg: 1, cost: 4.9 },
  { maxKg: 5, cost: 8.9 },
  { maxKg: 20, cost: 16.9 }
];

function bandFor(weightKg: number): number | null {
  const band = BANDS.find((b) => weightKg <= b.maxKg);
  return band ? band.cost : null;
}

function surchargeOf(ctx: ShippingContext): number {
  const raw = ctx.zoneConfig.surcharge;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function buildMethod(ctx: ShippingContext): ShippingMethod | null {
  const base = bandFor(ctx.totalWeight);
  if (base === null) {
    // Over 20kg — out of scope for this courier.
    return null;
  }
  const expedited = ctx.zoneConfig.expedited === true;
  return {
    code: expedited ? 'RC_EXPRESS' : 'RC_STANDARD',
    name: expedited ? 'Regional Courier Express' : 'Regional Courier',
    cost: parseFloat((base + surchargeOf(ctx)).toFixed(2)),
    carrier: 'regional-courier',
    serviceCode: expedited ? 'RC_EXP' : 'RC_STD',
    delivery: expedited
      ? { minBusinessDays: 1, maxBusinessDays: 2 }
      : { minBusinessDays: 2, maxBusinessDays: 5 },
    metadata: { band: base }
  };
}

const regionalCourier: ShippingProvider = {
  code: 'regional_courier',
  name: 'Regional Courier',
  description: 'Weight-banded domestic delivery with a per-zone surcharge.',

  zoneConfigFields: [
    {
      name: 'surcharge',
      type: 'number',
      label: 'Zone surcharge',
      placeholder: '0.00',
      description: 'Flat amount added to every quote in this zone.',
      defaultValue: 0,
      validation: {
        min: { value: 0, message: 'Surcharge cannot be negative' }
      }
    },
    {
      name: 'expedited',
      type: 'toggle',
      label: 'Expedited service',
      description: 'Quote the 1-2 day service instead of the standard one.',
      defaultValue: false,
      trueLabel: 'Express',
      falseLabel: 'Standard'
    },
    {
      name: 'contractId',
      type: 'text',
      label: 'Contract ID',
      description: 'Courier contract that applies in this zone.',
      validation: {
        required: 'Contract ID is required',
        pattern: {
          value: '^RC-[0-9]{6}$',
          message: 'Expected format RC-123456'
        }
      }
    }
  ],

  // Quotes are computed locally from static bands — they never go stale by
  // time, so no quoteTtlSeconds. The default 5s timeout is plenty.
  async getMethods(ctx: ShippingContext): Promise<ShippingMethod[]> {
    if (!ctx.origin?.country) {
      throw new Error(
        'regional_courier requires a store origin country. Set it under Settings → Store.'
      );
    }
    // Domestic only.
    if (ctx.destination?.country !== ctx.origin.country) return [];

    // Quote in the cart's currency or not at all.
    if (ctx.currency !== 'EUR') {
      error(
        new Error(`regional_courier cannot quote in ${ctx.currency} — skipping`)
      );
      return [];
    }

    // Ignore digital lines entirely.
    const physical = ctx.items.filter((i) => !i.noShippingRequired);
    if (physical.length === 0) return [];

    const method = buildMethod(ctx);
    return method ? [method] : [];
  },

  // Cheap single-method re-check — no rate-shop, just rebuild the one method.
  async validateMethod(
    ctx: ShippingContext,
    methodCode: string
  ): Promise<ShippingMethod | null> {
    const method = buildMethod(ctx);
    return method && method.code === methodCode ? method : null;
  }
};

export default async () => {
  registerShippingProvider(regionalCourier);
};
```

Because the provider only ever sees a plain `ShippingContext`, testing it needs no database and no cart:

```ts title="extensions/regional-courier/tests/regionalCourier.test.ts"
const ctx = {
  origin: { country: 'DE', postcode: '10115' },
  destination: { country: 'DE', postcode: '80331' },
  zone: { shipping_zone_id: 1, uuid: 'z1', name: 'Germany' },
  items: [
    {
      productId: 1,
      sku: 'SKU-1',
      name: 'Mug',
      qty: 2,
      weight: 0.4,
      unitPrice: 12,
      lineTotal: 24,
      noShippingRequired: false
    }
  ],
  totalWeight: 0.8,
  totalValue: 24,
  currency: 'EUR',
  zoneConfig: { surcharge: 1.5, expedited: false, contractId: 'RC-123456' },
  providerConfig: {}
} as any;

// → [{ code: 'RC_STANDARD', cost: 6.4, ... }]
```

Once installed, the provider appears in **Settings → Shipping** and an admin attaches it to a zone; the three `zoneConfigFields` render in the Attach Provider dialog, and their values arrive as `ctx.zoneConfig` on every call.

## Migrating from the pre-2.2 model

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Before 2.2</th>
      <th>2.2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipping_method</code> table</td>
      <td><strong>Dropped.</strong> Migrated into <code>core_shipping_method</code>, which is internal to the core provider. UUIDs were preserved so legacy method codes still resolve.</td>
    </tr>
    <tr>
      <td><code>shipping_zone_method</code> table</td>
      <td><strong>Dropped.</strong> Migrated into <code>core_shipping_method_rate</code>, also core-provider-internal.</td>
    </tr>
    <tr>
      <td><code>shipping_zone_method.calculate_api</code></td>
      <td><strong>Gone, not migrated.</strong> The HTTP-callback-into-yourself escape hatch is replaced by writing a real provider with <code>getMethods</code>.</td>
    </tr>
    <tr>
      <td>Zone → Method attachment</td>
      <td>Zone → <strong>Provider</strong> attachment (<code>shipping_zone_provider</code>). Methods are provider-owned; the platform does not model them.</td>
    </tr>
    <tr>
      <td><code>shipping_zone.country</code> (one country per zone)</td>
      <td><strong>Dropped.</strong> Replaced by the <code>shipping_zone_country</code> junction — a zone can cover many countries. <code>shipping_zone_province</code> gained a <code>country</code> column, and its unique constraint became <code>(zone_id, country, province)</code> so a province can belong to more than one zone.</td>
    </tr>
    <tr>
      <td><code>cart.shipping_method</code>, <code>cart.shipping_method_name</code></td>
      <td><strong>Dropped.</strong> Replaced by <code>cart.shipping_method_data</code> (JSONB).</td>
    </tr>
    <tr>
      <td><code>order.shipping_method</code>, <code>order.shipping_method_name</code></td>
      <td><strong>Dropped.</strong> Replaced by <code>order.shipping_method_data</code> (JSONB). Existing orders were backfilled with <code>provider_code: 'core'</code> and <code>snapshot.cost</code> from <code>shipping_fee_excl_tax</code>. Legacy snapshots have no <code>carrier</code> and no <code>delivery</code> — read them defensively.</td>
    </tr>
    <tr>
      <td><code>cart.shipping_zone_id</code></td>
      <td><strong>Dropped.</strong> It was dead — nothing populated it, and the zone is re-derived per call.</td>
    </tr>
    <tr>
      <td>Cart field <code>shipping_method</code></td>
      <td>Cart field <code>shipping_method_data</code>. The <code>shipping_method_name</code> cart field is <strong>removed</strong> — read <code>snapshot.name</code>.</td>
    </tr>
    <tr>
      <td><code>POST /api/carts/:cart_id/shippingMethods</code> body <code>&#123; method_code &#125;</code></td>
      <td>Body <code>&#123; provider_code, method_code &#125;</code> — both required. There is no silent default to <code>core</code>.</td>
    </tr>
    <tr>
      <td>GraphQL <code>Cart.shippingMethod</code> / <code>Order.shippingMethod</code></td>
      <td><strong>Removed.</strong> Use <code>shippingMethodData</code>. <code>shippingMethodName</code> is kept as a convenience field resolved from <code>shippingMethodData.snapshot.name</code>.</td>
    </tr>
    <tr>
      <td>GraphQL <code>AvailableShippingMethod</code></td>
      <td>Gains <code>providerCode</code> (required in the selection payload), plus <code>carrier</code>, <code>serviceCode</code> and <code>delivery</code>. <code>id</code> remains an alias of <code>code</code> for back-compat.</td>
    </tr>
    <tr>
      <td>Price/weight tier bounds <code>[min, max]</code></td>
      <td>Half-open <code>[min, max)</code>. A cart at exactly the boundary no longer matches two adjacent tiers.</td>
    </tr>
    <tr>
      <td>GraphQL <code>ShippingZone.shipping_zone_id</code></td>
      <td><code>shippingZoneId</code> (camelCase, matching the rest of the schema).</td>
    </tr>
  </tbody>
</table>

If you maintained an extension that inserted rows into `shipping_method` / `shipping_zone_method`, or that served a `calculate_api` endpoint, the port is to implement `ShippingProvider.getMethods` and register it at bootstrap. Your own storage, if you need any, is entirely your own concern.

## See Also

- [Carrier Development](./carrier-development) — the fulfillment-time counterpart: labels, tracking, and live status
- [Order Status Management](./order-status-management) — how shipment status rolls up into order status
- [Cart Field System](./cart-field-system) — how `shipping_method_data` participates in cart rebuilds
- [Payment Method Development](./payment-method-development) — the same registry pattern, on the payment side
- [Registry and Processors](./registry-and-processors) — how registration and the bootstrap lock work
- [Data Migration](./data-migration) — writing `Version-X.Y.Z.ts` migrations for your provider's own tables

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
