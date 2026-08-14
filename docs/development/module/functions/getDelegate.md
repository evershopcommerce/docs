---
sidebar_position: 101
keywords:
- getDelegate
- middleware
- delegate
- request data
groups:
- middleware
sidebar_label: getDelegate
title: getDelegate
description: Retrieve a delegate value set by an earlier middleware in the request pipeline.
---

# getDelegate

Retrieve a value that was stored on the request by an earlier middleware using `setDelegate`. The returned value is a deep clone, so modifying it does not affect the stored original.

## Import

```typescript
import { getDelegate } from '@evershop/evershop/lib/middleware/delegate';
```

## Syntax

```typescript
getDelegate<T>(id: string, request: EvershopRequest): T | undefined
```

### Parameters

**`id`**

**Type:** `string`

The delegate key to retrieve.

**`request`**

**Type:** `EvershopRequest`

The Express request object.

## Return Value

Returns the stored value (cloned), or `undefined` if the key has not been set.

## Examples

### Read Product Data from Earlier Middleware

```typescript title="middleware/[loadProduct]enrichProduct.ts"
import { getDelegate } from '@evershop/evershop/lib/middleware/delegate';

// Return the enriched value and the framework stores it as this middleware's
// delegate for later middleware to read.
export default async (request, response) => {
  const product = getDelegate('product', request);
  return product ? { ...product, enriched: true } : null;
};
```

:::warning A 2-arg middleware must not send a response
The framework inspects `function.length`. A `(request, response)` middleware is treated
as **passive**: it auto-calls `next()` once your function resolves, and `apiResponse`
then tries to send headers again — you get `ERR_HTTP_HEADERS_SENT`.

If you need to call `response.json()` / `.send()` / `.redirect()`, declare the third
`next` parameter even if you never call it. The 3-arg signature disables the auto-next.
:::

## See Also

- [setDelegate](/docs/development/module/functions/setDelegate) - Store a delegate value
- [hasDelegate](/docs/development/module/functions/hasDelegate) - Check if a delegate exists
