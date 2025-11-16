---
sidebar_position: 71
keywords:
- deleteFile
- cms
- file management
- media
groups:
- files
sidebar_label: deleteFile
title: deleteFile
description: Delete a file from media directory.
---

# deleteFile

Delete a file at the specified path in the media directory.

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

Path to file to delete, relative to media directory.

## Return Value

Returns `Promise<void>`.

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - List files
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload files
- [createFolder](/docs/development/module/functions/createFolder) - Create folders
