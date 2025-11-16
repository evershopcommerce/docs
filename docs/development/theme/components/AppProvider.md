---
sidebar_position: 1
title: AppProvider
description: A React context provider that manages global application state.
keywords:
  - EverShop AppProvider
  - app context
  - React context
groups:
  - contexts
---

# AppProvider

## Description

A React context provider that manages global application state. The `AppProvider` wraps the entire application and provides access to the GraphQL response data, configuration, props map, widgets, and page fetching state. It handles client-side navigation and updates the context when navigating through the application.

## Import

```typescript
import { AppProvider } from '@components/common/context/app';
```

## Usage

```tsx
import { AppProvider } from '@components/common/context/app';

function App() {
  const initialData = {
    graphqlResponse: {},
    config: {
      pageMeta: { title: 'My Store' },
      tax: { priceIncludingTax: false },
      catalog: { imageDimensions: { width: 1200, height: 1200 } }
    },
    propsMap: {},
    widgets: [],
    fetching: false
  };

  return (
    <AppProvider value={initialData}>
      <YourAppComponents />
    </AppProvider>
  );
}
```

## Props

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | AppStateContextValue | The initial application state containing GraphQL data, config, props, and widgets |
| children | React.ReactNode | Child components that need access to the app context |


## AppStateContextValue Type

```typescript
interface AppStateContextValue {
  graphqlResponse: {
    [key: string]: any;
  };
  config: Config;
  propsMap: Record<string, any[]>;
  widgets?: any[];
  fetching: boolean;
}

interface Config {
  pageMeta: PageMetaInfo;
  tax: {
    priceIncludingTax: boolean;
  };
  catalog: {
    imageDimensions: { width: number; height: number };
  };
}
```

## Features

### State Management

The provider manages two types of state:
- **Application Data**: GraphQL responses, configuration, props, and widgets
- **Fetching State**: Tracks when page data is being loaded

### Client-Side Navigation

The provider automatically handles browser back/forward navigation:
- Listens to `popstate` events
- Fetches updated page data via AJAX
- Updates context with new data using Immer for immutability

### Context Dispatch Methods

Provides methods to update the application state:
- `setData`: Directly set the entire application state
- `fetchPageData`: Fetch and update data from a URL

## Example: Server-Side Rendering

```tsx
import { AppProvider } from '@components/common/context/app';

export function ServerApp({ contextData }) {
  return (
    <AppProvider value={contextData}>
      <Router>
        <Layout>
          <Routes />
        </Layout>
      </Router>
    </AppProvider>
  );
}
```

## Example: Accessing Context

Use the hooks to access the app context in child components:

```tsx
import { useAppState, useAppDispatch } from '@components/common/context/app';

function MyComponent() {
  const { graphqlResponse, config, fetching } = useAppState();
  const { fetchPageData } = useAppDispatch();

  const loadNewPage = async () => {
    const url = new URL('/new-page', window.location.origin);
    url.searchParams.append('ajax', 'true');
    await fetchPageData(url.toString());
  };

  if (fetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{config.pageMeta.title}</h1>
      <button onClick={loadNewPage}>Load New Page</button>
    </div>
  );
}
```

## Related Hooks

- [useAppState](useAppState.md) - Access the application state
- [useAppDispatch](useAppDispatch.md) - Access methods to update the state

## Notes

- The provider uses Immer's `produce` function to ensure immutable state updates
- When fetching page data, the URL is automatically appended with `ajax=true` parameter
- The entire context is replaced when new data is fetched, not merged
- The `fetching` state is managed separately from the main application data
