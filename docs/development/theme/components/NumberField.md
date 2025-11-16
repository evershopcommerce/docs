---
sidebar_position: 11
title: NumberField
description: A numeric input field with min/max validation and optional unit display.
hide_table_of_contents: false
keywords:
  - EverShop NumberField
  - number input
  - numeric field
groups:
  - forms
---

# NumberField

## Description

A numeric input field component with support for min/max validation, decimal numbers, and unit display. Automatically converts values to numbers and integrates with React Hook Form.

## Import

```typescript
import { NumberField } from '@components/common/form/NumberField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { NumberField } from '@components/common/form/NumberField';

function ProductForm() {
  return (
    <Form action="/api/products">
      <NumberField
        name="price"
        label="Price"
        min={0}
        unit="$"
        unitPosition="left"
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
      <td>string</td>
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
      <td>number</td>
      <td>-</td>
      <td>Minimum allowed value</td>
    </tr>
    <tr>
      <td>max</td>
      <td>number</td>
      <td>-</td>
      <td>Maximum allowed value</td>
    </tr>
    <tr>
      <td>step</td>
      <td>number</td>
      <td>-</td>
      <td>Increment/decrement step value</td>
    </tr>
    <tr>
      <td>allowDecimals</td>
      <td>boolean</td>
      <td>true</td>
      <td>Whether to allow decimal numbers</td>
    </tr>
    <tr>
      <td>unit</td>
      <td>string</td>
      <td>-</td>
      <td>Unit label to display (e.g., '$', 'kg', '%')</td>
    </tr>
    <tr>
      <td>unitPosition</td>
      <td>'left' | 'right'</td>
      <td>'right'</td>
      <td>Position of the unit label</td>
    </tr>
    <tr>
      <td>required</td>
      <td>boolean</td>
      <td>false</td>
      <td>Makes the field required</td>
    </tr>
    <tr>
      <td>defaultValue</td>
      <td>number</td>
      <td>-</td>
      <td>Default numeric value</td>
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
      <td>RegisterOptions</td>
      <td>-</td>
      <td>React Hook Form validation rules</td>
    </tr>
    <tr>
      <td>onChange</td>
      <td>(value: number | null) =&gt; void</td>
      <td>-</td>
      <td>Callback fired when the value changes</td>
    </tr>
    <tr>
      <td>prefixIcon</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Icon displayed on the left inside the input</td>
    </tr>
    <tr>
      <td>suffixIcon</td>
      <td>React.ReactNode</td>
      <td>-</td>
      <td>Icon displayed on the right inside the input</td>
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

## Example: Price Field

```tsx
import { Form } from '@components/common/form/Form';
import { NumberField } from '@components/common/form/NumberField';

function PriceForm() {
  return (
    <Form action="/api/pricing">
      <NumberField
        name="price"
        label="Product Price"
        min={0}
        step={0.01}
        unit="$"
        unitPosition="left"
        required
        helperText="Enter the product price in USD"
      />
    </Form>
  );
}
```

## Example: Quantity Field

```tsx
import { Form } from '@components/common/form/Form';
import { NumberField } from '@components/common/form/NumberField';

function InventoryForm() {
  return (
    <Form action="/api/inventory">
      <NumberField
        name="quantity"
        label="Stock Quantity"
        min={0}
        max={10000}
        allowDecimals={false}
        required
        validation={{
          validate: (value) =>
            value > 0 || 'Quantity must be greater than zero'
        }}
      />
    </Form>
  );
}
```

## Example: Percentage Field

```tsx
import { Form } from '@components/common/form/Form';
import { NumberField } from '@components/common/form/NumberField';

function DiscountForm() {
  return (
    <Form action="/api/discount">
      <NumberField
        name="discount"
        label="Discount"
        min={0}
        max={100}
        step={5}
        unit="%"
        unitPosition="right"
        defaultValue={10}
      />
    </Form>
  );
}
```

## Example: Weight Field

```tsx
import { Form } from '@components/common/form/Form';
import { NumberField } from '@components/common/form/NumberField';

function ShippingForm() {
  return (
    <Form action="/api/shipping">
      <NumberField
        name="weight"
        label="Package Weight"
        min={0.1}
        step={0.1}
        unit="kg"
        unitPosition="right"
        required
      />
    </Form>
  );
}
```

## Features

- **Automatic Number Conversion**: Values are converted to numbers automatically
- **Min/Max Validation**: Built-in validation for value ranges
- **Decimal Support**: Control whether decimal numbers are allowed
- **Unit Display**: Show currency, measurement, or percentage units
- **Null Handling**: Returns null for empty values instead of NaN
- **Icon Support**: Add prefix or suffix icons

## Value Handling

- Empty values are converted to `null`
- Invalid inputs return `null`
- If `allowDecimals` is false, uses `parseInt()`
- If `allowDecimals` is true, uses `parseFloat()`

## Related Components

- [Form](Form.md) - Parent form component
- [RangeField](RangeField.md) - Slider input for numbers
- [InputField](InputField.md) - General text input
