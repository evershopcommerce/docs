---
sidebar_position: 65
keywords:
- toPrice
- checkout
- pricing
- currency
groups:
- checkout
- utilities
sidebar_label: toPrice
title: toPrice
description: Format and round price values.
---

# toPrice

Format and round price values with configurable precision.

## Import

```typescript
import { toPrice } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
toPrice(value: string, forDisplay?: boolean): number | string
```

### Parameters

**`value`**

**Type:** `string`

Price value to format.

**`forDisplay`**

**Type:** `boolean` (optional, default: `false`)

Whether to format for display with currency symbol.

## Return Value

Returns `number` if `forDisplay = false`, or formatted `string` if `forDisplay = true`.

## Examples

### Basic Rounding

```typescript
import { toPrice } from "@evershop/evershop/checkout/services";

const price = toPrice("19.999");
console.log(price); // 20 (number, rounded per the store's pricing settings)
```

:::warning
`toPrice` throws an `Error` if the value cannot be parsed as a number. Always ensure the input is a valid numeric string.
:::

### Format for Display

```typescript
import { toPrice } from "@evershop/evershop/checkout/services";

const formatted = toPrice("49.99", true);
console.log(formatted); // "$49.99" (depends on the store currency setting and shop.language)
```

### Calculate Total

```typescript
import { toPrice } from "@evershop/evershop/checkout/services";

const itemPrice = toPrice("29.99");
const tax = toPrice("2.4");
const total = toPrice((itemPrice + tax).toString());

console.log(total); // 32.39
```

### Display in Template

```typescript
import { toPrice } from "@evershop/evershop/checkout/services";

const product = {
  price: "149.95"
};

const displayPrice = toPrice(product.price, true);
// Returns: "$149.95" or "€149,95" depending on the store currency and language
```

## Rounding and precision

Both come from the **admin Tax settings** first, with the legacy config as a fallback:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Value</th>
      <th>Admin setting</th>
      <th>Config fallback</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Rounding mode</td>
      <td><code>pricingRounding</code></td>
      <td><code>pricing.rounding</code></td>
      <td><code>round</code></td>
    </tr>
    <tr>
      <td>Decimal precision</td>
      <td><code>pricingPrecision</code></td>
      <td><code>pricing.precision</code></td>
      <td><code>2</code></td>
    </tr>
  </tbody>
</table>

Accepted rounding modes are `'round'` (nearest, default), `'ceil'` (always up) and `'floor'` (always down). `'up'` and `'down'` are still accepted as backward-compatible aliases for `'ceil'` and `'floor'`.

Both lookups are synchronous and read the warmed settings cache, so `toPrice` is safe in hot paths (cart build, promotion calculators) with no per-call DB round trip.

## Currency Format

When `forDisplay = true`, the value is formatted with `Intl.NumberFormat`:

- **Currency** comes from `getStoreCurrency()` — the admin setting `storeCurrency`, falling back to the legacy `shop.currency` config, then `USD`. The `shop.currency` key was removed from the typed configuration structure; it survives only as an untyped legacy fallback.
- **Locale** comes from the `shop.language` config (e.g. `en`, `de`).

An existing cart or order carries its own persisted `currency` — `getStoreCurrency()` is only the default for *new* carts and the display fallback when no currency is in context.

## See Also

- [getSetting](/docs/development/module/functions/getSetting) - Read an admin setting
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration
