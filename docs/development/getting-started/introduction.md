---
sidebar_position: 1
keywords:
  - EverShop introduction
  - Node ecommerce
  - React ecommerce
  - GraphQL ecommerce
  - TypeScript ecommerce
  - open-source ecommerce
  - e-commerce platform
sidebar_label: Introduction
title: 'EverShop: Open-Source Node.js & TypeScript Ecommerce Platform'
description: Discover EverShop, a free, open-source ecommerce platform built with Node.js, TypeScript, React, and GraphQL. Create flexible, high-performance online stores with an extensible admin panel and customizable storefront.
---

# EverShop: An Open-Source TypeScript Ecommerce Platform

Welcome to EverShop, a modern, open-source Node.js ecommerce platform built with **TypeScript**, React, and GraphQL.

EverShop is designed to help developers create powerful and flexible e-commerce stores. It features a modular architecture that allows for extensive customization of both the admin panel and the front store, giving you complete control over your application.

EverShop is free and open-source. The source code is available on [GitHub](https://github.com/evershopcommerce/evershop).

## Core Philosophy

- **Developer-Centric**: Built by developers, for developers. EverShop provides a flexible and powerful foundation to build upon.
- **Open Source**: We believe in the power of community. EverShop is free, open-source, and ready for you to make it your own.
- **Performance**: With server-side rendering and a modern stack, EverShop is designed for speed and a great user experience.

## Key Features

- **Modern Tech Stack**: Built with Node.js, TypeScript, React, and GraphQL for a powerful and scalable foundation.
- **Modular Architecture**: Extend and customize your store with a flexible module system. Add new features without touching the core code.
- **Extensible Admin Panel**: A fully-featured admin panel, inspired by leading platforms, that you can easily customize.
- **Customizable Storefront**: The frontend is designed for deep customization through a powerful theme system.
- **GraphQL API**: A flexible and powerful GraphQL API for both admin and storefront operations.

## What's Included

EverShop ships with a complete set of core modules out of the box:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Module</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Catalog</strong></td><td>Products, categories, attributes, collections, and product search</td></tr>
    <tr><td><strong>Checkout</strong></td><td>Shopping cart, shipping zones/methods, payment method registration</td></tr>
    <tr><td><strong>Customer</strong></td><td>Customer accounts, addresses, authentication (JWT)</td></tr>
    <tr><td><strong>OMS</strong></td><td>Order management, shipments, payment/shipment status tracking</td></tr>
    <tr><td><strong>Promotion</strong></td><td>Coupon codes and discount rules</td></tr>
    <tr><td><strong>CMS</strong></td><td>Custom pages and widgets</td></tr>
    <tr><td><strong>Tax</strong></td><td>Tax classes, rates, and calculation</td></tr>
    <tr><td><strong>Setting</strong></td><td>Store configuration management</td></tr>
  </tbody>
</table>

Payment gateways (**Stripe**, **PayPal**, **Cash on Delivery**) are included as built-in modules and can be enabled through configuration.

## Technology Stack

EverShop's highly modular structure is a result of several open source technologies embedded into a stack. These open source technologies are composed of the following components:

### TypeScript

EverShop is written in [TypeScript](https://www.typescriptlang.org/), a statically typed superset of JavaScript. This provides better tooling, scalability, and code quality.

### NodeJS

[Node.js](https://nodejs.org/en/) is an open-source server side runtime environment built on Chrome's V8 JavaScript engine. It provides an event driven, non-blocking (asynchronous) I/O and cross-platform runtime environment for building highly scalable server-side application using JavaScript.

### PostgreSQL

[PostgreSQL](https://www.postgresql.org/) is a powerful, open source object-relational database system. It has more than 15 years of active development and a proven architecture that has earned it a strong reputation for reliability, data integrity, and correctness. EverShop requires PostgreSQL 13 or higher.

### React

[React](https://reactjs.org/) is a free and open-source front-end JavaScript library for building user interfaces based on UI components. EverShop implements server-side rendering of React components with hydration to provide a fast, performant experience and SEO optimization.

### GraphQL

[GraphQL](https://graphql.org/) is a query language for APIs and a runtime for fulfilling those queries with your existing data. EverShop uses GraphQL and React to build a flexible and extensible front-end.

:::info

Check [this document](/docs/development/getting-started/system-requirements) for more detail about system requirement of EverShop.
:::

## Extensible Admin Panel

![EverShop admin panel](./img/backend.png "EverShop admin panel")

Inspired by leading ecommerce platforms, EverShop includes a fully-featured admin panel built with React. It provides all the tools you need to manage your products, orders, and customers.

The admin panel is also designed to be extensible and customizable. Developers can easily add new features to the admin panel without modifying the core source code.

## Customizable Storefront

![EverShop front store](./img/evershop-product-detail.png "EverShop front store")

The EverShop frontend is designed to optimize storefront customization, with highly extensible themes being the central customization mechanism.

:::info
Check out the theme documentation [here](/docs/development/theme/theme-overview).
:::

## Demo Store

Explore our demo store.

import Link from '@docusaurus/Link';

<div className="flex justify-center gap-5 pb-6">
<Link
            className="button button--primary button--md"
            to="https://demo.evershop.io/admin/">
            Admin Panel
          </Link>
<Link
            className="button button--primary button--md"
            to="https://demo.evershop.io/">
            Front Store
          </Link>
</div>


:::info
The demo admin account email is `demo@evershop.io` and the password is `123456`
:::

## Next Steps

Ready to get started? Here's the recommended path:

1. **[System Requirements](/docs/development/getting-started/system-requirements)** — Ensure your system is ready
2. **[Installation Guide](/docs/development/getting-started/installation-guide)** — Install and run your store
3. **[Architecture Overview](/docs/development/knowledge-base/architecture-overview)** — Understand how EverShop works
4. **[Extension Development](/docs/development/module/extension-development)** — Build your first extension
5. **[Theme Overview](/docs/development/theme/theme-overview)** — Customize the storefront

## Community

We invite you to join our [Discord channel](https://discord.com/invite/GSzt7dt7RM) for project discussion. Thank you!

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
