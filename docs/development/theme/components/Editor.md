---
sidebar_position: 24
title: Editor
description: A rich text editor with drag-and-drop layout management and multiple content blocks.
hide_table_of_contents: false
keywords:
  - EverShop Editor
  - rich text editor
  - EditorJS
  - content blocks
groups:
  - forms
---

# Editor

## Description

A powerful rich text editor built on EditorJS with drag-and-drop layout management. Supports multiple content blocks including text, headers, lists, quotes, images, and custom row/column layouts. Ideal for creating complex page content with flexible layouts.

## Import

```typescript
import { Editor } from '@components/common/form/Editor';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { Editor } from '@components/common/form/Editor';

function PageForm() {
  return (
    <Form action="/api/pages">
      <Editor
        name="content"
        label="Page Content"
        value={[]}
      />
    </Form>
  );
}
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>-</td>
      <td>Field name (required)</td>
    </tr>
    <tr>
      <td>label</td>
      <td>string</td>
      <td>-</td>
      <td>Label text displayed above the editor</td>
    </tr>
    <tr>
      <td>value</td>
      <td>Row[]</td>
      <td>-</td>
      <td>Initial editor content (row structure)</td>
    </tr>
  </tbody>
</table>

## Row Structure

```typescript
interface Row {
  id?: string;
  size: string; // Row sizing (e.g., 'full')
  className?: string;
  columns: Column[];
}

interface Column {
  id?: string;
  size: string; // Column sizing (e.g., '1/2', '1/3')
  className?: string;
  data?: any; // EditorJS output data
}
```

## Example: Basic Content Editor

```tsx
import { Form } from '@components/common/form/Form';
import { Editor } from '@components/common/form/Editor';

function BlogPostForm() {
  return (
    <Form action="/api/blog/posts">
      <Editor
        name="content"
        label="Post Content"
        value={[]}
      />
    </Form>
  );
}
```

## Example: With Initial Content

```tsx
import { Form } from '@components/common/form/Form';
import { Editor } from '@components/common/form/Editor';

function EditPage() {
  const initialContent = [
    {
      size: 'full',
      columns: [
        {
          size: '1/1',
          data: {
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Welcome',
                  level: 1
                }
              },
              {
                type: 'paragraph',
                data: {
                  text: 'This is sample content.'
                }
              }
            ]
          }
        }
      ]
    }
  ];

  return (
    <Form action="/api/pages/update">
      <Editor
        name="content"
        label="Page Content"
        value={initialContent}
      />
    </Form>
  );
}
```

## Example: Product Description

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';
import { Editor } from '@components/common/form/Editor';

function ProductDescriptionForm() {
  return (
    <Form action="/api/products">
      <InputField
        name="name"
        label="Product Name"
        required={true}
      />
      
      <Editor
        name="description"
        label="Product Description"
        value={[]}
      />
    </Form>
  );
}
```

## Content Blocks

The editor supports multiple EditorJS block types:

### Text Blocks
- **Paragraph**: Standard text content
- **Header**: H1-H6 headings
- **Quote**: Blockquote with attribution
- **Raw HTML**: Custom HTML content

### List Blocks
- **Ordered List**: Numbered lists
- **Unordered List**: Bullet lists

### Media Blocks
- **Image**: Image upload with FileBrowser integration
- Supports image selection from media library
- Automatic image URL handling

## Layout System

### Row Templates
Users can add rows with different column layouts:
- Single column (1/1)
- Two columns (1/2 + 1/2)
- Three columns (1/3 + 1/3 + 1/3)
- Custom layouts

### Drag and Drop
- Drag rows to reorder content
- Visual feedback during dragging
- Keyboard navigation support

### Column Sizes
Common column size classes:
- `1/1` - Full width
- `1/2` - Half width
- `1/3` - One third
- `1/4` - One quarter
- `2/3` - Two thirds
- `3/4` - Three quarters

## Dependencies

This component uses several external libraries:
- **@editorjs/editorjs** - Core editor functionality
- **@evershop/editorjs-image** - Image block tool
- **@editorjs/header** - Header block tool
- **@editorjs/list** - List block tool
- **@editorjs/quote** - Quote block tool
- **@editorjs/raw** - Raw HTML block tool
- **@dnd-kit/core** - Drag and drop functionality
- **@dnd-kit/sortable** - Sortable list implementation

## Features

- **Rich Text Editing**: Multiple content block types
- **Drag and Drop**: Reorder rows easily
- **Flexible Layouts**: Multi-column row system
- **Image Integration**: FileBrowser for media selection
- **Auto-save**: Content automatically saved on changes
- **Keyboard Support**: Full keyboard navigation
- **Visual Editor**: WYSIWYG-style editing
- **Responsive Design**: Prose styling with max-width
- **Hidden Input**: Stores structured data in form

## Output Format

The editor outputs an array of rows, each containing columns with EditorJS data:
```javascript
[
  {
    id: "r__uuid",
    size: "full",
    className: "grid-cols-1",
    columns: [
      {
        id: "c__uuid",
        size: "1/1",
        className: "col-span-1",
        data: {
          blocks: [
            { type: "header", data: { text: "...", level: 1 } },
            { type: "paragraph", data: { text: "..." } }
          ]
        }
      }
    ]
  }
]
```

## Styling

The component uses:
- Prose classes for typography
- Grid system for column layouts
- Border and shadow utilities
- Drag handle indicators
- Custom SCSS styles in Editor.scss

## Related Components

- [Form](Form.md) - Parent form component
- [InputField](InputField.md) - Simple text input
- [TextareaField](TextareaField.md) - Plain text area
