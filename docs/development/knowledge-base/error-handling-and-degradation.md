---
sidebar_position: 66
keywords:
  - error handling
  - graceful degradation
  - error boundary
  - ssr
  - graphql errors
  - hydration
sidebar_label: Error Handling and Degradation
title: Error Handling and Degradation
description: How EverShop 2.2.1 fails — SSR render errors, partial GraphQL results, the root error boundary — and what that means for component and resolver authors.
---

# Error Handling and Degradation

EverShop 2.2.1 changed how the platform behaves when something goes wrong during a page render. The short version, and the part that affects the code you write:

> **A failing GraphQL resolver no longer takes the page down. It hands your component `null` instead.**

That trade is deliberate, and it moves responsibility. Before, a broken resolver produced a 500 and you found out immediately. Now it produces a page with one empty area, and you find out when a customer reports it. Components have to tolerate missing data.

This page covers the four changes and what each one asks of you.

## 1. SSR render failures return 500 instead of hanging

Production rendering imports the route's server bundle and calls into it inside a promise chain (`lib/response/render.ts`):

```ts
import(pathToFileURL(serverIndexPath).toString())
  .then((module) => {
    const source = processPreloadImages(
      module.default(request.currentRoute, assets.js, cssList, safeContextValue, langCode)
    );
    response.send(source);
  })
  .catch((e) => {
    error(e);
    // This render runs inside a floated promise, so a throw here never reaches
    // the calling middleware's try/catch. Without forwarding it, the request
    // hangs until the socket/requestTimeout fires (no status, no body). Hand it
    // to the error handler so the client gets a proper 500 instead.
    if (typeof next === 'function' && !response.headersSent) {
      next(e);
    }
  });
```

The bug this fixes is subtle. `render()` is called from a middleware, but the promise it starts is **floated** — the middleware returns before the promise settles. A throw inside `.then()` therefore lands in a rejected promise nobody is waiting on. The middleware's `try/catch` never sees it, Express never sees it, and the response is never written. The client sits on an open socket until the server's request timeout fires: no status code, no body, nothing in the access log that looks like an error.

The `.catch` handler turns that into `next(e)`, which reaches the standard error handler and produces a real 500 (`response.status(500).send(...)`, or a JSON error envelope on API routes). The `!response.headersSent` guard matters because a throw *after* `response.send()` has begun cannot be turned into a status code.

Note that `render.ts` calls `error(e)` itself before forwarding. The shared error handler only logs when `isDevelopmentMode()` is true or the process was started with `--debug`, so without that explicit call an SSR failure in production would produce a 500 with no log line at all.

**What this means for you:** a component that throws during server-side rendering now produces a 500 you can see in logs and in monitoring, rather than a mysterious timeout. Note that the client-side `ErrorBoundary` (section 4) does **not** apply here — SSR uses `renderToString` with no boundary, so an SSR throw is fatal to the request by design. The boundary is for the hydrated tree.

If you write a middleware that calls `render` directly, pass `next` through as the third argument. Without it the old hanging behaviour returns.

## 2. GraphQL field errors no longer 500 the page

During SSR, the page's GraphQL query runs in `modules/graphql/pages/global/[buildQuery]graphql[response].js`. The 2.2.1 version:

```js
const data = await execute({
  schema,
  contextValue: context,
  document,
  variableValues: graphqlVariables
});
// Render with whatever data resolved instead of aborting the whole
// page on the first field error. A single failing or non-critical
// resolver (e.g. "related products") should degrade that area, not
// turn the entire SSR response into a 500. Field errors are logged;
// partial `data.data` (or {} on total failure) is passed through.
if (data.errors) {
  data.errors.forEach((e) => debug(`GraphQL field error: ${e.message}`));
}
response.locals = response.locals || {};
response.locals.graphqlResponse = data.data
  ? JSON.parse(JSON.stringify(data.data))
  : {};
response.locals.propsMap = propsMap;
next();
```

Three consequences worth being precise about:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Error kind</th>
      <th>Behaviour</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Schema validation errors</strong> (the query does not match the schema)</td>
      <td>Still fatal — <code>next(validationErrors[0])</code>. A malformed query is a bug in your code, not a runtime condition.</td>
    </tr>
    <tr>
      <td><strong>Field/resolver errors</strong> (a resolver throws)</td>
      <td>Logged at <code>debug</code>, then <code>data.data</code> is passed through. The failing field is <code>null</code>; sibling fields keep their values.</td>
    </tr>
    <tr>
      <td><strong>Total execution failure</strong> (<code>data.data</code> is null)</td>
      <td>An empty object <code>&#123;&#125;</code> is passed through. Every component gets empty props and the page still renders.</td>
    </tr>
  </tbody>
</table>

Note the log level: **`debug`, not `error`**. Field errors do not appear in a default production log. If you rely on resolver failures being visible, add your own reporting inside the resolver — do not expect the framework to surface it.

## 3. What this asks of component authors

This is the part with real consequences for extension and theme code.

GraphQL's error semantics are that a throwing resolver nulls its field and bubbles up to the nearest nullable parent. Combined with the change above, that means a component whose data comes from a failing resolver is now **rendered with `null` or missing props** rather than never rendered at all.

Concretely, if `Product.recommendations` throws, this crashes:

```tsx
export default function Recommendations({ product }) {
  return (
    <ul>
      {product.recommendations.map((p) => (
        <li key={p.uuid}>{p.name}</li>
      ))}
    </ul>
  );
}
```

`product.recommendations` is `null`, `.map` is not a function, the component throws during `renderToString`, and by section 1 the whole page becomes a 500 — the exact outcome the degradation change was meant to avoid. One unguarded `.map` cancels the benefit for the entire page.

Write it so the area degrades on its own:

```tsx
export default function Recommendations({ product }) {
  const items = product?.recommendations ?? [];
  if (items.length === 0) {
    return null;
  }
  return (
    <ul>
      {items.map((p) => (
        <li key={p.uuid}>{p.name}</li>
      ))}
    </ul>
  );
}
```

Rules of thumb for any component that consumes query data:

- **Default every collection**, then check length. `?? []` before `.map`, `.filter`, `.length`.
- **Optional-chain through every object hop** that a resolver could null: `data?.cart?.items`, not `data.cart.items`.
- **Return `null` for an empty state** rather than rendering an empty shell — an area that vanishes is better than an area that renders a broken heading.
- **Do not use `??` to guard a value that could be the wrong *type*.** `??` only catches `null` and `undefined`. A field that resolves to a string where you expected an array sails straight through.
- **Prefer a nullable field to a non-null one** in your own schema, unless the page genuinely cannot exist without it. `[Product!]!` means a single throwing element nulls the whole list and bubbles further up than you intended.

The mirror-image rule for **resolver authors**: your resolver failing is now a silent, local event. If a field is genuinely required for the page to make sense, return an explicit empty value and let the component render an error state, rather than throwing and hoping someone notices a `debug` line.

## 4. The client-side asymmetry

The SSR path degrades. The client-side `/graphql` endpoint does **not** — `modules/graphql/services/graphqlMiddleware.js` still aborts on the first error:

```js
const data = await execute({ schema, contextValue, document, variableValues: variables });
if (data.errors) {
  // Create an Error instance with message and stack trace
  next(data.errors[0]);
} else {
  response.status(OK).json({ data: data.data });
}
```

This asymmetry is deliberate, and the reasoning is worth internalising because it tells you which behaviour to copy in your own endpoints:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th></th>
      <th>SSR page query</th>
      <th>Client <code>/graphql</code> endpoint</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Consumer</td>
      <td>A whole page of independent areas</td>
      <td>One caller that asked one question</td>
    </tr>
    <tr>
      <td>Cost of failing hard</td>
      <td>The entire page 500s over a sidebar widget</td>
      <td>One request fails, and the caller can retry or show an error</td>
    </tr>
    <tr>
      <td>Cost of degrading</td>
      <td>One area renders empty — acceptable</td>
      <td>Silent wrong answer: a mutation that half-succeeded returns HTTP 200</td>
    </tr>
    <tr>
      <td>Behaviour</td>
      <td>Partial data, errors logged at <code>debug</code></td>
      <td><code>next(error)</code> → 500 with the message</td>
    </tr>
  </tbody>
</table>

The rule generalises: **degrade when the response aggregates many independent things; fail loudly when it answers one question.**

Practically, urql receives a proper error on the client and your `useQuery` hook's `error` field is populated — so client-fetched data has real error state you can render, while SSR data does not.

## 5. Root error boundary and React root reporting

Two client-side safety nets ship in 2.2.1.

### The boundary

`components/common/react/ErrorBoundary.tsx` wraps the `body` area in both the hydrate and client entry points:

```tsx
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    reportClientError('render', error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-8 text-center text-muted-foreground">
            {_('Something went wrong. Please refresh the page.')}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

It is still a class component because React has no function-component equivalent for error boundaries. A throw in any route or extension component after hydration renders the fallback instead of unmounting the tree and leaving a blank white page.

It accepts a `fallback` prop, so you can wrap a risky subtree of your own with a more specific message:

```tsx
import { ErrorBoundary } from '@components/common/react/ErrorBoundary.js';

<ErrorBoundary fallback={<p>{_('Reviews are temporarily unavailable.')}</p>}>
  <ReviewList productId={product.uuid} />
</ErrorBoundary>;
```

Nesting a boundary around the risky part is strictly better than relying on the root one — the root fallback replaces the entire page body.

Two limits to keep in mind. It is **client-only**: SSR uses `renderToString` with no boundary, so a component that throws during SSR produces a 500 (section 1), not a fallback. And error boundaries do not catch errors in event handlers, `setTimeout` callbacks, or async code — only errors thrown during render, in lifecycle methods, and in constructors.

### Root-level reporting

The generated client entry (`bin/lib/buildEntry.js`) passes both React root callbacks:

```js
hydrateRoot(
  document.getElementById('app'),
  React.createElement(HydrateFrontStore, null),
  {
    onUncaughtError: function (error, info) { reportClientError('uncaught', error, info); },
    onRecoverableError: function (error, info) { reportClientError('recoverable', error, info); }
  }
);
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Callback</th>
      <th>Fires when</th>
      <th>Prefix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>onUncaughtError</code></td>
      <td>A render error reached the root without any boundary catching it</td>
      <td><code>[evershop:uncaught]</code></td>
    </tr>
    <tr>
      <td><code>onRecoverableError</code></td>
      <td>React recovered on its own — overwhelmingly <strong>hydration mismatches</strong></td>
      <td><code>[evershop:recoverable]</code></td>
    </tr>
    <tr>
      <td><code>ErrorBoundary.componentDidCatch</code></td>
      <td>A boundary caught a render error</td>
      <td><code>[evershop:render]</code></td>
    </tr>
  </tbody>
</table>

`onRecoverableError` is the one theme authors should watch. A hydration mismatch means the server HTML and the first client render disagreed — React silently discards the server markup for that subtree and re-renders. The page looks fine; you have just paid for SSR and thrown the result away. The usual causes are `Date.now()` / `Math.random()` / `new Date()` in render, reading `window` or `localStorage` during the first render, and locale- or timezone-dependent formatting that differs between server and browser.

All three funnel through one reporter, `components/common/react/client/reportClientError.ts`:

```ts
export function reportClientError(kind: string, error: unknown, info?: unknown): void {
  console.error(`[evershop:${kind}]`, error, info ?? '');
}
```

It logs to the console rather than the server logger because the winston logger is not in the browser bundle. It is deliberately the **single** place to add remote reporting — point it at Sentry or your own endpoint and all three sources are covered without touching the mount sites. It is re-exported from `@evershop/evershop/components/common` so extension code can call it directly.

## Quick reference

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Failure</th>
      <th>Result</th>
      <th>Where it is logged</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GraphQL query does not validate against the schema</td>
      <td>500</td>
      <td><code>debug</code>, then the error handler</td>
    </tr>
    <tr>
      <td>SSR resolver throws</td>
      <td>Field is <code>null</code>, page renders</td>
      <td><code>debug</code> only</td>
    </tr>
    <tr>
      <td>Component throws during SSR</td>
      <td>500</td>
      <td><code>error</code> (via <code>render.ts</code>)</td>
    </tr>
    <tr>
      <td>Component throws after hydration</td>
      <td>Boundary fallback replaces the subtree</td>
      <td><code>[evershop:render]</code> in the browser console</td>
    </tr>
    <tr>
      <td>Hydration mismatch</td>
      <td>React re-renders client-side; page looks correct</td>
      <td><code>[evershop:recoverable]</code> in the browser console</td>
    </tr>
    <tr>
      <td>Client <code>/graphql</code> resolver throws</td>
      <td>500 with the error message</td>
      <td>The error handler; urql exposes it as <code>error</code></td>
    </tr>
  </tbody>
</table>

## See also

- [GraphQL](./graphql) — schema assembly and the admin/storefront split
- [Data Fetching](./data-fetching) — how page queries are collected from components
- [Pages](./pages) — the middleware chain that ends in `render`
- [Large-Catalog Performance](./large-catalog-performance) — the other 2.2.1 change to how pages fail, when they are slow rather than broken

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
