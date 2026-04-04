---
sidebar_position: 42
keywords:
  - order status
  - payment status
  - shipment status
  - order lifecycle
  - OMS
sidebar_label: Order Status Management
title: Order Status Management
description: Understand how EverShop manages order, payment, and shipment statuses, including state transitions and custom status definitions.
---

# Order Status Management

EverShop uses a three-dimensional status system to track orders. Each order has three independent statuses that together determine the overall order state:

1. **Payment Status** — Tracks the state of payment (e.g., `pending`, `paid`, `refunded`).
2. **Shipment Status** — Tracks the state of fulfillment (e.g., `pending`, `shipped`, `delivered`).
3. **Order Status** — The overall status, automatically resolved from the combination of payment and shipment statuses.

## How Order Status Is Resolved

When either the payment status or shipment status changes, EverShop automatically resolves the new order status using a **PSO (Payment-Shipment-Order) mapping**. This mapping defines which order status corresponds to each combination of payment and shipment statuses.

```
Payment Status Change → PSO Mapping Lookup → Order Status Update
Shipment Status Change → PSO Mapping Lookup → Order Status Update
```

This means you typically never set the order status directly. Instead, you update the payment or shipment status, and the order status follows automatically.

## Configuring Statuses

All statuses are defined in your configuration files.

### Order Status

```json title="config/default.json"
{
  "oms": {
    "order": {
      "status": {
        "new": {
          "name": "New",
          "badge": "default",
          "progress": "incomplete",
          "isDefault": true,
          "next": ["processing", "canceled"]
        },
        "processing": {
          "name": "Processing",
          "badge": "default",
          "progress": "incomplete",
          "next": ["completed", "canceled"]
        },
        "completed": {
          "name": "Completed",
          "badge": "success",
          "progress": "complete",
          "next": ["closed"]
        },
        "canceled": {
          "name": "Canceled",
          "badge": "critical",
          "progress": "complete",
          "next": []
        }
      }
    }
  }
}
```

Each status has:
- **`name`** — Display name in the admin panel.
- **`badge`** — Visual style (`default`, `success`, `attention`, `critical`).
- **`progress`** — Whether the order is `incomplete` or `complete`.
- **`isDefault`** — Whether this is the initial status for new orders.
- **`next`** — Array of statuses this status can transition to. An empty array means the status is final.

### Payment Status

```json
{
  "oms": {
    "order": {
      "paymentStatus": {
        "pending": {
          "name": "Pending",
          "badge": "default",
          "isDefault": true
        },
        "paid": {
          "name": "Paid",
          "badge": "success"
        },
        "failed": {
          "name": "Failed",
          "badge": "critical"
        }
      }
    }
  }
}
```

### Shipment Status

```json
{
  "oms": {
    "order": {
      "shipmentStatus": {
        "pending": {
          "name": "Pending",
          "badge": "default",
          "isDefault": true
        },
        "shipped": {
          "name": "Shipped",
          "badge": "attention"
        },
        "delivered": {
          "name": "Delivered",
          "badge": "success"
        }
      }
    }
  }
}
```

## PSO Mapping

The PSO mapping connects payment and shipment statuses to order statuses:

```json
{
  "oms": {
    "order": {
      "psoMapping": {
        "paid:delivered": "completed",
        "paid:shipped": "processing",
        "paid:pending": "processing",
        "pending:*": "new",
        "failed:*": "canceled",
        "*:*": "new"
      }
    }
  }
}
```

The format is `{paymentStatus}:{shipmentStatus}`. The `*` wildcard matches any status. Mappings are checked in this order:
1. Exact match: `paid:delivered`
2. Wildcard shipment: `paid:*`
3. Wildcard payment: `*:delivered`
4. Double wildcard: `*:*`

## Registering Custom Statuses

EverShop provides dedicated functions to register custom statuses programmatically from your extension's `bootstrap.ts`. All functions are imported from `@evershop/evershop/oms/services`.

### Register a Payment Status

```ts title="extensions/my-payment/src/bootstrap.ts"
import { registerPaymentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  // Register with inline PSO mapping
  registerPaymentStatus('my_gateway_authorized', {
    name: 'Authorized',
    badge: 'warning',
    isDefault: false,
    isCancelable: true
  }, {
    'my_gateway_authorized:*': 'processing'
  });

  registerPaymentStatus('my_gateway_captured', {
    name: 'Captured',
    badge: 'success',
    isDefault: false,
    isCancelable: false
  }, {
    'my_gateway_captured:*': 'processing',
    'my_gateway_captured:delivered': 'completed'
  });

  registerPaymentStatus('my_gateway_refunded', {
    name: 'Refunded',
    badge: 'destructive',
    isDefault: false,
    isCancelable: false
  }, {
    'my_gateway_refunded:*': 'closed'
  });
};
```

**Signature:**

```typescript
registerPaymentStatus(
  id: string,                              // Unique status ID (no spaces)
  detail: PaymentStatus,                   // Status properties
  psoMapping?: Record<string, string>      // Optional PSO mappings
): void
```

### Register a Shipment Status

```ts title="extensions/my-fulfillment/src/bootstrap.ts"
import { registerShipmentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  registerShipmentStatus('in_transit', {
    name: 'In Transit',
    badge: 'attention',
    isDefault: false
  }, {
    'paid:in_transit': 'processing'
  });

  registerShipmentStatus('out_for_delivery', {
    name: 'Out for Delivery',
    badge: 'warning',
    isDefault: false
  });
};
```

**Signature:**

```typescript
registerShipmentStatus(
  id: string,                              // Unique status ID (no spaces)
  detail: ShipmentStatus,                  // Status properties
  psoMapping?: Record<string, string>      // Optional PSO mappings
): void
```

### Register an Order Status

```ts title="extensions/my-ext/src/bootstrap.ts"
import { registerOrderStatus } from '@evershop/evershop/oms/services';

export default async () => {
  registerOrderStatus('on_hold', {
    name: 'On Hold',
    badge: 'attention',
    isDefault: false,
    next: ['processing', 'canceled']
  });
};
```

**Signature:**

```typescript
registerOrderStatus(
  id: string,                              // Unique status ID (no spaces)
  detail: OrderStatus                      // Status properties including 'next' transitions
): void
```

### Register PSO Mappings Separately

Use `registerPSOStatusMapping()` to add individual mappings without registering a new status:

```ts
import { registerPSOStatusMapping } from '@evershop/evershop/oms/services';

export default async () => {
  registerPSOStatusMapping('my_gateway_captured', 'delivered', 'completed');
  registerPSOStatusMapping('my_gateway_refunded', '*', 'closed');
};
```

**Signature:**

```typescript
registerPSOStatusMapping(
  paymentStatus: string | '*',    // Payment status ID or '*' for any
  shipmentStatus: string | '*',   // Shipment status ID or '*' for any
  orderStatus: string             // Resulting order status
): void
```

### Reading Status Lists

Retrieve all registered statuses at runtime:

```ts
import {
  getOrderStatusList,
  getPaymentStatusList,
  getShipmentStatusList
} from '@evershop/evershop/oms/services';

const orderStatuses = getOrderStatusList();
const paymentStatuses = getPaymentStatusList();
const shipmentStatuses = getShipmentStatusList();
```

### Alternative: JSON Configuration

You can also define statuses in config files. This is useful for store-level customization rather than extensions:

```json title="config/default.json"
{
  "oms": {
    "order": {
      "paymentStatus": {
        "my_custom_status": {
          "name": "Custom Status",
          "badge": "attention"
        }
      },
      "psoMapping": {
        "my_custom_status:*": "processing"
      }
    }
  }
}
```

### Status Properties

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td><code>string</code></td><td>Display name in the admin panel (required)</td></tr>
    <tr><td><code>badge</code></td><td><code>string</code></td><td>Visual style: <code>default</code>, <code>success</code>, <code>warning</code>, <code>attention</code>, <code>critical</code>, <code>destructive</code>, <code>outline</code> (required)</td></tr>
    <tr><td><code>isDefault</code></td><td><code>boolean</code></td><td>Whether this is the initial status for new orders</td></tr>
    <tr><td><code>isCancelable</code></td><td><code>boolean</code></td><td>When <code>true</code>, entering this status can trigger payment cancellation logic</td></tr>
    <tr><td><code>next</code></td><td><code>string[]</code></td><td>(Order status only) Allowed transitions from this status</td></tr>
  </tbody>
</table>

### Reacting to Payment Status Changes

Hook into `changePaymentStatus` to perform actions when a payment status changes (e.g., cancel an authorization):

```ts title="extensions/my-payment/src/bootstrap.ts"
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

export default async () => {
  hookAfter('changePaymentStatus', async (order, orderId, status) => {
    if (status !== 'canceled') return;
    if (order.payment_method !== 'my_gateway') return;

    await myProvider.cancelPayment(orderId);
  });
};
```

## Updating Statuses Programmatically

### Update Payment Status

```ts
import { updatePaymentStatus } from '@evershop/evershop/oms/services';

await updatePaymentStatus(orderId, 'paid', connection);
// This automatically triggers order status resolution
```

### Update Shipment Status

```ts
import { updateShipmentStatus } from '@evershop/evershop/oms/services';

await updateShipmentStatus(orderId, 'shipped', connection);
// This automatically triggers order status resolution
```

### The `order_status_updated` Event

When the order status changes, an `order_status_updated` event is emitted:

```ts
// Event data:
{
  orderId: number;
  before: string;  // Previous order status
  after: string;   // New order status
}
```

You can subscribe to this event to trigger custom logic (e.g., send a notification email):

```ts title="extensions/my-ext/src/subscribers/order_status_updated/notify.ts"
export default async function (data) {
  if (data.after === 'completed') {
    // Send order completion email
  }
}
```

## See Also

- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — How to build payment gateways
- [Configuration Guide](/docs/development/knowledge-base/configuration-guide) — OMS configuration reference
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — React to status changes

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
