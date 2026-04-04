---
sidebar_position: 81
keywords:
- createPage
- cms
- page
groups:
- cms
sidebar_label: createPage
title: createPage
description: Create a new CMS page.
---

# createPage

Create a new CMS page with content, URL, and SEO metadata.

## Import

```typescript
import { createPage } from '@evershop/evershop/cms/services';
```

## Syntax

```typescript
createPage(data: PageData, context?: Record<string, any>): Promise<CmsPageRow>
```

### Parameters

**`data`**

**Type:** `PageData`

```typescript
{
  name: string;           // Page title (required)
  status: '0' | '1';     // Published status (required)
  url_key: string;        // URL slug (required)
  content: string;        // Page content - EditorJS JSON (required)
  meta_title: string;     // SEO title (required)
  meta_description?: string;
  meta_keywords?: string;
  layout?: string;
}
```

**`context`**

**Type:** `Record<string, any>` (optional)

Context object passed to hooks.

## Return Value

Returns `Promise` with the created page data including generated `cms_page_id` and `uuid`.

## Examples

```typescript
import { createPage } from '@evershop/evershop/cms/services';

const page = await createPage({
  name: 'About Us',
  status: '1',
  url_key: 'about-us',
  content: '{"blocks":[]}',
  meta_title: 'About Our Store'
});
```

## Notes

- Content is sanitized for XSS before saving
- Data is validated against a JSON schema
- Wrapped in a database transaction
- Uses hookable pattern for extensibility

## See Also

- [browFiles](/docs/development/module/functions/browFiles) - Browse uploaded files
- [uploadFile](/docs/development/module/functions/uploadFile) - Upload a file
