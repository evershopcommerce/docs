---
sidebar_position: 12
keywords:
  - EverShop command-line interface
  - CLI commands
  - Store setup commands
sidebar_label: Command-Line Interface
title: Command-Line Interface
description: Comprehensive guide to EverShop's command-line interface with detailed explanations of commands for building, developing, and managing your online store.
---

# EverShop Command-Line Interface

EverShop provides a robust set of command-line tools to help you develop, build, and manage your online store efficiently. This document outlines all available commands with their purposes and usage examples.

## Available Scripts

The following scripts are available in the `package.json` file. You can run any of these commands using `npm run <script-name>`.

```json
{
   "scripts": {
    "dev": "evershop dev",
    "start": "evershop start",
    "start:debug": "evershop start --debug",
    "build": "evershop build",
    "setup": "evershop install",
    "seed": "evershop seed",
    "user:create": "evershop user:create",
    "theme:active": "evershop theme:active",
    "theme:twizz": "evershop theme:twizz",
    "theme:create": "evershop theme:create",
    "theme:status": "evershop theme:status",
    "theme:uninstall": "evershop theme:uninstall",
    "theme:export-content": "evershop theme:export-content"
  }
}
```

:::info
When you pass flags through `npm run`, separate them with `--`, e.g. `npm run theme:active -- boutique --dry-run`. Without it, npm swallows the arguments and the command sees none.
:::

## Installation Command

Use this command to install and set up your EverShop store. For detailed steps, refer to the [installation guide](/docs/development/getting-started/installation-guide).

```bash
evershop install
```

## Development Command

Start your store in development mode with hot-reloading enabled for a streamlined development experience:

```bash
evershop dev
```

This command automatically enables debug mode and watches for file changes, providing immediate feedback during development.

## Debug Command

Run your store in production mode with debugging enabled:

```bash
evershop start --debug
```

:::info
Debug mode is automatically enabled when you run the `evershop dev` command. Use this specific command when you need debugging capabilities in a production-like environment.
:::

## Build Command

Compile and optimize your store's [React](https://reactjs.org/) components for production deployment:

```bash
evershop build
```

This command processes all React components and generates optimized bundles in the `.evershop` folder, preparing your application for production deployment.

The build command takes no arguments — minification is always on for production bundles.

## Start Command

Launch your store in production mode:

```bash
evershop start
```

:::warning
You must run `evershop build` before using the start command to ensure all components are properly compiled for production.
:::

## Demo Data Seeding Command

Populate your store with demo data for development and testing:

```bash
npm run seed -- --all
```

This command seeds your database with sample data including:

- Product attributes
- Categories
- Collections
- Products with images
- CMS pages
- Blog (categories, tags, posts and comments)

You can also seed specific data types individually:

```bash
# Seed only attributes
npm run seed -- --attributes

# Seed only categories
npm run seed -- --categories

# Seed only collections
npm run seed -- --collections

# Seed only products
npm run seed -- --products

# Seed only CMS pages
npm run seed -- --pages

# Seed only the blog
npm run seed -- --blog
```

The available flags are `--attributes`, `--categories`, `--collections`, `--products`, `--pages`, `--blog` and `--all`. You must pass at least one; running `npm run seed` with no flag exits with an error. There is no `--widgets` flag — widget content is installed by the theme (see `theme:active`), not by the seeder.

:::info
The seed command is designed for development and testing environments only.
:::

## Theme Management Commands

### Create a New Theme

Generate a new custom theme skeleton:

```bash
npm run theme:create
```

This command is **interactive only** — it has no flags. It prompts you for the theme name, then:

- Creates a new theme folder in the `themes/` directory
- Creates the `src/pages/homepage/` structure with a starter component
- Writes the theme's `package.json`

The name must contain only letters, numbers, dashes or underscores. The command aborts if a theme with that name already exists.

:::warning
There is no `--name` flag. `npm run theme:create -- --name "my-theme"` will simply ignore the argument and still prompt you.
:::

### Activate a Theme

Switch your store to use a different theme:

```bash
npm run theme:active
```

You can also name the theme directly, as a positional argument:

```bash
npm run theme:active -- boutique
```

With no argument, the command scans the `themes/` directory and presents a list to choose from.

Activation does considerably more than flip a config value. In order:

1. **Validates the theme's `theme.json` manifest.** A theme without a `theme.json` is treated as presentation-only and this step is skipped. Validation failures abort activation — the active theme is left untouched.
2. **Installs or upgrades the theme's content** — widgets and placements — reconciling against what is already in the database. Your own customizations are preserved and reported as conflicts rather than overwritten.
3. **Provisions the theme's metafield definitions.** Idempotent, and re-run at every server boot.
4. **Writes `system.theme` into `config/default.json`.**
5. **Offers to run `npm run build`.**

Supported flags:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Flag</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>--dry-run</code></td><td>Report the pending content changes and exit. Never writes anything, never changes the active theme.</td></tr>
    <tr><td><code>--content-only</code></td><td>Install the theme's content but leave the active theme unchanged. Intended for CI provisioning and end-to-end tests.</td></tr>
    <tr><td><code>-y</code>, <code>--yes</code></td><td>Skip the post-activation build prompt. The prompt is also skipped automatically in non-interactive environments.</td></tr>
  </tbody>
</table>

```bash
# Preview what activating "boutique" would change
npm run theme:active -- boutique --dry-run
```

If you choose not to build immediately, remember to run `npm run build` later for the changes to take effect.

### Inspect Theme Status

```bash
npm run theme:status
```

Lists every theme that has content installed, marking the active one, along with a summary of metafield definitions each theme provisioned. Pass a theme id to get a dry-run diff of that theme's manifest against what is currently installed:

```bash
npm run theme:status -- boutique
```

This command is read-only and prompt-free, so it is safe to run in CI.

### Uninstall Theme Content

```bash
npm run theme:uninstall -- boutique
```

Deletes all of a theme's content — widgets, placements, draft changesets and rollout plans — after printing a preview and asking for confirmation. Metafield definitions the theme provisioned are **left in place** (their stored values survive).

Pass `-y` / `--yes` to skip the confirmation. Without it, the command refuses to run non-interactively.

:::danger
This is destructive and cannot be undone. Run `theme:status` first to see what will be removed.
:::

### Export Theme Content

```bash
npm run theme:export-content -- boutique 1.2.0
```

Serializes the theme's live content from the database back into its `theme.json`, preserving widget and placement UUIDs so that buyers of the theme upgrade cleanly. This is the command a theme author runs after building a store layout in the admin page builder.

Both the theme id and a valid SemVer version are **required** — the version gates upgrades, so it must be supplied explicitly. The version can be the second positional argument or the `--set-version` flag (it is not `--version`, which the top-level `evershop` CLI reserves for the package version). Pass `--force` to overwrite an existing `theme.json`.

### Theme Development Tool

Create component overrides for your theme:

```bash
npm run theme:twizz
```

This is a theme development tool that helps developers create component overrides more easily. When you run this command, it:

- Scans all available components from the core EverShop system
- Presents an interactive list of components that can be overridden
- Analyzes and tracks component dependencies automatically
- Copies the selected component and its dependencies to your active theme directory
- Maintains the correct file structure for theme overrides

This tool is essential for theme developers who want to customize EverShop's default components while maintaining proper file organization and dependency relationships.

:::warning
After creating component overrides, you must rebuild your store for the changes to take effect:

```bash
npm run build
```
:::

For a step-by-step video tutorial on using EverShop's theming commands, check out the following guide:

<div className="block md:hidden">
<iframe width="100%" height="300" src="https://www.youtube.com/embed/_4tGVybBkYs?si=PnUc2vRjOsGqFS0u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

<div className="hidden md:block">
<iframe width="100%" height="600" src="https://www.youtube.com/embed/_4tGVybBkYs?si=PnUc2vRjOsGqFS0u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>


## Admin User Management Commands

### Create Admin User

Create a new administrator account for the admin panel:

```bash
npm run user:create -- --email "admin@example.com" --password "securePassword" --name "Admin Name"
```

All parameters are required:

- `--email`: Email address for the admin user
- `--password`: Secure password for account access
- `--name`: Full name of the administrator

### Change Admin Password

Update the password for an existing administrator account:

```bash
npm run user:changePassword -- --email "admin@example.com" --password "newSecurePassword"
```

Required parameters:

- `--email`: Email address of the existing admin user
- `--password`: New password to set for the account

## Best Practices

- Always run the build command before deploying to production
- Use development mode during active development to leverage hot-reloading
- Use the seed command to quickly set up test data in development
- Rebuild your store after switching themes
- Create separate admin accounts for each team member for better accountability
- Regularly update admin passwords for enhanced security
