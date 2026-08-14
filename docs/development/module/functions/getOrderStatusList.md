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

Returns all registered **per-shipment** statuses.

`ShipmentStatus` is now `{ name, badge, phase }` — `isDefault` and `isCancelable` were removed. `phase` is one of `'shipped' | 'delivered' | 'canceled'` and is required on every entry.

```ts
import { getShipmentStatusList } from '@evershop/evershop/oms/services';

const statuses = getShipmentStatusList();
// {
//   shipped:   { name: 'Shipped',   badge: 'warning',     phase: 'shipped' },
//   delivered: { name: 'Delivered', badge: 'success',     phase: 'delivered' },
//   canceled:  { name: 'Canceled',  badge: 'destructive', phase: 'canceled' }
// }
```

:::warning These are not the values on `Order.shipmentStatus`
This registry describes the status of an individual `shipment` row. The order-level `order.shipment_status` holds a **rollup** derived from all of the order's shipments — `pending`, `partially_shipped`, `shipped`, `partially_delivered`, `delivered`, `partially_canceled`, `canceled`. Those rollup values are not registered here and have no `phase`; their display name and badge come from `getRollupDisplay()` (overridable with `addProcessor('rollupDisplay', …)`). Looking a rollup value up in `getShipmentStatusList()` returns `undefined` for the `partially_*` cases.
:::

```ts
import { getRollupDisplay } from '@evershop/evershop/oms/services';

const display = getRollupDisplay();
console.log(display.partially_shipped); // { name: 'Partially Shipped', badge: 'warning' }
```

## Examples

```typescript
import { getPaymentStatusList } from '@evershop/evershop/oms/services';

const statuses = getPaymentStatusList();
// {
//   pending: { name: 'Pending', badge: 'default', isDefault: true, isCancelable: true },
//   paid: { name: 'Paid', badge: 'success', isCancelable: false },
//   ...
// }
```

## See Also

- [registerPaymentStatus](/docs/development/module/functions/registerPaymentStatus)
- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus)
- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
