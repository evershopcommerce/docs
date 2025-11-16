---
sidebar_position: 6
title: TextareaField
description: A multi-line text input field component with validation and error handling.
hide_table_of_contents: false
keywords:
  - EverShop TextareaField
  - textarea
  - form field
groups:
  - forms
---

# TextareaField

## Description

A multi-line text input field component that integrates with React Hook Form. Supports validation, error display, required fields, and helper text tooltips.

## Import

```typescript
import { TextareaField } from '@components/common/form/TextareaField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { TextareaField } from '@components/common/form/TextareaField';

function MyForm() {
  return (
    <Form action="/api/save">
      <TextareaField
        name="description"
        label="Description"
        rows={6}
        required
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
      <td>Label text displayed above the textarea</td>
    </tr>
    <tr>
      <td>rows</td>
      <td>number</td>
      <td>4</td>
      <td>Number of visible text rows</td>
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
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required</td>
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
      <td>CSS class for the textarea element</td>
    </tr>
    <tr>
      <td>...props</td>
      <td>TextareaHTMLAttributes</td>
      <td>-</td>
      <td>All standard HTML textarea attributes</td>
    </tr>
  </tbody>
</table>

## Example: With Validation

```tsx
import { Form } from '@components/common/form/Form';
import { TextareaField } from '@components/common/form/TextareaField';

function CommentForm() {
  return (
    <Form action="/api/comments">
      <TextareaField
        name="comment"
        label="Comment"
        placeholder="Enter your comment..."
        rows={5}
        required
        validation={{
          minLength: {
            value: 10,
            message: 'Comment must be at least 10 characters'
          },
          maxLength: {
            value: 500,
            message: 'Comment must not exceed 500 characters'
          }
        }}
      />
    </Form>
  );
}
```

## Related Components

- [Form](Form.md) - Parent form component
- [InputField](InputField.md) - Single-line text input
