---
sidebar_position: 19
title: ToggleField
description: A toggle switch input field for boolean or binary values.
hide_table_of_contents: false
keywords:
  - EverShop ToggleField
  - toggle switch
  - switch input
groups:
  - forms
---

# ToggleField

## Description

A toggle switch field component that provides a visual switch interface for boolean or binary (0/1) values. Features two sizes and configurable label text for the on/off states.

## Import

```typescript
import { ToggleField } from '@components/common/form/ToggleField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { ToggleField } from '@components/common/form/ToggleField';

function SettingsForm() {
  return (
    <Form action="/api/settings">
      <ToggleField
        name="emailNotifications"
        label="Email Notifications"
        defaultValue={true}
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
      <td>Label text displayed above the toggle</td>
    </tr>
    <tr>
      <td>trueValue</td>
      <td>boolean | 1</td>
      <td>true</td>
      <td>Value when toggle is on</td>
    </tr>
    <tr>
      <td>falseValue</td>
      <td>boolean | 0</td>
      <td>false</td>
      <td>Value when toggle is off</td>
    </tr>
    <tr>
      <td>trueLabel</td>
      <td>string</td>
      <td>'Yes'</td>
      <td>Label text when toggle is on</td>
    </tr>
    <tr>
      <td>falseLabel</td>
      <td>string</td>
      <td>'No'</td>
      <td>Label text when toggle is off</td>
    </tr>
    <tr>
      <td>size</td>
      <td>'sm' | 'default'</td>
      <td>'default'</td>
      <td>Size of the toggle switch</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>boolean | 0 | 1</td>
      <td>false</td>
      <td>Default toggle state</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>boolean</td>
      <td>false</td>
      <td>Disables the toggle</td>
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
      <td>onChange</td>
      <td>(value: boolean | 0 | 1) =&gt; void</td>
      <td>-</td>
      <td>Callback fired when the value changes</td>
    </tr>
    <tr>
      <td>wrapperClassName</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the wrapper div</td>
    </tr>
  </tbody>
</table>

## Example: Boolean Values

```tsx
import { Form } from '@components/common/form/Form';
import { ToggleField } from '@components/common/form/ToggleField';

function NotificationSettings() {
  return (
    <Form action="/api/notifications">
      <ToggleField
        name="emailEnabled"
        label="Email Notifications"
        trueLabel="Enabled"
        falseLabel="Disabled"
        defaultValue={true}
      />
      
      <ToggleField
        name="smsEnabled"
        label="SMS Notifications"
        trueLabel="On"
        falseLabel="Off"
      />
    </Form>
  );
}
```

## Example: Binary Values (0/1)

```tsx
import { Form } from '@components/common/form/Form';
import { ToggleField } from '@components/common/form/ToggleField';

function ProductForm() {
  return (
    <Form action="/api/products">
      <ToggleField
        name="isPublished"
        label="Product Status"
        trueValue={1}
        falseValue={0}
        trueLabel="Published"
        falseLabel="Draft"
        defaultValue={0}
      />
    </Form>
  );
}
```

## Example: Different Sizes

```tsx
import { Form } from '@components/common/form/Form';
import { ToggleField } from '@components/common/form/ToggleField';

function SizeDemo() {
  return (
    <Form action="/api/settings">
      <ToggleField
        name="setting1"
        label="Small Toggle"
        size="sm"
      />
      
      <ToggleField
        name="setting2"
        label="Default Toggle"
        size="default"
      />
    </Form>
  );
}
```

## Example: With Callback

```tsx
import { Form } from '@components/common/form/Form';
import { ToggleField } from '@components/common/form/ToggleField';
import { useState } from 'react';

function FeatureToggle() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Form action="/api/features">
      <ToggleField
        name="feature"
        label="Advanced Features"
        onChange={(value) => {
          setIsEnabled(Boolean(value));
          console.log('Feature toggled:', value);
        }}
        helperText={isEnabled ? 'Advanced features are active' : 'Enable to access more features'}
      />
    </Form>
  );
}
```

## Size Options

- **sm**: 14 x 24 px
- **default**: 18.4 x 32 px — the default

## Features

- **Visual Feedback**: Animated switch with smooth transitions
- **Flexible Values**: Support for boolean or binary (0/1) values
- **Custom Labels**: Different labels for on/off states
- **Size Control**: Two size options
- **Controller Integration**: Uses React Hook Form Controller
- **Accessibility**: Includes ARIA attributes and screen reader support
- **TypeScript Support**: Full type safety with generics

## Styling

The toggle uses Tailwind CSS classes and includes:
- Focus ring for keyboard navigation
- Smooth color transitions
- Disabled state styling
- Error state styling with red ring

## Related Components

- [Form](Form.md) - Parent form component
- [CheckboxField](CheckboxField.md) - Checkbox input
- [RadioGroupField](RadioGroupField.md) - Radio button selection
