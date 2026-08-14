---
sidebar_position: 70
keywords:
- createFolder
- cms
- file management
- media
- storage
groups:
- files
sidebar_label: createFolder
title: createFolder
description: Create a folder in the store's file storage.
---

# createFolder

Create a new folder at the specified path in the store's file storage.

## Import

```typescript
import { createFolder } from "@evershop/evershop/cms/services";
```

## Syntax

```typescript
createFolder(destinationPath: string): Promise<string>
```

### Parameters

**`destinationPath`**

**Type:** `string`

Path where the folder should be created. This is a **storage key prefix**, not necessarily a local directory — see [Storage providers](#storage-providers). An empty path throws on the cloud providers.

## Return Value

Returns `Promise<string>` with the created folder path (the normalised storage key).

## Storage providers

`createFolder` resolves the folder creator **at call time** from the `folderCreator` registry value, seeded from the active storage provider. The provider is chosen by the `fileStorage` admin setting, falling back to the `system.file_storage` config (default `local`). Core ships `local`, `s3`, `azure` and `gcs` implementations, and an extension can register its own.

Object stores have no real directories, so the cloud providers emulate one: S3, for example, writes a zero-byte `{key}/` marker object — the same convention the AWS console uses — which the file browser then groups as a folder. The local provider does a recursive `mkdir` and is a no-op when the directory already exists.

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - List files and folders
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload files
- [deleteFile](/docs/development/module/functions/deleteFile) - Delete files
