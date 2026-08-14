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

This document explains the cron job system in EverShop. EverShop provides a cron job system that allows you to schedule tasks to run at specific intervals. You can use cron jobs to automate repetitive tasks such as sending emails, updating data, and more.

Jobs are registered with the `registerJob` function from `@evershop/evershop/lib/cronjob`, which is backed by the job manager in `lib/cronjob/jobManager.ts`.

## How to Create a Cron Job in EverShop

This section assumes that you have an extension installed in your EverShop store. If you don't have an extension or want to learn how to create your own extension, please refer to [this document](/docs/development/module/extension-overview.md).

### Step 1: Create a New Cron Job

From your extension folder, create a new subfolder called `jobs`. Inside the `jobs` folder, create a new JS file for your cron job. For example, let's create a file called `myCronJob.js`:

```bash
├── your-extension
│   ├── jobs
│   │   ├── myCronJob.ts
```

The file `myCronJob.ts` should provide a default export function that will be executed when the cron job runs. The function is called with **no arguments**. Here is an example of a simple cron job:

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
import { registerJob } from "@evershop/evershop/lib/cronjob";

registerJob({
  name: "myCronJob",
  resolve: path.resolve(import.meta.dirname, "jobs/myCronJob.js"),
  schedule: "0 0 * * *",
  enabled: true,
});
```

In the configuration above, we define a new cron job called `myCronJob`. The `resolve` property should point to the path of the cron job file. The `schedule` property defines when the cron job should run. In this example, the cron job will run every day at midnight. The `enabled` property can be set to `true` or `false` to enable or disable the cron job.

### The `Job` Object

All four properties are **required**:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td><code>string</code></td><td>Unique job name. Registering a second job with the same name logs a warning and is skipped (it returns <code>false</code>, it does not throw).</td></tr>
    <tr><td><code>resolve</code></td><td><code>string</code></td><td>Absolute path to an <strong>existing, compiled <code>.js</code> file</strong>. The path is checked on the filesystem at registration time; a <code>.ts</code> path, a relative path, or a missing file throws.</td></tr>
    <tr><td><code>schedule</code></td><td><code>string</code></td><td>Cron expression, validated with <code>node-cron</code>. An invalid expression throws.</td></tr>
    <tr><td><code>enabled</code></td><td><code>boolean</code></td><td>Whether the job is scheduled. <strong>Disabled jobs are still validated</strong> — <code>enabled: false</code> does not bypass the path and schedule checks.</td></tr>
  </tbody>
</table>

Because your source `.ts` file is compiled to `.js` before it runs, `resolve` must point at the compiled output — `jobs/myCronJob.js`, not `jobs/myCronJob.ts`.

:::danger
`registerJob` **throws** when the schedule is not a valid cron expression:

```bash
Cannot register job "myCronJob". Invalid cron schedule: "0 0 * *". Please ensure it's a valid cron expression.
```

It also throws when `resolve` does not point at an existing `.js` file. Because jobs are registered from `bootstrap.ts`, **an uncaught throw here kills application startup** — the store will not boot.

If your schedule comes from configuration (i.e. an operator can edit it), wrap the call in a `try/catch` so a config typo degrades to a skipped job rather than a dead store. This is exactly what core does for its own configurable job:

```ts title="bootstrap.ts"
import { registerJob } from "@evershop/evershop/lib/cronjob";
import { getConfig } from "@evershop/evershop/lib/util/getConfig";
import { warning } from "@evershop/evershop/lib/log";

try {
  registerJob({
    name: "myCronJob",
    schedule: getConfig("myExtension.schedule", "0 2 * * *"),
    resolve: path.resolve(import.meta.dirname, "jobs/myCronJob.js"),
    enabled: getConfig("myExtension.enabled", true),
  });
} catch (e) {
  warning(`Skipping myCronJob registration: ${e.message}`);
}
```

See `modules/catalog/bootstrap.js` for the original.
:::

### Step 3: Run the Cron Job

Once you have registered the cron job, EverShop will automatically run it at the specified schedule. You can view the logs for the cron job in the EverShop admin panel.

:::info
Cron jobs run in a **dedicated child process**, separate from the main application process. This means a long-running cron job will not block your web server or affect request handling. The same applies to event subscribers, which also run in their own child process.

Even though cron jobs are isolated, we still recommend using asynchronous code and keeping execution times reasonable to avoid overlapping runs.
:::

### About `import.meta.dirname`

In ESM modules, the traditional `__dirname` is not available. Use `import.meta.dirname` instead, which serves the same purpose — it returns the directory path of the current module file.

## Bootstrap Context for Cron Jobs

The cron job child process runs its own bootstrap phase. Your `bootstrap.ts` receives a context where `context.process === 'cronjob'`. You can use this to conditionally register hooks or processors that should only apply during cron execution:

```ts title="bootstrap.ts"
export default function (context) {
  if (context.process === 'cronjob') {
    // Only register this processor in the cron process
    addProcessor('inventorySync', myCronSpecificProcessor);
  }
}
```

## Cron Job Schedule

The `schedule` property in the cron job configuration defines when the cron job should run. The schedule is defined using a cron expression. A cron expression is a string that represents a set of times, using 5 space-separated fields:

- Minute (0 - 59)
- Hour (0 - 23)
- Day of the month (1 - 31)
- Month (1 - 12)
- Day of the week (0 - 7) (0 and 7 both represent Sunday)

:::warning
EverShop upgraded from `node-cron` 3 to `node-cron` 4. Schedule validation (`cron.validate`) is now performed by version 4, which is stricter about several expression forms that version 3 tolerated. If you carry a custom expression over from an older EverShop installation, **verify it against `node-cron` 4** — an expression that used to register fine can now throw at bootstrap and stop the store from starting.
:::

## Built-in Cron Jobs

Core registers two jobs out of the box:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Schedule</th>
      <th>Registered in</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>generateSitemap</code></td>
      <td><code>sitemap.schedule</code> (default <code>*/30 * * * *</code>)</td>
      <td><code>modules/base/bootstrap.js</code></td>
      <td>Regenerates <code>sitemap.xml</code>. Enabled via <code>sitemap.enabled</code> (default <code>true</code>).</td>
    </tr>
    <tr>
      <td><code>recomputeProductRecommendations</code></td>
      <td><code>catalog.crossSell.recomputeSchedule</code> (default <code>0 2 * * *</code>)</td>
      <td><code>modules/catalog/bootstrap.js</code></td>
      <td>Recomputes the cross-sell / product recommendation statistics. Enabled via <code>catalog.crossSell.recomputeEnabled</code> (default <code>true</code>).</td>
    </tr>
  </tbody>
</table>

Both schedules are plain configuration, so you can retune them without code:

```json title="config/default.json"
{
  "sitemap": {
    "schedule": "0 * * * *"
  },
  "catalog": {
    "crossSell": {
      "recomputeSchedule": "0 3 * * *",
      "recomputeEnabled": true
    }
  }
}
```

## Remove a Cron Job

To remove a cron job, you can use the `removeJob` function from the `@evershop/evershop/lib/cronjob` module. Here is an example of how to do this:

```ts title="bootstrap.ts"
import { removeJob } from "@evershop/evershop/lib/cronjob";

removeJob("myCronJob");
```

:::warning
When updating or re-registering a cron job, you must call `removeJob` **before** calling `registerJob` to take effect. Registering over an existing name does not replace it — it logs a warning and skips.
:::

## Update Schedule of a Cron Job

To update the schedule of a cron job, you can use the `updateJobSchedule` function from the `@evershop/evershop/lib/cronjob` module. Here is an example of how to do this:

```ts title="bootstrap.ts"
import { updateJobSchedule } from "@evershop/evershop/lib/cronjob";

updateJobSchedule("myCronJob", "0 0 * * *");
```

Like `registerJob`, `updateJobSchedule` throws on an invalid cron expression. An unknown job name only logs a warning and returns `false`.

:::warning
`registerJob`, `removeJob`, and `updateJobSchedule` must all be called from `bootstrap.(ts, js)`. The job manager becomes read-only once the application has finished reading the job list, and any mutation attempted afterwards throws:

```bash
Job manager is in a read-only state. No further mutations are allowed.
```
:::

## When to Use Cron Jobs

Cron jobs are useful for automating tasks that need to run at specific intervals. Here are some common use cases for cron jobs in EverShop:

- **Sending Scheduled Emails**: Automate the sending of newsletters, promotional emails, or order confirmations.
- **Data Cleanup**: Regularly clean up old data, such as expired sessions or abandoned carts.
- **Inventory Updates**: Automatically update product inventory levels based on external data sources.
- **Generating Reports**: Schedule the generation of sales reports, customer activity reports, or other analytics data.
- **Third-party Integrations**: Sync data with third-party services at regular intervals, such as updating shipping rates or product information.

## Best Practices

When creating cron jobs in EverShop, consider the following best practices:

1. **Keep Cron Jobs Short**: Ensure that your cron jobs complete quickly to avoid overlapping with the next scheduled run.
2. **Use Asynchronous Code**: Use asynchronous code in your cron jobs to keep the event loop responsive.
3. **Error Handling**: Implement proper error handling in your cron jobs to avoid unexpected failures.
4. **Logging**: Use logging to track the execution of your cron jobs and to help with debugging.
5. **Testing**: Test your cron jobs thoroughly before deploying them to production to ensure they work as expected.
