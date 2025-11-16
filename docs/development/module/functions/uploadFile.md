---
sidebar_position: 72
keywords:
- uploadFile
- cms
- file management
- media
- multer
groups:
- files
sidebar_label: uploadFile
title: uploadFile
description: Upload files to media directory.
---

# uploadFile

Upload files to the specified destination path in the media directory.

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

Destination path relative to media directory.

## Return Value

Returns `Promise<UploadedFile[]>`:

```typescript
{
  name: string;     // File name
  mimetype: string; // MIME type
  size: number;     // File size in bytes
  url: string;      // Accessible URL
}[]
```

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - List files
- [createFolder](/docs/development/module/functions/createFolder) - Create folders
- [deleteFile](/docs/development/module/functions/deleteFile) - Delete files
