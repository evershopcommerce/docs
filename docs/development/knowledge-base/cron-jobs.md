---
sidebar_position: 33
keywords:
  - cron jobs
  - evershop cron jobs
  - scheduling tasks
sidebar_label: Cron Jobs
title: Cron Jobs
description: EverShop provides a powerful cron job system that allows you to schedule tasks to run at specific intervals.
---

![Cron Jobs In EverShop](./img/cron-jobs-evershop.webp "Cron Jobs In EverShop")

## Overview

This document explains the cron job system in EverShop. EverShop provides a powerful cron job system that allows you to schedule tasks to run at specific intervals. You can use cron jobs to automate repetitive tasks such as sending emails, updating data, and more.

## How to Create a Cron Job in EverShop

This section assumes that you have an extension installed in your EverShop store. If you don't have an extension or want to learn how to create your own extension, please refer to [this document](/docs/development/module/extension-overview.md).

### Step 1: Create a New Cron Job

From your extension folder, create a new subfolder called `jobs`. Inside the `jobs` folder, create a new JS file for your cron job. For example, let's create a file called `myCronJob.js`:

```bash
├── your-extension
│   ├── jobs
│   │   ├── myCronJob.ts
```

The file `myCronJob.ts` should provide a default export function that will be executed when the cron job runs. Here is an example of a simple cron job:

```ts title="myCronJob.ts"
export default function myCronJob() {
  console.log("Hello, this is my cron job!");
}
```

The cron function can be either synchronous or asynchronous.

### Step 2: Register the Cron Job

In your `bootstrap.(ts, js)` file, you need to register the cron job with the EverShop application. Here is an example of how to do this:

```ts title="bootstrap.ts"
import path from "path";
import { registerCronJob } from "@evershop/evershop/lib/cronjob";

registerCronJob({
  name: "myCronJob",
  resolve: path.resolve(import.meta.dirname, "jobs/myCronJob.js"),
  schedule: "0 0 * * *",
  enabled: true,
});
```

In the configuration above, we define a new cron job called `myCronJob`. The `resolve` property should point to the path of the cron job file. The `schedule` property defines when the cron job should run. In this example, the cron job will run every day at midnight. The `enabled` property can be set to `true` or `false` to enable or disable the cron job.

### Step 3: Run the Cron Job

Once you have registered the cron job, EverShop will automatically run it at the specified schedule. You can view the logs for the cron job in the EverShop admin panel.

:::warning
The cron job will run in the main thread of the application. Make sure your cron job is optimized and does not block the main thread.
We strongly recommend using asynchronous code in your cron job and carefully scheduling it to avoid performance issues.
:::

## Cron Job Schedule

The `schedule` property in the cron job configuration defines when the cron job should run. The schedule is defined using a cron expression. A cron expression is a string that represents a set of times, using 5 space-separated fields:

- Minute (0 - 59)
- Hour (0 - 23)
- Day of the month (1 - 31)
- Month (1 - 12)
- Day of the week (0 - 7) (0 and 7 both represent Sunday)

## Remove a Cron Job

To remove a cron job, you can use the `removeJob` function from the `@evershop/evershop/lib/cronjob` module. Here is an example of how to do this:

```ts title="bootstrap.ts"
import { removeJob } from "@evershop/evershop/lib/cronjob";

removeJob("myCronJob");
```

:::warning
When updating or re-registering a cron job, you must call `removeJob` **before** calling `registerCronJob` to take effect.
:::

## Update Schedule of a Cron Job

To update the schedule of a cron job, you can use the `updateJobSchedule` function from the `@evershop/evershop/lib/cronjob` module. Here is an example of how to do this:

```ts title="bootstrap.ts"
import { updateJobSchedule } from "@evershop/evershop/lib/cronjob";

updateJobSchedule("myCronJob", "0 0 * * *");
```

## When to Use Cron Jobs

Cron jobs are useful for automating tasks that need to run at specific intervals. Here are some common use cases for cron jobs in EverShop:

- **Sending Scheduled Emails**: Automate the sending of newsletters, promotional emails, or order confirmations.
- **Data Cleanup**: Regularly clean up old data, such as expired sessions or abandoned carts.
- **Inventory Updates**: Automatically update product inventory levels based on external data sources.
- **Generating Reports**: Schedule the generation of sales reports, customer activity reports, or other analytics data.
- **Third-party Integrations**: Sync data with third-party services at regular intervals, such as updating shipping rates or product information.

## Best Practices

When creating cron jobs in EverShop, consider the following best practices:

1. **Keep Cron Jobs Short**: Ensure that your cron jobs complete quickly to avoid blocking the main thread.
2. **Use Asynchronous Code**: Use asynchronous code in your cron jobs to prevent blocking the main thread.
3. **Error Handling**: Implement proper error handling in your cron jobs to avoid unexpected failures.
4. **Logging**: Use logging to track the execution of your cron jobs and to help with debugging.
5. **Testing**: Test your cron jobs thoroughly before deploying them to production to ensure they work as expected.
