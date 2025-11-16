---
sidebar_position: 21
keywords:
- registerJob
- cronjob
- cron
- scheduled task
- background job
groups:
- cronjob
sidebar_label: registerJob
title: registerJob
description: Register a scheduled job (cronjob) in the job manager.
---

# registerJob

Register a scheduled job (cronjob) that runs on a specific schedule.

## Import

```typescript
import { registerJob } from '@evershop/evershop/lib/cronjob';
```

## Syntax

```typescript
registerJob(job: Job): boolean
```

### Parameters

**`job`**

**Type:** `Job`

The job object to register. Must include:
- `name` - Unique job identifier
- `schedule` - Valid cron expression
- `resolve` - Path to the job file (must be a .js file)
- `enabled` - Whether the job is enabled
- Other optional properties

## Return Value

Returns `boolean`:
- `true` if the job was successfully registered
- `false` if a job with the same name already exists

## Examples

### Basic Job Registration

```typescript
import { registerJob } from '@evershop/evershop/lib/cronjob';
import path from 'path';

export default function bootstrap() {
  registerJob({
    name: 'cleanup_sessions',
    schedule: '0 2 * * *', // Run at 2 AM every day
    resolve: path.resolve(__dirname, 'jobs/cleanupSessions.js'),
    enabled: true
  });
}
```

### With Metadata

```typescript
import { registerJob } from '@evershop/evershop/lib/cronjob';
import path from 'path';

export default function bootstrap() {
  registerJob({
    name: 'sync_inventory',
    schedule: '*/30 * * * *', // Every 30 minutes
    resolve: path.resolve(__dirname, 'jobs/syncInventory.js'),
    enabled: true,
    description: 'Sync inventory with external system',
    category: 'inventory'
  });
}
```

## Cron Schedule Format

The `schedule` field uses standard cron syntax:

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
// Every minute
'* * * * *'

// Every 5 minutes
'*/5 * * * *'

// Every hour at minute 0
'0 * * * *'

// Every day at 2:30 AM
'30 2 * * *'

// Every Monday at 9 AM
'0 9 * * 1'

// First day of every month at midnight
'0 0 1 * *'

// Every weekday at 6 PM
'0 18 * * 1-5'
```

## Job File Structure

The job file should export a default async function:

```javascript
// jobs/cleanupSessions.js
export default async function cleanupSessions() {
  const { del } = await import('@evershop/postgres-query-builder');
  const { pool } = await import('@evershop/evershop/lib/postgres');
  
  // Delete expired sessions
  await del('session')
    .where('expired_at', '<', new Date())
    .execute(pool);
  
  console.log('Session cleanup completed');
}
```

## Validation Rules

### Job Name
- Must be a non-empty string
- Must be unique across all registered jobs
- Cannot be changed after registration

### Schedule
- Must be a valid cron expression
- Validated using `node-cron` library
- Invalid schedules will throw an error

### Resolve Path
- Must be a valid, resolvable path to an existing .js file
- Path must exist on the filesystem
- Must have .js extension

## Bootstrap Location

Jobs must be registered in the bootstrap file:

```typescript
// extensions/my-extension/bootstrap.ts
import { registerJob } from '@evershop/evershop/lib/cronjob';
import path from 'path';

export default function bootstrap() {
  registerJob({
    name: 'my_scheduled_job',
    schedule: '0 * * * *',
    resolve: path.resolve(__dirname, 'jobs/myJob.js'),
    enabled: true
  });
}
```

## Notes

- Must be called during bootstrap phase before the job manager is frozen
- Schedule is validated using the `node-cron` library
- Only enabled jobs will be executed
- Job manager becomes read-only after first retrieval of jobs

## See Also

- [updateJobSchedule](/docs/development/module/functions/updateJobSchedule) - Update job schedule
- [removeJob](/docs/development/module/functions/removeJob) - Remove a job
