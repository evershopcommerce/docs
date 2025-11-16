---
sidebar_position: 26
keywords:
- logger
- logging
groups:
- logging
sidebar_label: warning
title: warning
description: Log warning messages.
---

# warning

Log warning messages.

## Import

```typescript
import { warning } from '@evershop/evershop/lib/log';
```

## Syntax

```typescript
warning(message: string): void
```

### Parameters

**`message`**

**Type:** `string`

The warning message to log.

## Examples

```typescript
import { warning } from '@evershop/evershop/lib/log';

// Log warning
warning('Product stock is low');
warning(`Customer ${email} not found`);
warning('Payment gateway timeout, retrying...');
```

## See Also

- [error](/docs/development/module/functions/error) - Log errors
- [info](/docs/development/module/functions/info) - Log info messages
- [debug](/docs/development/module/functions/debug) - Log debug messages
