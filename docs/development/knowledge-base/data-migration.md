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

The migration scripts are located in the `migration` directory of your extension (note: singular, not "migrations"). Each migration script is a single file that provides a default export function executed during the migration process.

```ts
import { execute } from "@evershop/postgres-query-builder";

export default async function (connection) {
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS my_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );`
  );
}
```

This function receives a `connection` object (a PostgreSQL `PoolClient`) that you can use to execute queries. The connection is already inside a transaction — if your migration throws an error, all changes are automatically rolled back.

## Migration File Naming Convention

Migration files **must** follow the semantic versioning pattern:

```
Version-X.Y.Z.js
```

For example:
- `Version-1.0.0.js` — Initial schema
- `Version-1.0.1.js` — Add a column
- `Version-1.0.2.js` — Create an index

EverShop tracks which version has been applied in the `migration` database table. When your extension is loaded, only migrations with a version **higher** than the currently installed version are executed. Migrations run in ascending version order.

```bash
my-extension/
├── src/
│   ├── migration/
│   │   ├── Version-1.0.0.ts    # Initial schema
│   │   ├── Version-1.0.1.ts    # Add new column
│   │   └── Version-1.0.2.ts    # Create index
```

:::warning
Migration scripts are wrapped in a database transaction. If any query fails, the entire migration is rolled back. Each migration runs independently — a failure in one version does not prevent earlier versions from being committed.
:::
