---
sidebar_position: 20
title: ReactSelectField
description: An enhanced select dropdown using react-select library with search, multi-select, and custom styling.
hide_table_of_contents: false
keywords:
  - EverShop ReactSelectField
  - react-select
  - enhanced select
  - searchable dropdown
groups:
  - forms
---

# ReactSelectField

## Description

An enhanced select field powered by the react-select library. Provides advanced features like searchable dropdown, multi-select, custom styling, and better user experience compared to native select elements.

## Import

```typescript
import { ReactSelectField } from '@components/common/form/ReactSelectField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectField } from '@components/common/form/ReactSelectField';

function ProductForm() {
  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' }
  ];

  return (
    <Form action="/api/products">
      <ReactSelectField
        name="category"
        label="Category"
        options={categoryOptions}
        placeholder="Select a category..."
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
      <td>Array of options (required)</td>
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
      <td>Placeholder text when no option is selected</td>
    </tr>
    <tr>
      <td>isMulti</td>
      <td>boolean</td>
      <td>false</td>
      <td>Enable multiple selection</td>
    </tr>
    <tr>
      <td>isSearchable</td>
      <td>boolean</td>
      <td>true</td>
      <td>Enable search/filter functionality</td>
    </tr>
    <tr>
      <td>isClearable</td>
      <td>boolean</td>
      <td>false</td>
      <td>Show clear button to remove selection</td>
    </tr>
    <tr>
      <td>isDisabled</td>
      <td>boolean</td>
      <td>false</td>
      <td>Disable the select</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>any</td>
      <td>-</td>
      <td>Default selected value(s)</td>
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
      <td>Helper text shown below the select</td>
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
      <td>'form-field'</td>
      <td>CSS class for the wrapper div</td>
    </tr>
  </tbody>
</table>

## SelectOption Interface

```typescript
interface SelectOption {
  value: any;
  label: string;
  [key: string]: any; // Additional custom properties
}
```

## Example: Multi-Select

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectField } from '@components/common/form/ReactSelectField';

function ProductForm() {
  const tagOptions = [
    { value: 'new', label: 'New Arrival' },
    { value: 'sale', label: 'On Sale' },
    { value: 'featured', label: 'Featured' },
    { value: 'trending', label: 'Trending' }
  ];

  return (
    <Form action="/api/products">
      <ReactSelectField
        name="tags"
        label="Product Tags"
        options={tagOptions}
        isMulti={true}
        placeholder="Select tags..."
        defaultValue={['new', 'featured']}
      />
    </Form>
  );
}
```

## Example: Searchable with Clear Button

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectField } from '@components/common/form/ReactSelectField';

function CustomerForm() {
  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' }
  ];

  return (
    <Form action="/api/customers">
      <ReactSelectField
        name="country"
        label="Country"
        options={countryOptions}
        isSearchable={true}
        isClearable={true}
        placeholder="Search and select country..."
        required={true}
      />
    </Form>
  );
}
```

## Example: With Validation

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectField } from '@components/common/form/ReactSelectField';

function OrderForm() {
  const shippingOptions = [
    { value: 'standard', label: 'Standard Shipping (5-7 days)' },
    { value: 'express', label: 'Express Shipping (2-3 days)' },
    { value: 'overnight', label: 'Overnight Shipping (1 day)' }
  ];

  return (
    <Form action="/api/orders">
      <ReactSelectField
        name="shippingMethod"
        label="Shipping Method"
        options={shippingOptions}
        required={true}
        validation={{
          required: 'Please select a shipping method'
        }}
        helperText="Choose your preferred delivery speed"
      />
    </Form>
  );
}
```

## Example: Custom Option Properties

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectField } from '@components/common/form/ReactSelectField';

function ProductForm() {
  const supplierOptions = [
    { 
      value: 'supplier1', 
      label: 'Acme Corp',
      region: 'North America',
      rating: 5
    },
    { 
      value: 'supplier2', 
      label: 'Global Supplies Ltd',
      region: 'Europe',
      rating: 4
    }
  ];

  return (
    <Form action="/api/products">
      <ReactSelectField
        name="supplier"
        label="Supplier"
        options={supplierOptions}
        placeholder="Select supplier..."
      />
    </Form>
  );
}
```

## Dependencies

This component uses **react-select** library for enhanced select functionality. The library is included in EverShop dependencies.

## Features

- **Searchable**: Type to filter options
- **Multi-Select**: Select multiple options at once
- **Clearable**: Option to clear selection
- **Keyboard Navigation**: Full keyboard support
- **Custom Styling**: Tailwind CSS integrated styles
- **Controller Integration**: Uses React Hook Form Controller
- **Value Handling**: Automatically handles single and multi-select values
- **Error Display**: Shows validation errors
- **TypeScript Support**: Full type safety with generics

## Styling

The component includes custom styles:
- Border: Gray border with blue focus ring
- Control height: Auto-adjusted
- Hover effects: Subtle border color change
- Focus state: Blue border with shadow
- Integrates with form error states

## Value Format

- **Single select**: Returns the selected option's value (e.g., `'electronics'`)
- **Multi-select**: Returns array of values (e.g., `['new', 'featured']`)

## Related Components

- [Form](Form.md) - Parent form component
- [ReactSelectCreatableField](ReactSelectCreatableField.md) - Select with create option
- [SelectField](SelectField.md) - Native HTML select
