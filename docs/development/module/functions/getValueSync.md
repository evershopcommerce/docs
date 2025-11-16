---
sidebar_position: 6
keywords:
- getValueSync
- registry
- processor
- value transformation
- synchronous
groups:
- utilities
sidebar_label: getValueSync
title: getValueSync
description: Get values from the registry synchronously with optional processing and validation.
---

# getValueSync

Get a value from the registry synchronously. Does not support async processors.

## Import

```typescript
import { getValueSync, addProcessor } from '@evershop/evershop/lib/util/registry';
```

## Syntax

```typescript
getValueSync<T>(
  name: string,
  initialization: T | SyncProcessor<T>,
  context: Record<string, any>,
  validator?: (value: T) => boolean
): T
```

## Parameters

### `name`

**Type:** `string`

The unique name of the value in the registry.

### `initialization`

**Type:** `T | SyncProcessor<T>`

The initial value or a synchronous function that returns the initial value.

### `context`

**Type:** `Record<string, any>`

Context object passed to processors.

### `validator`

**Type:** `(value: T) => boolean` (optional)

Validation function called after each processor.

## Return Value

Returns the processed value of type `T`.

## Examples

### Basic Usage

```typescript
import { getValueSync } from '@evershop/evershop/lib/util/registry';

// Get a simple value synchronously
const config = getValueSync('appConfig', defaultConfig, {});

// Get with initialization function
const routes = getValueSync(
  'adminRoutes',
  () => {
    return loadRoutesSync();
  },
  { area: 'admin' }
);
```

### With Processors

```typescript
import { getValueSync, addProcessor } from '@evershop/evershop/lib/util/registry';

// Register synchronous processors
addProcessor('menuItems', (items) => {
  // Filter by permission
  return items.filter(item => item.permission);
}, 10);

addProcessor('menuItems', (items) => {
  // Sort by position
  return items.sort((a, b) => a.position - b.position);
}, 20);

// Get processed value
const menu = getValueSync('menuItems', defaultMenuItems, {});
```

### With Context

```typescript
import { getValueSync, addProcessor } from '@evershop/evershop/lib/util/registry';

// Processor using context
addProcessor('navigationLinks', function(links) {
  // Access context via 'this'
  const userRole = this.userRole;
  
  // Filter links by role
  return links.filter(link => {
    if (!link.roles) return true;
    return link.roles.includes(userRole);
  });
}, 10);

// Get value with context
const links = getValueSync(
  'navigationLinks',
  allLinks,
  { userRole: 'admin' }
);
```

### With Validation

```typescript
import { getValueSync } from '@evershop/evershop/lib/util/registry';

// Validator function
function validateConfig(config) {
  if (!config.apiKey) {
    return false;
  }
  return true;
}

// Get value with validation
try {
  const config = getValueSync(
    'apiConfig',
    { apiKey: '' },
    {},
    validateConfig
  );
} catch (error) {
  console.error('Validation failed:', error);
}
```

## Complete Example

```typescript
import { getValueSync, addProcessor } from '@evershop/evershop/lib/util/registry';

// Register processors for admin menu
addProcessor('adminMenu', (menu) => {
  // Add default items
  menu.push({
    label: 'Dashboard',
    url: '/admin',
    position: 1
  });
  return menu;
}, 5);

addProcessor('adminMenu', (menu) => {
  // Sort by position
  return menu.sort((a, b) => a.position - b.position);
}, 100);

// Get the processed menu
const adminMenu = getValueSync('adminMenu', [], {});
```

## Caching

The registry caches processed values. A cached value is returned if:
- The initialization value is identical
- The context is identical
- A value has been computed

```typescript
import { getValueSync } from '@evershop/evershop/lib/util/registry';

// First call - processes value
const data1 = getValueSync('configData', defaultConfig, { env: 'prod' });

// Second call - returns cached value (processors not executed)
const data2 = getValueSync('configData', defaultConfig, { env: 'prod' });

// Different context - processes value again
const data3 = getValueSync('configData', defaultConfig, { env: 'dev' });
```

## Bootstrap Location

Processors must be registered during application bootstrap:

```typescript
// extensions/my-extension/bootstrap.ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function bootstrap() {
  addProcessor('themeConfig', (config) => {
    // Add theme customization
    config.customColors = {
      primary: '#FF6B6B',
      secondary: '#4ECDC4'
    };
    return config;
  });
}
```

## Notes

- Values are cached based on initialization value and context
- Processors execute in priority order (lower numbers first)
- Maximum priority is 1000
- Only synchronous processors are supported
- If a processor returns a Promise, an error is thrown
- If a processor returns `undefined`, a warning is logged
- Processors are locked after bootstrap
- Context is passed to processors via the `this` keyword

## See Also

- [getValue](/docs/development/module/functions/getValue) - Async version
- [addProcessor](/docs/development/module/functions/addProcessor) - Register value processors
