---
sidebar_position: 114
keywords:
- getOrderStatusList
- getPaymentStatusList
- getShipmentStatusList
- OMS
groups:
- oms
sidebar_label: getOrderStatusList
title: Status List Functions
description: Retrieve registered order, payment, and shipment status lists.
---

# Status List Functions

Retrieve all registered statuses from the OMS configuration.

## Import

```typescript
import {
  getOrderStatusList,
  getPaymentStatusList,
  getShipmentStatusList
} from '@evershop/evershop/oms/services';
```

## Functions

### getOrderStatusList

```typescript
getOrderStatusList(): Record<string, OrderStatus>
```

Returns all registered order statuses.

### getPaymentStatusList

```typescript
getPaymentStatusList(): Record<string, PaymentStatus>
```

Returns all registered payment statuses.

### getShipmentStatusList

```typescript
getShipmentStatusList(): Record<string, ShipmentStatus>
```

Returns all registered shipment statuses.

## Examples

```typescript
import { getPaymentStatusList } from '@evershop/evershop/oms/services';

const statuses = getPaymentStatusList();
// {
//   pending: { name: 'Pending', badge: 'default', isDefault: true },
//   paid: { name: 'Paid', badge: 'success' },
//   ...
// }
```

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
