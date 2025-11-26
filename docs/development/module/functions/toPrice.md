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
console.log(price); // 20.00 (depends on rounding config)
```

### Format for Display

```typescript
import { toPrice } from "@evershop/evershop/checkout/services";

const formatted = toPrice("49.99", true);
console.log(formatted); // "$49.99" (depends on currency/language config)
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
// Returns: "$149.95" or "€149,95" based on config
```

## Rounding Options

Configured in `pricing.rounding`:

- `'round'` - Standard rounding (default)
- `'up'` - Always round up
- `'down'` - Always round down

## Precision

Configured in `pricing.precision`:
- Default: `2` decimals
- Configurable per installation

## Currency Format

When `forDisplay = true`:
- Uses `shop.currency` config (e.g., "USD", "EUR")
- Uses `shop.language` config (e.g., "en", "de")
- Formats using `Intl.NumberFormat`

## See Also

- [getConfig](/docs/development/module/functions/getConfig) - Get configuration
