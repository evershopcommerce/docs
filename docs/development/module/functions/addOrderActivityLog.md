---
sidebar_position: 115
keywords:
- addOrderActivityLog
- order activity
- OMS
groups:
- oms
sidebar_label: addOrderActivityLog
title: addOrderActivityLog
description: Add an activity log entry to an order.
---

# addOrderActivityLog

Add an activity log message to an order's history. Used to track order lifecycle events (e.g., status changes, shipment creation, payment capture).

## Import

```typescript
import { addOrderActivityLog } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
addOrderActivityLog(
  orderId: number,
  message: string,
  notifyCustomer: boolean,
  connection: PoolClient
): Promise<OrderActivityRow>
```

### Parameters

**`orderId`** — The order's database ID.

**`message`** — The activity log message.

**`notifyCustomer`** — Whether the customer was notified about this activity.

**`connection`** — A database connection (PoolClient) for transaction support.

## Examples

```typescript
import { addOrderActivityLog } from '@evershop/evershop/oms/services';

await addOrderActivityLog(
  orderId,
  'Payment captured via Stripe',
  false,
  connection
);
```

## See Also

- [createShipment](/docs/development/module/functions/createShipment) — Creates a shipment (auto-logs activity)
- [cancelOrder](/docs/development/module/functions/cancelOrder) — Cancels an order
