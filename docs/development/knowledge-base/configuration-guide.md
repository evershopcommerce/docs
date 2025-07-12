---
sidebar_position: 11
keywords:
  - Configuration
sidebar_label: Configuration
title: Configuration
description: Configure the EverShop application. Setup your shop information and configure the database connection. Extend configuration for different deployment environments
---

# Configuration Guide

In EverShop, some configurations can be done from the admin panel, such as payment methods, shipping methods, taxes, etc. We will learn more about these items in our user guide document.

In this section, we will focus on configuration from the `config/` directory. This directory contains the configuration files for the application.

:::info
By default, EverShop does not create the `config/` directory after the installation. You need to create the `config/` directory and add the configuration files manually.
:::

Under the hood, EverShop uses the [config package](https://www.npmjs.com/package/config) to handle configuration.

## Configuration file location

Configurations are JSON files stored in configuration files within a directory named `config` located at the root level of your application.

Let’s take a look at an example

```json
{
  "shop": {
    "currency": "USD",
    "language": "cn",
    "weightUnit": "kg"
  },
  "catalog": {
    "product": {
      "image": {
        "thumbnail": {
          "width": 100,
          "height": 100
        },
        "listing": {
          "width": 300,
          "height": 300
        },
        "single": {
          "width": 500,
          "height": 500
        }
      }
    },
    "showOutOfStockProduct": false
  },
  "system": {
    "theme": "friday",
    "extensions": [
      {
        "name": "productComment",
        "resolve": "extensions/productComment",
        "enabled": true,
        "priority": 10
      }
    ]
  }
}
```

## Configuration and Deployment Environment

Configuration files can be overridden and extended by [environment variables](https://github.com/node-config/node-config/wiki/Environment-Variables).

For example, you can overwrite the configuration for your production store by following these steps:

- Create a new configuration file named `production.json` in the `config` directory.
- Add your configuration for production

```json
{
  "shop": {
    "currency": "USD",
    "language": "cn",
    "weightUnit": "kg"
  },
  "catalog": {
    "product": {
      "image": {
        "thumbnail": {
          "width": 100,
          "height": 100
        },
        "listing": {
          "width": 300,
          "height": 300
        },
        "single": {
          "width": 500,
          "height": 500
        }
      }
    },
    "showOutOfStockProduct": false
  },
  "system": {
    "theme": "friday",
    "extensions": [
      {
        "name": "productComment",
        "resolve": "extensions/productComment",
        "enabled": true,
        "priority": 10
      }
    ]
  }
}
```

## Working with Configuration in Your Code

Let's take a look at the code below:

```js
const config = require("config");
//...
const language = config.get("shop.language");

if (config.has("shop.language")) {
  const language = config.get("shop.language");
  //...
}
```

The above example shows how to get configurable variables from the configuration file.

`config.get()` will throw an exception for undefined keys to help catch typos and missing values. You can use `config.has()` to test if a configuration value is defined.

You can also use the method below to get the configuration and provide a default value in case the configuration does not exist:

```js
const {
  getConfig
} = require('@evershop/evershop/lib/util/getConfig');

let shopTitle = getConfig('shop.language', 'en'),
```

## What Goes Into a Configuration File?

A configuration file is a JSON file that contains the configuration for the application. The configuration file is divided into sections, each containing a group of configuration items.

The high-level overview of the configuration file can be categorized into:

- Shop configuration
- Extension configuration
- Catalog configuration
- Pricing configuration
- Order status configuration
- Theming configuration
- Customer address schema

### Shop Configuration

The shop configuration contains information about the shop. This information is used to display on the storefront.

```json
{
  "shop": {
    "currency": "USD",
    "language": "cn",
    "weightUnit": "kg",
    "homeUrl": "http://localhost:3000" // This is the URL to your storefront, it is used for integration with third-party services
  }
}
```

### Extension Configuration

The extension configuration contains the list of extensions that are enabled for the application. The extension configuration is used to enable/disable extensions and set their priority.

```json
{
  "system": {
    "extensions": [
      {
        "name": "productComment",
        "resolve": "extensions/productComment", // This is the path to the extension folder
        "enabled": true,
        "priority": 10
      }
    ]
  }
}
```

### Catalog Configuration

The catalog configuration contains the configuration for the catalog module. You can configure the image size for product images, product listing behavior, and placeholder images for products.

```json
{
  "catalog": {
    "product": {
      "image": {
        "thumbnail": {
          "width": 100,
          "height": 100
        },
        "listing": {
          "width": 300,
          "height": 300
        },
        "single": {
          "width": 500,
          "height": 500
        }
      }
    },
    "showOutOfStockProduct": false
  }
}
```

### Pricing Configuration

The pricing configuration contains the configuration for pricing calculation. You can configure the rounding behavior and precision for pricing calculations.

```bash
{
    "pricing": {
        "rounding": "round",
        "precision": 2
    }
}
```

### Tax Calculation Configuration

The tax calculation configuration contains the configuration for tax calculation. You can configure the rounding behavior and precision for tax calculations.

```json
{
  "pricing": {
    "tax": {
      "rounding": "round",
      "precision": 2,
      "round_level": "unit",
      "price_including_tax": true
    }
  }
}
```

### Order Status Configuration

The order status configuration contains the configuration for order status, payment status, and shipment status. Below is the default configuration for order status.

```json
{
    "order": {
        {
            "new": { // The object key is the status code
                "name": "New",
                "badge": "default", // This will be used for displaying the badge on the order list. Possible values are new, info, success, attention, warning, critical
                "progress": "incomplete", // Possible values are incomplete, complete, partiallycomplete
                "isDefault": true, // Indicates that this is the default status. This status will be used for new orders
                "next": [ // This will be used to determine the next status for the order when either the payment or shipment is updated
                    "processing",
                    "canceled"
                ]
            },
            "processing": {
                "name": "Processing",
                "badge": "default",
                "progress": "incomplete",
                "next": [
                    "completed",
                    "canceled"
                ]
            },
            "completed": {
                "name": "Completed",
                "badge": "success",
                "progress": "complete",
                "next": [
                    "closed"
                ]
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
```

Example of shipment status configuration:

```json
{
  "order": {
    "shipmentStatus": {
      "pending": {
        "name": "Pending",
        "badge": "default",
        "progress": "incomplete",
        "isDefault": true // Indicates that this is the default shipment status. This status will be used for new orders
      },
      "processing": {
        "name": "Processing",
        "badge": "default",
        "progress": "incomplete",
        "isDefault": false
      },
      "shipped": {
        "name": "Shipped",
        "badge": "attention",
        "progress": "complete"
      },
      "delivered": {
        "name": "Delivered",
        "badge": "success",
        "progress": "complete",
        "isCancelable": false // Indicates that if the shipment has this status, the order cannot be canceled
      },
      "canceled": {
        "name": "Canceled",
        "badge": "critical",
        "progress": "complete",
        "isCancelable": false
      }
    }
  }
}
```

Example of payment status configuration:

```json
{
  "order": {
    "paymentStatus": {
      "pending": {
        "name": "Pending",
        "badge": "default",
        "progress": "incomplete",
        "isDefault": true // Indicates that this is the default payment status. This status will be used for new orders
      },
      "processing": {
        "name": "Processing",
        "badge": "default",
        "progress": "incomplete",
        "isCancelable": false, // Indicates that if the payment has this status, the order cannot be canceled
        "isDefault": false
      },
      "paid": {
        "name": "Paid",
        "badge": "success",
        "progress": "complete"
      },
      "failed": {
        "name": "Failed",
        "badge": "critical",
        "progress": "complete"
      }
    }
  }
}
```

### Theming Configuration

The theming configuration contains the configuration for the theme. You can configure the logo, favicon, and meta tags for the storefront.

```json
{
  "themeConfig": {
    "logo": {
      "alt": "Your amazing shop logo",
      "src": "/logo.png",
      "width": 100,
      "height": 100
    },
    "headTags": {
      "links": [],
      "metas": [],
      "scripts": []
    },
    "copyRight": "© 2022 Evershop. All Rights Reserved."
  }
}
```

#### Logo

From the above example, you can see that the logo configuration contains the alt, src, width, and height of the logo. The logo is used to display on the storefront. You can place your logo in the `public` directory and set the path to the logo in the configuration file.

:::info
In the above example, the logo is located at `public/logo.png`
:::

#### Favicon

To add your custom favicon, you can use the `themeConfig` and add a `link` tag for the favicon.

```json
{
  "themeConfig": {
    "headTags": {
      "links": [
        {
          "rel": "icon",
          "href": "/favicon.ico"
        }
      ]
    }
  }
}
```

You can use this method to add social banners, social icons, and other meta tags to the storefront.

### Custom CSS and JavaScript

To add your custom CSS and JavaScript, you can use the `themeConfig` and add a `script` tag for the CSS and JS.

```json
{
  "themeConfig": {
    "headTags": {
      "scripts": [
        {
          "src": "/custom.js",
          "async": true
        }
      ],
      "links": [
        {
          "rel": "stylesheet",
          "href": "/custom.css"
        }
      ]
    }
  }
}
```

### Customer Address Schema

The customer address schema contains the configuration for the customer address. You can configure the address fields for customer addresses.

```json
{
    ..., // Other configuration
    "customer": {
        "addressSchema": {
            type: 'object',
            properties: {
                full_name: {
                    type: 'string'
                },
                telephone: {
                    type: ['string', 'number']
                },
                address_1: {
                    type: 'string'
                },
                address_2: {
                    type: 'string'
                },
                city: {
                    type: 'string'
                },
                province: {
                    type: 'string'
                },
                country: {
                    type: 'string',
                    pattern: '^[A-Z]{2}$'
                },
                postcode: {
                    type: ['string', 'number']
                }
            },
            required: [
                'full_name',
                'telephone',
                'address_1',
                'city',
                'country',
                'province',
                'postcode'
            ],
            errorMessage: {
                properties: {
                    full_name: translate('Full name is required'),
                    telephone: translate('Telephone is missing or invalid'),
                    address_1: translate('Address is missing or invalid'),
                    province: translate('Province is missing or invalid'),
                    postcode: translate('Postcode is missing or invalid'),
                    country: translate('Country is missing or invalid')
                }
            },
            additionalProperties: true
        }
    }
}
```

EverShop will use this schema to validate customer addresses. This JSON schema is based on the [ajv](https://ajv.js.org/) library.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
