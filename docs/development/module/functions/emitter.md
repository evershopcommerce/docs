---
sidebar_position: 5
keywords:
- Event emitter
- EverShop event system
- Event-driven architecture
- Asynchronous events
sidebar_label: Event Emitter
title: Event Emitter
description: Learn how to use the Event Emitter to emit and subscribe to events asynchronously in EverShop.
groups:
  - events
---

# Event Emitter

The Event Emitter module provides an event system for triggering and handling events asynchronously in EverShop.

## Overview

The Event Emitter stores events in a database table for asynchronous processing. Events are persisted before being handled, ensuring they are not lost if the application crashes or restarts.

### Key Features

- **Persistent Events**: Events are stored in the database before processing
- **Asynchronous Processing**: Events are handled outside the request-response cycle
- **Decoupled Architecture**: Event emitters don't need to know about event handlers
- **Reliable Delivery**: Events are processed eventually, even after failures

## Emitting Events

Import the `emit` function and call it with an event name and data object.

### Basic Usage

```typescript
import { emit } from '@evershop/evershop/lib/event';

// Emit an event
await emit('order_placed', {
  orderId: 12345,
  customerId: 67890,
  total: 99.99,
  items: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ]
});
```

### Event Naming Convention

Use a hierarchical naming convention with underscores to separate levels:

- `order_placed` - When a new order is created
- `order_updated` - When an order is modified
- `order_cancelled` - When an order is cancelled
- `customer_registered` - When a new customer signs up
- `product_created` - When a new product is added
- `inventory_updated` - When inventory levels change

### Event Data

The data object can contain any serializable data relevant to the event:

```typescript
await emit('customer_registered', {
  customerId: 123,
  email: 'customer@example.com',
  name: 'John Doe',
  registeredAt: new Date().toISOString()
});
```

## Common Use Cases

### Order Processing

```typescript
import { emit } from '@evershop/evershop/lib/event';

async function placeOrder(orderData) {
  // Create the order
  const order = await createOrder(orderData);
  
  // Emit event for downstream processing
  await emit('order_placed', {
    orderId: order.id,
    customerId: order.customerId,
    total: order.total,
    items: order.items
  });
  
  return order;
}
```

Event handlers can then:
- Send confirmation emails
- Update inventory
- Notify shipping providers
- Trigger analytics events
- Update customer loyalty points

### Customer Actions

```typescript
// User registration
await emit('customer_registered', {
  customerId: customer.id,
  email: customer.email
});

// Password reset
await emit('customer_password_reset_requested', {
  customerId: customer.id,
  resetToken: token
});

// Profile update
await emit('customer_profile_updated', {
  customerId: customer.id,
  updatedFields: ['name', 'phone']
});
```

### Product Management

```typescript
// New product
await emit('product_created', {
  productId: product.id,
  sku: product.sku,
  name: product.name
});

// Price change
await emit('product_price_updated', {
  productId: product.id,
  oldPrice: 29.99,
  newPrice: 24.99
});

// Out of stock
await emit('product_out_of_stock', {
  productId: product.id,
  sku: product.sku
});
```

## Event Processing

Events are stored in the `event` table and processed asynchronously by event handlers defined in your modules.

:::tip
Event processing happens outside the request-response cycle, so the application doesn't wait for event handlers to complete before responding to the user.
:::

## Subscribing to Events

To handle events, create subscriber functions in your module's `subscribers` directory. Subscribers are organized by event name, where each event has its own folder containing one or more subscriber files.

### Directory Structure

```
your-module/
└── subscribers/
    ├── order_placed/
    │   ├── sendConfirmationEmail.ts
    │   └── updateInventory.ts
    ├── customer_registered/
    │   └── sendWelcomeEmail.ts
    └── product_created/
        └── buildUrlRewrite.ts
```

### Creating a Subscriber

Each subscriber file exports a default async function that receives the event data. Use the `EventSubscriber` type for type safety:

```typescript
// modules/your-module/subscribers/order_placed/sendConfirmationEmail.ts
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';
import { sendEmail } from '../../services/email';
import { getOrder } from '../../services/order';

const sendConfirmationEmail: EventSubscriber<'order_placed'> = async (data) => {
  const { orderId } = data; // TypeScript knows the shape of data
  
  // Load additional data if needed
  const order = await getOrder(orderId);
  
  // Perform the action
  await sendEmail({
    to: order.customerEmail,
    subject: 'Order Confirmation',
    template: 'order-confirmation',
    data: order
  });
};

export default sendConfirmationEmail;
```

### Alternative: Using `createSubscriber` Helper

You can also use the `createSubscriber` helper function for a more concise syntax:

```typescript
import { createSubscriber } from '@evershop/evershop/lib/event/subscriber';
import { sendEmail } from '../../services/email';

const sendConfirmationEmail = createSubscriber<'order_placed'>(async (data) => {
  // TypeScript automatically infers data type from 'order_placed'
  await sendEmail({
    to: data.customerEmail,
    subject: 'Order Confirmation',
    orderId: data.orderId
  });
});

export default sendConfirmationEmail;
```

### Defining Event Types

Before using typed subscribers, define your event data types in an `events.d.ts` file:

```typescript
// modules/your-module/events.d.ts
declare module '@evershop/evershop/types/event' {
  interface EventDataRegistry {
    'order_placed': {
      orderId: number;
      customerId: number;
      total: number;
      items: Array<{ productId: number; quantity: number }>;
    };
    
    'customer_registered': {
      customerId: number;
      email: string;
      name: string;
    };
  }
}

export {};
```

Once defined, TypeScript will provide autocomplete and type checking for your event data.

### Subscriber Best Practices

#### 1. Keep Subscribers Focused

Each subscriber should handle one specific task:

```typescript
// ✅ Good - single responsibility
// sendConfirmationEmail.ts
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const sendConfirmationEmail: EventSubscriber<'order_placed'> = async (data) => {
  await sendEmail(data.orderId);
};

export default sendConfirmationEmail;

// updateInventory.ts
const updateInventory: EventSubscriber<'order_placed'> = async (data) => {
  await decrementStock(data.items);
};

export default updateInventory;

// ❌ Bad - doing too much
const handleOrder: EventSubscriber<'order_placed'> = async (data) => {
  await sendEmail(data.orderId);
  await decrementStock(data.items);
  await notifyShipping(data.orderId);
  await updateAnalytics(data);
};

export default handleOrder;
```

#### 2. Handle Errors Gracefully

Always wrap your subscriber logic in try-catch:

```typescript
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const processPayment: EventSubscriber<'order_placed'> = async (data) => {
  try {
    await processPaymentLogic(data);
  } catch (error) {
    console.error('Failed to process payment:', error);
    // Log to monitoring service
    await logError(error, data);
  }
};

export default processPayment;
```

#### 3. Load Only Required Data

Don't load unnecessary data in subscribers:

```typescript
// ✅ Good - load only what's needed
const updateCustomerStats: EventSubscriber<'order_placed'> = async (data) => {
  const { customerId, total } = data;
  await incrementCustomerSpending(customerId, total);
};

export default updateCustomerStats;

// ❌ Bad - loading entire objects
const updateCustomerStatsBad: EventSubscriber<'order_placed'> = async (data) => {
  const customer = await loadFullCustomer(data.customerId);
  const order = await loadFullOrder(data.orderId);
  await incrementCustomerSpending(customer.id, order.total);
};

export default updateCustomerStatsBad;
```

### Multiple Subscribers for One Event

You can have multiple subscribers for the same event. Each subscriber file in the event folder will be executed:

```
subscribers/
└── order_placed/
    ├── sendConfirmationEmail.ts    // Executed first
    ├── updateInventory.ts          // Then this
    ├── notifyShipping.ts           // Then this
    └── trackAnalytics.ts           // Finally this
```

:::warning
Subscribers for the same event are not guaranteed to execute in any specific order. Don't rely on execution order between subscribers.
:::

### Accessing Event Data

The event data passed to subscribers is the same object you provided when emitting the event:

```typescript
// When emitting
await emit('order_placed', {
  orderId: 123,
  customerId: 456,
  total: 99.99,
  items: [...]
});

// In subscriber
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const handleOrder: EventSubscriber<'order_placed'> = async (data) => {
  // TypeScript knows data contains:
  // {
  //   orderId: number,
  //   customerId: number,
  //   total: number,
  //   items: Array<...>
  // }
  console.log(data.orderId); // 123 - TypeScript provides autocomplete!
};

export default handleOrder;
```

### Example: Complete Subscriber Implementation

Here's a real-world example of building URL rewrites when a product is created:

```typescript
// modules/catalog/subscribers/product_created/buildUrlRewrite.ts
import { insertOnUpdate, select } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const buildUrlRewrite: EventSubscriber<'product_created'> = async (data) => {
  try {
    const { product_id, uuid, category_id } = data;
    
    // Load product description
    const productDescription = await select()
      .from('product_description')
      .where('product_description_product_id', '=', product_id)
      .load(pool);

    if (!productDescription) {
      return;
    }

    // Create URL rewrite for the product
    await insertOnUpdate('url_rewrite', ['entity_uuid', 'language'])
      .given({
        entity_type: 'product',
        entity_uuid: uuid,
        request_path: `/${productDescription.url_key}`,
        target_path: `/product/${uuid}`
      })
      .execute(pool);

    // If product has a category, create category URL rewrite
    if (category_id) {
      const category = await select()
        .from('category')
        .where('category_id', '=', category_id)
        .load(pool);

      if (category) {
        const categoryUrlRewrite = await select()
          .from('url_rewrite')
          .where('entity_uuid', '=', category.uuid)
          .and('entity_type', '=', 'category')
          .load(pool);

        if (categoryUrlRewrite) {
          await insertOnUpdate('url_rewrite', ['entity_uuid', 'language'])
            .given({
              entity_type: 'product',
              entity_uuid: uuid,
              request_path: `${categoryUrlRewrite.request_path}/${productDescription.url_key}`,
              target_path: `/product/${uuid}`
            })
            .execute(pool);
        }
      }
    }
  } catch (error) {
    console.error('Failed to build URL rewrite:', error);
  }
};

export default buildUrlRewrite;
```

## Example: Complete Order Flow

Here's a complete example showing how to use events in an order processing flow:

```typescript
import { emit } from '@evershop/evershop/lib/event';
import { insert, update } from '@evershop/postgres-query-builder';
import { pool } from '@evershop/evershop/lib/postgres';

export async function processOrder(orderData) {
  // 1. Create the order
  const result = await insert('order')
    .given({
      customer_id: orderData.customerId,
      total: orderData.total,
      status: 'pending'
    })
    .execute(pool);
  
  const orderId = result.insertId;
  
  // 2. Emit order placed event
  await emit('order_placed', {
    orderId,
    customerId: orderData.customerId,
    total: orderData.total,
    items: orderData.items,
    placedAt: new Date().toISOString()
  });
  
  // 3. Process payment
  const paymentResult = await processPayment(orderData.payment);
  
  if (paymentResult.success) {
    // 4. Emit payment received event
    await emit('order_payment_received', {
      orderId,
      amount: orderData.total,
      transactionId: paymentResult.transactionId
    });
    
    // 5. Update order status
    await update('order')
      .given({ status: 'paid' })
      .where('order_id', '=', orderId)
      .execute(pool);
    
    // 6. Emit order confirmed event
    await emit('order_confirmed', {
      orderId,
      confirmedAt: new Date().toISOString()
    });
  } else {
    // Emit payment failed event
    await emit('order_payment_failed', {
      orderId,
      reason: paymentResult.error
    });
  }
  
  return { orderId, status: paymentResult.success ? 'confirmed' : 'payment_failed' };
}
```