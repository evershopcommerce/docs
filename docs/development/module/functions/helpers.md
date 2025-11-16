---
sidebar_position: 1
keywords:
- Helpers
- Constants
- EverShop helpers
- File paths
sidebar_label: Helpers
className: hidden
groups:
  - utilities
title: Helpers
description: Learn how to use the helpers module to access system paths and constants in EverShop.
---

# Helpers

The helpers module provides constants and utility values used throughout the EverShop application.

## Overview

The `@evershop/evershop/lib/helpers` module exports a frozen `CONSTANTS` object containing important system paths and configuration values. These constants are used internally by EverShop and can be used by extensions to access system directories.

## Importing

```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
```

## CONSTANTS Object

The `CONSTANTS` object contains the following properties:

### System Paths

#### `CONSTANTS.ROOTPATH`

The absolute path to the project root directory.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';

console.log(CONSTANTS.ROOTPATH);
// Output: /Users/username/my-evershop-project
```

#### `CONSTANTS.LIBPATH`

The absolute path to the EverShop library directory.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';

const configPath = path.join(CONSTANTS.LIBPATH, 'config');
```

#### `CONSTANTS.MODULESPATH`

The absolute path to the modules directory where all EverShop modules are located.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';

// Access a specific module directory
const catalogModulePath = path.join(CONSTANTS.MODULESPATH, 'catalog');
```

#### `CONSTANTS.PUBLICPATH`

The absolute path to the public directory where static assets are served.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import fs from 'fs';
import path from 'path';

// Write a file to the public directory
const filePath = path.join(CONSTANTS.PUBLICPATH, 'robots.txt');
fs.writeFileSync(filePath, 'User-agent: *\nDisallow:');
```

#### `CONSTANTS.MEDIAPATH`

The absolute path to the media directory where uploaded files and images are stored.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';

// Construct path to product images
const productImagesPath = path.join(CONSTANTS.MEDIAPATH, 'catalog', 'products');
```

#### `CONSTANTS.NODEMODULEPATH`

The absolute path to the node_modules directory.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';

// Access a specific package
const packagePath = path.join(CONSTANTS.NODEMODULEPATH, 'some-package');
```

#### `CONSTANTS.THEMEPATH`

The absolute path to the themes directory.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';

// Access active theme
const themePath = path.join(CONSTANTS.THEMEPATH, 'my-theme');
```

#### `CONSTANTS.CACHEPATH`

The absolute path to the cache directory (`.evershop`).

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import fs from 'fs';
import path from 'path';

// Store cached data
const cacheFile = path.join(CONSTANTS.CACHEPATH, 'my-cache.json');
fs.writeFileSync(cacheFile, JSON.stringify(data));
```

#### `CONSTANTS.BUILDPATH`

The absolute path to the build directory where compiled assets are stored.

**Type:** `string`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';

// Access compiled client assets
const clientBuildPath = path.join(CONSTANTS.BUILDPATH, 'client');
```

### Configuration Values

#### `CONSTANTS.ADMIN_COLLECTION_SIZE`

The default number of items to display per page in admin collections/lists.

**Type:** `number`

**Default:** `20`

**Configuration:** Can be overridden in `config/default.json` with the key `admin_collection_size`

**Example:**
```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';

// Use in pagination
const limit = CONSTANTS.ADMIN_COLLECTION_SIZE;
const offset = (page - 1) * limit;

const products = await select()
  .from('product')
  .limit(limit)
  .offset(offset)
  .execute(pool);
```

## Common Use Cases

### File Upload Handling

```typescript
import { CONSTANTS } from '@evershop/evershop/lib/helpers';
import path from 'path';
import fs from 'fs';

export async function saveUploadedFile(file: Express.Multer.File) {
  // Create upload directory in media folder
  const uploadDir = path.join(CONSTANTS.MEDIAPATH, 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Save file
  const filePath = path.join(uploadDir, file.originalname);
  fs.writeFileSync(filePath, file.buffer);
  
  return filePath;
}
```

