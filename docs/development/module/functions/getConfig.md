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
getConfig<T>(path: string, defaultValue?: T): T
```

## Parameters

### `path`

**Type:** `string`

The configuration key path using dot notation.

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
const siteName = getConfig('shop.name', 'My Store');

// Get a number value
const pageSize = getConfig('catalog.pageSize', 20);

// Get a boolean value
const enableCache = getConfig('system.cache.enabled', false);
```

### Nested Configuration

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Access nested configuration
const dbHost = getConfig('database.host', 'localhost');
const dbPort = getConfig('database.port', 5432);

// Complex nested paths
const stripePublicKey = getConfig('payment.stripe.publicKey');
```

### Type Safety

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Explicitly specify the return type
const maxItems = getConfig<number>('admin.collection.maxItems', 100);

// Array configuration
const allowedOrigins = getConfig<string[]>('cors.allowedOrigins', ['*']);

// Object configuration
const emailConfig = getConfig<{
  host: string;
  port: number;
}>('email.smtp');
```

### Conditional Logic

```typescript
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Use with conditional logic
if (getConfig('features.newsletter', false)) {
  // Newsletter feature is enabled
  initializeNewsletter();
}

// Use in calculations
const taxRate = getConfig('tax.defaultRate', 0);
const totalWithTax = subtotal * (1 + taxRate);
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
    "name": "My EverShop Store",
    "currency": "USD"
  },
  "catalog": {
    "pageSize": 24,
    "enableReviews": true
  },
  "system": {
    "cache": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
```

## Notes

- Configuration keys use dot notation to access nested values
- Environment-specific config files override `default.json` values
- If a key does not exist and no default is provided, returns `undefined`
- The function uses the `config` npm package internally
- Configuration is loaded once at application startup

## See Also

- [Configuration Guide](../../knowledge-base/configuration-guide.md) - Comprehensive guide on application configuration
