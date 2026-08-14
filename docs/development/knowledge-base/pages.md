---
sidebar_position: 27
keywords:
  - EverShop Pages
sidebar_label: Pages
title: Pages
description: EverShop pages are located in the `pages` folder of each module. Learn how to create pages in your extension.
---

# Pages

:::info
Refer to the [module structure documentation](/docs/development/module/extension-overview) to learn more about the structure of EverShop modules.
:::

EverShop pages are located in the `pages` folder of each module. Below is an example of the page structure in the `catalog` module:

```bash
catalog
├── pages
    ├── global
    │   └── auth.ts
    ├── admin
    │   └── productEdit
    │       ├── route.json
    │       ├── index.ts
    │       ├── General.tsx
    │       ├── Images.tsx
    │       ├── Price.tsx
    └── frontStore
        └── productView
            ├── route.json
            ├── index.ts
            ├── ProductImages.tsx
            ├── ProductInfo.tsx
            ├── ProductOptions.tsx

```

## `pages` Folder Structure

The `pages` folder contains the following subfolders:

- `global` - This folder contains middleware functions that are executed for all pages, both in the admin panel and front store. For example, you can use this folder to create a middleware that verifies user authentication. This folder does not contain any [React](https://reactjs.org/) components; it only contains middleware functions.

- `admin` - This folder contains pages for the admin panel. The `admin` folder contains subfolders for each page. For example, the `productEdit` folder contains the page components for editing a product.

- `frontStore` - This folder contains pages for the front store. The `frontStore` folder contains subfolders for each page. For example, the `productView` folder contains the page components for viewing a product.

## The `admin` and `frontStore` Folders

The `admin` and `frontStore` folders contain the following subfolders:

- `all` - This folder contains React components that are used across all pages within their respective sections (admin or front store).

- Other subfolders - Each subfolder represents a specific page. For example, the `productEdit` folder contains all components and middleware for the product editing page.

## The Single Page Folder

Each page folder contains middleware functions, React components, and the route definition for that specific page.

Below is an example of a page folder structure:

```bash
productEdit
├── route.json # Route definition for the page
├── index.ts   # Middleware function
├── General.tsx # React component
├── Images.tsx  # React component
└── Price.tsx   # React component
```

### The Page Route

Each page folder must contain a `route.json` file that defines the route for that page. For example, the `route.json` file for the `productEdit` page might look like this:

```json
{
  "path": "/product/:productId",
  "methods": ["GET"],
  "name": "Edit Product"
}
```

:::warning
Do **not** write the `/admin` prefix into `path`. Every route under `pages/admin/` receives it automatically at registration time, so `"path": "/admin/product/:productId"` would produce `/admin/admin/product/:productId`. The same applies to `api/` routes and their `/api` prefix.
:::

`route.json` accepts five keys:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Key</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>path</code></td><td>Yes</td><td>The URL path pattern, without the <code>/admin</code> or <code>/api</code> prefix. Supports <code>path-to-regexp</code> parameters.</td></tr>
    <tr><td><code>methods</code></td><td>Yes</td><td>Array of accepted HTTP methods.</td></tr>
    <tr><td><code>access</code></td><td>No</td><td><code>"public"</code> or <code>"private"</code>, defaulting to <code>"private"</code> — but it only affects <code>api/</code> routes, where the API auth middleware reads it. <strong>Page routes ignore it entirely:</strong> storefront pages are always reachable, and admin page auth is enforced by the global admin <code>auth</code> middleware keyed on route id.</td></tr>
    <tr><td><code>name</code></td><td>No</td><td>Human-readable label for the route. Defaults to the route ID; shown in the admin page-builder route list.</td></tr>
    <tr><td><code>editable</code></td><td>No</td><td>Set to <code>true</code> to make the page openable in the <strong>page builder</strong> at <code>/admin/page-builder</code>, so widgets can be placed on it. Defaults to <code>false</code> and has no effect on request handling.</td></tr>
  </tbody>
</table>

A storefront page opted into the page builder looks like this:

```json
{
  "methods": ["GET"],
  "path": "/page/:url_key",
  "name": "Static Page",
  "editable": true
}
```

:::warning
The folder name will be used as the routeId, so ensure the folder name is unique and does not contain any special characters.
:::

:::info
Refer to the [routing system documentation](/docs/development/knowledge-base/routing-system) to learn more about EverShop's routing system.
:::

### Page Middleware

EverShop allows you to create middleware functions for each page. For example, you can create middleware to check page availability before rendering the content. You can create as many middleware functions as needed for each page.

To differentiate between middleware functions and React components, middleware function files should use all lowercase naming. For example, `index.js` is a middleware function.

:::info
Refer to the [middleware system documentation](/docs/development/knowledge-base/middleware-system) to learn more about EverShop's middleware system.
:::

### Shared Middleware Functions

Sometimes you may need to use the same middleware functions across multiple pages. For example, you might need identical middleware for both the `productEdit` and `productCreate` pages. In this case, you can create a special folder named `productEdit+productCreate` in the `pages/admin` directory and place the shared middleware functions there. All middleware functions in this folder will be executed for both pages.

This special shared folder does not contain any `route` file; it only contains React components and middleware functions.

If you have middleware functions required for all pages (both front store and admin panel), place them in the `pages/global` directory.

If you have middleware functions required for all admin panel pages, place them in the `pages/admin/all` directory. The same approach applies for front store pages with `pages/frontStore/all`.

### Page Templates (Master Components)

Master components are React components located in the page folder. For example, `General.tsx`, `Images.tsx`, and `Price.tsx` are React components for the `productEdit` page.

Each React component must provide a default export. Here's an example from the `General.tsx` file:

```js
import React from "react";

const General = () => {
  return (
    <div>
      <h1>General</h1>
    </div>
  );
};

export default General;

export const layout = {
  areaId: "content",
  sortOrder: 10,
};
```

:::info
Refer to the [view system documentation](/docs/development/theme/view-system) to learn more about the layout and block system.
:::

:::info
Refer to the [data loading documentation](/docs/development/knowledge-base/data-fetching) to learn how to load data in React components.
:::

:::warning
A page folder can contain both middleware and React components. To help EverShop identify React components and middleware correctly, follow these naming conventions:

- React components: First letter uppercase, file extension `.jsx` or `.tsx` (e.g., `General.jsx`)
- Middleware functions: All lowercase, file extension `.js` or `.ts` (e.g., `general.js`)
  :::

### Shared React Components

Sometimes you may need to use the same React component across multiple pages. For example, you might need identical components for both the `productEdit` and `productCreate` pages. In this case, you can create a special folder named `productEdit+productCreate` in the `pages/admin` directory and place the shared React components there. All components in this folder will be available to both pages.

This special shared folder does not contain any `route` file; it only contains React components and middleware functions.

If you have components required for all pages within a section, you can place them in the `admin/all` or `frontStore/all` folder. For example, the CMS module uses these folders to store Layout components that are used across multiple pages.

## URL Rewrites and Friendly URLs

EverShop uses a URL rewrite system to map user-friendly URLs to internal routes. For example, instead of visiting `/product/123`, a customer sees `/awesome-running-shoes`.

URL rewrites are stored in the `url_rewrite` database table. When no standard route matches an incoming request, EverShop checks this table for a matching `request_path` and internally remaps to the corresponding `target_path`.

How a rewrite is created depends on the entity:

- **Products, categories and blog entities** get theirs from **event subscribers** (`product_created`, `category_updated`, `blog_post_created`, …), so the rewrite lands shortly after the entity is saved.
- **CMS pages and landing pages** write theirs **synchronously inside the create/update service transaction** (`syncPageUrlRewrite`, `syncLandingPageUrlRewrite`), so the friendly URL works the instant the save returns.

CMS pages are served at the root level — `/about-us`, not `/page/about-us`. The `/page/:url_key` route still resolves but **301-redirects** to the root path.

When two entity types claim the same `request_path`, the lookup resolves it deterministically by entity type (landing page → CMS page → product → category → everything else), then by the oldest row.

For browser-visible 301/302 redirects — as opposed to these internal remaps — see [URL Redirects](./url-redirects).

:::info
See [the routing system documentation](/docs/development/knowledge-base/routing-system#url-rewrites) for the full lookup, including the precedence SQL and the locale-prefix interaction.
:::

## File Naming Convention Summary

EverShop uses file naming to distinguish between React components and middleware:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Type</th>
      <th>Naming Rule</th>
      <th>Example</th>
      <th>Loaded As</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>React Component</td><td>First letter <strong>uppercase</strong>, extension <code>.tsx</code> or <code>.jsx</code></td><td><code>General.tsx</code>, <code>ProductInfo.tsx</code></td><td>Master-level component (auto-loaded into the page layout)</td></tr>
    <tr><td>Middleware</td><td>First letter <strong>lowercase</strong>, extension <code>.ts</code> or <code>.js</code></td><td><code>index.ts</code>, <code>loadProduct.ts</code></td><td>Middleware function (executed during request lifecycle)</td></tr>
  </tbody>
</table>

This convention is enforced by the component scanner, which filters files based on the first character of the filename.
