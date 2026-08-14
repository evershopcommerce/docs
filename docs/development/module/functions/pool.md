---
sidebar_position: 12
keywords:
- pool
- database
- postgres
- connection pool
groups:
- database
sidebar_label: pool
title: pool
description: PostgreSQL connection pool instance.
since: 1.0.0
---

# pool

PostgreSQL connection pool instance for executing database queries.

## Import

```typescript
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/evershop/lib/postgres/query';

const product = await select()
  .from('product')
  .where('product_id', '=', 123)
  .load(pool);
```

:::info Typed wrapper
Query builders come from `@evershop/evershop/lib/postgres/query` — EverShop's first-party typed wrapper around `@evershop/postgres-query-builder`, adding column types for every known EverShop table. The raw package is still available as an untyped lower-level fallback. The `pool` itself always comes from `@evershop/evershop/lib/postgres`.
:::

The pool never needs releasing: the query builder's auto-release is a no-op on a `Pool`. Use it for reads and single statements, and reserve [`getConnection()`](/docs/development/module/functions/getConnection) for transactions.

## Type

```typescript
Pool
```

The `pool` is a PostgreSQL connection pool instance from the `pg` library.

## Configuration

The pool is configured using environment variables or configuration file:

### Environment Variables

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_SSLMODE` - SSL mode (disable, require, prefer, verify-ca, verify-full, no-verify)
- `DB_SSLROOTCERT` - Path to SSL root certificate
- `DB_SSLCERT` - Path to SSL certificate
- `DB_SSLKEY` - Path to SSL key

## See Also

- [getConnection](/docs/development/module/functions/getConnection) - Get a dedicated database connection
- [getConfig](/docs/development/module/functions/getConfig) - Get configuration values
