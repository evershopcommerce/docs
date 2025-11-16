---
sidebar_position: 7
title: PasswordField
description: A password input field with optional visibility toggle and validation.
hide_table_of_contents: false
keywords:
  - EverShop PasswordField
  - password input
  - form field
groups:
  - forms
---

# PasswordField

## Description

A password input field component with optional show/hide toggle functionality. Includes automatic minimum length validation and integrates with React Hook Form.

## Import

```typescript
import { PasswordField } from '@components/common/form/PasswordField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { PasswordField } from '@components/common/form/PasswordField';

function LoginForm() {
  return (
    <Form action="/api/login">
      <PasswordField
        name="password"
        label="Password"
        required
        showToggle
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
      <td>Label text displayed above the input</td>
    </tr>
    <tr>
      <td>showToggle</td>
      <td>boolean</td>
      <td>false</td>
      <td>Show/hide password visibility toggle button</td>
    </tr>
    <tr>
      <td>minLength</td>
      <td>number</td>
      <td>6</td>
      <td>Minimum password length</td>
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
      <td>RegisterOptions</td>
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
      <td>onChange</td>
      <td>(value: string) =&gt; void</td>
      <td>-</td>
      <td>Callback fired when the value changes</td>
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

## Example: With Toggle

```tsx
import { Form } from '@components/common/form/Form';
import { PasswordField } from '@components/common/form/PasswordField';

function RegisterForm() {
  return (
    <Form action="/api/register">
      <PasswordField
        name="password"
        label="Password"
        placeholder="Enter your password"
        required
        showToggle
        minLength={8}
      />
      
      <PasswordField
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        showToggle
        validation={{
          validate: (value, formValues) => 
            value === formValues.password || 'Passwords do not match'
        }}
      />
    </Form>
  );
}
```

## Example: With Custom Validation

```tsx
import { Form } from '@components/common/form/Form';
import { PasswordField } from '@components/common/form/PasswordField';

function SecurityForm() {
  return (
    <Form action="/api/security">
      <PasswordField
        name="newPassword"
        label="New Password"
        required
        showToggle
        minLength={10}
        validation={{
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            message: 'Password must contain uppercase, lowercase, number, and special character'
          }
        }}
        helperText="Must be at least 10 characters with mixed case, numbers, and symbols"
      />
    </Form>
  );
}
```

## Features

- **Visibility Toggle**: Optional button to show/hide password
- **Automatic Validation**: Built-in minimum length validation
- **Icon Support**: Add prefix or suffix icons
- **Secure by Default**: Uses password input type
- **Auto-cleanup**: Automatically unregisters on unmount

## Related Components

- [Form](Form.md) - Parent form component
- [InputField](InputField.md) - General text input
