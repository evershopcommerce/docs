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
import { insertOnUpdate } from '@evershop/postgres-query-builder';
```

## Syntax

```typescript
insertOnUpdate(tableName: string, conflictColumns: string[]): InsertOnUpdateQuery
```

### Parameters

**`tableName`**

**Type:** `string`

The database table to insert into.

**`conflictColumns`**

**Type:** `string[]`

Column names that define the uniqueness constraint. If a row with matching values exists, it will be updated instead of inserted.

## Return Value

Returns an `InsertOnUpdateQuery` builder with `.given(data).execute(connection)` methods.

## Examples

### Track Migration Versions

```typescript
import { insertOnUpdate } from '@evershop/postgres-query-builder';

await insertOnUpdate('migration', ['module'])
  .given({
    module: 'catalog',
    version: '1.0.5'
  })
  .execute(connection);
```

### Upsert a Setting

```typescript
import { insertOnUpdate } from '@evershop/postgres-query-builder';
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
