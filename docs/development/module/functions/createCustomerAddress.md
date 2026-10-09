---
sidebar_position: 78
keywords:
- createCustomerAddress
- customer
- address
groups:
- customer
sidebar_label: createCustomerAddress
title: createCustomerAddress
description: Create a new customer address with validation.
---

# createCustomerAddress

Create a new address for a customer with validation.

## Import

```typescript
import { createCustomerAddress } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
createCustomerAddress(customerUUID: string, address: Address, context?: Record<string, unknown>): Promise<Address>
```

### Parameters

**`customerUUID`**

**Type:** `string`

Customer UUID.

**`address`**

**Type:** `Address`

```typescript
{
  recipient?: string;            // Full name (single-field name mode)
  given_name?: string;           // With family_name when the store collects split names
  family_name?: string;
  organization?: string;         // Company
  address_line_1?: string;
  address_line_2?: string;
  address_line_3?: string;
  dependent_locality?: string;   // Ward / neighbourhood (region key where enumerated)
  locality?: string;             // City (region key where enumerated)
  administrative_area?: string;  // State / province region key, e.g. US-CA
  postal_code?: string;
  sorting_code?: string;
  country: string;               // ISO 3166-1 alpha-2 — the only key always required
  telephone?: string;            // Normalized to E.164
  extra?: Record<string, unknown>; // Registered extra fields
  is_default?: boolean;
  is_default?: number;    // Default address (0 or 1)
}
```

**`context`** (optional)

**Type:** `Record<string, unknown>`

Additional context for hooks.

## Return Value

Returns `Promise<Address>` with created address.

## Examples

### Basic Address Creation

```typescript
import { createCustomerAddress } from "@evershop/evershop/customer/services";

const address = await createCustomerAddress('customer-uuid', {
  recipient: 'John Doe',
  telephone: '+1 408 555 1234',
  address_line_1: '123 Main St',
  locality: 'Cupertino',
  administrative_area: 'US-CA',
  postal_code: '95014',
  country: 'US'
});
```

## Hooks

Which fields are required depends on the country's address schema; the service normalizes the input (trim, upper-case country, E.164 telephone), validates it with [`validateAddress`](/docs/development/module/functions/validateAddress) and throws an `AddressValidationError` whose `errors` array lists every failing field.

Supports hooks via registry:
- `customerAddressDataBeforeCreate` - Modify data before creation (the normalization seam runs here at priority 0)
- `insertCustomerAddressData` - Hook address insertion

## See Also

- [updateCustomerAddress](/docs/development/module/functions/updateCustomerAddress) - Update address
- [deleteCustomerAddress](/docs/development/module/functions/deleteCustomerAddress) - Delete address
- [validateAddress](/docs/development/module/functions/validateAddress) - Validate address data
- [addAddressValidationRule](/docs/development/module/functions/addAddressValidationRule) - Add validation rules
