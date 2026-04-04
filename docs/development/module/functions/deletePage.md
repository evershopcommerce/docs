---
sidebar_position: 122
keywords:
- deletePage
- CMS
- page
groups:
- cms
sidebar_label: deletePage
title: deletePage
description: Delete a CMS page.
---

# deletePage

Permanently delete a CMS page by its UUID.

## Import

```typescript
import { deletePage } from '@evershop/evershop/cms/services';
```

## Syntax

```typescript
deletePage(uuid: string, context?: Record<string, any>): Promise<void>
```

### Parameters

**`uuid`** — The UUID of the page to delete.

**`context`** (optional) — Context object passed to hooks.

## Examples

```typescript
import { deletePage } from '@evershop/evershop/cms/services';

await deletePage('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

## See Also

- [createPage](/docs/development/module/functions/createPage) — Create a CMS page
- [updatePage](/docs/development/module/functions/updatePage) — Update a CMS page
