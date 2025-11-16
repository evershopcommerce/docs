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
4.  **Environment Variables** - The highest priority, allowing you to override any setting dynamically.

:::info
By default, EverShop does not create the `config/` directory. You need to create it manually to add your custom configuration files.
:::

### 1. Base Configuration (`default.json`)

This file should contain all the default settings for your application.

```json
// config/default.json
{
  "shop": {
    "currency": "USD",
    "language": "en"
  },
  "system": {
    "theme": "default"
  }
}
```

### 2. Environment-Specific Configuration

You can create separate files for each deployment environment. For example, to override the theme for production, you would create `config/production.json`:

```json
// config/production.json
{
  "system": {
    "theme": "my-production-theme"
  }
}
```

When you run your application with `NODE_ENV=production`, the theme will be `my-production-theme`, but the currency will still be `USD` from `default.json`.

### 3. Local Overrides (`local.json`)

For settings specific to your local machine, like database credentials, use `config/local.json`. This file is perfect for sensitive information that should not be in Git.

```json
// config/local.json
{
  "db": {
    "user": "local_user",
    "password": "local_password"
  }
}
```

## Accessing Configuration in Code

EverShop provides two ways to access configuration values.

### Using `node-config`

You can use the `config` package directly. This is useful in modules and extensions.

```typescript
const config = require('config');

// Throws an error if the key is not found
const currency = config.get('shop.currency');

// Check if a key exists
if (config.has('shop.language')) {
  const language = config.get('shop.language');
}
```

### Using `getConfig()` Utility

EverShop includes a utility function that allows you to provide a default value if a configuration key doesn't exist.

```js
const { getConfig } = require('@evershop/evershop/lib/util/getConfig');

// Returns 'en' if 'shop.language' is not defined
const language = getConfig('shop.language', 'en');
```

## Core Configuration Reference

Here is a reference for the most important configuration sections.

### Shop Configuration

This section contains general information about your shop.

```json
{
  "shop": {
    "name": "EverShop",
    "language": "en",
    "timezone": "America/New_York",
    "currency": "USD",
    "weightUnit": "kg",
    "homeUrl": "http://localhost:3000" // Used for integrations
  }
}
```

### System Configuration

This section controls core system settings, such as the active theme, file storage, and enabled extensions.

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

### Catalog Configuration

Configure product image sizes, stock visibility, and other catalog-related settings.

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

### Checkout Configuration

Configure settings related to the checkout process.

```json
{
  "checkout": {
    "showShippingNote": true
  }
}
```

### Pricing Configuration

Configure rounding behavior and precision for pricing and tax calculations.

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

### Theme Configuration

Configure theme-specific settings like your logo, copyright notice, and custom scripts or styles.

```json
{
  "themeConfig": {
    "logo": {
      "alt": "My Shop Logo",
      "src": "/logo.png",
      "width": 200,
      "height": 50
    },
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

### Order Management (OMS) Configuration

The `oms` section contains all configurations related to order processing, including statuses and carriers.

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
          "progress": "incomplete",
          "isDefault": true,
          "next": ["processing", "canceled"]
        },
        "processing": {
          "name": "Processing",
          "badge": "default",
          "progress": "incomplete",
          "next": ["completed", "canceled"]
        },
        "completed": {
          "name": "Completed",
          "badge": "success",
          "progress": "complete",
          "next": ["closed"]
        },
        "canceled": {
          "name": "Canceled",
          "badge": "critical",
          "progress": "complete",
          "next": []
        },
        "closed": {
          "name": "Closed",
          "badge": "default",
          "progress": "complete",
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
          "progress": "incomplete",
          "isDefault": true
        },
        "paid": {
          "name": "Paid",
          "badge": "success",
          "progress": "complete"
        },
        "failed": {
          "name": "Failed",
          "badge": "critical",
          "progress": "failed"
        }
      }
    }
  }
}
```

#### Shipment Status

Define the possible statuses for order shipments.

```json
{
  "oms": {
    "order": {
      "shipmentStatus": {
        "pending": {
          "name": "Pending",
          "badge": "default",
          "progress": "incomplete",
          "isDefault": true
        },
        "shipped": {
          "name": "Shipped",
          "badge": "attention",
          "progress": "complete"
        },
        "delivered": {
          "name": "Delivered",
          "badge": "success",
          "progress": "complete"
        }
      }
    }
  }
}
```

#### Carriers

Define shipping carriers and their tracking URLs.

```json
{
  "oms": {
    "carriers": {
      "default": {
        "name": "Default"
      },
      "fedex": {
        "name": "FedEx",
        "trackingUrl": "https://www.fedex.com/fedextrack/?trknbr={trackingNumber}"
      },
      "usps": {
        "name": "USPS",
        "trackingUrl": "https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={trackingNumber}"
      },
      "ups": {
        "name": "UPS",
        "trackingUrl": "https://www.ups.com/track?loc=en_US&tracknum={trackingNumber}"
      }
    }
  }
}
```

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
