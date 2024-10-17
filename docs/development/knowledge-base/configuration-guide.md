---
sidebar_position: 11
keywords:
- Configuration
sidebar_label: Configuration
title: Configuration
description: Configure the EverShop application. Setup your shop information and configure the database connection. Extend configuration for different deployment environments
---

# Configuration guide

In EverShop, some of the configurations can be done from the admin panel like Payment method, Shipment method, Taxes… We will learn more about these items in our user guide document.

In this section, we will focus on the configuration from the `config/` directory. This directory contains the configuration files for the application.

:::info
By default, EverShop does not create the `config/` directory after the installation. You need to create the `config/` directory and add the configuration files manually.
:::

Under the hood, EverShop makes use of [config package](https://www.npmjs.com/package/config) to handle the configuration.

## Configuration file location

Configurations are JSON files stored in configuration files within a directory named `config` located at the root level of your application.

Let’s take a look at an example

```bash
{
    "shop" : {
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

## Configuration and deployment environment

Configuration files can be overridden and extended by [environment variables](https://github.com/node-config/node-config/wiki/Environment-Variables).

For example, you can overwrite the configuration for your production store by below steps

- Create a new configuration file named `production.json` in the `config` directory.(For production environment)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;**OR**
- Create a new configuration file named `developement.json` in the `config` directory.(For development environment)
- Please note `prod.json` and `develop.json` won't work, the file name has to be one of the above mentioned.
- Add your configuration for production

```bash
{
    "shop" : {
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

## Working with configuration in your code

Let's take a look at the below code:

```bash
const config = require('config');
//...
const language = config.get('shop.language');

if (config.has('shop.language')) {
  const language = config.get('shop.language');
  //...
}
```

The above example shows us how to get the configurable variables from the configuration file.

`config.get()` will throw an exception for undefined keys to help catch typos and missing values. You can use `config.has()` to test if a configuration value is defined.

You also can use the below method to get the configuration and provide a default value in case the configuration does not exist:

```bash
const {
  getConfig
} = require('@evershop/evershop/lib/util/getConfig');

let shopTitle = getConfig('shop.language', 'en'),
```

## What goes into a configuration file?

A configuration file is a JSON file that contains the configuration for the application. The configuration file is divided into sections, each section contains a group of configuration items.

The high-level overview of the configuration file can be categorized into:

- Shop configuration
- Extension configuration
- Catalog configuration
- Pricing configuration
- Theming configuration
- Customer address schema

### Shop configuration

The shop configuration contains the information about the shop. This information is used to display on the storefront.

```bash
{
    "shop" : {
        "currency": "USD",
        "language": "cn",
        "weightUnit": "kg",
        "homeUrl": "http://localhost:3000" // This is the URL to your storefront, it is used for integration with third-party services
    }
}
```

### Extension configuration

The extension configuration contains the list of extensions that are enabled for the application. The extension configuration is used to enable/disable the extension and set the priority for the extension.

```bash
{
  "system": {
    "extensions": [
      {
        "name": "productComment",
        "resolve": "extensions/productComment", #This is the path to the extension folder
        "enabled": true,
        "priority": 10
      }
    ]
  }
}
```

### Catalog configuration

The catalog configuration contains the configuration for the catalog module. You can configure the image size for the product image, the product listing behavior, and the placeholder image for the product.

```bash
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

### Pricing configuration

The pricing configuration contains the configuration for the pricing calculation. You can configure the rounding behavior and the precision for the pricing calculation.

```bash
{
    "pricing": {
        "rounding": "round",
        "precision": 2
    }
}
```

### Tax calculation configuration

The tax calculation configuration contains the configuration for the tax calculation. You can configure the rounding behavior and the precision for the tax calculation.

```bash
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

### Theming configuration

Theming configuration contains the configuration for the theme. You can configure the logo, favicon, and the meta tag for the storefront.

```bash
{
    "themeConfig": {
        "logo": {
            "alt": "You amazing shop logo",
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

From the above example, you can see that the logo configuration contains the alt, src, width, and height of the logo. The logo is used to display on the storefront. You can have your logo in the `public` directory and set the path to the logo in the configuration file.

:::info
In above example, the logo is located at `public/logo.png`
:::

#### Favicon

To add your custom favicon, you can use the `themeConfig` and add a `link` tag for the favicon.

```bash
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

### Custom CSS and Javascript

To add your custom CSS and Javascript, you can use the `themeConfig` and add a `script` tag for the CSS and JS.

```bash
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

### Customer address schema

The customer address schema contains the configuration for the customer address. You can configure the address fields for the customer address 

```bash
{
    ..., #Other configuration
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

EverShop will use this schema to validate the customer address. This json schema is based on [ajv](https://ajv.js.org/) library.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>