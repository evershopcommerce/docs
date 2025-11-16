---
sidebar_position: 81
keywords:
- validateAddress
- customer
- address
- validation
groups:
- customer
sidebar_label: validateAddress
title: validateAddress
description: Validate customer address data.
---

# validateAddress

Validate customer address data against defined rules.

## Import

```typescript
import { validateAddress } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
validateAddress(address: Address): { valid: boolean; errors: string[] }
```

### Parameters

**`address`**

**Type:** `Address`

Address object to validate.

```typescript
{
  full_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
}
```

## Return Value

Returns validation result:

```typescript
{
  valid: boolean;    // True if all rules pass
  errors: string[];  // Array of error messages
}
```

## Examples

### Basic Validation

```typescript
import { validateAddress } from "@evershop/evershop/customer/services";

const result = validateAddress({
  full_name: 'John Doe',
  address_1: '123 Main St',
  province: 'CA',
  postcode: '90001',
  country: 'US'
});

if (result.valid) {
  console.log('Address is valid');
} else {
  console.error('Validation errors:', result.errors);
}
```

## Notes

- Returns all validation errors
- Extensible via `addAddressValidationRule`
- Used internally by create/update functions

## See Also

- [addAddressValidationRule](/docs/development/module/functions/addAddressValidationRule) - Add validation rules
- [createCustomerAddress](/docs/development/module/functions/createCustomerAddress) - Create address
- [updateCustomerAddress](/docs/development/module/functions/updateCustomerAddress) - Update address
