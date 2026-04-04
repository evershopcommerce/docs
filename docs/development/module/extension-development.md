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
Before you start writing code for your EverShop extension, we recommend reading the [EverShop Extension Overview documentation](./extension-overview) to understand the basics of EverShop's modular architecture.
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

Extension names must be unique across your entire EverShop installation — they cannot conflict with core module names (`catalog`, `checkout`, `customer`, `oms`, etc.). We recommend:

- Use lowercase letters and underscores for extension names
- Use a vendor prefix to avoid collisions with other extensions (e.g., `acme_freeshipping`)

### Examples of Valid Extension Names

- `freeshipping`
- `acme_freeshipping`
- `my_custom_payment_method`

## Extension Structure

Extensions follow a structure similar to EverShop core modules. A typical extension includes:

```bash
extensions/
└── my_extension/
    ├── dist/                        # Compiled JavaScript (required for production)
    ├── src/                         # TypeScript source code
    │   ├── api/                     # RESTful API endpoints and middleware
    │   │   └── createPost/
    │   │       ├── route.json
    │   │       ├── validatePost.ts
    │   │       └── [validatePost]savePost.ts
    │   ├── graphql/                 # GraphQL schema definitions and resolvers
    │   │   └── types/
    │   │       └── Post/
    │   │           ├── Post.graphql
    │   │           └── Post.resolvers.ts
    │   ├── subscribers/             # Event subscribers
    │   │   └── post_created/
    │   │       └── notify.ts
    │   ├── migration/               # Database migration scripts
    │   │   └── Version-1.0.0.ts
    │   ├── pages/
    │   │   ├── admin/               # Admin panel pages
    │   │   │   └── postCreate/
    │   │   │       ├── route.json
    │   │   │       ├── index.ts
    │   │   │       ├── GeneralComponent.tsx
    │   │   │       └── FormComponent.tsx
    │   │   └── frontStore/          # Storefront pages and components
    │   │       └── postView/
    │   │           ├── route.json
    │   │           ├── index.ts
    │   │           └── PostInfo.tsx
    │   ├── services/                # Business logic
    │   ├── components/              # Shared components (widgets)
    │   ├── jobs/                    # Cron jobs
    │   └── bootstrap.ts             # Extension initialization
    ├── tsconfig.json
    └── package.json
```

## The `tsconfig.json` File

Each extension should include its own `tsconfig.json` file to configure TypeScript compilation settings. Below is an example configuration:

```json title="tsconfig.json"
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

And add a script to compile TypeScript in your `package.json`:

```json title="package.json"
{
  ...
  "scripts": {
    "build": "tsc"
  }
  ...
}
```

:::info
In development mode, EverShop takes care of compiling TypeScript files on the fly, so you typically don't need to manually compile them. However, each extension must be compiled to JavaScript before it can be used by EverShop in the production environment. Meaning the `dist` folder must exist and contain the compiled JavaScript files for the extension to function correctly in production.
:::

:::warning
Do not change the name of the `dist` folder, as EverShop expects compiled extension code to be located there.
:::

## `module` type in `package.json`

To ensure proper module resolution, each extension's `package.json` file should specify the module type. Add the following field to your extension's `package.json`:

```json title="package.json"
{
  ...
  "type": "module",
  ...
}
```

## Activating and Deactivating Extensions

After developing an extension, you need to enable it in your EverShop configuration. For example, if you've created an extension named `myExtension`, add the following configuration to your EverShop config file:

```json title="config/default.json"
{
  "system": {
    "extensions": [
      {
        "name": "myExtension",
        "resolve": "extensions/myExtension",
        "enabled": true,
        "priority": 10
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
   - Compile your TypeScript code to JavaScript, ensuring the `dist` folder is up to date. Make sure to include the `dist` folder in your package by adding it to the `files` array in `package.json`:

   ```json title="package.json"
   {
     ...
     "files": [
       "dist",
       "src"
     ],
     ...
   }
   ```
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

```json title="config/default.json"
{
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

## The Bootstrap Function

Every extension can include a `bootstrap.ts` file in its `src/` directory. This function runs during application startup and is where you register processors, hooks, widgets, and cron jobs.

The bootstrap function receives a context parameter with information about the current process:

```ts title="extensions/my-extension/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';
import { hookBefore } from '@evershop/evershop/lib/util/hookable';

export default function (context) {
  // context.command — 'build', 'dev', 'start', or 'seed'
  // context.env — 'production', 'development', or 'test'
  // context.process — 'main', 'cronjob', or 'event'

  // Register processors (runs in all processes)
  addProcessor('cartFields', myCartFieldProcessor, 15);

  // Only register hooks in the main process
  if (context.process === 'main') {
    hookBefore('createProduct', validateProduct, 5);
  }
}
```

The `context.process` field is particularly useful:
- `'main'` — The web server process handling HTTP requests.
- `'cronjob'` — The child process running scheduled jobs.
- `'event'` — The child process handling event subscribers.

:::warning
After all bootstrap scripts run, the hook and registry systems are **locked**. You cannot register new processors or hooks after this point (e.g., from within a middleware function).
:::

## Sharing Data Between Middleware

EverShop provides a **delegate system** for passing data between middleware functions within the same request. Delegates are write-once: once set, a delegate cannot be overwritten, preventing accidental data corruption.

```ts title="Set a delegate in one middleware"
import { setDelegate } from '@evershop/evershop/lib/middleware/delegate';

export default async (request, response, next) => {
  const product = await loadProduct(request.params.id);
  setDelegate('product', product, request);
  next();
};
```

```ts title="Read the delegate in a later middleware"
import { getDelegate, hasDelegate } from '@evershop/evershop/lib/middleware/delegate';

export default async (request, response) => {
  if (hasDelegate('product', request)) {
    const product = getDelegate('product', request);
    // Use the product data...
  }
};
```

:::info
Delegate values are cloned when read, so modifying the returned value does not affect the stored delegate.
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
