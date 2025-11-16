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
translate(enText: string, values?: Record<string, string>): string
```

### Parameters

**`enText`**

**Type:** `string`

The English text to translate. This is used as the key to lookup translation in CSV files.

**`values`**

**Type:** `Record<string, string>` (optional)

Object containing values to replace placeholders in the translated text.

## Return Value

Returns `string` - the translated text with placeholders replaced, or original text if translation not found.

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

## Translation Files

Translations are loaded from CSV files in the `translations/` directory:

```
translations/
  ├── de/
  │   └── translation.csv
  ├── es/
  │   └── translation.csv
  └── fr/
      └── translation.csv
```

CSV format:
```csv
"English Text","Translated Text"
"Welcome to our store","Bienvenido a nuestra tienda"
"Hello ${name}","Hola ${name}"
```

## Notes

- Loads translations from CSV files once at startup
- English text is used as the lookup key
- Falls back to original English text if translation not found
- Supports variable interpolation with `${variable}` syntax
- Placeholders not found in values remain unchanged
- Used on server-side (middleware, services)
- For React components, use `_()` function instead