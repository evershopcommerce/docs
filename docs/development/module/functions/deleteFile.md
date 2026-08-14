---
sidebar_position: 71
keywords:
- deleteFile
- cms
- file management
- media
- storage
groups:
- files
sidebar_label: deleteFile
title: deleteFile
description: Delete a file from the store's file storage.
---

# deleteFile

Delete a file at the specified path in the store's file storage.

## Import

```typescript
import { deleteFile } from "@evershop/evershop/cms/services";
```

## Syntax

```typescript
deleteFile(path: string): Promise<void>
```

### Parameters

**`path`**

**Type:** `string`

Path to the file to delete. This is a **storage key**, not necessarily a local file path — see [Storage providers](#storage-providers).

## Return Value

Returns `Promise<void>`.

## Idempotent

Deleting a path that does not exist **succeeds**. The goal state ("the file is gone") is already true, so retries, double submits and stale file-manager views do not surface errors. The local provider logs a warning and returns; S3's `DeleteObject` is idempotent by design and no `Head` precheck is made.

Passing a path that resolves to a **directory** is a different matter — the local provider throws `Requested path is not a file`. An empty path throws on the cloud providers.

## Storage providers

`deleteFile` resolves the deleter **at call time** from the `fileDeleter` registry value, seeded from the active storage provider. The provider is chosen by the `fileStorage` admin setting, falling back to the `system.file_storage` config (default `local`). Core ships `local`, `s3`, `azure` and `gcs` implementations, and an extension can register its own.

The same call therefore removes a file from the local media directory on one deployment and an object from an S3 bucket, an Azure container or a GCS bucket on another. Treat `path` as a storage key rather than a filesystem path.

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - List files
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload files
- [createFolder](/docs/development/module/functions/createFolder) - Create folders
