---
sidebar_position: 39
keywords:
- logoutCustomer
- authentication
- logout
- customer
- session
groups:
- authentication
sidebar_label: request.logoutCustomer
title: request.logoutCustomer
description: Logout the currently logged-in customer.
---

# request.logoutCustomer

Logout the currently logged-in customer (frontend user). This function is available on the Express request object.

## Import

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";
```

## Syntax

```typescript
request.logoutCustomer(): void
```

### Parameters

None.

## Return Value

Returns `void`.

## Description

Clears the customer session and local customer data. After calling this method:
- `request.session.customerID` is set to `undefined`
- `request.locals.customer` is set to `undefined`
- `request.isCustomerLoggedIn()` will return `false`

## Examples

### Basic Logout

```typescript
export default async function logoutMiddleware(request, response) {
  request.logoutCustomer();
  response.json({ success: true });
}
```

### Logout with Redirect

```typescript
export default async function logoutMiddleware(request, response) {
  request.logoutCustomer();
  response.redirect('/');
}
```

## See Also

- [request.loginCustomerWithEmail](/docs/development/module/functions/request.loginCustomerWithEmail) - Login customer
- [request.isCustomerLoggedIn](/docs/development/module/functions/request.isCustomerLoggedIn) - Check login status
- [request.getCurrentCustomer](/docs/development/module/functions/request.getCurrentCustomer) - Get current customer
