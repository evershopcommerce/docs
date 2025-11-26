---
sidebar_position: 5
title: InputField
description: A text input field component with validation, error handling, and icon support.
hide_table_of_contents: false
keywords:
  - EverShop InputField
  - text input
  - form field
groups:
  - forms
---

# InputField

## Description

A text input field component that integrates with React Hook Form. Supports validation, error display, required fields, helper text tooltips, and prefix/suffix icons.

## Import

```typescript
import { InputField } from '@components/common/form/InputField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';

function MyForm() {
  return (
    <Form action="/api/save">
      <InputField
        name="username"
        label="Username"
        required
        helperText="Enter your username"
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
      <td>type</td>
      <td>string</td>
      <td>'text'</td>
      <td>HTML input type (text, password, email, etc.)</td>
    </tr>
    <tr>
      <td>error</td>
      <td>string</td>
      <td>-</td>
      <td>Custom error message to override form validation errors</td>
    </tr>
    <tr>
      <td>helperText</td>
      <td>string</td>
      <td>-</td>
      <td>Helper text shown in a tooltip next to the label</td>
    </tr>
    <tr>
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required and adds validation</td>
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
      <td>CSS class for the input element</td>
    </tr>
    <tr>
      <td>prefixIcon</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Icon or element displayed on the left inside the input</td>
    </tr>
    <tr>
      <td>suffixIcon</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Icon or element displayed on the right inside the input</td>
    </tr>
    <tr>
      <td>...props</td>
      <td>InputHTMLAttributes</td>
      <td>-</td>
      <td>All standard HTML input attributes (placeholder, disabled, etc.)</td>
    </tr>
  </tbody>
</table>

## Example: Basic Usage

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';

function UserForm() {
  return (
    <Form action="/api/users">
      <InputField
        name="firstName"
        label="First Name"
        placeholder="Enter your first name"
        required
      />
      
      <InputField
        name="lastName"
        label="Last Name"
        placeholder="Enter your last name"
      />
    </Form>
  );
}
```

## Example: With Validation

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';

function ValidationForm() {
  return (
    <Form action="/api/validate">
      <InputField
        name="username"
        label="Username"
        required
        validation={{
          minLength: {
            value: 3,
            message: 'Username must be at least 3 characters'
          },
          maxLength: {
            value: 20,
            message: 'Username must not exceed 20 characters'
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores'
          }
        }}
      />
    </Form>
  );
}
```

## Example: With Icons

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';
import { Search, User } from 'lucide-react';

function IconForm() {
  return (
    <Form action="/api/search">
      <InputField
        name="search"
        label="Search"
        placeholder="Search..."
        prefixIcon={<Search size={16} />}
      />
      
      <InputField
        name="username"
        label="Username"
        suffixIcon={<User size={16} />}
      />
    </Form>
  );
}
```

## Example: With Helper Text

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';

function HelpForm() {
  return (
    <Form action="/api/settings">
      <InputField
        name="apiKey"
        label="API Key"
        helperText="You can find your API key in the developer settings"
        required
      />
    </Form>
  );
}
```

## Features

- **Automatic Validation**: Integrates with React Hook Form validation
- **Error Display**: Shows validation errors below the input
- **Required Indicator**: Displays asterisk (*) for required fields
- **Helper Tooltips**: Shows helpful information in a tooltip
- **Icon Support**: Add prefix or suffix icons inside the input
- **Accessibility**: Includes ARIA attributes for screen readers
- **TypeScript Support**: Full type safety with generics

## Notes

- Must be used inside a `Form` component or `FormProvider`
- Automatically connects to React Hook Form using `useFormContext`
- Error messages are automatically translated using the `_()` function
- The component applies an 'error' class when validation fails
- Icons automatically adjust input padding

## Related Components

- [Form](Form.md) - Parent form component
- [PasswordField](PasswordField.md) - Input field with password visibility toggle
- [EmailField](EmailField.md) - Input field with email validation
- [NumberField](NumberField.md) - Input field for numeric values
