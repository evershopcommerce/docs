---
sidebar_position: 33
keywords:
  - event
sidebar_label: Hookable and getValue
title: The hookable and getValue Functions
description: Description of the hookable and getValue functions in EverShop. How to use them and what they do.
---

## Overview

`hookable` is a function that provides a way for one piece of code to interact with or modify another piece of code at specific, pre-defined spots. It helps extensions interact with EverShop Core without modifying the core code.

`hookable` allows you to define your function and then hook it into the core code. When the core code runs, it will call your function at the appropriate time, allowing you to run your code before or after the core code runs.

## Example of `hookable`

```ts title="Hookable - From the core code"
import { insert } from "@evershop/postgres-query-builder";
import { hookable } from "@evershop/evershop/lib/util/hookable";

async function insertCustomerData(data, connection) {
  const customer = await insert("customer").given(data).execute(connection);
  // Delete password from customer object
  delete customer.password;
  return customer;
}

// Insert customer data
const customer = await hookable(insertCustomerData, {
  ...context,
  connection,
})(customerData, connection);
```

The `hookable` function accepts two parameters: the original function and the context object. The context object contains the data that will be passed to the callback function.

## Using `hookBefore`

Now let's say you are developing an extension and want to run some code before or after the `insertCustomerData` function runs. You can use `hookBefore` or `hookAfter` to do that.

```ts title="hookBefore - From the extension code"
import { hookBefore } from "@evershop/evershop/lib/util/hookable";

hookBefore(
  "insertCustomerData",
  (context) => {
    // Your code here. It will run before insertCustomerData function runs
  },
  10
);
```

The `hookBefore` function accepts three parameters: the original function name that you want to hook into, the callback function, and the priority. The priority is a number that determines the order in which the callback functions will be executed. The lower the number, the earlier the callback function will be executed. The callback functions will be executed in ascending order of priority and have access to the context object.

## Using `hookAfter`

The `hookAfter` function works the same way as `hookBefore` but it will run after the original function runs.

```ts title="hookAfter - From the extension code"
import { hookAfter } from "@evershop/evershop/lib/util/hookable";

hookAfter(
  "insertCustomerData",
  (context) => {
    // Your code here. It will run after insertCustomerData function runs
  },
  10
);
```

## `getValue` Function

The `getValue` is a function that allows you to create a value and let other extensions modify it. It is a way for one piece of code to change or modify a created value without modifying the original code.

Let's use the create customer scenario as an example. You want to create a customer and then let other extensions modify the customer object before it is inserted into the database. You can use `getValue` to do that.

```ts title="getValue - From the core code"
import { getValue, getValueSync } from "@evershop/evershop/lib/util/registry";

const data = {
  full_name: "John Doe",
  email: "john@evershop.io",
};

const context = {
  connection,
};

const customerData = await getValue("customerDataBeforeCreate", data, context);

// Insert the customer data to the database
const customer = await insertCustomerData(customerData, connection);
```

So, let's say your extension wants to modify the customer object before it is inserted into the database. You can use `addProcessor` to do that.

```ts title="addProcessor - From the extension code"
import { addProcessor } from "@evershop/evershop/lib/util/registry";

addProcessor(
  "customerDataBeforeCreate",
  (value) => {
    return {
      full_name: "Jane Doe - Modified",
      email: "jane@evershop.io",
    };
  },
  10
);
```

The `addProcessor` function accepts four parameters: the value name, the callback function, the priority, and the validator function. The callback functions will be executed in ascending order of priority and have access to the value object.

The value returned from the callback function will be passed to the next callback function. The last callback function will return the final value that will be used in the core code.

Sometimes you want to make sure the value must meet some conditions. You can use the `validator` function. The `validator` function will be executed to validate the returned value. If the validator function returns `false`, an error will be thrown.

In the example above, if you want to make sure the data is an object with `full_name` and `email` properties, you can use the `validator` function.

```ts title="getValue - From the core code"
import { getValueSync, getValue } from "@evershop/evershop/lib/util/registry";

const data = {
  full_name: "John Doe",
  email: "john@evershop.io",
};

const context = {
  connection,
};

const customerData = await getValue(
  "customerDataBeforeCreate",
  data,
  context,
  (value) => {
    if (typeof value !== "object" || !value.full_name || !value.email) {
      return false;
    }
    return true;
  }
);
```

The callback function will be executed with the context as the `this` object. If the `getValue` function is called multiple times with the same value name and the same context, the callback functions will not be executed again. The value will be cached and returned from the cache.

If you want to have a `processor` function that will be executed at the very end, you can use the `addFinalProcessor` function. This ensures that no other processor will modify the value after your processor runs.

```ts title="addFinalProcessor - From the extension code"
import { addFinalProcessor } from "@evershop/evershop/lib/util/registry";

addFinalProcessor(
  "customerDataBeforeCreate",
  (value) => {
    return {
      full_name: "My final name",
      email: "jane@evershop.io",
    };
  },
  10
);
```

## `getValueSync` Function

The `getValueSync` function works the same way as `getValue`. The only difference is that `getValueSync` will execute the callback functions synchronously. It only accepts synchronous callback functions.

```ts title="getValueSync - From the core code"
import { getValueSync } from "@evershop/evershop/lib/util/registry";

const data = {
  full_name: "John Doe",
  email: "john@evershop.io",
};

const context = {
  connection,
};

const customerData = getValueSync("customerDataBeforeCreate", data, context);

// Insert the customer data to the database
const customer = await insertCustomerData(customerData, connection);
```
