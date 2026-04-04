---
sidebar_position: 35
keywords:
  - Evershop database
  - query builder
  - PostgreSQL
  - typed queries
sidebar_label: The Database
title: Database and Query Builder
description: Learn how to connect to the database, build type-safe queries, and manage transactions in EverShop.
---

# Database and Query Builder

EverShop uses [PostgreSQL](https://www.postgresql.org/) (version 13 or higher) as its database. It provides a type-safe query builder that gives you column name autocompletion and typed return values for all known EverShop tables.

## Connection Setup

### Environment Variables

Create a `.env` file in your project root with your database credentials:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=evershop
DB_SSLMODE=disable
```

### SSL Connection

Change `DB_SSLMODE` to enable SSL. Supported modes: `disable`, `require`, `prefer`, `verify-ca`, `verify-full`, `no-verify`.

For certificate verification, provide:

```bash
DB_SSLMODE=verify-full
DB_SSLROOTCERT=/path/to/ca-certificate.pem
DB_SSLCERT=/path/to/client-certificate.pem
DB_SSLKEY=/path/to/client-key.pem
```

### Connection Pool

EverShop maintains a connection pool (max 20 concurrent connections). There are two ways to use the database:

1. **`pool`** — For simple read queries. The pool automatically manages connection acquisition and release.
2. **`getConnection()`** — For transactions. You manage the connection lifecycle and must call `commit()` or `rollback()`.

## Import Paths

EverShop provides two import paths for database operations:

```ts
// Typed query builder (recommended) — provides column autocompletion and typed results
import { select, insert, update, del, insertOnUpdate } from '@evershop/evershop/lib/postgres/query';

// Connection and transaction management
import { pool, getConnection } from '@evershop/evershop/lib/postgres';

// Transaction helpers (re-exported from query module)
import { startTransaction, commit, rollback, execute } from '@evershop/evershop/lib/postgres/query';
```

:::info
The typed query builder in `@evershop/evershop/lib/postgres/query` wraps `@evershop/postgres-query-builder` with TypeScript types for all EverShop tables. When you call `.from('order')`, your IDE will suggest columns like `order_id`, `status`, `grand_total`, etc.
:::

## SELECT Queries

### Basic Select

```ts
import { select } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

// Load a single row (returns the row or null)
const order = await select()
  .from('order')
  .where('order_id', '=', orderId)
  .load(pool);

// Load multiple rows (returns an array)
const orders = await select()
  .from('order')
  .where('status', '=', 'processing')
  .execute(pool);
```

### `.load()` vs `.execute()`

- **`.load(connection)`** — Returns a single row (`RowOf<T> | null`). Use for fetching one record.
- **`.execute(connection)`** — Returns an array of rows (`RowOf<T>[]`). Use for fetching multiple records.

### Select Specific Columns

```ts
const products = await select('product_id', 'sku', 'price')
  .from('product')
  .where('status', '=', true)
  .execute(pool);
```

### Joins

```ts
const query = select()
  .from('cms_page')
  .leftJoin('cms_page_description')
  .on(
    'cms_page.cms_page_id',
    '=',
    'cms_page_description.cms_page_description_cms_page_id'
  );

query.where('status', '=', 1);
query.andWhere('cms_page_description.url_key', '=', 'about-us');

const page = await query.load(pool);
```

Supported join types: `.leftJoin()`, `.rightJoin()`, `.innerJoin()`.

### Ordering, Grouping, and Pagination

```ts
const products = await select()
  .from('product')
  .where('status', '=', true)
  .orderBy('created_at', 'DESC')
  .limit(0, 20)  // offset, limit
  .execute(pool);
```

```ts
const categoryCounts = await select('category_id')
  .from('product_category')
  .groupBy('category_id')
  .execute(pool);
```

### Chaining Conditions

```ts
const query = select().from('order');

query.where('status', '=', 'processing');
query.andWhere('grand_total', '>', 100);
query.orWhere('customer_email', '=', 'vip@example.com');

const orders = await query.execute(pool);
```

### Clone a Query

```ts
const baseQuery = select().from('product').where('status', '=', true);

// Clone to create variations without modifying the original
const featuredQuery = baseQuery.clone();
featuredQuery.andWhere('visibility', '=', true);
```

## INSERT Queries

```ts
import { insert } from '@evershop/evershop/lib/postgres/query';
import { getConnection, startTransaction, commit, rollback } from '@evershop/evershop/lib/postgres/query';

const connection = await getConnection();
await startTransaction(connection);

try {
  const shipment = await insert('shipment')
    .given({
      shipment_order_id: orderId,
      carrier: 'fedex',
      tracking_number: '1234567890'
    })
    .execute(connection);

  await commit(connection);
} catch (e) {
  await rollback(connection);
  throw e;
}
```

The `.given()` method accepts an object where keys are column names. Unknown columns are silently ignored.

### Set Individual Columns with `.prime()`

```ts
const result = await insert('product')
  .given(productData)
  .prime('status', true)        // Override or add a specific column
  .prime('created_at', new Date())
  .execute(connection);
```

## UPDATE Queries

```ts
import { update } from '@evershop/evershop/lib/postgres/query';

await update('order')
  .given({ shipment_status: 'shipped' })
  .where('order_id', '=', orderId)
  .execute(connection);
```

## DELETE Queries

```ts
import { del } from '@evershop/evershop/lib/postgres/query';

await del('order')
  .where('order_id', '=', orderId)
  .execute(connection);
```

## INSERT ON CONFLICT (Upsert)

Insert a row, or update it if a conflict occurs on the specified columns:

```ts
import { insertOnUpdate } from '@evershop/evershop/lib/postgres/query';

await insertOnUpdate('setting', ['name'])
  .given({
    name: 'storeName',
    value: 'My Shop'
  })
  .execute(connection);
```

The first argument is the table name, the second is an array of columns that define the uniqueness constraint. If a row with matching values exists, the other columns are updated.

## Raw SQL

For queries that can't be expressed with the query builder, use `execute()`:

```ts
import { execute } from '@evershop/evershop/lib/postgres/query';

const result = await execute(
  connection,
  `SELECT p.*, pd.name
   FROM product p
   JOIN product_description pd ON p.product_id = pd.product_description_product_id
   WHERE p.price > $1`,
  [100]
);
```

## Transactions

Wrap multiple operations in a transaction to ensure atomicity:

```ts
import { getConnection, startTransaction, commit, rollback } from '@evershop/evershop/lib/postgres/query';

const connection = await getConnection();
await startTransaction(connection);

try {
  await insert('order').given(orderData).execute(connection);
  await insert('order_item').given(itemData).execute(connection);
  await update('product_inventory')
    .given({ qty: newQty })
    .where('product_inventory_product_id', '=', productId)
    .execute(connection);

  await commit(connection);
} catch (e) {
  await rollback(connection);
  throw e;
}
```

:::warning
Always use `try/catch` with `rollback()` in the catch block. If a transaction is left open (no commit or rollback), the connection leaks and will eventually exhaust the pool.
:::

## Type Safety

The query builder provides TypeScript column autocompletion for all known EverShop tables. When you call `.from('order')`, your IDE suggests only columns from the `order` table:

```ts
// TypeScript knows 'order_id', 'uuid', 'status', 'grand_total', etc.
select().from('order').where('order_id', '=', 1)

// .load() returns OrderRow | null
const order = await select().from('order').where('order_id', '=', 1).load(pool);
// order.grand_total, order.customer_email, etc. are typed
```

For write operations, numeric string columns (like `price`, `weight`) accept both `string` and `number`:

```ts
// Both work — the WriteRow type widens string fields to string | number
await insert('product').given({ price: '29.99' }).execute(connection);
await insert('product').given({ price: 29.99 }).execute(connection);
```

### Known Tables

The following tables have full type support with column autocompletion:

`admin_user`, `attribute`, `attribute_group`, `attribute_group_link`, `attribute_option`, `cart`, `cart_address`, `cart_item`, `category`, `category_description`, `cms_page`, `cms_page_description`, `collection`, `coupon`, `customer`, `customer_address`, `customer_group`, `event`, `migration`, `order`, `order_activity`, `order_address`, `order_item`, `payment_transaction`, `product`, `product_attribute_value_index`, `product_category`, `product_collection`, `product_custom_option`, `product_custom_option_value`, `product_description`, `product_image`, `product_inventory`, `reset_password_token`, `session`, `setting`, `shipment`, `shipping_method`, `shipping_zone`, `shipping_zone_method`, `shipping_zone_province`, `tax_class`, `tax_rate`, `url_rewrite`, `variant_group`, `widget`

Custom tables created by extensions also work — they just won't have column autocompletion (any string is accepted as a column name).

## Query Builder Reference

### SELECT Chain Methods

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>.select(column, alias?)</code></td><td>Add a column to the SELECT clause</td></tr>
    <tr><td><code>.from(table, alias?)</code></td><td>Set the FROM table (narrows column types)</td></tr>
    <tr><td><code>.where(column, operator, value)</code></td><td>Add a WHERE condition</td></tr>
    <tr><td><code>.andWhere(column, operator, value)</code></td><td>Add an AND condition</td></tr>
    <tr><td><code>.orWhere(column, operator, value)</code></td><td>Add an OR condition</td></tr>
    <tr><td><code>.leftJoin(table, alias?)</code></td><td>Add a LEFT JOIN (call <code>.on()</code> after)</td></tr>
    <tr><td><code>.rightJoin(table, alias?)</code></td><td>Add a RIGHT JOIN</td></tr>
    <tr><td><code>.innerJoin(table, alias?)</code></td><td>Add an INNER JOIN</td></tr>
    <tr><td><code>.orderBy(column, direction?)</code></td><td>Add ORDER BY (<code>'ASC'</code> or <code>'DESC'</code>)</td></tr>
    <tr><td><code>.groupBy(...columns)</code></td><td>Add GROUP BY</td></tr>
    <tr><td><code>.having(column, operator, value)</code></td><td>Add HAVING condition</td></tr>
    <tr><td><code>.limit(offset, limit)</code></td><td>Add LIMIT with offset</td></tr>
    <tr><td><code>.execute(connection)</code></td><td>Execute and return array of rows</td></tr>
    <tr><td><code>.load(connection)</code></td><td>Execute and return single row or null</td></tr>
    <tr><td><code>.clone()</code></td><td>Create a copy of the query</td></tr>
    <tr><td><code>.sql()</code></td><td>Return the generated SQL string</td></tr>
  </tbody>
</table>

### Write Query Methods

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Available On</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>.given(data)</code></td><td>INSERT, UPDATE, INSERT ON UPDATE</td><td>Set column values from an object</td></tr>
    <tr><td><code>.prime(column, value)</code></td><td>INSERT, UPDATE, INSERT ON UPDATE</td><td>Set a single column value</td></tr>
    <tr><td><code>.where(column, operator, value)</code></td><td>UPDATE, DELETE</td><td>Add WHERE condition</td></tr>
    <tr><td><code>.execute(connection, releaseConnection?)</code></td><td>All</td><td>Execute the query</td></tr>
  </tbody>
</table>

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
