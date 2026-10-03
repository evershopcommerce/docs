---
sidebar_position: 81
keywords:
- validateAddress
- address
- validation
- address schema
groups:
- address
sidebar_label: validateAddress
title: validateAddress
description: Validate an address against its country's address schema.
---

# validateAddress

Validates an address against the **address schema of its country** — the same schema the storefront form renders from — and returns every failing field with a code and a translated message. Used by the customer-address and cart-address services; call it yourself when you write addresses from an extension.

## Import

```typescript
import { validateAddress } from '@evershop/evershop/lib/address';
```

The customer services barrel re-exports it: `import { validateAddress } from '@evershop/evershop/customer/services'`.

## Syntax

```typescript
await validateAddress(address: AddressRow, options?: ValidateAddressOptions): Promise<AddressValidationResult>
```

### Parameters

**`address`**

**Type:** `AddressRow` (`@evershop/evershop/types/address` exports it as `Address`)

The row to validate, in the shared address vocabulary. Extra fields may be top-level keys or live under `extra`.

```typescript
{
  recipient?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  organization?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  address_line_3?: string | null;
  dependent_locality?: string | null;
  locality?: string | null;
  administrative_area?: string | null;
  postal_code?: string | null;
  sorting_code?: string | null;
  country?: string | null;
  telephone?: string | null;
  extra?: Record<string, unknown> | null;
}
```

**`options`** (optional)

```typescript
{
  locale?: string;          // Language of the messages and of the schema. Default: the request locale
  previous?: AddressRow;    // The stored row on an update; drives the split-name rule
  surface?: 'account' | 'shipping' | 'billing';
                            // Which form: shipping also requires a country a zone covers
  translate?: (text: string, values?: Record<string, string>) => string;
                            // Override the translator (tests)
}
```

## Return Value

```typescript
{
  valid: boolean;
  errors: AddressError[];   // [{ field?: string, code: string, message: string }]
}
```

`code` is one of `unknown_field`, `required`, `pattern`, `region_invalid`, `type`, `country_not_allowed`, or the code of a rule added with `addAddressValidationRule`. `message` is translated with the field label interpolated ("ZIP code is not valid").

## Examples

### Basic Validation

```typescript
import { validateAddress } from '@evershop/evershop/lib/address';

const result = await validateAddress({
  recipient: 'John Doe',
  telephone: '+1 408 555 1234',
  address_line_1: '123 Main St',
  locality: 'Cupertino',
  administrative_area: 'US-CA',
  postal_code: '9501',
  country: 'US'
});

if (!result.valid) {
  // [{ field: 'postal_code', code: 'pattern', message: 'ZIP code is not valid' }]
  console.error(result.errors);
}
```

### Validate against a schema you already resolved

```typescript
import { resolveAddressSchema, validateAddressAgainstSchema } from '@evershop/evershop/lib/address';

const schema = resolveAddressSchema('HK', 'en', { surface: 'shipping' });
const result = await validateAddressAgainstSchema(address, schema);
```

## Notes

- The function is **async**: region keys are checked through the country's region provider.
- Normalize before you validate when you accept raw input: the services trim values, upper-case the country and convert the telephone to E.164 first.
- Returns every error at once, so a form can highlight all the fields.
- Throws nothing for an invalid address — read `valid`.

## See Also

- [addAddressValidationRule](/docs/development/module/functions/addAddressValidationRule) - Add validation rules
- [resolveAddressSchema](/docs/development/module/functions/resolveAddressSchema) - The schema the validation uses
- [Address formats](/docs/development/knowledge-base/address-formats) - Vocabulary, region keys and settings
