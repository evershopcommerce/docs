---
sidebar_position: 22
title: ColorField
description: A color picker input field with hex color format support.
hide_table_of_contents: false
keywords:
  - EverShop ColorField
  - color picker
  - hex color
groups:
  - forms
---

# ColorField

## Description

A color picker field that combines a visual color picker with a text input for hex color values. Supports hex color format (#RGB or #RRGGBB) with automatic validation.

## Import

```typescript
import { ColorField } from '@components/common/form/ColorField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { ColorField } from '@components/common/form/ColorField';

function ThemeForm() {
  return (
    <Form action="/api/theme">
      <ColorField
        name="primaryColor"
        label="Primary Color"
        defaultValue="#3b82f6"
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
      <td>defaultValue</td>
      <td>string</td>
      <td>'#000000'</td>
      <td>Default hex color value</td>
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
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the color picker</td>
    </tr>
  </tbody>
</table>

## Example: Theme Customization

```tsx
import { Form } from '@components/common/form/Form';
import { ColorField } from '@components/common/form/ColorField';

function ThemeCustomizer() {
  return (
    <Form action="/api/theme/update">
      <ColorField
        name="primaryColor"
        label="Primary Color"
        defaultValue="#3b82f6"
        helperText="Main brand color"
      />
      
      <ColorField
        name="secondaryColor"
        label="Secondary Color"
        defaultValue="#64748b"
      />
      
      <ColorField
        name="accentColor"
        label="Accent Color"
        defaultValue="#f59e0b"
      />
    </Form>
  );
}
```

## Example: With Validation

```tsx
import { Form } from '@components/common/form/Form';
import { ColorField } from '@components/common/form/ColorField';

function BrandingForm() {
  return (
    <Form action="/api/branding">
      <ColorField
        name="brandColor"
        label="Brand Color"
        required={true}
        validation={{
          required: 'Brand color is required',
          pattern: {
            value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            message: 'Please enter a valid hex color (e.g., #FF5733)'
          }
        }}
        helperText="Your primary brand color in hex format"
      />
    </Form>
  );
}
```

## Example: Product Variant Color

```tsx
import { Form } from '@components/common/form/Form';
import { ColorField } from '@components/common/form/ColorField';
import { InputField } from '@components/common/form/InputField';

function ProductVariantForm() {
  return (
    <Form action="/api/products/variants">
      <InputField
        name="variantName"
        label="Variant Name"
        placeholder="e.g., Navy Blue"
      />
      
      <ColorField
        name="color"
        label="Color"
        defaultValue="#000080"
        helperText="Select the exact color for this variant"
      />
    </Form>
  );
}
```

## Color Format

The field accepts and validates hex color values:
- **3-digit hex**: `#RGB` (e.g., `#f00` for red)
- **6-digit hex**: `#RRGGBB` (e.g., `#ff0000` for red)
- Must start with `#`
- Case-insensitive (A-F or a-f)

## Default Validation

The field includes automatic hex color validation:
```javascript
pattern: {
  value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  message: 'Please enter a valid hex color'
}
```

## Features

- **Dual Input**: Visual color picker + text input for hex value
- **Synchronized Inputs**: Both inputs stay in sync with each other
- **Hex Validation**: Automatic validation for hex color format
- **Default Value**: Falls back to #000000 (black) if no value
- **Visual Feedback**: Shows current color in the picker
- **Tooltip Support**: Helper text displayed in tooltip
- **TypeScript Support**: Full type safety with generics

## Input Structure

The component renders two synchronized inputs:
1. **Color Picker** (`type="color"`): Visual color selector
2. **Text Input**: Displays and allows manual entry of hex value

Changes in either input update the form value.

## Styling

- Color picker uses `color-picker` class
- Text input uses `color-input` class
- Wrapper uses `color-input-group` class
- Integrates with form error states

## Related Components

- [Form](Form.md) - Parent form component
- [InputField](InputField.md) - General text input
