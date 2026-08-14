---
sidebar_position: 60
keywords:
  - performance
  - large catalog
  - postgres
  - indexing
  - query builder
  - event loop
  - full text search
sidebar_label: Large-Catalog Performance
title: Large-Catalog Performance
description: What breaks when an EverShop catalog reaches hundreds of thousands of products, the query patterns that cause it, and the fixes shipped in 2.2.1.
---

# Large-Catalog Performance

EverShop 2.2.1 contains a set of query and index changes that came out of load-testing a 500,000-product catalog. The interesting part of that exercise is not the numbers — it is that **PostgreSQL was almost never the bottleneck**. During a 300-second admin-grid hang, the database did roughly 1.5 seconds of work. Everything else was Node, burning CPU synchronously inside the query builder.

This page documents the patterns that caused it so extension and theme authors do not reintroduce them.

## The unbounded id-list anti-pattern

The single most expensive mistake in an EverShop codebase looks harmless:

```ts
const ids = (await someQuery.execute(pool)).map((row) => row.product_id);
query.andWhere('product.product_id', 'IN', ids);
```

Fetch a set of ids into Node, then feed them back into a second query as an `IN (...)` list. It is fine for tens of ids. It is catastrophic for tens of thousands, for two independent reasons.

### 1. The placeholder loop is O(n²)

`@evershop/postgres-query-builder` builds SQL with **named** bindings (`:key`) and converts them to PostgreSQL positional parameters at execute time with a loop of the form:

```js
sql = sql.replace(`:${key}`, `$${id}`);
```

One full scan of the SQL string per parameter. With `n` ids the SQL string is itself O(n) long, so the conversion is O(n²) — and it is plain synchronous JavaScript, so it blocks the event loop for its entire duration. Nothing else in the process runs: not the storefront, not health checks, not the other requests already queued.

Measured against the real package:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Ids in the <code>IN</code> list</th>
      <th>Time spent in placeholder conversion</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>25,000</td>
      <td>0.9 s</td>
    </tr>
    <tr>
      <td>50,000</td>
      <td>3.1 s</td>
    </tr>
    <tr>
      <td>100,000</td>
      <td>12.5 s</td>
    </tr>
    <tr>
      <td>341,000</td>
      <td>~145 s</td>
    </tr>
  </tbody>
</table>

An aborted request does not stop the burn — the synchronous loop runs to completion regardless — and a browser retry simply queues another one.

### 2. node-pg caps bind parameters at 65,535

Even if the conversion finished, the PostgreSQL wire protocol encodes the parameter count of a Bind message as an Int16. Above 65,535 parameters the count wraps and you get errors like:

```bash
bind message has 13188 parameter formats but 0 parameters
```

(13,188 is 341,000 mod 65,536.) There is no configuration that raises this limit.

### The rule

> **Never interpolate an unbounded id list into a query. Keep the set operation in SQL.**

A *bounded* list is fine — a category tree's ids, a variant group's members, a page of results. The test is whether the list size is a function of catalog size.

### Fix A — a semi-join subquery

The admin product grid collapses variant groups to one row per group. The old implementation fetched every collapsed `product_id` (341k on the test catalog) and fed them back as `IN (...)`, on both the items query and the count query. The 2.2.1 version keeps the whole thing in SQL — `modules/catalog/services/ProductCollection.js`:

```js
const onePerVariantGroupQuery = this.baseQuery.clone();
onePerVariantGroupQuery.removeLimit();
onePerVariantGroupQuery.removeOrderBy();
onePerVariantGroupQuery.select(
  sql(
    'DISTINCT ON (COALESCE(product.variant_group_id, -product.product_id)) product.product_id',
    'product_id'
  )
);

// Render the (already filtered) clone and RE-KEY its bindings. clone()
// preserves binding keys, so embedding the rendered SQL as-is would produce
// duplicate `:key` names and break the named-to-positional conversion.
let dedupSql = await onePerVariantGroupQuery.sql();
const dedupBinding = {};
Object.entries(onePerVariantGroupQuery.getBinding()).forEach(
  ([key, bindValue], index) => {
    const newKey = `dedup${index}x${uniqid()}`;
    dedupSql = dedupSql.replace(new RegExp(`:${key}\\b`, 'g'), `:${newKey}`);
    dedupBinding[newKey] = bindValue;
  }
);

dedupSql += ` ORDER BY COALESCE(product.variant_group_id, -product.product_id), product.product_id DESC`;

this.baseQuery
  .getWhere()
  .addRaw('AND', `product.product_id IN (${dedupSql})`, dedupBinding);
```

Two details worth copying if you embed a rendered subquery of your own:

- **Re-key the bindings.** `clone()` keeps the original binding names. Embedding the rendered SQL without renaming collides with the outer query's copies of the same keys, and the `:key → $n` conversion silently produces the wrong SQL.
- **Pick a deterministic representative.** The old code used `random()`, which returned a different row per request and made pagination unstable. `DISTINCT ON` plus an explicit `ORDER BY` (highest `product_id` per group) is stable.

Result on 500k products: items ~0.7 s, count ~1.3 s. Before, neither query completed.

### Fix B — `= ANY($1::int[])`

Layered-navigation facets used the same pattern: fetch every product id in a category subtree, feed it back. The 2.2.1 version is one SQL aggregation with the (small, bounded) category id list passed as a **single** array parameter — `modules/catalog/services/getFilterableAttributes.js`:

```sql
SELECT
  attribute.attribute_id,
  attribute.attribute_name,
  attribute.attribute_code,
  product_attribute_value_index.option_id,
  product_attribute_value_index.option_text
FROM product_attribute_value_index
INNER JOIN attribute
  ON attribute.attribute_id = product_attribute_value_index.attribute_id
WHERE attribute.type = 'select'
  AND attribute.is_filterable = true
  AND product_attribute_value_index.product_id IN (
    SELECT product.product_id FROM product
    WHERE product.category_id = ANY($1::int[])
  )
GROUP BY
  attribute.attribute_id,
  attribute.attribute_name,
  attribute.attribute_code,
  product_attribute_value_index.option_id,
  product_attribute_value_index.option_text
ORDER BY attribute.attribute_id, product_attribute_value_index.option_id
```

`= ANY($1::int[])` sends the whole set as **one** parameter, so neither the O(n²) loop nor the 65,535 limit applies. 214 ms on a 17,000-product category.

There is a deliberate non-obvious choice here. The recursive category-subtree CTE is resolved in Node **first**, then passed as an array — rather than inlined into the facet query. Inlining hides the category-set size from the planner, which then abandons the `PRODUCT_CATEGORY_ID_INDEX` bitmap plan in favour of a 500k-row sequential-scan join. That first attempt was 6× slower than the version it replaced. Resolving the (tiny, bounded) list first and passing an array keeps the planner's estimates honest.

## The `.addNode()` WHERE-precedence trap

This one produced a variant product page that took 31 seconds and shipped **46.9 MB of HTML**. The `variantGroup.items` field contained 75,372 products for a group that has 270 variants.

The cause was a filter idiom used in four places:

```js
query
  .andWhere('product_inventory.manage_stock', '=', false)
  .addNode(
    node('OR')
      .addLeaf('AND', 'product_inventory.qty', '>', 0)
      .addLeaf('AND', 'product_inventory.stock_availability', '=', true)
  );
```

The intent is "show the product if stock is not managed, **or** if it is in stock". What actually happens is that the `OR` node is attached as a **sibling** of every `andWhere` added *later*. SQL precedence then reads:

```sql
A OR (B AND C) AND variant_group_id = 200 AND status = 1 AND visibility = 't'
```

as

```sql
A OR ((B AND C) AND variant_group_id = 200 AND status = 1 AND visibility = 't')
```

So **any** product in the store with `manage_stock = false` satisfies the whole predicate and bypasses the variant-group, attribute, status, visibility and URL filters entirely. With 15% of 500k products unmanaged, that is 442,586 rows pulled into Node, grouped with an O(n²) `acc.find()` loop, and `JSON.stringify`d into the page.

The same latent bug sat in the storefront product listing (visibility and user filters leaked), in the featured-products resolver (disabled and invisible products leaked in), and on the product-view page. It is invisible on the demo catalog, which contains no `manage_stock = false` products to leak.

### The correct idiom

Wrap the disjunction in its own `node('AND')` and attach that node at the root of the WHERE tree:

```js
const stockFilter = node('AND');
stockFilter.addLeaf('AND', 'product_inventory.manage_stock', '=', false);
stockFilter.addNode(
  node('OR')
    .addLeaf('AND', 'product_inventory.qty', '>', 0)
    .addLeaf('AND', 'product_inventory.stock_availability', '=', true)
);
query.getWhere().addNode(stockFilter);
```

which renders `(A OR (B AND C)) AND <everything else>`.

> **Rule: after `.addNode()` on an `andWhere` chain, later `andWhere` calls are not safely parenthesised.** Always build an OR group as a self-contained `node('AND')` and attach it via `getWhere().addNode(...)`.

The four fixed sites are worth reading as reference implementations:

- `modules/catalog/services/ProductCollection.js`
- `modules/catalog/graphql/types/Product/Variant/Variant.resolvers.js`
- `modules/catalog/graphql/types/FeaturedProduct/FeaturedProduct.resolvers.js`
- `modules/catalog/pages/frontStore/productView/index.ts`

After the fix the 442,586-row query returns 729 rows, and the resolver's grouping is `Map`-based rather than `Array.find`-based.

## Keyword search: forcing the GIN index

The full-text index (`PRODUCT_SEARCH_INDEX`, a GIN index added in catalog migration `Version-1.0.5`) matches the search predicate exactly — and PostgreSQL was still not using it.

With the `to_tsvector(...) @@ websearch_to_tsquery(...)` predicate inlined in the main query, the outer `ORDER BY product.product_id DESC LIMIT 20` convinces the planner it can walk the primary-key index and evaluate the match row by row, stopping after 20 hits. For a common term that is fine (~130 ms). For a rare or unmatched term it degenerates into a full 500k-row scan — 6.4 seconds, because every row parses the product description JSON to build a tsvector on the fly.

The fix (`modules/catalog/services/registerDefaultProductCollectionFilters.js`) evaluates the match inside a `WITH ... AS MATERIALIZED` CTE nested in an `IN` subquery. `MATERIALIZED` is an optimisation fence: it stops PostgreSQL from inlining the CTE into the outer query, so the match must be evaluated on its own — which is exactly when the GIN index wins.

```js
const bindingKey = `keyword_${uniqid()}`;
query.getWhere().addRaw(
  'AND',
  `product.product_id IN (
    WITH keyword_matches AS MATERIALIZED (
      SELECT product_description_product_id FROM product_description
      WHERE to_tsvector('simple', name || ' ' || description) @@ websearch_to_tsquery('simple', :${bindingKey})
    )
    SELECT product_description_product_id FROM keyword_matches
  )`,
  { [bindingKey]: value }
);
```

Worst case is now bounded: roughly 200 ms for a term matching 2,000 products, sub-millisecond for a rare term.

Two side notes:

- The old code wrapped the search term in `%...%`. That was a leftover from a `LIKE` implementation — `websearch_to_tsquery` treats `%` as punctuation, so the wrapping did nothing. It was removed.
- If search becomes a hot path, a stored `tsvector` column with its own index removes the ~200 ms bitmap-recheck cost on common terms. That is not in 2.2.1.

## Indexes changed in 2.2.1

Migration `modules/catalog/migration/Version-1.0.15.ts`:

```ts
await execute(
  connection,
  `CREATE INDEX IF NOT EXISTS "URL_REWRITE_REQUEST_PATH_INDEX"
     ON "url_rewrite" ("request_path")`
);

await execute(connection, `DROP INDEX IF EXISTS "FK_PRODUCT_DESCRIPTION"`);
await execute(connection, `DROP INDEX IF EXISTS "FK_CATEGORY_DESCRIPTION"`);
await execute(connection, `DROP INDEX IF EXISTS "FK_ATTRIBUTE_LINK"`);
await execute(connection, `DROP INDEX IF EXISTS "FK_PRODUCT_ATTRIBUTE_LINK"`);
```

### `url_rewrite.request_path`

Every storefront request that does not match a static route resolves its URL through `url_rewrite` — the lookup lives in the default middleware stack (`bin/lib/addDefaultMiddlewareFuncs.ts`) and runs before any page middleware:

```sql
SELECT * FROM url_rewrite
 WHERE request_path = $1
 ORDER BY CASE entity_type
     WHEN 'landing_page' THEN 0
     WHEN 'cms_page' THEN 1
     WHEN 'product' THEN 2
     WHEN 'category' THEN 3
     ELSE 4
   END,
   url_rewrite_id ASC
 LIMIT 1
```

The table only had a primary key and a unique index on `entity_uuid`, so this was a parallel sequential scan over 500k rows on **every product and category page view** — about 210 ms each, and the worst buffer-cache thrasher in the database (58% heap hit rate). With the index it is 1.0 ms.

The index is deliberately **not** UNIQUE: slugs may legitimately collide across entity types, which is exactly why the query breaks ties with the deterministic `ORDER BY` above.

### The four dropped indexes

Each was fully covered by a UNIQUE constraint on the same leading column, so they contributed nothing to reads and only amplified write cost (31 MB of index across the test catalog):

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Dropped index</th>
      <th>Covered by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>FK_PRODUCT_DESCRIPTION</code></td>
      <td><code>PRODUCT_ID_UNIQUE</code></td>
    </tr>
    <tr>
      <td><code>FK_CATEGORY_DESCRIPTION</code></td>
      <td><code>CATEGORY_ID_UNIQUE</code></td>
    </tr>
    <tr>
      <td><code>FK_ATTRIBUTE_LINK</code></td>
      <td><code>ATTRIBUTE_GROUP_LINK_UNIQUE</code></td>
    </tr>
    <tr>
      <td><code>FK_PRODUCT_ATTRIBUTE_LINK</code></td>
      <td><code>OPTION_VALUE_UNIQUE</code></td>
    </tr>
  </tbody>
</table>

PostgreSQL only requires an index on the *referenced* side of a foreign key; referencing-side lookups (cascade deletes, joins) keep using the unique indexes at identical cost.

The rest of the catalog index design measured sound under `EXPLAIN ANALYZE` on 500k products: category page-1 items 5.4 ms, MIN/MAX price 8.4 ms, the PDP variant selector 2.1 ms, `COUNT(*)` 90 ms.

## PostgreSQL tuning for large catalogs

The stock PostgreSQL defaults are sized for a small machine with a spinning disk, and they measurably hurt at this scale. These are applied with `ALTER SYSTEM SET ...` followed by `SELECT pg_reload_conf();` except where noted.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Setting</th>
      <th>Default</th>
      <th>Suggested</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>work_mem</code></td>
      <td>4MB</td>
      <td>32MB</td>
      <td>The 500k-row hash joins in product listing spill to disk at 4MB — plans show <code>Batches: 8</code> with temp files written. Applies per sort/hash node, so raise it deliberately, not wildly.</td>
    </tr>
    <tr>
      <td><code>random_page_cost</code></td>
      <td>4.0</td>
      <td>1.1</td>
      <td>4.0 models a spinning disk. On SSD or NVMe it biases the planner away from index scans toward sequential scans — the opposite of what a large catalog needs.</td>
    </tr>
    <tr>
      <td><code>effective_cache_size</code></td>
      <td>4GB</td>
      <td>~50% of RAM (12GB on a 24GB box)</td>
      <td>Advisory only — it does not allocate anything. It tells the planner how much of the table is likely already in OS cache, which makes index plans look correctly cheap.</td>
    </tr>
    <tr>
      <td><code>shared_buffers</code></td>
      <td>128MB</td>
      <td>~1GB (25% of RAM)</td>
      <td>128MB against a 1.7GB working set means constant eviction. <strong>Requires a PostgreSQL restart</strong>, not a reload.</td>
    </tr>
  </tbody>
</table>

None of these are set by EverShop; they are the operator's responsibility. See [Database](./database) for the connection-level configuration EverShop does own.

## How to diagnose a slow store

The order matters. The point of the sequence is to separate "the database is slow" from "Node is blocked", which look identical from the browser.

**1. Look at `pg_stat_activity` during the hang.**

```sql
SELECT pid, state, now() - query_start AS duration, left(query, 120)
FROM pg_stat_activity
WHERE state != 'idle' AND backend_type = 'client backend'
ORDER BY duration DESC;
```

If this is **empty** while requests are hanging, the database is not your problem. Go to step 3.

**2. Turn on slow-query logging and read the log.**

```sql
ALTER SYSTEM SET log_min_duration_statement = '150ms';
SELECT pg_reload_conf();
```

This is what surfaced both the unbounded collapse query and the bind-parameter overflow error.

**3. Sample Node's CPU while a request is in flight.**

```bash
ps -o pid,pcpu,etime,command -p $(pgrep -f 'node.*evershop' | head -1)
```

Node pegged at 130–170% with **zero** active PostgreSQL queries is the signature of a synchronous JavaScript burn — almost always a large loop over rows or parameters. Confirm it by isolating the suspect code in a micro-benchmark at 10k / 25k / 50k / 100k inputs and checking whether the curve is quadratic before you rewrite anything.

**4. Use runtime statistics to find missing indexes.**

```sql
SELECT relname, seq_scan, seq_tup_read, idx_scan
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC
LIMIT 20;
```

This is stronger evidence than reading `EXPLAIN` on queries you *guessed* were hot. It is how the `url_rewrite` problem was found: 73 sequential scans, 500k rows each.

**5. `EXPLAIN (ANALYZE, BUFFERS)` the specific query.**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
```

Read it for three things: `Seq Scan` on a large table, `Batches:` greater than 1 (a hash spilled to disk — raise `work_mem`), and a large gap between estimated and actual row counts (the planner is being lied to, often by an inlined CTE — see the facet-query note above).

## Checklist for extension authors

- Never pass a list whose length scales with the catalog to `.where(col, 'IN', list)`. Use a subquery or `= ANY($1::int[])`.
- Build OR groups as a dedicated `node('AND')` attached via `getWhere().addNode(...)`, never by chaining `.addNode()` onto `andWhere`.
- If you embed a rendered subquery via `.addRaw()`, re-key its bindings first.
- Any resolver returning a list needs a `LIMIT`. A field with no bound is a 46 MB response waiting to happen.
- Group rows with a `Map`, not `Array.prototype.find` inside a loop.
- Add an index for any column your extension filters on in a per-request path, and prove it with `EXPLAIN ANALYZE` on realistic data volume, not on the demo catalog.

## See also

- [Database](./database) — the query builder API, including what chains on what
- [Data Fetching](./data-fetching) — how page queries are assembled and executed
- [Data Migration](./data-migration) — how to ship an index in your own module
- [Error Handling and Degradation](./error-handling-and-degradation) — what happens when one of these queries fails instead of being slow

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>

