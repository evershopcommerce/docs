---
sidebar_position: 92
title: removeCartItem
hide_table_of_contents: true
keywords:
  - EverShop removeCartItem
  - cart item removal
  - checkout service
groups:
- checkout
---

# removeCartItem

## Description

Removes an item from the cart by its UUID. This function is a hookable service that allows extensions to hook into the cart item removal process.

## Import

```typescript
import { removeCartItem } from '@evershop/evershop/src/modules/checkout/services';
```

## Usage

```typescript
import { removeCartItem } from '@evershop/evershop/src/modules/checkout/services';

const removedItem = await removeCartItem(cart, itemUuid, context);
```

## Parameters

<table class="table table-auto">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`cart`</td>
      <td>Cart</td>
      <td>The cart object from which the item will be removed</td>
    </tr>
    <tr>
      <td>`uuid`</td>
      <td>string</td>
      <td>The UUID of the item to remove</td>
    </tr>
    <tr>
      <td>`context`</td>
      <td>Record&lt;string, unknown&gt;</td>
      <td>Context object for hookable functions</td>
    </tr>
  </tbody>
</table>

## Return Value

Returns a Promise that resolves to the removed `Item` object.

## Example

```typescript
import { removeCartItem } from '@evershop/evershop/src/modules/checkout/services';

async function handleRemoveItem(cart, itemUuid) {
  try {
    const removedItem = await removeCartItem(cart, itemUuid, {
      userId: 123,
      sessionId: 'abc123'
    });
    
    console.log('Removed item:', removedItem.getData('product_name'));
    return removedItem;
  } catch (error) {
    console.error('Failed to remove item:', error.message);
    throw error;
  }
}
```

## Hooks

This function is hookable. Extensions can register hooks to execute before or after the item removal:

```typescript
import { hookAfter } from '@evershop/evershop/src/lib/util/hookable';
import { removeCartItem } from '@evershop/evershop/src/modules/checkout/services';

hookAfter(removeCartItem, async (removedItem, cart, uuid, context) => {
  // Log the removal for analytics
  await logCartItemRemoval(cart.getId(), removedItem.getData('product_sku'));
  return removedItem;
});
```

## See Also

- [addCartItem](addCartItem.md) - Add an item to the cart
- [updateCartItemQty](updateCartItemQty.md) - Update cart item quantity
- [saveCart](saveCart.md) - Save cart changes to the database
