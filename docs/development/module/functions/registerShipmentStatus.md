---
sidebar_position: 111
keywords:
- registerShipmentStatus
- shipment status
- OMS
groups:
- oms
sidebar_label: registerShipmentStatus
title: registerShipmentStatus
description: Register a custom shipment status in the OMS system.
---

# registerShipmentStatus

Register a new shipment status. Must be called during bootstrap.

## Import

```typescript
import { registerShipmentStatus } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
registerShipmentStatus(
  id: string,
  detail: ShipmentStatus,
  psoMapping?: Record<string, string>
): void
```

### Parameters

**`id`** — Unique status identifier (no spaces). Example: `'in_transit'`.

**`detail`** — Status definition object:
- `name` (string, required) — Display name
- `badge` (string, required) — Visual style
- `isDefault` (boolean) — Initial status for new orders
- `isCancelable` (boolean) — Whether this status allows cancellation

**`psoMapping`** (optional) — Maps `{paymentStatus}:{shipmentStatus}` → `orderStatus`.

## Examples

```typescript
import { registerShipmentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  registerShipmentStatus('in_transit', {
    name: 'In Transit',
    badge: 'attention',
    isDefault: false
  }, {
    'paid:in_transit': 'processing'
  });
};
```

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [registerOrderStatus](/docs/development/module/functions/registerOrderStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
