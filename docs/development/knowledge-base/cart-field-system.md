---
sidebar_position: 43
keywords:
  - cart fields
  - cart item fields
  - custom cart data
  - checkout customization
sidebar_label: Cart Field System
title: Cart Field System
description: Learn how EverShop's cart field system works and how to add custom fields to carts and cart items.
---

# Cart Field System

The cart field system is the foundation of EverShop's checkout logic. Every piece of data on a cart — from the subtotal and tax amount to the shipping address and coupon code — is defined as a **field** with its own calculation logic. Extensions can add new fields to inject custom data or business logic into the cart.

## How Cart Fields Work

Each cart field is an object with three properties:

```typescript
{
  key: string;                    // Field name (e.g., 'sub_total', 'tax_amount')
  resolvers: Function[];          // Array of functions that calculate the field's value
  dependencies?: string[];        // Other fields this field depends on
}
```

When the cart is loaded or updated, EverShop:

1. Sorts fields by their dependencies (topological sort).
2. For each field, runs its resolvers in order.
3. The final resolver's return value becomes the field's value.

### Field Resolvers

Resolvers are functions that calculate a field's value. Inside a resolver, `this` gives you access to the cart (or cart item) data:

```typescript
{
  key: 'sub_total',
  resolvers: [
    async function resolver() {
      // Access cart data via 'this'
      const items = this.getItems();
      let subTotal = 0;
      for (const item of items) {
        subTotal += item.getData('final_price') * item.getData('qty');
      }
      return subTotal;
    }
  ],
  dependencies: ['items']  // Depends on items being calculated first
}
```

### Context Methods Available in Resolvers

Inside a cart field resolver, `this` provides:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>this.getData(key)</code></td><td>Get a field's current value</td></tr>
    <tr><td><code>this.setData(key, value)</code></td><td>Set a field's value</td></tr>
    <tr><td><code>this.getItems()</code></td><td>Get all cart items</td></tr>
    <tr><td><code>this.setError(field, message)</code></td><td>Set a validation error on a field</td></tr>
    <tr><td><code>this.getTriggeredField()</code></td><td>Get which field triggered the recalculation</td></tr>
  </tbody>
</table>

Inside a cart item field resolver, `this` provides:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>this.getData(key)</code></td><td>Get the item field's current value</td></tr>
    <tr><td><code>this.setData(key, value)</code></td><td>Set an item field's value</td></tr>
    <tr><td><code>this.setError(field, message)</code></td><td>Set a validation error</td></tr>
    <tr><td><code>this.getProduct()</code></td><td>Get the product data for this item</td></tr>
  </tbody>
</table>

## Adding Custom Cart Fields

Register custom cart fields in your extension's `bootstrap.ts` using the `cartFields` processor:

```ts title="extensions/my-ext/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  addProcessor('cartFields', (fields) => {
    return fields.concat([
      {
        key: 'gift_message',
        resolvers: [
          async function resolver() {
            // Return existing value or empty string
            return this.getData('gift_message') || '';
          }
        ]
      },
      {
        key: 'gift_wrap_fee',
        resolvers: [
          async function resolver() {
            const hasGiftWrap = this.getData('gift_wrap');
            return hasGiftWrap ? 5.00 : 0;
          }
        ],
        dependencies: ['sub_total']  // Calculate after subtotal
      }
    ]);
  });
};
```

## Adding Custom Cart Item Fields

Similarly, use the `cartItemFields` processor:

```ts title="extensions/my-ext/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  addProcessor('cartItemFields', (fields) => {
    return fields.concat([
      {
        key: 'personalization_text',
        resolvers: [
          async function resolver() {
            return this.getData('personalization_text') || '';
          }
        ]
      }
    ]);
  });
};
```

## Field Dependencies

The `dependencies` array ensures fields are calculated in the correct order. If field B depends on field A, field A is always calculated first:

```typescript
// Calculated first
{ key: 'sub_total', resolvers: [...] }

// Calculated second (depends on sub_total)
{ key: 'discount_amount', resolvers: [...], dependencies: ['sub_total'] }

// Calculated third (depends on both)
{ key: 'grand_total', resolvers: [...], dependencies: ['sub_total', 'discount_amount'] }
```

:::warning
Circular dependencies (A depends on B, B depends on A) will cause an error during cart calculation.
:::

## Built-in Cart Fields

EverShop registers these cart fields by default:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>cart_id</code></td><td>Database ID</td></tr>
    <tr><td><code>uuid</code></td><td>Unique cart identifier</td></tr>
    <tr><td><code>currency</code></td><td>Cart currency from config</td></tr>
    <tr><td><code>customer_email</code></td><td>Customer email address</td></tr>
    <tr><td><code>sub_total</code></td><td>Sum of all item prices</td></tr>
    <tr><td><code>sub_total_incl_tax</code></td><td>Subtotal including tax</td></tr>
    <tr><td><code>tax_amount</code></td><td>Calculated tax</td></tr>
    <tr><td><code>discount_amount</code></td><td>Applied discount</td></tr>
    <tr><td><code>grand_total</code></td><td>Final total</td></tr>
    <tr><td><code>shipping_fee_excl_tax</code></td><td>Shipping cost before tax</td></tr>
    <tr><td><code>shipping_fee_incl_tax</code></td><td>Shipping cost after tax</td></tr>
    <tr><td><code>shipping_method</code></td><td>Selected shipping method code</td></tr>
    <tr><td><code>payment_method</code></td><td>Selected payment method code</td></tr>
    <tr><td><code>coupon</code></td><td>Applied coupon code</td></tr>
    <tr><td><code>total_qty</code></td><td>Total quantity of items</td></tr>
    <tr><td><code>total_weight</code></td><td>Total weight of items</td></tr>
  </tbody>
</table>

## Built-in Cart Item Fields

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>cart_item_id</code></td><td>Database ID</td></tr>
    <tr><td><code>uuid</code></td><td>Unique item identifier</td></tr>
    <tr><td><code>product_id</code></td><td>Product reference</td></tr>
    <tr><td><code>product_sku</code></td><td>Product SKU</td></tr>
    <tr><td><code>product_name</code></td><td>Product display name</td></tr>
    <tr><td><code>qty</code></td><td>Quantity (validated against stock)</td></tr>
    <tr><td><code>product_price</code></td><td>Unit price</td></tr>
    <tr><td><code>final_price</code></td><td>Price after discounts</td></tr>
    <tr><td><code>tax_percent</code></td><td>Tax percentage</td></tr>
    <tr><td><code>tax_amount</code></td><td>Item tax amount</td></tr>
    <tr><td><code>discount_amount</code></td><td>Item discount</td></tr>
    <tr><td><code>total</code></td><td>Line total (qty * final_price)</td></tr>
  </tbody>
</table>

## Stock Validation

Cart item fields automatically validate quantities against product inventory:

- If `manage_stock` is enabled and `qty` exceeds available stock, an error is set on the item.
- If the product is out of stock, an error is set immediately.
- These errors are tracked per-item and can be queried.

## See Also

- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — How field registration works
- [Extension Development](/docs/development/module/extension-development) — Creating extensions
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — Custom payment methods

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
