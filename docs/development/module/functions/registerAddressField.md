---
sidebar_position: 85
keywords:
- registerAddressField
- address
- extra field
- tax id
- checkout
groups:
- address
sidebar_label: registerAddressField
title: registerAddressField
description: Add an extra address field without a migration.
---

# registerAddressField

Adds a field to the address form and the server validation **without a database column**: the value is stored in the `extra` JSONB column of the customer, cart and order address rows, travels from the address book to the cart to the order, and comes back under `extra` in GraphQL and REST.

## Import

```typescript
import { registerAddressField } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
registerAddressField(definition: ExtraFieldDefinition): void
```

### Parameters

**`definition`**

```typescript
{
  id: string;                      // Field id; must not collide with a shared column (recipient, locality, …)
  type: 'text' | 'select' | 'tel' | 'textarea' | 'number' | 'email';
  label: string;                   // English source string, translated with the store dictionary
  required?: boolean;
  pattern?: { regex: string; messageKey: string };   // messageKey is an English source string, ${field} = the label
  placeholder?: string;
  countries?: string[];            // Only these countries collect it. Absent = every country
  surfaces?: ('account' | 'shipping' | 'billing')[];   // Which forms collect it. Absent = all three
  after?: string;                  // Placement anchor (a field id); absent = after the last postal field
}
```

## Return Value

Returns `void`. Throws after bootstrap, for an empty id, or for an id that names a shared column.

## Examples

### A tax ID for business customers in two countries

```typescript
// bootstrap.ts
import { registerAddressField } from '@evershop/evershop/lib/address';

export default () => {
  registerAddressField({
    id: 'tax_id',
    type: 'text',
    label: 'Tax ID',
    countries: ['IT', 'ES'],
    pattern: { regex: '^[A-Z0-9]{8,16}$', messageKey: '${field} is not valid' },
    after: 'organization'
  });
};
```

### A nickname collected only in the address book

```typescript
registerAddressField({
  id: 'nickname',
  type: 'text',
  label: 'Address nickname',
  surfaces: ['account']
});
```

The nickname is stored in `extra`, copied verbatim to the cart when the customer reuses the saved address at checkout, and reaches the order — none of the three tables changes.

## Notes

- Payloads may send the field as a top-level key or inside `extra`; the services fold it into `extra`.
- A key that is not a column and not a registered field is rejected with `unknown_field` — a typo never becomes silently discarded input.
- Labels translate through the store dictionary when a CSV row for the English string exists; extensions cannot ship dictionaries yet, so the label is English until the merchant adds the row.
- Read it back with `address.extra.tax_id` (GraphQL `extra: JSON`, REST `extra`). It renders on the storefront through the same renderer map as the built-in fields.

## See Also

- [patchAddressFormat](/docs/development/module/functions/patchAddressFormat) - Change the built-in fields instead
- [Address Form](/docs/development/theme/components/AddressForm) - How the field renders and how a theme decorates it
- [Address formats](/docs/development/knowledge-base/address-formats#extra-fields) - Storage and lifecycle of `extra`
