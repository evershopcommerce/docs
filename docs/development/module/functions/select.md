---
sidebar_position: 14
keywords:
- select
- query builder
- database
- postgres
- SQL
groups:
- database
sidebar_label: select
title: select
description: Create a SELECT query using the query builder.
since: 1.0.0
---

# select

Create a SELECT query using the query builder for PostgreSQL.

## Import

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
```

:::info Use the typed wrapper
`@evershop/evershop/lib/postgres/query` is EverShop's first-party typed query builder. It wraps `@evershop/postgres-query-builder` and adds table/column types for every known EverShop table, so `.from('order')` narrows `.where()`, `.orderBy()`, `.groupBy()` and the returned rows to that table. It also re-exports `startTransaction`, `commit`, `rollback`, `execute`, `sql` and `value`, so a transaction usually needs a single import.

The raw `@evershop/postgres-query-builder` package is still available as a lower-level fallback (untyped, useful for tables the type map does not know about), but new code should import from the wrapper.
:::

## Syntax

```typescript
select(...fields: string[]): UnboundSelectChain
```

Call `.from(table)` to bind a table and unlock per-table column suggestions on every subsequent method.

:::warning `select(...)` is variadic over columns
The top-level `select(...)` takes a list of **columns**, not a `(column, alias)` pair. `select('shipment.uuid', 'shipment_uuid')` treats both strings as columns and fails at runtime with `column "shipment_uuid" does not exist`. Aliasing is only supported by the chained form: `select().from('shipment').select('uuid', 'shipment_uuid')`.
:::

### Parameters

**`...fields`**

**Type:** `string[]` (optional)

Field names to select. If omitted or `*` is passed, selects all fields.

## Return Value

Returns a `SelectQuery` instance that can be chained with additional methods.

## Examples

### Select All Fields

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
import { getConnection } from '@evershop/evershop/lib/postgres';

const query = select()
  .from('product')
  .where('status', '=', 1);

const connection = await getConnection();
const products = await query.execute(connection);
```

### Select Specific Fields

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

// `name` is not a `product` column — it lives on `product_description`. `status`
// and `visibility` are booleans, so compare them against `true`/`false`, not 1/0.
const query = select('product_id', 'sku', 'price')
  .from('product')
  .where('status', '=', true);

const products = await query.execute(pool);
```

### With WHERE Clause

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select()
  .from('customer')
  .where('email', '=', 'customer@example.com')
  .and('status', '=', 1);

const customer = await query.load(pool);
```

### With JOINs

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

// Alias with the chained two-argument `.select(column, alias)`. Writing the alias
// inside the column string ('c.name AS category_name') is quoted as a single
// identifier and Postgres errors with `column "c.name AS category_name" does not exist`.
const query = select('p.sku').from('product', 'p');
query.select('c.name', 'category_name');
query.leftJoin('category', 'c').on('p.category_id', '=', 'c.category_id');
query.where('p.status', '=', true);

const products = await query.execute(pool);
```

### With LIMIT and ORDER BY

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select()
  .from('product');
query.where('status', '=', 1)
query.orderBy('created_at', 'DESC').limit(0, 20);

const products = await query.execute(pool);
```

### With GROUP BY and HAVING

```typescript
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

// Two things to note:
//  1. An inline `AS` alias inside a column string is quoted as ONE identifier, so
//     'COUNT(*) AS product_count' becomes "COUNT(*) AS product_count" and Postgres
//     errors. Alias with the chained two-argument form instead.
//  2. `.groupBy()`, `.having()`, `.orderBy()` and `.limit()` live on SelectQuery, not
//     on the `Where` that `.where()` returns — chaining them onto a condition throws.
const query = select('category_id').from('product');
query.select('COUNT(*)', 'product_count');
query.where('status', '=', true);
query.groupBy('category_id');
query.having('COUNT(*)', '>', 5);

const results = await query.execute(pool);
```

## Chainable Methods

### from(table, alias?)
Specify the table to select from.

```typescript
select().from('product', 'p')
```

### where(field, operator, value)
Add a WHERE condition.

```typescript
select().from('product').where('status', '=', 1)
```

### and(field, operator, value)
Add an AND condition.

```typescript
// `qty` moved to `product_inventory` in catalog 1.0.3 — it is not a `product` column.
select().from('product').where('status', '=', true).and('visibility', '=', true)
```

### or(field, operator, value)
Add an OR condition (via `orWhere`).

```typescript
select()
  .from('product')
  .where('category_id', '=', 1)
  .orWhere('category_id', '=', 2)
```

### leftJoin(table, alias?)
Add a LEFT JOIN.

```typescript
select().from('product', 'p').leftJoin('category', 'c').on('p.category_id', '=', 'c.category_id')
```

### rightJoin(table, alias?)
Add a RIGHT JOIN.

```typescript
select().from('product', 'p').rightJoin('category', 'c').on('p.category_id', '=', 'c.category_id')
```

### innerJoin(table, alias?)
Add an INNER JOIN.

```typescript
select().from('product', 'p').innerJoin('category', 'c').on('p.category_id', '=', 'c.category_id')
```

### orderBy(field, direction?)
Add ORDER BY clause. Direction defaults to 'ASC'.

```typescript
select().from('product').orderBy('created_at', 'DESC')
```

### limit(offset, limit)
Add LIMIT and OFFSET.

```typescript
select().from('product').limit(0, 20) // First 20 records
select().from('product').limit(20, 20) // Next 20 records
```

### groupBy(...fields)
Add GROUP BY clause.

```typescript
select().from('order_item').groupBy('product_id')
```

### having(field, operator, value)
Add HAVING clause (used with GROUP BY).

```typescript
select()
  .from('product')
  .groupBy('category_id')
  .having('COUNT(*)', '>', 5)
```

## Execution Methods

### execute(connection, releaseConnection?)
Execute the query and return all matching rows.

```typescript
const products = await query.execute(pool);
// or
const connection = await getConnection();
const products = await query.execute(connection, true);
```

### load(connection, releaseConnection?)
Execute the query and return only the first row (or null).

```typescript
const product = await query.load(pool);
```

### sql()
Get the generated SQL string (for debugging).

```typescript
const sqlString = await query.sql();
console.log(sqlString);
```

## Connection Parameter

Both `Pool` and `PoolClient` instances can be used:

```typescript
import { pool, getConnection } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/evershop/lib/postgres/query';

// Using pool directly
const products1 = await select().from('product').execute(pool);

// Using dedicated connection
const connection = await getConnection();
const products2 = await select().from('product').execute(connection);
```

## See Also

- [insert](/docs/development/module/functions/insert) - Insert records
- [update](/docs/development/module/functions/update) - Update records
- [del](/docs/development/module/functions/del) - Delete records
- [pool](/docs/development/module/functions/pool) - Database connection pool
- [getConnection](/docs/development/module/functions/getConnection) - Get database connection
