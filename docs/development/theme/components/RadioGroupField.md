---
sidebar_position: 17
title: RadioGroupField
description: A group of radio button inputs for single selection.
hide_table_of_contents: false
keywords:
  - EverShop RadioGroupField
  - radio buttons
  - radio group
groups:
  - forms
---

# RadioGroupField

## Description

A radio button group field component that allows users to select one option from a list. Integrates with React Hook Form using Controller for better control handling.

## Import

```typescript
import { RadioGroupField } from '@components/common/form/RadioGroupField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { RadioGroupField } from '@components/common/form/RadioGroupField';

function ShippingForm() {
  const shippingOptions = [
    { value: 'standard', label: 'Standard Shipping - Free' },
    { value: 'express', label: 'Express Shipping - $10' },
    { value: 'overnight', label: 'Overnight Shipping - $25' }
  ];

  return (
    <Form action="/api/shipping">
      <RadioGroupField
        name="shippingMethod"
        label="Shipping Method"
        options={shippingOptions}
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
      <td>RadioOption[]</td>
      <td>-</td>
      <td>Array of radio option objects (required)</td>
    </tr>
    <tr>
      <td>label</td>
      <td>string</td>
      <td>-</td>
      <td>Label text for the radio group</td>
    </tr>
    <tr>
      <td>direction</td>
      <td>'horizontal' | 'vertical'</td>
      <td>'vertical'</td>
      <td>Layout direction of radio buttons</td>
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
      <td>disabled</td>
      <td>boolean</td>
      <td>false</td>
      <td>Disables all radio buttons</td>
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

## RadioOption Type

```typescript
interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

## Example: Payment Method

```tsx
import { Form } from '@components/common/form/Form';
import { RadioGroupField } from '@components/common/form/RadioGroupField';

function PaymentForm() {
  const paymentMethods = [
    { value: 'credit', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank', label: 'Bank Transfer' }
  ];

  return (
    <Form action="/api/payment">
      <RadioGroupField
        name="paymentMethod"
        label="Payment Method"
        options={paymentMethods}
        direction="vertical"
        required
      />
    </Form>
  );
}
```

## Example: Horizontal Layout

```tsx
import { Form } from '@components/common/form/Form';
import { RadioGroupField } from '@components/common/form/RadioGroupField';

function GenderForm() {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Form action="/api/profile">
      <RadioGroupField
        name="gender"
        label="Gender"
        options={genderOptions}
        direction="horizontal"
      />
    </Form>
  );
}
```

## Example: With Disabled Options

```tsx
import { Form } from '@components/common/form/Form';
import { RadioGroupField } from '@components/common/form/RadioGroupField';

function PlanForm() {
  const plans = [
    { value: 'basic', label: 'Basic Plan - $9/mo' },
    { value: 'pro', label: 'Pro Plan - $29/mo' },
    { value: 'enterprise', label: 'Enterprise Plan - Contact Sales', disabled: true }
  ];

  return (
    <Form action="/api/plans">
      <RadioGroupField
        name="plan"
        label="Select Your Plan"
        options={plans}
        defaultValue="basic"
        required
      />
    </Form>
  );
}
```

## Features

- **Single Selection**: Only one option can be selected at a time
- **Horizontal/Vertical Layout**: Control layout direction
- **Disabled Options**: Mark specific options as disabled
- **Controller Integration**: Uses React Hook Form Controller for better control
- **TypeScript Support**: Full type safety with generics

## Notes

- Uses `fieldset` and `legend` for proper accessibility
- Individual options can be disabled while keeping others enabled
- The `direction` prop controls CSS class for layout

## Related Components

- [Form](Form.md) - Parent form component
- [SelectField](SelectField.md) - Dropdown selection
- [CheckboxField](CheckboxField.md) - Multiple selection with checkboxes
- [ToggleField](ToggleField.md) - Switch toggle
