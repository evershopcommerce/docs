---
sidebar_position: 11
keywords:
  - EverShop configuration
  - Node.js config
  - Environment variables
  - Database configuration
sidebar_label: Configuration Guide
title: 'Configuration Deep Dive'
description: A comprehensive guide to configuring an EverShop application. Learn about configuration layers, environment variables, and all the key settings for your store.
---

# Configuration Deep Dive

EverShop uses a powerful and flexible configuration system based on the [node-config](https://www.npmjs.com/package/config) package. This guide will walk you through how to set up and manage your store's configuration effectively.

While many settings (like payment and shipping methods) are managed through the admin panel, the file-based configuration gives you low-level control over your application's core settings.

## Configuration Layers

EverShop loads configuration in a layered hierarchy. The `node-config` package starts by loading `config/default.json` and then **deep-merges** subsequent configuration files on top of it. This means settings from more specific layers will override the settings from more general ones, while any unspecified settings will be inherited from the base file.

This allows you to define a complete base configuration and then selectively override just the parts that change for different environments.

The loading order is as follows:

1.  `config/default.json` - The base configuration for your application. This file should be in your version control.
2.  `config/[NODE_ENV].json` - Environment-specific configuration (e.g., `config/production.json` or `config/development.json`).
3.  `config/local.json` - For local overrides on your development machine. **This file should not be committed to version control.**

:::warning
EverShop does **not** ship a `config/custom-environment-variables.json` file, so `node-config` does **not** map arbitrary environment variables onto configuration keys. Setting `SHOP_TIMEZONE` in your shell will not change `shop.timezone`. Environment variables are read directly by the code that needs them (see [Environment Variables](#environment-variables) below). If you want env-var mapping for your own keys, create `config/custom-environment-variables.json` yourself — that is a stock `node-config` feature.
:::

:::info
By default, EverShop does not create the `config/` directory. You need to create it manually to add your custom configuration files.
:::

:::info
Many settings that used to live in `config/default.json` are now **admin settings** stored in the database (the `setting` table) and edited under **Settings** in the admin panel. Where both exist, the database value wins and the config value is only a fallback. See [Store Settings](./store-settings).
:::

### 1. Base Configuration (`default.json`)

This file should contain all the default settings for your application.

```json title="config/default.json"
{
  "shop": {
    "language": "en",
    "timezone": "UTC"
  },
  "system": {
    "theme": "default"
  }
}
```

### 2. Environment-Specific Configuration

You can create separate files for each deployment environment. For example, to override the theme for production, you would create `config/production.json`:

```json title="config/production.json"
{
  "system": {
    "theme": "my-production-theme"
  }
}
```

When you run your application with `NODE_ENV=production`, the theme will be `my-production-theme`, but the language will still be `en` from `default.json`.

### 3. Local Overrides (`local.json`)

For settings specific to your local machine, like database credentials, use `config/local.json`. This file is perfect for sensitive information that should not be in Git.

```json title="config/local.json"
{
  "db": {
    "user": "local_user",
    "password": "local_password"
  }
}
```

### 4. Environment Variables {#environment-variables}

Environment variables are read directly by the code that needs them — they are **not** merged into the `node-config` tree (see the warning above). The variables EverShop reads are:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>DB_HOST</code>, <code>DB_PORT</code>, <code>DB_USER</code>, <code>DB_PASSWORD</code>, <code>DB_NAME</code></td><td>PostgreSQL connection. See <a href="./database">Database</a>.</td></tr>
    <tr><td><code>DB_SSLMODE</code>, <code>DB_SSLROOTCERT</code>, <code>DB_SSLCERT</code>, <code>DB_SSLKEY</code></td><td>PostgreSQL TLS options.</td></tr>
    <tr><td><code>PORT</code></td><td>HTTP port the server listens on.</td></tr>
    <tr><td><code>NODE_ENV</code></td><td>Selects <code>config/[NODE_ENV].json</code> and switches development/production behavior.</td></tr>
    <tr><td><code>EVERSHOP_HOME_URL</code></td><td>Overrides <code>shop.homeUrl</code> with the highest precedence. Must be an absolute <code>http</code>/<code>https</code> URL — boot fails fast otherwise. Precedence: <code>EVERSHOP_HOME_URL</code> → <code>shop.homeUrl</code> → <code>http://localhost</code> on the configured <code>PORT</code>.</td></tr>
    <tr><td><code>TRUST_PROXY_HOPS</code></td><td>Number of reverse-proxy hops to trust (default <code>1</code>). Drives Express <code>trust proxy</code>, so <code>request.ip</code> — and therefore the per-IP rate limiter — sees the real client address. Set it to the number of proxies in front of the app.</td></tr>
    <tr><td><code>IMAGE_ALLOWED_HOSTS</code></td><td>Comma-separated allowlist of hosts the <code>/images</code> optimizer may fetch from. Cloud file-storage hosts are allowed automatically.</td></tr>
  </tbody>
</table>

## Accessing Configuration in Code

EverShop provides two ways to access configuration values.

### Using `node-config`

You can use the `config` package directly. This is useful in modules and extensions.

```ts
import config from 'config';

// Throws an error if the key is not found
const timezone = config.get('shop.timezone');

// Check if a key exists
if (config.has('shop.language')) {
  const language = config.get('shop.language');
}
```

### Using `getConfig()` Utility

EverShop includes a utility function that allows you to provide a default value if a configuration key doesn't exist.

```ts
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

// Returns 'en' if 'shop.language' is not defined
const language = getConfig('shop.language', 'en');
```

### Setting Module Defaults (For Extensions)

Extensions can register their own default configuration values using `config.util.setModuleDefaults()` in their `bootstrap.ts`. This deep-merges the extension's defaults with the existing configuration without overwriting other modules' settings:

```ts title="extensions/my-extension/src/bootstrap.ts"
import config from 'config';

export default () => {
  config.util.setModuleDefaults('myExtension', {
    apiKey: '',
    maxRetries: 3,
    timeout: 5000
  });
};
```

The values are then accessible via `getConfig('myExtension.apiKey')` and can be overridden by the store owner in their `config/default.json`.

This is also how core modules register their defaults (e.g., catalog image sizes, OMS order statuses, checkout settings).

## Core Configuration Reference

Here is a reference for the most important configuration sections.

### Shop Configuration

This section contains general information about your shop.

```json
{
  "shop": {
    "language": "en",
    "timezone": "America/New_York",
    "homeUrl": "http://localhost:3000"
  }
}
```

:::warning
`shop.currency`, `shop.weightUnit` and `shop.dimensionUnit` were **removed from the typed `getConfig` surface**. They are admin settings now — `storeCurrency`, `weightUnit` and `dimensionUnit` on **Settings → Store** — read through `getStoreCurrency()`, `getWeightUnit()` and `getDimensionUnit()` from `@evershop/evershop/setting/services`. The old config keys are still honoured as **untyped legacy fallbacks** when the corresponding setting row is empty, but they no longer autocomplete or typecheck with `getConfig()`. The store name moved the same way (`getStoreName()`); there is no typed `shop.name`.
:::

:::info
`shop.timezone` is the **operational** timezone: it sets the PostgreSQL session timezone when the pool opens a connection, which is why it has to stay in a file (there is no database to read a setting from at that point). The **display** timezone is the separate `storeTimeZone` admin setting, read via `getStoreTimezone()`; `shop.timezone` is only its fallback. `shop.language` stays typed for the same reason — it is the locale system's synchronous fallback.
:::

### System Configuration

This section controls core system settings, such as the active theme, file storage, uploads, and enabled extensions.

```json
{
  "system": {
    "file_storage": "local",
    "upload_allowed_mime_types": [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif"
    ],
    "upload_max_file_size": 10485760,
    "upload_max_file_size_per_type": {
      "image/png": 5242880,
      "application/pdf": 20971520
    },
    "theme": "mytheme",
    "extensions": [
      {
        "name": "my-custom-extension",
        "resolve": "extensions/my-custom-extension",
        "enabled": true
      }
    ],
    "session": {
      "maxAge": 86400000,
      "resave": false,
      "saveUninitialized": false,
      "cookieSecret": "keyboard cat",
      "cookieName": "sid"
    }
  }
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Key</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>system.file_storage</code></td><td>enum <code>local</code> | <code>s3</code> | <code>azure</code> | <code>gcs</code></td><td>Which storage driver serves uploads. Defaults to <code>local</code>.</td></tr>
    <tr><td><code>system.upload_allowed_mime_types</code></td><td>string[]</td><td>MIME types accepted by the file upload endpoint.</td></tr>
    <tr><td><code>system.upload_max_file_size</code></td><td>number</td><td>Global upload size ceiling in bytes.</td></tr>
    <tr><td><code>system.upload_max_file_size_per_type</code></td><td>object</td><td>Per-MIME-type overrides, in bytes.</td></tr>
    <tr><td><code>system.admin_collection_size</code></td><td>number</td><td>Default page size for admin grids.</td></tr>
  </tbody>
</table>

Each non-local driver has its own block: `system.s3` (`region`, `bucket`, `accessKeyId`, `secretAccessKey`, `endpoint`, `forcePathStyle`, `baseUrl`), `system.azure` (`connectionString`, `containerName`, `containerAccess`, `baseUrl`) and `system.gcs` (`bucket`, `serviceAccountKey`, `baseUrl`).

```json
{
  "system": {
    "file_storage": "s3",
    "s3": {
      "region": "us-east-1",
      "bucket": "my-store-media",
      "baseUrl": "https://cdn.example.com"
    }
  }
}
```

:::warning
The `s3` / `azure` / `gcs` blocks are absent at runtime unless you configure them. Always read individual keys (`getConfig('system.s3.bucket')`), never the whole object.
:::

See [File Storage](./file-storage) for the full driver setup, credentials, and the `/images` allowlist.

### Catalog Configuration

Product image sizes, stock visibility, and collection page size are **admin settings** now, edited at **Settings → Catalog** (`/admin/setting/catalog`) and read via `getShowOutOfStockProducts()`, `getCollectionPageSize()` and `getProductImageDimensions()`. The `catalog.*` config keys below remain as fallbacks when the corresponding setting row is empty.

```json
{
  "catalog": {
    "product": {
      "image": {
        "width": 1200,
        "height": 1200
      }
    },
    "showOutOfStockProduct": false,
    "collectionPageSize": 20
  }
}
```

See [Store Settings](./store-settings) for the admin surface.

### Checkout Configuration

Configure settings related to the checkout process.

```json
{
  "checkout": {
    "showShippingNote": true,
    "allowGuestCheckout": true
  }
}
```

`allowGuestCheckout` is also an admin toggle. It is read through `getAllowGuestCheckout()` from `@evershop/evershop/checkout/services`, which prefers the `allowGuestCheckout` setting row and falls back to this config value (default `true`). When it resolves to `false`, the checkout page redirects anonymous shoppers to login and the order validator rejects guest orders.

### Pricing Configuration

Rounding behavior and precision for pricing and tax calculations are **admin settings** now, edited at **Settings → Tax** (`/admin/setting/tax`) and read via the `checkout` / `tax` settings services. The `pricing.*` config keys remain as fallbacks.

```json
{
  "pricing": {
    "rounding": "round",
    "precision": 2,
    "tax": {
      "rounding": "round",
      "precision": 2,
      "round_level": "total",
      "price_including_tax": true
    }
  }
}
```

See [Store Settings](./store-settings) for the admin surface.

### Theme Configuration

Configure theme-specific settings like your copyright notice and custom scripts or styles.

```json
{
  "themeConfig": {
    "headTags": {
      "links": [
        { "rel": "icon", "href": "/favicon.ico", "type": "image/x-icon" }
      ],
      "metas": [
        { "name": "viewport", "content": "width=device-width, initial-scale=1" }
      ],
      "scripts": [
        { "src": "/custom.js", "async": true }
      ],
      "bases": [
        { "href": "/" }
      ]
    },
    "copyRight": "© 2025 My Shop. All Rights Reserved."
  }
}
```

:::warning
**Breaking change:** `themeConfig.logo` was removed. The typed `getConfig` surface keeps only `themeConfig.headTags` and `themeConfig.copyRight`, and the `ThemeConfig` GraphQL type exposes only those two fields. There is **no fallback** — a `logo` block left in `config/default.json` is simply ignored. The storefront logo now comes from admin settings (`logo`, `logoWidth`, `logoHeight` on **Settings → Store**), exposed through the `BrandingSetting` GraphQL type.
:::

:::info
`themeConfig.copyRight` is itself only a fallback: the seeded `shop / custom / copyright` metafield overrides it when set. See [Metafields](./metafields).
:::

### Order Management (OMS) Configuration

The `oms` section contains all configurations related to order processing statuses.

#### Order Status

Define the main order statuses, their appearance, and transition logic.

```json
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

#### Payment Status

Define the possible statuses for order payments.

```json
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
          "badge": "success"
        },
        "canceled": {
          "name": "Canceled",
          "badge": "destructive"
        }
      }
    }
  }
}
```

#### Shipment Status

Define the possible statuses for an individual shipment. Every entry requires `name`, `badge` **and** `phase`; the schema forbids any other property, so `progress`, `isDefault` and `isCancelable` are rejected here. `phase` must be one of `pending`, `shipped`, `delivered`, `canceled` — it is what drives the transition rules and the order-level rollup.

```json
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

:::info
There is no default `pending` shipment status: a shipment row only exists because something was actually shipped. `pending` is an order-level **rollup** value ("no items shipped yet"), not a per-shipment status. See [Multi-Shipment and Fulfillment](./multi-shipment-and-fulfillment).
:::

#### Shipment Rollup

`order.shipment_status` is a derived rollup recomputed after every shipment write. `oms.order.shipmentRollup` maps an item-count predicate (`all:` / `any:` over a phase) to the rollup value; the resolver walks the rules in priority order and returns the first match.

```json
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
      },
      "shipmentRollupCancelable": {
        "pending": true,
        "partially_shipped": true,
        "shipped": true,
        "partially_delivered": true,
        "delivered": false,
        "partially_canceled": true,
        "canceled": true
      },
      "reStockAfterCancellation": true
    }
  }
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Key</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>oms.order.shipmentRollup</code></td><td>Predicate → rollup value. Keys match <code>^(all|any):(pending|shipped|delivered|canceled)$</code>; values are one of <code>pending</code>, <code>partially_shipped</code>, <code>shipped</code>, <code>partially_delivered</code>, <code>delivered</code>, <code>partially_canceled</code>, <code>canceled</code>. Also overridable with <code>addProcessor('shipmentRollup', …)</code>.</td></tr>
    <tr><td><code>oms.order.shipmentRollupCancelable</code></td><td>Per-rollup-value cancelability. Replaces the old per-status <code>isCancelable</code> flag — cancelability is decided by the order's rollup, not by an individual shipment's status.</td></tr>
    <tr><td><code>oms.order.reStockAfterCancellation</code></td><td>Whether canceling an order returns its items to inventory. Defaults to <code>true</code>.</td></tr>
  </tbody>
</table>

:::warning
The `oms.carriers` configuration block **no longer exists**. Carriers are not config and not a database table — they live in an in-memory registry populated by `registerCarrier()` from a module's `bootstrap.ts`. See [Carrier Development](./carrier-development).
:::

## See Also

- [Store Settings](./store-settings) — The database-backed settings that now take precedence over most of these config keys
- [File Storage](./file-storage) — S3 / Azure / GCS drivers and upload limits
- [Carrier Development](./carrier-development) — Registering carriers with `registerCarrier()`
- [Multi-Shipment and Fulfillment](./multi-shipment-and-fulfillment) — Shipment statuses, phases, and the order rollup
- [Order Status Management](/docs/development/knowledge-base/order-status-management) — Detailed guide to OMS status configuration and programmatic registration
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — Payment-specific configuration
- [Database](/docs/development/knowledge-base/database) — Database connection settings
- [Styling](/docs/development/theme/styling) — Theme configuration for styles and Tailwind

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
