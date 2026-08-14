---
sidebar_position: 34
keywords:
  - related products
  - cross sell
  - frequently bought together
  - product recommendations
  - evershop recommendations
sidebar_label: Product Recommendations
title: Product Recommendations
description: EverShop ships rule-based related products and data-driven frequently-bought-together recommendations, with global, category, and product-level configuration and two storefront widgets.
---

# Product Recommendations

EverShop provides three recommendation shelves for product pages:

- **Related products** — substitutes and alternatives, driven by configurable catalog rules.
- **Frequently bought together** — complements, driven by real co-purchase statistics from your order history.
- **Upsell** — pricier alternatives, derived automatically from your related-products rules. Nothing extra to configure.

All are delivered as page-builder widgets, filter out disabled, invisible, and out-of-stock products at render time, and never show the product being viewed or its own variant siblings.

## Related products

### Rules

Related products resolve through an ordered waterfall. Each step fills only the slots the previous steps left open:

1. **Manual picks** — products chosen on the product edit screen. Always shown first, in the order you pin them.
2. **Rules**, in the priority order you configure:
   - **Same category** — products sharing the viewed product's category.
   - **Same collection** — products sharing any collection with the viewed product.
   - **Same attribute values** — products matching the viewed product's value for chosen select attributes (for example color), always combined with a scope (same category or same collection).
3. **Bestseller fallback** (optional) — fills any remaining slots with store bestsellers so the shelf never renders empty.

An optional **price band** restricts rule results to products within a configurable percentage of the viewed product's price.

Within each rule, products are ranked by sales (orders containing the product or any of its variants), newest first as the tiebreaker.

### Configuration levels

Rules resolve through three levels — the most specific one wins:

1. **Product** — a product in *Custom rules* mode uses its own rule configuration. *Manual picks only* mode disables all automatic rules for that product.
2. **Category** — a category can override the global rules for every product in it that inherits.
3. **Global** — Settings → Catalog → Related products.

The product edit screen shows which level is in effect and previews exactly what shoppers will see, including which rule produced each item.

## Frequently bought together

### How it works

A scheduled job (nightly at 02:00 by default) rebuilds co-purchase statistics from your order history: for every pair of products bought together in the same order, it counts the co-occurrences. Orders with a `canceled` status are excluded, and variants count at the product-family level — buying *Shirt–Red* with a mug and *Shirt–Blue* with a mug both strengthen the same "shirt + mug" pair.

At render time, candidates must pass three configurable gates:

- **Minimum times bought together** (default 3) — the pair must co-occur in at least this many orders.
- **Minimum orders of the product** (default 5) — the viewed product needs enough order history to be trusted.
- **Minimum lift** (default 1) — lift measures whether two products are bought together *more than chance would predict*. This filters out ubiquitous bestsellers that co-occur with everything.

Passing candidates are ranked by lift. If fewer candidates pass than the widget needs, the shelf falls back to category bestsellers, then store bestsellers (this fallback can be disabled). In a new store with little order data, "bestsellers" effectively means newest products until sales accumulate.

### Modes

Each product can be set to:

- **Automatic** — computed candidates only (manual picks are ignored).
- **Manual picks only** — only the products you pin.
- **Manual first** — pins first, computed candidates fill the rest.

The product edit screen shows the computed candidates with their counts, confidence, and lift, lets you pin any of them, and previews the shelf exactly as shoppers see it — including fallback items, labeled with their real order counts.

### Recomputing

Statistics rebuild nightly (`catalog.crossSell.recomputeSchedule` in `config/default.json`, cron syntax) and on demand with the **Recompute now** button on Settings → Catalog. The first run after upgrading backfills from your entire order history. Orders with an unusually large number of distinct products can be excluded from pair-counting with `catalog.crossSell.maxOrderKeys` (disabled by default). After every successful rebuild, the `recommendation_stats_recomputed` event is emitted.

```json
{
  "catalog": {
    "crossSell": {
      "recomputeSchedule": "0 2 * * *",
      "recomputeEnabled": true,
      "maxOrderKeys": 0
    }
  }
}
```

## Upsell

The upsell shelf needs no configuration of its own — it reuses your related-products rules (the same product → category → global resolution) and keeps only products **pricier** than the one being viewed. Within those matches, products rank by sales, exactly like the related shelf.

Details worth knowing:

- If the **price band** is enabled in the rules, its percentage becomes the *upper* cap: candidates must be pricier than the viewed product but within the band above it.
- There is **no bestseller fill**: the shelf shows genuine pricier matches or renders nothing at all.
- A product in **Manual picks only** mode shows no upsell shelf — that mode opts the product out of rule-driven recommendations, and upsell is entirely rule-driven.
- Manual picks and the recompute job play no part here; the shelf is always live-computed from the rules.

## Frequently bought together on the cart page

A fourth shelf brings co-purchase recommendations to the cart: it aggregates candidates across **all** items in the cart and suggests what goes with them. Each product pair is gated individually (the same three thresholds), then candidates are ranked by their strongest affinity to any cart item, with "goes with several of your items" as the tiebreaker. Everything already in the cart — including other variants of in-cart products — is excluded. If too few candidates pass, the same bestseller fallback ladder applies, spanning all the cart items' categories.

Manual picks and per-product modes play no part on the cart shelf — those are product-page concepts; a cart has no single owner.

## Widgets

Four widgets are available in the page builder under the Commerce category:

- **Related products** (`related_products`) — product page
- **Frequently bought together** (`frequently_bought_together`) — product page
- **Upsell products** (`upsell_products`) — product page
- **Frequently bought together (cart)** (`cart_frequently_bought_together`) — cart page

All have a **heading** and a **product count** (1–12; 3–5 works best) setting, render through the standard product list, and render nothing at all — heading included — when no products qualify. The product-page widgets render nothing on non-product pages; the cart widget renders wherever the session cart has items, so it can also serve drawer or footer placements.

## Excluding a product

Enable **Exclude this product from recommendations** on the product edit screen to keep a product (for example a gift card) from ever being suggested alongside other products. It does not affect what is shown on that product's own page.

## GraphQL

Storefront queries can read both shelves on any product:

```graphql
query {
  product(id: 1) {
    relatedProducts(limit: 4) {
      name
      url
    }
    crossSellProducts(limit: 4) {
      name
      url
    }
    upsellProducts(limit: 4) {
      name
      url
    }
  }
}
```

The cart shelf is available on the cart types — `myCart` resolves the current session's cart with no arguments:

```graphql
query {
  myCart {
    crossSellProducts(limit: 4) {
      name
      url
    }
  }
}
```

## REST API

Manual picks and the recompute trigger are exposed as admin REST endpoints — see the [Product Recommendations API](/docs/api/product-recommendation).

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
