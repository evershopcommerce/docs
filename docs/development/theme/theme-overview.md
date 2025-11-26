---
sidebar_position: 5
keywords:
  - Theme overview
sidebar_label: Theme Overview
title: Theme Overview
description: EverShop theme overview document. Learn what themes are, where they're located, and how to develop custom themes for your store.
---

# Theme Overview

A theme is a component of the EverShop application that provides a consistent look and feel (visual design) for an entire application area (such as the storefront or admin panel) using a combination of custom templates, styles, and images.

In EverShop, themes are designed to override or customize the view layer that is initially provided by modules or libraries.

Similar to [extensions](/docs/development/module/extension-overview), [themes](./theme-overview) are implemented by different vendors (frontend developers) and are intended to be distributed as additional packages for the EverShop system.

Out-of-the-box, the [EverShop](https://evershop.io/) application provides a default theme for demonstration purposes. This theme is fully customizable, allowing you to develop your own theme based on it.

You can use the default theme for a live store, but if you want to customize the default design, it's recommended to create a new theme. We strongly recommend against modifying the default theme directly, as your changes could be overwritten during upgrades when new versions of the default files are installed.

:::info
You can check out the [Eve Theme repository](https://github.com/evershopcommerce/evetheme) for an example theme. It's a simple theme that helps you understand how to create a custom theme for EverShop.
:::

## Where Are Themes Located?

### The Default Theme

If you've already read the [extension overview document](../module/extension-overview), you know that EverShop is a modular application where all functionality is implemented and delivered in components known as Modules. Themes are also implemented and delivered through modules.

This means that every module has its own `view` part to handle the UI/UX. This `view` part is designed to be easily customizable without modifying the core files.

In each module, you can find a `pages` folder containing all files related to the UI/UX of the module. This folder contains the following sub-folders:

- `admin` folder: Contains all pages related to the admin panel.
- `storefront` folder: Contains all pages related to the storefront.
- `global` folder: A special folder containing middlewares that are used in both admin and storefront areas.

```bash
catalog
├── pages
    ├── global
    ├── admin
    │   ├── all
    │   ├── attributeEdit
    │   ├── attributeEdit+attributeNew
    │   ├── attributeGrid
    │   ├── attributeNew
    │   ├── categoryEdit
    │   ├── categoryEdit+categoryNew
    │   ├── categoryGrid
    │   ├── categoryNew
    │   ├── productEdit
    │   ├── productEdit+productNew
    │   ├── productGrid
    │   └── productNew
    └── frontStore
        ├── categoryView
        ├── homepage
        └── productView
```

:::info
You can learn more about the `view` part of modules in the [module view system](../theme/view-system.md) documentation.
:::

### The Vendor Themes

Themes provided by vendors/developers are located in a folder named 'themes'. This folder is located at the [root level of your project](/docs/development/knowledge-base/architecture-overview).

Each theme must be stored in a separate directory:

```bash
*/themes/
├── <theme1>
├── <theme2>
├── <theme3>
├── ...
```

## Theme Structure

### Theme Name

A theme's folder name is used as the theme name. Make sure you don't include any whitespace or special characters in the directory name of your theme.

The structure of an EverShop theme directory typically looks like the following:

```bash
/themes/
    <themeName>/
    ├── public     # Public assets for storing images, fonts, etc.
    ├── dist       # Compiled code of the theme.
    ├── src        # Source code of the theme in TypeScript.
    │    ├── components # React components. Contains shared components that can be used in multiple pages.
    │    └── pages      # Every sub-folder represents a page.
    │       ├── all       # Components located in this folder will be used in all pages.
    │       │   ├── All.tsx  # Master level components. This component will be included in the layout of all pages.
    │       ├── categoryView
    │       │   └── FreeShippingBanner.tsx  # Page-specific components.
    │       ├── checkout
    │       │   └── CheckoutOnly.tsx  # Page-specific components.
    │       └── homepage
    │           └── HomepageOnly.tsx  # Page-specific components.
    ├── package.json # Theme package file.
    └── tsconfig.json # TypeScript configuration file.
```

### The `package.json` File

The `package.json` file is used to define the theme's metadata, dependencies, and scripts. It should be located in the root directory of your theme.

Here's an example of a `package.json` file for a theme:

```json title="themes/yourtheme/package.json"
{
  "name": "yourtheme",
  "version": "1.0.0",
  "description": "A custom theme for EverShop",
  "type": "module",
  "scripts": {
    "compile": "tsc" // Compiles TypeScript files to JavaScript.
  },
  "dependencies": {
    "@evershop/evershop": "^1.0.0"
  },
  "devDependencies": {
    "postcss-cli": "^8.3.1",
    "webpack": "^5.64.4"
  }
}
```

:::warning
Since EverShop is built on ESM modules, ensure that your theme’s package.json file has the type field set to "module".
:::

Add the themes directory to the workspaces section of your root package.json. This enables each theme to function as an independent package with its own dependencies.

```json title="package.json"
{
  "workspaces": ["themes/*"]
}
```

### The `tsconfig.json` File

The `tsconfig.json` file is used to configure the TypeScript compiler options for your theme. It should be located in the root directory of your theme. Here's an example of a `tsconfig.json` file for a theme:

```json title="themes/yourtheme/tsconfig.json"
{
  "compilerOptions": {
    "module": "NodeNext",
    "target": "ES2018",
    "lib": ["dom", "dom.iterable", "esnext"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react",
    "outDir": "./dist",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "allowArbitraryExtensions": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "rootDir": "src",
    "paths": {
      "@components/*": [
        "./src/components/*",
        "../../node_modules/@evershop/evershop/dist/components/*"
      ],
      "*": ["node_modules/*"]
    }
  }
}
```

#### The `public` Folder

The `public` folder stores public assets such as images, fonts, CSS, etc. You can use these assets in your theme by using the `public` folder as the base path.

You can access a file like `public/images/logo.png` using the following code:

```jsx
<img src="/images/logo.png" alt="Logo" />
```

Or with the [StaticImage](../theme/components/StaticImage.md) component:

```jsx
import { StaticImage } from '@components/common/StaticImage';

function Logo() {
  return (
    <StaticImage
      subPath="images/logo.png"
      width={200}
      height={60}
      alt="Company Logo"
    />
  );
}
```

#### The `pages` Folder

The `pages` folder is used to add new components or overrides the core components of existing pages. For example, if you want to add a new component to the homepage, you can create a new file in the `pages/homepage` folder.

In the example structure above, we have a file named `HomepageOnly.tsx` in the `pages/homepage` folder. This file will be used to add a new component that appears only on the homepage. 

:::info
Check out the [Templating system](./templating.md) document to learn how to add a component to a specific page and specify its position.
:::

### The `components` Folder

The `components` folder stores shared components that can be used across multiple pages. For example, if you want to create a component that will be used on both the homepage and category pages, you should place it in the `components/common` folder.

## Activating a Theme

You can configure your theme in the `config/default.js` file located in the root directory of your project:

```json
{
  "system": {
    ..., // other configurations
    "theme": "themeName"
  }
}
```

:::warning
After changing a theme, you need to run the `build` command again for the changes to take effect.
:::

## Theming Utilities Commands

Follow the tutorial to learn how to use theming utilities commands to speed up your theme development:

<div className="block md:hidden">
<iframe width="100%" height="300" src="https://www.youtube.com/embed/_4tGVybBkYs?si=PnUc2vRjOsGqFS0u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

<div className="hidden md:block">
<iframe width="100%" height="600" src="https://www.youtube.com/embed/_4tGVybBkYs?si=PnUc2vRjOsGqFS0u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>