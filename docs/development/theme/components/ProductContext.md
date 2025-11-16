---
sidebar_position: 40
title: ProductContext
description: Context for accessing product page data including variants, pricing, and inventory.
keywords:
  - EverShop ProductContext
  - product page
  - product data
groups:
  - contexts
---

# ProductContext

## Description

Provides product page data to child components. Used on product detail pages to access product information, variants, pricing, inventory, and attributes.

## Import

```typescript
import { ProductProvider, useProduct } from '@components/frontStore/catalog/ProductContext';
```

## Usage

### Setup Provider

```tsx
import { ProductProvider } from '@components/frontStore/catalog/ProductContext';

function ProductPage({ product }) {
  return (
    <ProductProvider product={product}>
      {/* Product page components */}
    </ProductProvider>
  );
}
```

### Access Product Data

```tsx
import { useProduct } from '@components/frontStore/catalog/ProductContext';

function ProductInfo() {
  const product = useProduct();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price.regular.text}</p>
      {product.inventory.isInStock ? (
        <span>In Stock</span>
      ) : (
        <span>Out of Stock</span>
      )}
    </div>
  );
}
```

## API

### ProductProvider Props

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
      <td>product</td>
      <td>ProductData</td>
      <td>Yes</td>
      <td>Product data object</td>
    </tr>
    <tr>
      <td>children</td>
      <td>ReactNode</td>
      <td>Yes</td>
      <td>Child components</td>
    </tr>
  </tbody>
</table>

### useProduct Hook

Returns the complete `ProductData` object. Throws error if used outside `ProductProvider`.

## ProductData Interface

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>productId</td>
      <td>number</td>
      <td>Product ID</td>
    </tr>
    <tr>
      <td>uuid</td>
      <td>string</td>
      <td>Product UUID</td>
    </tr>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>Product name</td>
    </tr>
    <tr>
      <td>description</td>
      <td>Array&lt;Row&gt;</td>
      <td>Rich text description</td>
    </tr>
    <tr>
      <td>sku</td>
      <td>string</td>
      <td>Product SKU</td>
    </tr>
    <tr>
      <td>price</td>
      <td>ProductPriceData</td>
      <td>Regular and special pricing</td>
    </tr>
    <tr>
      <td>inventory</td>
      <td>object</td>
      <td>Stock status</td>
    </tr>
    <tr>
      <td>weight</td>
      <td>object</td>
      <td>Weight value and unit</td>
    </tr>
    <tr>
      <td>url</td>
      <td>string</td>
      <td>Product URL</td>
    </tr>
    <tr>
      <td>image</td>
      <td>ImageData</td>
      <td>Main product image</td>
    </tr>
    <tr>
      <td>gallery</td>
      <td>ImageData[]</td>
      <td>Product gallery images</td>
    </tr>
    <tr>
      <td>attributes</td>
      <td>AttributeIndexItem[]</td>
      <td>Product attributes</td>
    </tr>
    <tr>
      <td>variantGroup</td>
      <td>VariantGroup</td>
      <td>Product variants data</td>
    </tr>
  </tbody>
</table>

## Type Definitions

### ProductPriceData

```typescript
interface ProductPriceData {
  regular: {
    value: number;    // Price value
    text: string;     // Formatted price
  };
  special?: {
    value: number;    // Sale price value
    text: string;     // Formatted sale price
  };
}
```

### VariantGroup

```typescript
interface VariantGroup {
  variantAttributes: Array<{
    attributeId: number;
    attributeCode: string;
    attributeName: string;
    options: Array<{
      optionId: number;
      optionText: string;
      productId?: number;
    }>;
  }>;
  items: Array<{
    attributes: Array<{
      attributeCode: string;
      optionId: number;
    }>;
    product?: {
      productId: number;
      name: string;
      sku: string;
      url: string;
      price: ProductPriceData;
      image?: ImageData;
    };
  }>;
}
```

## Examples

### Product Header

```tsx
import { useProduct } from '@components/frontStore/catalog/ProductContext';
import { Image } from '@components/common/Image';

function ProductHeader() {
  const { name, sku, price, image } = useProduct();

  return (
    <div className="product-header">
      {image && <Image src={image.url} alt={image.alt || name} width={600} height={600} />}
      <div>
        <h1>{name}</h1>
        <p className="sku">SKU: {sku}</p>
        <div className="price">
          {price.special ? (
            <>
              <span className="special-price">{price.special.text}</span>
              <span className="regular-price line-through">{price.regular.text}</span>
            </>
          ) : (
            <span className="regular-price">{price.regular.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Stock Status

```tsx
import { useProduct } from '@components/frontStore/catalog/ProductContext';

function StockStatus() {
  const { inventory } = useProduct();

  return (
    <div className="stock-status">
      {inventory.isInStock ? (
        <span className="in-stock">✓ In Stock</span>
      ) : (
        <span className="out-of-stock">Out of Stock</span>
      )}
    </div>
  );
}
```

### Product Gallery

```tsx
import { useProduct } from '@components/frontStore/catalog/ProductContext';
import { Image } from '@components/common/Image';

function ProductGallery() {
  const { gallery } = useProduct();

  if (!gallery || gallery.length === 0) {
    return null;
  }

  return (
    <div className="product-gallery">
      {gallery.map((image, index) => (
        <Image 
          key={index}
          src={image.url}
          alt={image.alt || `Gallery image ${index + 1}`}
          width={100}
          height={100}
        />
      ))}
    </div>
  );
}
```

### Product Attributes

```tsx
import { useProduct } from '@components/frontStore/catalog/ProductContext';

function ProductAttributes() {
  const { attributes } = useProduct();

  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="product-attributes">
      <h3>Specifications</h3>
      <dl>
        {attributes.map((attr, index) => (
          <div key={index}>
            <dt>{attr.attributeName}</dt>
            <dd>{attr.optionText}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

### Variant Selector

```tsx
import { useProduct } from '@components/frontStore/catalog/ProductContext';
import { useState } from 'react';

function VariantSelector() {
  const { variantGroup } = useProduct();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  if (!variantGroup) {
    return null;
  }

  const handleOptionChange = (attributeCode: string, optionId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attributeCode]: optionId
    }));
  };

  return (
    <div className="variant-selector">
      {variantGroup.variantAttributes.map(attribute => (
        <div key={attribute.attributeCode} className="variant-attribute">
          <label>{attribute.attributeName}</label>
          <div className="options">
            {attribute.options.map(option => (
              <button
                key={option.optionId}
                onClick={() => handleOptionChange(attribute.attributeCode, option.optionId)}
                className={selectedOptions[attribute.attributeCode] === option.optionId ? 'active' : ''}
              >
                {option.optionText}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Complete Product Page

```tsx
import { ProductProvider, useProduct } from '@components/frontStore/catalog/ProductContext';
import { Image } from '@components/common/Image';
import { AddToCart } from '@components/frontStore/cart/AddToCart';

function ProductPageContent() {
  const product = useProduct();
  const { name, sku, description, price, inventory, image, gallery, attributes, weight } = product;

  return (
    <div className="product-page">
      <div className="product-main">
        {/* Gallery */}
        <div className="product-gallery">
          {image && (
            <Image src={image.url} alt={image.alt || name} width={600} height={600} />
          )}
          {gallery && gallery.length > 0 && (
            <div className="thumbnails">
              {gallery.map((img, i) => (
                <Image key={i} src={img.url} alt={img.alt} width={100} height={100} />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1>{name}</h1>
          <p className="sku">SKU: {sku}</p>

          {/* Price */}
          <div className="price">
            {price.special ? (
              <>
                <span className="special">{price.special.text}</span>
                <span className="regular line-through">{price.regular.text}</span>
              </>
            ) : (
              <span className="regular">{price.regular.text}</span>
            )}
          </div>

          {/* Stock */}
          <div className="stock">
            {inventory.isInStock ? '✓ In Stock' : 'Out of Stock'}
          </div>

          {/* Add to Cart */}
          <AddToCart 
            product={{ sku, isInStock: inventory.isInStock }}
            qty={1}
          >
            {({ addToCart, isLoading, canAddToCart }) => (
              <button 
                onClick={addToCart}
                disabled={!canAddToCart || isLoading}
              >
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </AddToCart>

          {/* Description */}
          {description && (
            <div className="description">
              <h2>Description</h2>
              <div>{description}</div>
            </div>
          )}

          {/* Attributes */}
          {attributes && attributes.length > 0 && (
            <div className="attributes">
              <h2>Specifications</h2>
              <dl>
                {attributes.map((attr, i) => (
                  <div key={i}>
                    <dt>{attr.attributeName}</dt>
                    <dd>{attr.optionText}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Weight */}
          {weight && (
            <p className="weight">
              Weight: {weight.value} {weight.unit}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ productData }) {
  return (
    <ProductProvider product={productData}>
      <ProductPageContent />
    </ProductProvider>
  );
}
```

## Features

- **Product Metadata**: Name, SKU, description, URL
- **Pricing**: Regular and special (sale) prices
- **Inventory**: Stock availability status
- **Images**: Main image and gallery support
- **Attributes**: Product specifications
- **Variants**: Multi-attribute product variants
- **Weight**: Product weight with unit
- **Extended Fields**: Support for custom fields
- **Type Safe**: Full TypeScript support
- **Error Handling**: Throws error if used outside provider

## Usage Notes

- Only available on product detail pages
- Must wrap components in `ProductProvider`
- The `useProduct` hook throws error if used outside provider
- Description is rich text (array of Row objects)
- Price.special is optional (only present for sale items)
- Gallery and attributes are optional arrays
- Extended fields allow custom product data

## Related Components

- [AddToCart](AddToCart.md) - Add to cart component
- [CategoryContext](CategoryContext.md) - Category page context
- [Image](Image.md) - Image component
