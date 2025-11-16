---
sidebar_position: 21
title: ReactSelectCreatableField
description: An enhanced select field with the ability to create new options on-the-fly.
hide_table_of_contents: false
keywords:
  - EverShop ReactSelectCreatableField
  - creatable select
  - dynamic options
groups:
  - forms
---

# ReactSelectCreatableField

## Description

An enhanced select field that allows users to create new options dynamically. Built on react-select's CreatableSelect component, it combines search, multi-select, and the ability to add custom values not in the initial options list.

## Import

```typescript
import { ReactSelectCreatableField } from '@components/common/form/ReactSelectCreatableField';
```

## Usage

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectCreatableField } from '@components/common/form/ReactSelectCreatableField';

function ProductForm() {
  const tagOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'gadgets', label: 'Gadgets' }
  ];

  return (
    <Form action="/api/products">
      <ReactSelectCreatableField
        name="tags"
        label="Tags"
        options={tagOptions}
        isMulti={true}
        placeholder="Select or create tags..."
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
      <td>Initial array of options (required)</td>
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
      <td>onCreateOption</td>
      <td>(inputValue: string) =&gt; void</td>
      <td>-</td>
      <td>Callback when a new option is created</td>
    </tr>
    <tr>
      <td>formatCreateLabel</td>
      <td>(inputValue: string) =&gt; string</td>
      <td>(val) =&gt; `Create "${val}"`</td>
      <td>Format the "create" option label</td>
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
  [key: string]: any;
}
```

## Example: Multi-Select Tags

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectCreatableField } from '@components/common/form/ReactSelectCreatableField';

function BlogPostForm() {
  const existingTags = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'typescript', label: 'TypeScript' }
  ];

  return (
    <Form action="/api/posts">
      <ReactSelectCreatableField
        name="tags"
        label="Tags"
        options={existingTags}
        isMulti={true}
        placeholder="Select or create tags..."
        helperText="Type to create new tags"
      />
    </Form>
  );
}
```

## Example: With Create Callback

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectCreatableField } from '@components/common/form/ReactSelectCreatableField';

function CategoryForm() {
  const [categories, setCategories] = useState([
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books' }
  ]);

  const handleCreateCategory = (inputValue: string) => {
    console.log('New category created:', inputValue);
    // You can perform additional actions like API calls here
  };

  return (
    <Form action="/api/products">
      <ReactSelectCreatableField
        name="category"
        label="Category"
        options={categories}
        onCreateOption={handleCreateCategory}
        placeholder="Select or create category..."
      />
    </Form>
  );
}
```

## Example: Custom Create Label

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectCreatableField } from '@components/common/form/ReactSelectCreatableField';

function SkillsForm() {
  const skillOptions = [
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'js', label: 'JavaScript' }
  ];

  return (
    <Form action="/api/profile">
      <ReactSelectCreatableField
        name="skills"
        label="Skills"
        options={skillOptions}
        isMulti={true}
        formatCreateLabel={(input) => `Add skill: ${input}`}
        placeholder="Select or add skills..."
      />
    </Form>
  );
}
```

## Example: With Validation

```tsx
import { Form } from '@components/common/form/Form';
import { ReactSelectCreatableField } from '@components/common/form/ReactSelectCreatableField';

function EmailForm() {
  const recipientOptions = [
    { value: 'team@example.com', label: 'Team' },
    { value: 'support@example.com', label: 'Support' }
  ];

  return (
    <Form action="/api/emails">
      <ReactSelectCreatableField
        name="recipients"
        label="Recipients"
        options={recipientOptions}
        isMulti={true}
        required={true}
        validation={{
          required: 'At least one recipient is required',
          validate: (value) => 
            value?.length > 0 || 'Please add at least one recipient'
        }}
        placeholder="Select or add email addresses..."
      />
    </Form>
  );
}
```

## How New Options Are Created

When a user types a value not in the options list and presses Enter:

1. A new option is created with:
   - `value`: lowercase input with non-alphanumeric characters removed
   - `label`: the original input value
2. The new option is added to the dynamic options list
3. The `onCreateOption` callback is called (if provided)
4. For single-select: the new value is set as the field value
5. For multi-select: the new value is added to the array

## Dependencies

This component uses **react-select/creatable** from the react-select library. The library is included in EverShop dependencies.

## Features

- **Dynamic Option Creation**: Users can add new options on-the-fly
- **Searchable**: Type to filter existing options
- **Multi-Select Support**: Select multiple values including created ones
- **Duplicate Prevention**: Prevents creating duplicate options
- **Custom Create Label**: Customize how the "create" prompt appears
- **Create Callback**: Hook into option creation for API calls or logging
- **Value Normalization**: Automatically normalizes created values
- **Controller Integration**: Uses React Hook Form Controller
- **Auto-cleanup**: Unregisters field on unmount

## Value Format

Created option values are normalized:
- Convert to lowercase
- Remove non-alphanumeric characters
- Example: "New Tag!" becomes "newtag" as value, but displays as "New Tag!"

## Styling

Inherits the same styling as ReactSelectField:
- Gray border with blue focus ring
- Custom styles for control and input
- Integrates with form error states

## Related Components

- [Form](Form.md) - Parent form component
- [ReactSelectField](ReactSelectField.md) - Enhanced select without create option
- [SelectField](SelectField.md) - Native HTML select
