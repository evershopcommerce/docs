---
sidebar_position: 5
keywords:
- getValue
- registry
- processor
- value transformation
- async
groups:
- utilities
sidebar_label: getValue
title: getValue
description: Get values from the registry asynchronously with optional processing and validation.
---

# getValue

Get a value from the registry asynchronously, allowing it to be processed by registered processors.

## Import

```typescript
import { getValue, addProcessor } from '@evershop/evershop/lib/util/registry';
```

## Syntax

```typescript
async getValue<T>(
  name: string,
  initialization: T | AsyncProcessor<T> | SyncProcessor<T>,
  context?: Record<string, any>,
  validator?: (value: T) => boolean
): Promise<T>
```

#### Parameters

**`name`**

**Type:** `string`

The unique name of the value in the registry.

**`initialization`**

**Type:** `T | AsyncProcessor<T> | SyncProcessor<T>`

The initial value or a function that returns the initial value.
**`context`**

**Type:** `Record<string, any>` (optional)

Context object passed to processors.

**`validator`**

**Type:** `(value: T) => boolean` (optional)

Validation function called after each processor.

## Return Value

Returns a `Promise<T>` that resolves to the processed value.

## Examples

### Basic Usage

```typescript
import { getValue } from '@evershop/evershop/lib/util/registry';

// Get a simple value
const pageSize = await getValue('productListPageSize', 20);

// Get a value with context
const customer = await getValue('currentCustomer', null, { request });

// Get a value with initialization function
const products = await getValue(
  'productList',
  async () => {
    return await loadProducts();
  },
  { categoryId: 123 }
);
```

## Complete Examples

### Value Processing Pipeline

```typescript
import { getValue, addProcessor } from '@evershop/evershop/lib/util/registry';

// Core module - register processors
addProcessor('orderData', (order) => {
  // Calculate subtotal
  order.subtotal = order.items.reduce((sum, item) => {
    return sum + (item.price * item.qty);
  }, 0);
  return order;
}, 5);

// Extension - add tax calculation
addProcessor('orderData', (order) => {
  order.tax = order.subtotal * 0.1;
  return order;
}, 10);

// Extension - add shipping
addProcessor('orderData', (order) => {
  order.shipping = 10;
  return order;
}, 15);

// Extension - calculate grand total
addProcessor('orderData', (order) => {
  order.grandTotal = order.subtotal + order.tax + order.shipping;
  return order;
}, 20);

// Use in application
const order = await getValue('orderData', {
  items: [
    { price: 50, qty: 2 },
    { price: 30, qty: 1 }
  ]
});
// Result:
// {
//   items: [...],
//   subtotal: 130,
//   tax: 13,
//   shipping: 10,
//   grandTotal: 153
// }
```

### Async Processing

```typescript
import { getValue, addProcessor } from '@evershop/evershop/lib/util/registry';

// Add async processor to load additional data
addProcessor('productDetails', async (product) => {
  // Load reviews from database
  const reviews = await loadReviews(product.product_id);
  product.reviews = reviews;
  product.averageRating = calculateAverage(reviews);
  return product;
}, 10);

// Add another async processor
addProcessor('productDetails', async (product) => {
  // Check inventory
  const inventory = await checkInventory(product.sku);
  product.inStock = inventory.qty > 0;
  return product;
}, 15);

// Get the processed product
const product = await getValue('productDetails', baseProduct);
```

### Validation

```typescript
import { getValue } from '@evershop/evershop/lib/util/registry';

// Validator function
function validatePrice(product) {
  if (product.price < 0) {
    return false;
  }
  return true;
}

// Get value with validation
try {
  const product = await getValue(
    'productData',
    { price: -10 },
    {},
    validatePrice
  );
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Context Usage

```typescript
import { getValue, addProcessor } from '@evershop/evershop/lib/util/registry';

// Processor using context
addProcessor('productPrice', function(price) {
  // Access context via 'this'
  const customer = this.customer;
  
  if (customer && customer.isVip) {
    // Apply VIP discount
    return price * 0.9;
  }
  
  return price;
}, 10);

// Get value with context
const finalPrice = await getValue(
  'productPrice',
  100,
  { customer: currentCustomer }
);
```

## Caching

The registry caches processed values. A cached value is returned if:
- The initialization value is identical
- The context is identical
- A value has been computed

```typescript
import { getValue } from '@evershop/evershop/lib/util/registry';

// First call - processes value
const data1 = await getValue('configData', defaultConfig, { env: 'prod' });

// Second call - returns cached value (processors not executed)
const data2 = await getValue('configData', defaultConfig, { env: 'prod' });

// Different context - processes value again
const data3 = await getValue('configData', defaultConfig, { env: 'dev' });
```

## Bootstrap Location

Processors must be registered during application bootstrap:

```typescript
// extensions/my-extension/bootstrap.ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function bootstrap() {
  addProcessor('customerData', (customer) => {
    // Add custom field
    customer.loyaltyPoints = calculatePoints(customer);
    return customer;
  });
}
```

## Notes

- Values are cached based on initialization value and context
- Processors execute in priority order (lower numbers first)
- Maximum priority is 1000
- Supports both async and sync processors
- If a processor returns `undefined`, a warning is logged
- Processors are locked after bootstrap
- Context is passed to processors via the `this` keyword

## See Also

- [getValueSync](/docs/development/module/functions/getValueSync) - Synchronous version
- [addProcessor](/docs/development/module/functions/addProcessor) - Register value processors
- [hookable](/docs/development/module/functions/hookable)
