---
sidebar_position: 79
keywords:
- updateCustomerAddress
- customer
- address
groups:
- customer
sidebar_label: updateCustomerAddress
title: updateCustomerAddress
description: Update an existing customer address with validation.
---

# updateCustomerAddress

Update an existing customer address with validation.

## Import

```typescript
import { updateCustomerAddress } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
updateCustomerAddress(uuid: string, data: Partial<Address>, context?: Record<string, unknown>): Promise<Address>
```

### Parameters

**`uuid`**

**Type:** `string`

Address UUID.

**`data`**

**Type:** `Partial<Address>`

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
  is_default?: number;
}
```

**`context`** (optional)

**Type:** `Record<string, unknown>`

Additional context for hooks.

## Return Value

Returns `Promise<Address>` with updated address.

## Examples

### Update Phone Number

```typescript
import { updateCustomerAddress } from "@evershop/evershop/customer/services";

const address = await updateCustomerAddress('address-uuid', {
  telephone: '+1-555-9999'
});
```

### Set as Default Address

```typescript
import { updateCustomerAddress } from "@evershop/evershop/customer/services";

await updateCustomerAddress('address-uuid', {
  is_default: 1
});
```

## Hooks

Supports hooks via registry:
- `customerDataBeforeUpdate` - Modify data before update
- `updateCustomerAddressData` - Hook address update

## See Also

- [createCustomerAddress](/docs/development/module/functions/createCustomerAddress) - Create address
- [deleteCustomerAddress](/docs/development/module/functions/deleteCustomerAddress) - Delete address
- [validateAddress](/docs/development/module/functions/validateAddress) - Validate address
- [addAddressValidationRule](/docs/development/module/functions/addAddressValidationRule) - Add validation rules
