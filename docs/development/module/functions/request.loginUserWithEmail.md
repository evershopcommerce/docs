---
sidebar_position: 34
keywords:
- loginUserWithEmail
- authentication
- login
- admin
- session
groups:
- authentication
sidebar_label: request.loginUserWithEmail
title: request.loginUserWithEmail
description: Login an admin user with email and password.
---

# request.loginUserWithEmail

Login an admin user with email and password. This function is available on the Express request object.

## Syntax

```typescript
request.loginUserWithEmail(email: string, password: string, callback?: Function): Promise<void>
```

### Parameters

**`email`**

**Type:** `string`

The admin user's email address.

**`password`**

**Type:** `string`

The admin user's password.

**`callback`**

**Type:** `Function` (optional)

Optional callback function called after session is saved.

## Return Value

Returns `Promise<void>`.

## Examples

### Basic Login

```typescript
export default async function loginMiddleware(request, response) {
  const { email, password } = request.body;
  
  try {
    await request.loginUserWithEmail(email, password);
    
    response.json({
      success: true,
      user: request.getCurrentUser()
    });
  } catch (error) {
    response.status(401).json({
      success: false,
      message: error.message
    });
  }
}
```

### With Callback

```typescript
export default async function loginMiddleware(request, response) {
  const { email, password } = request.body;
  
  try {
    await request.loginUserWithEmail(email, password, (err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });
    
    response.json({ success: true });
  } catch (error) {
    response.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
}
```

```typescript
try {
  await request.loginUserWithEmail(email, password);
} catch (error) {
  // error.message === "Invalid email or password"
  console.error(error.message);
}
```

## Notes

- This function is for admin users only
- Must be called on the Express request object
- Available after auth module bootstrap

## See Also

- [request.logoutUser](/docs/development/module/functions/request.logoutUser) - Logout admin user
- [request.isUserLoggedIn](/docs/development/module/functions/request.isUserLoggedIn) - Check login status
- [request.getCurrentUser](/docs/development/module/functions/request.getCurrentUser) - Get current user
