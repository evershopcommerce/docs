---
slug: getcustomerbyemail
sidebar_position: 143
keywords:
- getCustomerByEmail
- customer
- email
- social login
groups:
- customer
sidebar_label: getCustomerByEmail
title: getCustomerByEmail
description: Find a customer by email address, in any letter case.
---

# getCustomerByEmail

Finds the customer with an email address, in any letter case and with any status. EverShop treats `Jane@x.com` and `jane@x.com` as one account (sign-up refuses the second, login accepts either), so look customers up with this function rather than `where('email', '=', ...)`.

## Import

```typescript
import { getCustomerByEmail } from '@evershop/evershop/customer/services';
```

## Syntax

```typescript
getCustomerByEmail(email: string): Promise<Omit<CustomerRow, 'password'> | null>
```

### Parameters

**`email`**

**Type:** `string`

The address to look for. It is matched literally: `%` and `_` are not wildcards.

## Return Value

The customer row without the password hash, including any columns an extension added to the `customer` table, or `null` when there is no such customer (or `email` is empty).

A disabled account (status `0`) is returned too, so check `status` before you sign the customer in.

## Example

```typescript
import { getCustomerByEmail } from '@evershop/evershop/customer/services';

const customer = await getCustomerByEmail('Jane@Example.com');
if (customer && customer.status === 1) {
  await request.loginCustomer(customer.customer_id);
}
```

## See Also

- [request.loginCustomer](/docs/development/module/functions/request.logincustomer) - Sign in without a password
- [createCustomer](/docs/development/module/functions/createcustomer) - Create a customer
