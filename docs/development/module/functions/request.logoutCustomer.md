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
request.logoutCustomer(callback?: (err: Error | null) => void): void
```

### Parameters

**`callback`**

**Type:** `(err: Error | null) => void` (optional)

Optional callback function called after session is saved.

## Return Value

Returns `void`.

## Examples

### Basic Logout

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

### With Redirect

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

### In API Endpoint

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

### With Callback

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function logoutMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
```

## See Also

- [request.loginCustomerWithEmail](/docs/development/module/functions/request.loginCustomerWithEmail) - Login customer
- [request.isCustomerLoggedIn](/docs/development/module/functions/request.isCustomerLoggedIn) - Check login status
- [request.getCurrentCustomer](/docs/development/module/functions/request.getCurrentCustomer) - Get current customer
