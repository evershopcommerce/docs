---
sidebar_position: 28
keywords:
- logger
- logging
groups:
- logging
sidebar_label: success
title: success
description: Log success messages.
---

# success

Log success messages. Alias for the info function.

## Import

```typescript
import { success } from '@evershop/evershop/lib/log';
```

## Syntax

```typescript
success(message: string): void
```

### Parameters

**`message`**

**Type:** `string`

The success message to log.

## Examples

```typescript
import { success } from '@evershop/evershop/lib/log';

// Log success
success('Payment completed');
success(`Order #${orderId} shipped`);
success('Database migration completed');
```

## See Also

- [info](/docs/development/module/functions/info) - Log info messages
- [warning](/docs/development/module/functions/warning) - Log warnings
- [error](/docs/development/module/functions/error) - Log errors
