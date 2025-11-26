---
sidebar_position: 25
keywords:
- logger
- logging
groups:
- logging
sidebar_label: error
title: error
description: Log error messages.
---

# error

Log error messages and exceptions.

## Import

```typescript
import { error } from '@evershop/evershop/lib/log';
```

## Syntax

```typescript
error(e: Error | string): void
```

### Parameters

**`e`**

**Type:** `Error | string`

The error object or error message to log.

## Examples

```typescript
import { error } from '@evershop/evershop/lib/log';

// Log error message
error('Failed to process payment');

// Log error object
try {
  await processOrder(orderId);
} catch (err) {
  error(err);
}

// Log with context
error(`Order ${orderId} failed: ${err.message}`);
```

## See Also

- [warning](/docs/development/module/functions/warning) - Log warnings
- [info](/docs/development/module/functions/info) - Log info messages
- [debug](/docs/development/module/functions/debug) - Log debug messages
