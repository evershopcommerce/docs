---
sidebar_position: 26
title: Area
description: A component container that manages and renders components with dynamic props and widget integration.
hide_table_of_contents: false
keywords:
  - EverShop Area
  - component area
  - widget system
groups:
  - components
---

# Area

## Description

The Area component is a powerful container that manages the rendering of multiple components in a specific area of your application. It handles component ordering, dynamic props injection from GraphQL data, and widget integration, making it the core building block of EverShop's flexible layout system.

## Import

```typescript
import { Area } from '@components/common/Area';
```

## Usage

```tsx
import { Area } from '@components/common/Area';

function Layout() {
  return (
    <div>
      <Area id="header" className="header-area" />
      <Area id="content" className="content-area" />
      <Area id="footer" className="footer-area" />
    </div>
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
      <td>id</td>
      <td>string</td>
      <td>-</td>
      <td>Unique identifier for the area (required)</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>-</td>
      <td>CSS class for the wrapper element</td>
    </tr>
    <tr>
      <td>coreComponents</td>
      <td>Component[]</td>
      <td>[]</td>
      <td>Array of core components to render</td>
    </tr>
    <tr>
      <td>components</td>
      <td>Components</td>
      <td>-</td>
      <td>Object mapping area IDs to components</td>
    </tr>
    <tr>
      <td>wrapper</td>
      <td>React.ReactNode | string</td>
      <td>'div'</td>
      <td>Wrapper element or component</td>
    </tr>
    <tr>
      <td>wrapperProps</td>
      <td>Record&lt;string, any&gt;</td>
      <td>{}</td>
      <td>Props to pass to the wrapper element</td>
    </tr>
    <tr>
      <td>noOuter</td>
      <td>boolean</td>
      <td>false</td>
      <td>If true, renders without wrapper element</td>
    </tr>
  </tbody>
</table>

## Component Interface

```typescript
interface Component {
  id?: string;
  sortOrder?: number;
  props?: Record<string, any>;
  component: {
    default: React.ElementType | React.ReactNode;
  };
}
```

## Example: Basic Area

```tsx
import { Area } from '@components/common/Area';

function HomePage() {
  return (
    <div className="page">
      <Area 
        id="hero" 
        className="hero-section"
      />
      <Area 
        id="features" 
        className="features-section"
      />
    </div>
  );
}
```

## Example: With Core Components

```tsx
import { Area } from '@components/common/Area';
import Logo from '@components/common/Logo';
import Navigation from '@components/common/Navigation';

function Header() {
  const coreComponents = [
    {
      id: 'logo',
      sortOrder: 10,
      component: { default: Logo },
      props: { size: 'large' }
    },
    {
      id: 'nav',
      sortOrder: 20,
      component: { default: Navigation }
    }
  ];

  return (
    <Area
      id="header"
      className="site-header"
      coreComponents={coreComponents}
    />
  );
}
```

## Example: Custom Wrapper

```tsx
import { Area } from '@components/common/Area';

function ProductGrid() {
  return (
    <Area
      id="productList"
      wrapper="section"
      wrapperProps={{
        className: 'grid grid-cols-3 gap-4',
        'aria-label': 'Product listing'
      }}
    />
  );
}
```

## Example: No Wrapper

```tsx
import { Area } from '@components/common/Area';

function InlineArea() {
  return (
    <div className="container">
      <h1>Title</h1>
      <Area
        id="inlineContent"
        noOuter={true}
      />
    </div>
  );
}
```

## Adding Components to Area via Layout Export

The most common way to add components to an Area is by using the `layout` constant export in your component files. This allows EverShop to automatically register your component to specific areas.

### Basic Layout Export

```tsx
// MyComponent.tsx
import React from 'react';

export default function MyComponent() {
  return <div>My Component Content</div>;
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
```

## See Also

- [The View System](/docs/development/theme/view-system) - Overview of the view and area system

## Related Components

- [AppProvider](AppProvider.md) - Provides app context and data
- [useAppState](useAppState.md) - Access area data from context
