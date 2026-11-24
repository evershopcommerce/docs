---
slug: createcustomer
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

Additional context for hooks. Code (never a request body) can also set these options here:

- `allowNoPassword: true`: create the account without a password when `data.password` is not given. A password nobody knows is stored, and the customer can choose one later with "Forgot your password?". Use it for a social login instead of making up a password.
- `passwordHash`: a bcrypt hash to store as it is, for an account moved from another store. It cannot be combined with `data.password`.
- `suppressRegistrationEvent: true`: emit neither `customer_registered` (which sends the welcome email) nor `account_created`, for a bulk import.

## Return Value

Returns `Promise<Customer>`: the new customer row. It includes the stored password hash, so never send it to a browser as it is.

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

- [updateCustomer](/docs/development/module/functions/updatecustomer) - Update customer
- [deleteCustomer](/docs/development/module/functions/deletecustomer) - Delete customer
- [updatePassword](/docs/development/module/functions/updatepassword) - Change password
- [getCustomersBaseQuery](/docs/development/module/functions/getcustomersbasequery) - Query customers
