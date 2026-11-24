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

// Emit an event of your extension
await emit('booking_created', {
  bookingId: 12345,
  customerId: 67890,
  total: 99.99,
  slots: [
    { resourceId: 1, quantity: 2 },
    { resourceId: 2, quantity: 1 }
  ]
});
```

:::note
Emit your extension's own events. Core emits its own (`order_placed`, `product_created`, ...). To mark an order placed, call [markOrderPlaced](/docs/development/module/functions/markorderplaced); never emit `order_placed` yourself.
:::

### Event Naming Convention

Use a hierarchical naming convention with underscores to separate levels:

- `order_placed` - When an order is placed (core emits it through [markOrderPlaced](/docs/development/module/functions/markorderplaced))
- `order_updated` - When an order is modified
- `order_cancelled` - When an order is canceled
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

### Booking Processing

```typescript
import { emit } from '@evershop/evershop/lib/event';

async function createBooking(bookingData) {
  // Create the booking
  const booking = await saveBooking(bookingData);
  
  // Emit event for downstream processing
  await emit('booking_created', {
    bookingId: booking.id,
    customerId: booking.customerId,
    total: booking.total,
    slots: booking.slots
  });
  
  return booking;
}
```

Event handlers can then:
- Send confirmation emails
- Reserve the resources
- Notify the staff
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
    │   └── notifyWarehouse.ts
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

const sendConfirmationEmail: EventSubscriber<'order_placed'> = async (data) => {
  // TypeScript knows the shape of data: the order row
  const { order_number, customer_email } = data;
  
  // Perform the action
  await sendEmail({
    to: customer_email,
    subject: `Order ${order_number} confirmed`,
    template: 'order-confirmation',
    data
  });
};

export default sendConfirmationEmail;
```

### Alternative: Using `createSubscriber` Helper

You can also use the `createSubscriber` helper function for a more concise syntax:

```typescript
import { createSubscriber } from '@evershop/evershop/lib/event/subscriber';
import { sendEmail } from '../../services/email';

// `createSubscriber` takes TWO required arguments: the event name, then the handler.
// The generic is inferred from the name, so there is no need to write it out.
const sendConfirmationEmail = createSubscriber('order_placed', async (data) => {
  // TypeScript automatically infers data type from 'order_placed'
  await sendEmail({
    to: data.customer_email,
    subject: 'Order Confirmation',
    orderId: data.order_id
  });
});

export default sendConfirmationEmail;
```

### Defining Event Types

Core's events are typed already. Before using typed subscribers for your own events, define their data types in an `events.d.ts` file:

```typescript
// modules/your-module/events.d.ts
declare module '@evershop/evershop/types/event' {
  interface EventDataRegistry {
    'booking_created': {
      bookingId: number;
      customerId: number;
      total: number;
      slots: Array<{ resourceId: number; quantity: number }>;
    };
    
    'booking_canceled': {
      bookingId: number;
      reason: string;
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
  await sendEmail(data.order_id);
};

export default sendConfirmationEmail;

// notifyWarehouse.ts
const notifyWarehouse: EventSubscriber<'order_placed'> = async (data) => {
  await sendToWarehouse(data.order_id);
};

export default notifyWarehouse;

// ❌ Bad - doing too much
const handleOrder: EventSubscriber<'order_placed'> = async (data) => {
  await sendEmail(data.order_id);
  await sendToWarehouse(data.order_id);
  await notifyShipping(data.order_id);
  await updateAnalytics(data);
};

export default handleOrder;
```

#### 2. Handle Errors Gracefully

Always wrap your subscriber logic in try-catch:

```typescript
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const syncToErp: EventSubscriber<'order_placed'> = async (data) => {
  try {
    await sendOrderToErp(data);
  } catch (error) {
    console.error('Failed to send the order to the ERP:', error);
    // Log to monitoring service
    await logError(error, data);
  }
};

export default syncToErp;
```

#### 3. Load Only Required Data

Don't load unnecessary data in subscribers:

```typescript
// ✅ Good - load only what's needed
const updateCustomerStats: EventSubscriber<'order_placed'> = async (data) => {
  const { customer_id, grand_total } = data;
  await incrementCustomerSpending(customer_id, grand_total);
};

export default updateCustomerStats;

// ❌ Bad - loading entire objects
const updateCustomerStatsBad: EventSubscriber<'order_placed'> = async (data) => {
  const customer = await loadFullCustomer(data.customer_id);
  const order = await loadFullOrder(data.order_id);
  await incrementCustomerSpending(customer.id, order.grand_total);
};

export default updateCustomerStatsBad;
```

### Multiple Subscribers for One Event

You can have multiple subscribers for the same event. Each subscriber file in the event folder will be executed:

```
subscribers/
└── order_placed/
    ├── sendConfirmationEmail.ts    // Executed first
    ├── notifyWarehouse.ts          // Then this
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
await emit('booking_created', {
  bookingId: 123,
  customerId: 456,
  total: 99.99,
  slots: [...]
});

// In subscriber
import { EventSubscriber } from '@evershop/evershop/lib/event/subscriber';

const handleBooking: EventSubscriber<'booking_created'> = async (data) => {
  // TypeScript knows data contains (declared in your events.d.ts):
  // {
  //   bookingId: number,
  //   customerId: number,
  //   total: number,
  //   slots: Array<...>
  // }
  console.log(data.bookingId); // 123 - TypeScript provides autocomplete!
};

export default handleBooking;
```

### Example: Complete Subscriber Implementation

Here's a real-world example of building URL rewrites when a product is created:

```typescript
// modules/catalog/subscribers/product_created/buildUrlRewrite.ts
import { insertOnUpdate, select } from '@evershop/evershop/lib/postgres/query';
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
    await insertOnUpdate('url_rewrite', ['entity_uuid'])
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
          await insertOnUpdate('url_rewrite', ['entity_uuid'])
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

## Example: Complete Booking Flow

Here's a complete example showing how an extension uses its own events in a booking flow (`booking` is a table of the extension). For an EverShop order, core and the payment method emit the order events; see [markOrderPlaced](/docs/development/module/functions/markorderplaced).

```typescript
import { emit } from '@evershop/evershop/lib/event';
import { insert, update } from '@evershop/evershop/lib/postgres/query';
import { pool } from '@evershop/evershop/lib/postgres';

export async function processBooking(bookingData) {
  // 1. Create the booking
  const result = await insert('booking')
    .given({
      customer_id: bookingData.customerId,
      total: bookingData.total,
      status: 'pending'
    })
    .execute(pool);
  
  const bookingId = result.insertId;
  
  // 2. Emit booking created event
  await emit('booking_created', {
    bookingId,
    customerId: bookingData.customerId,
    total: bookingData.total,
    slots: bookingData.slots
  });
  
  // 3. Process payment
  const paymentResult = await processPayment(bookingData.payment);
  
  if (paymentResult.success) {
    // 4. Emit payment received event
    await emit('booking_payment_received', {
      bookingId,
      amount: bookingData.total,
      transactionId: paymentResult.transactionId
    });
    
    // 5. Update booking status
    await update('booking')
      .given({ status: 'paid' })
      .where('booking_id', '=', bookingId)
      .execute(pool);
    
    // 6. Emit booking confirmed event
    await emit('booking_confirmed', {
      bookingId,
      confirmedAt: new Date().toISOString()
    });
  } else {
    // Emit payment failed event
    await emit('booking_payment_failed', {
      bookingId,
      reason: paymentResult.error
    });
  }
  
  return { bookingId, status: paymentResult.success ? 'confirmed' : 'payment_failed' };
}
```