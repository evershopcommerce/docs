---
sidebar_position: 38
keywords:
- loginCustomerWithEmail
- authentication
- login
- customer
- session
groups:
- authentication
sidebar_label: request.loginCustomerWithEmail
title: request.loginCustomerWithEmail
description: Login a customer with email and password.
---

# request.loginCustomerWithEmail

Login a customer (frontend user) with email and password. This function is available on the Express request object.

## Import

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";
```

## Syntax

```typescript
request.loginCustomerWithEmail(
  email: string, 
  password: string, 
  callback?: (err: Error | null, customer?: any) => void
): Promise<void>
```

### Parameters

**`email`**

**Type:** `string`

The customer's email address.

**`password`**

**Type:** `string`

The customer's password.

**`callback`**

**Type:** `(err: Error | null, customer?: any) => void` (optional)

Optional callback function called after session is saved.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Login

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function loginMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const { email, password } = request.body;
  
  try {
    await request.loginCustomerWithEmail(email, password);
    
    response.json({
      success: true,
      customer: request.getCurrentCustomer()
    });
  } catch (error) {
    response.status(401).json({
      success: false,
      message: error.message
    });
  }
}
```

### With Redirect

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function loginMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const { email, password } = request.body;
  
  try {
    await request.loginCustomerWithEmail(email, password);
    
    // Redirect to account page
    response.redirect('/account');
  } catch (error) {
    response.redirect('/login?error=1');
  }
}
```

### With Validation

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function loginMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const { email, password } = request.body;
  
  if (!email || !password) {
    response.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
    return;
  }
  
  try {
    await request.loginCustomerWithEmail(email, password);
    
    const customer = request.getCurrentCustomer();
    
    response.json({
      success: true,
      customer: {
        id: customer.customer_id,
        email: customer.email,
        full_name: customer.full_name
      }
    });
  } catch (error) {
    response.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
}
```

### After Registration

```typescript
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function registerMiddleware(
  request: EvershopRequest, 
  response: EvershopResponse
) {
  const { email, password, full_name } = request.body;
  
  try {
    // Create customer account
    const customer = await createCustomer({ email, password, full_name });
    
    // Auto-login after registration
    await request.loginCustomerWithEmail(email, password);
    
    response.json({
      success: true,
      message: 'Account created successfully',
      customer: request.getCurrentCustomer()
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      message: error.message
    });
  }
}
```

## Behavior

When called, this function:

1. Queries the `customer` table for matching email
2. Checks if customer status is active
3. Compares the provided password with stored hash
4. Throws error if email not found or password incorrect
5. Sets `request.session.customerID` with customer ID
6. Stores customer data (without password) in `request.locals.customer`
7. Saves the session (if callback provided)

## Error Handling

The function throws an error if:
- Email is not found in the database
- Customer status is not active
- Password does not match

```typescript
try {
  await request.loginCustomerWithEmail(email, password);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

## Security Notes

- Works for frontend customers (queries `customer` table)
- Email lookup is case-insensitive
- Password is compared using secure hash comparison
- Password field is removed from customer object before storing
- Checks customer status to ensure account is active

## Session Management

- Customer ID is stored in `request.session.customerID`
- Customer data is stored in `request.locals.customer`
- Session is automatically saved after login

## Notes

- This function is for frontend customers (not admin users)
- Must be called on the Express request object
- Available after customer module bootstrap
- Session must be configured and available
- Use `request.isCustomerLoggedIn()` to check login status
- Use `request.getCurrentCustomer()` to get logged-in customer data

## See Also

- [request.logoutCustomer](/docs/development/module/functions/request.logoutCustomer) - Logout customer
- [request.isCustomerLoggedIn](/docs/development/module/functions/request.isCustomerLoggedIn) - Check login status
- [request.getCurrentCustomer](/docs/development/module/functions/request.getCurrentCustomer) - Get current customer
