---
sidebar_position: 15
keywords:
  - EverShop routing
  - Express.js routing
  - API routes
  - Page routes
  - Route declaration
sidebar_label: The Routing System
title: 'Routing Deep Dive: How EverShop Handles Requests'
description: A deep dive into the EverShop routing system. Learn how routes are defined for API endpoints and pages, how the folder structure works, and how to generate URLs.
---

# Routing Deep Dive

Routing is the mechanism that directs incoming requests to the appropriate handler based on the URL and HTTP method. EverShop's routing system is built on top of [Express.js](https://expressjs.com/), providing a powerful and familiar foundation for defining how your application responds to requests.

This guide will walk you through the core concepts of routing in EverShop, from the folder structure to generating URLs in your code.

![Routing system](./img/routing.jpg 'Routing system')

## File-Based Routing

EverShop uses a **file-based routing** system. Instead of a central routing file, routes are defined within the modules themselves, right next to the code that handles them. This co-location makes the codebase easier to navigate and understand.

Routes are organized into two main categories within a module:

1.  **API Routes**: For handling RESTful API requests.
2.  **Page Routes**: For rendering HTML pages for the admin panel or the storefront.

Let's look at a typical module structure:

```bash
├── api
│   ├── createProduct
│   │   ├── route.json
│   │   └── index.js
│   └── updateProduct
│       ├── route.json
│       └── index.js
├── pages
│   ├── admin
│   │   ├── productEdit
│   │   │   ├── route.json
│   │   │   └── index.js
│   │   └── productGrid
│   │       ├── route.json
│   │       └── index.js
│   └── frontStore
│       ├── categoryView
│       │   ├── route.json
│       │   └── index.js
│       └── productView
│           ├── route.json
│           └── index.js
└── ...
```

### The `api` Folder

The `api` folder is where you define all your RESTful API endpoints. Each sub-folder inside `api` corresponds to a single API endpoint and contains:

-   `route.json`: A file that defines the route's path and HTTP method.
-   `index.js`: The controller that handles the request.

This structure keeps your API logic organized and self-contained.

### The `pages` Folder

The `pages` folder is for routes that render a user interface. It is further divided into `admin` and `frontStore` to separate backend and frontend pages.

-   **`admin`**: Routes for the admin panel. These routes automatically have authentication and authorization middleware applied.
-   **`frontStore`**: Routes for the customer-facing storefront.

Each sub-folder inside `admin` or `frontStore` represents a page and contains the same `route.json` and `index.js` files.

## The Route ID

The name of the route's folder serves as its unique **Route ID**. For example, the route defined in `pages/admin/productEdit` has a Route ID of `productEdit`.

This ID is crucial for two reasons:

1.  It must be unique across the entire application.
2.  It is used to generate URLs programmatically.

:::warning
Route IDs must be unique and should not contain spaces or special characters.
:::

## Route Declaration (`route.json`)

The `route.json` file is the heart of the routing system. It specifies the path, HTTP methods, and access level for the route.

```json
{
  "methods": ["POST"],
  "path": "/user/tokens",
  "access": "public"
}
```

-   **`methods`**: An array of accepted HTTP methods (e.g., `GET`, `POST`, `PUT`, `DELETE`).
-   **`path`**: The URL path pattern. EverShop uses `path-to-regexp` for matching, so you can include dynamic parameters like `:id`.
-   **`access`** (optional): Defines the access control for the route.
    -   `"public"`: The route is accessible to everyone, without authentication.
    -   `"private"`: The route requires authentication. This is the default behavior if the `access` property is not specified. If this access property is not set, the route will be treated as private.

## Generating URLs

Hardcoding URLs is a bad practice. EverShop provides a `buildUrl()` helper function to generate URLs dynamically using the Route ID. This ensures that your URLs will always be correct, even if you change the path in `route.json`.

```js
import { buildUrl } from '@evershop/evershop/lib/router';

// Generates a URL for the 'categoryView' route
const categoryUrl = buildUrl('categoryView', { url_key: 'my-category' });
// Result: /category/my-category

// Generates a URL for the 'productEdit' route
const productEditUrl = buildUrl('productEdit', { id: 123 });
// Result: /admin/product/edit/123 (depending on the route's path)
```

The `buildUrl()` function takes two arguments:

1.  `routeId`: The unique ID of the route.
2.  `params` (optional): An object containing values for any dynamic parameters in the route's path.

By using `buildUrl()`, you decouple your code from the specific URL structure, making your application more robust and easier to maintain.

### Absolute URLs

For cases where you need the full URL (e.g., in emails or external integrations), use `buildAbsoluteUrl()`:

```js
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

const fullUrl = buildAbsoluteUrl('productView', { url_key: 'my-product' });
// Result: https://yourstore.com/product/my-product
```

This prepends the `shop.homeUrl` configuration value to the relative URL.

### Query Parameters

`buildUrl()` also accepts a third argument for query parameters:

```js
import { buildUrl } from '@evershop/evershop/lib/router';

const url = buildUrl('productGrid', {}, { page: 2, sortBy: 'price' });
// Result: /admin/products?page=2&sortBy=price
```

## Admin Route Prefix

All routes defined under `pages/admin/` automatically receive an `/admin` prefix. For example, if your route.json defines `"path": "/products/edit/:id"`, the final URL becomes `/admin/products/edit/:id`.

This happens during route registration and is transparent to your code — `buildUrl()` handles the prefix automatically.

## Route Matching Order

When multiple routes could match an incoming request, EverShop uses a **specificity-based sorting** algorithm:

1. Routes without dynamic parameters (`:id`) are matched first.
2. Routes with more static path segments take priority.
3. Routes with fewer dynamic parameters take priority.

This means a route like `/products/featured` will always be matched before `/products/:id`, regardless of the order they were registered.

## URL Rewrites

EverShop includes a URL rewrite system that maps user-friendly URLs to internal routes. For example, instead of `/product/123`, a customer sees `/awesome-running-shoes`.

URL rewrites are stored in the `url_rewrite` database table and are checked automatically when no standard route matches the incoming request. The rewrite system extracts the internal route and its parameters, then processes the request as if the internal URL had been used.

URL rewrites are typically created automatically by event subscribers when products and categories are created or updated (e.g., the `product_created` subscriber generates a URL rewrite based on the product's `url_key`).

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
