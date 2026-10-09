---
sidebar_position: 83
keywords:
- patchAddressFormat
- address
- address format
- country
- bootstrap
groups:
- address
sidebar_label: patchAddressFormat
title: patchAddressFormat
description: Change a country's address format record from an extension.
---

# patchAddressFormat

Overrides fields of a country's **address format record** — the layout, the required tokens, the postal-code pattern, the label types, the telephone rule — from an extension's `bootstrap.ts`. The patched record drives the storefront form, the server validation, the summary lines, the admin order view, the order email and the carrier payload at once.

## Import

```typescript
import { patchAddressFormat } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
patchAddressFormat(country: string, patch: Partial<AddressFormat>): void
```

### Parameters

**`country`** — ISO 3166-1 alpha-2 code (`'VN'`). Case-insensitive.

**`patch`** — the fields to override. Scalars replace the bundled value; `fmt` and `lfmt` are replaced whole; `telephone` is replaced whole, so repeat `dialCode` when you set a pattern.

```typescript
{
  fmt?: string;            // Layout: %N name, %O company, %A street lines, %D ward/neighbourhood,
                           // %C city, %S state/province, %Z postal code, %X sorting code, %n line break
  lfmt?: string;           // Latin-script layout, when the native order differs (JP, CN, HK …)
  require?: string;        // Required tokens as letters, e.g. 'ACSZ'
  upper?: string;          // Tokens printed upper-case on an envelope (display only)
  zip?: string;            // Postal-code pattern (unanchored; the library anchors it)
  zipex?: string;          // Examples, comma-separated; the first becomes the placeholder
  state_name_type?: 'province' | 'state' | 'prefecture' | 'area' | 'county' | 'emirate' | 'department'
    | 'district' | 'do_si' | 'island' | 'oblast' | 'parish' | 'region';
  locality_name_type?: 'city' | 'district' | 'post_town' | 'suburb';
  sublocality_name_type?: 'suburb' | 'district' | 'neighborhood' | 'village' | 'village_township' | 'townland' | 'ward';
  zip_name_type?: 'postal' | 'zip' | 'pin' | 'eircode';
  address_lines?: 1 | 2 | 3;                       // How many %A lines to collect (default 2)
  name_order?: 'given_first' | 'family_first';     // Order used to compose the recipient from split names
  telephone?: { pattern?: string; example?: string; dialCode?: string };
}
```

## Return Value

Returns `void`. Throws after bootstrap (the address registry is locked), when `country` is empty or `patch` is not an object.

## Examples

### Add a ward line and a telephone rule (the `address-vn` package)

```typescript
// bootstrap.ts
import { patchAddressFormat } from '@evershop/evershop/lib/address';

export default () => {
  patchAddressFormat('VN', {
    fmt: '%N%n%O%n%A%n%D%n%C%n%S',
    require: 'ADS',
    sublocality_name_type: 'ward',
    telephone: { dialCode: '+84', pattern: '^(\\+84|0)[0-9]{9}$', example: '0912 345 678' }
  });
};
```

### Make the company line mandatory for one country

```typescript
patchAddressFormat('DE', { require: 'ACZO' });
```

## Notes

- Patches stack: several extensions may patch the same country; later registrations win field by field.
- Labels follow the `*_name_type` values and are translated by core (`ward` → "Ward" / "Phường"); a patch ships no translation file.
- A new `%D` or `%S` token is a free-text field until a region provider enumerates that level — see [registerRegionProvider](/docs/development/module/functions/registerRegionProvider).
- Resolution is cached per `(country, locale)` and invalidated by every registry change, so the patch is visible immediately after bootstrap.

## See Also

- [registerRegionProvider](/docs/development/module/functions/registerRegionProvider) - Enumerate the levels the layout collects
- [resolveAddressSchema](/docs/development/module/functions/resolveAddressSchema) - The schema derived from the record
- [Address formats](/docs/development/knowledge-base/address-formats) - Records, tokens and the bundled data
