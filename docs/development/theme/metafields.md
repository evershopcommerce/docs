---
sidebar_position: 30
keywords:
  - metafield
  - theme
  - Metafield component
  - custom field
sidebar_label: Using Metafields
title: Using Metafields in a Theme
description: Declare custom fields in your theme's theme.json and render their values on the storefront with the Metafield component.
---

# Using Metafields in a Theme

Themes often need per-entity content beyond the built-in fields — a product's tasting notes, a set of badges above the name, a category eyebrow. [Metafields](/docs/development/knowledge-base/metafields) provide the typed, validated storage for that data, and a theme can wire it up in two steps:

1. **Declare** the fields your theme uses in `theme.json`, so they exist as soon as the theme is activated.
2. **Render** their values with the `<Metafield>` component.

## Declaring metafields in `theme.json`

Add a `metafieldDefinitions` array to your theme's `theme.json`. Each entry is a metafield definition — the same shape you would create in the admin, expressed as JSON:

```json
{
  "theme_name": "My Theme",
  "version": "1.0.0",
  "metafieldDefinitions": [
    {
      "ownerType": "product",
      "namespace": "mytheme",
      "key": "material",
      "name": "Material",
      "type": "short_text",
      "visibleToCustomer": true,
      "validations": [{ "type": "size", "max": 120 }],
      "appearance": { "placeholder": "Organic cotton" }
    }
  ]
}
```

These definitions are provisioned automatically when the theme is activated (`npm run theme:active`) **and** on every server start, so a fresh deployment that never runs the CLI still gets them. Provisioning is idempotent — re-running it never duplicates or overwrites existing fields.

A few rules to keep in mind:

- **Use your own namespace**, not `custom`. The `custom` namespace is reserved for fields the merchant creates by hand; declaring your theme's fields under a theme-specific namespace (for example `mytheme`) keeps them from colliding with anyone else's.
- **`required: true` is not allowed** in a theme declaration. Seeding a required field would make every save of that entity fail until existing records are backfilled, so the installer rejects it.
- **`appearance.placeholder`** is the field's default text. It is shown by `<Metafield>` when the value is unset, and it appears as the input hint on the entity's admin edit form — so the merchant sees exactly what the storefront falls back to.

If a theme declares a field that already exists with an **incompatible type** (an immutable difference), the theme's declaration is skipped and the existing definition is kept; the conflict is reported during activation. Uninstalling a theme **leaves its definitions in place** — merchant data outlives the theme — and `npm run theme:status` reports definitions left behind by themes that are no longer active.

## The `Metafield` component

`<Metafield>` reads one metafield value off an entity and renders it. It performs no data fetching of its own — **you provide the entity** — which keeps it usable anywhere: a product page, a category grid, a shelf of related products, or the footer.

```tsx
import { Metafield } from '@components/common/metafield/index.js';
```

<table className="table-auto not-prose">
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>owner</code></td><td>string</td><td>The owner type — <code>product</code>, <code>category</code>, <code>shop</code>, etc.</td></tr>
    <tr><td><code>namespace</code></td><td>string</td><td>The field's namespace.</td></tr>
    <tr><td><code>fieldKey</code></td><td>string</td><td>The field's key.</td></tr>
    <tr><td><code>entity</code></td><td>object</td><td>The entity carrying the metafield data (see below). Required.</td></tr>
    <tr><td><code>defaultValue</code></td><td>any</td><td>Optional fallback shown when the value is unset. Overrides the manifest placeholder.</td></tr>
    <tr><td><code>render</code></td><td>function</td><td>Optional <code>(value, meta) =&gt; ReactNode</code>. Required for non-scalar values.</td></tr>
    <tr><td><code>as</code> / <code>className</code></td><td>string</td><td>Tag and class for the default scalar renderer.</td></tr>
  </tbody>
</table>

### Providing the entity

The `entity` you pass must carry the field's `metafields` data — the object returned by the page's GraphQL query.

On a **product or category detail page**, read it from the page context and pass it straight through:

```tsx
import { Metafield } from '@components/common/metafield/index.js';
import { useProduct } from '@components/frontStore/catalog/ProductContext.js';

export default function ProductMaterial() {
  const product = useProduct();
  return (
    <Metafield
      owner="product"
      entity={product}
      namespace="mytheme"
      fieldKey="material"
    />
  );
}

export const layout = { areaId: 'productNameAfter', sortOrder: 10 };
```

The default `productView` and `categoryView` pages already request `metafields` in their query, so a component you add to one of their [Areas](/docs/development/theme/view-system) can read it with no extra work.

:::note
If you **override** the `productView` or `categoryView` master component with your own query, include `uuid` and the `metafields` selection so `<Metafield>` still has data:

```graphql
currentProduct {
  uuid
  metafields { namespace key type value }
  # …your other fields
}
```
:::

In a **grid or shelf**, there is no per-item context — pass each card's item directly:

```tsx
{products.map((item) => (
  <Metafield
    key={item.uuid}
    owner="product"
    entity={item}
    namespace="mytheme"
    fieldKey="material"
  />
))}
```

For this to work, the listing query must select `metafields` on each item.

### Rendering values

For plain text and numbers, `<Metafield>` renders the value directly (wrapped in the `as` tag, defaulting to `<span>`):

```tsx
<Metafield owner="product" entity={product} namespace="mytheme" fieldKey="material"
  as="p" className="product__material" />
```

For lists, groups, booleans, and rich text, provide a `render` function. It receives the value and a small `meta` object describing the field:

```tsx
<Metafield
  owner="product"
  entity={product}
  namespace="mytheme"
  fieldKey="badges"
  render={(value) =>
    Array.isArray(value) ? (
      <div className="badges">
        {value.map((b, i) => (
          <span key={i} className={`badge badge--${b.tone}`}>{b.label}</span>
        ))}
      </div>
    ) : null
  }
/>
```

### Defaults and hidden fields

`<Metafield>` resolves what to show in this order:

- If the field's value is **set**, it renders that value.
- If it is **unset**, it renders `defaultValue` if you passed one, otherwise the definition's `appearance.placeholder`.
- If the field is declared **`visibleToCustomer: false`**, it renders **nothing** on the storefront — never the default. (Hidden fields are dropped from the customer GraphQL response, and the component treats them as intentionally private rather than falling back to their default text.)

## Page builder

When the theme's page is opened in the page builder, each rendered `<Metafield>` gains a **"Live data"** highlight. Clicking it opens an informational drawer that describes the field, shows whether its definition exists (with a one-click **create** for a declared-but-not-yet-created field), flags any definition conflict, and links to where the value is edited.

Metafield values are **live entity data**, not page-builder content — they are edited per entity (on the product's edit form, in Store Settings for shop fields, and so on) and take effect immediately. The page builder never edits the values themselves; the drawer is there to explain the field and point you to the right place.

## See also

- [Metafields](/docs/development/knowledge-base/metafields) — the underlying system, field types, and GraphQL API
- [The View System](/docs/development/theme/view-system) — Areas and how components compose into pages
- [Theme Overview](/docs/development/theme/theme-overview) — theme structure and `theme.json`

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
