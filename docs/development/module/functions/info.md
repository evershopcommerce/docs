---
sidebar_position: 27
keywords:
- logger
- logging
groups:
- logging
sidebar_label: info
title: info
description: Log informational messages.
---

# info

Log informational messages.

## Import

```typescript
import { info } from '@evershop/evershop/lib/log';
```

## Syntax

```typescript
info(message: string): void
```

### Parameters

**`message`**

**Type:** `string`

The informational message to log.

## Examples

```typescript
import { info } from '@evershop/evershop/lib/log';

// Log information
info('Order processed successfully');
info(`Customer ${email} registered`);
info('Email sent to customer');
```

## See Also

- [success](/docs/development/module/functions/success) - Log success messages
- [warning](/docs/development/module/functions/warning) - Log warnings
- [error](/docs/development/module/functions/error) - Log errors
- [debug](/docs/development/module/functions/debug) - Log debug messages
