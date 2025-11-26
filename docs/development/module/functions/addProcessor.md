---
sidebar_position: 7
keywords:
- addProcessor
- registry
- processor
- value transformation
groups:
- utilities
sidebar_label: addProcessor
title: addProcessor
description: Register processors to transform registry values.
---

# addProcessor

Register a processor function to transform values when they are retrieved from the registry.

## Import

```typescript
import { addProcessor } from '@evershop/evershop/lib/util/registry';
```

## Syntax

```typescript
addProcessor<T>(
  name: string,
  callback: SyncProcessor<T> | AsyncProcessor<T>,
  priority?: number
): void
```

### Parameters

**`name`**

**Type:** `string`

The name of the value to process.

**`callback`**

**Type:** `SyncProcessor<T> | AsyncProcessor<T>`

The processor function that receives the current value and returns the transformed value.

**`priority`**

**Type:** `number` (optional, default: `10`)

Execution priority. Lower numbers execute first. Maximum value is 1000.

## Return Value

Returns `void`.

## Examples

### Basic Usage

```typescript
import { addProcessor, getValue } from '@evershop/evershop/lib/util/registry';

// Add a processor to calculate final price
addProcessor('productData', (product) => {
  product.finalPrice = product.price * (1 - product.discount);
  return product;
});

// Use the processed value
const product = await getValue('productData', {
  price: 100,
  discount: 0.1
});
// Result: { price: 100, discount: 0.1, finalPrice: 90 }
```

### Priority Order

```typescript
import { addProcessor, getValue } from '@evershop/evershop/lib/util/registry';

// Execute first (priority 5)
addProcessor('orderTotal', (order) => {
  order.subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
  return order;
}, 5);

// Execute second (priority 10)
addProcessor('orderTotal', (order) => {
  order.tax = order.subtotal * 0.1;
  return order;
}, 10);

// Execute third (priority 15)
addProcessor('orderTotal', (order) => {
  order.total = order.subtotal + order.tax;
  return order;
}, 15);
```

### Async Processor

```typescript
import { addProcessor, getValue } from '@evershop/evershop/lib/util/registry';

// Add async processor
addProcessor('productDetails', async (product) => {
  const reviews = await loadReviews(product.id);
  product.reviews = reviews;
  product.averageRating = calculateAverage(reviews);
  return product;
});

// Get the processed value
const product = await getValue('productDetails', baseProduct);
```

### Using Context

```typescript
import { addProcessor, getValue } from '@evershop/evershop/lib/util/registry';

// Processor can access context via 'this'
addProcessor('productPrice', function(price) {
  const customer = this.customer;
  
  if (customer && customer.isVip) {
    return price * 0.9; // VIP discount
  }
  
  return price;
});

// Pass context when getting value
const finalPrice = await getValue(
  'productPrice',
  100,
  { customer: currentCustomer }
);
```

## Bootstrap Location

Processors must be registered during application bootstrap:

```typescript
// extensions/my-extension/bootstrap.ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function bootstrap() {
  addProcessor('customerData', (customer) => {
    customer.loyaltyPoints = calculatePoints(customer);
    return customer;
  });
}
```

## Notes

- Processors execute in priority order (lower numbers first)
- Default priority is 10
- Maximum priority is 1000
- Supports both sync and async processors
- Processors are locked after bootstrap phase
- Context is available via the `this` keyword in processor functions
- If a processor returns `undefined`, a warning is logged

## See Also

- [getValue](/docs/development/module/functions/getValue) - Get values asynchronously
- [getValueSync](/docs/development/module/functions/getValueSync) - Get values synchronously
