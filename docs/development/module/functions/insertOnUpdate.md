---
sidebar_position: 75
keywords:
- insertOnUpdate
- upsert
- database
- query builder
groups:
- database
sidebar_label: insertOnUpdate
title: insertOnUpdate
description: Insert a row or update it if a conflict occurs on the specified columns.
---

# insertOnUpdate

Creates an INSERT query that updates existing rows on conflict (upsert). This is useful when you want to insert a row if it doesn't exist, or update it if it does.

## Import

```typescript
import { insertOnUpdate } from '@evershop/evershop/lib/postgres/query';
```

:::info Typed wrapper
`@evershop/evershop/lib/postgres/query` is EverShop's first-party typed query builder. It wraps `@evershop/postgres-query-builder` and adds table/column types for every known EverShop table, so `insertOnUpdate('order', ['uuid'])` narrows `.given()` / `.where()` to that table's columns and gives you autocomplete.

The raw `@evershop/postgres-query-builder` package is still available as an untyped lower-level fallback, but new code should import from the wrapper.
:::

## Syntax

```typescript
insertOnUpdate<T extends AnyTableName>(
  table: T,
  conflictColumns: Array<ColumnOf<T>>
): TypedInsertOnUpdateQuery<T>
```

### Parameters

**`table`**

**Type:** `AnyTableName`

The database table to insert into. Known EverShop tables are suggested by name; any other string is still accepted for custom tables.

**`conflictColumns`**

**Type:** `Array<ColumnOf<T>>`

Column names that define the uniqueness constraint. If a row with matching values exists, it will be updated instead of inserted.

## Return Value

Returns a `TypedInsertOnUpdateQuery<T>` builder with `.given(data).execute(connection)` methods. When `T` is a known table, `.given()` and `.prime()` only accept that table's columns.

## Examples

### Track Migration Versions

```typescript
import { insertOnUpdate } from '@evershop/evershop/lib/postgres/query';

await insertOnUpdate('migration', ['module'])
  .given({
    module: 'catalog',
    version: '1.0.5'
  })
  .execute(connection);
```

### Upsert a Setting

```typescript
import { insertOnUpdate } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

await insertOnUpdate('setting', ['name'])
  .given({
    name: 'storeName',
    value: 'My Shop'
  })
  .execute(pool);
```

## Notes

- Uses PostgreSQL `INSERT ... ON CONFLICT ... DO UPDATE`
- The `conflictColumns` must match an actual unique constraint or unique index on the table
- Columns not in `conflictColumns` will be updated if a conflict occurs

## See Also

- [insert](/docs/development/module/functions/insert) - Simple insert
- [update](/docs/development/module/functions/update) - Update existing rows
