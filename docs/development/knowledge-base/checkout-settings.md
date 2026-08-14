---
sidebar_position: 62
keywords:
  - checkout
  - guest checkout
  - order validation
  - settings
  - allowGuestCheckout
  - orderValidator
sidebar_label: Checkout Settings
title: Checkout Settings
description: The guest-checkout toggle, where it is enforced, the shipping-note option, and how to add your own pre-order validation rules.
---

# Checkout Settings

EverShop 2.2.1 adds a guest-checkout toggle to store settings, and with it a small pattern worth understanding: a setting that changes what a shopper is *allowed to do* is enforced in **two independent places** — once at the page level for the browser experience, and once in order validation so a direct API call cannot slip past it.

This page covers both checkout settings and the extension seam for adding your own pre-order checks.

## `allowGuestCheckout`

Whether a shopper may place an order without a customer account.

### Resolution order

`modules/checkout/services/checkoutSettings.ts` is the single reader:

```ts
import { toBoolean } from '@evershop/evershop/lib/util/coerce';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { getSettingSync } from '@evershop/evershop/setting/services';

export function getAllowGuestCheckout(): boolean {
  return toBoolean(
    getSettingSync<unknown>(
      'allowGuestCheckout',
      getConfig('checkout.allowGuestCheckout', true)
    )
  );
}
```

Three layers, highest priority first:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Source</th>
      <th>Where it lives</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Admin setting</td>
      <td><code>setting</code> table, key <code>allowGuestCheckout</code></td>
      <td>Set from <strong>Settings → Store Settings → Checkout</strong>. Wins whenever present.</td>
    </tr>
    <tr>
      <td>Legacy config</td>
      <td><code>config/default.json</code> → <code>checkout.allowGuestCheckout</code></td>
      <td>Declared in the checkout module's <code>configurationSchema</code> processor as a boolean. Used only when the setting row is absent.</td>
    </tr>
    <tr>
      <td>Default</td>
      <td>Hard-coded <code>true</code></td>
      <td>Guest checkout is allowed on a fresh install and on upgrade — the toggle is opt-out, so 2.2.1 changes nothing for existing stores.</td>
    </tr>
  </tbody>
</table>

Two implementation details that matter if you call this yourself:

- **It is synchronous and cache-only.** `getSettingSync` reads the in-memory settings cache, never the database. That is what makes it safe to call from the order validator and from request handlers without an `await`.
- **The result is coerced.** The `setting` table stores scalars as strings, so the raw value may be `'false'`, `'0'`, `'true'` or `'1'`, and the config fallback may be a real boolean. `toBoolean` normalises all of those. Never compare the raw setting value against `true` yourself.

### Enforcement point 1 — the checkout page

`modules/checkout/pages/frontStore/checkout/index.ts` redirects an anonymous shopper to login, carrying a return URL:

```ts
export default async (request: EvershopRequest, response, next) => {
  const customer = request.getCurrentCustomer();
  const cart = await getMyCart(request.sessionID || '', customer?.customer_id);
  if (!cart) {
    response.redirect(302, buildUrl('cart'));
    return;
  }
  const items = cart.getItems();

  if (items.length === 0 || cart.hasItemError()) {
    response.redirect(302, buildUrl('cart'));
  } else if (!customer && !getAllowGuestCheckout()) {
    response.redirect(
      302,
      `${buildUrl('login')}?redirect=${encodeURIComponent(request.originalUrl)}`
    );
  } else {
    setPageMetaInfo(request, {
      title: translate('Checkout'),
      description: translate('Checkout')
    });
    next();
  }
};
```

This handles the normal browser flow. It does **not** handle a shopper who logs out while sitting on the checkout page — that is client-side, with no page load. The page component covers that case separately with a `useEffect` that watches the customer and only fires on a genuine sign-out (was authenticated → is not), so a first render as a guest does not bounce anyone.

Neither of these is a security boundary. They are user experience.

### Enforcement point 2 — the order validator

The actual gate is a validation rule in `modules/checkout/services/orderValidator.ts`:

```ts
{
  id: 'guestCheckout',
  func: (cart: Cart) => {
    if (getAllowGuestCheckout()) {
      return true;
    }
    return Boolean(cart.getData('customer_id'));
  },
  errorMessage: 'You must be logged in to place an order'
}
```

This runs inside `orderCreator`'s transaction, on every path that creates an order — the REST `createOrder` endpoint included. An API client that skips the page entirely and posts straight to the order endpoint still gets rejected:

```bash
Order validation failed: You must be logged in to place an order
```

The rule is genuinely an authorization check rather than a spoofable one because `cart.customer_id` is populated from the session by the cart-checkout handler (via `request.getCurrentCustomer()`), never from client input. A guest cannot set `customer_id` on their own cart.

> The general pattern: **page-level checks are for humans, validation rules are for correctness.** If a setting restricts what may be placed as an order, add a validation rule for it. A redirect alone is decorative.

### GraphQL exposure

The flag is exposed on the **`Setting`** type, not on a `CheckoutSetting` type — the folder is named `CheckoutSetting/` but it contains a type extension:

```graphql
extend type Setting {
  showShippingNote: Boolean
  allowGuestCheckout: Boolean
}
```

So the storefront query is:

```graphql
query Query {
  loginUrl: url(routeId: "login")
  setting {
    showShippingNote
    allowGuestCheckout
  }
}
```

`modules/checkout/graphql/types/CheckoutSetting/CheckoutSetting.resolvers.js` resolves `allowGuestCheckout` through `getAllowGuestCheckout()`, so the GraphQL field goes through exactly the same setting → config → default chain as the server-side checks. Both fields are on the non-admin schema, so the storefront can read them.

## `showShippingNote`

Whether the checkout page and the order-success page offer a free-text "order note" field.

Unlike guest checkout this one is **config-only** — there is no admin setting and no `setting` row. It is declared in the checkout module's `configurationSchema` processor and read straight from config:

```js
showShippingNote: () => getConfig('checkout.showShippingNote', true)
```

To turn it off:

```json
{
  "checkout": {
    "showShippingNote": false
  }
}
```

The flag is consumed twice on the checkout page — once in the sticky summary rail on large screens and once inline above the place-order button below the `lg` breakpoint, because the rail is hidden there. Both instances edit the same note value. It is also read by the order-success page's shipping note block.

## Adding your own pre-order checks

Order validation is a registry-backed rule list. Two functions form the public seam, both exported from `@evershop/evershop/checkout/services`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Signature</th>
      <th>Use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>addOrderValidationRule</code></td>
      <td><code>(rule: Validator&lt;Cart&gt;) =&gt; void</code></td>
      <td>Register a rule. Call from <code>bootstrap.ts</code> only.</td>
    </tr>
    <tr>
      <td><code>validateBeforeCreateOrder</code></td>
      <td><code>(cart: Cart) =&gt; Promise&lt;&#123; valid: boolean; errors: string[] &#125;&gt;</code></td>
      <td>Run every rule. Core already calls it inside <code>orderCreator</code>; call it yourself only to pre-flight a cart (e.g. to grey out a button).</td>
    </tr>
  </tbody>
</table>

A rule is a plain object:

```ts
import { addOrderValidationRule } from '@evershop/evershop/checkout/services';

export default () => {
  addOrderValidationRule({
    id: 'maxOrderValue',
    func: (cart) => {
      const total = cart.getData('grand_total');
      return typeof total !== 'number' || total <= 10000;
    },
    errorMessage: 'Orders above 10,000 must be placed by contacting sales'
  });
};
```

Rules to follow:

- **Register from `bootstrap.ts`.** `addOrderValidationRule` wraps `addProcessor('orderValidator', ...)`, and the registry is locked once bootstrap finishes. Calling it from a middleware throws.
- **`id` is a key, not a label.** Rules are stored in a `Map` keyed by `id`, so registering the same id twice replaces the earlier rule. That is the supported way to override a core rule — re-register `guestCheckout` or `billingAddress` with your own `func`.
- **`func` may be sync or async.** All rules run concurrently through `Promise.allSettled`, so a slow rule does not serialize the others. It also means rules must not depend on each other's side effects.
- **A rule that throws counts as a failure**, and its message becomes `"<errorMessage> (exception occurred)"`. Prefer returning `false` over throwing so the shopper sees your real message.
- **Failures are joined, not raised individually.** `orderCreator` throws `Order validation failed: <errors joined>` and the surrounding transaction rolls back. Write `errorMessage` as something a shopper can act on.

### The core rules

For reference, these ship in `initialValidators`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rule id</th>
      <th>Rejects</th>
      <th>Error message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>checkCartError</code></td>
      <td>A cart carrying any error</td>
      <td><code>Cart has errors</code></td>
    </tr>
    <tr>
      <td><code>checkEmpty</code></td>
      <td>A cart with no items</td>
      <td><code>Cart is empty</code></td>
    </tr>
    <tr>
      <td><code>shippingAddress</code></td>
      <td>A shippable cart with no shipping address</td>
      <td><code>Shipping address is required</code></td>
    </tr>
    <tr>
      <td><code>shippingMethod</code></td>
      <td>A shippable cart with no selected method</td>
      <td><code>Shipping method is required</code></td>
    </tr>
    <tr>
      <td><code>billingAddress</code></td>
      <td>A cart with a total above zero and no billing address</td>
      <td><code>Billing address is required</code></td>
    </tr>
    <tr>
      <td><code>guestCheckout</code></td>
      <td>An anonymous cart when guest checkout is disabled</td>
      <td><code>You must be logged in to place an order</code></td>
    </tr>
  </tbody>
</table>

`shippingAddress` and `shippingMethod` both short-circuit to valid when the cart is `no_shipping_required` (a fully virtual cart). `billingAddress` short-circuits when `grand_total` is zero or below — see [Zero-Total Checkout](./zero-total-checkout) for why.

## See also

- [Zero-Total Checkout](./zero-total-checkout) — the other 2.2.1 change to order validation, and the two rules it adds
- [Payment Method Development](./payment-method-development) — the validator a payment method registers, which runs alongside these rules
- [Registry and Processors](./registry-and-processors) — how `addProcessor` and the bootstrap lock work
- [Configuration Guide](./configuration-guide) — where `checkout.*` config keys live and how the schema is declared

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
