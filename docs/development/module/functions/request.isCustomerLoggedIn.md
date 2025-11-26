---
sidebar_position: 40
keywords:
- isCustomerLoggedIn
- authentication
- login check
- customer
- session
groups:
- authentication
sidebar_label: request.isCustomerLoggedIn
title: request.isCustomerLoggedIn
description: Check if a customer is currently logged in.
---

# request.isCustomerLoggedIn

Check if a customer (frontend user) is currently logged in. This function is available on the Express request object.

## Syntax

```typescript
request.isCustomerLoggedIn(): boolean
```

### Parameters

None.

## Return Value

Returns `boolean`:
- `true` if customer is logged in
- `false` if customer is not logged in

## Examples

### Basic Check

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function accountMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse, 
  next: () => Promise<void>
) {
  if (!request.isCustomerLoggedIn()) {
    response.status(401).json({
      success: false,
      message: 'Please login to continue'
    });
    return;
  }
  
  await next();
}
```

### With Redirect

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function checkoutMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse, 
  next: () => Promise<void>
) {
  if (!request.isCustomerLoggedIn()) {
    response.redirect('/login?redirect=/checkout');
    return;
  }
  
  await next();
}
```

### Conditional Response

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function headerMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const isLoggedIn = request.isCustomerLoggedIn();
  
  response.json({
    isAuthenticated: isLoggedIn,
    customer: isLoggedIn ? request.getCurrentCustomer() : null
  });
}
```

### Protected Route

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function ordersMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  if (!request.isCustomerLoggedIn()) {
    response.status(401).json({
      success: false,
      message: 'Please login to view orders'
    });
    return;
  }
  
  const customer = request.getCurrentCustomer();
  const orders = await getCustomerOrders(customer.customer_id);
  
  response.json({ success: true, orders });
}
```

### Guest vs Logged-In Flow

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function cartMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse, 
  next: () => Promise<void>
) {
  if (request.isCustomerLoggedIn()) {
    // Merge guest cart with customer cart
    await mergeGuestCart(request);
  }
  
  await next();
}
```

## Notes

- Returns `true` if `request.session.customerID` exists
- Returns `false` if session or customerID is undefined
- This function is for frontend customers (not admin users)
- Available on Express request object after customer module bootstrap
- Useful for protecting customer-only routes
- Does not validate if the customer still exists in database

## See Also

- [request.loginCustomerWithEmail](/docs/development/module/functions/request.loginCustomerWithEmail) - Login customer
- [request.logoutCustomer](/docs/development/module/functions/request.logoutCustomer) - Logout customer
- [request.getCurrentCustomer](/docs/development/module/functions/request.getCurrentCustomer) - Get current customer
