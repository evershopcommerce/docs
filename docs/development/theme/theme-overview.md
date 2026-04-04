---
sidebar_position: 5
keywords:
  - Theme overview
sidebar_label: Theme Overview
title: Theme Overview
description: EverShop theme overview document. Learn what themes are, where they're located, and how to develop custom themes for your store.
---

# Theme Overview

A theme controls the look and feel of your EverShop **storefront**. It allows you to override React components, add new page components, customize styles, and serve your own static assets — all without modifying the core codebase.

:::warning
Themes only affect **storefront** (`frontStore`) pages. The admin panel cannot be customized through themes. To modify admin pages, use an [extension](/docs/development/module/extension-development) instead.
:::

Out-of-the-box, EverShop renders the storefront using components from its core modules. A theme provides an overlay that can override any of these components or add new ones. When EverShop builds a page, it checks the theme first — if a matching component exists in the theme, it takes precedence over the core version.

We recommend creating a new theme rather than modifying core files directly, as core changes are overwritten during upgrades.

## Where Are Themes Located?

### The Default Storefront (No Theme)

When no theme is configured, EverShop renders the storefront using components from its core modules. Each core module (catalog, checkout, customer, etc.) has a `pages/frontStore/` folder with React components that define the default UI. You can think of this as the "built-in theme."

:::info
Learn more about how module pages work in the [View System](../theme/view-system.md) documentation.
:::

### Custom Themes

Custom themes are located in the `themes/` folder at the root of your project:

```bash
your-project/
├── themes/
│   ├── my-theme/
│   └── another-theme/
├── extensions/
├── config/
└── package.json
```

Each theme must be stored in a separate directory:

```bash
*/themes/
├── <theme1>
├── <theme2>
├── <theme3>
├── ...
```

## Creating a Theme

The fastest way to create a new theme is with the CLI:

```bash
npx evershop theme:create --name my-theme
```

This generates a theme scaffold in `themes/my-theme/` with the required `package.json`, `tsconfig.json`, and folder structure.

After creating the theme, add `themes/*` to your root `package.json` workspaces (if not already there) and install dependencies:

```bash
npm install
```

Then activate the theme and start developing:

```bash
npx evershop theme:active
npm run dev
```

For a detailed guide on customizing components and styles, see the [Templating](./templating) and [Styling](./styling) docs.

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
    "compile": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

The `compile` script compiles TypeScript source files from `src/` to JavaScript in `dist/`. You don't need to install EverShop, PostCSS, or Webpack as theme dependencies — the main EverShop project handles the build pipeline.

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
  },
  "include": ["src"]
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
import { StaticImage } from "@components/common/StaticImage";

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

To activate a theme, set the `system.theme` value in your configuration file to the theme's folder name:

```json title="config/default.json"
{
  "system": {
    "theme": "yourtheme"
  }
}
```

Alternatively, use the CLI command:

```bash
npx evershop theme:active
```

This command prompts you to select a theme from the `themes/` directory and updates the configuration automatically.

### `src` vs `dist` Requirements

- **Development mode** (`npm run dev`): EverShop compiles TypeScript on the fly. Your theme must have a `src/` directory.
- **Production mode** (`npm run start`): EverShop loads pre-compiled JavaScript. Your theme must have a `dist/` directory. Run `npm run compile` in your theme directory before building for production.

:::warning
After changing or updating a theme, you must rebuild your project (`npm run build`) for the changes to take effect.
:::

## Theming Utilities Commands

Follow the tutorial to learn how to use theming utilities commands to speed up your theme development:

<div className="block md:hidden">
<iframe width="100%" height="300" src="https://www.youtube.com/embed/_4tGVybBkYs?si=PnUc2vRjOsGqFS0u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

<div className="hidden md:block">
<iframe width="100%" height="600" src="https://www.youtube.com/embed/_4tGVybBkYs?si=PnUc2vRjOsGqFS0u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>
