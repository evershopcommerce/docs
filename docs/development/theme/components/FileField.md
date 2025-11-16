---
sidebar_position: 23
title: FileField
description: A file upload input field with size validation and multiple file support.
hide_table_of_contents: false
keywords:
  - EverShop FileField
  - file upload
  - file input
groups:
  - forms
---

# FileField

## Description

A file upload field with support for file size validation, file type filtering, multiple file selection, and display of selected files with their sizes.

## Import

```typescript
import { FileField } from '@components/common/form/FileField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { FileField } from '@components/common/form/FileField';

function ProductForm() {
  return (
    <Form action="/api/products">
      <FileField
        name="productImage"
        label="Product Image"
        accept="image/*"
        maxSize={5 * 1024 * 1024} // 5MB
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
      <td>FieldPath&lt;T&gt;</td>
      <td>-</td>
      <td>Field name (required)</td>
    </tr>
    <tr>
      <td>label</td>
      <td>string</td>
      <td>-</td>
      <td>Label text displayed above the input</td>
    </tr>
    <tr>
      <td>accept</td>
      <td>string</td>
      <td>-</td>
      <td>File type filter (e.g., 'image/*', '.pdf,.doc')</td>
    </tr>
    <tr>
      <td>multiple</td>
      <td>boolean</td>
      <td>false</td>
      <td>Allow multiple file selection</td>
    </tr>
    <tr>
      <td>maxSize</td>
      <td>number</td>
      <td>-</td>
      <td>Maximum file size in bytes</td>
    </tr>
    <tr>
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required</td>
    </tr>
    <tr>
      <td>error</td>
      <td>string</td>
      <td>-</td>
      <td>Custom error message</td>
    </tr>
    <tr>
      <td>helperText</td>
      <td>string</td>
      <td>-</td>
      <td>Helper text shown in a tooltip</td>
    </tr>
    <tr>
      <td>validation</td>
      <td>RegisterOptions&lt;T&gt;</td>
      <td>-</td>
      <td>React Hook Form validation rules</td>
    </tr>
    <tr>
      <td>wrapperClassName</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the wrapper div</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the file input</td>
    </tr>
  </tbody>
</table>

## Example: Image Upload with Size Limit

```tsx
import { Form } from '@components/common/form/Form';
import { FileField } from '@components/common/form/FileField';

function ProfileForm() {
  return (
    <Form action="/api/profile/update">
      <FileField
        name="avatar"
        label="Profile Picture"
        accept="image/jpeg,image/png,image/gif"
        maxSize={2 * 1024 * 1024} // 2MB
        required={true}
        helperText="Upload a profile picture (JPEG, PNG, or GIF)"
      />
    </Form>
  );
}
```

## Example: Multiple File Upload

```tsx
import { Form } from '@components/common/form/Form';
import { FileField } from '@components/common/form/FileField';

function DocumentUploadForm() {
  return (
    <Form action="/api/documents">
      <FileField
        name="documents"
        label="Upload Documents"
        accept=".pdf,.doc,.docx"
        multiple={true}
        maxSize={10 * 1024 * 1024} // 10MB per file
        helperText="Select one or more documents (PDF, DOC, DOCX)"
      />
    </Form>
  );
}
```

## Example: Product Gallery

```tsx
import { Form } from '@components/common/form/Form';
import { FileField } from '@components/common/form/FileField';

function ProductGalleryForm() {
  return (
    <Form action="/api/products/gallery">
      <FileField
        name="images"
        label="Product Images"
        accept="image/*"
        multiple={true}
        maxSize={5 * 1024 * 1024} // 5MB per image
        validation={{
          validate: {
            maxFiles: (files) => 
              !files || files.length <= 10 || 'Maximum 10 images allowed'
          }
        }}
        helperText="Upload up to 10 product images"
      />
    </Form>
  );
}
```

## Example: Custom Validation

```tsx
import { Form } from '@components/common/form/Form';
import { FileField } from '@components/common/form/FileField';

function ResumeUploadForm() {
  return (
    <Form action="/api/applications">
      <FileField
        name="resume"
        label="Resume"
        accept=".pdf"
        required={true}
        maxSize={3 * 1024 * 1024} // 3MB
        validation={{
          required: 'Resume is required',
          validate: {
            fileType: (files) => {
              if (!files || files.length === 0) return true;
              return files[0].type === 'application/pdf' || 
                     'Only PDF files are allowed';
            }
          }
        }}
      />
    </Form>
  );
}
```

## File Size Format

Maximum file sizes are specified in bytes:
- **1 KB**: `1024`
- **1 MB**: `1024 * 1024` or `1048576`
- **5 MB**: `5 * 1024 * 1024` or `5242880`
- **10 MB**: `10 * 1024 * 1024` or `10485760`

The component automatically displays file sizes in a readable format (Bytes, KB, MB, GB).

## Accept Attribute

The `accept` prop filters file types in the file picker:
- **All images**: `"image/*"`
- **Specific images**: `"image/jpeg,image/png"`
- **Documents**: `".pdf,.doc,.docx"`
- **Archives**: `".zip,.rar"`
- **All files**: Omit the accept prop

## File Size Validation

When `maxSize` is provided:
1. Each selected file is validated against the size limit
2. If any file exceeds the limit, an error is shown
3. The error message displays the maximum size in readable format
4. A hint showing the max size is displayed below the input

## Features

- **File Type Filter**: Accept attribute filters file picker
- **Size Validation**: Automatic validation against maxSize
- **Multiple Files**: Support for selecting multiple files
- **File List Display**: Shows selected files with names and sizes
- **Size Formatting**: Displays file sizes in readable format (KB, MB, GB)
- **Size Hint**: Shows maximum allowed size
- **Tooltip Support**: Helper text displayed in tooltip
- **Custom Validation**: Support for additional validation rules
- **TypeScript Support**: Full type safety with generics

## File Display

When files are selected, the component displays:
- A "Selected files:" label
- List of files showing:
  - File name
  - File size in readable format

## Styling

- Uses `file-size-hint` class for the max size display
- Uses `file-list` class for the selected files container
- Uses `file-items` class for the file list
- Integrates with form error states

## Related Components

- [Form](Form.md) - Parent form component
- [InputField](InputField.md) - General text input
