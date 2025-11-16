---
sidebar_position: 14
title: TimeField
description: A time picker input field with validation.
hide_table_of_contents: false
keywords:
  - EverShop TimeField
  - time picker
  - time input
groups:
  - forms
---

# TimeField

## Description

A time picker input field component that integrates with React Hook Form. Provides a native time picker interface with min/max validation and step control.

## Import

```typescript
import { TimeField } from '@components/common/form/TimeField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { TimeField } from '@components/common/form/TimeField';

function ScheduleForm() {
  return (
    <Form action="/api/schedule">
      <TimeField
        name="openingTime"
        label="Opening Time"
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
      <td>min</td>
      <td>string</td>
      <td>-</td>
      <td>Minimum allowed time (HH:mm format)</td>
    </tr>
    <tr>
      <td>max</td>
      <td>string</td>
      <td>-</td>
      <td>Maximum allowed time (HH:mm format)</td>
    </tr>
    <tr>
      <td>step</td>
      <td>number</td>
      <td>-</td>
      <td>Step interval in seconds</td>
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

## Example: Business Hours

```tsx
import { Form } from '@components/common/form/Form';
import { TimeField } from '@components/common/form/TimeField';

function BusinessHoursForm() {
  return (
    <Form action="/api/business-hours">
      <TimeField
        name="openTime"
        label="Opening Time"
        min="06:00"
        max="12:00"
        step={1800} // 30 minute intervals
        required
      />
      
      <TimeField
        name="closeTime"
        label="Closing Time"
        min="12:00"
        max="23:00"
        step={1800}
        required
        validation={{
          validate: (value, formValues) => {
            if (!value || !formValues.openTime) return true;
            return value > formValues.openTime || 'Closing time must be after opening time';
          }
        }}
      />
    </Form>
  );
}
```

## Example: Alarm Time

```tsx
import { Form } from '@components/common/form/Form';
import { TimeField } from '@components/common/form/TimeField';

function AlarmForm() {
  return (
    <Form action="/api/alarms">
      <TimeField
        name="alarmTime"
        label="Wake Up Time"
        defaultValue="07:00"
        step={300} // 5 minute intervals
        required
        helperText="Set your daily alarm time"
      />
    </Form>
  );
}
```

## Features

- **Native Time Picker**: Uses browser's native time picker
- **Min/Max Validation**: Built-in validation for time ranges
- **Step Control**: Control time interval precision (in seconds)
- **24-Hour Format**: Uses HH:mm 24-hour format
- **TypeScript Support**: Full type safety with generics

## Time Format

Values are in `HH:mm` format (24-hour time string).

## Step Values

- `60` - 1 minute intervals
- `300` - 5 minute intervals
- `900` - 15 minute intervals
- `1800` - 30 minute intervals
- `3600` - 1 hour intervals

## Related Components

- [Form](Form.md) - Parent form component
- [DateField](DateField.md) - Date picker
- [DateTimeLocalField](DateTimeLocalField.md) - Date and time picker
