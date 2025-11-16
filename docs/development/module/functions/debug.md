---
sidebar_position: 24
keywords:
- debug
- logger
- logging
- debugging
groups:
- logging
sidebar_label: debug
title: debug
description: Log debug messages.
---

# debug

Log debug messages. Only visible in development mode or when `--debug` flag is used.

## Import

```typescript
import { debug } from '@evershop/evershop/lib/log';
```

## Syntax

```typescript
debug(message: string): void
```

### Parameters

**`message`**

**Type:** `string`

The debug message to log.

## Examples

```typescript
import { debug } from '@evershop/evershop/lib/log';

// Log debug information
debug('Processing order...');
debug(`Customer ID: ${customerId}`);
debug(JSON.stringify(orderData, null, 2));
```

## See Also

- [info](/docs/development/module/functions/info) - Log info messages
- [warning](/docs/development/module/functions/warning) - Log warnings
- [error](/docs/development/module/functions/error) - Log errors
