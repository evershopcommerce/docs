---
sidebar_position: 110
keywords:
- registerPaymentStatus
- payment status
- OMS
groups:
- oms
sidebar_label: registerPaymentStatus
title: registerPaymentStatus
description: Register a custom payment status in the OMS system.
---

# registerPaymentStatus

Register a new payment status. Must be called during bootstrap.

## Import

```typescript
import { registerPaymentStatus } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
registerPaymentStatus(
  id: string,
  detail: PaymentStatus,
  psoMapping?: Record<string, string>
): void
```

### Parameters

**`id`** — Unique status identifier (no spaces). Example: `'stripe_captured'`.

**`detail`** — Status definition object:
- `name` (string, required) — Display name
- `badge` (string, required) — Visual style: `default`, `success`, `warning`, `critical`, `destructive`
- `isDefault` (boolean) — Initial status for new orders
- `isCancelable` (boolean) — Triggers payment cancellation logic

**`psoMapping`** (optional) — Maps `{paymentStatus}:{shipmentStatus}` → `orderStatus`. Use `*` as wildcard.

## Examples

```typescript
import { registerPaymentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  registerPaymentStatus('my_captured', {
    name: 'Captured',
    badge: 'success',
    isDefault: false,
    isCancelable: false
  }, {
    'my_captured:*': 'processing',
    'my_captured:delivered': 'completed'
  });
};
```

## See Also

- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus)
- [registerOrderStatus](/docs/development/module/functions/registerOrderStatus)
- [registerPSOStatusMapping](/docs/development/module/functions/registerPSOStatusMapping)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
