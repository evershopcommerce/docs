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

A toggle switch field component that provides a visual switch interface for boolean or binary (0/1) values. Features customizable size, variant colors, and label text for on/off states.

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
      <td>'sm' | 'md' | 'lg'</td>
      <td>'md'</td>
      <td>Size of the toggle switch</td>
    </tr>
    <tr>
      <td>variant</td>
      <td>'default' | 'success' | 'warning' | 'danger'</td>
      <td>'default'</td>
      <td>Color variant for the toggle</td>
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
        label="Medium Toggle"
        size="md"
      />
      
      <ToggleField
        name="setting3"
        label="Large Toggle"
        size="lg"
      />
    </Form>
  );
}
```

## Example: Color Variants

```tsx
import { Form } from '@components/common/form/Form';
import { ToggleField } from '@components/common/form/ToggleField';

function VariantDemo() {
  return (
    <Form action="/api/settings">
      <ToggleField
        name="default"
        label="Default"
        variant="default"
        defaultValue={true}
      />
      
      <ToggleField
        name="success"
        label="Success"
        variant="success"
        defaultValue={true}
      />
      
      <ToggleField
        name="warning"
        label="Warning"
        variant="warning"
        defaultValue={true}
      />
      
      <ToggleField
        name="danger"
        label="Danger"
        variant="danger"
        defaultValue={true}
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

- **sm**: Small toggle (h-5 w-9)
- **md**: Medium toggle (h-6 w-11) - default
- **lg**: Large toggle (h-7 w-14)

## Variant Colors

- **default**: Blue (default)
- **success**: Green
- **warning**: Yellow
- **danger**: Red

## Features

- **Visual Feedback**: Animated switch with smooth transitions
- **Flexible Values**: Support for boolean or binary (0/1) values
- **Custom Labels**: Different labels for on/off states
- **Size Control**: Three size options
- **Color Variants**: Four color schemes
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
