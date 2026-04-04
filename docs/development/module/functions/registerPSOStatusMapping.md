---
sidebar_position: 113
keywords:
- registerPSOStatusMapping
- PSO mapping
- order status
- OMS
groups:
- oms
sidebar_label: registerPSOStatusMapping
title: registerPSOStatusMapping
description: Register a mapping from payment+shipment status to order status.
---

# registerPSOStatusMapping

Register a PSO (Payment-Shipment-Order) mapping that determines how the order status is automatically resolved when payment or shipment status changes.

## Import

```typescript
import { registerPSOStatusMapping } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
registerPSOStatusMapping(
  paymentStatus: string | '*',
  shipmentStatus: string | '*',
  orderStatus: string
): void
```

### Parameters

**`paymentStatus`** — Payment status ID or `'*'` to match any payment status.

**`shipmentStatus`** — Shipment status ID or `'*'` to match any shipment status.

**`orderStatus`** — The order status to set when both conditions match.

## Examples

```typescript
import { registerPSOStatusMapping } from '@evershop/evershop/oms/services';

export default async () => {
  // Specific match
  registerPSOStatusMapping('paid', 'delivered', 'completed');

  // Wildcard shipment
  registerPSOStatusMapping('refunded', '*', 'closed');

  // Wildcard payment
  registerPSOStatusMapping('*', 'canceled', 'canceled');
};
```

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
