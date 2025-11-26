---
sidebar_position: 94
groups:
- checkout
title: addCartItem
hide_table_of_contents: true
keywords:
  - EverShop addCartItem
  - add to cart
  - checkout service
---

# addCartItem

## Description

Adds an item to the cart. If an item with the same SKU already exists in the cart, the quantities are merged instead of creating a duplicate item. This is a hookable service that allows extensions to hook into the add-to-cart process.

## Import

```typescript
import { addCartItem } from '@evershop/evershop/src/modules/checkout/services';
```

## Usage

```typescript
import { addCartItem } from '@evershop/evershop/src/modules/checkout/services';

const addedItem = await addCartItem(cart, productId, 2, context);
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
      <td>The cart object to which the item will be added</td>
    </tr>
    <tr>
      <td>`productID`</td>
      <td>number</td>
      <td>The ID of the product to add</td>
    </tr>
    <tr>
      <td>`qty`</td>
      <td>number \| string</td>
      <td>The quantity of the product to add</td>
    </tr>
    <tr>
      <td>`context`</td>
      <td>Record&lt;string, unknown&gt;</td>
      <td>Context object for hookable functions (optional)</td>
    </tr>
  </tbody>
</table>

## Return Value

Returns a Promise that resolves to the added or updated `Item` object.

## Example

```typescript
import { addCartItem } from '@evershop/evershop/src/modules/checkout/services';

async function addProductToCart(cart, productId, quantity) {
  try {
    const item = await addCartItem(cart, productId, quantity, {
      userId: 123,
      sessionId: 'abc123'
    });
    
    console.log('Added item:', item.getData('product_name'));
    console.log('Total quantity:', item.getData('qty'));
    return item;
  } catch (error) {
    console.error('Failed to add item:', error.message);
    throw error;
  }
}
```

## Hooks

This function is hookable. Extensions can register hooks to execute before or after adding items:

```typescript
import { hookAfter } from '@evershop/evershop/src/lib/util/hookable';
import { addCartItem } from '@evershop/evershop/src/modules/checkout/services';

hookAfter(addCartItem, async (addedItem, cart, productID, qty, context) => {
  // Track add-to-cart event for analytics
  await trackAddToCart({
    productId: productID,
    quantity: qty,
    cartId: cart.getId(),
    userId: context.userId
  });
  
  return addedItem;
});
```

## See Also

- [removeCartItem](removeCartItem.md) - Remove an item from the cart
- [updateCartItemQty](updateCartItemQty.md) - Update cart item quantity
- [saveCart](saveCart.md) - Save cart changes to the database
