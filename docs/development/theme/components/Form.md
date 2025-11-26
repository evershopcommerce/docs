---
sidebar_position: 4
title: Form
description: A React Hook Form wrapper component that simplifies form submission with automatic API integration and error handling.
hide_table_of_contents: false
keywords:
  - EverShop Form
  - React Hook Form
  - form component
groups:
  - forms
---

# Form

## Description

A flexible form component built on top of React Hook Form that handles form submission, validation, error handling, and success notifications. It provides automatic API integration with customizable callbacks for success and error scenarios.

## Import

```typescript
import { Form } from '@components/common/form/Form';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';

function MyForm() {
  return (
    <Form
      action="/api/save"
      method="POST"
      onSuccess={(response) => {
        console.log('Form saved:', response);
      }}
    >
      <InputField name="name" label="Name" placeholder="Enter name" />
      <InputField name="email" type="email" label="Email" placeholder="Enter email" />
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
      <td>form</td>
      <td>UseFormReturn&lt;T&gt;</td>
      <td>-</td>
      <td>External form instance from `useForm()`. If not provided, one will be created internally</td>
    </tr>
    <tr>
      <td>action</td>
      <td>string</td>
      <td>-</td>
      <td>API endpoint URL for form submission</td>
    </tr>
    <tr>
      <td>method</td>
      <td>'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'</td>
      <td>'POST'</td>
      <td>HTTP method for the request</td>
    </tr>
    <tr>
      <td>formOptions</td>
      <td>UseFormProps&lt;T&gt;</td>
      <td>-</td>
      <td>Options passed to React Hook Form's `useForm()`</td>
    </tr>
    <tr>
      <td>onSubmit</td>
      <td>SubmitHandler&lt;T&gt;</td>
      <td>-</td>
      <td>Custom submit handler. If not provided, uses default API submission</td>
    </tr>
    <tr>
      <td>onSuccess</td>
      <td>(response: any, data: T) =&gt; void</td>
      <td>-</td>
      <td>Callback fired when submission succeeds</td>
    </tr>
    <tr>
      <td>onError</td>
      <td>(error: string, data: T) =&gt; void</td>
      <td>-</td>
      <td>Callback fired when submission fails</td>
    </tr>
    <tr>
      <td>successMessage</td>
      <td>string</td>
      <td>'Saved successfully!'</td>
      <td>Success toast message</td>
    </tr>
    <tr>
      <td>errorMessage</td>
      <td>string</td>
      <td>'Something went wrong! Please try again.'</td>
      <td>Error toast message</td>
    </tr>
    <tr>
      <td>submitBtn</td>
      <td>boolean</td>
      <td>true</td>
      <td>Whether to show the submit button</td>
    </tr>
    <tr>
      <td>submitBtnText</td>
      <td>string</td>
      <td>'Save'</td>
      <td>Text for the submit button</td>
    </tr>
    <tr>
      <td>loading</td>
      <td>boolean</td>
      <td>false</td>
      <td>External loading state that disables the form</td>
    </tr>
    <tr>
      <td>children</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Form fields and other content</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the form element</td>
    </tr>
    <tr>
      <td>noValidate</td>
      <td>boolean</td>
      <td>true</td>
      <td>Whether to disable browser validation</td>
    </tr>
  </tbody>
</table>

## Basic Example

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';
import { TextAreaField } from '@components/common/form/TextAreaField';

function ContactForm() {
  return (
    <Form
      action="/api/contact"
      method="POST"
      successMessage="Thank you for contacting us!"
      errorMessage="Failed to send message. Please try again."
    >
      <InputField name="name" label="Name" required />
      <InputField name="email" type="email" label="Email" required />
      <TextAreaField name="message" label="Message" required />
    </Form>
  );
}
```

## Example: Custom Submit Handler

```tsx
import { Form } from '@components/common/form/Form';
import { InputField } from '@components/common/form/InputField';
import { toast } from 'react-toastify';

function CustomForm() {
  const handleSubmit = async (data) => {
    // Custom logic before submission
    console.log('Form data:', data);
    
    // Make your own API call
    const response = await fetch('/api/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      toast.success('Success!');
    }
  };

  return (
    <Form onSubmit={handleSubmit} submitBtn={false}>
      <InputField name="field1" label="Field 1" />
      <InputField name="field2" label="Field 2" />
      <button type="submit">Custom Submit Button</button>
    </Form>
  );
}
```

## Example: With Success/Error Callbacks

```tsx
import { Form } from '@components/common/form/Form';
import { useRouter } from 'next/router';

function ProductForm() {
  const router = useRouter();

  const handleSuccess = (response, data) => {
    console.log('Product created:', response.data);
    // Redirect to product page
    router.push(`/products/${response.data.id}`);
  };

  const handleError = (error, data) => {
    console.error('Failed to create product:', error);
    // Custom error handling
    if (error.includes('duplicate')) {
      toast.error('Product already exists');
    }
  };

  return (
    <Form
      action="/api/products"
      method="POST"
      onSuccess={handleSuccess}
      onError={handleError}
      submitBtnText="Create Product"
    >
      <input name="name" placeholder="Product name" />
      <input name="price" type="number" placeholder="Price" />
    </Form>
  );
}
```

## Example: Using External Form Instance

```tsx
import { Form } from '@components/common/form/Form';
import { useForm } from 'react-hook-form';

function AdvancedForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      age: 0
    },
    mode: 'onChange'
  });

  const { watch } = form;
  const name = watch('name');

  return (
    <div>
      <p>Current name: {name}</p>
      
      <Form
        form={form}
        action="/api/user"
        formOptions={{
          mode: 'onChange'
        }}
      >
        <input {...form.register('name')} />
        <input {...form.register('email')} />
        <input {...form.register('age', { valueAsNumber: true })} />
      </Form>
    </div>
  );
}
```

## Example: With Validation

```tsx
import { Form, useFormContext } from '@components/common/form/Form';

function ValidatedField() {
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
      />
      {errors.email && (
        <span className="error">{errors.email.message}</span>
      )}
    </div>
  );
}

function ValidatedForm() {
  return (
    <Form action="/api/subscribe">
      <ValidatedField />
    </Form>
  );
}
```

## Example: Disabled Form with Loading State

```tsx
import { Form } from '@components/common/form/Form';
import { useState } from 'react';

function FormWithLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await someAsyncOperation(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      loading={isLoading}
      submitBtnText="Processing..."
    >
      <input name="field1" />
      <input name="field2" />
    </Form>
  );
}
```

## Default Behavior

### Automatic API Submission

If no `onSubmit` handler is provided, the form automatically:
1. Sends a request to the `action` URL using the specified `method`
2. Includes form data as JSON in the request body
3. Handles the response:
   - If `result.error` exists, calls `onError` or shows error toast
   - Otherwise, calls `onSuccess` or shows success toast

### Response Format

The default handler expects this response format:

```typescript
// Success response
{
  data: { /* your data */ }
}

// Error response
{
  error: {
    message: "Error description"
  }
}
```

## Features

- **Built on React Hook Form**: Full access to React Hook Form features
- **Automatic API Integration**: Default submission handler with fetch API
- **Toast Notifications**: Automatic success/error notifications
- **Loading States**: Disables form during submission
- **Flexible Submit Button**: Show/hide or customize the submit button
- **External Form Control**: Use your own form instance for advanced control
- **TypeScript Support**: Full type safety with generics

## Exported Utilities

The Form component also exports useful utilities from React Hook Form:

```typescript
import { 
  Form,
  useFormContext,  // Access form context in child components
  Controller,      // Controlled input wrapper
  Control,         // Type for form control
  FieldPath,       // Type for field paths
  FieldValues      // Type for field values
} from '@components/common/form/Form';
```

## Notes

- The form automatically prevents default browser validation with `noValidate={true}`
- Form fields are wrapped in a `<fieldset>` that gets disabled during submission or when `loading` is true
- The component uses React Hook Form's `shouldUnregister: true` by default
- Success and error messages are displayed using `react-toastify`
- All form fields must be inside the `<Form>` component to be included in submission
