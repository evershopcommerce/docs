---
sidebar_position: 8
title: EmailField
description: An email input field with automatic email validation.
hide_table_of_contents: false
keywords:
  - EverShop EmailField
  - email input
  - form field
groups:
  - forms
---

# EmailField

## Description

An email input field component with automatic email format validation. Integrates with React Hook Form and includes support for icons and helper text.

## Import

```typescript
import { EmailField } from '@components/common/form/EmailField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { EmailField } from '@components/common/form/EmailField';

function ContactForm() {
  return (
    <Form action="/api/contact">
      <EmailField
        name="email"
        label="Email Address"
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
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>string</td>
      <td>-</td>
      <td>Default email value</td>
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

## Example: Basic Usage

```tsx
import { Form } from '@components/common/form/Form';
import { EmailField } from '@components/common/form/EmailField';

function SubscribeForm() {
  return (
    <Form action="/api/subscribe">
      <EmailField
        name="email"
        label="Your Email"
        placeholder="you@example.com"
        required
        helperText="We'll never share your email with anyone"
      />
    </Form>
  );
}
```

## Example: With Icon

```tsx
import { Form } from '@components/common/form/Form';
import { EmailField } from '@components/common/form/EmailField';
import { Mail } from 'lucide-react';

function LoginForm() {
  return (
    <Form action="/api/login">
      <EmailField
        name="email"
        label="Email"
        placeholder="Enter your email"
        required
        prefixIcon={<Mail size={16} />}
      />
    </Form>
  );
}
```

## Features

- **Automatic Email Validation**: Built-in regex pattern for email format
- **Icon Support**: Add prefix or suffix icons
- **Auto-cleanup**: Automatically unregisters on unmount
- **Type Safety**: Uses HTML email input type

## Validation

The component includes a default email validation pattern:
```
/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
```

You can override this pattern by providing a custom validation rule.

## Related Components

- [Form](Form.md) - Parent form component
- [InputField](InputField.md) - General text input
- [TelField](TelField.md) - Phone number input
