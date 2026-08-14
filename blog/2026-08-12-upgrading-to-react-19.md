---
slug: upgrading-to-react-19
title: "Upgrading Your Theme And Extensions To React 19"
description: "EverShop 2.2.1 moved from React 17 to React 19. Every breaking change that affects themes and extensions, and the fix for each one."
authors: [evershop]
tags: [upgrade, themes]
---

# Upgrading To React 19

EverShop **2.2.1** upgraded the framework from React 17 to **React 19**.

Because EverShop resolves React through a single hoisted copy (a webpack alias), your theme and your extensions run on the same React as the core. There is no opt-out: once you upgrade EverShop, your components are React 19 components.

{/* truncate */}

:::danger Most of these break silently
None of the changes below produce a build error. Your theme compiles, the server starts, and the damage shows up at runtime as a blank area, an ignored default value, or a hydration mismatch that only appears in production. Read the whole page before upgrading a live store.
:::

## Quick checklist

Search your theme and extension source for each of these:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Search for</th>
      <th>Status</th>
      <th>Fix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>defaultProps</code></td>
      <td>Ignored on function components</td>
      <td>ES default parameters</td>
    </tr>
    <tr>
      <td><code>propTypes</code></td>
      <td>Removed from React</td>
      <td>Delete, or use TypeScript</td>
    </tr>
    <tr>
      <td><code>react-toastify</code></td>
      <td>No longer a dependency</td>
      <td><code>sonner</code>, via the core re-export</td>
    </tr>
    <tr>
      <td><code>ReactDOM.render</code>, <code>ReactDOM.hydrate</code></td>
      <td>Removed</td>
      <td><code>createRoot</code> / <code>hydrateRoot</code></td>
    </tr>
    <tr>
      <td><code>findDOMNode</code></td>
      <td>Removed</td>
      <td>Refs</td>
    </tr>
    <tr>
      <td>String refs (<code>ref="name"</code>)</td>
      <td>Removed</td>
      <td>Callback refs or <code>useRef</code></td>
    </tr>
    <tr>
      <td><code>_(</code> at module scope</td>
      <td>Freezes the translation</td>
      <td>Call it inside the component</td>
    </tr>
    <tr>
      <td><code>useState(window...)</code></td>
      <td>Hydration mismatch</td>
      <td>Read it in <code>useEffect</code></td>
    </tr>
  </tbody>
</table>

## `defaultProps` is ignored on function components

This is the change most likely to break an EverShop theme, because the component system itself used to rely on it.

React 19 ignores `Component.defaultProps` on function components entirely. It does not warn at build time. Your component simply receives `undefined` where it used to receive a default.

```jsx
// Before — silently broken on React 19
function ProductBadge({ label, tone }) {
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
ProductBadge.defaultProps = { tone: 'default' };
```

```jsx
// After
function ProductBadge({ label, tone = 'default' }) {
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
```

### The `Area` case

If you previously passed components into an `Area` by assigning to `Area.defaultProps.components`, that channel no longer works — and because an `Area` with no components renders nothing, the symptom is a **blank page section** rather than an error.

Use the exported helpers instead:

```js
import { setAreaComponents, getAreaComponents } from '@components/common/Area.js';

// The first argument is a ROUTE id, not an area id, and the second is a nested
// areaId -> componentId map:
setAreaComponents('productView', {
  productPageTop: {
    mySection: { id: 'mySection', sortOrder: 10, component: { default: MySection } }
  }
});
```

:::warning `setAreaComponents` replaces, it does not merge
It assigns the whole map for that route, clobbering the one the build already
generated. For a theme or extension that just wants to add to an area, the supported
route is still an `export const layout = { areaId, sortOrder }` in the route folder —
reach for `setAreaComponents` only when you genuinely want to take over a route's map.
:::

## `propTypes` is removed

React 19 removed `propTypes` support. Declarations are ignored; nothing validates and nothing warns. The `prop-types` package is still installed as a dependency of `@evershop/evershop` — 37 legacy `.jsx` files in core still import it — but React no longer reads it, so it has no effect on your components either way.

```jsx
// Before
MyWidget.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number
};
```

Delete them. If you want the safety back, write the component in TypeScript and type its props — which is what core does now.

## Toast notifications: `react-toastify` → `sonner`

`react-toastify` v6 depended on `react-transition-group`, which used the removed `findDOMNode`. It has been replaced by [`sonner`](https://sonner.emilkowal.ski/).

```jsx
// Before
import { toast } from 'react-toastify';
```

```jsx
// After — prefer the core re-export so you always match the mounted Toaster
import { toast } from '@components/common/ui/Sonner.js';

toast.success('Saved');
toast.error('Something went wrong');
```

The `toast.*` call surface is close to drop-in. Two structural differences:

- `<ToastContainer />` becomes `<Toaster />`.
- You almost certainly do not need to mount one at all. Core already renders the `Toaster` on the storefront, so importing `toast` and calling it is enough.

## Rendering APIs

`ReactDOM.render` and `ReactDOM.hydrate` are gone. This only affects you if you wrote custom entry/mount code — normal page and widget components are mounted by EverShop.

```js
// Before
ReactDOM.hydrate(<App />, container);
ReactDOM.render(<App />, container);
```

```js
// After
import { createRoot, hydrateRoot } from 'react-dom/client';

hydrateRoot(container, <App />);      // server-rendered markup
createRoot(container).render(<App />); // client-only
```

Also removed: `findDOMNode`, string refs (`ref="input"`), and legacy context (`contextTypes` / `getChildContext`). Use `useRef`/callback refs and `createContext`.

## SSR traps

EverShop server-renders every storefront page and hydrates it on the client. React 19 is far stricter about the two renders producing identical markup — a mismatch that React 17 patched over now discards the server HTML and re-renders on the client.

### Never call `_()` at module scope

The translation helper resolves against the **active dictionary**, which is per-request on the server and per-page on the client. Calling it at module scope freezes the result at import time, so the server and client can disagree.

```jsx
import { _ } from '@evershop/evershop/lib/locale/translate/_';

// Broken — evaluated once, at import
const SORT_OPTIONS = [
  { value: 'price', label: _('Price') },
  { value: 'name', label: _('Name') }
];

export default function ProductSorting() {
  return <Select options={SORT_OPTIONS} />;
}
```

```jsx
// Correct — evaluated per render, inside the component
export default function ProductSorting() {
  const sortOptions = [
    { value: 'price', label: _('Price') },
    { value: 'name', label: _('Name') }
  ];
  return <Select options={sortOptions} />;
}
```

This applies to any module-scope `const` — arrays, objects, and default parameter values.

### Read client-only state in an effect

`window`, `localStorage` and `document` do not exist during the server render. Reading them in a `useState` initializer makes the first client render differ from the server's.

```jsx
// Broken — server renders '', client renders the real URL
const [current, setCurrent] = useState(window.location.search);
```

```jsx
// Correct
const [current, setCurrent] = useState('');

useEffect(() => {
  setCurrent(window.location.search);
}, []);
```

## Dependency notes

- **`@types/react`** must resolve to **v19**. `@types/react@18` against `react@^19` produces JSX type errors in a theme's `tsc` build.
- **CKEditor** packages (`@ckeditor/ckeditor5-build-classic`, `@ckeditor/ckeditor5-react`) were removed from core. If your extension imported them through EverShop, add them to your own `package.json`.
- **Node.js 20 or newer** is required. EverShop is tested on Node 20 and 22.

## Verifying the upgrade

A clean build proves almost nothing here, so check behaviour:

1. **Open a storefront page and watch the browser console.** Hydration mismatches are logged as errors. Core installs a root error boundary plus `onRecoverableError` reporting, so a mismatch is reported rather than silently swallowed.
2. **Load a page in a non-default language.** Module-scope `_()` calls surface here first.
3. **Look for empty areas.** A section that renders nothing is the signature of a lost `defaultProps` component channel.
4. **Trigger a form submission.** If a toast never appears, an old `react-toastify` import is still in the tree.

## See also

- [Theme Overview](/docs/development/theme/theme-overview) — theme structure and the override seams
- [View System](/docs/development/theme/view-system) — how components compose into pages via Areas
- [Templating](/docs/development/theme/templating) — overriding and extending components

