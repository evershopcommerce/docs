---
sidebar_position: 75
keywords:
- updateCustomer
- customer
- profile
groups:
- customer
sidebar_label: updateCustomer
title: updateCustomer
description: Update customer profile information.
---

# updateCustomer

Update an existing customer's profile information.

## Import

```typescript
import { updateCustomer } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
updateCustomer(uuid: string, data: CustomerData, context?: Record<string, any>): Promise<Customer>
```

### Parameters

**`uuid`**

**Type:** `string`

Customer UUID.

**`data`**

**Type:** `CustomerData`

```typescript
{
  email?: string;
  full_name?: string;
  group_id?: number;
  status?: number;
}
```

**`context`** (optional)

**Type:** `Record<string, any>`

Additional context for hooks.

## Return Value

Returns `Promise<Customer>` with updated data (password excluded).

## Examples

### Update Full Name

```typescript
import { updateCustomer } from "@evershop/evershop/customer/services";

const customer = await updateCustomer(
  'customer-uuid',
  { full_name: 'Jane Doe' }
);
```

### Update Status

```typescript
import { updateCustomer } from "@evershop/evershop/customer/services";

// Deactivate customer
await updateCustomer(
  'customer-uuid',
  { status: 0 }
);
```

### Update Multiple Fields

```typescript
import { updateCustomer } from "@evershop/evershop/customer/services";

const customer = await updateCustomer(
  'customer-uuid',
  {
    full_name: 'John Smith',
    group_id: 2,
    status: 1
  }
);
```

## See Also

- [createCustomer](/docs/development/module/functions/createCustomer) - Create customer
- [deleteCustomer](/docs/development/module/functions/deleteCustomer) - Delete customer
- [updatePassword](/docs/development/module/functions/updatePassword) - Change password
- [getCustomersBaseQuery](/docs/development/module/functions/getCustomersBaseQuery) - Query customers
