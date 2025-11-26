---
sidebar_position: 77
keywords:
- updatePassword
- customer
- password
- security
groups:
- customer
sidebar_label: updatePassword
title: updatePassword
description: Update customer password with validation and hashing.
---

# updatePassword

Update a customer's password with security validation and hashing.

## Import

```typescript
import { updatePassword } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
updatePassword(customerId: number, newPassword: string, context?: Record<string, unknown>): Promise<boolean>
```

### Parameters

**`customerId`**

**Type:** `number`

Customer ID (not UUID).

**`newPassword`**

**Type:** `string`

New password in plain text.

**`context`** (optional)

**Type:** `Record<string, unknown>`

Additional context for hooks.

## Return Value

Returns `Promise<boolean>` - `true` on success.

## Examples

### Basic Password Update

```typescript
import { updatePassword } from "@evershop/evershop/customer/services";

await updatePassword(123, 'NewSecurePass123!');
console.log('Password updated successfully');
```

## Hooks

Supports hooks via registry:
- `updateCustomerPassword` - Hook password update

## See Also

- [createCustomer](/docs/development/module/functions/createCustomer) - Create customer
- [updateCustomer](/docs/development/module/functions/updateCustomer) - Update profile
