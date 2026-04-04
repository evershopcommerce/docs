---
sidebar_position: 103
keywords:
- camelCase
- utility
- data transformation
groups:
- utilities
sidebar_label: camelCase
title: camelCase
description: Convert an object's keys from snake_case or kebab-case to camelCase.
---

# camelCase

Convert all keys of an object from snake_case or kebab-case to camelCase. This is commonly used to transform database row objects (which use snake_case) into JavaScript-friendly camelCase objects for use in GraphQL resolvers and React components.

## Import

```typescript
import { camelCase } from '@evershop/evershop/lib/util/camelCase';
```

## Syntax

```typescript
camelCase(object: Record<string, any>): Record<string, any>
```

### Parameters

**`object`**

**Type:** `Record<string, any>`

An object whose keys should be converted to camelCase.

## Return Value

Returns a new object with all keys converted to camelCase. The original object is not modified.

## Examples

### Database Row Transformation

```typescript
import { camelCase } from '@evershop/evershop/lib/util/camelCase';

const dbRow = {
  product_id: 1,
  product_name: 'Widget',
  created_at: '2024-01-01',
  url_key: 'widget'
};

const result = camelCase(dbRow);
// { productId: 1, productName: 'Widget', createdAt: '2024-01-01', urlKey: 'widget' }
```

### In a GraphQL Resolver

```typescript
import { camelCase } from '@evershop/evershop/lib/util/camelCase';
import { select } from '@evershop/postgres-query-builder';

export default {
  Query: {
    product: async (_, { id }, { pool }) => {
      const result = await select()
        .from('product')
        .where('product_id', '=', id)
        .load(pool);
      return result ? camelCase(result) : null;
    }
  }
};
```

## Notes

- Only converts top-level keys (not nested objects)
- Throws an error if the input is not an object
- Does not modify the original object

## See Also

- [select](/docs/development/module/functions/select) - Build SELECT queries
