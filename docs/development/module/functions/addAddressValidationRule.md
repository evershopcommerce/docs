---
sidebar_position: 82
keywords:
- addAddressValidationRule
- address
- validation
groups:
- address
sidebar_label: addAddressValidationRule
title: addAddressValidationRule
description: Add a custom validation rule that runs after the schema checks.
---

# addAddressValidationRule

Adds a rule that runs on every address write (customer address book, cart shipping and billing addresses) **after** the schema-derived checks, with the resolved schema as its second argument. Register it from `bootstrap.ts`; the call throws once the address registry is locked.

## Import

```typescript
import { addAddressValidationRule } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
addAddressValidationRule(rule: AddressValidationRule): void
```

### Parameters

**`rule`**

```typescript
{
  id: string;                          // Unique rule identifier; registering the same id again replaces the rule
  func: (address: AddressRow, schema: ResolvedAddressSchema) => boolean | Promise<boolean>;
                                       // true = passes
  error: {
    field?: string;                    // The field to highlight (a column or an extra field id); omit for a cross-field rule
    code: string;                      // Your error code, returned as errors[].code
    message: string;                   // English source string; translated on return, ${field} is the field's label
  };
}
```

## Return Value

Returns `void`.

## Examples

### Require a PO box free street line

```typescript
// bootstrap.ts
import { addAddressValidationRule } from '@evershop/evershop/lib/address';

export default () => {
  addAddressValidationRule({
    id: 'noPoBox',
    func: (address) => !/\bP\.?O\.? ?Box\b/i.test(address.address_line_1 ?? ''),
    error: {
      field: 'address_line_1',
      code: 'po_box',
      message: 'We cannot deliver to a PO box'
    }
  });
};
```

### A rule that depends on the country's schema

```typescript
addAddressValidationRule({
  id: 'companyForBusinessCountries',
  func: (address, schema) =>
    schema.country !== 'DE' || Boolean(address.organization?.trim()),
  error: { field: 'organization', code: 'required', message: '${field} is required' }
});
```

## Notes

- Rules are global and run for all three surfaces (account, shipping, billing).
- The storefront cannot run your rule; its error reaches the input through `error.errors[]` on submit, which the form maps onto the field named in `error.field`.
- The old shape `{ id, func, errorMessage }` and the synchronous `validateAddress` were removed with the address-format release.

## See Also

- [validateAddress](/docs/development/module/functions/validateAddress) - Validate address
- [registerAddressField](/docs/development/module/functions/registerAddressField) - Add a field instead of a rule
- [Address formats](/docs/development/knowledge-base/address-formats) - How schemas are resolved
