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
  full_name: string;      // Recipient name
  address_1: string;      // Address line 1
  address_2?: string;     // Address line 2
  city?: string;          // City
  province: string;       // Province/State
  postcode: string;       // Postal code
  country: string;        // Country code
  telephone?: string;     // Phone number
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
  full_name: 'John Doe',
  address_1: '123 Main St',
  province: 'CA',
  postcode: '90001',
  country: 'US'
});
```

## Hooks

Supports hooks via registry:
- `customerAddressDataBeforeCreate` - Modify data before creation
- `insertCustomerAddressData` - Hook address insertion

## See Also

- [updateCustomerAddress](/docs/development/module/functions/updateCustomerAddress) - Update address
- [deleteCustomerAddress](/docs/development/module/functions/deleteCustomerAddress) - Delete address
- [validateAddress](/docs/development/module/functions/validateAddress) - Validate address data
- [addAddressValidationRule](/docs/development/module/functions/addAddressValidationRule) - Add validation rules
