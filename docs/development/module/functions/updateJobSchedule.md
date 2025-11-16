---
sidebar_position: 22
keywords:
- updateJobSchedule
- cronjob
- cron
- schedule
- update
groups:
- cronjob
sidebar_label: updateJobSchedule
title: updateJobSchedule
description: Update the schedule of an existing cronjob.
---

# updateJobSchedule

Update the cron schedule of an existing registered job.

## Import

```typescript
import { updateJobSchedule } from '@evershop/evershop/lib/cronjob';
```

## Syntax

```typescript
updateJobSchedule(jobName: string, newSchedule: string): boolean
```

### Parameters

**`jobName`**

**Type:** `string`

The name of the job to update.

**`newSchedule`**

**Type:** `string`

The new cron expression to set for the job.

## Return Value

Returns `boolean`:
- `true` if the job schedule was successfully updated
- `false` if the job was not found

## Examples

```typescript
import { updateJobSchedule } from '@evershop/evershop/lib/cronjob';

export default function bootstrap() {
  // Change cleanup job to run every 6 hours instead of daily
  updateJobSchedule('cleanup_sessions', '0 */6 * * *');
}
```

## Cron Schedule Format

The `newSchedule` parameter uses standard cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Common Examples

```typescript
// Every 15 minutes
updateJobSchedule('my_job', '*/15 * * * *');

// Every day at midnight
updateJobSchedule('my_job', '0 0 * * *');

// Every Monday at 9 AM
updateJobSchedule('my_job', '0 9 * * 1');

// Every hour during business hours (9 AM - 5 PM)
updateJobSchedule('my_job', '0 9-17 * * *');

// Every 6 hours
updateJobSchedule('my_job', '0 */6 * * *');
```

## Bootstrap Location

Schedule updates must be made in the bootstrap file:

```typescript
// extensions/my-extension/bootstrap.ts
import { updateJobSchedule } from '@evershop/evershop/lib/cronjob';

export default function bootstrap() {
  // Override the schedule of a core job
  updateJobSchedule('core_cleanup_job', '0 4 * * *');
}
```

## Notes

- Must be called during bootstrap phase before the job manager is frozen
- Only updates the schedule, other job properties remain unchanged

## See Also

- [registerJob](/docs/development/module/functions/registerJob) - Register a new job
- [removeJob](/docs/development/module/functions/removeJob) - Remove a job
