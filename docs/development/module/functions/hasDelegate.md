---
sidebar_position: 102
keywords:
- hasDelegate
- middleware
- delegate
groups:
- middleware
sidebar_label: hasDelegate
title: hasDelegate
description: Check if a delegate value exists on the request.
---

# hasDelegate

Check whether a delegate with the given key has been set on the request.

## Import

```typescript
import { hasDelegate } from '@evershop/evershop/lib/middleware/delegate';
```

## Syntax

```typescript
hasDelegate(id: string, request: EvershopRequest): boolean
```

### Parameters

**`id`**

**Type:** `string`

The delegate key to check.

**`request`**

**Type:** `EvershopRequest`

The Express request object.

## Return Value

Returns `true` if the delegate exists, `false` otherwise.

## Examples

```typescript
import { hasDelegate, getDelegate } from '@evershop/evershop/lib/middleware/delegate';

export default async (request, response, next) => {
  if (hasDelegate('product', request)) {
    const product = getDelegate('product', request);
    // Use product data...
  }
  next();
};
```

## See Also

- [setDelegate](/docs/development/module/functions/setDelegate) - Store a delegate value
- [getDelegate](/docs/development/module/functions/getDelegate) - Read a delegate value
