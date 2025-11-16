---
sidebar_position: 84
keywords:
- setContextValue
- graphql
- context
groups:
- utilities
sidebar_label: setContextValue
title: setContextValue
description: Set a value in GraphQL context at request or application level.
---

# setContextValue

Set a value in GraphQL execution context at request or application level. Values set here will be available in all GraphQL resolvers during query execution.

## Import

```typescript
import { setContextValue } from "@evershop/evershop/graphql/services";
```

## Syntax

```typescript
setContextValue<T>(
  requestOrApp: EvershopRequest | Application,
  key: string,
  value: T
): void
```

### Parameters

**`requestOrApp`**

**Type:** `EvershopRequest | Application`

Request for request-level context, or App for application-level context.

**`key`**

**Type:** `string`

The context key.

**`value`**

**Type:** `T`

The value to set.

## Return Value

Returns `void`.

## Examples

### Set Request-Level Value

```typescript
import { setContextValue } from "@evershop/evershop/graphql/services";

// Specific to this request
setContextValue(request, 'userId', 123);
```

### Set Application-Level Value

```typescript
import { setContextValue } from "@evershop/evershop/graphql/services";

// Shared across all requests
setContextValue(app, 'apiVersion', 'v2');
```

### In Authentication Middleware

```typescript
import { setContextValue } from "@evershop/evershop/graphql/services";
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function authenticate(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => Promise<void>
) {
  const token = request.headers.authorization;
  
  if (token) {
    const user = await validateToken(token);
    
    // Store user info - will be available in GraphQL execution context
    setContextValue(request, 'userId', user.id);
    setContextValue(request, 'userRole', user.role);
  }
  
  await next();
}
```

## GraphQL Execution Context

All values set with `setContextValue` are automatically included in the GraphQL execution context:

```typescript
// In middleware
setContextValue(request, 'userId', 123);
setContextValue(request, 'isAdmin', true);

// In GraphQL resolver - values are automatically available
export default {
  Query: {
    currentUser: async (_, __, context) => {
      // context.userId and context.isAdmin are available
      console.log(context.userId); // 123
      console.log(context.isAdmin); // true
    }
  }
};
```

## Request vs Application Level

**Request Level:**
- Specific to single request
- Cleared after request completes
- Use for user-specific data
- Available in GraphQL execution context for that request

```typescript
setContextValue(request, 'userId', 123);
```

**Application Level:**
- Shared across all requests
- Persists for app lifetime
- Use for global configuration
- Available in GraphQL execution context for all requests

```typescript
setContextValue(app, 'apiKey', 'key123');
```

## Notes

- Request-level for per-request data
- Application-level for shared configuration
- Overwrites existing values
- Type-safe with generics
- Commonly used in middleware
- Values are automatically available in GraphQL execution context
- Used to pass data to GraphQL resolvers

## See Also

- [getContextValue](/docs/development/module/functions/getContextValue) - Get context value
- [getContext](/docs/development/module/functions/getContext) - Get all context
- [hasContextValue](/docs/development/module/functions/hasContextValue) - Check if key exists
