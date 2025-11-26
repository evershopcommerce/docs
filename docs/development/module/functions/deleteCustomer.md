---
sidebar_position: 76
keywords:
- deleteCustomer
- customer
- remove
groups:
- customer
sidebar_label: deleteCustomer
title: deleteCustomer
description: Delete a customer account.
---

# deleteCustomer

Delete a customer account and related data.

## Import

```typescript
import { deleteCustomer } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
deleteCustomer(uuid: string, context?: Record<string, any>): Promise<Customer>
```

### Parameters

**`uuid`**

**Type:** `string`

Customer UUID to delete.

**`context`** (optional)

**Type:** `Record<string, any>`

Additional context for hooks.

## Return Value

Returns `Promise<Customer>` with deleted customer data (password excluded).

## Examples

### Basic Deletion

```typescript
import { deleteCustomer } from "@evershop/evershop/customer/services";

const deletedCustomer = await deleteCustomer('customer-uuid');
console.log(`Deleted customer: ${deletedCustomer.email}`);
```

## Hooks

Supports hooks via registry:
- `deleteCustomerData` - Hook deletion operation
- Can intercept to delete related data

Example hook for related data:

```typescript
import { hookBefore } from "@evershop/evershop/lib/util/hookable";

hookBefore('deleteCustomerData', async (uuid, connection) => {
  // Delete customer addresses
  await del('customer_address')
    .where('customer_id', '=', customer.customer_id)
    .execute(connection);
});
```

## See Also

- [createCustomer](/docs/development/module/functions/createCustomer) - Create customer
- [updateCustomer](/docs/development/module/functions/updateCustomer) - Update customer
- [getCustomersBaseQuery](/docs/development/module/functions/getCustomersBaseQuery) - Query customers
