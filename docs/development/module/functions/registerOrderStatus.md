---
sidebar_position: 112
keywords:
- registerOrderStatus
- order status
- OMS
groups:
- oms
sidebar_label: registerOrderStatus
title: registerOrderStatus
description: Register a custom order status with allowed transitions.
---

# registerOrderStatus

Register a new order status with its allowed state transitions. Must be called during bootstrap.

## Import

```typescript
import { registerOrderStatus } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
registerOrderStatus(id: string, detail: OrderStatus): void
```

### Parameters

**`id`** — Unique status identifier (no spaces). Example: `'on_hold'`.

**`detail`** — Status definition object:
- `name` (string, required) — Display name
- `badge` (string, required) — Visual style
- `isDefault` (boolean) — Initial status for new orders
- `next` (string[]) — Array of status IDs this status can transition to

## Examples

```typescript
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

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
