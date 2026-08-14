---
sidebar_position: 30
keywords:
- translate
- translation
- locale
- i18n
groups:
- utilities
sidebar_label: translate
title: translate
description: Server-side translation function with CSV file support.
---

# translate

Server-side translation function that loads translations from CSV files.

## Import

```typescript
import { translate } from '@evershop/evershop/lib/locale/translate/translate';
```

## Syntax

```typescript
translate(
  enText: string,
  values?: Record<string, string>,
  locale?: string
): string
```

### Parameters

**`enText`**

**Type:** `string`

The English text to translate. This is used as the key to look the translation up in the active dictionary.

**`values`**

**Type:** `Record<string, string>` (optional)

Object containing values to replace `${placeholder}` tokens in the translated text.

**`locale`**

**Type:** `string` (optional)

Force a specific locale instead of the ambient one. This exists for **off-request callers** — transactional emails, cron jobs, webhook handlers — that must render in the customer's language rather than whatever request happens to be in flight.

### Dictionary resolution

`translate` picks its dictionary in this order:

1. The explicit `locale` argument, when given.
2. The current request's locale context (set by the locale middleware).
3. The default store language (`shop.language`) — the off-request fallback.

## Return Value

Returns `string` - the translated text with placeholders replaced. Missing **or empty** dictionary entries fall back to the source string.

## Examples

### Basic Translation

```typescript
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

// Simple translation
const message = translate('Welcome to our store');
// Returns translated text from CSV or original if not found
```

### With Variables

```typescript
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

// Translation with variable interpolation
const greeting = translate('Hello ${name}', { name: 'John' });

const orderMessage = translate(
  'Order ${orderId} has been shipped',
  { orderId: '12345' }
);
```

### In Middleware

```typescript
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

export default async function checkoutMiddleware(request, response, next) {
  const errorMessage = translate('Payment method is required');
  
  if (!request.body.paymentMethod) {
    response.status(400).json({
      error: errorMessage
    });
    return;
  }
  
  next();
}
```

### With Context

```typescript
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

const successMessage = translate(
  'Product ${name} added to cart',
  { name: product.name }
);

const errorMessage = translate(
  'Only ${available} items available',
  { available: stock.toString() }
);
```

### For an Email or Cron Job

Off-request code has no ambient locale, so pass one explicitly:

```typescript
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

// Force a locale instead of relying on the ambient request (there is none here)
const subject = translate('Your order ${number} has shipped', { number }, 'de');
```

Without the third argument, a cron job or queue worker falls back to the default store language — which is usually not what you want for a customer-facing message.

## Translation Files

Translations live in the `translations/` directory at the project root, one folder per locale. Each folder holds **any number of `.csv` files** — they are merged into a single flat dictionary in sorted filename order, so a key defined in two files resolves deterministically (last file wins).

```
translations/
  ├── de/
  │   ├── account.csv
  │   ├── admin.csv
  │   ├── catalog.csv
  │   ├── checkout.csv
  │   └── general.csv
  ├── es/
  │   └── ...
  └── fr/
      └── ...
```

There is no folder for the source language (English): its dictionary is empty and `translate()` simply returns the source string.

### CSV format

Two columns — source text, then translation. The files are parsed with **`headers: false`**, so every row is data:

```csv
# Account strings
Login, Anmelden
Logout, Abmelden
"Hello ${name}","Hallo ${name}"
```

:::warning No header row
Because parsing runs headerless, a header row like `"English Text","Translated Text"` would be imported as a literal translation pair. Do not add one. Rows whose first column starts with `#` are treated as comments and skipped — that is the only way to annotate a file.
:::

Quote a field when it contains a comma or leading whitespace you want preserved.

## Notes

- Dictionaries are built from disk at bootstrap and held in memory for the process lifetime
- English text is used as the lookup key
- Falls back to the original English text when the entry is missing **or empty**
- Supports variable interpolation with `${variable}` syntax
- Placeholders not found in `values` remain unchanged
- Server-side only (it reads the request-scoped locale via `AsyncLocalStorage`)
- For React components and client code, use `_()` instead

## See Also

- [_](/docs/development/module/functions/underscore-translate) - Isomorphic translation for components and templates