---
sidebar_position: 2
keywords:
- getConfig
- Configuration
- Settings
sidebar_label: getConfig
title: getConfig
description: Read configuration values from the application configuration files.
groups:
- utilities
---

# getConfig

Read configuration values from the application configuration files with optional default values.

## Import

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
```

## Syntax

```typescript
getConfig<P extends ConfigPath>(path: P, defaultValue?: PathValue<P>): PathValue<P>
```

## Parameters

### `path`

**Type:** `ConfigPath`

The configuration key path using dot notation. The type is derived from EverShop's `ConfigStructure`, so your editor suggests valid paths and rejects unknown ones at compile time; the return type is inferred from the path. Extensions widen the structure by declaring their own keys in the configuration schema.

### `defaultValue`

**Type:** `T` (optional)

The value to return if the configuration key does not exist.

## Return Value

Returns the configuration value at the specified path. If the path does not exist, returns the `defaultValue` if provided, otherwise returns `undefined`.

## Examples

### Basic Usage

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Get a string value
const language = getConfig('shop.language', 'en');
const timezone = getConfig('shop.timezone', 'UTC');

// Get a number value
const pageSize = getConfig('catalog.collectionPageSize', 20);

// Get a boolean value
const guestCheckout = getConfig('checkout.allowGuestCheckout', true);
```

:::warning `shop.currency` is gone
`shop.currency`, `shop.weightUnit` and `shop.dimensionUnit` were removed from the typed configuration — they are admin settings now, stored in the `setting` table. Read them through `getStoreCurrency()`, `getWeightUnit()` and `getDimensionUnit()` from `@evershop/evershop/setting/services`; those helpers fall back to the old config keys internally, but `getConfig('shop.currency')` will no longer typecheck.
:::

### Nested Configuration

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Access nested configuration
const imageWidth = getConfig('catalog.product.image.width', 500);
const taxRounding = getConfig('pricing.tax.rounding', 'round');

// Complex nested paths
const s3Bucket = getConfig('system.s3.bucket');
```

### Type Safety

The return type is inferred from the path, so no type argument is needed:

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

const precision = getConfig('pricing.precision', 2);        // number
const homeUrl = getConfig('shop.homeUrl', '');              // string
const mimeTypes = getConfig('system.upload_allowed_mime_types', []); // string[]
```

### Conditional Logic

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Use with conditional logic
if (getConfig('sitemap.enabled', false)) {
  scheduleSitemapBuild();
}

// Use in calculations
const precision = getConfig('pricing.precision', 2);
const rounded = Math.round(value * 10 ** precision) / 10 ** precision;
```

## Configuration Files

Configuration values are read from files in the `config/` directory:

- `config/default.json` - Default configuration for all environments
- `config/production.json` - Production environment overrides
- `config/development.json` - Development environment overrides

### Example Configuration File

```json
{
  "shop": {
    "language": "en",
    "timezone": "UTC",
    "homeUrl": "https://myshop.com"
  },
  "catalog": {
    "collectionPageSize": 24,
    "showOutOfStockProduct": true
  },
  "pricing": {
    "rounding": "round",
    "precision": 2
  }
}
```

## Notes

- Configuration keys use dot notation to access nested values
- Paths are type-checked against `ConfigStructure`; an unknown path is a compile error
- Environment-specific config files override `default.json` values
- If a key does not exist and no default is provided, returns `undefined`
- The function uses the `config` npm package internally
- Configuration is loaded once at application startup
- Store-wide values a merchant can change from the admin panel (currency, units, store address, rounding) live in the `setting` table, not in config — read those through `@evershop/evershop/setting/services`

## See Also

- [getSetting](/docs/development/module/functions/getSetting) - Read an admin setting
- [Configuration Guide](../../knowledge-base/configuration-guide.md) - Comprehensive guide on application configuration
