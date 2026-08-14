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

### Have the last word on a registry value

```typescript title="extensions/shipping-floor/src/bootstrap.ts"
import { addFinalProcessor } from '@evershop/evershop/lib/util/registry';

export default function () {
  // Runs at priority 1000, after every other processor, so nothing downstream
  // can undo it. Only one final processor is allowed per key.
  addFinalProcessor('shippingCost', (cost) => Math.max(cost, 500));
}
```

:::tip Registering an email service
To replace the email service, use
[`registerEmailService`](/docs/development/module/functions/registerEmailService) rather
than a final processor on `emailService`. The registry validates that key against the
`EmailService` interface, which requires a **`sendEmail(args)`** method — a value exposing
`send(to, subject, html)` is rejected, and the next `sendEmail()` call throws
`Value emailService is invalid`, taking all outbound mail down with it. Note also that the
rendered HTML arrives as `args.body`; there is no `args.html`.

```typescript title="extensions/custom-email/src/bootstrap.ts"
import { registerEmailService } from '@evershop/evershop/lib/mail/emailHelper';

export default function () {
  registerEmailService({
    sendEmail: async (args) => {
      await myCustomProvider.send({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.body
      });
    }
  });
}
```
:::

## Notes

- Priority is fixed at 1000 (always runs after all other processors)
- Only one final processor allowed per registry key — throws an error if one already exists
- Must be registered during bootstrap (before registry is locked)

## See Also

- [addProcessor](/docs/development/module/functions/addProcessor) - Register a regular processor
- [getValue](/docs/development/module/functions/getValue) - Retrieve processed values
