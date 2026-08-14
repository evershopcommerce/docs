---
sidebar_position: 135
since: 2.2.1
keywords:
- registerShippingProvider
- getShippingProvider
- getAllShippingProviders
- resolveShippingQuote
- buildShippingContext
- resolveZonesForAddress
- getOriginAddress
- serializeItems
- setShippingMethod
- ShippingQuoteError
- computeFingerprintFromCart
- checkout
- shipping
groups:
- checkout
sidebar_label: Shipping Services
title: Shipping Provider Functions
description: Register shipping providers and resolve shipping quotes at checkout.
---

# Shipping Provider Functions

A **shipping provider** answers "what can this cart be shipped with, and for how much?". Providers are registered in memory at bootstrap, attached to zones by the merchant, and asked for methods per `(cart, provider, zone)` tuple at checkout.

Everything below is reachable from `@evershop/evershop/checkout/services`.

## Import

```ts
import {
  registerShippingProvider,
  getShippingProvider,
  getAllShippingProviders,
  resolveShippingQuote,
  ShippingQuoteError,
  buildShippingContext,
  resolveZonesForAddress,
  getOriginAddress,
  serializeItems,
  setShippingMethod,
  computeFingerprintFromCart,
  computeFingerprintFromCtx
} from '@evershop/evershop/checkout/services';
```

```ts
import type {
  ShippingProvider,
  ShippingContext,
  ShippingMethod,
  ShippingItem
} from '@evershop/evershop/types/shippingProvider';
```

:::note Some argument / result types are not re-exported
`ShippingMethodIntent`, `ResolvedShippingMethod`, `BuildShippingContextArgs` and `ZoneAddressFilter` are declared in their source files, but the barrel re-exports only the **functions** from those modules. They are shown below as shapes for reference; you cannot `import type` them from `@evershop/evershop/checkout/services`. The provider-facing types (`ShippingProvider`, `ShippingContext`, `ShippingMethod`, `ShippingItem`) live in `@evershop/evershop/types/shippingProvider` and are fully importable.
:::

---

## Provider registry

### registerShippingProvider

```ts
registerShippingProvider(provider: ShippingProvider): void
```

Register a provider. Call from your module's `bootstrap.ts`.

The `ShippingProvider` contract:

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
      <td><code>code</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Unique across the system. Stored on <code>cart.shipping_method_data.provider_code</code>.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>Display name in the admin UI.</td>
    </tr>
    <tr>
      <td><code>getMethods</code></td>
      <td><code>(ctx: ShippingContext) =&gt; Promise&lt;ShippingMethod[]&gt;</code></td>
      <td>Yes</td>
      <td>Available methods for this cart + address. Must be safe to call repeatedly with the same inputs. Return <code>[]</code> when the provider cannot serve this address or cart.</td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>Description for the admin UI.</td>
    </tr>
    <tr>
      <td><code>zoneConfigFields</code></td>
      <td><code>ZoneConfigField[]</code></td>
      <td>No</td>
      <td>The per-zone config form, declared field by field. Values are saved to <code>shipping_zone_provider.config</code> and handed back as <code>ctx.zoneConfig</code>.</td>
    </tr>
    <tr>
      <td><code>validateMethod</code></td>
      <td><code>(ctx, methodCode) =&gt; Promise&lt;ShippingMethod | null&gt;</code></td>
      <td>No</td>
      <td>Re-validate a previously selected method. Defaults to <code>getMethods(ctx).find(m =&gt; m.code === methodCode)</code>; override for a cheaper one-method API call.</td>
    </tr>
    <tr>
      <td><code>quoteTtlSeconds</code></td>
      <td><code>number</code></td>
      <td>No</td>
      <td>Quote validity. A stored snapshot older than this is re-quoted even when the fingerprint matches. Omit for providers whose quotes do not expire by time.</td>
    </tr>
    <tr>
      <td><code>quoteTimeoutMs</code></td>
      <td><code>number</code></td>
      <td>No</td>
      <td>Per-provider budget for one <code>getMethods</code> call. Defaults to <code>5000</code>. This is checkout-blocking time — keep it as low as honest.</td>
    </tr>
  </tbody>
</table>

**Throws:**

<table className="table-auto not-prose">
  <thead>
    <tr><th>Condition</th><th>Message</th></tr>
  </thead>
  <tbody>
    <tr><td>Not an object</td><td><code>registerShippingProvider: provider must be an object</code></td></tr>
    <tr><td>Missing / non-string <code>code</code></td><td><code>registerShippingProvider: provider.code is required and must be a string</code></td></tr>
    <tr><td>Missing / non-string <code>name</code></td><td><code>registerShippingProvider: provider.name is required and must be a string</code></td></tr>
    <tr><td>Missing <code>getMethods</code></td><td><code>registerShippingProvider: provider.getMethods is required (provider code: …)</code></td></tr>
    <tr><td>Duplicate code</td><td><code>Shipping provider "&lt;code&gt;" is already registered. Each provider must have a unique code across the system.</code></td></tr>
    <tr><td>Called after bootstrap</td><td><code>Registry is locked. …</code> — registration routes through <code>addProcessor</code>.</td></tr>
  </tbody>
</table>

Duplicate-code detection is synchronous, so a second registration of the same code blows up at the call, not at the first `getAllShippingProviders()`.

```ts title="extensions/shippo/src/bootstrap.ts"
import { registerShippingProvider } from '@evershop/evershop/checkout/services';

export default () => {
  registerShippingProvider({
    code: 'shippo',
    name: 'Shippo',
    description: 'Live rates from every connected carrier',
    quoteTtlSeconds: 900,
    quoteTimeoutMs: 8000,
    async getMethods(ctx) {
      if (!ctx.destination.country) return [];
      const rates = await fetchRates(ctx);
      return rates.map((r) => ({
        code: r.servicelevel.token,
        name: r.servicelevel.name,
        cost: Number(r.amount),
        carrier: r.provider
      }));
    }
  });
};
```

### getShippingProvider

```ts
getShippingProvider(code: string): Promise<ShippingProvider | undefined>
```

One provider by `code`, or `undefined` when no such provider is registered (or its module is not installed). Async because it reads the registry through `getValue`.

### getAllShippingProviders

```ts
getAllShippingProviders(): Promise<ShippingProvider[]>
```

Every registered provider, in registration order (which follows the alphabetical module load order).

:::note Registered means enabled
There is no global `shipping_provider.is_enabled` toggle — the in-memory registry is the source of truth. Merchant intent is expressed by attaching (or not attaching) the provider to a zone.
:::

---

## Quoting

### resolveShippingQuote

```ts
resolveShippingQuote(
  cart: Cart,
  intent: ShippingMethodIntent
): Promise<ResolvedShippingMethod>
```

Fully resolve a bare `{ provider_code, method_code }` intent against the cart's current state into an enriched snapshot.

```ts
interface ShippingMethodIntent {
  provider_code: string;
  method_code: string;
}

interface ResolvedShippingMethod {
  provider_code: string;
  method_code: string;
  snapshot: {
    code: string;
    name: string;
    cost: number;
    carrier?: string;
    delivery?: unknown;
  };
  fingerprint: string;
  quotedAt: string;
}
```

It resolves every zone matching the cart's shipping address in order and takes the first zone where the provider is attached, enabled, and the method still validates. A provider error inside one zone is logged and the loop continues to the next zone.

**Throws `ShippingQuoteError`** on:

<table className="table-auto not-prose">
  <thead>
    <tr><th>Condition</th><th>Message</th></tr>
  </thead>
  <tbody>
    <tr><td>Missing intent fields</td><td><code>Missing provider_code or method_code</code></td></tr>
    <tr><td>Provider not registered</td><td><code>Shipping provider "&lt;code&gt;" is not registered</code></td></tr>
    <tr><td>Cart has no shipping country</td><td><code>Shipping address is required</code></td></tr>
    <tr><td>No zone covers the address</td><td><code>We do not ship to this address</code></td></tr>
    <tr><td>Method no longer validates in any zone</td><td><code>Selected shipping method is no longer available</code></td></tr>
  </tbody>
</table>

Other errors propagate unchanged. API handlers translate `ShippingQuoteError` into user-facing responses.

### ShippingQuoteError

```ts
class ShippingQuoteError extends Error {}
```

`error.name` is `'ShippingQuoteError'`. Use `instanceof` to separate "tell the customer" failures from genuine bugs.

```ts
import {
  resolveShippingQuote,
  ShippingQuoteError
} from '@evershop/evershop/checkout/services';

try {
  const quote = await resolveShippingQuote(cart, intent);
} catch (e) {
  if (e instanceof ShippingQuoteError) {
    response.status(400).json({ error: { message: e.message } });
    return;
  }
  throw e;
}
```

### setShippingMethod

```ts
setShippingMethod(cart: Cart, intent: ShippingMethodIntent): Promise<void>
```

Set the cart's shipping method from a bare intent. Pre-resolves the quote and writes the enriched value onto `shipping_method_data`.

:::danger Never write `shipping_method_data` directly
`cart.setData('shipping_method_data', intent)` stores a value with no snapshot and no fingerprint. That breaks the dependent fields (shipping fee, taxes) and the cache-by-fingerprint path on rebuild. Always go through `setShippingMethod`.
:::

Throws whatever `resolveShippingQuote` throws.

---

## Context helpers

These are the pieces the checkout orchestrator composes. Providers rarely call them; they are exported so extensions can build the same context outside the normal flow (an admin re-quote tool, a test harness).

### buildShippingContext

```ts
buildShippingContext(args: BuildShippingContextArgs): Promise<ShippingContext>
```

Compose a `ShippingContext` for a single `(cart, provider, zone)` tuple.

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
      <td><code>cart</code></td>
      <td><code>Cart</code></td>
      <td>Yes</td>
      <td>The cart. Only <code>getData</code> / <code>getItems</code> are used.</td>
    </tr>
    <tr>
      <td><code>provider</code></td>
      <td><code>ShippingProvider</code></td>
      <td>Yes</td>
      <td>The provider being asked.</td>
    </tr>
    <tr>
      <td><code>zone</code></td>
      <td><code>ShippingZoneRow</code></td>
      <td>Yes</td>
      <td>The resolved zone, placed on <code>ctx.zone</code>.</td>
    </tr>
    <tr>
      <td><code>attachment</code></td>
      <td><code>&#123; config &#125; | null</code></td>
      <td>No</td>
      <td>Pre-loaded <code>shipping_zone_provider</code> row. Its <code>config</code> becomes <code>ctx.zoneConfig</code>. Pre-loading avoids a round trip per zone/provider combination.</td>
    </tr>
    <tr>
      <td><code>destinationOverride</code></td>
      <td><code>Address | null</code></td>
      <td>No</td>
      <td>Use a tentative address instead of the cart's.</td>
    </tr>
  </tbody>
</table>

`ctx.currency` comes from the cart, falling back to `getStoreCurrency()`. `ctx.providerConfig` is always `{}` — global provider config was removed before release; secrets belong in `process.env`, per-zone state in `zoneConfig`.

### resolveZonesForAddress

```ts
resolveZonesForAddress(filter: ZoneAddressFilter): Promise<ShippingZoneRow[]>
```

Zones covering a destination. A zone matches when the country is in its `shipping_zone_country` rows **and** either the zone has no province rows for that country (whole country covered) or the destination province matches one.

```ts
interface ZoneAddressFilter {
  country: string;
  province?: string | null;
  postcode?: string | null;  // reserved; not used for matching yet
}
```

Multiple zones may match one address — overlapping coverage is allowed and the orchestrator fans out per zone. Returns `[]` when `country` is empty.

### getOriginAddress

```ts
getOriginAddress(): Promise<Address>
```

The shop's origin address, composed from the existing store settings (`storeCountry`, `storeProvince`, `storeCity`, `storeAddress`, `storePostalCode`) rather than a separate origin setting.

Returns a defined-but-possibly-incomplete `Address`. Providers that need specific fields — USPS needs country + postcode — must validate and return `[]` when they are missing.

### serializeItems

```ts
serializeItems(cart: Cart): ShippingItem[]
```

Turn a cart's items into plain `ShippingItem` DTOs. Providers never see `Cart` or `CartItem` instances.

```ts
interface ShippingItem {
  productId: number;
  sku: string;
  name: string;
  qty: number;
  weight: number;        // per-unit goods weight, no packaging tare
  unitPrice: number;     // tax-exclusive
  lineTotal: number;
  noShippingRequired: boolean;
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'mm' | 'in' };
}
```

Numeric fields are coerced from PostgreSQL's `numeric` (which arrives as a string) and default to `0`. `dimensions` is present only when the item's package has both a length and a width; the unit follows the store's dimension setting, normalised to `cm | mm | in`.

---

## Fingerprint helpers

```ts
computeFingerprintFromCart(cart: Cart): string
computeFingerprintFromCtx(ctx: ShippingContext): string
```

A SHA-1 over the shipping-relevant cart state: destination (`country`, `province`, `postcode`, `city` only), `totalWeight`, `totalValue`, and a sorted `[productId, qty]` list. Fields like `full_name` and `telephone` are deliberately excluded, so two copies of the same address hash identically.

- `computeFingerprintFromCart` runs inside the `shipping_method_data` resolver and stamps `ResolvedShippingMethod.fingerprint`.
- `computeFingerprintFromCtx` backs the per-request memoization of `provider.getMethods`.

Both **must** produce the same hash for the same logical cart state — they are two entry points to one algorithm. Origin is intentionally not in the fingerprint: it changes when an admin reconfigures the store address, which is far too rare to invalidate every cached quote.

---

## Not reachable through the exports map

These exist in the source but are **not** re-exported from `modules/checkout/services/index.ts`, so they cannot be imported from `@evershop/evershop/checkout/services` (or from any other entry in the package `exports` map). Treat them as internal:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Source</th>
      <th>What to use instead</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>buildDefaultParcels</code></td>
      <td><code>modules/checkout/services/cart/packing.ts</code></td>
      <td>The cart already exposes the computed parcels as a cart field; carriers receive parcel dimensions through <code>ShippingItem.dimensions</code> and <code>CreateLabelInput</code>.</td>
    </tr>
    <tr>
      <td><code>createPackage</code></td>
      <td rowSpan={3}><code>modules/checkout/services/package/packageManager.ts</code></td>
      <td rowSpan={3}>The admin <a href="/docs/api/package">Package REST API</a>. The service functions are hookable, so extensions can still <code>hookBefore</code>/<code>hookAfter</code> them by name without importing them.</td>
    </tr>
    <tr>
      <td><code>updatePackage</code></td>
    </tr>
    <tr>
      <td><code>deletePackage</code></td>
    </tr>
  </tbody>
</table>

The core shipping-rate CRUD (`createCoreShippingRate`, `updateCoreShippingRate`, `deleteCoreShippingRate`) **is** exported, along with its hook helpers and the `CoreShippingRateData` / `CreateCoreShippingRateInput` types.

## See Also

- [Shipping Provider Development](/docs/development/knowledge-base/shipping-provider-development) — Building a provider end to end
- [Checkout Settings](/docs/development/knowledge-base/checkout-settings) — Guest checkout, price rounding
- [Shipping Zone API](/docs/api/shipping-zone) — Zone and attachment endpoints
- [Carrier Development](/docs/development/knowledge-base/carrier-development) — Labels and tracking, which are a separate concern from quoting
