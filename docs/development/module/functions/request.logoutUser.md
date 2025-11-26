---
sidebar_position: 35
keywords:
- logoutUser
- authentication
- logout
- admin
- session
groups:
- authentication
sidebar_label: request.logoutUser
title: request.logoutUser
description: Logout the currently logged-in admin user.
---

# request.logoutUser

Logout the currently logged-in admin user. This function is available on the Express request object.

## Syntax

```typescript
request.logoutUser(callback?: Function): void
```

### Parameters

**`callback`**

**Type:** `Function` (optional)

Optional callback function called after session is saved.

## Return Value

Returns `void`.

## Examples

### Basic Logout

```typescript
export default async function logoutMiddleware(request, response) {
  request.logoutUser();
  
  response.json({
    success: true,
    message: 'Logged out successfully'
  });
}
```

### With Callback

```typescript
export default async function logoutMiddleware(request, response) {
  request.logoutUser((err) => {
    if (err) {
      console.error('Session save error:', err);
    }
  });
  
  response.redirect('/admin/login');
}
```

## See Also

- [request.loginUserWithEmail](/docs/development/module/functions/request.loginUserWithEmail) - Login admin user
- [request.isUserLoggedIn](/docs/development/module/functions/request.isUserLoggedIn) - Check login status
- [request.getCurrentUser](/docs/development/module/functions/request.getCurrentUser) - Get current user
