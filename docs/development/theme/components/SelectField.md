---
sidebar_position: 16
title: SelectField
description: A dropdown select field with single or multiple selection.
hide_table_of_contents: false
keywords:
  - EverShop SelectField
  - select dropdown
  - dropdown field
groups:
  - forms
---

# SelectField

## Description

A dropdown select field component that integrates with React Hook Form. Supports single or multiple selection, placeholder text, and disabled options.

## Import

```typescript
import { SelectField } from '@components/common/form/SelectField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { SelectField } from '@components/common/form/SelectField';

function CategoryForm() {
  const categories = [
    { value: '1', label: 'Electronics' },
    { value: '2', label: 'Clothing' },
    { value: '3', label: 'Books' }
  ];

  return (
    <Form action="/api/products">
      <SelectField
        name="category"
        label="Category"
        options={categories}
        placeholder="Select a category"
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
      <td>options</td>
      <td>SelectOption[]</td>
      <td>-</td>
      <td>Array of option objects (required)</td>
    </tr>
    <tr>
      <td>label</td>
      <td>string</td>
      <td>-</td>
      <td>Label text displayed above the select</td>
    </tr>
    <tr>
      <td>placeholder</td>
      <td>string</td>
      <td>-</td>
      <td>Placeholder text for empty selection</td>
    </tr>
    <tr>
      <td>multiple</td>
      <td>boolean</td>
      <td>false</td>
      <td>Allow multiple selections</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>string | number</td>
      <td>-</td>
      <td>Default selected value</td>
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
      <td>...props</td>
      <td>SelectHTMLAttributes</td>
      <td>-</td>
      <td>All standard HTML select attributes</td>
    </tr>
  </tbody>
</table>

## SelectOption Type

```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

## Example: Country Selector

```tsx
import { Form } from '@components/common/form/Form';
import { SelectField } from '@components/common/form/SelectField';

function AddressForm() {
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' }
  ];

  return (
    <Form action="/api/address">
      <SelectField
        name="country"
        label="Country"
        options={countries}
        placeholder="Select your country"
        required
      />
    </Form>
  );
}
```

## Example: Multiple Selection

```tsx
import { Form } from '@components/common/form/Form';
import { SelectField } from '@components/common/form/SelectField';

function InterestsForm() {
  const interests = [
    { value: 'tech', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'travel', label: 'Travel' }
  ];

  return (
    <Form action="/api/interests">
      <SelectField
        name="interests"
        label="Select Your Interests"
        options={interests}
        multiple
        helperText="Hold Ctrl/Cmd to select multiple"
      />
    </Form>
  );
}
```

## Example: With Disabled Options

```tsx
import { Form } from '@components/common/form/Form';
import { SelectField } from '@components/common/form/SelectField';

function SubscriptionForm() {
  const plans = [
    { value: 'free', label: 'Free Plan' },
    { value: 'basic', label: 'Basic Plan - $9/mo' },
    { value: 'pro', label: 'Pro Plan - $29/mo' },
    { value: 'enterprise', label: 'Enterprise Plan', disabled: true }
  ];

  return (
    <Form action="/api/subscription">
      <SelectField
        name="plan"
        label="Subscription Plan"
        options={plans}
        defaultValue="free"
        required
      />
    </Form>
  );
}
```

## Example: With Default Value

```tsx
import { Form } from '@components/common/form/Form';
import { SelectField } from '@components/common/form/SelectField';

function LanguageForm() {
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  return (
    <Form action="/api/language">
      <SelectField
        name="language"
        label="Preferred Language"
        options={languages}
        defaultValue="en"
        required
      />
    </Form>
  );
}
```

## Features

- **Single/Multiple Selection**: Toggle with `multiple` prop
- **Disabled Options**: Mark specific options as disabled
- **Placeholder Support**: Show placeholder for empty selection
- **Required Validation**: Built-in validation for required selections
- **TypeScript Support**: Full type safety with generics

## Notes

- When `required` is true, the component validates that a value is selected
- Empty string values are validated as empty
- For multiple selection, returns an array of selected values

## Related Components

- [Form](Form.md) - Parent form component
- [RadioGroupField](RadioGroupField.md) - Radio button selection
- [CheckboxField](CheckboxField.md) - Checkbox selection
- [ReactSelectField](ReactSelectField.md) - Enhanced select with search
