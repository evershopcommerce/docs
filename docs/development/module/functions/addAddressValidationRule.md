---
sidebar_position: 82
keywords:
- addAddressValidationRule
- customer
- address
- validation
groups:
- customer
sidebar_label: addAddressValidationRule
title: addAddressValidationRule
description: Add custom validation rule for customer addresses.
---

# addAddressValidationRule

Add a custom validation rule for customer address validation.

## Import

```typescript
import { addAddressValidationRule } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
addAddressValidationRule(rule: Validator<Address>): void
```

### Parameters

**`rule`**

**Type:** `Validator<Address>`

```typescript
{
  id: string;                           // Unique rule identifier
  func: (address: Address) => boolean;  // Validation function
  errorMessage: string;                 // Error message when invalid
}
```

## Return Value

Returns `void`.

## Examples

### Phone Number Validation

```typescript
import { addAddressValidationRule } from "@evershop/evershop/customer/services";

addAddressValidationRule({
  id: 'telephoneRequired',
  func: (address) => {
    return !!address.telephone && address.telephone.trim() !== '';
  },
  errorMessage: 'Phone number is required'
});
```

### In Bootstrap File

```typescript
// bootstrap.js
import { addAddressValidationRule } from "@evershop/evershop/customer/services";

// Add custom rules during app initialization
addAddressValidationRule({
  id: 'phoneFormat',
  func: (address) => {
    if (!address.telephone) return true;
    return /^\+?[\d\s-()]+$/.test(address.telephone);
  },
  errorMessage: 'Invalid phone number format'
});
```

## Notes

- Rules are global (affect all address validation)
- Add rules during app initialization using bootstrap file

## See Also

- [validateAddress](/docs/development/module/functions/validateAddress) - Validate address
- [createCustomerAddress](/docs/development/module/functions/createCustomerAddress) - Create address
- [updateCustomerAddress](/docs/development/module/functions/updateCustomerAddress) - Update address
