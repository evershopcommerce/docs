---
sidebar_position: 64
keywords:
- saveCart
- checkout
- cart
- database
groups:
- checkout
sidebar_label: saveCart
title: saveCart
description: Save cart to database.
---

# saveCart

Save cart and its items to database.

## Import

```typescript
import { saveCart } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
saveCart(cart: Cart): Promise<number | null>
```

### Parameters

**`cart`**

**Type:** `Cart`

Cart instance to save.

## Return Value

Returns `Promise<number | null>`. Returns cart ID or `null` if cart was deleted (empty cart).

## Examples

### Save After Adding Item

```typescript
import { getMyCart, saveCart } from "@evershop/evershop/checkout/services";

const cart = await getMyCart(sessionId);

await cart.addItem(productId, 2, {});

await saveCart(cart);
```

### Save After Updating

```typescript
import { getCartByUUID, saveCart } from "@evershop/evershop/checkout/services";

const cart = await getCartByUUID(uuid);

cart.setData('coupon', 'SAVE10');

await saveCart(cart);
```

## See Also

- [getMyCart](/docs/development/module/functions/getMyCart) - Get cart
- [createNewCart](/docs/development/module/functions/createNewCart) - Create cart
