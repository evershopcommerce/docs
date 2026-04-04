---
sidebar_position: 123
keywords:
- updateCoupon
- promotion
- coupon
groups:
- promotion
sidebar_label: updateCoupon
title: updateCoupon
description: Update an existing coupon.
---

# updateCoupon

Update an existing coupon's discount rules, conditions, or status.

## Import

```typescript
import { updateCoupon } from '@evershop/evershop/promotion/services';
```

## Syntax

```typescript
updateCoupon(uuid: string, data: Partial<CouponData>, context?: Record<string, any>): Promise<CouponRow>
```

### Parameters

**`uuid`** — The UUID of the coupon to update.

**`data`** — Coupon fields to update (all optional):
- `coupon` — Coupon code
- `status` — Active status (`0` or `1`)
- `discount_amount` — Discount value
- `discount_type` — Discount type
- `description`, `free_shipping`, `start_date`, `end_date`, etc.

**`context`** (optional) — Context object passed to hooks.

## Examples

```typescript
import { updateCoupon } from '@evershop/evershop/promotion/services';

await updateCoupon('a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  discount_amount: 15,
  status: 1
});
```

## See Also

- [createCoupon](/docs/development/module/functions/createCoupon) — Create a coupon
