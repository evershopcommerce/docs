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
- `badge` (string, required) — Visual style: `default`, `secondary`, `success`, `warning`, `destructive`, `outline`, `ghost` or `link`
- `isDefault` (boolean, required by the type) — Initial status for new orders
- `isCancelable` (boolean) — When `false`, `cancelOrder` refuses to cancel an order in this status
- `isCapturable` (boolean) — Orders in this status can be captured (with a `capture` handler on the payment method)
- `isRefundable` (boolean) — Orders in this status can be refunded (with a `refund` handler)
- `isVoidable` (boolean) — Canceling an order in this status releases the authorization (with a `void` handler)

**`psoMapping`** (optional) — Maps `{paymentStatus}:{shipmentRollup}` → `orderStatus`. Use `*` as wildcard.

The function throws on an empty id, an id containing whitespace, and an id that is already registered. Core derives the status it sets after a capture or refund from the payment method code: `<code>_captured`, `<code>_refunded` and `<code>_partial_refunded`. Register these exact names for a method that supports those operations.

## Examples

```typescript
import { registerPaymentStatus } from '@evershop/evershop/oms/services';

export default async () => {
  // An order in this status can be refunded, so keep isRefundable on
  // the partial-refund status too.
  registerPaymentStatus('my_captured', {
    name: 'Captured',
    badge: 'success',
    isDefault: false,
    isCancelable: false,
    isRefundable: true
  }, {
    'my_captured:*': 'processing',
    'my_captured:delivered': 'completed'
  });
};
```

## See Also

- [registerPaymentMethod](/docs/development/module/functions/registerPaymentMethod)
- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus)
- [registerOrderStatus](/docs/development/module/functions/registerOrderStatus)
- [registerPSOStatusMapping](/docs/development/module/functions/registerPSOStatusMapping)
- [Order Status Management](/docs/development/knowledge-base/order-status-management)
