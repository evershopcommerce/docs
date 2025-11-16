---
sidebar_position: 18
title: CheckboxField
description: A checkbox input field for single or multiple selections.
hide_table_of_contents: false
keywords:
  - EverShop CheckboxField
  - checkbox
  - checkbox group
groups:
  - forms
---

# CheckboxField

## Description

A checkbox field component that supports both single checkbox and multiple checkbox group modes. Integrates with React Hook Form using Controller for better state management.

## Import

```typescript
import { CheckboxField } from '@components/common/form/CheckboxField';
```

## Usage

### Single Checkbox

```tsx
import { Form } from '@components/common/form/Form';
import { CheckboxField } from '@components/common/form/CheckboxField';

function TermsForm() {
  return (
    <Form action="/api/accept">
      <CheckboxField
        name="termsAccepted"
        label="I accept the terms and conditions"
        required
      />
    </Form>
  );
}
```

### Multiple Checkboxes

```tsx
import { Form } from '@components/common/form/Form';
import { CheckboxField } from '@components/common/form/CheckboxField';

function InterestsForm() {
  const interests = [
    { value: 'tech', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' }
  ];

  return (
    <Form action="/api/interests">
      <CheckboxField
        name="interests"
        label="Select Your Interests"
        options={interests}
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
      <td>Label text</td>
    </tr>
    <tr>
      <td>options</td>
      <td>CheckboxOption[]</td>
      <td>-</td>
      <td>Array of options (if not provided, renders single checkbox)</td>
    </tr>
    <tr>
      <td>direction</td>
      <td>'horizontal' | 'vertical'</td>
      <td>'vertical'</td>
      <td>Layout direction for checkbox group</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>boolean | (string | number)[]</td>
      <td>-</td>
      <td>Default value (boolean for single, array for multiple)</td>
    </tr>
    <tr>
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>boolean</td>
      <td>false</td>
      <td>Disables all checkboxes</td>
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
      <td>InputHTMLAttributes</td>
      <td>-</td>
      <td>All standard HTML input attributes</td>
    </tr>
  </tbody>
</table>

## CheckboxOption Type

```typescript
interface CheckboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

## Example: Terms and Conditions

```tsx
import { Form } from '@components/common/form/Form';
import { CheckboxField } from '@components/common/form/CheckboxField';

function SignupForm() {
  return (
    <Form action="/api/signup">
      <CheckboxField
        name="agreeToTerms"
        label="I agree to the Terms of Service and Privacy Policy"
        required
        validation={{
          validate: (value) => value === true || 'You must accept the terms'
        }}
      />
      
      <CheckboxField
        name="newsletter"
        label="Subscribe to our newsletter"
        defaultValue={true}
      />
    </Form>
  );
}
```

## Example: Feature Selection

```tsx
import { Form } from '@components/common/form/Form';
import { CheckboxField } from '@components/common/form/CheckboxField';

function FeaturesForm() {
  const features = [
    { value: 'notifications', label: 'Email Notifications' },
    { value: 'analytics', label: 'Analytics Dashboard' },
    { value: 'api', label: 'API Access' },
    { value: 'support', label: 'Priority Support', disabled: true }
  ];

  return (
    <Form action="/api/features">
      <CheckboxField
        name="enabledFeatures"
        label="Enable Features"
        options={features}
        direction="vertical"
        defaultValue={['notifications', 'analytics']}
      />
    </Form>
  );
}
```

## Example: Horizontal Layout

```tsx
import { Form } from '@components/common/form/Form';
import { CheckboxField } from '@components/common/form/CheckboxField';

function PreferencesForm() {
  const days = [
    { value: 'mon', label: 'Mon' },
    { value: 'tue', label: 'Tue' },
    { value: 'wed', label: 'Wed' },
    { value: 'thu', label: 'Thu' },
    { value: 'fri', label: 'Fri' }
  ];

  return (
    <Form action="/api/preferences">
      <CheckboxField
        name="workingDays"
        label="Select Working Days"
        options={days}
        direction="horizontal"
      />
    </Form>
  );
}
```

## Behavior

### Single Checkbox Mode
- When `options` is not provided or empty
- Returns `true` or `false`
- Useful for yes/no, agree/disagree scenarios

### Multiple Checkbox Mode
- When `options` array is provided
- Returns array of selected values
- Allows multiple selections
- Individual options can be disabled

## Features

- **Dual Mode**: Single checkbox or checkbox group
- **Horizontal/Vertical Layout**: Control layout direction
- **Disabled Options**: Mark specific options as disabled
- **Controller Integration**: Uses React Hook Form Controller
- **Array Value Management**: Automatically handles array of selected values
- **TypeScript Support**: Full type safety with generics

## Related Components

- [Form](Form.md) - Parent form component
- [RadioGroupField](RadioGroupField.md) - Single selection with radio buttons
- [ToggleField](ToggleField.md) - Switch toggle
- [SelectField](SelectField.md) - Dropdown selection
