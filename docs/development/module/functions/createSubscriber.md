---
sidebar_position: 105
keywords:
- createSubscriber
- EventSubscriber
- events
- type-safe
groups:
- events
sidebar_label: createSubscriber
title: createSubscriber
description: Create a type-safe event subscriber with automatic data typing.
---

# createSubscriber

Create a type-safe event subscriber function. The event data type is automatically inferred from the event name, providing IDE autocomplete and compile-time type checking.

## Import

```typescript
import { createSubscriber } from '@evershop/evershop/lib/event/subscriber';
import type { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';
```

## Syntax

```typescript
createSubscriber<T extends EventName>(
  eventName: T,
  handler: EventSubscriber<T>
): (data: EventDataRegistry[T]) => Promise<void>
```

### Parameters

**`eventName`**

**Type:** `T extends EventName`

The name of the event to subscribe to. Must be a registered event name.

**`handler`**

**Type:** `EventSubscriber<T>`

The handler function. Receives the event data with the correct type based on the event name.

## Return Value

Returns an async function suitable for use as a subscriber default export.

## Examples

### Type-Safe Product Subscriber

```typescript title="extensions/my-ext/src/subscribers/product_created/syncCatalog.ts"
import { createSubscriber } from '@evershop/evershop/lib/event/subscriber';

export default createSubscriber('product_created', async (data) => {
  // 'data' is automatically typed as ProductRow
  const sku = data.sku;
  const price = data.price;
  await syncToExternalCatalog(sku, price);
});
```

### Using the EventSubscriber Type Directly

```typescript title="extensions/my-ext/src/subscribers/order_placed/sendEmail.ts"
import type { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const handler: EventSubscriber<'order_placed'> = async (data) => {
  // 'data' is typed as OrderRow
  await sendOrderConfirmation(data.customer_email, data.order_number);
};

export default handler;
```

## Notes

- Subscriber files must be placed in `subscribers/{eventName}/` directory
- Each file must have a default export (the handler function)
- Subscribers execute asynchronously in a separate child process
- See the [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) guide for the full list of available events

## See Also

- [emit](/docs/development/module/functions/emit) - Emit an event
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) - Event system overview
