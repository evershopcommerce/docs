---
sidebar_position: 15
keywords:
  - view system
  - React components
  - server-side rendering
sidebar_label: The View System
title: EverShop View System
description: EverShop utilizes React to render views with server-side rendering followed by client-side hydration. This architecture creates interactive pages while enabling developers to extend the view system without modifying core code.
---

![EverShop view system](./img/the-view-system.jpg "EverShop view system")

EverShop uses [React](https://reactjs.org/) to render every page. Pages are first rendered on the server (SSR) and sent as HTML to the browser. The browser then hydrates the page, attaching event handlers to make it fully interactive.

The view system is designed so that extensions and themes can insert, replace, or reorder React components on any page — without modifying core code. This is made possible by the **Area** component and the **layout export** pattern described below.

## The View Architecture

### Multi-Page Application

EverShop is a multi-page application (MPA). Each page has its own layout and components, and the build process generates a **separate bundle** for each page. This means a customer loading the product page only downloads the JavaScript for that page, not the entire application.

### Server-Side Rendering and Hydration

Every page request follows this flow:

1. **Middleware** runs on the server (authentication, data loading, context setup)
2. **GraphQL queries** from all components on the page are merged and executed in a single server-side request
3. **React SSR** renders the component tree to HTML
4. The HTML is sent to the browser along with the query results
5. **Client-side hydration** attaches React event handlers to the existing HTML

This gives you fast time-to-content, good SEO (crawlers see fully rendered pages), and a fully interactive page after hydration.

### The Dynamic Layout System

Instead of a fixed page template, EverShop uses a dynamic layout system based on **Areas**. Each Area is a named slot where components can be inserted. Components declare which Area they belong to and their sort order via the `layout` export, and EverShop assembles the page automatically.

This means extensions and themes can add components to any page without editing that page's source code. See the [Area Component section](#the-area-component) below for details.

### Fast Refresh

In development mode (`npm run dev`), EverShop supports [Fast Refresh](../knowledge-base/fast-refresh) — editing a React component updates the browser instantly without losing component state.

## The Module View Structure

:::info
Please refer to [this document](../module/extension-overview) to understand the overall structure of EverShop extensions.
:::

Every module in EverShop has a `pages` folder containing all React components used to render pages. Let's examine the structure using the `catalog` module as an example:

```bash
catalog
├── api
├── pages
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

The `pages` folder has three sub-folders: `admin`, `frontStore`, and `global`. The `admin` folder contains all admin panel pages. The `frontStore` folder contains pages for your storefront. The `global` folder contains _middleware functions_ used in both the admin panel and storefront.

### Master Components and Pages

Looking again at the `catalog` module:

```bash
catalog
├── api
├── pages
    ├── admin
    │   └── productEdit
    │       ├── route.json
    │       ├── index.ts
    │       ├── General.tsx
    │       ├── Images.tsx
    │       └── Price.tsx
    └── frontStore
        ├── categoryView
        │   ├── route.json
        │   ├── index.ts
        │   ├── CategoryInfo.tsx
        │   └── CategoryProducts.tsx
        └── productView
            ├── route.json
            ├── index.ts
            ├── ProductImages.tsx
            ├── ProductInfo.tsx
            └── ProductOptions.tsx

```

In this example, there are three pages: `productEdit`, `categoryView`, and `productView`.
The `productEdit` is an admin panel page used to edit a product. The `categoryView` and `productView` are storefront pages.

:::info
`productEdit`, `categoryView`, and `productView` are route IDs of the corresponding pages. The details of the route (HTTP method, path) are defined in the `route.json` file. Check [this document](../knowledge-base/routing-system) for more information.
:::

The `index.ts` file contains a middleware function that will be called when the page is requested. You can add as many middleware functions as needed to the page folder. The middleware functions will be executed in the order they are defined. Check [this document](../knowledge-base/middleware-system) for more information.

To distinguish between a component and middleware, component file names must start with a capital letter (e.g., `General.tsx`), while middleware file names must start with a lowercase letter (e.g., `index.ts`).

:::warning
Every master component must be provided as a default export.
:::

### Shared Master Components

Sometimes, you may want to share components between multiple pages. For example, if you have a `ProductInfo` component used in both `productNew` and `productEdit` pages, you can create a folder named `productNew + productEdit` in the `admin` folder and place the `ProductInfo.tsx` component in it. This shared folder makes the `ProductInfo.tsx` component available in both pages.

```bash
catalog
├── pages
    ├── admin
    │   └── productNew+productEdit
    │       └── ProductInfo.tsx
    └── frontStore
```

## The `Area` Component

import Layout from '@site/src/components/Layout';

<Layout/>
<br/>

Each block in the diagram above is an `Area` with a unique ID. The `Area` component is the foundation of EverShop's dynamic layout system. It acts as a named slot that renders all components assigned to it, sorted by `sortOrder`.

### Area Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>id</code></td><td><code>string</code></td><td>(required)</td><td>Unique identifier for this Area. Components target this ID via their <code>layout.areaId</code> export.</td></tr>
    <tr><td><code>className</code></td><td><code>string</code></td><td><code>undefined</code></td><td>CSS class applied to the wrapper element.</td></tr>
    <tr><td><code>noOuter</code></td><td><code>boolean</code></td><td><code>false</code></td><td>When <code>true</code>, renders children without a wrapper element (uses <code>React.Fragment</code>).</td></tr>
    <tr><td><code>wrapper</code></td><td><code>string | ReactNode</code></td><td><code>'div'</code></td><td>The HTML tag or React component used as the wrapper.</td></tr>
    <tr><td><code>wrapperProps</code></td><td><code>object</code></td><td><code>{}</code></td><td>Additional props passed to the wrapper element.</td></tr>
    <tr><td><code>coreComponents</code></td><td><code>Component[]</code></td><td><code>[]</code></td><td>Pre-defined inline components (see below).</td></tr>
  </tbody>
</table>

:::info
In development mode, EverShop includes an Area debug overlay. Toggle it with the floating debug button to see Area boundaries, IDs, and component sort orders directly in the browser.
:::

### Using the Area Component

Let's examine the following code:

```tsx title="src/components/Layout.tsx"
import React from "react";
import Area from "@components/common/Area";

export default function Layout() {
  return (
    <div className="just-a-block">
      <Area id="blockId" />
    </div>
  );
}
```

In this code, we declare an `Area` with the ID `blockId`. The `Area` will render all child components that have the areaId set to `blockId`.

You can also provide a list of pre-defined components to the `Area` component:

```tsx title="src/components/Layout.tsx"
import React from "react";
import Area from "@components/common/Area";
import Top from "./Top";
import Bottom from "./Bottom";

export default function Layout() {
  return (
    <div className="just-a-block">
      <Area
        id="blockId"
        coreComponents={[
          {
            component: { default: () => <Top /> },
            props: {
              title: "Top",
            },
            sortOrder: 1,
          },
          {
            component: { default: () => <Bottom /> },
            props: {
              title: "Bottom",
            },
            sortOrder: 2,
          },
        ]}
      />
    </div>
  );
}
```

The `Area` component renders its child components in order of their `sortOrder` values.

### Injecting Components into an Area

Let's say we have a 'productView' page with the following layout component:

```tsx title="src/modules/catalog/pages/frontStore/productView/Layout.tsx"
import React from "react";
import Area from "@components/common/Area";

export default function Layout() {
  return (
    <div className="just-a-block">
      <Area id="productViewLeft" />
      <Area id="productViewRight" />
    </div>
  );
}
```

If we want to insert a component into the left side of the product view page to show product ratings, we can create a new component named `ProductRating.tsx`:

```tsx title="src/modules/catalog/pages/frontStore/productView/ProductRating.tsx"
import React from "react";
import Area from "@components/common/Area";

export default function ProductRating({ stars }) {
  return (
    <div className="product-rating">
      <Star stars={stars} />
    </div>
  );
}
// highlight-start

export const layout = {
  areaId: "productViewLeft",
  sortOrder: 1,
};

// highlight-end
```

We then export a `layout` object from the `ProductRating.tsx` component. This object tells the system where to insert the component within the page.

In the code above, we export a `layout` object with `areaId` and `sortOrder` properties. The `areaId` specifies which `Area` component should include this component, and the `sortOrder` determines the component's position within that Area.

That's all you need to do to insert the `ProductRating` component into the `productViewLeft` area of the `productView` page.

## Component Data Fetching

Components can declare a GraphQL query that is automatically executed on the server during SSR. Export a `query` constant alongside your component:

```tsx title="ProductPrice.tsx"
import React from "react";

export default function ProductPrice({ product }) {
  return (
    <div>
      <span>{product.price.regular.text}</span>
      {product.price.special && (
        <span className="text-destructive">{product.price.special.text}</span>
      )}
    </div>
  );
}

export const layout = {
  areaId: "productViewInfo",
  sortOrder: 20,
};

export const query = `
  query {
    product(id: getContextValue("productId")) {
      price {
        regular { value text }
        special { value text }
      }
    }
  }
`;
```

During the build process, EverShop extracts all `query` exports from every component on the page, merges them into a single GraphQL request, and executes it on the server. The results are automatically passed to each component as props.

The `getContextValue()` function retrieves values that were set by middleware earlier in the request (e.g., a product ID extracted from the URL). See the [Data Fetching](../knowledge-base/data-fetching) documentation for the complete guide.

## How It All Fits Together

Here's the complete flow for rendering a storefront page:

1. A request arrives and the router matches it to a route (e.g., `productView`)
2. Middleware runs — loads product data, sets context values
3. EverShop collects all components for this route from core modules, extensions, and the active theme
4. All `query` exports are merged into one GraphQL query and executed
5. The component tree is assembled: each component is placed into its declared Area, sorted by `sortOrder`
6. React renders the tree to HTML on the server
7. The browser receives the HTML and hydrates it with the JavaScript bundle for this page

Extensions and themes participate at step 3 — they can add new components, override existing ones (same filename = override), or inject components into any Area on the page.
