---
sidebar_position: 8
keywords:
- addFinalProcessor
- registry
- processor
groups:
- utilities
sidebar_label: addFinalProcessor
title: addFinalProcessor
description: Register a final processor that always executes last in the processor pipeline.
---

# addFinalProcessor

Register a processor that always runs last (priority 1000) for a given registry value. Only one final processor is allowed per registry key.

## Import

```typescript
import { addFinalProcessor } from '@evershop/evershop/lib/util/registry';
```

## Syntax

```typescript
addFinalProcessor<T>(name: string, callback: SyncProcessor<T> | AsyncProcessor<T>): void
```

### Parameters

**`name`**

**Type:** `string`

The name of the registry value to process.

**`callback`**

**Type:** `SyncProcessor<T> | AsyncProcessor<T>`

The processor function. Receives the current value and must return the transformed value.

## Return Value

Returns `void`.

## Examples

### Override Email Service

```typescript title="extensions/custom-email/src/bootstrap.ts"
import { addFinalProcessor } from '@evershop/evershop/lib/util/registry';

export default function () {
  addFinalProcessor('emailService', (currentService) => {
    return {
      send: async (to, subject, html) => {
        await myCustomProvider.send({ to, subject, html });
      }
    };
  });
}
```

## Notes

- Priority is fixed at 1000 (always runs after all other processors)
- Only one final processor allowed per registry key — throws an error if one already exists
- Must be registered during bootstrap (before registry is locked)

## See Also

- [addProcessor](/docs/development/module/functions/addProcessor) - Register a regular processor
- [getValue](/docs/development/module/functions/getValue) - Retrieve processed values
