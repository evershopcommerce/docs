---
sidebar_position: 83
keywords:
- getContextValue
- graphql
- context
groups:
- utilities
sidebar_label: getContextValue
title: getContextValue
description: Get a value from GraphQL context by key.
---

# getContextValue

Get a value from GraphQL execution context at request or application level. These context values are passed to GraphQL resolvers and used throughout the query execution.

## Import

```typescript
import { getContextValue } from "@evershop/evershop/graphql/services";
```

## Syntax

```typescript
getContextValue<T>(
  request: EvershopRequest,
  key: string,
  defaultValue?: T,
  toString?: boolean
): T
```

### Parameters

**`request`**

**Type:** `EvershopRequest`

The request object.

**`key`**

**Type:** `string`

The context key to retrieve.

**`defaultValue`** (optional)

**Type:** `T`

Default value if key doesn't exist.

**`toString`** (optional)

**Type:** `boolean` (default: `false`)

Convert value to string.

## Return Value

Returns the context value with type `T`.

## Examples

### Basic Usage

```typescript
import { getContextValue } from "@evershop/evershop/graphql/services";

const userId = getContextValue(request, 'userId');
console.log('User ID:', userId);
```

### With Default Value

```typescript
import { getContextValue } from "@evershop/evershop/graphql/services";

const theme = getContextValue(request, 'theme', 'default');
```

### In GraphQL Resolver

```typescript
import { getContextValue } from "@evershop/evershop/graphql/services";

export default {
  Query: {
    currentUser: async (_, __, { request }) => {
      // Context values are available in GraphQL execution context
      const userId = getContextValue(request, 'userId');
      
      if (!userId) {
        return null;
      }
      
      return await getUserById(userId);
    }
  }
};
```

## GraphQL Execution Context

These context values are automatically included in the GraphQL execution context and accessible in all resolvers:

```typescript
export default {
  Query: {
    myQuery: async (_, __, context) => {
      // context contains all values set via setContextValue
      const userId = context.userId;
      const apiKey = context.apiKey;
    }
  }
};
```

## Notes

- Request context overrides app context
- Returns default value if key not found
- Optional string conversion
- Type-safe with generics
- Values are automatically available in GraphQL execution context
- Used to pass data to GraphQL resolvers

## See Also

- [setContextValue](/docs/development/module/functions/setContextValue) - Set context value
- [getContext](/docs/development/module/functions/getContext) - Get all context
- [hasContextValue](/docs/development/module/functions/hasContextValue) - Check if key exists
