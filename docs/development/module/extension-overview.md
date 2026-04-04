---
sidebar_position: 5
keywords:
  - extension overview
  - modularity
  - EverShop architecture
sidebar_label: Extension Overview
title: EverShop Extension System Overview
description: A comprehensive overview of EverShop's extension system, explaining the structure and functionality of extensions and how they work together to create a flexible e-commerce platform.
---

# Extension Overview

EverShop is built on a modular architecture that enables flexibility and extensibility. In this design, all functionality is implemented and delivered through components known as extensions.

An extension is a logical group—a directory containing controllers, services, and views—related to a specific business feature. Following EverShop's commitment to optimal modularity, each extension encapsulates one feature and maintains minimal dependencies on other extensions.

Extensions and themes are the primary customization units in EverShop. Extensions provide business features with supporting logic, while themes influence user experience and storefront appearance. Both have a lifecycle that allows them to be installed, deleted, and disabled. From the perspective of both merchants and extension developers, extensions serve as the central organizational unit of EverShop.

The purpose of an extension is to provide specific product features by implementing new functionality or extending existing capabilities of other extensions. Each extension is designed to function independently, so the inclusion or exclusion of a particular extension typically doesn't affect the functionality of others.

## Extension Folder Structure

A typical extension has the following folder structure:

```bash
extensions/
└── myExtension/
    ├── dist/                          # Compiled JavaScript (required for production)
    ├── src/                           # TypeScript source code (required for development)
    │   ├── api/                       # RESTful API endpoints
    │   │   ├── global/                # Middleware for all API routes
    │   │   │   └── authMiddleware.ts
    │   │   └── createPost/            # A specific API endpoint
    │   │       ├── route.json
    │   │       ├── validatePost.ts
    │   │       └── [validatePost]savePost.ts
    │   ├── pages/                     # Page routes and UI components
    │   │   ├── admin/                 # Admin panel pages
    │   │   │   └── postCreate/
    │   │   │       ├── route.json
    │   │   │       ├── Form.tsx       # React component (uppercase = auto-loaded)
    │   │   │       └── index.ts       # Middleware (lowercase = auto-loaded)
    │   │   ├── frontStore/            # Storefront pages
    │   │   │   └── postView/
    │   │   │       ├── route.json
    │   │   │       ├── PostInfo.tsx
    │   │   │       └── index.ts
    │   │   └── global/                # Middleware for all page routes
    │   ├── graphql/                   # GraphQL types and resolvers
    │   │   └── types/
    │   │       └── Post/
    │   │           ├── Post.graphql
    │   │           └── Post.resolvers.ts
    │   ├── subscribers/               # Event subscribers
    │   │   └── post_created/
    │   │       └── sendNotification.ts
    │   ├── migration/                 # Database migration scripts
    │   │   └── Version-1.0.0.ts
    │   ├── services/                  # Business logic
    │   │   └── createPost.ts
    │   ├── components/                # Shared React components (widgets, etc.)
    │   │   └── PostWidget.tsx
    │   ├── jobs/                      # Cron jobs
    │   │   └── syncPosts.ts
    │   └── bootstrap.ts               # Extension initialization
    ├── package.json
    └── tsconfig.json
```

An extension can include any combination of these directories — none are required except `bootstrap.ts` for extensions that need to register hooks, processors, or other extension points:

1. **`api/`** — RESTful API endpoints with middleware and route definitions. See [Middleware System](/docs/development/knowledge-base/middleware-system) and [API Routes](/docs/development/knowledge-base/api-routes).

2. **`pages/`** — Page routes split into `admin/`, `frontStore/`, and `global/`. Each page folder contains a `route.json`, middleware files (lowercase), and React components (uppercase). See [Pages](/docs/development/knowledge-base/pages).

3. **`graphql/`** — GraphQL type definitions (`.graphql`) and resolvers (`.resolvers.ts`). These are automatically discovered and merged into the application schema at startup. See [GraphQL](/docs/development/knowledge-base/graphql).

4. **`subscribers/`** — Event subscriber functions organized by event name. Each subfolder name matches an event (e.g., `product_created/`) and contains handler files. See [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers).

5. **`migration/`** — Database migration scripts named `Version-X.Y.Z.ts` (note the **hyphen**, not underscore). Run automatically during startup to create or alter database tables. See [Database Migration](/docs/development/knowledge-base/data-migration).

6. **`services/`** — Business logic functions (e.g., `createPost`, `updatePost`). These are typically hookable and wrapped in database transactions.

7. **`components/`** — Shared React components, including widget components that can be registered with the [widget system](/docs/development/module/widget-development).

8. **`jobs/`** — Cron job files registered via `registerJob()` in bootstrap. See [Cron Jobs](/docs/development/knowledge-base/cron-jobs).

9. **`bootstrap.ts`** — Executed during startup. This is where you register [processors](/docs/development/knowledge-base/registry-and-processors), [hooks](/docs/development/module/functions/hookable), [widgets](/docs/development/module/widget-development), [cron jobs](/docs/development/knowledge-base/cron-jobs), [payment methods](/docs/development/knowledge-base/payment-method-development), and [custom statuses](/docs/development/knowledge-base/order-status-management). Receives a context parameter:

    ```ts
    export default function (context) {
      // context.command — 'build', 'dev', 'start', or 'seed'
      // context.env — 'production', 'development', or 'test'
      // context.process — 'main', 'cronjob', or 'event'
    }
    ```

10. **`package.json`** — Extension metadata and dependencies. Must include `"type": "module"`. Managed as an NPM workspace. See [Extension Development](./extension-development).

## Extension Locations

![EverShop extension location](./img/modules-location.png "EverShop extension location")

1. **Core Modules**: Developed and maintained by the EverShop team. Located in `node_modules/@evershop/evershop/dist/modules`. These provide fundamental functionality (catalog, checkout, customer, etc.).

2. **Custom Extensions**: Developed by third parties or your own team. Located in the `extensions/` folder at your project root (or installed via NPM to `node_modules/`).

### Enabling Extensions

Extensions must be registered in your configuration to be loaded. Add them to the `system.extensions` array:

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

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td><code>string</code></td><td>Unique extension name (must not conflict with core module names)</td></tr>
    <tr><td><code>resolve</code></td><td><code>string</code></td><td>Path to the extension directory (relative to project root or in <code>node_modules/</code>)</td></tr>
    <tr><td><code>enabled</code></td><td><code>boolean</code></td><td>Set to <code>false</code> to disable the extension without removing it</td></tr>
    <tr><td><code>priority</code></td><td><code>number</code></td><td>Loading order — lower numbers load first (affects component override precedence)</td></tr>
  </tbody>
</table>

:::info
After enabling or disabling an extension, you must rebuild your project (`npm run build`) for the changes to take effect.
:::

## Typescript configuration

Each extension has its own `tsconfig.json` file to configure TypeScript compilation settings specific to that extension. The `src` directory contains the TypeScript source files, while the `dist` directory is where the compiled JavaScript files are output. 

:::info
In development mode, EverShop takes care of compiling TypeScript files on the fly, so you typically don't need to manually compile them. However, each extension must be compiled to JavaScript before it can be used by EverShop in the production environment. Meaning the `dist` folder must exist and contain the compiled JavaScript files for the extension to function correctly in production.
:::

The below is an example of a typical `tsconfig.json` file for an extension:

```json
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

## Extension Development Best Practices

### 1. Single Responsibility Principle

Each extension should focus on a single business domain or feature. This makes extensions easier to maintain, test, and reuse.

### 2. Minimize Core Overrides

Avoid directly overriding core files. Instead, use EverShop's extension points — [processors](/docs/development/knowledge-base/registry-and-processors), [hooks](/docs/development/module/functions/hookable), [events](/docs/development/knowledge-base/events-and-subscribers), and [middleware](/docs/development/knowledge-base/middleware-system) — to modify behavior.

### 3. Unique Naming

Extension names must be unique across the entire application. Use a vendor prefix (e.g., `vendor_extensionName`) to avoid conflicts with other extensions.

### 4. Use `bootstrap.ts` for Registration

All processors, hooks, widgets, cron jobs, and payment methods must be registered in your `bootstrap.ts`. These systems are locked after bootstrap completes — registration from middleware or request handlers will throw an error.

### 5. Handle Both Development and Production

Ensure your extension works in both modes:
- **Development**: Source files in `src/` are compiled on the fly.
- **Production**: You must compile to `dist/` before deployment (`tsc` or your build script).

## Extension Lifecycle

Extensions in EverShop go through these phases during application startup:

1. **Discovery** — EverShop reads the `system.extensions` config, validates that each extension's directory exists, and checks for `src/` (dev) or `dist/` (production).

2. **Route & Middleware Scanning** — API routes, page routes, and middleware files from the extension are scanned and registered alongside core module routes.

3. **Bootstrap Execution** — The extension's `bootstrap.ts` is executed. This is where you register processors, hooks, widgets, cron jobs, and payment methods.

4. **Lock** — After all bootstrap scripts run, the hook and registry systems are locked. No further registration is possible.

5. **Migration** — Pending database migrations from the extension's `migration/` folder are executed within transactions.

6. **Operation** — The extension's middleware, API endpoints, pages, GraphQL resolvers, and event subscribers handle requests during normal operation.

To **disable** an extension, set `"enabled": false` in the configuration and rebuild. The extension's code will not be loaded or executed.

:::info
For a step-by-step guide to creating your first extension, see [Extension Development](./extension-development) and [Create Your First Extension](./create-your-first-extension).
:::
