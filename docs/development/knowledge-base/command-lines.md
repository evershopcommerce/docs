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
- Create separate admin accounts for each team member for better accountability
- Regularly update admin passwords for enhanced security
