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
Refer to the [module structure documentation](/docs/development/module/module-overview) to learn more about the structure of EverShop modules.
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

```bash
{
  "path": "/admin/product/:productId",
  "methods": [
    "GET"
  ]
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
