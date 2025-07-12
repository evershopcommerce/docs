---
sidebar_position: 15
keywords:
  - Routing system
sidebar_label: The Routing System
title: EverShop Routing System
description: This document explains how the EverShop routing system works, how to define routes, and how to generate URLs based on route IDs.
---

![Routing system](./img/routing.jpg "Routing system")

# Routing System

Routing determines how an application responds to client requests to specific endpoints, which consist of a URI (or path) and a specific HTTP request method (GET, POST, etc.).

EverShop uses [ExpressJs](https://expressjs.com/) for its routing implementation.

Before diving into the routing system, we recommend reviewing the module structure documentation to better understand how modules are organized in EverShop.

:::info
Check [this document](/docs/development/knowledge-base/architecture-overview) to learn more about EverShop's project folder structure.
:::

## The Fundamentals

Let's examine a typical module structure:

```bash
├── api
│   ├── createProduct
│   │   ├── route.json
│   ├── updateProduct
│   │   ├── route.json
│   ├── deleteProduct
│   │   ├── route.json
├── graphql
├── migration
├── pages
│   ├── admin
│   │   ├── attributeEdit
│   │   │   └── route.json
│   │   ├── attributeGrid
│   │   │   └── route.json
│   │   ├── attributeNew
│   │   │   └── route.json
│   │   ├── categoryEdit
│   │   │   └── route.json
│   │   ├── categoryEdit+categoryNew
│   │   │   └── route.json
│   │   ├── categoryGrid
│   │   │   └── route.json
│   │   ├── categoryNew
│   │   │   └── route.json
│   │   ├── components.js
│   │   ├── productEdit
│   │   │   └── route.json
│   │   ├── productGrid
│   │   │   └── route.json
│   │   └── productNew
│   │       └── route.json
│   └── frontStore
│       ├── categoryView
│       │   └── route.json
│       └── productView
│           └── route.json
├── services
└── tests
```

In this structure, there are three important components to understand:

### 1. The `api` Folder

The `api` folder organizes RESTful API controllers. Each subfolder within the `api` directory represents a specific API endpoint controller. For example, the `createProduct` folder contains a RESTful API controller that handles `POST` requests to the `/api/products` endpoint. Each of these folders contains a `route.json` file that defines the HTTP method and path for that API controller.

:::info
Check [this document](/docs/development/knowledge-base/api-routes) to learn more about RESTful APIs in EverShop.
:::

### 2. The `pages` Folder

The `pages` folder organizes frontend and admin pages. Each subfolder represents a page controller. These folders contain a `route.json` file that defines the HTTP method and path for that particular page.

### 3. The `admin` and `frontStore` Folders

These folders are used for route scoping:

- Routes under the `frontStore` folder are used for customer-facing pages.
- Routes under the `admin` folder are used for admin panel pages and have additional authentication [middleware functions](/docs/development/knowledge-base/middleware-system) automatically applied to them.

### 4. Route Folders

Route folders are located under either the `admin` or `frontStore` directories. Each route folder contains:

1. Middleware functions that execute when the route is triggered. Learn more about the middleware system in [this document](/docs/development/knowledge-base/middleware-system).
2. The route declaration in the `route.json` file.

The folder name itself serves as the `route ID`. This ID must be unique across the application, and cannot contain whitespace or special characters.

:::info
Since the folder name serves as the `route ID`, it must be unique and cannot contain special characters or whitespace.
:::

## Route Declaration

As mentioned above, each route folder contains a `route.json` file that defines the route specification.

Here's an example of a `route.json` file:

```bash
{
  "methods": [
    "GET"
  ],
  "path": "/category/:url_key"
}
```

This route declaration has two key components:

1. `methods`: An array listing the accepted HTTP methods for this route (e.g., GET, POST, PUT, DELETE).
2. `path`: The URL path pattern for the route. EverShop uses Path-to-RegExp for route path matching. You can find more information about route path patterns [here](https://www.npmjs.com/package/path-to-regexp).

## Generating URLs for Specific Routes

When developing modules or themes, you'll often need to generate URLs for specific routes. EverShop provides a helper function to generate URLs based on route IDs.

Here's an example of using this function:

```js
import { buildUrl } from "@evershop/evershop/lib/router";

buildUrl("category", { url_key: urlKey });
```

The `buildUrl` function takes two arguments:

1. `routeId`: The ID of the route for which you want to generate a URL.
2. `params` (optional): A key-value object containing route parameters, needed when your route has dynamic segments.

Example of using `buildUrl` with parameters:

```js
buildUrl("productEdit", { id: 1 });
```

This will generate the appropriate URL for the `productEdit` route, replacing any dynamic segments with the provided parameters.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
