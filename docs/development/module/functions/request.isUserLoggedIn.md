---
sidebar_position: 36
keywords:
- isUserLoggedIn
- authentication
- login check
- admin
- session
groups:
- authentication
sidebar_label: request.isUserLoggedIn
title: request.isUserLoggedIn
description: Check if an admin user is currently logged in.
---

# request.isUserLoggedIn

Check if an admin user is currently logged in. This function is available on the Express request object.

## Syntax

```typescript
request.isUserLoggedIn(): boolean
```

### Parameters

None.

## Return Value

Returns `boolean`:
- `true` if user is logged in
- `false` if user is not logged in

## Examples

### Basic Check

```typescript
export default async function protectedMiddleware(request, response, next) {
  if (!request.isUserLoggedIn()) {
    response.status(401).json({
      success: false,
      message: 'Please login to continue'
    });
    return;
  }
  
  next();
}
```

## See Also

- [request.loginUserWithEmail](/docs/development/module/functions/request.loginUserWithEmail) - Login admin user
- [request.logoutUser](/docs/development/module/functions/request.logoutUser) - Logout admin user
- [request.getCurrentUser](/docs/development/module/functions/request.getCurrentUser) - Get current user
