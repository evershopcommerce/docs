---
sidebar_position: 15
title: RangeField
description: A slider input field for selecting numeric values from a range.
hide_table_of_contents: false
keywords:
  - EverShop RangeField
  - range slider
  - slider input
groups:
  - forms
---

# RangeField

## Description

A range slider input field component that allows users to select a numeric value by dragging a slider. Integrates with React Hook Form and displays the current value and min/max labels.

## Import

```typescript
import { RangeField } from '@components/common/form/RangeField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { RangeField } from '@components/common/form/RangeField';

function SettingsForm() {
  return (
    <Form action="/api/settings">
      <RangeField
        name="volume"
        label="Volume"
        min={0}
        max={100}
        defaultValue={50}
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
      <td>Label text displayed above the slider</td>
    </tr>
    <tr>
      <td>min</td>
      <td>number</td>
      <td>0</td>
      <td>Minimum value</td>
    </tr>
    <tr>
      <td>max</td>
      <td>number</td>
      <td>100</td>
      <td>Maximum value</td>
    </tr>
    <tr>
      <td>step</td>
      <td>number</td>
      <td>1</td>
      <td>Increment/decrement step</td>
    </tr>
    <tr>
      <td>showValue</td>
      <td>boolean</td>
      <td>true</td>
      <td>Show current value in label</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>number</td>
      <td>-</td>
      <td>Default slider value</td>
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
      <td>InputHTMLAttributes</td>
      <td>-</td>
      <td>All standard HTML input attributes</td>
    </tr>
  </tbody>
</table>

## Example: Volume Control

```tsx
import { Form } from '@components/common/form/Form';
import { RangeField } from '@components/common/form/RangeField';

function AudioSettings() {
  return (
    <Form action="/api/audio">
      <RangeField
        name="volume"
        label="Volume"
        min={0}
        max={100}
        step={5}
        defaultValue={75}
        showValue
      />
      
      <RangeField
        name="balance"
        label="Balance"
        min={-100}
        max={100}
        step={10}
        defaultValue={0}
      />
    </Form>
  );
}
```

## Example: Price Filter

```tsx
import { Form } from '@components/common/form/Form';
import { RangeField } from '@components/common/form/RangeField';

function FilterForm() {
  return (
    <Form action="/api/filter">
      <RangeField
        name="maxPrice"
        label="Maximum Price"
        min={0}
        max={1000}
        step={50}
        defaultValue={500}
        showValue
        helperText="Drag to set maximum price"
      />
    </Form>
  );
}
```

## Example: Rating Selector

```tsx
import { Form } from '@components/common/form/Form';
import { RangeField } from '@components/common/form/RangeField';

function RatingForm() {
  return (
    <Form action="/api/ratings">
      <RangeField
        name="rating"
        label="Rating"
        min={1}
        max={5}
        step={0.5}
        defaultValue={3}
        showValue
      />
    </Form>
  );
}
```

## Features

- **Live Value Display**: Shows current value in the label as you drag
- **Min/Max Labels**: Displays minimum and maximum values below the slider
- **Auto Number Conversion**: Automatically converts value to number
- **Flexible Stepping**: Control precision with step value
- **TypeScript Support**: Full type safety with generics

## Value Display

When `showValue` is true, the current value is displayed in parentheses next to the label:
```
Volume (75)
```

## Related Components

- [Form](Form.md) - Parent form component
- [NumberField](NumberField.md) - Numeric text input
