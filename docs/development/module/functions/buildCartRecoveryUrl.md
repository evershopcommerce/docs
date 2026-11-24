---
slug: buildcartrecoveryurl
sidebar_position: 149
keywords:
- buildCartRecoveryUrl
- cart recovery
- abandoned cart
- checkout
- URL
groups:
- checkout
sidebar_label: buildCartRecoveryUrl
title: buildCartRecoveryUrl
description: Build a link that gives a saved cart's products back to the shopper, in any browser, for abandoned-cart emails.
---

# buildCartRecoveryUrl

Returns a link that gives a saved cart's products back to the shopper who opens it, in any browser or device: `https://shop.com/cart/recover/<token>`. Put it in an abandoned-cart email, for example.

A guest's cart belongs to their browser session. The session cookie lasts 24 hours from when the session started or last changed, so after a day the cart is out of reach. Without this link, an email can only send the shopper to the shop.

## Import

```typescript
import { buildCartRecoveryUrl } from '@evershop/evershop/checkout/services';
```

## Syntax

```typescript
buildCartRecoveryUrl(cartId: number): string | null
```

### Parameters

**`cartId`**

The cart's `cart_id`. The link carries this number, not the cart's `uuid`: anyone can read what a link carries, and a cart's uuid opens the cart through the public cart APIs.

## Return Value

The absolute link, or `null` when the `CART_RECOVERY_TOKEN_SECRET` environment variable is not set. Leave the link out of the email then.

The base of the link is the `EVERSHOP_HOME_URL` environment variable, else the `shop.homeUrl` config value. The link is built from the loaded routes: the web app, the event process (subscribers) and the cron process (jobs) load them at start.

## What the link does

Opening the link shows a page with the saved cart's products (image, options, quantity and price, as the cart service sees them today) and a **Restore my cart** button. Opening it changes nothing: only the button does.

<table className="table-auto not-prose">
  <thead>
    <tr><th>The saved cart</th><th>What happens</th></tr>
  </thead>
  <tbody>
    <tr><td>A guest's cart</td><td>The page shows the button. The click adds the saved cart's products to the shopper's current cart (a new one if they have none), and the shopper lands on the cart page.</td></tr>
    <tr><td>A customer's cart</td><td>The shopper signs in first, comes back to the page and clicks the button. Another customer who opens the link gets nothing.</td></tr>
    <tr><td>Already restored from this link</td><td>The page says "This cart was already restored", with a button to the cart. An email flow often puts the same link in every email, so a shopper can come back to it.</td></tr>
    <tr><td>Ordered, or the link has expired</td><td>The page says the link is no longer valid, without the reason.</td></tr>
  </tbody>
</table>

- **The link works once.** The click closes the saved cart, so a second click, or the same link opened later, gets "This cart was already restored".
- **The products are copied, not the cart.** Each product goes through the cart service, so stock and prices are checked as when the shopper adds it themselves. A product that cannot be added any more (disabled, deleted, out of stock) is skipped, and the page does not list it. The saved cart's coupon is applied when the current cart has none.
- **The saved cart's email and addresses stay behind.** They never reach the browser that opened the link: the shopper enters them again at checkout.
- **Why a button.** Some email security services open every link in an email as soon as it arrives. They never click, so they cannot use up the link.
- **The token never reaches analytics.** The link stores its token in the session and redirects to `/cart/recover`, so analytics and pixel scripts, which send the page address, never see it.

## Expiry

A link works for 30 days from when it is built. Build a new link for each email: every email then gets its full 30 days.

To change the lifetime, set `checkout.cartRecovery.ttlDays` in your config (a number of days above 0; any other value falls back to 30, with a warning in the log):

```json
{
  "checkout": {
    "cartRecovery": {
      "ttlDays": 14
    }
  }
}
```

Changing `CART_RECOVERY_TOKEN_SECRET` cancels every link already sent.

:::warning
The email on a guest's cart is not verified: anyone can type any address at checkout. A job that emails carts may send a link to an address its owner never used on your shop.
:::

:::note
When the store runs with `--debug`, the request log writes every URL, link tokens included. Do not run production with `--debug`.
:::

## Example

### An abandoned-cart sender (a subscriber)

The `cart_email_added` event tells you when a cart can be emailed. A subscriber builds the link and passes it to your email service, for example as a property of Klaviyo's "Started Checkout" event:

```typescript
// extensions/my-abandoned-cart/src/subscribers/cart_email_added/sendStartedCheckout.ts
import { buildCartRecoveryUrl } from '@evershop/evershop/checkout/services';
import type { EventDataRegistry } from '@evershop/evershop/types/event';

export default async function sendStartedCheckout(
  data: EventDataRegistry['cart_email_added']
) {
  const link = buildCartRecoveryUrl(data.cart_id);
  if (!link) {
    return; // CART_RECOVERY_TOKEN_SECRET is not set
  }
  // Send data.customer_email, the cart's items and the link to your email service
}
```

Your email service decides when a cart counts as abandoned: Klaviyo, for example, waits a few hours and sends the email only if no "Placed Order" event came for the same email in the meantime (send that one from the `order_placed` event). A job of your own does the same with `cart.updated_at` and a record of the emails it sent, and respects the shopper's consent for marketing emails.

## See Also

- [buildAbsoluteUrl](/docs/development/module/functions/buildabsoluteurl) - Absolute URL from a route ID
- [Events and subscribers](/docs/development/knowledge-base/events-and-subscribers) - The `cart_email_added` event
- [Commerce events](/docs/development/knowledge-base/commerce-events) - Browser events of the cart and checkout
