---
sidebar_position: 10
keywords:
  - EverShop architecture
  - Project structure
  - Module system
  - Directory organization
sidebar_label: Architecture Overview
title: EverShop Architecture Overview
description: A comprehensive overview of the EverShop platform architecture, explaining the project structure including modules, configuration, extensions, themes, and media management.
---

# Architecture Overview

EverShop is developed using Node.js and PostgreSQL, combining backend and frontend components in a unified monolithic architecture. This design approach keeps both backend and frontend code within the same project, streamlining development and deployment.

The platform provides both RESTful API and [GraphQL API](https://graphql.org/) interfaces, allowing flexible communication between the frontend and backend systems.

![Architecture Overview](./img/evershop-architecture-overview.svg "Architecture Overview")

## Module System

EverShop is built on a modular architecture that promotes separation of concerns and code reusability. All functionality is implemented and delivered through components known as Modules.

A module represents a logical group—a directory containing controllers, services, and views—related to a specific business feature. In alignment with EverShop's commitment to optimal modularity, each module encapsulates one distinct feature and maintains minimal dependencies on other modules.

![Module Architecture Overview](./img/evershop-module-architecture.png "Module Architecture Overview")

## Project Folder Structure

An EverShop project consists of several key directories that manage dependencies, caching, configuration, media assets, and extensions. Here's a breakdown of the directory structure:

```bash
├── .evershop
├── .log
├── config
│     ├ default.json
├── extensions
├── media
├── node_modules
├── themes
├── package-lock.json
└── package.json
```

### The `.evershop` Directory

This directory contains built files optimized for production use. [ReactJS components](https://reactjs.org/) and asset files are automatically generated here by the [build command](/docs/development/knowledge-base/command-lines) during the build process.

### The `.log` Directory

The log directory stores application logging information, recording events and activities that occur within your application. These logs are invaluable for debugging, monitoring, and auditing purposes.

### The `config` Directory

This directory houses configuration files that control various aspects of your EverShop installation. For detailed information about configuration options and management, refer to the [configuration guide](/docs/development/knowledge-base/configuration-guide).

:::info
The `config` directory is not created automatically when setting up a new project. You'll need to create it manually when you're ready to customize your configuration.
:::

### The `extensions` Directory

Extensions are modules developed by third-party developers or your own team that extend EverShop's core functionality. This directory contains these custom modules. For a deeper understanding of module structure and development, see the [extension development documentation](../module/extension-development).

:::info
The `extensions` directory is not created automatically when setting up a new project. You'll need to create it manually when you want to add extensions.
:::

### The `media` Directory

The media directory stores all uploaded files, including product images, category images, and other media assets used throughout your store. This directory is automatically managed by EverShop when media files are uploaded through the admin interface.

### The `node_modules` Directory

This is the standard Node.js modules directory containing packages from npm and other vendors. The EverShop core package is also located in this directory, along with all its dependencies.

### The `themes` Directory

Themes control the visual appearance and layout of your store. This directory contains themes developed by third parties or your own team. For more information about theme development and customization, see the [theme overview documentation](../theme/theme-overview).

:::info
The `themes` directory is not created automatically when setting up a new project. You'll need to create it manually when you're ready to customize the appearance of your store.
:::

## Architectural Principles

EverShop's architecture is guided by several key principles:

1. **Modularity**: Each module is self-contained and focuses on a specific business function.

2. **Extensibility**: The system is designed to be easily extended through additional modules.

3. **Separation of Concerns**: Frontend and backend code are organized to maintain clear boundaries between different responsibilities.

4. **API-First Approach**: All frontend-backend communication happens through well-defined API interfaces.

5. **Performance Optimization**: Server-side rendering combined with client-side hydration provides optimal performance and SEO benefits.
