---
sidebar_position: 86
keywords:
- hasContextValue
- graphql
- context
groups:
- utilities
sidebar_label: hasContextValue
title: hasContextValue
description: Check if a context key exists at request or application level.
---

# hasContextValue

Check if a key exists in the GraphQL execution context at request or application level.

## Import

```typescript
import { hasContextValue } from "@evershop/evershop/graphql/services";
```

## Syntax

```typescript
hasContextValue(request: EvershopRequest, key: string): boolean
```

### Parameters

**`request`**

**Type:** `EvershopRequest`

The request object.

**`key`**

**Type:** `string`

The context key to check.

## Return Value

Returns `boolean` - `true` if key exists, `false` otherwise.

## Examples

### Basic Check

```typescript
import { hasContextValue } from "@evershop/evershop/graphql/services";

if (hasContextValue(request, 'userId')) {
  console.log('User is authenticated');
}
```

### In Middleware

```typescript
import { hasContextValue } from "@evershop/evershop/graphql/services";
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function requireAuth(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => Promise<void>
) {
  if (!hasContextValue(request, 'userId')) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  await next();
}
```

### In GraphQL Resolver

```typescript
import { hasContextValue, getContextValue } from "@evershop/evershop/graphql/services";

export default {
  Query: {
    currentUser: async (_, __, { request }) => {
      if (!hasContextValue(request, 'userId')) {
        return null;
      }
      
      const userId = getContextValue(request, 'userId');
      return await getUserById(userId);
    }
  }
};
```

## GraphQL Execution Context

Use this to check if values exist before accessing them in GraphQL resolvers:

```typescript
export default {
  Query: {
    currentUser: async (_, __, context) => {
      // Check if userId exists in execution context
      if ('userId' in context) {
        return await getUserById(context.userId);
      }
      return null;
    }
  }
};
```

## Behavior

1. Checks request-level context
2. Checks application-level context
3. Returns `true` if found in either
4. Returns `false` if not found
5. Checks keys that will be in GraphQL execution context

## Notes

- Checks both request and app level
- Returns boolean
- Useful for conditional logic
- Avoids unnecessary getContextValue calls
- Checks values that will be in GraphQL execution context

## See Also

- [getContextValue](/docs/development/module/functions/getContextValue) - Get context value
- [setContextValue](/docs/development/module/functions/setContextValue) - Set context value
- [getContext](/docs/development/module/functions/getContext) - Get all context
