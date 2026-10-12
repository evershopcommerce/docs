---
slug: productlistaddtocart
sidebar_position: 42.5
title: ProductListAddToCart
description: The action under a product card. Add to Cart for a simple product, a link to the product page for one with variants.
keywords:
  - EverShop ProductListAddToCart
  - add to cart
  - product variants
  - select options
  - product card
  - theme development
groups:
  - components
---

# ProductListAddToCart

## Description

The action under a product card. For a simple product it is the **Add to Cart** button. For a product with variants (colour, size...) it is a **Select options** link to the product page, because the customer has to choose and a card cannot ask. Adding the card's own variant to the cart would put something in it the customer never picked.

## Role in Theming

Core's `ProductListItemRender` uses it, and a theme's own copy of that card should too. The rule "which action does this product get" then lives in one place, and your card only decides how the action looks.

`ProductList` still decides whether the action is offered at all (see [ProductList](ProductList.md#showing-or-hiding-add-to-cart)). This component decides *which* action.

## Import

```tsx
import { ProductListAddToCart, hasVariants } from '@components/frontStore/catalog/ProductListAddToCart';
```

## Usage

```tsx
<ProductListAddToCart product={product} variant="outline" className="w-full" />
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>product</td>
      <td>ProductData</td>
      <td>Yes</td>
      <td>The product the card shows. It needs <code>sku</code>, <code>inventory.isInStock</code>, <code>url</code> and <code>variantGroupId</code>.</td>
    </tr>
    <tr>
      <td>variant</td>
      <td>Button variant</td>
      <td>No</td>
      <td>The look of the button or link, one of the shared Button's variants. Both actions take the same look.</td>
    </tr>
    <tr>
      <td>size</td>
      <td>Button size</td>
      <td>No</td>
      <td>One of the shared Button's sizes.</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>No</td>
      <td>Extra classes, merged with the button classes (for example <code>w-full</code>).</td>
    </tr>
  </tbody>
</table>

## Which action a product gets

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Product</th>
      <th>Renders</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Has no variant group</td>
      <td>A <code>Button</code>, "Add to Cart" (and "Adding..." while it works). Errors show as a toast.</td>
    </tr>
    <tr>
      <td>Has no variant group and is out of stock</td>
      <td>A disabled <code>Button</code> that says "Sold out", the word the product page's own button uses.</td>
    </tr>
    <tr>
      <td>Belongs to a variant group (<code>variantGroupId</code> is set)</td>
      <td>An <code>&lt;a href=&#123;product.url&#125; data-slot="button"&gt;</code> that says "Select options", even when the card's own variant is sold out: another variant may be in stock, and the card cannot tell. It is a link because it navigates, and <code>data-slot="button"</code> keeps it styled by everything that styles buttons.</td>
    </tr>
    <tr>
      <td>Belongs to a variant group and has no <code>url</code></td>
      <td>Nothing. There is nowhere to send the customer, and adding the variant is the one thing not to do.</td>
    </tr>
  </tbody>
</table>

`hasVariants(product)` is the rule on its own: it returns `true` when `variantGroupId` is set. It is the same rule core's product resolver and its "configurable" product filter use.

## Translations

It uses four strings, all translated in every shipped locale: `Add to Cart`, `Adding...`, `Sold out` and `Select options`. A theme's own copy of the card that reuses them needs no new translation rows.

## Feeding it from your own list

The card learns that a product has variants from `variantGroupId`, a plain column of the product (unlike `variantGroup`, which runs queries per product). **Select it in the `Product` fragment of any list or widget you write**, or its cards will offer Add to Cart for products that need a choice:

```tsx
export const fragments = `
  fragment Product on Product {
    productId
    name
    sku
    variantGroupId
    price { regular { value text } special { value text } }
    inventory { isInStock }
    image { alt url }
    url
  }
`;
```

## Related Components

- [ProductList](ProductList.md) - Decides whether the action is offered
- [AddToCart](AddToCart.md) - The headless add-to-cart logic behind the button
- [ProductContext](ProductContext.md) - Product data interface
- [VariantSelector](VariantSelector.md) - Where the customer chooses on the product page

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
