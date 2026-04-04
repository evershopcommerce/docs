---
sidebar_position: 124
keywords:
- deleteCoupon
- promotion
- coupon
groups:
- promotion
sidebar_label: deleteCoupon
title: deleteCoupon
description: Delete a coupon.
---

# deleteCoupon

Permanently delete a coupon by its UUID.

## Import

```typescript
import { deleteCoupon } from '@evershop/evershop/promotion/services';
```

## Syntax

```typescript
deleteCoupon(uuid: string, context?: Record<string, any>): Promise<void>
```

### Parameters

**`uuid`** — The UUID of the coupon to delete.

**`context`** (optional) — Context object passed to hooks.

## Examples

```typescript
import { deleteCoupon } from '@evershop/evershop/promotion/services';

await deleteCoupon('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

## See Also

- [createCoupon](/docs/development/module/functions/createCoupon) — Create a coupon
- [updateCoupon](/docs/development/module/functions/updateCoupon) — Update a coupon
