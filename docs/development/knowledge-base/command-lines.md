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
    "dev": "node ./packages/evershop/dist/bin/dev/index.js",
    "start": "node ./packages/evershop/dist/bin/start/index.js",
    "start:debug": "node ./packages/evershop/dist/bin/start/index.js --debug",
    "build": "node ./packages/evershop/dist/bin/build/index.js",
    "setup": "evershop install",
    "seed": "evershop seed",
    "theme:active": "evershop theme:active",
    "theme:twizz": "evershop theme:twizz",
    "theme:create": "evershop theme:create"
  }
}
```

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

:::info
To skip the JavaScript minification process (useful for debugging production builds), use the following command:

```bash
evershop build -- --skip-minify
```

:::

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
- Widgets

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

# Seed only widgets
npm run seed -- --widgets
```

:::info
The seed command is designed for development and testing environments only.
:::

## Theme Management Commands

### Create a New Theme

Generate a new custom theme from the default template:

```bash
npm run theme:create -- --name "my-theme"
```

This command:
- Creates a new theme folder in the `themes/` directory
- Copies the default theme structure
- Sets up the theme configuration files

Required parameter:
- `--name`: Name of your new theme (lowercase, hyphen-separated recommended)

### Activate a Theme

Switch your store to use a different theme:

```bash
npm run theme:active
```

This command provides an interactive interface to activate a theme:

- Scans the `themes/` directory for available themes
- Presents a list of themes to choose from
- Updates the `config/default.json` file with your selected theme
- Optionally runs the build command automatically

After selecting a theme, you'll be prompted to run the build command. If you choose not to build immediately, remember to run it later for the changes to take effect.

:::tip
The command will automatically detect all themes in your `themes/` directory, so you don't need to specify the theme name manually.
:::

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
