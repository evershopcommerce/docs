---
sidebar_position: 80
keywords:
- deleteCustomerAddress
- customer
- address
groups:
- customer
sidebar_label: deleteCustomerAddress
title: deleteCustomerAddress
description: Delete a customer address.
---

# deleteCustomerAddress

Delete an existing customer address.

## Import

```typescript
import { deleteCustomerAddress } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
deleteCustomerAddress(uuid: string, context?: Record<string, unknown>): Promise<Address>
```

### Parameters

**`uuid`**

**Type:** `string`

Address UUID to delete.

**`context`** (optional)

**Type:** `Record<string, unknown>`

Additional context for hooks.

## Return Value

Returns `Promise<Address>` with deleted address data.

## Examples

### Basic Deletion

```typescript
import { deleteCustomerAddress } from "@evershop/evershop/customer/services";

const deletedAddress = await deleteCustomerAddress('address-uuid');
console.log(`Deleted address: ${deletedAddress.address_1}`);
```

## Hooks

Supports hooks via registry:
- `deleteCustomerAddressData` - Hook deletion operation

Example hook:

```typescript
import { hookBefore } from "@evershop/evershop/lib/util/hookable";

hookBefore('deleteCustomerAddressData', async (uuid, connection) => {
  // Perform additional cleanup
  console.log(`Deleting address: ${uuid}`);
});
```

## See Also

- [createCustomerAddress](/docs/development/module/functions/createCustomerAddress) - Create address
- [updateCustomerAddress](/docs/development/module/functions/updateCustomerAddress) - Update address
- [validateAddress](/docs/development/module/functions/validateAddress) - Validate address
