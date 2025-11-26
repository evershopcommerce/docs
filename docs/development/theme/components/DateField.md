---
sidebar_position: 12
title: DateField
description: A date picker input field with min/max date validation.
hide_table_of_contents: false
keywords:
  - EverShop DateField
  - date picker
  - date input
groups:
  - forms
---

# DateField

## Description

A date picker input field component that integrates with React Hook Form. Supports min/max date validation and provides a native date picker interface.

## Import

```typescript
import { DateField } from '@components/common/form/DateField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { DateField } from '@components/common/form/DateField';

function EventForm() {
  return (
    <Form action="/api/events">
      <DateField
        name="eventDate"
        label="Event Date"
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
      <td>Minimum allowed date (YYYY-MM-DD format)</td>
    </tr>
    <tr>
      <td>max</td>
      <td>string</td>
      <td>-</td>
      <td>Maximum allowed date (YYYY-MM-DD format)</td>
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

## Example: With Min/Max Dates

```tsx
import { Form } from '@components/common/form/Form';
import { DateField } from '@components/common/form/DateField';

function BookingForm() {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  return (
    <Form action="/api/bookings">
      <DateField
        name="checkIn"
        label="Check-in Date"
        min={today}
        max={maxDate.toISOString().split('T')[0]}
        required
        helperText="Select a date within the next year"
      />
    </Form>
  );
}
```

## Example: Birthday Field

```tsx
import { Form } from '@components/common/form/Form';
import { DateField } from '@components/common/form/DateField';

function ProfileForm() {
  const today = new Date().toISOString().split('T')[0];
  const minDate = '1900-01-01';
  
  return (
    <Form action="/api/profile">
      <DateField
        name="birthdate"
        label="Date of Birth"
        min={minDate}
        max={today}
        required
      />
    </Form>
  );
}
```

## Features

- **Native Date Picker**: Uses browser's native date picker interface
- **Min/Max Validation**: Built-in validation for date ranges
- **Auto-cleanup**: Automatically unregisters on unmount
- **TypeScript Support**: Full type safety with generics

## Date Format

Values are in `YYYY-MM-DD` format (ISO 8601 date string).

## Related Components

- [Form](Form.md) - Parent form component
- [DateTimeLocalField](DateTimeLocalField.md) - Date and time picker
- [TimeField](TimeField.md) - Time picker
