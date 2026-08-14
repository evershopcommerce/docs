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
        subTotal += item.getData('line_total');
      }
      return subTotal;
    }
  ],
  dependencies: ['items']  // Depends on items being calculated first
}
```

Each resolver receives the field's incoming value as its only argument and returns the new value. When several resolvers are registered for the same key they are chained — each one receives the previous one's return value.

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
    <tr><td><code>this.getData(key)</code></td><td>Get a field's current value. <strong>Throws</strong> if no field with that key is registered.</td></tr>
    <tr><td><code>this.getItems()</code></td><td>Get all cart items (an array of <code>Item</code>)</td></tr>
    <tr><td><code>this.setError(field, message)</code></td><td>Set a validation error on a field. Pass a falsy message to clear it.</td></tr>
    <tr><td><code>this.getTriggeredField()</code></td><td>Get which field triggered the recalculation</td></tr>
    <tr><td><code>this.getRequestedValue()</code></td><td>Get the value that was passed to <code>setData</code> for the triggered field</td></tr>
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
    <tr><td><code>this.setError(field, message)</code></td><td>Set a validation error</td></tr>
    <tr><td><code>this.getTriggeredField()</code></td><td>Get which field triggered the recalculation</td></tr>
    <tr><td><code>this.getRequestedValue()</code></td><td>Get the value that was passed to <code>setData</code> for the triggered field</td></tr>
    <tr><td><code>await this.getProduct()</code></td><td><strong>Async.</strong> Get the product data for this item (memoized per item)</td></tr>
    <tr><td><code>this.getCart()</code></td><td>Get the parent <code>Cart</code> object</td></tr>
  </tbody>
</table>

:::danger Do not call `setData` from inside a resolver
`setData` is **async** — `await cart.setData('customer_email', email)` — and it triggers a full rebuild of every field. Calling it from inside a resolver throws:

```bash
Can not set value when object is building
```

To change a field's value from within a resolver, simply **return** the value you want. To read the value being set, use `this.getRequestedValue()` together with `this.getTriggeredField()`:

```ts
{
  key: 'gift_message',
  resolvers: [
    async function resolver() {
      return this.getTriggeredField() === 'gift_message'
        ? this.getRequestedValue()
        : this.getData('gift_message');
    }
  ]
}
```
:::

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
            // Accept the new value when this field is the one being set,
            // otherwise keep what the cart already holds.
            return this.getTriggeredField() === 'gift_message'
              ? this.getRequestedValue() || ''
              : this.getData('gift_message') || '';
          }
        ]
      },
      {
        key: 'gift_wrap_fee',
        resolvers: [
          async function resolver() {
            return this.getData('gift_message') ? 5.0 : 0;
          }
        ],
        dependencies: ['gift_message']  // Calculate after gift_message
      }
    ]);
  });
};
```

:::warning
A resolver can only read fields that are actually registered. `this.getData('some_unregistered_key')` throws `Field some_unregistered_key not existed`. List every field you read in `dependencies` so it is guaranteed to be resolved first.
:::

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
            return this.getTriggeredField() === 'personalization_text'
              ? this.getRequestedValue() || ''
              : this.getData('personalization_text') || '';
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

The fields below are registered by core. Note that they do not all come from the `checkout` module — `coupon`, `discount_amount` and `grand_total` come from `promotion`, and the `customer_*` fields come from `customer`. If a module is disabled its fields do not exist, and `getData` on them throws.

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
    <tr><td><code>currency</code></td><td>Store currency, from <code>getStoreCurrency()</code> (admin setting → <code>shop.currency</code> config → <code>USD</code>)</td></tr>
    <tr><td><code>status</code></td><td>Cart status (<code>1</code> for an active cart)</td></tr>
    <tr><td><code>sid</code></td><td>Session ID that owns the cart</td></tr>
    <tr><td><code>user_ip</code></td><td>IP address the cart was created from</td></tr>
    <tr><td><code>created_at</code> / <code>updated_at</code></td><td>Timestamps</td></tr>
    <tr><td><code>customer_id</code></td><td>Customer reference (null for guests)</td></tr>
    <tr><td><code>customer_group_id</code></td><td>Customer group reference</td></tr>
    <tr><td><code>customer_email</code></td><td>Customer email address</td></tr>
    <tr><td><code>customer_full_name</code></td><td>Customer display name</td></tr>
    <tr><td><code>total_qty</code></td><td>Total quantity of items</td></tr>
    <tr><td><code>total_weight</code></td><td>Total weight of items</td></tr>
    <tr><td><code>packages</code></td><td>JSONB parcel proposal built from the items' package dimensions. Overridable with <code>addProcessor('cartPackages', ...)</code>.</td></tr>
    <tr><td><code>sub_total</code></td><td>Sum of all items' <code>line_total</code></td></tr>
    <tr><td><code>sub_total_incl_tax</code></td><td>Sum of all items' <code>line_total_incl_tax</code></td></tr>
    <tr><td><code>sub_total_with_discount</code></td><td>Subtotal after item discounts</td></tr>
    <tr><td><code>sub_total_with_discount_incl_tax</code></td><td>Subtotal after item discounts, including tax</td></tr>
    <tr><td><code>tax_amount</code></td><td>Tax on the items</td></tr>
    <tr><td><code>tax_amount_before_discount</code></td><td>Tax on the items before discounts are applied</td></tr>
    <tr><td><code>shipping_tax_amount</code></td><td>Tax on the shipping fee</td></tr>
    <tr><td><code>total_tax_amount</code></td><td>Item tax plus shipping tax</td></tr>
    <tr><td><code>discount_amount</code></td><td>Applied discount</td></tr>
    <tr><td><code>coupon</code></td><td>Applied coupon code</td></tr>
    <tr><td><code>grand_total</code></td><td>Final total</td></tr>
    <tr><td><code>no_shipping_required</code></td><td><code>true</code> when every item is a non-shippable (digital) product</td></tr>
    <tr><td><code>shipping_address_id</code> / <code>shipping_address</code></td><td>Shipping address reference and the loaded row</td></tr>
    <tr><td><code>billing_address_id</code> / <code>billing_address</code></td><td>Billing address reference and the loaded row</td></tr>
    <tr><td><code>shipping_method_data</code></td><td>JSONB snapshot of the selected shipping method (provider code, method code, quoted cost, fingerprint, timestamp)</td></tr>
    <tr><td><code>shipping_fee_draft</code></td><td>Shipping cost read from the <code>shipping_method_data</code> snapshot. The <code>promotion</code> module chains a second resolver onto this key that zeroes it for a free-shipping coupon — a good example of resolver chaining.</td></tr>
    <tr><td><code>shipping_fee_tax_percent</code></td><td>Tax rate applied to the shipping fee</td></tr>
    <tr><td><code>shipping_fee_excl_tax</code></td><td>Shipping cost before tax</td></tr>
    <tr><td><code>shipping_fee_incl_tax</code></td><td>Shipping cost after tax</td></tr>
    <tr><td><code>shipping_note</code></td><td>Customer's delivery note</td></tr>
    <tr><td><code>payment_method</code></td><td>Selected payment method code (validated against the available methods)</td></tr>
    <tr><td><code>payment_method_name</code></td><td>Display name of the selected payment method</td></tr>
    <tr><td><code>items</code></td><td>The cart items</td></tr>
  </tbody>
</table>

:::warning
There is **no** `shipping_method` cart field. The legacy `cart.shipping_method` / `cart.shipping_method_name` columns were dropped along with the `shipping_method` table; the selected method now lives entirely in the `shipping_method_data` JSONB field. Read the method code with `cart.getData('shipping_method_data')?.method_code`.
:::

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
    <tr><td><code>cart_id</code></td><td>Parent cart reference</td></tr>
    <tr><td><code>product_id</code></td><td>Product reference</td></tr>
    <tr><td><code>product_uuid</code></td><td>Product UUID</td></tr>
    <tr><td><code>product_sku</code></td><td>Product SKU</td></tr>
    <tr><td><code>product_name</code></td><td>Product display name</td></tr>
    <tr><td><code>group_id</code></td><td>Attribute group of the product</td></tr>
    <tr><td><code>category_id</code></td><td>Category the product belongs to</td></tr>
    <tr><td><code>thumbnail</code></td><td>Product thumbnail URL</td></tr>
    <tr><td><code>productUrl</code></td><td>Storefront URL of the product</td></tr>
    <tr><td><code>variant_group_id</code></td><td>Variant group reference</td></tr>
    <tr><td><code>variant_options</code></td><td>Selected variant options</td></tr>
    <tr><td><code>qty</code></td><td>Quantity (validated against stock)</td></tr>
    <tr><td><code>product_weight</code></td><td>Product weight</td></tr>
    <tr><td><code>package_length</code>, <code>package_width</code>, <code>package_height</code>, <code>package_weight</code></td><td>Shipping package dimensions used by the packing strategy</td></tr>
    <tr><td><code>no_shipping_required</code></td><td><code>true</code> for a non-shippable (digital) product</td></tr>
    <tr><td><code>tax_class_id</code></td><td>Tax class reference</td></tr>
    <tr><td><code>tax_percent</code></td><td>Tax percentage</td></tr>
    <tr><td><code>tax_amount</code></td><td>Item tax amount</td></tr>
    <tr><td><code>tax_amount_before_discount</code></td><td>Item tax amount before discounts</td></tr>
    <tr><td><code>product_price</code></td><td>Unit price</td></tr>
    <tr><td><code>product_price_incl_tax</code></td><td>Unit price including tax</td></tr>
    <tr><td><code>final_price</code></td><td>Unit price actually charged. Today it returns <code>product_price</code> verbatim — see the warning below.</td></tr>
    <tr><td><code>final_price_incl_tax</code></td><td><code>product_price_incl_tax</code> verbatim</td></tr>
    <tr><td><code>line_total</code></td><td>Line total: <code>final_price * qty</code></td></tr>
    <tr><td><code>line_total_incl_tax</code></td><td>Line total including tax: <code>final_price_incl_tax * qty</code></td></tr>
    <tr><td><code>discount_amount</code></td><td>Item discount</td></tr>
    <tr><td><code>line_total_with_discount</code></td><td>Line total after the item discount</td></tr>
    <tr><td><code>line_total_with_discount_incl_tax</code></td><td>Line total after the item discount, including tax</td></tr>
    <tr><td><code>removeUrl</code></td><td>URL that removes this item from the cart</td></tr>
  </tbody>
</table>

:::warning
Two naming traps here:

- There is **no** `total` cart-item field. The line total is `line_total` (and `line_total_incl_tax`).
- `final_price` is **not** "price after discounts". Its resolver returns `product_price` unchanged. Discounts are applied at the line level: read `discount_amount` and `line_total_with_discount` instead.
:::

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
