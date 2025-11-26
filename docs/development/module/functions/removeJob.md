---
sidebar_position: 23
keywords:
- removeJob
- cronjob
- cron
- unregister
- delete
groups:
- cronjob
sidebar_label: removeJob
title: removeJob
description: Remove a scheduled job from the job manager.
---

# removeJob

Remove a scheduled job (cronjob) from the job manager.

## Import

```typescript
import { removeJob } from '@evershop/evershop/lib/cronjob';
```

## Syntax

```typescript
removeJob(jobName: string): boolean
```

### Parameters

**`jobName`**

**Type:** `string`

The name of the job to remove.

## Return Value

Returns `boolean`:
- `true` if the job was successfully removed
- `false` if the job was not found

## Examples

### Basic Usage

```typescript
import { removeJob } from '@evershop/evershop/lib/cronjob';

export default function bootstrap() {
  // Remove a job
  removeJob('old_cleanup_job');
}
```

## Bootstrap Location

Jobs must be removed in the bootstrap file:

```typescript
// extensions/my-extension/bootstrap.ts
import { removeJob } from '@evershop/evershop/lib/cronjob';

export default function bootstrap() {
  // Remove a core job you don't want to run
  removeJob('core_cleanup_job');
}
```

## Notes

- Must be called during bootstrap phase before the job manager is frozen
- It will no longer be scheduled or executed
- The job file remains on disk but won't be loaded
- The removal is permanent for the current application lifecycle

## See Also

- [registerJob](/docs/development/module/functions/registerJob) - Register a new job
- [updateJobSchedule](/docs/development/module/functions/updateJobSchedule) - Update job schedule
