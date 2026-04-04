---
sidebar_position: 100
keywords:
- setDelegate
- middleware
- delegate
- request data
groups:
- middleware
sidebar_label: setDelegate
title: setDelegate
description: Store a write-once value on the request for sharing data between middleware.
---

# setDelegate

Store a value on the request object that can be read by subsequent middleware. Each delegate key can only be set once per request — attempting to set the same key again throws an error.

## Import

```typescript
import { setDelegate } from '@evershop/evershop/lib/middleware/delegate';
```

## Syntax

```typescript
setDelegate<T>(id: string, value: T, request: EvershopRequest): void
```

### Parameters

**`id`**

**Type:** `string`

A unique identifier for this delegate value.

**`value`**

**Type:** `T`

The value to store. Can be any serializable type.

**`request`**

**Type:** `EvershopRequest`

The Express request object.

## Return Value

Returns `void`.

## Examples

### Share Data Between Middleware

```typescript title="middleware/loadProduct.ts"
import { setDelegate } from '@evershop/evershop/lib/middleware/delegate';
import { select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

export default async (request, response, next) => {
  const product = await select()
    .from('product')
    .where('product_id', '=', request.params.id)
    .load(pool);

  if (product) {
    setDelegate('product', product, request);
    next();
  } else {
    response.status(404);
    next();
  }
};
```

## Notes

- Write-once: setting the same key twice throws an error
- Values are cloned when read via `getDelegate`, so the original cannot be modified
- Initialize request locals before using (EverShop handles this automatically for route middleware)

## See Also

- [getDelegate](/docs/development/module/functions/getDelegate) - Read a delegate value
- [hasDelegate](/docs/development/module/functions/hasDelegate) - Check if a delegate exists
