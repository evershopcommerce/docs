---
sidebar_position: 74
keywords:
- createCustomer
- customer
- registration
groups:
- customer
sidebar_label: createCustomer
title: createCustomer
description: Create a new customer with validation and password hashing.
---

# createCustomer

Create a new customer account with email, password, and profile data.

## Import

```typescript
import { createCustomer } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
createCustomer(data: CustomerData, context?: Record<string, unknown>): Promise<Customer>
```

### Parameters

**`data`**

**Type:** `CustomerData`

```typescript
{
  email: string;           // Customer email (required)
  password: string;        // Plain text password (required)
  full_name: string;       // Customer full name (required)
  group_id?: number;       // Customer group ID (default: 1)
  status?: number;         // Account status (default: 1)
}
```

**`context`** (optional)

**Type:** `Record<string, unknown>`

Additional context for hooks.

## Return Value

Returns `Promise<Customer>` without password field.

## Examples

### Basic Customer Creation

```typescript
import { createCustomer } from "@evershop/evershop/customer/services";

const customer = await createCustomer({
  email: 'john@example.com',
  password: 'SecurePass123!',
  full_name: 'John Doe'
});

console.log(`Customer created with ID: ${customer.customer_id}`);
```

## See Also

- [updateCustomer](/docs/development/module/functions/updateCustomer) - Update customer
- [deleteCustomer](/docs/development/module/functions/deleteCustomer) - Delete customer
- [updatePassword](/docs/development/module/functions/updatePassword) - Change password
- [getCustomersBaseQuery](/docs/development/module/functions/getCustomersBaseQuery) - Query customers
