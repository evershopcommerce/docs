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

The view is one of the most critical parts of any web application, as it's the interface with which users interact.

EverShop leverages [React](https://reactjs.org/) to render views. Pages are first rendered on the server side and then sent to the client. The client side then performs hydration to make the page fully interactive.

The EverShop view system was designed to be flexible and easily extensible. Third-party developers can insert their own React components into the view system without modifying the core code.

## The View Architecture

### Multi-Page Application

EverShop is a multi-page application. Each page has its own layout and components. The build process generates a separate bundle file for each page, containing the HTML markup and the JavaScript code necessary to render that page.

### Server-Side Rendering And Hydration

EverShop follows a server-side rendering (SSR) approach. Pages are rendered on the server and sent to the client along with the necessary JavaScript code. The client side then performs hydration to make the page fully interactive.

### Dynamic Layout

EverShop's layout system is designed to be flexible and easily extensible. Third-party developers can insert their own React components into the layout without modifying the core code. Check the [Area Component section](#the-area-component) below to understand more about how to extend layouts.

**Compared to a client-side Single-Page Application (SPA), the advantages of SSR include**:

- **Faster time-to-content**: This advantage is particularly notable on slow internet connections or devices. Server-rendered markup doesn't need to wait for all JavaScript to be downloaded and executed before being displayed, so users see a fully-rendered page sooner. Additionally, data fetching occurs on the server-side for the initial visit, leveraging the server's typically faster connection to your database. This generally results in improved Core Web Vitals metrics, better user experience, and can be critical for applications where time-to-content directly impacts conversion rates.

- **Unified mental model**: Developers can use the same language and declarative, component-oriented approach for the entire application, instead of switching between a backend templating system and a frontend framework.

- **Better SEO**: Search engine crawlers can directly see the fully rendered page, improving indexing and search visibility.

### Fast Refresh

EverShop implements [Fast Refresh](../knowledge-base/fast-refresh) to improve the developer experience and performance. This feature is available only in development mode.

## The Module View Structure

:::info
Please refer to [this document](../module/module-overview) to understand the overall structure of EverShop modules.
:::

Every module in EverShop has a `pages` folder containing all React components used to render pages. Let's examine the structure using the `catalog` module as an example:

```bash
catalog
├── api
├── pages
    ├── admin
    │   └── productEdit
    │       ├── route.json
    │       ├── index.js
    │       ├── General.jsx
    │       ├── Images.jsx
    │       ├── Price.jsx
    └── frontStore
        └── productView
            ├── route.json
            ├── index.js
            ├── ProductImages.jsx
            ├── ProductInfo.jsx
            ├── ProductOptions.jsx
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
    │       ├── index.js
    │       ├── General.jsx
    │       ├── Images.jsx
    │       └── Price.jsx
    └── frontStore
        ├── categoryView
        │   ├── route.json
        │   ├── index.js
        │   ├── CategoryInfo.jsx
        │   └── CategoryProducts.jsx
        └── productView
            ├── route.json
            ├── index.js
            ├── ProductImages.jsx
            ├── ProductInfo.jsx
            └── ProductOptions.jsx

```

In this example, there are three pages: `productEdit`, `categoryView`, and `productView`.
The `productEdit` is an admin panel page used to edit a product. The `categoryView` and `productView` are storefront pages.

:::info
`productEdit`, `categoryView`, and `productView` are route IDs of the corresponding pages. The details of the route (HTTP method, path) are defined in the `route.json` file. Check [this document](../knowledge-base/routing-system) for more information.
:::

The `index.js` file contains a middleware function that will be called when the page is requested. You can add as many middleware functions as needed to the page folder. The middleware functions will be executed in the order they are defined. Check [this document](../knowledge-base/middleware-system) for more information.

To distinguish between a component and middleware, component file names must start with a capital letter (e.g., `General.jsx`), while middleware file names must start with a lowercase letter (e.g., `index.js`).

:::warning
Every master component must be provided as a default export.
:::

### Shared Master Components

Sometimes, you may want to share components between multiple pages. For example, if you have a `ProductInfo` component used in both `productNew` and `productEdit` pages, you can create a folder named `productNew + productEdit` in the `admin` folder and place the `ProductInfo.jsx` component in it. This shared folder makes the `ProductInfo.jsx` component available in both pages.

```bash
catalog
├── pages
    ├── admin
    │   └── productNew+productEdit
    │       └── ProductInfo.jsx
    └── frontStore
```

## The `Area` Component

Let's examine the following layout:

import Layout from '@site/src/components/Layout';

<Layout/>
<br/>

Each block in the layout above is an `Area` with a unique ID.

The `Area` is a React Higher-Order Component (HOC) that accepts components as its children. It renders these child components and passes the `Area`'s props to them.

When a block is rendered by an Area component, third-party developers can insert their own React components into the block without modifying the core code. This makes the view system flexible and easily extensible.

### Using the Area Component

Let's examine the following code:

```js title="src/components/Layout.jsx"
import React from "react";
import Area from "@evershop/evershop/components/common";

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

```js title="src/components/Layout.jsx"
import React from "react";
import Area from "@evershop/evershop/components/common";
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
            component: { default: () => Bottom },
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

```js title="src/modules/catalog/pages/frontStore/productView/Layout.jsx"
import React from "react";
import Area from "@evershop/evershop/components/common";

export default function Layout() {
  return (
    <div className="just-a-block">
      <Area id="productViewLeft" />
      <Area id="productViewRight" />
    </div>
  );
}
```

If we want to insert a component into the left side of the product view page to show product ratings, we can create a new component named `ProductRating.jsx`:

```js title="src/modules/catalog/pages/frontStore/productView/ProductRating.jsx"
import React from "react";
import Area from "@evershop/evershop/components/common";

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

We then export a `layout` object from the `ProductRating.jsx` component. This object tells the system where to insert the component within the page.

In the code above, we export a `layout` object with `areaId` and `sortOrder` properties. The `areaId` specifies which `Area` component should include this component, and the `sortOrder` determines the component's position within that Area.

That's all you need to do to insert the `ProductRating` component into the `productViewLeft` area of the `productView` page.

## Component Data Fetching

:::info
Check [this document](../knowledge-base/data-fetching) for more information about how to fetch data in components.
:::
