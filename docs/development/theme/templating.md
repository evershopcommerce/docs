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

Shared components are reusable components that can be used across multiple pages. These components are not loaded automatically; you must import them into your master level components. EverShop provides shared components organized by scope:

```bash
node_modules/@evershop/evershop/dist/components/
├── admin/           # Admin-only shared components
├── common/          # Components used in both admin and storefront
│   ├── Area.js
│   ├── form/
│   │   ├── Form.js
│   │   ├── InputField.js
│   │   └── ...
│   └── context/
│       └── app.js
└── frontStore/      # Storefront-only shared components
    ├── cart/
    ├── catalog/
    └── checkout/
```

## The `@components` Aliases

EverShop provides the `@components` path alias as a convenient way to import shared components throughout your theme. This alias automatically resolves to the `components` folder in the `src` directory, making imports cleaner and more maintainable.

### Using the @components Alias

Instead of using relative paths like `../../../components/common/Area`, you can use:

```jsx
import Area from "@components/common/Area";
import Form from "@components/common/form/Form";
```

### Component Resolution Order

When you use the `@components` alias, EverShop resolves the component by checking these paths in order (first match wins):

1. **Your theme's components folder**: `themes/your-theme/dist/components/`
2. **Extension(s) components folder(s)**: `{extension-path}/dist/components/` (each enabled extension, in priority order)
3. **Core components folder**: `node_modules/@evershop/evershop/dist/components/`

This means if you create a component at `themes/your-theme/src/components/common/Area.tsx`, it will automatically override the core `Area` component whenever `@components/common/Area` is imported anywhere in your application.

:::info
In your source code, you write components in `src/components/`. The TypeScript compiler outputs them to `dist/components/`, which is where the runtime resolves them from.
:::

### Overriding Master Level Components

To override a master-level component, create a file in your theme with the **same filename** in the **same route folder**. EverShop uses the combination of route folder name and filename (e.g., `all/Layout.js`) as a key — when your theme provides a file with the same key, it replaces the core component.

:::warning
Theme overrides only apply to **storefront** (`frontStore`) pages. Admin panel components **cannot** be overridden by themes. To customize admin pages, use an [extension](/docs/development/module/extension-development) instead.
:::

Let's examine the default `Layout.tsx` component from the `cms` core module:

```tsx title="modules/pages/all/Layout.tsx"
import React from "react";
import Area from "@components/common/Area";
import "./Layout.scss";

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

To override this component, create a new file at `themes/your-theme-folder/src/pages/all/Layout.tsx`:

```tsx title="themes/your-theme-folder/src/pages/all/Layout.tsx"
import React from 'react';
import Area from '@components/common/Area';
import './Layout.scss';

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

:::warning
Make sure the file path and name in your theme match exactly with the original component you are overriding.
:::

### Overriding Shared Components

Shared components (imported via `@components`) are overridden through the alias resolution order described above. Simply create a file with the same path in your theme's `components` folder.

For example, to override the core `Area` component:

```tsx title="src/components/common/Area.tsx (core)"
import React from "react";

// Core implementation

export default Area;
```

Create your override at `themes/your-theme-folder/src/components/common/Area.tsx`:

```tsx title="themes/your-theme-folder/src/components/common/Area.tsx"
import React from "react";

// Your custom implementation

export default Area;
```

Since the theme's components folder is checked first in the resolution order, your version will be used everywhere `@components/common/Area` is imported — including inside core modules.

### The `theme:twizz` Command

Sometime, finding the right file to copy can be hard and time-consuming.
The `theme:twizz` command solves this. It will automatically create the override file in your theme folder with the content copied from the original. Please checkout the [Command Line Documentation](../knowledge-base/command-lines.md) for more information about this command.

## Adding New Components

### Adding New Master Level Components

Every new master-level component needs two things:
1. A **default export** — the React component function
2. A **`layout` export** — an object specifying which Area to render in and the sort order

```tsx
import React from "react";

export default function NewComponent() {
  return <div>My new component</div>;
}

export const layout = {
  areaId: "content",   // The Area ID to render this component in
  sortOrder: 50,       // Lower numbers appear first within the Area
};
```

The `areaId` must match an existing `<Area id="...">` on the page. See the [View System](/docs/development/theme/view-system) documentation for details on how Areas work.

#### For a Single Page

To add a new master level component to a specific page, first identify the target page. For example, to add a new component to the `productView` page:

```bash
<your-theme-folder>
└── src
    └── pages
        └── productView
            └── NewComponent.tsx
```

The `NewComponent.tsx` file will be automatically loaded when the `productView` page renders.

#### For All Pages

To add a component that will appear on all pages:

```bash
<your-theme-folder>
└── src
    └── pages
        └── all
            └── NewComponent.tsx
```

This component will be loaded on every page.

#### For Multiple Specific Pages

For components that should appear on multiple specific pages, create a folder with the name pattern `pageA+pageB+pageC`:

```bash
<your-theme-folder>
└── src
    └── pages
        └── productView+categoryView
            └── NewComponent.tsx
```

This component will be loaded on both the `productView` and `categoryView` pages.

### Adding New Shared Components

To create a new shared component:

```bash
<your-theme-folder>
└── src
    └── components
        └── common
            └── NewComponent.tsx
```

You can then import this component in any master level component:

```jsx
import NewComponent from "@components/common/NewComponent";
```

## Making Your Theme Translatable

To ensure your theme supports multiple languages, wrap all user-facing text strings with the `_` translation function:

```tsx
import React from "react";
import { _ } from "@evershop/evershop/lib/locale/translate/_";

export default function Component() {
  return (
    <div>
      <h1>{_("Hello World")}</h1>
    </div>
  );
}
```

For dynamic text that includes variables:

```tsx
import React from "react";
import { _ } from "@evershop/evershop/lib/locale/translate/_";

export default function Component() {
  const name = "John";
  return (
    <div>
      <h1>{_("Hello ${name}", { name })}</h1>
    </div>
  );
}
```
