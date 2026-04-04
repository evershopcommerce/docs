---
sidebar_position: 82
keywords:
- createShipment
- oms
- order
- shipment
- fulfillment
groups:
- oms
sidebar_label: createShipment
title: createShipment
description: Create a shipment for an order.
---

# createShipment

Create a shipment record for an order, optionally specifying a carrier and tracking number.

## Import

```typescript
import { createShipment } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
createShipment(
  orderUuid: string,
  carrier: string | null,
  trackingNumber: string | null,
  connection?: PoolClient
): Promise<ShipmentRow>
```

### Parameters

**`orderUuid`**

**Type:** `string`

The UUID of the order to create a shipment for.

**`carrier`**

**Type:** `string | null`

The shipping carrier name (e.g., 'fedex', 'ups'). Pass `null` if not applicable.

**`trackingNumber`**

**Type:** `string | null`

The shipment tracking number. Pass `null` if not available yet.

**`connection`**

**Type:** `PoolClient` (optional)

An existing database connection. If not provided, a new connection is created.

## Return Value

Returns `Promise` with the created shipment data.

## Examples

### Basic Shipment

```typescript
import { createShipment } from '@evershop/evershop/oms/services';

const shipment = await createShipment(
  '7afebbbd-69f6-4e2c-84c5-5b899173b867',
  'fedex',
  '1234567890'
);
```

### Within a Transaction

```typescript
import { createShipment } from '@evershop/evershop/oms/services';
import { getConnection, startTransaction, commit, rollback } from '@evershop/postgres-query-builder';

const connection = await getConnection();
await startTransaction(connection);

try {
  const shipment = await createShipment(orderUuid, 'ups', trackingNum, connection);
  await commit(connection);
} catch (e) {
  await rollback(connection);
  throw e;
}
```

## Notes

- Automatically logs an order activity entry
- Updates shipment status after creation
- Uses hookable pattern for extensibility

## See Also

- [cancelOrder](/docs/development/module/functions/cancelOrder) - Cancel an order
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) - Update shipment status
