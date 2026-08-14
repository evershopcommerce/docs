---
sidebar_position: 51
title: Metafield
description: A presentational component that reads one metafield value off an entity and renders it, with declaration-aware defaults and visibility rules.
hide_table_of_contents: false
sidebar_label: Metafield
keywords:
  - EverShop Metafield
  - metafield
  - custom field
  - theme metafields
groups:
  - components
---

# Metafield

## Description

Renders the value of a single metafield from an entity you supply. The component is **purely presentational**: it performs no data fetching and reads no entity contexts, which makes it usable anywhere the data is available — a product detail page, a category grid, a related-products shelf, or the footer.

Its only ambient input is the active theme's *declaration* of the field, projected into the app context from the theme's `theme.json`. That declaration supplies the field's display name, its placeholder default, and its customer-visibility flag.

## Import

```typescript
import { Metafield } from '@components/common/metafield/index.js';
```

## Usage

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
      as="p"
      className="product__material"
    />
  );
}

export const layout = { areaId: 'productNameAfter', sortOrder: 10 };
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>owner</td>
      <td>string</td>
      <td>-</td>
      <td>Owner entity type (required). <code>product</code>, <code>category</code>, <code>collection</code>, <code>customer</code>, <code>order</code>, <code>shop</code>, <code>blog_post</code>, <code>blog_category</code> — an open set.</td>
    </tr>
    <tr>
      <td>namespace</td>
      <td>string</td>
      <td>-</td>
      <td>The field's namespace (required).</td>
    </tr>
    <tr>
      <td>fieldKey</td>
      <td>string</td>
      <td>-</td>
      <td>The field's key (required).</td>
    </tr>
    <tr>
      <td>entity</td>
      <td>{'{ uuid?, metafields? }'} | null | undefined</td>
      <td>-</td>
      <td><strong>Required.</strong> The entity object carrying the <code>metafields</code> selection. There is no context fallback — see below.</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>any</td>
      <td>-</td>
      <td>Per-call-site fallback rendered when the value is unset. Takes precedence over the declaration's placeholder.</td>
    </tr>
    <tr>
      <td>render</td>
      <td>{'(value, meta) => ReactNode'}</td>
      <td>-</td>
      <td>Custom renderer. Required for anything that is not a string or a number.</td>
    </tr>
    <tr>
      <td>as</td>
      <td>keyof JSX.IntrinsicElements</td>
      <td>'span'</td>
      <td>Tag used by the built-in scalar renderer. Ignored when <code>render</code> is supplied.</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>Class applied by the built-in scalar renderer. Ignored when <code>render</code> is supplied.</td>
    </tr>
  </tbody>
</table>

## `entity` is required

`<Metafield>` never looks up the entity for you. It does not call `useProduct()`, it does not read a category or collection context, and it issues no query of its own. You pass the object, and the object must carry the field's data.

```tsx
// Detail page — pass the page's entity.
const product = useProduct();
<Metafield owner="product" entity={product} namespace="mytheme" fieldKey="material" />

// Grid or shelf — no per-item context exists, so pass each item.
{products.map((item) => (
  <Metafield key={item.uuid} owner="product" entity={item}
    namespace="mytheme" fieldKey="material" />
))}

// Shop-level field — pass the setting object from the enclosing master's query.
<Metafield owner="shop" entity={setting} namespace="mytheme" fieldKey="tagline" />
```

A nullish `entity` is tolerated at runtime — the resolution simply falls through to the default — so loading states and optional data do not crash the page.

For this to produce anything, the page's GraphQL query must select the field data:

```graphql
currentProduct {
  uuid
  metafields { namespace key type value }
}
```

The default `productView` and `categoryView` queries already do. If you **override** the master component with your own query, carry the selection across or every `<Metafield>` on the page falls back to its default.

## Resolution order

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Condition</th>
      <th>Rendered</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Declared with <code>visibleToCustomer: false</code></td>
      <td><strong>Nothing</strong> — not the default, not the placeholder.</td>
    </tr>
    <tr>
      <td>Value is set on the entity</td>
      <td>The value.</td>
    </tr>
    <tr>
      <td>Value is unset and <code>defaultValue</code> was passed</td>
      <td><code>defaultValue</code>.</td>
    </tr>
    <tr>
      <td>Value is unset and no <code>defaultValue</code></td>
      <td>The declaration's <code>appearance.placeholder</code>.</td>
    </tr>
    <tr>
      <td>Neither exists</td>
      <td>Nothing.</td>
    </tr>
    <tr>
      <td>Stored type does not match the declared type</td>
      <td>The default, plus a development-mode console warning.</td>
    </tr>
  </tbody>
</table>

:::warning Hidden fields render nothing at all
A field declared `visibleToCustomer: false` is dropped from the customer-facing GraphQL response. If the component fell back to the default for it, a private field's placeholder text would be published on the storefront. So visibility is checked **first**, before the value and before any fallback.
:::

## Example: rendering a non-scalar value

The built-in renderer only handles strings and numbers — lists, groups, booleans and rich text need a `render` function. (Without one, nothing renders and a development-mode warning is logged.)

```tsx
<Metafield
  owner="product"
  entity={product}
  namespace="mytheme"
  fieldKey="badges"
  render={(value) =>
    Array.isArray(value) ? (
      <div className="product__badges">
        {value.map((badge, i) => (
          <span key={i} className={`badge badge--${badge.tone}`}>
            {badge.label}
          </span>
        ))}
      </div>
    ) : null
  }
/>
```

## Example: using `meta`

The second argument to `render` describes the field:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Key</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>type</td>
      <td>string</td>
      <td>Normalized (lowercase) field type — declared type first, stored type otherwise.</td>
    </tr>
    <tr>
      <td>isList</td>
      <td>boolean</td>
      <td>Present when the declaration marks the field as a list.</td>
    </tr>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>The declaration's display name, when declared.</td>
    </tr>
    <tr>
      <td>placeholder</td>
      <td>string</td>
      <td>The declaration's <code>appearance.placeholder</code>, when declared.</td>
    </tr>
    <tr>
      <td>isDefault</td>
      <td>boolean</td>
      <td><code>true</code> when what you are rendering is a fallback rather than stored data.</td>
    </tr>
  </tbody>
</table>

```tsx
<Metafield
  owner="product"
  entity={product}
  namespace="mytheme"
  fieldKey="care"
  render={(value, meta) => (
    <p className={meta.isDefault ? 'text-muted-foreground italic' : undefined}>
      {String(value)}
    </p>
  )}
/>
```

## Page builder behaviour

Inside the page-builder iframe the component gains a violet **"Live data"** hover outline; clicking it opens an informational drawer describing the field, its definition status, and where its value is edited. A declared field that renders nothing on the storefront — hidden, or unset with no default — shows a dashed **ghost chip** instead, so it stays discoverable on the canvas.

None of this affects the storefront: the first render is always the bare production element, and the chrome mounts only after hydration inside the builder.

Metafield values are live entity data. The page builder never edits them.

## Notes

- The component is presentational only — no fetching, no entity-context fallback.
- The declaration lookup is keyed `owner.namespace.fieldKey`. An **undeclared** field still renders whatever the GraphQL data contains, on a best-effort basis.
- Development-mode `console.warn`s cover the common misconfigurations: a declared field missing from the entity data (definition not provisioned yet, or the query does not select `metafields`), a stored/declared type mismatch, and a non-scalar value with no `render` prop. They are silenced in production builds.

## Related Components

- [Area](Area.md) - Component container system
- [ProductContext](ProductContext.md) - Product page data
- [CategoryContext](CategoryContext.md) - Category page data
- [Editor](Editor.md) - Rich-text renderer for `rich_text` metafields

For declaring metafields in `theme.json`, see [Using Metafields in a Theme](../metafields.md).

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
