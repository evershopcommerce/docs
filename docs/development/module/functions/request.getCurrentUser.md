---
sidebar_position: 37
keywords:
- getCurrentUser
- authentication
- current user
- admin
- session
groups:
- authentication
sidebar_label: request.getCurrentUser
title: request.getCurrentUser
description: Get the currently logged-in admin user data.
---

# request.getCurrentUser

Get the currently logged-in admin user data. This function is available on the Express request object.

## Syntax

```typescript
request.getCurrentUser(): User | undefined
```

### Parameters

None.

## Return Value

Returns `User` object if logged in, or `undefined` if not logged in.

The user object contains admin user data without the password field.

## Examples

### Basic Usage

```typescript
export default async function profileMiddleware(request, response) {
  const user = request.getCurrentUser();
  
  if (!user) {
    response.status(401).json({
      success: false,
      message: 'Not logged in'
    });
    return;
  }
  
  response.json({
    success: true,
    user: {
      id: user.admin_user_id,
      email: user.email,
      full_name: user.full_name
    }
  });
}
```

### With Check

```typescript
export default async function dashboardMiddleware(request, response) {
  if (!request.isUserLoggedIn()) {
    response.redirect('/admin/login');
    return;
  }
  
  const user = request.getCurrentUser();
  
  response.json({
    welcome: `Welcome back, ${user.full_name}`,
    email: user.email
  });
}
```

### Access User Properties

```typescript
export default async function userInfoMiddleware(request, response) {
  const user = request.getCurrentUser();
  
  if (user) {
    console.log('User ID:', user.admin_user_id);
    console.log('Email:', user.email);
    console.log('Full Name:', user.full_name);
    console.log('Status:', user.status);
  }
  
  response.json({ user });
}
```

### In Middleware

```typescript
export default async function auditMiddleware(request, response, next) {
  const user = request.getCurrentUser();
  
  // Log action with user info
  if (user) {
    console.log(`Action by: ${user.email}`);
  }
  
  next();
}
```

## See Also

- [request.loginUserWithEmail](/docs/development/module/functions/request.loginUserWithEmail) - Login admin user
- [request.logoutUser](/docs/development/module/functions/request.logoutUser) - Logout admin user
- [request.isUserLoggedIn](/docs/development/module/functions/request.isUserLoggedIn) - Check login status
