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
npx evershop theme:create
```

The command is **interactive** — it prompts for the theme name and takes no arguments or flags. The name must be alphanumeric with dashes or underscores only.

:::warning
There is no `--name` flag. `theme:create` never reads `argv`, so `npx evershop theme:create --name my-theme` still prompts you for a name and ignores the flag entirely.
:::

This generates a scaffold in `themes/<name>/` with a `package.json`, a `tsconfig.json`, and a starter homepage component at `src/pages/homepage/<Name>.tsx`.

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
    ├── theme.json   # Theme content manifest (optional). Widgets, placements, metafield definitions.
    ├── package.json # Theme package file.
    └── tsconfig.json # TypeScript configuration file.
```

### The `theme.json` File

`theme.json` is the theme's **content manifest**. Where `src/` ships the code, `theme.json` ships the data a theme needs in the database to look the way it is meant to look: the widget instances it defines, where those widgets are placed, and the metafield definitions its components read.

```json title="themes/yourtheme/theme.json"
{
  "theme_name": "yourtheme",
  "version": "1.0.0",
  "widgets": [
    {
      "uuid": "3f39b388-4025-4237-9df4-344a8b79ad26",
      "type": "coupon_block",
      "name": "Coupon block",
      "settings": {
        "heading": "Take 20% off your order",
        "code": "SAVE20"
      }
    }
  ],
  "placements": [
    {
      "uuid": "5cf1e84f-bbfe-41c1-b2f1-4c357848d953",
      "widget_instance_uuid": "3f39b388-4025-4237-9df4-344a8b79ad26",
      "route": "homepage",
      "area": "content",
      "sort_order": 201.25
    }
  ],
  "metafieldDefinitions": []
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>theme_name</code></td>
      <td>No</td>
      <td>Free-form display name. Not validated and not used for matching — the theme's <em>id</em> is always its folder name.</td>
    </tr>
    <tr>
      <td><code>version</code></td>
      <td>Yes</td>
      <td>Valid SemVer. Content is installed and upgraded by version; a downgrade is refused. <strong>Bump it whenever you change <code>widgets</code> or <code>placements</code></strong> — an unchanged version means the installer treats the content as already applied and skips it.</td>
    </tr>
    <tr>
      <td><code>widgets</code></td>
      <td>Yes</td>
      <td>Array of widget instances: <code>uuid</code> (v4), <code>type</code>, <code>name</code>, <code>settings</code>.</td>
    </tr>
    <tr>
      <td><code>placements</code></td>
      <td>Yes</td>
      <td>Array of placements binding a widget instance to an Area on a route: <code>uuid</code> (v4), <code>widget_instance_uuid</code>, <code>route</code>, <code>area</code>, <code>sort_order</code>. Theme manifests carry route-level placements only — <code>entity_urn</code> must be absent.</td>
    </tr>
    <tr>
      <td><code>metafieldDefinitions</code></td>
      <td>No</td>
      <td>Metafield definitions the theme's components read. Provisioned separately from the widget content — no version bump needed for changes, and re-ensured on every server boot.</td>
    </tr>
  </tbody>
</table>

A theme without a `theme.json` is a **presentation-only theme**: activation logs that there is no content to install and proceeds.

:::info
`theme.json` is installed by `theme:active` (see [Activating a Theme](#activating-a-theme) below). The `metafieldDefinitions` array is covered in depth in [Using Metafields in a Theme](./metafields.md).
:::

### The `package.json` File

The `package.json` file is used to define the theme's metadata, dependencies, and scripts. It should be located in the root directory of your theme.

Here's an example of a `package.json` file for a theme:

```json title="themes/yourtheme/package.json"
{
  "name": "yourtheme",
  "version": "1.0.0",
  "description": "A custom theme for EverShop",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "swc ./src -d dist --copy-files --strip-leading-paths"
  }
}
```

The `build` script compiles the source files from `src/` to `dist/`. You don't need to install EverShop, PostCSS, or Webpack as theme dependencies — the main EverShop project handles the build pipeline.

:::warning `tsc` alone does not ship your stylesheets
`theme:create` scaffolds `"build": "tsc"`. That is fine for a theme with no styles, but **bare `tsc` only emits `.js` — it does not copy `.css` or `.scss` files into `dist/`**. A theme with co-located stylesheets compiles cleanly and then ships a CSS-less `dist/`, and the missing styles only show up in production (`npm run start`), never in `npm run dev`.

Use the swc form above instead — it is what the in-repo reference theme uses. `--copy-files` carries the non-TypeScript assets across, and `--strip-leading-paths` keeps the output tree rooted at `dist/` rather than `dist/src/`.
:::

:::info
Run it from the theme directory (or `npm run build --workspace=themes/yourtheme`). It is separate from the project's own `npm run build`, which bundles the storefront — the theme must be compiled to `dist/` first.
:::

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
        "../../node_modules/@evershop/evershop/src/components/*"
      ]
    }
  },
  "include": ["src"]
}
```

:::info `src`, not `dist`, in `tsconfig.json`
The `@components/*` path here exists only so your editor and `tsc` can resolve the alias — it points at the core **TypeScript sources** (`.../@evershop/evershop/src/components/*`), which is what `theme:create` emits and what carries the type information.

That is a different mapping from the one the **runtime** uses. At build time, webpack resolves `@components` against `dist/components/` in theme → extensions → core order. See [Templating](./templating.md#component-resolution-order).
:::

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

Editing `config/default.json` by hand only flips which theme renders. It does **not** install the theme's content. Prefer the CLI command:

```bash
npx evershop theme:active
```

`theme:active` does considerably more than update the configuration. In order:

1. **Resolves the theme id** — from a positional argument, or interactively from the `themes/` directory. The directory must exist; a typo aborts before anything is written.
2. **Reads and validates `theme.json`** — SemVer `version`, well-formed `widgets` and `placements`, v4 UUIDs, cross-record references. Any validation error aborts activation; the active theme is left untouched. A theme with no `theme.json` is treated as presentation-only and skips to step 5.
3. **Installs or upgrades widgets and placements** — a fresh install, or a version-gated upgrade that preserves merchant customizations and reports the conflicts it kept. Downgrades are refused.
4. **Provisions metafield definitions** — from `metafieldDefinitions[]`, idempotently. Runs on every outcome except a refused downgrade, and again on every server boot.
5. **Writes `config.system.theme`** into `config/default.json`, then offers to run `npm run build`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Argument</th>
      <th>Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;theme-id&gt;</code> (positional)</td>
      <td>Activate this theme without the interactive picker. Must match a directory in <code>themes/</code>.</td>
    </tr>
    <tr>
      <td><code>--dry-run</code></td>
      <td>Report the pending content changes (added / updated / removed widgets and placements, conflicts, declared metafield definitions) and exit. Never writes the config or touches the database.</td>
    </tr>
    <tr>
      <td><code>--content-only</code></td>
      <td>Install the theme's content but leave the active theme unchanged. Skips the config write and the build prompt. Intended for CI provisioning and e2e setup.</td>
    </tr>
    <tr>
      <td><code>-y</code>, <code>--yes</code></td>
      <td>Skip the post-activation "run <code>npm run build</code>?" prompt. Also skipped automatically when stdin is not a TTY.</td>
    </tr>
  </tbody>
</table>

```bash
# Preview what activating would change
npx evershop theme:active yourtheme --dry-run

# Install content in CI without switching the active theme
npx evershop theme:active yourtheme --content-only
```

:::warning Passing arguments through npm
With the npm script wrapper, arguments must come after `--`, or npm swallows them and a flag can be mis-read as the theme id:

```bash
npm run theme:active -- yourtheme --content-only
```
:::

:::info
`theme:status`, `theme:uninstall` and `theme:export-content` are the companion commands for inspecting installed content, removing it, and exporting the current database state back into a `theme.json`.
:::

### `src` vs `dist` Requirements

- **Development mode** (`npm run dev`): EverShop compiles TypeScript on the fly. Your theme must have a `src/` directory.
- **Production mode** (`npm run start`): EverShop loads pre-compiled JavaScript. Your theme must have a `dist/` directory. Run `npm run build` in your theme directory before building the project.

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
