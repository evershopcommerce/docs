---
sidebar_position: 86
keywords:
- resolveAddressSchema
- address
- address schema
- addressSchema
- form
groups:
- address
sidebar_label: resolveAddressSchema
title: resolveAddressSchema
description: "Resolve the address form of a country: fields, labels, requiredness, patterns."
---

# resolveAddressSchema

Resolves the **address schema** of a country for a locale: the ordered list of fields with their type, label type, requiredness, pattern and region source. The storefront fetches it as `addressSchema(country, locale, surface)` in GraphQL; the server validates against it; call it yourself when you need to know what a country collects.

## Import

```typescript
import { resolveAddressSchema } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
resolveAddressSchema(country: string, locale?: string, options?: {
  surface?: 'account' | 'shipping' | 'billing';
  settings?: AddressSettings;   // Override the store's address settings (tests)
  applyHook?: boolean;          // false skips the `addressSchema` processor
}): ResolvedAddressSchema
```

`''` or an unknown code resolves the DEFAULT record (name, company, street lines, city). `locale` defaults to the request locale.

## Return Value

```typescript
{
  country: string;
  locale: string;
  script: 'native' | 'latin';     // Which layout was chosen for this reader
  format: string;                 // The layout string used, e.g. '%N%n%O%n%A%n%C, %S %Z'
  nameOrder: 'given_first' | 'family_first';
  upper: string[];                // Tokens an envelope prints upper-case (display only)
  fields: Array<{
    id: string;                   // Column or extra field id
    token?: 'N' | 'O' | 'A' | 'D' | 'C' | 'S' | 'Z' | 'X';
    type: 'text' | 'select' | 'tel' | 'textarea' | 'number' | 'email';
    labelType: string;            // 'city', 'state', 'zip', 'ward', … or 'extra'
    label?: string;               // English label for extra fields
    required: boolean;
    pattern?: { regex: string; messageKey: string };
    placeholder?: string;
    optionSource?: 'regions';     // Options come from regions(country, parentPath)
    dependsOn?: string;           // The outer level whose value parameterises the options
    row: number;                  // Fields with the same row share a line
  }>;
}
```

## Examples

### What does Hong Kong collect?

```typescript
import { resolveAddressSchema } from '@evershop/evershop/lib/address';

const schema = resolveAddressSchema('HK', 'en');
schema.fields.map((f) => f.id);
// ['country', 'recipient', 'telephone', 'organization', 'address_line_1', 'address_line_2', 'locality', 'administrative_area']
schema.fields.find((f) => f.id === 'postal_code'); // undefined — Hong Kong has no postal code
```

### Hide the telephone for the whole store

```typescript
// bootstrap.ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  addProcessor('addressSchema', (schema) => ({
    ...schema,
    fields: schema.fields.filter((f) => f.id !== 'telephone')
  }));
};
```

The storefront form and the server validation both read the processed schema, so neither asks for the field.

## Notes

- The result is cached per `(country, locale)` and invalidated by every registry change (patch, provider, extra field), so it is cheap to call per request.
- Rows and order follow the country's layout; the country select is always first and the telephone follows the name.
- `script` and `format` also decide the order of the printed `formatted` lines, so the form and the summary always agree.

## See Also

- [validateAddress](/docs/development/module/functions/validateAddress) - Validate a row against the schema
- [formatAddress](/docs/development/module/functions/formatAddress) - Print lines with the same layout
- [Address formats](/docs/development/knowledge-base/address-formats#resolution) - The resolution pipeline
