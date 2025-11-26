---
sidebar_position: 93
title: updateCartItemQty
hide_table_of_contents: true
keywords:
  - EverShop updateCartItemQty
  - cart quantity update
  - checkout service
---

# updateCartItemQty

## Description

Updates the quantity of a cart item. This function supports both increasing and decreasing the quantity. If the quantity reaches zero during a decrease operation, the item is automatically removed from the cart. This is a hookable service that allows extensions to hook into the quantity update process.

## Import

```typescript
import { updateCartItemQty } from '@evershop/evershop/src/modules/checkout/services';
```

## Usage

```typescript
import { updateCartItemQty } from '@evershop/evershop/src/modules/checkout/services';

const updatedItem = await updateCartItemQty(cart, itemUuid, '2', 'increase', context);
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
      <td>The cart object containing the item</td>
    </tr>
    <tr>
      <td>`uuid`</td>
      <td>string</td>
      <td>The UUID of the item to update</td>
    </tr>
    <tr>
      <td>`qty`</td>
      <td>string</td>
      <td>The quantity to increase or decrease by</td>
    </tr>
    <tr>
      <td>`action`</td>
      <td>'increase' | 'decrease'</td>
      <td>The action to perform on the quantity</td>
    </tr>
    <tr>
      <td>`context`</td>
      <td>Record&lt;string, unknown&gt;</td>
      <td>Context object for hookable functions (optional)</td>
    </tr>
  </tbody>
</table>

## Return Value

Returns a Promise that resolves to the updated `Item` object.

## Example

```typescript
import { updateCartItemQty } from '@evershop/evershop/src/modules/checkout/services';

// Increase quantity by 1
async function increaseItemQty(cart, itemUuid) {
  const updatedItem = await updateCartItemQty(
    cart,
    itemUuid,
    '1',
    'increase',
    { userId: 123 }
  );
  
  console.log('New quantity:', updatedItem.getData('qty'));
  return updatedItem;
}

// Decrease quantity by 2
async function decreaseItemQty(cart, itemUuid) {
  const updatedItem = await updateCartItemQty(
    cart,
    itemUuid,
    '2',
    'decrease',
    { userId: 123 }
  );
  
  console.log('New quantity:', updatedItem.getData('qty'));
  return updatedItem;
}
```

## Hooks

This function is hookable. Extensions can register hooks to execute before or after the quantity update:

```typescript
import { hookBefore } from '@evershop/evershop/src/lib/util/hookable';
import { updateCartItemQty } from '@evershop/evershop/src/modules/checkout/services';

hookBefore(updateCartItemQty, async (cart, uuid, qty, action, context) => {
  // Validate maximum quantity before update
  const item = cart.getItem(uuid);
  const maxQty = 10;
  
  if (action === 'increase') {
    const newQty = item.getData('qty') + parseInt(qty, 10);
    if (newQty > maxQty) {
      throw new Error(`Maximum quantity is ${maxQty}`);
    }
  }
});
```

## See Also

- [addCartItem](addCartItem.md) - Add an item to the cart
- [removeCartItem](removeCartItem.md) - Remove an item from the cart
- [saveCart](saveCart.md) - Save cart changes to the database
