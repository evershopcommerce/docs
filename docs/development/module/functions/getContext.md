---
sidebar_position: 85
keywords:
- getContext
- graphql
- context
groups:
- utilities
sidebar_label: getContext
title: getContext
description: Get all context values merged from application and request levels.
---

# getContext

Get all context values merged from application and request levels. This returns the complete GraphQL execution context object that is passed to resolvers.

## Import

```typescript
import { getContext } from "@evershop/evershop/graphql/services";
```

## Syntax

```typescript
getContext(request: EvershopRequest): Record<string, any>
```

### Parameters

**`request`**

**Type:** `EvershopRequest`

The request object.

## Return Value

Returns `Record<string, any>` with all context values merged.

## Examples

### Basic Usage

```typescript
import { getContext } from "@evershop/evershop/graphql/services";

const context = getContext(request);
console.log('All context:', context);
```

### In GraphQL Resolver

```typescript
import { getContext } from "@evershop/evershop/graphql/services";

export default {
  Query: {
    me: async (_, __, { request }) => {
      const context = getContext(request);
      
      return {
        id: context.userId,
        role: context.userRole,
        preferences: {
          theme: context.theme,
          language: context.language
        }
      };
    }
  }
};
```

## See Also

- [getContextValue](/docs/development/module/functions/getContextValue) - Get single value
- [setContextValue](/docs/development/module/functions/setContextValue) - Set context value
- [hasContextValue](/docs/development/module/functions/hasContextValue) - Check if key exists
