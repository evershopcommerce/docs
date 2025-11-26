---
sidebar_position: 46
title: VariantSelector
description: A component for selecting product variants with availability detection and custom rendering.
keywords:
  - EverShop VariantSelector
  - product variants
  - variant options
groups:
  - components
---

# VariantSelector

## Description

Displays product variant options (size, color, etc.) with automatic availability detection. Updates URL and page data when options are selected. Supports custom rendering for attributes and options.

## Import

```typescript
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector';
```

## Usage

```tsx
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector';
import { ProductProvider } from '@components/frontStore/catalog/ProductContext';
import { FormProvider, useForm } from 'react-hook-form';

function ProductPage({ product }) {
  const methods = useForm();

  return (
    <ProductProvider product={product}>
      <FormProvider {...methods}>
        <VariantSelector />
      </FormProvider>
    </ProductProvider>
  );
}
```

## Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>AttributeRenderer</td>
      <td>React.ComponentType</td>
      <td>No</td>
      <td>Custom attribute group renderer</td>
    </tr>
    <tr>
      <td>OptionRenderer</td>
      <td>React.ComponentType</td>
      <td>No</td>
      <td>Custom option item renderer</td>
    </tr>
  </tbody>
</table>

## Type Definitions

### ProcessedAttribute

```typescript
interface ProcessedAttribute {
  attributeId: number;
  attributeCode: string;
  attributeName: string;
  options: Array<{
    optionId: number;
    optionText: string;
    available: boolean;  // Can be selected with current selections
  }>;
  selected: boolean;
  selectedOption: number | null;
}
```

### Custom Renderer Props

#### AttributeRenderer Props

```typescript
interface VariantAttributeGroupProps {
  attribute: ProcessedAttribute;
  options: Array<AttributeOption & { available: boolean }>;
  onSelect: (attributeCode: string, optionId: number) => Promise<void>;
  OptionItem?: React.ComponentType<VariantOptionItemProps>;
}
```

#### OptionRenderer Props

```typescript
interface VariantOptionItemProps {
  option: AttributeOption & { available: boolean };
  attribute: ProcessedAttribute;
  isSelected: boolean;
  onSelect: (attributeCode: string, optionId: number) => Promise<void>;
}
```

## Examples

### Basic Usage

```tsx
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector';
import { ProductProvider } from '@components/frontStore/catalog/ProductContext';
import { FormProvider, useForm } from 'react-hook-form';

function ProductDetail({ product }) {
  const methods = useForm();

  return (
    <ProductProvider product={product}>
      <FormProvider {...methods}>
        <div className="product-options">
          <VariantSelector />
        </div>
      </FormProvider>
    </ProductProvider>
  );
}
```

### Custom Option Renderer

```tsx
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector';

function CustomOptionItem({ option, isSelected, onSelect, attribute }) {
  return (
    <button
      onClick={() => onSelect(attribute.attributeCode, option.optionId)}
      disabled={!option.available}
      className={`
        option-btn
        ${isSelected ? 'selected' : ''}
        ${!option.available ? 'disabled' : ''}
      `}
    >
      {option.optionText}
      {!option.available && <span className="unavailable-badge">×</span>}
    </button>
  );
}

function ProductVariants() {
  return <VariantSelector OptionRenderer={CustomOptionItem} />;
}
```

### Custom Attribute Renderer

```tsx
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector';

function CustomAttributeGroup({ attribute, options, onSelect, OptionItem }) {
  return (
    <div className="variant-group">
      <h3 className="attribute-name">
        {attribute.attributeName}
        {attribute.selected && <span className="checkmark">✓</span>}
      </h3>
      <div className="options-grid">
        {options.map(option => (
          <OptionItem
            key={option.optionId}
            option={option}
            attribute={attribute}
            isSelected={attribute.selectedOption === option.optionId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function ProductVariants() {
  return <VariantSelector AttributeRenderer={CustomAttributeGroup} />;
}
```

### Color Swatches

```tsx
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector';

function ColorSwatch({ option, isSelected, onSelect, attribute }) {
  // Assuming option has a color hex value
  const colorCode = option.colorCode || '#ccc';

  return (
    <button
      onClick={() => onSelect(attribute.attributeCode, option.optionId)}
      disabled={!option.available}
      className={`
        color-swatch
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${!option.available ? 'opacity-30 cursor-not-allowed' : ''}
      `}
      style={{ backgroundColor: colorCode }}
      title={option.optionText}
    >
      {isSelected && <span className="checkmark">✓</span>}
    </button>
  );
}

function ProductPage() {
  return (
    <VariantSelector
      OptionRenderer={ColorSwatch}
    />
  );
}
```

## Related Components

- [ProductContext](ProductContext.md) - Product data provider
- [AddToCart](AddToCart.md) - Add to cart component
