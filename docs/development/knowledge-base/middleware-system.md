---
sidebar_position: 20
keywords:
  - Middleware
sidebar_label: The Middleware System
title: EverShop Middleware System Overview
description: Learn about the middleware system in EverShop. How middlewares work and how to create, add, and remove middleware functions from a route.
---

# Middleware System

## What is middleware?

Let's examine the diagram below:

![EverShop Middleware System](./img/middleware-flow.png "EverShop Middleware System")

In the above flow, a request is triggered from the end-user. This request is received and processed by a series of middleware functions. After all middleware functions are executed, a response object containing the webpage data is sent to the client.

Middleware functions execute during the lifecycle of a request to the server. Each middleware has access to the HTTP request and response for each route (or path) it's attached to. Middleware can be written to perform a variety of tasks. For example, a logging middleware might log all incoming requests to your application, or an authentication middleware might verify an incoming user's credentials.

Let's examine an example of a middleware function:

```ts
import { del } from "@evershop/postgres-query-builder";
import { pool } from "@evershop/evershop/lib/postgres";

export default async (request, response, next) => {
  try {
    const attributeIds = request.body.ids;
    await del("attribute")
      .where("attribute_id", "IN", attributeIds.split(","))
      .execute(pool);
    response.json({
      data: {},
      success: true,
    });
  } catch (e) {
    response.json({
      data: {},
      message: e.message,
      success: false,
    });
  }
};
```

## EverShop Middleware Types

EverShop has four types of middleware functions:

### 1. Application-level Middleware

Application-level middleware functions are executed on all requests, including both admin and front store pages, even on 404 pages.

For example, a logging middleware that records information about all requests is an application-level middleware.

In a module, you can create an application-level middleware function by creating a file in the `api/global` or `pages/global` folder. For example, if you create a file named `logMiddleware.ts` in the `api/global` folder, this middleware will be executed on all API requests.

### 2. Admin-level Middleware

Admin-level middleware functions are executed on all requests to the admin panel.

For example, an authentication middleware that verifies admin credentials is an admin-level middleware.

In a module, you can create an admin-level middleware function by creating a file in the `api/admin/all` or `pages/admin/all` folder. For example, if you create a file named `authMiddleware.ts` in the `pages/admin/all` folder, this middleware will be executed on all pages in the admin panel.

### 3. FrontStore-level Middleware

Similar to admin-level middleware, frontStore-level middleware functions are executed on all requests to the front store.

For example, a customer authentication middleware that verifies customer credentials is a frontStore-level middleware.

To add a frontStore-level middleware, create a file in the `api/frontStore/all` or `pages/frontStore/all` folder. For example, if you create a file named `authMiddleware.ts` in the `pages/frontStore/all` folder, this middleware will be executed on all pages in the front store.

### 4. Route-level Middleware

Route-level middleware functions are executed only on specific routes.

For example, a middleware that loads product data will only be executed when a user visits the product view route.

## Middleware Functions

A middleware function can access up to 4 arguments:

1. `request` object: The HTTP request object.
2. `response` object: The HTTP response object.
3. `next`: The function that calls the next middleware.

### 'Passive' Middleware Functions

Let's examine an example:

```ts
export default (request, response) => {
  // Do something
};
```

Notice that this middleware function doesn't have the `next` argument. This type of middleware only handles its own tasks and doesn't call `next()`. The core of EverShop takes care of calling the next middleware in this case.

### 'Active' Middleware Functions

Let's examine another example:

```ts
export default (request, response, next) => {
  // Do something
  next();
};
```

This middleware function includes the `next` argument. In addition to handling its own tasks, it controls when to call `next()` based on its own logic. If you don't call `next()`, the request will be left hanging indefinitely.

### Asynchronous Middleware Functions

Here's an example of an asynchronous middleware function:

```ts
export default async (request, response) => {
  // Do something asynchronous
};
```

EverShop natively supports asynchronous middleware functions. You can create and export an async middleware function as shown above, and EverShop will handle the rest.

If you want subsequent middleware functions to wait for your middleware to complete, you can use the 'active' middleware function pattern.

## Middleware and Routes

:::info
Before diving into the relationship between middleware and routes, we recommend reviewing [the routing system documentation](/docs/development/knowledge-base/routing-system).
:::

Let's examine the directory structure of a module:

![EverShop middleware and route](./img/middleware-and-route.png "EverShop middleware and route")

EverShop uses a file-system based middleware approach. It relies on the directory structure to identify, load, and build middleware functions for each route.

In the above image:

- The middleware functions in the yellow box are 'Application-level' middleware. They are direct children of either the `api` or `pages` directory. If you want a middleware function to execute on all incoming requests, this is where you should place it.
- The middleware functions in the blue box are 'Site-level' middleware. They execute on all requests to the front store. They are located in a folder named 'all', which is a direct child of either the `api` or `pages` directory. This same structure applies to 'Admin-level' middleware as well.
- The middleware functions in the purple box are 'Route-level' middleware. They execute only when the route with ID `cmsPageView` is triggered.

## Middleware Naming Rules and Dependency Management

When working with middleware, it's crucial to control the order of execution.

In other words, we need to ensure that our middleware functions execute in the expected order.

EverShop uses the file names of middleware for ordering and dependency management. The way you name your middleware function determines when it will be executed.

### Middleware Naming Rules

Your middleware file should meet these two requirements:

1. It must have '.ts' or '.js' as the file extension.
2. It cannot contain whitespace or special characters (except '[', ']', and ',').

### Middleware Ordering

Let's examine an example of a module structure:

```bash
├── components
├── pages
│   ├── admin
│   └── frontStore
│       └── productView
│           ├── a.ts
│           ├── [a]b.ts
│           ├── [a,b]c[e].ts
│           ├── e.ts
│           ├── [f]g.ts
└──         └── route.json
```

In this example:

- The middleware `[a]b.ts` will execute after the middleware `a.ts`. This is controlled by including `[a]` at the beginning of `[a]b.ts`. This demonstrates the basics of middleware ordering based on file names.
- The middleware `[a,b]c[e].ts` represents a more complex case. This middleware will execute after both `a.ts` and `b.ts` AND before the middleware `e.ts`.
- The middleware `[f]g.ts` will never execute because its dependency (`f.ts`) does not exist (assuming it doesn't exist in any module).

:::warning

A middleware function will never execute if its dependency doesn't exist or has been removed.

:::
