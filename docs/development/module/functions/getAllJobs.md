---
sidebar_position: 120
keywords:
- getAllJobs
- getEnabledJobs
- getJob
- hasJob
- cron
groups:
- cronjob
sidebar_label: getAllJobs
title: Job Query Functions
description: Retrieve registered cron jobs from the job manager.
---

# Job Query Functions

Functions for querying the cron job registry. All imported from `@evershop/evershop/lib/cronjob`.

## Import

```typescript
import {
  getAllJobs,
  getEnabledJobs,
  getJob,
  hasJob
} from '@evershop/evershop/lib/cronjob';
```

## Functions

### getAllJobs

```typescript
getAllJobs(): Job[]
```

Returns all registered cron jobs (both enabled and disabled).

### getEnabledJobs

```typescript
getEnabledJobs(): Job[]
```

Returns only jobs where `enabled === true`.

### getJob

```typescript
getJob(jobName: string): Job | undefined
```

Returns a single job by its name.

### hasJob

```typescript
hasJob(jobName: string): boolean
```

Checks if a job with the given name is registered.

## Examples

```typescript
import { getEnabledJobs, hasJob } from '@evershop/evershop/lib/cronjob';

const jobs = getEnabledJobs();
console.log(`${jobs.length} cron jobs active`);

if (hasJob('sync-inventory')) {
  console.log('Inventory sync job is registered');
}
```

## See Also

- [registerJob](/docs/development/module/functions/registerJob) — Register a cron job
- [removeJob](/docs/development/module/functions/removeJob) — Remove a cron job
- [updateJobSchedule](/docs/development/module/functions/updateJobSchedule) — Update schedule
- [Cron Jobs](/docs/development/knowledge-base/cron-jobs) — Full cron job guide
