---
sidebar_position: 121
keywords:
- updatePage
- CMS
- page
groups:
- cms
sidebar_label: updatePage
title: updatePage
description: Update an existing CMS page.
---

# updatePage

Update an existing CMS page's content, metadata, or status.

## Import

```typescript
import { updatePage } from '@evershop/evershop/cms/services';
```

## Syntax

```typescript
updatePage(uuid: string, data: PageData, context?: Record<string, any>): Promise<CmsPageRow>
```

### Parameters

**`uuid`** — The UUID of the page to update.

**`data`** — Page data fields to update (all optional):
- `name` — Page title
- `status` — Published status (`'0'` or `'1'`)
- `url_key` — URL slug
- `content` — Page content (EditorJS JSON)
- `meta_title`, `meta_description`, `meta_keywords` — SEO fields
- `layout` — Page layout

**`context`** (optional) — Context object passed to hooks.

## Examples

```typescript
import { updatePage } from '@evershop/evershop/cms/services';

await updatePage('a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  name: 'Updated About Us',
  meta_title: 'About Our Store - Updated'
});
```

## See Also

- [createPage](/docs/development/module/functions/createPage) — Create a CMS page
