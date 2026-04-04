---
sidebar_position: 22
keywords:
  - registry
  - processor
  - value transformation
  - extensibility
sidebar_label: Registry and Processors
title: Registry and Processors
description: The Registry and Processor system is EverShop's primary mechanism for extending and transforming data across modules without modifying core code.
---

# Registry and Processors

## Overview

The Registry is EverShop's primary extension mechanism. It allows modules and extensions to transform data by registering **processor functions** that form a pipeline. When a value is requested from the registry, all registered processors execute in priority order, each receiving the output of the previous one.

Unlike [hooks](/docs/development/module/functions/hookable) (which intercept function calls), processors transform **data values**. They are used throughout EverShop for tasks like defining cart fields, customizing email services, validating configuration schemas, and modifying product data before it is saved.

## How It Works

The processor pipeline follows this flow:

```
Initial Value → Processor 1 → Processor 2 → ... → Processor N → Final Value
                (priority 5)   (priority 10)       (priority 1000)
```

1. A module calls `getValue('cartFields', [])` with an initial value (an empty array).
2. The registry finds all processors registered for `'cartFields'`.
3. Processors execute in priority order (lowest number first).
4. Each processor receives the current value and **must return** the transformed value.
5. The final result is returned to the caller.

## Registering Processors

Use `addProcessor()` to register a processor in your module's `bootstrap.ts` file:

```ts title="extensions/my-extension/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function () {
  // Add a field to every cart
  addProcessor('cartFields', (fields) => {
    fields.push({
      key: 'gift_message',
      resolvers: {
        // resolver configuration...
      }
    });
    return fields;
  }, 15);
}
```

### Parameters

- **`name`** (`string`) — The name of the registry value to process.
- **`callback`** (`(value: T) => T | Promise<T>`) — The processor function. It receives the current value and **must return** the (possibly modified) value.
- **`priority`** (`number`, optional, default: `10`) — Controls execution order. Lower numbers execute first. Valid range: 0–999.

:::warning
If a processor does not return a value (returns `undefined`), a warning is logged and subsequent processors may break. Always return the value from your processor, even if you didn't modify it.
:::

## Priority System

Processors are sorted by priority before execution:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Priority</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0–9</td><td>Early processing (validation, defaults)</td></tr>
    <tr><td>10</td><td>Default priority</td></tr>
    <tr><td>11–999</td><td>Later processing (enrichment, transformation)</td></tr>
    <tr><td>1000</td><td>Final processor (reserved, only one allowed per value)</td></tr>
  </tbody>
</table>

```ts
// Executes first — set defaults
addProcessor('productData', setDefaults, 5);

// Executes second — validate
addProcessor('productData', validate, 10);

// Executes third — enrich with external data
addProcessor('productData', enrichData, 20);
```

### Final Processors

Use `addFinalProcessor()` to register a processor that always runs last (priority 1000). Only one final processor is allowed per registry value.

```ts
import { addFinalProcessor } from '@evershop/evershop/lib/util/registry';

addFinalProcessor('emailService', (service) => {
  // Override the email service implementation
  return myCustomEmailService;
});
```

## Retrieving Values

### Asynchronous (Recommended)

```ts
import { getValue } from '@evershop/evershop/lib/util/registry';

// Pass an initial value
const cartFields = await getValue('cartFields', []);

// Pass an initialization function instead of a static value
const productData = await getValue('productData', async (value) => {
  return await loadFromDatabase();
});
```

### Synchronous

```ts
import { getValueSync } from '@evershop/evershop/lib/util/registry';

const config = getValueSync('configurationSchema', baseSchema);
```

:::warning
`getValueSync()` will throw an error if any processor is asynchronous. Use `getValue()` if your processors perform async operations.
:::

## Context in Processors

Processors can access a context object via `this`. The context is passed as the third argument to `getValue()`:

```ts
// Passing context when retrieving a value
const finalPrice = await getValue(
  'productPrice',
  basePrice,
  { customer: currentCustomer, currency: 'USD' }
);

// Accessing context in a processor — use a regular function, not an arrow function
addProcessor('productPrice', function (price) {
  const customer = this.customer;
  if (customer && customer.isVip) {
    return price * 0.9; // VIP discount
  }
  return price;
});
```

:::warning
Arrow functions do not have their own `this` binding. If you need to access the context, use the `function` keyword.
:::

## Caching

The registry caches processed values. If `getValue()` is called again with the same `name`, `initValue`, and `context`, the cached result is returned without re-running processors. This makes repeated calls efficient.

The cache is cleared when the registry is locked during startup.

## Lock Mechanism

Processors **must** be registered during the bootstrap phase, before the application starts handling requests. After all modules load their bootstrap scripts, EverShop calls `lockRegistry()`. Any attempt to call `addProcessor()` after locking throws an error:

```
Registry is locked. Most likely you are trying to add a processor from a middleware.
Consider using a bootstrap file to add processors.
```

This ensures the processor pipeline is stable and predictable during request handling.

## Practical Examples

### Adding Cart Fields

The checkout module uses the registry to define which fields a cart contains:

```ts title="bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function () {
  addProcessor('cartFields', (fields) => {
    fields.push({
      key: 'coupon',
      resolvers: {
        // How this field is read and written
      }
    });
    return fields;
  });
}
```

### Customizing the Email Service

Extensions can override the email sending implementation:

```ts title="extensions/resend/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function () {
  addProcessor('emailService', (currentService) => {
    // Replace the default email service with Resend
    return {
      send: async (to, subject, html) => {
        await resend.emails.send({ from: 'noreply@shop.com', to, subject, html });
      }
    };
  });
}
```

### Extending Configuration Validation

Modules merge their own JSON schemas into the global configuration schema:

```ts title="bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function () {
  addProcessor('configurationSchema', (schema) => {
    return {
      ...schema,
      properties: {
        ...schema.properties,
        myModule: {
          type: 'object',
          properties: {
            apiKey: { type: 'string' }
          }
        }
      }
    };
  });
}
```

## Registry vs Hooks

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Aspect</th>
      <th>Registry (Processors)</th>
      <th>Hooks</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Purpose</strong></td><td>Transform data values</td><td>Intercept function calls</td></tr>
    <tr><td><strong>When to use</strong></td><td>Modifying data before/after save, defining fields, configuring services</td><td>Running code before/after a specific operation</td></tr>
    <tr><td><strong>Registration</strong></td><td><code>addProcessor(name, callback, priority)</code></td><td><code>hookBefore(funcName, callback, priority)</code></td></tr>
    <tr><td><strong>Return value</strong></td><td><strong>Must</strong> return the transformed value</td><td>Does not need to return anything</td></tr>
    <tr><td><strong>Registered in</strong></td><td><code>bootstrap.ts</code></td><td><code>bootstrap.ts</code></td></tr>
  </tbody>
</table>

## See Also

- [addProcessor](/docs/development/module/functions/addProcessor) — Function reference
- [getValue](/docs/development/module/functions/getValue) — Async value retrieval
- [getValueSync](/docs/development/module/functions/getValueSync) — Sync value retrieval
- [hookable](/docs/development/module/functions/hookable) — The hook system (an alternative extension mechanism)

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
