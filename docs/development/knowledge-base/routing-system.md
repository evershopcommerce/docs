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
├── api/
│   ├── createProduct/
│   │   ├── route.json
│   │   └── createProduct.ts
│   └── updateProduct/
│       ├── route.json
│       └── updateProduct.ts
├── pages/
│   ├── admin/
│   │   ├── productEdit/
│   │   │   ├── route.json
│   │   │   ├── index.ts            # Middleware (lowercase)
│   │   │   └── General.tsx          # React component (uppercase)
│   │   └── productGrid/
│   │       ├── route.json
│   │       └── index.ts
│   └── frontStore/
│       ├── categoryView/
│       │   ├── route.json
│       │   └── index.ts
│       └── productView/
│           ├── route.json
│           ├── index.ts
│           └── ProductInfo.tsx
└── ...
```

### The `api` Folder

The `api` folder is where you define all your RESTful API endpoints. Each sub-folder inside `api` corresponds to a single API endpoint and contains:

- `route.json`: A file that defines the route's path and HTTP method.
- One or more middleware files (`.ts`): Functions that process the request sequentially.

See [API Routes](/docs/development/knowledge-base/api-routes) for the full API development guide.

### The `pages` Folder

The `pages` folder is for routes that render a user interface. It is further divided into `admin` and `frontStore` to separate backend and frontend pages.

- **`admin`**: Routes for the admin panel. These routes automatically have authentication and authorization middleware applied.
- **`frontStore`**: Routes for the customer-facing storefront.

Each sub-folder inside `admin` or `frontStore` represents a page and contains `route.json`, middleware files (lowercase `.ts`), and React components (uppercase `.tsx`). See [Pages](/docs/development/knowledge-base/pages) for more details.

## The Route ID

The name of the route's folder serves as its unique **Route ID**. For example, the route defined in `pages/admin/productEdit` has a Route ID of `productEdit`.

This ID is crucial for two reasons:

1.  It must be unique across the entire application.
2.  It is used to generate URLs programmatically.

:::warning
Route IDs must be unique and can only contain **alphabetic characters** (a-z, A-Z). Numbers, spaces, hyphens, underscores, and other special characters are not allowed in route folder names.
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

- **`methods`**: An array of accepted HTTP methods (e.g., `GET`, `POST`, `PUT`, `DELETE`).
- **`path`**: The URL path pattern. EverShop uses `path-to-regexp` for matching, so you can include dynamic parameters like `:id`.
- **`access`** (optional): Defines the access control for the route.
  - `"public"`: The route is accessible to everyone, without authentication.
  - `"private"`: The route requires authentication. This is the default behavior if the `access` property is not specified. If this access property is not set, the route will be treated as private.
- **`name`** (optional): A human-readable label for the route. Defaults to the route ID. This is what the admin page-builder route picker displays.
- **`editable`** (optional, default `false`): Set to `true` to opt the route into the **page builder**. Only routes with `"editable": true` appear in `/admin/page-builder` and can have widget placements attached to them. It has no effect on request handling.

Here is a page route using all of them:

```json
{
  "methods": ["GET"],
  "path": "/page/:url_key",
  "name": "Static Page",
  "editable": true
}
```

## Generating URLs

Hardcoding URLs is a bad practice. EverShop provides a `buildUrl()` helper function to generate URLs dynamically using the Route ID. This ensures that your URLs will always be correct, even if you change the path in `route.json`.

```js
import { buildUrl } from '@evershop/evershop/lib/router';

// Generates a URL for the 'categoryView' route.
// Its path is /category/:uuid, so the parameter is `uuid` — passing `url_key`
// throws `Could not build url for route categoryView`.
const categoryUrl = buildUrl('categoryView', { uuid: category.uuid });
// Result: /category/2f1c...

// Generates a URL for the 'productEdit' route (path /products/edit/:id)
const productEditUrl = buildUrl('productEdit', { id: 123 });
// Result: /admin/products/edit/123
```

The `buildUrl()` function takes two arguments:

1.  `routeId`: The unique ID of the route.
2.  `params` (optional): An object containing values for any dynamic parameters in the route's path.

By using `buildUrl()`, you decouple your code from the specific URL structure, making your application more robust and easier to maintain.

### Absolute URLs

For cases where you need the full URL (e.g., in emails or external integrations), use `buildAbsoluteUrl()`:

```js
import { buildAbsoluteUrl } from '@evershop/evershop/lib/router';

const fullUrl = buildAbsoluteUrl('productView', { uuid: product.uuid });
// Result: https://yourstore.com/product/2f1c...
```

This prepends the store base URL resolved by `getBaseUrl()`: the `EVERSHOP_HOME_URL` environment variable if set, otherwise the `shop.homeUrl` config value, otherwise `http://localhost:` plus the configured port.

:::warning Parameter names come from `route.json`, not from the entity
The parameter keys must match the `:placeholders` in the route's path. `productView`
and `categoryView` are `/product/:uuid` and `/category/:uuid` — they take **`uuid`**,
not `url_key` or `id`. Only `cmsPageView` (`/page/:url_key`) and `landingPageView`
(`/landing/:url_key`) take `url_key`. A wrong key throws
`Could not build url for route <id>`.

Pretty URLs are not built here: `url_rewrite` maps the canonical route URL to the
merchant-facing slug at request time, which is why the resolvers in core call
`buildUrl('productView', { uuid })` and let the rewrite layer do the rest.
:::

### Query Parameters

`buildUrl()` also accepts a third argument for query parameters:

```js
import { buildUrl } from '@evershop/evershop/lib/router';

const url = buildUrl('productGrid', {}, { page: 2, sortBy: 'price' });
// Result: /admin/products?page=2&sortBy=price
```

## Admin Route Prefix

All routes defined under `pages/admin/` automatically receive an `/admin` prefix. For example, if your route.json defines `"path": "/products/edit/:id"`, the final URL becomes `/admin/products/edit/:id`.

This happens during route registration and is transparent to your code — `buildUrl()` handles the prefix automatically. The same rule applies to API routes, which are prefixed with `/api`. Never write the prefix into `route.json` yourself — you would end up with `/admin/admin/...`.

## Storefront Locale Prefix

Storefront URLs can carry a leading locale segment (`/fr/my-product`, `/de-DE/checkout`). This is handled by the **locale middleware**, which runs *before* route matching:

- It strips the prefix — but only when the segment names an **enabled**, non-default locale — and puts the remainder on `request.localePath`.
- `request.originalUrl` keeps the prefix, so canonical/SEO links and redirects stay locale-correct.
- Route matching and the `url_rewrite` lookup both operate on `request.localePath`, so **routes and rewrites never see the locale prefix** and you never declare it in `route.json`.

Admin routes and API routes are never locale-prefixed. Admin pages run in the admin language; storefront REST endpoints resolve their locale from the `X-Locale` request header instead.

See [Multi-Language](./multi-language) for the full resolution rules.

## Route Matching Order

When multiple routes could match an incoming request, EverShop uses a **specificity-based sorting** algorithm:

1. Routes without dynamic parameters (`:id`) are matched first.
2. Routes with more static path segments take priority.
3. Routes with fewer dynamic parameters take priority.

This means a route like `/products/featured` will always be matched before `/products/:id`, regardless of the order they were registered.

## URL Rewrites

EverShop includes a URL rewrite system that maps user-friendly URLs to internal routes. For example, instead of `/product/123`, a customer sees `/awesome-running-shoes`.

URL rewrites are stored in the `url_rewrite` database table and are checked automatically when no standard route matches the incoming request. The rewrite system extracts the internal route and its parameters, then processes the request as if the internal URL had been used.

:::info
The lookup uses `request.localePath` (locale prefix already stripped), and it is **skipped entirely** when `NODE_ENV === 'test'`.
:::

### How Rewrites Get Created

Two different mechanisms, depending on the entity:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Entity type</th>
      <th>Created by</th>
      <th>Maps to</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>product</code></td><td>Event subscribers (<code>product_created</code> / <code>product_updated</code>)</td><td><code>/product/[uuid]</code></td></tr>
    <tr><td><code>category</code></td><td>Event subscribers (<code>category_created</code> / <code>category_updated</code>)</td><td><code>/category/[uuid]</code></td></tr>
    <tr><td><code>cms_page</code></td><td><strong>Synchronously, inside the create/update service transaction</strong> — <code>modules/cms/services/page/syncPageUrlRewrite.ts</code></td><td><code>/page/[url_key]</code></td></tr>
    <tr><td><code>landing_page</code></td><td><strong>Synchronously, inside the create/update service transaction</strong> — <code>modules/promotion/services/landingPage/syncLandingPageUrlRewrite.ts</code></td><td><code>/landing/[url_key]</code></td></tr>
    <tr><td><code>blog_post</code>, <code>blog_category</code>, <code>blog_tag</code></td><td>Event subscribers</td><td>The corresponding blog routes (e.g. <code>/blogPost/[uuid]</code>)</td></tr>
  </tbody>
</table>

The distinction matters: subscriber-backed rewrites are **eventually consistent** (they land shortly after the entity is saved), while CMS and landing pages have their rewrite committed in the same transaction as the entity, so the friendly URL works the instant the save returns.

### Collision Precedence

`url_rewrite` only enforces `UNIQUE(entity_uuid)`, so two entities of different types can legitimately claim the same `request_path`. The lookup resolves the ambiguity deterministically rather than picking at random:

```sql
SELECT * FROM url_rewrite
 WHERE request_path = $1
 ORDER BY CASE entity_type
     WHEN 'landing_page' THEN 0
     WHEN 'cms_page'     THEN 1
     WHEN 'product'      THEN 2
     WHEN 'category'     THEN 3
     ELSE 4
   END,
   url_rewrite_id ASC
 LIMIT 1
```

Landing pages win a genuine collision, then CMS pages, then products, then categories; anything else falls to the end, with the oldest row breaking a remaining tie.

### CMS Pages Serve at the Root

CMS pages are served at the root level: a page with `url_key` `about-us` responds at `/about-us`, via a `cms_page` rewrite pointing at the internal `/page/about-us` route. The legacy `/page/:url_key` URL still resolves, but it **301-redirects** to the root-level path — only a literal `/page/*` request hits that branch, so the rewritten request never loops.

### Redirects

A rewrite is an internal remap; a **redirect** sends the browser somewhere else with a 301/302. EverShop has a separate redirect layer for that — see [URL Redirects](./url-redirects).

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
