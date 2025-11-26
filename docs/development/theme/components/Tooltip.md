---
sidebar_position: 25
title: Tooltip
description: A tooltip component for displaying helpful information on hover or focus.
hide_table_of_contents: false
keywords:
  - EverShop Tooltip
  - tooltip
  - helper text
groups:
  - forms
---

# Tooltip

## Description

A simple tooltip component that displays helpful information when the user hovers over or focuses on an information icon. Used by form fields to show helper text.

## Import

```typescript
import { Tooltip } from '@components/common/form/Tooltip';
```

## Usage

```tsx
import { Tooltip } from '@components/common/form/Tooltip';

function Example() {
  return (
    <label>
      Field Label
      <Tooltip content="This is helpful information" position="top" />
    </label>
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
      <td>content</td>
      <td>string</td>
      <td>-</td>
      <td>Text to display in the tooltip (required)</td>
    </tr>
    <tr>
      <td>position</td>
      <td>'top' | 'bottom' | 'left' | 'right'</td>
      <td>'top'</td>
      <td>Position of the tooltip relative to the icon</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>''</td>
      <td>Additional CSS classes</td>
    </tr>
  </tbody>
</table>

## Example: Different Positions

```tsx
import { Tooltip } from '@components/common/form/Tooltip';

function PositionDemo() {
  return (
    <div>
      <div>
        <span>Top: </span>
        <Tooltip content="This appears above" position="top" />
      </div>
      
      <div>
        <span>Bottom: </span>
        <Tooltip content="This appears below" position="bottom" />
      </div>
      
      <div>
        <span>Left: </span>
        <Tooltip content="This appears to the left" position="left" />
      </div>
      
      <div>
        <span>Right: </span>
        <Tooltip content="This appears to the right" position="right" />
      </div>
    </div>
  );
}
```

## Example: In Form Field Label

```tsx
import { Tooltip } from '@components/common/form/Tooltip';

function FormLabel() {
  return (
    <label htmlFor="password">
      Password
      <Tooltip 
        content="Password must be at least 8 characters with uppercase, lowercase, and numbers" 
        position="top" 
      />
    </label>
  );
}
```

## Example: Long Content

```tsx
import { Tooltip } from '@components/common/form/Tooltip';

function DetailedTooltip() {
  return (
    <label>
      API Key
      <Tooltip 
        content="Your API key is used to authenticate requests. Keep it secure and never share it publicly. You can regenerate it from your account settings." 
        position="right" 
      />
    </label>
  );
}
```

## Features

- **Hover & Focus**: Shows on mouse hover and keyboard focus
- **Four Positions**: top, bottom, left, right placement
- **Arrow Indicator**: Visual arrow pointing to the icon
- **Responsive Width**: min-width 200px, max-width 300px
- **Smooth Transitions**: Fade and scale animations
- **Accessible**: Keyboard focusable with proper ARIA support
- **Icon Button**: Gray info icon with hover effect

## Behavior

The tooltip:
1. Shows when user hovers over the info icon
2. Shows when user focuses the icon with keyboard (Tab key)
3. Hides when mouse leaves or focus is lost
4. Icon has `tabIndex={-1}` to prevent tab navigation interference
5. Displays with fade-in animation

## Styling

- **Icon**: 16x16px gray info circle icon
- **Tooltip Box**: Dark gray background (#374151)
- **Text**: White text, small size (text-sm)
- **Arrow**: Matching dark gray, positioned based on tooltip position
- **Shadow**: Subtle shadow for depth
- **Z-index**: Set to 50 to appear above other content

## Positioning

The tooltip automatically positions itself relative to the icon:
- **Top**: Above the icon, centered horizontally
- **Bottom**: Below the icon, centered horizontally
- **Left**: Left of the icon, centered vertically
- **Right**: Right of the icon, centered vertically

The arrow always points toward the icon.

## Usage in Form Fields

Most form field components automatically use Tooltip for the `helperText` prop:

```tsx
<InputField
  name="email"
  label="Email"
  helperText="We'll never share your email"
  // Tooltip is rendered automatically
/>
```

## Related Components

All form fields that support helperText use this Tooltip component internally:
- [InputField](InputField.md)
- [TextareaField](TextareaField.md)
- [SelectField](SelectField.md)
- [PasswordField](PasswordField.md)
- And all other field components
