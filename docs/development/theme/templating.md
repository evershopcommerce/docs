---
sidebar_position: 25
keywords:
  - EverShop Templating
  - React Components
  - Theme Customization
  - Template Overriding
sidebar_label: Templating
title: Templating
description: A comprehensive guide on customizing EverShop's default templates using React components. Learn how to override existing components or add new ones to create a unique store appearance.
---

# Templating

## Introduction

Developing a theme in EverShop involves customizing the default templates or adding new components to create a unique look and feel for your store. This document provides a comprehensive guide on how to customize templates using React components, demonstrating how to easily override existing components or add new ones to your theme.

Before proceeding, we recommend familiarizing yourself with:

- [Pages](/docs/development/knowledge-base/pages) documentation to understand page structure
- [Extension Structure](/docs/development/module/extension-overview) documentation to understand how modules are organized
- [Theme Overview](/docs/development/theme/theme-overview) documentation to understand the EverShop theme architecture

## EverShop Template System

EverShop uses React components to render pages. Every page in EverShop consists of a set of React components designed to work independently, allowing you to split your pages into smaller, manageable components rather than having a single monolithic component. This modular approach gives you the flexibility to override existing components or add your own to customize your store's appearance.

### Master Level Components

Master level components are the primary building blocks of each page. Let's examine the catalog module structure:

```bash
catalog
└── pages
    ├── admin
    │   ├── categoryEdit
    │   ├── productEdit
    │   └── attributeEdit
    ├── frontStore
    │   ├── productView
    │   │   ├── General.tsx
    │   │   └── Media.tsx
    │   ├── categoryView
    │   │   ├── General.tsx
    │   │   └── Products.tsx
```

In this example, `General.tsx`, `Media.tsx`, and `Products.tsx` are master level components located directly in their respective page folders. There is no limit to the number of master level components a page can have.

:::warning
Since master level components are loaded automatically, you must include the `export default` statement in each master level component.
:::

### Shared Components

Shared components are reusable components that can be used across multiple pages. These components are not loaded automatically; you must import them into your master level components. By default, EverShop has a `components` folder in the `src` directory:

```bash
node_modules/@evershop/evershop
└── dist
    └── components
        ├── admin
        ├── common
        │   ├── Area.jsx
        │   └── form
        │       ├── Form.jsx
        └── frontStore
```

## Component Path Aliases

EverShop provides three important path aliases to simplify component imports:

### 1. @components

This alias points to the `components` folder in the `src` directory. The following diagram illustrates how EverShop resolves the `@components` path alias:

![@components/*](./img/components-alias.png "EverShop component alias")

To override the 'Area' component in your theme, create a component with the same name `Area.jsx` in `<your-theme>/components/common`.

### 2. @components-origin

This alias also points to the `components` folder in the `node_modules/@evershop/evershop/dist/components/` directory, similar to `@components`. However, it always resolves to `node_modules/@evershop/evershop/dist/components/`. This is useful when you want to extend a component rather than completely rewrite it:

```jsx title="themes/your-theme-folder/src/components/common/Area.jsx"
import Area from "@components-origin/common/Area";

export default function NewArea(props) {
  return (
    <div>
      <Area {...props} />
      <div>My extra content</div>
    </div>
  );
}
```

### 3. @default-theme

This alias points to the `pages` folder in each module. Use this alias when you want to extend an existing component:

```jsx title="themes/your-theme-folder/src/pages/productView/General.jsx"
import General from "@default-theme/catalog/frontStore/productView/General";

export default function NewGeneral(props) {
  return (
    <div>
      <General {...props} />
      <div>My additional content</div>
    </div>
  );
}
```

## Overriding Existing Components

To override an existing component, first identify whether it's a master level component or a shared component.

### Overriding Master Level Components

Let's examine the default `Layout.jsx` component from the `cms` core module:

```jsx title="modules/pages/all/Layout.jsx"
import React from "react";
import Area from "@components/common/Area";
import "./Layout.scss";
import "./tailwind.scss";

export default function Layout() {
  return (
    <>
      <div className="header flex justify-between">
        <Area
          id="header"
          noOuter
          coreComponents={[
            {
              component: { default: Area },
              props: {
                id: "icon-wrapper",
                className: "icon-wrapper flex justify-between space-x-1",
              },
              sortOrder: 20,
            },
          ]}
        />
      </div>
      <main className="content">
        <Area id="content" className="" noOuter />
      </main>
      <div className="footer">
        <Area id="footer" className="" />
      </div>
    </>
  );
}

export const layout = {
  areaId: "body",
  sortOrder: 1,
};
```

To override this component, create a new file at `themes/your-theme-folder/src/pages/all/Layout.jsx`:

```jsx title="themes/your-theme-folder/src/pages/all/Layout.jsx"
import React from 'react';
import Area from '@components/common/Area';
import './Layout.scss';
import './tailwind.scss';

export default function Layout() {
  // Your custom layout implementation
  return (
    // Your JSX here
  );
}

export const layout = {
  areaId: "body",
  sortOrder: 1
};
```

### Overriding Shared Components

Let's look at the default `Area.jsx` component from the `common` folder:

```jsx title="src/components/common/Area.jsx"
import React from "react";
import PropTypes from "prop-types";

// component code

export default Area;
```

To override this component, create a new file at `themes/your-theme-folder/src/components/common/Area.jsx`:

```jsx title="themes/your-theme-folder/src/components/common/Area.jsx"
import React from "react";
import PropTypes from "prop-types";

// Your custom implementation

export default Area;
```

:::note
If you want to use the default component's functionality while adding your own, you can import the original component using the `@components-origin` path alias.
:::

## Adding New Components

### Adding New Master Level Components

#### For a Single Page

To add a new master level component to a specific page, first identify the target page. For example, to add a new component to the `productView` page:

```bash
<your-theme-folder>
└── pages
    └── productView
        └── NewComponent.jsx
```

The `NewComponent.jsx` file will be automatically loaded when the `productView` page renders.

#### For All Pages

To add a component that will appear on all pages:

```bash
<your-theme-folder>
└── src
    └── pages
        └── all
            └── NewComponent.jsx
```

This component will be loaded on every page.

#### For Multiple Specific Pages

For components that should appear on multiple specific pages, create a folder with the name pattern `pageA+pageB+pageC`:

```bash
<your-theme-folder>
└── src
    └── pages
        └── productView+categoryView
            └── NewComponent.jsx
```

This component will be loaded on both the `productView` and `categoryView` pages.

### Adding New Shared Components

To create a new shared component:

```bash
<your-theme-folder>
└── src
    └── components
        └── common
            └── NewComponent.jsx
```

You can then import this component in any master level component:

```jsx
import NewComponent from "@components/common/NewComponent";
```

## Making Your Theme Translatable

To ensure your theme supports multiple languages, wrap all user-facing text strings with the `_` translation function:

```jsx
import React from "react";
import { _ } from "@evershop/evershop/src/lib/locale/translate";

export default function Component() {
  return (
    <div>
      <h1>{_("Hello World")}</h1>
    </div>
  );
}
```

For dynamic text that includes variables:

```jsx
import React from "react";
import { _ } from "@evershop/evershop/src/lib/locale/translate";

export default function Component() {
  const name = "John";
  return (
    <div>
      <h1>{_("Hello ${name}", { name })}</h1>
    </div>
  );
}
```

## Best Practices

1. **Component Naming**: Use descriptive names for your components that clearly indicate their purpose.
2. **Code Organization**: Keep your component structure clean and organized following React best practices.
3. **Performance**: Avoid unnecessary re-renders by using React's optimization techniques like memoization.
4. **Consistent Styling**: Maintain consistent styling approaches throughout your theme.
5. **Documentation**: Document your custom components for easier maintenance and collaboration.
