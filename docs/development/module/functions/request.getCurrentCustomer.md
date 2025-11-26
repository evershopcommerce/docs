---
sidebar_position: 41
keywords:
- getCurrentCustomer
- authentication
- current customer
- customer
- session
groups:
- authentication
sidebar_label: request.getCurrentCustomer
title: request.getCurrentCustomer
description: Get the currently logged-in customer data.
---

# request.getCurrentCustomer

Get the currently logged-in customer (frontend user) data. This function is available on the Express request object.

## Import

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";
import { CurrentCustomer } from "@evershop/evershop/types/request";
```

## Syntax

```typescript
request.getCurrentCustomer(): CurrentCustomer | null
```

### Parameters

None.

## Return Value

Returns `CurrentCustomer` object if logged in, or `null` if not logged in.

The customer object contains customer data without the password field.

## Examples

### Basic Usage

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function accountMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const customer = request.getCurrentCustomer();
  
  if (!customer) {
    response.status(401).json({
      success: false,
      message: 'Not logged in'
    });
    return;
  }
  
  response.json({
    success: true,
    customer: {
      id: customer.customer_id,
      email: customer.email,
      full_name: customer.full_name
    }
  });
}
```

### With Check

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function profileMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  if (!request.isCustomerLoggedIn()) {
    response.redirect('/login');
    return;
  }
  
  const customer = request.getCurrentCustomer();
  
  response.json({
    welcome: `Welcome back, ${customer.full_name}`,
    email: customer.email
  });
}
```

### Access Customer Properties

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function orderMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const customer = request.getCurrentCustomer();
  
  if (customer) {
    const orders = await getOrders(customer.customer_id);
    
    response.json({
      customer_id: customer.customer_id,
      customer_name: customer.full_name,
      orders
    });
  } else {
    response.status(401).json({ message: 'Unauthorized' });
  }
}
```

### In Middleware

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function checkoutMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse, 
  next: () => Promise<void>
) {
  const customer = request.getCurrentCustomer();
  
  if (!customer) {
    response.redirect('/login?redirect=/checkout');
    return;
  }
  
  // Add customer info to checkout
  request.body.customer_id = customer.customer_id;
  request.body.customer_email = customer.email;
  
  await next();
}
```

### Personalization

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function recommendationsMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const customer = request.getCurrentCustomer();
  
  let recommendations;
  
  if (customer) {
    // Personalized recommendations based on purchase history
    recommendations = await getPersonalizedRecommendations(customer.customer_id);
  } else {
    // Generic recommendations for guests
    recommendations = await getPopularProducts();
  }
  
  response.json({ recommendations });
}
```

## Customer Object Structure

The returned customer object has the following TypeScript interface:

```typescript
interface CurrentCustomer {
  customer_id: number;
  group_id: number;
  uuid: string;
  email: string;
  full_name: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  // Note: password field is always excluded
}
```

## Notes

- Returns `null` if no customer is logged in
- This function is for frontend customers (not admin users)
- Customer data is stored in `request.locals.customer`
- Password field is always excluded from the customer object
- Available on Express request object after customer module bootstrap
- Customer data is set during login via `request.loginCustomerWithEmail()`
- Always check if customer exists before accessing properties

## See Also

- [request.loginCustomerWithEmail](/docs/development/module/functions/request.loginCustomerWithEmail) - Login customer
- [request.logoutCustomer](/docs/development/module/functions/request.logoutCustomer) - Logout customer
- [request.isCustomerLoggedIn](/docs/development/module/functions/request.isCustomerLoggedIn) - Check login status
