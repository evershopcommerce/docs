---
sidebar_position: 69
keywords:
  - analytics
  - tracking
  - pixel
  - commerce events
sidebar_label: Commerce Events (Browser)
title: Commerce Events (Browser)
description: "Listen to the storefront's shopping events in the browser (product viewed, added to cart, checkout completed) to send them to Google Analytics, Meta, TikTok, Klaviyo or any other tracking tool."
---

# Commerce Events (Browser)

The storefront publishes shopping events in the browser: a product is viewed, a product is added to the cart, the checkout starts, an order is completed, and so on. Tracking code listens to them and sends them to its service (Google Analytics 4, Meta Pixel, TikTok, Klaviyo, ...).

These are browser events. They are separate from the server [events and subscribers](./events-and-subscribers), which run in the server's event process.

## Listen to an event

In an extension or theme component:

```tsx
import { onCommerceEvent } from '@evershop/evershop/components/common/commerceEvents';
import React from 'react';

export default function MetaPixelEvents() {
  React.useEffect(() => {
    const stop = onCommerceEvent('product_added_to_cart', (event) => {
      const { currency, value, items } = event.data;
      window.fbq?.(
        'track',
        'AddToCart',
        {
          currency,
          value,
          content_type: 'product',
          contents: items.map((item) => ({ id: item.sku, quantity: item.qty }))
        },
        { eventID: event.id }
      );
    });
    return stop;
  }, []);
  return null;
}

export const layout = {
  areaId: 'body',
  sortOrder: 50
};
```

`onCommerceEvent(name, handler, options)` returns a function that stops listening. Use `'*'` as the name to receive every event.

A script that is not part of the storefront bundle (Google Tag Manager, for example) uses the same function on `window`:

```js
window.evershop.onCommerceEvent('checkout_completed', function (event) {
  // ...
});
```

`window.evershop.onCommerceEvent` exists on every storefront page from the top of the `<head>`, so a script in the head can call it at once. Until the page's JavaScript loads, the calls are queued; then they receive the page's events as they happen. Add such a script without `async`, or check that `window.evershop` exists first: an `async` script can run before the rest of the head.

### How events are delivered

- **After the page updates.** A listener runs at background priority, after the browser has painted the change (the cart updated, the mini cart opened), each listener in its own task. Slow tracking code does not make the store feel slow.
- **Late listeners get earlier events.** The page's last 50 events are kept. A listener that starts after an event happened, such as a pixel that loads late, receives it with `replayed: true`. Pass `{ replay: false }` to receive only new events.
- **A failing listener does not stop the others.** Its error is logged in the console.
- **Before leaving the page**, pending events are delivered at once.
- **Keep listeners short.** A listener still runs on the page's main thread. A slow one freezes animations running at that moment, and a slow listener on an event published just before the page changes (`payment_info_submitted`) delays the next page, because the old page waits for it. Send data with `navigator.sendBeacon` or `fetch(..., { keepalive: true })`.
- **Events are frozen.** A listener cannot change what the next listener receives.

## The event object

```ts
{
  id: string;          // unique; the order uuid for checkout_completed
  name: string;        // 'product_added_to_cart'
  version: 1;
  timestamp: string;   // ISO 8601
  seq: number;         // the event's number on this page, from 1
  replayed: boolean;
  context: { url: string; referrer: string; title: string; language: string };
  data: { ... }        // see below
}
```

Send `event.id` as the service's event id (Meta `eventID`, TikTok and Pinterest `event_id`). If you also send the same event from the server, the service then counts it once.

## Events

<table className="table-auto not-prose">
  <thead>
    <tr><th>Event</th><th>When</th><th>Data</th></tr>
  </thead>
  <tbody>
    <tr><td><code>product_viewed</code></td><td>A product page is shown, and again when the shopper picks another variant</td><td><code>currency, value, taxIncluded, items</code> (one item)</td></tr>
    <tr><td><code>product_added_to_cart</code></td><td>A product is added, or a cart line's quantity goes up</td><td><code>currency, value, items</code> (the line, <code>qty</code> = the quantity added), <code>lineQty, previousLineQty, cart</code></td></tr>
    <tr><td><code>product_removed_from_cart</code></td><td>A line is removed, or its quantity goes down</td><td>Same as above, <code>qty</code> = the quantity removed</td></tr>
    <tr><td><code>cart_viewed</code></td><td>The cart page is shown</td><td>The cart</td></tr>
    <tr><td><code>coupon_applied</code>, <code>coupon_removed</code></td><td>A coupon is applied or removed</td><td><code>coupon, cart</code></td></tr>
    <tr><td><code>checkout_started</code></td><td>The checkout page is shown</td><td>The cart</td></tr>
    <tr><td><code>checkout_contact_info_submitted</code></td><td>The checkout has the shopper's email. A guest: the email is saved to the cart when the shopper leaves the email field after entering a valid email, or the browser fills it in. A logged-in customer: the checkout page is shown, right after <code>checkout_started</code></td><td>The cart (no email), <code>loggedIn</code></td></tr>
    <tr><td><code>checkout_shipping_info_submitted</code></td><td>A shipping method is chosen</td><td>The cart, <code>{'shippingMethod: { code, name }'}</code> (<code>code</code> is an id; send <code>name</code> as GA4's <code>shipping_tier</code>)</td></tr>
    <tr><td><code>payment_info_submitted</code></td><td>The order is submitted with its payment method</td><td>The cart, <code>{'paymentMethod: { code, name }'}</code></td></tr>
    <tr><td><code>checkout_completed</code></td><td>The order success page is shown, once per order in a browser</td><td><code>orderId, orderNumber, placed, paymentStatus, currency, value, tax, shipping, discount, total, coupon, items</code></td></tr>
  </tbody>
</table>

A quantity change from 2 to 5 is `product_added_to_cart` with `qty: 3`. There is no separate "quantity updated" event, because no tracking service has one.

`checkout_contact_info_submitted` tells you that the checkout now has an email, for every shopper:

- A guest: once per new email (the same email again sends nothing). The checkout saves the email to the cart at that moment, before the order, so the cart keeps it if the shopper leaves. `loggedIn` is `false`.
- A logged-in customer: their cart has the account email from the start, so the event comes right after `checkout_started`, once per cart and customer in a browser session (a reload sends nothing). `loggedIn` is `true`; skip these if you only want emails the shopper typed.
- A guest who logs in at checkout gets both: `loggedIn: false` for the email they typed, then `loggedIn: true` after the login.

The event does not carry the email, because every listener on the page would receive it.

The cart in these events is:

```ts
{ cartId: string; currency: string; value: number; coupon?: string; totalQty: number; items: CommerceItem[] }
```

`cartId` is an empty string when there is no cart: none yet, or its last item was removed.

### Items and amounts

Amounts follow Google Analytics 4: `value` is the sum of (price − discount) × quantity, **without tax and without shipping**, rounded to the currency's smallest unit (cents for USD). An item's `discount` is per unit and rounded on its own, so adding up the items can give a little more or less than `value`: up to half a cent per unit for USD, so a few cents on a large quantity. `value` matches the order. `checkout_completed` gives `tax`, `shipping` and the `total` the customer pays separately.

:::note
On a store whose catalog prices include tax, amounts before the shopper gives an address include tax: there is no tax rate to take out yet. The events report the cart as it is. To have amounts without tax from the start, set the tax calculation address to the store address in the tax settings.
:::

```ts
interface CommerceItem {
  productId: number;
  variantGroupId: number | null;
  sku: string;          // the variant's own SKU
  name: string;
  variant?: string;     // "Red / M"
  qty: number;
  price: number;        // unit price, without tax, before discount
  priceInclTax?: number;
  discount: number;     // discount per unit, without tax
  url?: string;         // absolute
  image?: string;       // absolute
  categories?: string[]; // the product's category, when it has one
}
```

- Use `sku` as the product id when your service matches products with a product feed (Meta, TikTok, Pinterest, Google Merchant Center). Your feed must use the same SKUs.
- On `product_viewed`, `price` is the catalog price as entered. When the store's catalog prices include tax, `taxIncluded` is `true`.
- Use the product name from `items`, not `context.title`: the page title can stay the same after the shopper picks another variant.

### `checkout_completed`

- It is published once per order in a browser: a reload of the success page publishes nothing.
- `placed` tells whether the order is placed (payment accepted, or a payment method that needs no payment up front). Some payment methods confirm the payment after the success page loads, Stripe for example. `placed: false` therefore does not mean the payment failed.

:::warning
Any script on a page can publish a browser event. Do not use these events as the record of a sale. The server's `order_placed` event is that record.
:::

## Add your own events

Publish an event with a prefixed name, and declare its data type:

```ts
import { dispatchCommerceEvent } from '@evershop/evershop/components/common/commerceEvents';

declare module '@evershop/evershop/types/commerceEvents' {
  interface CommerceEventDataRegistry {
    'myextension:quiz_completed': { answers: number };
  }
}

dispatchCommerceEvent('myextension:quiz_completed', { answers: 5 });
```

Import the bus from `@evershop/evershop/components/common/commerceEvents`, as above: there is one bus per page, and themes and extensions cannot replace it. Do not copy the bus file into your extension.

In TypeScript, `window.evershop.onCommerceEvent` is typed once your code imports the bus or its types. In a file that uses only `window.evershop`, add `import type {} from '@evershop/evershop/types/commerceEvents';`. The type check of your data needs the type files of `@evershop/evershop`, which the published package has.

The data of the core events is fixed: an extension cannot add fields to it.

## Google Analytics 4

EverShop sends these events to Google Analytics 4 (GA4) itself. Enter your Measurement ID (`G-…`) in **Setting → Store Setting → Analytics**. Without a valid ID, nothing is loaded and nothing is sent. You find the ID in Google Analytics under **Admin → Data streams → your web stream**. The `GTM-…` ID on Google's "Set up a Google tag" screen is a different ID: the field refuses it.

EverShop adds the Google tag to the store pages itself. Do not also paste the install code that Google shows when you create the data stream, for example in `themeConfig.headTags`: the page would then have two Google tags for the same property, and GA4 can count page views and events twice.

<table className="table-auto not-prose">
  <thead>
    <tr><th>Commerce event</th><th>GA4 event</th></tr>
  </thead>
  <tbody>
    <tr><td><code>product_viewed</code></td><td><code>view_item</code></td></tr>
    <tr><td><code>product_added_to_cart</code></td><td><code>add_to_cart</code></td></tr>
    <tr><td><code>product_removed_from_cart</code></td><td><code>remove_from_cart</code></td></tr>
    <tr><td><code>cart_viewed</code></td><td><code>view_cart</code></td></tr>
    <tr><td><code>checkout_started</code></td><td><code>begin_checkout</code></td></tr>
    <tr><td><code>checkout_shipping_info_submitted</code></td><td><code>add_shipping_info</code> (<code>shipping_tier</code> = the method's name)</td></tr>
    <tr><td><code>payment_info_submitted</code></td><td><code>add_payment_info</code> (<code>payment_type</code> = the method's name)</td></tr>
    <tr><td><code>checkout_completed</code></td><td><code>purchase</code> (<code>transaction_id</code> = the order number)</td></tr>
  </tbody>
</table>

- Every GA4 event has `currency`, `value` and the items: `item_id` is the SKU, `price` the unit price after the discount, `discount` the discount per unit, `item_category` the product's category.
- The amounts are those of [Items and amounts](#items-and-amounts). `value` is without tax and shipping. On a store whose catalog prices include tax, `view_item` includes tax, and the other events include tax until the shopper gives an address. The items' `price` × quantity can add up to a few cents more or less than `value`.
- `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info` and `purchase` also have `coupon` when the cart or the order has one.
- An item that the coupon discounted also has `coupon` (GA4's "Item coupon"), on these events and on `add_to_cart` and `remove_from_cart`. With a coupon on the whole order, every item has it. With a coupon on some products, only those items have it.
- `purchase` is sent once per order in a browser: a reload of the success page sends nothing. GA4 itself ignores a second purchase with the same `transaction_id` only when it comes from the same user.
- An event without items is not sent (GA4 requires them): the page of an empty cart sends no `view_cart`. A `purchase` is always sent.
- `checkout_contact_info_submitted` and the coupon events are not sent: GA4 has no event for them.
- The page view is sent by GA4 itself, on every storefront page. Admin pages load nothing.
- The events go to every Google tag on the page. If your theme adds another Google tag itself, such as a second GA4 property or Google Ads, that tag receives them too.
- A theme or an extension that has its own copy of the old GA4 component should delete it: the copy replaces the built-in one and sends no ecommerce events. In a theme, the copy is `pages/all/GoogleAnalytics.tsx`; in an extension, `pages/frontStore/all/GoogleAnalytics.tsx`.

:::warning
Use the built-in GA4 or Google Tag Manager, not both. If your Tag Manager container also loads GA4 with the same Measurement ID, every event is counted twice.
:::

### Cookie consent

**Cookie consent** (below the Measurement ID) sets Google Consent Mode:

- **Not required: collect from the first page.** GA4 sets its cookies on the first page. Choose this only when the store has no cookie banner.
- **Required: no cookies until the shopper accepts.** The page tells Google that analytics and ads storage are denied before GA4 starts. GA4 sets no cookies until your cookie banner sends Google's consent update. Until then, Google still receives the page views and events, without cookies (Google calls this advanced consent mode). Your reports show few of them, unless your GA4 property has enough traffic for Google's behavioral modeling.

Choose **Required** whenever the store has a cookie banner, also one that sets the Google consent default itself. When a banner's script has already set a default, EverShop keeps it (its regions, grants and wait time) and adds none. The banner must support Google Consent Mode, as Cookiebot, OneTrust and CookieYes do. With "Required" and no such banner, your reports stay almost empty.

GA4 is loaded by a component in the `head` area, `GoogleAnalyticsHead` (`sortOrder: 50`). Load the banner before it, in the page head, without `async`, `defer` or `type="module"`: such a script runs after GA4, even when its tag comes first.

- A banner that loads from a plain script URL: add it in `themeConfig.headTags.scripts`. These scripts come from the `HeadTags` component (`sortOrder: 5`), before GA4.
- A banner that needs `data-*` attributes or inline code (Cookiebot's `data-cbid`, OneTrust's `data-domain-script`): render its `<script>` tag from a component in the `head` area of a theme or an extension, with a `sortOrder` below 50.

```tsx
import React from 'react';

export default function CookieBanner() {
  return (
    <script
      id="Cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid="YOUR-COOKIEBOT-ID"
      type="text/javascript"
    />
  );
}

export const layout = {
  areaId: 'head',
  sortOrder: 1
};
```

The banner comes first in the head, so it sets its default before GA4 starts.

Check consent on a production build (`npm run build`, then `npm run start`), not in development (`npm run dev`). In development, the browser builds the head after the page's JavaScript has run: GA4 starts first, a banner from `themeConfig.headTags` runs after it, and a banner rendered by a head component, like the one above, does not run at all.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
