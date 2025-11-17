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
A typical an extension has the following folder structure:

```bash
extensions
└── myExtension
    ├── dist
    └── src
      ├── api
      │   ├── global
      │   │   └── authMiddleware.ts
      │   └── createProduct
      │       ├── route.json
      │       ├── validateProductMiddleware.ts
      │       └── [validateProductMiddleware]saveProductMiddleware.ts
      ├── pages
      │   ├── admin
      │   │   └── postCreate
      │   │       ├── route.json
      │   │       ├── Form.tsx
      │   │       ├── General.tsx
      │   │       ├── Variants.tsx
      │   │       └── index.ts
      │   ├── global
      │   │   └── authMiddleware.ts
      │   └── frontStore
      │       └── postView
      │           ├── route.json
      │           ├── GeneralInformation.tsx
      │           ├── Price.tsx
      │           ├── Media.tsx
      │           └── index.ts
      ├── migration
      │   └── Version_1.0.0.ts
      ├── services
      │   └── ProductValidator.ts
      ├── jobs
      │   └── myCronJob.ts
      │
      └── bootstrap.ts
    └── package.json
    └── tsconfig.json
  
```

An extension consists of seven main components:

1. **Api**: The `api` directory contains RESTful API endpoints, middleware functions, and route definitions. For more information about middleware functions, refer to [the middleware system documentation](./../knowledge-base/middleware-system).

2. **Pages**: The `pages` folder contains frontend pages for both admin and customer interfaces. Each page includes route definitions, middleware functions, and React components for UI rendering.

3. **Migration**: The `migration` folder contains database migration files used for module installation and upgrades. These files are necessary when a module needs to create new database tables or modify existing ones.

4. **Services**: The `services` folder contains TypeScript classes and functions that provide specific functionality for the module.

5. **Jobs**: The `jobs` directory contains scheduled tasks (cron jobs) that the module needs to run at specified intervals. These jobs are registered and managed by EverShop's job scheduling system. Check out the [job scheduling documentation](./../knowledge-base/cron-jobs) for more details.

6. **bootstrap.ts**: This file is executed when the application starts, allowing modules to perform initialization tasks.

7. **package.json**: An extension can have its own dependencies. EverShop uses NPM workspaces to manage these dependencies. More details can be found in the [extension development documentation](./extension-development).

## Extension Locations

![EverShop extension location](./img/modules-location.png "EverShop extension location")

1. **Core Modules**: These are developed and maintained by the EverShop team. They are located in the `node_modules/@evershop/evershop/dist/modules` directory and provide the fundamental functionality of the platform.

2. **Extensions**: These are extensions developed by third parties or custom developers. They are located in the `extensions` folder at the root level of your EverShop installation. Extensions allow you to add new features or modify existing functionality without changing the core code. We will explore extensions in greater detail in subsequent sections.

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

## Module Development Best Practices

When developing modules for EverShop, consider the following best practices:

### 1. Single Responsibility Principle

Each module should focus on a single business domain or feature. This makes modules easier to maintain, test, and reuse. For example, a "catalog" module should handle product-related functionality, while a separate "customer" module should manage customer accounts.

### 2. Minimize Dependencies

While modules can interact with each other, it's best to minimize dependencies between modules. When a module needs functionality from another module, use service contracts or events rather than direct dependencies when possible.

### 3. Proper Namespacing

Ensure all components within your module are properly namespaced to avoid conflicts with other modules. This is especially important for extensions that may be used alongside other third-party extensions.

### 4. Complete Documentation

Document your module's functionality, configuration options, and any events it dispatches or listens for. Good documentation makes it easier for other developers to use and extend your module.

### 5. Follow Coding Standards

Adhere to EverShop's coding standards for consistency with the rest of the platform. This includes naming conventions, file structure, and coding practices.

## Module Lifecycle

Modules in EverShop have a lifecycle that includes:

1. **Installation**: When a module is first added to the system, its migration scripts run to set up necessary database structures.

2. **Initialization**: When EverShop starts, each module's `bootstrap.ts` file is executed to initialize the module.

3. **Operation**: During normal operation, the module's components handle requests and provide functionality.

4. **Deactivation**: A module can be disabled without being removed, which prevents its code from executing.

5. **Uninstallation**: When a module is removed, cleanup tasks may be performed to remove database tables or other resources.

Understanding this lifecycle helps when developing modules that integrate smoothly with the EverShop platform.
