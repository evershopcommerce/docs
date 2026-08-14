---
sidebar_position: 69
keywords:
- browFiles
- cms
- file management
- media
- storage
groups:
- files
sidebar_label: browFiles
title: browFiles
description: Browse files and folders at a storage path.
---

# browFiles

List the files and folders at a given path in the store's file storage.

## Import

```typescript
import { browFiles } from "@evershop/evershop/cms/services";
```

## Syntax

```typescript
browFiles(path: string): Promise<{ files: FileBrowser[]; folders: string[] }>
```

### Parameters

**`path`**

**Type:** `string`

The path to list. This is a **storage key prefix**, not necessarily a local directory — see [Storage providers](#storage-providers). Leading and trailing slashes are normalised away.

## Return Value

Returns `Promise` with:

```typescript
{
  files: FileBrowser[];  // Array of file objects
  folders: string[];     // Array of folder names
}
```

`FileBrowser` object:
```typescript
{
  name: string;  // File name
  url: string;   // Public URL of the file
}
```

`url` is whatever the active provider considers the file's public URL: a local `/assets/...` path when storage is local, or the object/CDN URL (the provider's `baseUrl` when one is configured) when a cloud provider is active.

With the local provider, a path that does not exist throws `Requested path does not exist`. Cloud providers list by key prefix, so a non-existent prefix simply returns empty arrays.

## Storage providers

`browFiles` resolves the file browser **at call time** from the `fileBrowser` registry value, seeded from the active storage provider. The provider is chosen by the `fileStorage` admin setting, falling back to the `system.file_storage` config (default `local`). Core ships `local`, `s3`, `azure` and `gcs` implementations, and an extension can register its own.

So the same call browses the local media directory on one deployment and an S3 bucket, an Azure container or a GCS bucket on another — the calling code does not change. Treat `path` as a storage key, not a filesystem path: do not join it with `process.cwd()`, and do not assume `fs` can see it.

## See Also

- [createFolder](/docs/development/module/functions/createFolder) - Create folder
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload files
- [deleteFile](/docs/development/module/functions/deleteFile) - Delete files
