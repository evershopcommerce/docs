---
sidebar_position: 9
title: TelField
description: A telephone number input field component.
hide_table_of_contents: false
keywords:
  - EverShop TelField
  - phone input
  - telephone field
groups:
  - forms
---

# TelField

## Description

A telephone number input field component that integrates with React Hook Form. Uses the HTML tel input type for better mobile keyboard support.

## Import

```typescript
import { TelField } from '@components/common/form/TelField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { TelField } from '@components/common/form/TelField';

function ContactForm() {
  return (
    <Form action="/api/contact">
      <TelField
        name="phone"
        label="Phone Number"
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

## Example: With Validation

```tsx
import { Form } from '@components/common/form/Form';
import { TelField } from '@components/common/form/TelField';

function PhoneForm() {
  return (
    <Form action="/api/phone">
      <TelField
        name="phone"
        label="Phone Number"
        placeholder="+1 (555) 123-4567"
        required
        validation={{
          pattern: {
            value: /^[\d\s\-\+\(\)]+$/,
            message: 'Please enter a valid phone number'
          }
        }}
      />
    </Form>
  );
}
```

## Example: With Icon

```tsx
import { Form } from '@components/common/form/Form';
import { TelField } from '@components/common/form/TelField';
import { Phone } from 'lucide-react';

function EmergencyForm() {
  return (
    <Form action="/api/emergency">
      <TelField
        name="emergencyContact"
        label="Emergency Contact"
        placeholder="Enter phone number"
        required
        prefixIcon={<Phone size={16} />}
      />
    </Form>
  );
}
```

## Features

- **Mobile Optimized**: Uses tel input type for numeric keyboard on mobile devices
- **Icon Support**: Add prefix or suffix icons
- **Flexible Format**: No built-in format restrictions, add your own validation pattern
- **TypeScript Support**: Full type safety with generics

## Related Components

- [Form](Form.md) - Parent form component
- [EmailField](EmailField.md) - Email input field
- [InputField](InputField.md) - General text input
