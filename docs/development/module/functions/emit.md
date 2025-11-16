---
sidebar_position: 33
keywords:
- emit
- event
- event emitter
groups:
- core
sidebar_label: emit
title: emit
description: Emit an event to trigger registered subscribers.
---

# emit

Emit an event that will be processed by registered event subscribers.

## Import

```typescript
import { emit } from '@evershop/evershop/lib/event';
```

## Syntax

```typescript
// Typed event (recommended)
emit<EventName>(name: EventName, data: EventData): Promise<void>

// Untyped event
emit(name: string, data: Record<string, any>): Promise<void>
```

### Parameters

**`name`**

**Type:** `string` or `EventName`

The name of the event to emit.

**`data`**

**Type:** `Record<string, any>` or typed event data

The data to pass to event subscribers.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Event

```typescript
import { emit } from '@evershop/evershop/lib/event';

// Emit a simple event
await emit('customer_registered', {
  customer_id: 123,
  email: 'customer@example.com'
});
```

### Typed Event (TypeScript)

```typescript
import { emit } from '@evershop/evershop/lib/event';

// With type safety
await emit<'customer_created'>('customer_created', {
  customer_id: 123,
  email: 'customer@example.com',
  full_name: 'John Doe',
  created_at: new Date()
});
```

## Event Processing

Events are stored in the database and processed asynchronously by subscribers:

1. Event is inserted into the `event` table
2. Event subscribers are triggered
3. Each subscriber processes the event independently

## Notes

- Events are processed asynchronously
- Event data is stored in the database
- Subscribers are registered during bootstrap
- Multiple subscribers can listen to the same event
- Events are processed in order of subscriber priority
- Use typed events for better TypeScript support
- Common events: `product_created`, `order_placed`, `customer_registered`, etc.

## See Also

- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) - Learn about event subscribers and how to register them.
