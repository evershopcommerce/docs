---
sidebar_position: 90
keywords:
- getSetting
- setting
- configuration
groups:
- utilities
sidebar_label: getSetting
title: getSetting
description: Get a setting value from the database.
---

# getSetting

Get a setting value from the database with caching.

## Import

```typescript
import { getSetting } from "@evershop/evershop/setting/services";
```

## Syntax

```typescript
getSetting<T>(name: string, defaultValue: T): Promise<T>
```

### Parameters

**`name`**

**Type:** `string`

The setting name.

**`defaultValue`**

**Type:** `T`

Default value if setting doesn't exist.

## Return Value

Returns `Promise<T>` with the setting value or default value.

## Examples

### Basic Usage

```typescript
import { getSetting } from "@evershop/evershop/setting/services";

const storeName = await getSetting('storeName', 'My Store');
console.log('Store name:', storeName);
```

### With Type Inference

```typescript
import { getSetting } from "@evershop/evershop/setting/services";

const maxItems = await getSetting<number>('cart.maxItems', 100);
const isEnabled = await getSetting<boolean>('feature.newCheckout', false);
```

### In Middleware

```typescript
import { getSetting } from "@evershop/evershop/setting/services";
import { EvershopRequest } from "@evershop/evershop/types/request";
import { EvershopResponse } from "@evershop/evershop/types/response";

export default async function loadStoreName(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => Promise<void>
) {
  const storeName = await getSetting('storeName', 'Default Store');
  response.locals.storeName = storeName;
  
  await next();
}
```

## See Also

- [getConfig](/docs/development/module/functions/getConfig) - Get configuration value
