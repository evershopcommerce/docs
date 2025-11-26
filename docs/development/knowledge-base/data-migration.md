---
sidebar_position: 36
keywords:
  - database migration, database schema migration, upgrade schema
sidebar_label: Database Migration
title: Database Schema Migration
description: Learn how to use migration scripts to upgrade your database schema
---

![Database Migration In EverShop](./img/data-fetching-evershop.png "Database Migration In EverShop")

# Database Schema Migration

If you are writing an EverShop extension, you will likely need to store some information in the EverShop database.

This documentation will help you understand how to use migration scripts to upgrade your database schema.

## What is a Migration Script?

Every extension can have its own database schema migration scripts. When you install an extension, these migration scripts are executed automatically, and the database schema is upgraded.

The migration scripts are located in the `migrations` directory of your extension. Each migration script is a single file that provides a function executed during the migration process.

```ts
import { PoolClient } from "pg";
export default async function (connection: PoolClient) {
  // Your migration script goes here
}
```

This function receives a `connection` object that you can use to execute queries.
