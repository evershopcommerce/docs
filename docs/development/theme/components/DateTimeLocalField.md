---
sidebar_position: 13
title: DateTimeLocalField
description: A date and time picker input field with validation.
hide_table_of_contents: false
keywords:
  - EverShop DateTimeLocalField
  - datetime picker
  - datetime input
groups:
  - forms
---

# DateTimeLocalField

## Description

A date and time picker input field component that integrates with React Hook Form. Provides a native datetime-local picker interface with min/max validation.

## Import

```typescript
import { DateTimeLocalField } from '@components/common/form/DateTimeLocalField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { DateTimeLocalField } from '@components/common/form/DateTimeLocalField';

function AppointmentForm() {
  return (
    <Form action="/api/appointments">
      <DateTimeLocalField
        name="appointmentTime"
        label="Appointment Date & Time"
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
      <td>Minimum allowed datetime</td>
    </tr>
    <tr>
      <td>max</td>
      <td>string</td>
      <td>-</td>
      <td>Maximum allowed datetime</td>
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

## Example: Meeting Scheduler

```tsx
import { Form } from '@components/common/form/Form';
import { DateTimeLocalField } from '@components/common/form/DateTimeLocalField';

function MeetingForm() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);
  
  return (
    <Form action="/api/meetings">
      <DateTimeLocalField
        name="startTime"
        label="Meeting Start Time"
        min={minDateTime}
        step={900} // 15 minute intervals
        required
        helperText="Select date and time for the meeting"
      />
    </Form>
  );
}
```

## Example: Event Scheduling

```tsx
import { Form } from '@components/common/form/Form';
import { DateTimeLocalField } from '@components/common/form/DateTimeLocalField';

function EventForm() {
  return (
    <Form action="/api/events">
      <DateTimeLocalField
        name="eventStart"
        label="Event Start"
        required
      />
      
      <DateTimeLocalField
        name="eventEnd"
        label="Event End"
        required
        validation={{
          validate: (value, formValues) => {
            if (!value || !formValues.eventStart) return true;
            return value > formValues.eventStart || 'End time must be after start time';
          }
        }}
      />
    </Form>
  );
}
```

## Features

- **Native Picker**: Uses browser's native datetime-local picker
- **Min/Max Validation**: Built-in validation for datetime ranges
- **Step Control**: Control time interval precision
- **Auto-cleanup**: Automatically unregisters on unmount
- **TypeScript Support**: Full type safety with generics

## Datetime Format

Values are in `YYYY-MM-DDTHH:mm` format (ISO 8601 local datetime string).

## Related Components

- [Form](Form.md) - Parent form component
- [DateField](DateField.md) - Date only picker
- [TimeField](TimeField.md) - Time only picker
