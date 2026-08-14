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
      <Area id="headerTop" className="header__top" isGlobal editableInPageBuilder />
      <Area id="content" className="page-width min-h-36" wrapper="main" editableInPageBuilder />
      <Area id="footerTop" className="footer__top" isGlobal editableInPageBuilder />
    </div>
  );
}
```

:::info
`headerTop`, `content` and `footerTop` are real storefront Area IDs. The header and footer Areas are declared in the shared `Header` / `Footer` components; `content` is declared by the storefront master component `modules/base/pages/frontStore/all/Base.tsx`. See [Templating](/docs/development/theme/templating) for the full picture.
:::

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
    <tr>
      <td>isGlobal</td>
      <td>boolean</td>
      <td>false</td>
      <td>Marks an area that appears on every page (header, footer). Informational: the page builder uses it to surface "this area appears on every page" warnings, and to outline the area when the editor's <em>Globals view</em> is on. When set, the wrapper gets a <code>data-evershop-global="true"</code> attribute.</td>
    </tr>
    <tr>
      <td>editableInPageBuilder</td>
      <td>boolean</td>
      <td>false</td>
      <td>Opts the area into page-builder editing. When false (the default) the page builder does not expose the area as a drop target, even though it still renders in the SSR'd preview — this is what protects layout-only and system-message areas from accidental edits. When set, the wrapper gets <code>data-evershop-editable-area="true"</code> and drop zones are emitted inside the page-builder iframe.</td>
    </tr>
  </tbody>
</table>

:::info
`isGlobal` and `editableInPageBuilder` have no effect on the production storefront beyond the two data attributes — the drop zones and outlines they enable render only inside the page-builder iframe.
:::

## Component Interface

```typescript
interface Component {
  id?: string;
  sortOrder?: number;
  props?: Record<string, any>;
  component: {
    default: React.ElementType | React.ReactNode;
  };
  /**
   * Page-builder metadata. Set only when the entry is a widget instance —
   * the iframe chrome uses it to identify the widget for selection, delete
   * and inline edit. Undefined for regular layout components.
   */
  _widgetMeta?: {
    uuid: string;
    type: string;
    settings: Record<string, unknown>;
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

`coreComponents` are components the Area always renders, declared inline rather than registered through a `layout` export. They are merged with the registered components and widgets, then sorted by `sortOrder`.

```tsx
import { Area } from '@components/common/Area';
import { MiniCart } from '@components/frontStore/cart/MiniCart';
import { SearchBox } from '@components/frontStore/catalog/SearchBox';

function HeaderRight() {
  const coreComponents = [
    {
      id: 'search',
      sortOrder: 10,
      component: { default: SearchBox }
    },
    {
      id: 'miniCart',
      sortOrder: 20,
      component: { default: MiniCart }
    }
  ];

  return (
    <Area
      id="headerMiddleRight"
      className="header__middle__right ml-auto flex items-center gap-1"
      isGlobal
      editableInPageBuilder
      coreComponents={coreComponents}
    />
  );
}
```

`component.default` also accepts an already-created element, which is how core's `Footer` renders its static payment-icon row:

```tsx
<Area
  id="footerBottom"
  className="footer__bottom"
  isGlobal
  editableInPageBuilder
  coreComponents={[
    {
      component: { default: <div className="page-width">© 2026</div> },
      sortOrder: 10
    }
  ]}
/>
```

:::warning There is no `@components/common/Logo` or `@components/common/Navigation`
The storefront logo is a **page** component at `modules/base/pages/frontStore/all/Logo.tsx` (it targets `areaId: 'headerMiddleCenter'` through its own `layout` export and pulls the admin-uploaded logo via a `query` export), not a shared component under `@components`. There is no `Navigation` shared component at all — the header is composed from Areas.

To replace the logo in a theme, override the page component at `themes/<theme>/src/pages/all/Logo.tsx`.
:::

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

## The Component Registry: `setAreaComponents` / `getAreaComponents`

`Area` does not receive its component map through props in normal operation. The build step generates a **route-keyed registry** and `Area` looks up the current request's route from app state.

```ts
import {
  setAreaComponents,
  getAreaComponents
} from '@components/common/Area.js';

// Register every component for a route (generated by the build entry).
setAreaComponents('productView', components);

// Read a route's map back.
const components = getAreaComponents('productView');
```

These two functions replaced the old `Area.defaultProps.components` channel. React 19 **ignores `defaultProps` on function components**, so any code still assigning to it hands `Area` nothing — and an Area with no components renders nothing, which shows up as a blank page section rather than an error.

An explicit `components` prop is still honoured if one is passed directly, which is why the prop remains in the table above. It is not the path core uses.

:::warning Upgrading a theme
If your theme or extension wrote to `Area.defaultProps.components`, switch it to `setAreaComponents`. See [Upgrading To React 19](/blog/upgrading-to-react-19) for the full list of changes that break silently.
:::

## See Also

- [The View System](/docs/development/theme/view-system) - Overview of the view and area system
- [Upgrading To React 19](/blog/upgrading-to-react-19) - `defaultProps`, the component registry, and other silent breaks

## Related Components

- [AppProvider](AppProvider.md) - Provides app context and data
- [useAppState](useAppState.md) - Access area data from context
