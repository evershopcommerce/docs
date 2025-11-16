---
sidebar_position: 62
keywords:
- getCartByUUID
- checkout
- cart
groups:
- checkout
sidebar_label: getCartByUUID
title: getCartByUUID
description: Get cart by UUID.
---

# getCartByUUID

Get a cart by its UUID.

## Import

```typescript
import { getCartByUUID } from "@evershop/evershop/checkout/services";
```

## Syntax

```typescript
getCartByUUID(uuid: string): Promise<Cart>
```

### Parameters

**`uuid`**

**Type:** `string`

Cart UUID.

## Return Value

Returns `Promise<Cart>` with cart instance.

## Examples

### Basic Usage

```typescript
import { getCartByUUID } from "@evershop/evershop/checkout/services";

const cart = await getCartByUUID('cart-uuid-123');
console.log(`Cart has ${cart.getItems().length} items`);
```

## See Also

- [getMyCart](/docs/development/module/functions/getMyCart) - Get cart by session
- [createNewCart](/docs/development/module/functions/createNewCart) - Create new cart
