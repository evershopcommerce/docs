---
sidebar_position: 87
keywords:
- formatAddress
- address
- formatted
- display
- envelope
groups:
- address
sidebar_label: formatAddress
title: formatAddress
description: Print an address as display lines in the layout of its country.
---

# formatAddress

Turns address values into **display lines** in the layout of a country — the same lines GraphQL returns as `formatted`, the order email prints, and the storefront preview shows. Two entry points: `formatAddress` for values you already resolved (region names, not keys), `formatAddressRow` for a stored row (it resolves the names for you).

## Import

```typescript
import { formatAddress, formatAddressRow } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
formatAddress(values: FormatAddressValues, format: string, options?: { includeCountry?: boolean }): string[]

await formatAddressRow(row: AddressRow, locale?: string, options?: { includeCountry?: boolean }): Promise<string[]>
```

### Parameters

**`values`** — token → text, or an array of lines for `A`:

```typescript
{
  N?: string;            // recipient
  O?: string;            // organization
  A?: string | string[]; // street lines
  D?: string;            // dependent locality (resolved name)
  C?: string;            // locality (resolved name)
  S?: string;            // administrative area (resolved name)
  Z?: string;            // postal code
  X?: string;            // sorting code
  country?: string;      // country display name, appended as the last line
}
```

**`format`** — a layout string such as `'%N%n%O%n%A%n%C, %S %Z'` (`%n` is a line break). Take it from `resolveAddressSchema(country, locale).format` so the script choice (native or Latin order) matches the reader.

**`options.includeCountry`** — append the country line. Default `true`.

## Return Value

An array of non-empty lines. Empty tokens disappear together with the punctuation that would have surrounded them; `upper` is **not** applied (it is carried for envelope printers only).

## Examples

### From resolved values

```typescript
import { formatAddress, resolveAddressSchema } from '@evershop/evershop/lib/address';

const { format } = resolveAddressSchema('US', 'en');
formatAddress(
  { N: 'Ada Lovelace', A: ['1 Infinite Loop', 'Suite 2'], C: 'Cupertino', S: 'California', Z: '95014', country: 'United States' },
  format
);
// ['Ada Lovelace', '1 Infinite Loop', 'Suite 2', 'Cupertino, California 95014', 'United States']
```

### From a stored row

```typescript
import { formatAddressRow } from '@evershop/evershop/lib/address';

const lines = await formatAddressRow(orderAddressRow, 'vi');
// Region keys (VN-SG, a ward code) become names; the country code becomes its name.
```

## Notes

- Every display surface in core goes through this function, so a package that patches a country's `fmt` changes the summary, the admin view and the email together.
- A reader whose language is not the country's native one gets the Latin layout (`lfmt`) and the Latin region names when the data has them (Hong Kong: name first for an English reader, area first for a Chinese reader).
- Custom email templates print `{{#each shippingAddress.formatted}}{{this}}<br>{{/each}}` instead of naming fields.

## See Also

- [resolveAddressSchema](/docs/development/module/functions/resolveAddressSchema) - Where `format` comes from
- [toIntegrationAddress](/docs/development/module/functions/toIntegrationAddress) - Field-by-field mapping for payment and carrier APIs
- [Address formats](/docs/development/knowledge-base/address-formats#formatting-and-display) - Display rules
