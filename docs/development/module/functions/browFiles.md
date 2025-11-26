---
sidebar_position: 69
keywords:
- browFiles
- cms
- file management
- media
groups:
- files
sidebar_label: browFiles
title: browFiles
description: Browse files and folders in media directory.
---

# browFiles

List files and folders at a specified path in the media directory.

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

Relative path within media directory.

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
  url: string;   // File URL
}
```

## See Also

- [createFolder](/docs/development/module/functions/createFolder) - Create folder
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload files
- [deleteFile](/docs/development/module/functions/deleteFile) - Delete files
