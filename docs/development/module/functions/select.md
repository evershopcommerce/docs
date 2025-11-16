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
import { select } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
select(...fields: string[]): SelectQuery
```

### Parameters

**`...fields`**

**Type:** `string[]` (optional)

Field names to select. If omitted or `*` is passed, selects all fields.

## Return Value

Returns a `SelectQuery` instance that can be chained with additional methods.

## Examples

### Select All Fields

```typescript
import { select } from '@evershop/postgres-query-builder';
import { getConnection } from '@evershop/evershop/lib/postgres';

const query = select()
  .from('product')
  .where('status', '=', 1);

const connection = await getConnection();
const products = await query.execute(connection);
```

### Select Specific Fields

```typescript
import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select('product_id', 'name', 'price')
  .from('product')
  .where('status', '=', 1);

const products = await query.execute(pool);
```

### With WHERE Clause

```typescript
import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select()
  .from('customer')
  .where('email', '=', 'customer@example.com')
  .and('status', '=', 1);

const customer = await query.load(pool);
```

### With JOINs

```typescript
import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select('p.name', 'c.name AS category_name').from('product', 'p');
query.leftJoin('category', 'c').on('p.category_id', '=', 'c.category_id');
query.where('p.status', '=', 1);

const products = await query.execute(pool);
```

### With LIMIT and ORDER BY

```typescript
import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select()
  .from('product');
query.where('status', '=', 1)
query.orderBy('created_at', 'DESC').limit(0, 20);

const products = await query.execute(pool);
```

### With GROUP BY and HAVING

```typescript
import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

const query = select('category_id', 'COUNT(*) AS product_count')
  .from('product')
  .where('status', '=', 1)
  .groupBy('category_id')
  .having('COUNT(*)', '>', 5);

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
select().from('product').where('status', '=', 1).and('qty', '>', 0)
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
import { select } from '@evershop/postgres-query-builder';

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
