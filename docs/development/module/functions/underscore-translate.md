---
sidebar_position: 29
keywords:
- underscore
- translation
- locale
- i18n
- template
groups:
- utilities
sidebar_label: "_"
title: "_ (translate)"
slug: /development/module/functions/underscore-translate
description: Template translation function with variable interpolation.
---

# _

Isomorphic translation function for React components and templates. It performs a **real dictionary lookup** against the active locale, then interpolates `${variable}` placeholders.

## Import

```typescript
import { _ } from '@evershop/evershop/lib/locale/translate/_';
```

## Syntax

```typescript
_(text: string, values?: Record<string, string>): string
```

### Parameters

**`text`**

**Type:** `string`

The English source text, with optional placeholders using `${variable}` syntax. This doubles as the dictionary lookup key.

**`values`**

**Type:** `Record<string, string>` (optional)

Object containing values to replace placeholders.

## Return Value

Returns the translated string with placeholders replaced. Missing **or empty** dictionary entries fall back to the source text unchanged.

## How the lookup works

`_()` reads the **active dictionary** and looks the source string up in it:

- **On the server**, the dictionary is the per-page slice seeded immediately before `renderToString`.
- **On the client**, it is read once from `window.eContext.translations` and memoised.

Both come from the same `translations/<locale>/*.csv` files `translate()` uses — `_()` is not interpolation-only, and it is not a lesser version of `translate()`. The split is about **where the code runs**:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th></th>
      <th><code>_()</code></th>
      <th><code>translate()</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Runs on</td>
      <td>Server and browser (isomorphic)</td>
      <td>Server only</td>
    </tr>
    <tr>
      <td>Dictionary source</td>
      <td>Active per-page dictionary / <code>window.eContext.translations</code></td>
      <td>Request locale context, or an explicit <code>locale</code> argument</td>
    </tr>
    <tr>
      <td>Scope</td>
      <td>The page's translation slice</td>
      <td>The full locale dictionary</td>
    </tr>
    <tr>
      <td>Use for</td>
      <td>React components, templates, anything that hydrates</td>
      <td>Middleware, services, emails, cron jobs</td>
    </tr>
  </tbody>
</table>

Use `_()` in anything that reaches the browser — it pulls in no `node:async_hooks` and is safe to bundle.

## Examples

### Basic Usage

```typescript
import { _ } from '@evershop/evershop/lib/locale/translate/_';

// Simple text
const message = _('Welcome to our store');

// With variables
const greeting = _('Hello ${name}', { name: 'John' });
// Returns: "Hello John"
```

### In React Components

```typescript
import React from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

export default function ProductCard({ product }) {
  return (
    <div>
      <h2>{_(product.name)}</h2>
      <p>{_('Price: ${price}', { price: product.price })}</p>
      <p>{_('${qty} items in stock', { qty: product.qty })}</p>
    </div>
  );
}
```

### Multiple Variables

```typescript
import { _ } from '@evershop/evershop/lib/locale/translate/_';

const message = _(
  'Order ${orderId} for ${total} has been ${status}',
  {
    orderId: '12345',
    total: '$99.99',
    status: 'completed'
  }
);
// Returns: "Order 12345 for $99.99 has been completed"
```

### Conditional Messages

```typescript
import { _ } from '@evershop/evershop/lib/locale/translate/_';

const itemCount = 5;
const message = _(
  '${count} items in cart',
  { count: itemCount.toString() }
);
```

## Notes

- Used primarily in React components and templates
- Performs a real dictionary lookup — not just interpolation
- Placeholders use `${variable}` syntax
- If a placeholder key is not found in `values`, the placeholder is left unchanged
- Falls back to the source text when the dictionary has no (or an empty) entry
- For server-only code — middleware, services, emails, cron jobs — use `translate()`, which can also target an explicit locale

## See Also

- [translate](/docs/development/module/functions/translate) - Server-side translation, with an optional explicit locale
