---
sidebar_position: 10
title: UrlField
description: A URL input field with automatic URL validation.
hide_table_of_contents: false
keywords:
  - EverShop UrlField
  - URL input
  - link field
groups:
  - forms
---

# UrlField

## Description

A URL input field component with automatic URL format validation. Integrates with React Hook Form and supports icons and helper text.

## Import

```typescript
import { UrlField } from '@components/common/form/UrlField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { UrlField } from '@components/common/form/UrlField';

function WebsiteForm() {
  return (
    <Form action="/api/website">
      <UrlField
        name="website"
        label="Website URL"
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
      <td>Label text displayed above the input</td>
    </tr>
    <tr>
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>string</td>
      <td>-</td>
      <td>Default URL value</td>
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
      <td>prefixIcon</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Icon displayed on the left inside the input</td>
    </tr>
    <tr>
      <td>suffixIcon</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Icon displayed on the right inside the input</td>
    </tr>
    <tr>
      <td>wrapperClassName</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the wrapper div</td>
    </tr>
    <tr>
      <td>...props</td>
      <td>InputHTMLAttributes</td>
      <td>-</td>
      <td>All standard HTML input attributes</td>
    </tr>
  </tbody>
</table>

## Example: Basic Usage

```tsx
import { Form } from '@components/common/form/Form';
import { UrlField } from '@components/common/form/UrlField';

function SocialLinksForm() {
  return (
    <Form action="/api/social">
      <UrlField
        name="twitter"
        label="Twitter Profile"
        placeholder="https://twitter.com/username"
        helperText="Enter your full Twitter profile URL"
      />
      
      <UrlField
        name="linkedin"
        label="LinkedIn Profile"
        placeholder="https://linkedin.com/in/username"
      />
    </Form>
  );
}
```

## Example: With Icon

```tsx
import { Form } from '@components/common/form/UrlField';
import { UrlField } from '@components/common/form/UrlField';
import { Link } from 'lucide-react';

function LinkForm() {
  return (
    <Form action="/api/links">
      <UrlField
        name="homepage"
        label="Homepage"
        placeholder="https://example.com"
        required
        prefixIcon={<Link size={16} />}
      />
    </Form>
  );
}
```

## Features

- **Automatic URL Validation**: Built-in regex pattern for URL format
- **Icon Support**: Add prefix or suffix icons
- **Flexible Protocol**: Accepts URLs with or without http:// or https://
- **TypeScript Support**: Full type safety with generics

## Validation

The component includes a default URL validation pattern:
```
/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
```

You can override this pattern by providing a custom validation rule.

## Related Components

- [Form](Form.md) - Parent form component
- [EmailField](EmailField.md) - Email input field
- [InputField](InputField.md) - General text input
