---
sidebar_position: 80
keywords:
- createCoupon
- promotion
- coupon
- discount
groups:
- promotion
sidebar_label: createCoupon
title: createCoupon
description: Create a new coupon with discount rules and conditions.
---

# createCoupon

Create a new coupon code with discount amount, conditions, and targeting rules.

## Import

```typescript
import { createCoupon } from '@evershop/evershop/promotion/services';
```

## Syntax

```typescript
createCoupon(data: CouponData, context?: Record<string, any>): Promise<CouponRow>
```

### Parameters

**`data`**

**Type:** `CouponData`

```typescript
{
  coupon: string;              // Coupon code (required)
  status: '0' | '1' | 0 | 1;  // Active status (required)
  discount_amount: string | number; // Discount value (required)
  discount_type: string;       // e.g., 'fixed_discount_to_entire_order', 'percentage_discount_to_entire_order'
  description?: string;
  free_shipping?: '0' | '1' | 0 | 1 | boolean;
  target_products?: object;    // Product targeting conditions
  condition?: object;          // Order conditions (min total, etc.)
  max_uses_time_per_coupon?: number;
  max_uses_time_per_customer?: number;
  start_date?: string;
  end_date?: string;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object passed to hooks.

## Return Value

Returns `Promise<CouponRow>` with the created coupon data including generated `coupon_id` and `uuid`.

## Examples

### Basic Coupon

```typescript
import { createCoupon } from '@evershop/evershop/promotion/services';

const coupon = await createCoupon({
  coupon: 'SAVE10',
  status: 1,
  discount_amount: 10,
  discount_type: 'percentage_discount_to_entire_order',
  description: '10% off your order'
});
```

## Notes

- Uses hookable pattern for extensibility
- Data is validated against a JSON schema before insert
- Wrapped in a database transaction

## See Also

- [cancelOrder](/docs/development/module/functions/cancelOrder) - Cancel an order
