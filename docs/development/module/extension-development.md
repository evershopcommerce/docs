---
sidebar_position: 10
keywords:
  - extension development
  - EverShop plugins
  - custom modules
sidebar_label: Extension Development
title: Developing Extensions for EverShop
description: Learn how to develop custom extensions for EverShop, from setup to deployment, including structure, naming conventions, and best practices.
---

![EverShop extension development](./img/evershop-extension-development.jpg "EverShop extension development")

:::info
Before you start writing code for your EverShop extension, we recommend reading the [EverShop Module Overview documentation](./module-overview) to understand the basics of EverShop's modular architecture.
:::

This guide will walk you through the process of setting up and developing extensions for EverShop. Extensions allow you to add new features or modify existing functionality without altering the core codebase.

This guide assumes you have already installed EverShop and have a running project. If you haven't installed EverShop yet, please refer to our [installation guide](../getting-started/installation-guide).

Let's start!

## Setting Up Your Development Environment

### The `extensions` Directory

In the root folder of your EverShop project, locate or create a directory named `extensions`. This directory will house all the extensions for your project, including both those you develop and those you install from other sources.

If the directory doesn't exist yet, you can create it with the following command:

```bash
mkdir extensions
```

For more information about EverShop's project structure, refer to the [architecture overview](../knowledge-base/architecture-overview).

### Configuring NPM Workspace

Extensions can have their own dependencies managed through NPM. To properly handle these dependencies, EverShop uses NPM workspaces—a feature that allows you to manage multiple packages within a single project.

To enable NPM workspaces for your extensions, add the following configuration to the `package.json` file in your EverShop project root:

```js title="package.json"
{
  "workspaces": [
    "extensions/*"
  ]
}
```

With this configuration in place, running `npm install` will install all dependencies for your extensions, and npm will properly resolve shared dependencies across your project and its extensions.

## Extension Naming Conventions

EverShop enforces specific naming conventions for extensions to ensure compatibility and avoid conflicts:

- Use only lowercase letters `[a-z]` and underscores `_` in extension names
- Each extension name must be unique within your EverShop installation
- Consider using a vendor prefix (like `Vendor_ExtensionName`) to prevent name collisions with other extensions

### Examples of Valid Extension Names

- `freeshipping`
- `vendor_freeshipping`
- `my_custom_payment_method`

## Extension Structure

Extensions follow a structure similar to EverShop modules. A typical extension includes:

```bash
extensions
└── Vendor_ExtensionName
    ├── dist                     # This folder contains the compiled code for the extension
    ├── src                      # React components used in the extension
    │   ├── api                  # RESTful API endpoints and middleware
    │   │   └── postCreate
    │   │       ├── route.json
    │   │       ├── validatePostMiddleware.ts
    │   │       └── [validatePostMiddleware]savePostMiddleware.ts
    │   ├── graphql              # GraphQL schema definitions and resolvers
    │   │   └── types
    │   ├── migration            # Database migration scripts
    │   │   └── Version_1.0.0.ts
    │   ├── pages
    │   │   ├── admin            # Admin panel pages
    │   │   │   └── postCreate
    │   │   │       ├── route.json
    │   │   │       ├── index.ts
    │   │   │       ├── GeneralComponent.tsx
    │   │   │       └── FormComponent.tsx
    │   │   └── frontend        # Frontend pages and components
    │   │       └── postView
    │   │           ├── route.json
    │   │           ├── index.ts
    │   │           ├── TitleComponent.tsx
    │   │           ├── PriceComponent.tsx
    │   │           └── VariantsComponent.tsx
    │   └── bootstrap.ts
    ├── tsconfig.json
    └── package.json         # Extension dependencies
```

For more detailed information about module structure, refer to the [module overview documentation](./module-overview).

## Activating and Deactivating Extensions

After developing an extension, you need to enable it in your EverShop configuration. For example, if you've created an extension named `myExtension`, add the following configuration to your EverShop config file:

```js title="./config/production.json"
{
  ...
  "system": {
        "extensions": [
            {
                "name": "myExtension",
                "resolve": "extensions/myExtension",
                "enabled": true,
                "priority": 10  // Lower numbers indicate higher priority
            }
        ]
    }
}
```

To disable the extension, simply change the `enabled` property to `false`.

:::info
After enabling or disabling an extension, you must rebuild your project for the changes to take effect.
:::

## Publishing Your Extension as an NPM Package

While extensions can be used directly from the `extensions` directory, you can also publish them as NPM packages to make them easy to share and install in other EverShop projects.

### Publishing Process

1. Prepare your extension for publishing:

   - Ensure your `package.json` includes all necessary metadata
   - Add appropriate documentation
   - Test your extension thoroughly

2. Publish your package to NPM:

   ```bash
   npm publish --access public
   ```

3. Install your published extension in any EverShop project:

   ```bash
   npm install @yournamespace/your-extension-name
   ```

4. Configure the extension in your EverShop project:

```js title="./config/production.json"
{
  ...
  "system": {
        "extensions": [
            {
                "name": "yourExtensionName",
                "resolve": "node_modules/@yournamespace/your-extension-name",
                "enabled": true,
                "priority": 10
            }
        ]
    }
}
```

:::info
For a hands-on tutorial on creating your first extension, check out our [Create Your First Extension guide](./create-your-first-extension).
:::

## Extension Development Best Practices

To ensure your extensions are maintainable, compatible, and provide the best experience for users, follow these best practices:

### 1. Follow EverShop Coding Standards

Maintain consistency with EverShop's core codebase by following the same coding standards and patterns. This makes your extension more intuitive for other developers familiar with EverShop.

### 2. Minimize Core Overrides

Avoid directly overriding core files whenever possible. Instead, use EverShop's extension points, events, and hooks to modify behavior.

### 3. Proper Versioning

Use semantic versioning for your extensions to clearly communicate changes:

- Increment the major version for breaking changes
- Increment the minor version for new features
- Increment the patch version for bug fixes

### 4. Comprehensive Testing

Test your extensions thoroughly across different configurations and with other common extensions to ensure compatibility.

### 5. Clear Documentation

Provide clear documentation that includes:

- Installation instructions
- Configuration options
- Feature descriptions
- Any dependencies on other extensions
- Screenshots or diagrams for complex features

### 6. Handle Updates Gracefully

Implement proper migration scripts for database changes and provide clear update paths between versions of your extension.

### 7. Error Handling

Implement robust error handling to prevent your extension from breaking the entire application if something goes wrong.
