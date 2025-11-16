---
sidebar_position: 70
keywords:
- createFolder
- cms
- file management
- media
groups:
- files
sidebar_label: createFolder
title: createFolder
description: Create a folder in media directory.
---

# createFolder

Create a new folder at the specified path in the media directory.

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

Path where folder should be created, relative to media directory.

## Return Value

Returns `Promise<string>` with the created folder path.

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - List files and folders
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload files
- [deleteFile](/docs/development/module/functions/deleteFile) - Delete files
