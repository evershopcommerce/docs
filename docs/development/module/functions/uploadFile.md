---
sidebar_position: 72
keywords:
- uploadFile
- cms
- file management
- media
- multer
- storage
groups:
- files
sidebar_label: uploadFile
title: uploadFile
description: Upload files to the store's file storage.
---

# uploadFile

Upload files to the specified destination path in the store's file storage.

## Import

```typescript
import { uploadFile } from "@evershop/evershop/cms/services";
```

## Syntax

```typescript
uploadFile(files: Express.Multer.File[], destinationPath: string): Promise<UploadedFile[]>
```

### Parameters

**`files`**

**Type:** `Express.Multer.File[]`

Array of files from multer middleware.

**`destinationPath`**

**Type:** `string`

The destination path. This is a **storage key prefix**, not necessarily a local directory — see [Storage providers](#storage-providers).

## Return Value

Returns `Promise<UploadedFile[]>`:

```typescript
{
  name: string;     // File name
  mimetype: string; // MIME type
  size: number;     // File size in bytes
  url: string;      // Public URL of the stored file
}[]
```

`url` is whatever the active provider considers the file's public URL: a local `/assets/...` path when storage is local, or the object/CDN URL (the provider's `baseUrl` when configured) when a cloud provider is active. Persist that `url`; do not reconstruct one from `destinationPath`.

## Storage providers

`uploadFile` resolves the uploader **at call time** from the `fileUploader` registry value, seeded from the active storage provider. The provider is chosen by the `fileStorage` admin setting, falling back to the `system.file_storage` config (default `local`). Core ships `local`, `s3`, `azure` and `gcs` implementations, and an extension can register its own.

The same call therefore writes to the local media directory on one deployment and to an S3 bucket, an Azure container or a GCS bucket on another. Treat `destinationPath` as a storage key prefix — not a filesystem path — and never assume the result is readable through `fs`.

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - List files
- [createFolder](/docs/development/module/functions/createFolder) - Create folders
- [deleteFile](/docs/development/module/functions/deleteFile) - Delete files
