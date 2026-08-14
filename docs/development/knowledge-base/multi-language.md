---
sidebar_position: 49
keywords:
  - multi-language
  - i18n
  - locale
  - hreflang
  - language switcher
  - EverShop localization
sidebar_label: Multi-Language Stores
title: Multi-Language Stores
description: How EverShop enables multiple storefront languages, resolves a locale per request, prefixes URLs, and exposes the active locale to themes and resolvers.
---

# Multi-Language Stores

EverShop serves multiple languages from **one running process**. Enabling a language does not change the bundle, so there is no rebuild — the enabled list is read from the database, the dictionaries are already in memory, and every request picks its locale on the way in.

This page covers the *routing and resolution* half of localization: which languages are enabled, how a request gets a locale, how URLs are prefixed, and what a theme can read. For authoring the dictionaries themselves, see [Translation](./translation).

## The enabled-languages model

Three settings describe a store's languages:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Setting key</th>
      <th>Meaning</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>storeLanguage</code></td>
      <td>The storefront's <strong>default</strong> language. Served unprefixed.</td>
      <td>Falls back to <code>shop.language</code> config, then <code>en</code></td>
    </tr>
    <tr>
      <td><code>storeLanguages</code></td>
      <td>The <strong>additional</strong> storefront languages, as a JSON array of locale codes.</td>
      <td><code>[]</code></td>
    </tr>
    <tr>
      <td><code>adminLanguage</code></td>
      <td>The language the admin panel renders in. Independent of the storefront.</td>
      <td><code>en</code></td>
    </tr>
  </tbody>
</table>

The getters live in `modules/setting/services/setting.ts` and are exported from `@evershop/evershop/setting/services`:

```ts
import {
  getStoreLanguage,
  getEnabledLanguages,
  getAdditionalLanguages,
  getAdminLanguage
} from '@evershop/evershop/setting/services';

const defaultLocale = await getStoreLanguage();   // 'en'
const enabled = await getEnabledLanguages();      // ['en', 'de', 'fr']
const additional = await getAdditionalLanguages();// ['de', 'fr']
const adminLocale = await getAdminLanguage();     // 'en'
```

All four are **async** — they read the setting cache, which is DB-backed.

### `getEnabledLanguages()` composition rules

`getEnabledLanguages()` is the single source of truth for "which locales may this store serve". It is the default plus the additional list, run through the pure helper `mergeEnabledLocales(defaultLocale, list)` in `lib/locale/localeResolution.ts`:

- Every code is **trimmed and lower-cased**; empty or non-string entries are dropped.
- The **default locale is always first**, and always present regardless of whether it also appears in `storeLanguages`.
- The result is **deduplicated**.
- A missing, empty, or non-array `storeLanguages` collapses to `[defaultLocale]` — a half-seeded store behaves as single-language rather than erroring.

```ts
mergeEnabledLocales('en', ['DE', 'fr', 'en', '']); // ['en', 'de', 'fr']
mergeEnabledLocales('en', 'not-an-array');         // ['en']
```

`getAdditionalLanguages()` is derived — `getEnabledLanguages()` minus the default — so a legacy `storeLanguages` row that happens to contain the default never produces a duplicate.

:::warning[Shipped caveat in 2.2.1]
The **"Additional languages" control is commented out** in the 2.2.1 admin store-settings screen (`modules/setting/pages/admin/storeSetting/StoreSetting.tsx`). Only `storeLanguage` and `adminLanguage` are editable there.

`storeLanguages` is therefore currently settable **only through the settings API**:

```bash
curl -X POST https://yourstore.com/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-access-token>" \
  -d '{"storeLanguages": ["de", "fr"]}'
```

Everything downstream of the setting — resolution, prefixing, the switcher, `hreflang`, the sitemap — works as documented once the row exists. Do not build merchant instructions around picking languages in the admin UI until the control ships.
:::

Saving the setting logs a **warning** (it does not block) when an additional locale has no `translations/<locale>/` folder — the store will serve that locale with English fallbacks.

## URL shape

The default language is served **unprefixed**; every additional language is served under a `/<locale>` path prefix, with the **same slugs**:

```bash
/                     → default locale, home
/shoes                → default locale
/de                   → German home
/de/shoes             → German, same product/category slug
/admin/products       → admin (never prefixed)
/api/products         → REST API (never prefixed)
```

A first path segment is only treated as a locale prefix when it is an **enabled, non-default** locale. Anything else — including the default locale's own code — falls through to normal route matching, which is what keeps `/en/...` from becoming a duplicate of `/`.

:::info
Because a locale code can shadow a real path, EverShop rejects a `url_key` equal to an enabled locale code (`modules/base/services/assertUrlKeyAvailable.ts`). You cannot create a category with the URL key `de` while German is enabled.
:::

## Locale resolution order

One app-level middleware in `bin/lib/addDefaultMiddlewareFuncs.ts` resolves the locale. It runs **after** the cookie parser and **before** route matching, and it branches on the raw path in this order:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>#</th>
      <th>Path</th>
      <th>Locale comes from</th>
      <th>Context</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><code>/api/admin</code>&hellip;</td>
      <td><code>getAdminLanguage()</code></td>
      <td><code>isAdmin: true</code>, <code>available: [locale]</code></td>
    </tr>
    <tr>
      <td>2</td>
      <td><code>/api</code> and <code>/api/</code>&hellip;</td>
      <td>the <code>X-Locale</code> request header</td>
      <td><code>isAdmin: false</code>, <code>available: getEnabledLanguages()</code></td>
    </tr>
    <tr>
      <td>3</td>
      <td><code>/admin</code> and <code>/admin/</code>&hellip;</td>
      <td><code>getAdminLanguage()</code></td>
      <td><code>isAdmin: true</code>, <code>available: [locale]</code></td>
    </tr>
    <tr>
      <td>4</td>
      <td>everything else (storefront)</td>
      <td>the first path segment</td>
      <td><code>isAdmin: false</code>, <code>available: getEnabledLanguages()</code></td>
    </tr>
  </tbody>
</table>

### Storefront — the path segment

```ts
const { locale, isPrefixed } = pickStorefrontLocale(
  fullPath.split('/')[1],
  enabled,
  defaultLocale
);
```

`pickStorefrontLocale` returns the segment only when it is enabled **and** not the default; otherwise it returns `{ locale: defaultLocale, isPrefixed: false }`.

### REST API — the `X-Locale` header

API routes are RESTful and unprefixed, so the locale travels in a header:

```bash
curl https://yourstore.com/api/products/123 -H "X-Locale: de"
```

`pickApiLocale` honors the header **only when the value is one of the enabled locales**. An unknown, disabled, or arbitrary value silently falls back to the store default — a client cannot request a language you have not enabled.

You rarely set this header by hand from a storefront page. EverShop injects a small same-origin `window.fetch` wrapper (`FETCH_LOCALE_PATCH`) that adds `X-Locale` from `window.eContext.locale` to every same-origin request that does not already carry one, so `fetch()` calls and the GraphQL client inherit the page's locale automatically.

### Admin — `adminLanguage`

Both `/admin/*` and `/api/admin/*` resolve to `getAdminLanguage()` with `isAdmin: true`, which disables all URL prefixing for the request. Admin language is deliberately decoupled from the storefront: a German-facing store can be administered in English.

:::note
Admin REST endpoints declare **bare** paths (`/api/products/:id`, not `/api/admin/products/:id`), so in practice they fall into branch 2 and resolve via `X-Locale`. This is an accepted edge case — those endpoints rarely render translated text, and admin route URLs skip prefixing anyway via `route.isAdmin`.
:::

:::warning
The whole middleware **short-circuits when `NODE_ENV=test`**. Under the test runner `request.locale` and `request.localePath` are undefined and there is no locale scope, so `translate()` falls back to the configured default language. Integration tests that assert on localized output must set the locale explicitly.
:::

## `request.locale` and `request.localePath`

The middleware sets two fields on the request (declared in `@evershop/evershop/types/request`):

```ts
export interface EvershopRequest extends ExpressRequest {
  /** Resolved request locale, set by the locale middleware. */
  locale?: string;
  /** Canonical request path with the locale prefix stripped. */
  localePath?: string;
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Request</th>
      <th><code>originalUrl</code></th>
      <th><code>localePath</code></th>
      <th><code>locale</code></th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>/shoes</code></td><td><code>/shoes</code></td><td><code>/shoes</code></td><td><code>en</code></td></tr>
    <tr><td><code>/de/shoes</code></td><td><code>/de/shoes</code></td><td><code>/shoes</code></td><td><code>de</code></td></tr>
    <tr><td><code>/admin/products</code></td><td><code>/admin/products</code></td><td><code>/admin/products</code></td><td><code>en</code></td></tr>
    <tr><td><code>/api/products</code></td><td><code>/api/products</code></td><td><em>not set</em></td><td>from <code>X-Locale</code></td></tr>
  </tbody>
</table>

**This split is the core of the design.** Route matching and the `url_rewrite` lookup both use the **prefix-stripped** `localePath`, which is why one route definition and one URL rewrite serve every language — you never register `/de/...` variants. Meanwhile `request.originalUrl` is **never mutated**, so it stays prefixed and remains the canonical, SEO-correct URL for head tags and redirects.

Both fields are optional, so consumers fall back defensively:

```ts
const path = request.localePath ?? request.originalUrl.split('?')[0];
```

Use the same pattern in your own middleware. Note that `/api/*` branches set `locale` but **not** `localePath`.

## The locale context (AsyncLocalStorage)

Passing a locale down through services, GraphQL resolvers, and email builders by hand would mean threading an argument through everything. Instead the middleware wraps the rest of the request in an `AsyncLocalStorage` scope, so any code the request transitively calls can read the active locale without receiving it.

```ts
return runWithLocale(
  {
    locale,
    defaultLocale,
    available: enabled,
    dict: getDictionary(locale),
    isAdmin: false
  },
  () => next()
);
```

The accessors are in `@evershop/evershop/lib/locale/localeContext` and are **server-only** — they import `node:async_hooks` and must never reach a client bundle.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Returns</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>runWithLocale(ctx, fn)</code></td>
      <td>Runs <code>fn</code> with <code>ctx</code> visible to all sync and async code it calls.</td>
    </tr>
    <tr>
      <td><code>getLocaleContext()</code></td>
      <td>The full context, or <code>undefined</code> outside any scope.</td>
    </tr>
    <tr>
      <td><code>getActiveLocale()</code></td>
      <td>The active locale code, falling back to the configured store language off-request.</td>
    </tr>
    <tr>
      <td><code>getRequestDictionary()</code></td>
      <td>The full dictionary for the request.</td>
    </tr>
    <tr>
      <td><code>localizeUrl(url)</code></td>
      <td>Applies the request's locale prefix to an already-built URL string.</td>
    </tr>
  </tbody>
</table>

The `LocaleContext` shape:

```ts
interface LocaleContext {
  locale: string;
  defaultLocale: string;
  available: string[];
  dict: Record<string, string>;
  isAdmin: boolean;
}
```

### How `translate()` and resolvers see it

`translate()` reads `getLocaleContext()?.dict` when no explicit locale argument is given — that is the entire mechanism by which a server-side string comes out in the request's language. A GraphQL resolver is inside the same scope, so it can call `getActiveLocale()` or `localizeUrl()` with no plumbing.

Off-request callers — cron jobs, event subscribers, queue workers — run **outside** any scope. There `getLocaleContext()` is `undefined`, `getActiveLocale()` falls back to the configured store language, and `translate()` uses the default dictionary. When an off-request job must produce output in a specific language (an order-confirmation email, say), pass the locale explicitly as `translate()`'s third argument. See [Translation](./translation#translate--server-side).

## Building localized URLs

There is one prefixing primitive, `applyLocalePrefix`, and everything else routes through it. It returns the URL **unchanged** when any of these hold:

- there is no locale context;
- the **target route** is an admin route (`route.isAdmin`);
- the **current request** is an admin request (`ctx.isAdmin`);
- the active locale **is** the default locale;
- the path is `/api` or starts with `/api/`.

Otherwise it prepends `/<locale>`. The site root is normalized to `/<locale>` rather than `/<locale>/`, so the switcher and the route matcher agree on one canonical home path.

### `buildUrl` — for route-based links

```ts
import { buildUrl, buildAbsoluteUrl } from '@evershop/evershop/lib/router';

// Params must match the route's `:placeholders`. `productView` is /product/:uuid,
// so it takes `uuid` — the pretty slug is applied later by `url_rewrite`, never here.
buildUrl('productView', { uuid: product.uuid });
// default locale  → /product/<uuid>
// German request  → /de/product/<uuid>

buildAbsoluteUrl('productView', { uuid: product.uuid });
// → https://yourstore.com/de/product/<uuid>

// Routes that genuinely take a url_key are the CMS and landing pages:
buildUrl('cmsPageView', { url_key: 'about-us' });
// → /page/about-us
```

`buildUrl(routeId, params, query)` builds the path, applies the locale prefix, then appends the query string. It is **isomorphic** — it reads the locale context through the isomorphic accessor, so the same call produces the same URL during SSR and after hydration. `buildAbsoluteUrl(routeId, params)` prepends the store base URL and takes no query argument.

Because `buildUrl` localizes for you, **never hand-build a prefixed path**. Writing `` `/${locale}/cart` `` breaks the moment the locale is the default one.

### `localizeUrl` — for strings you already have

Some URLs are not built from a route — a `url_rewrite` path stored on a product or category, for instance. Those come out of the database canonical and unprefixed, and a GraphQL resolver localizes them explicitly:

```ts
import { localizeUrl } from '@evershop/evershop/lib/locale/localeContext';

url: (product) => localizeUrl(`/${product.url_key}`)
```

`localizeUrl` reads the **request ALS context**, which — unlike `buildUrl`'s isomorphic context — is populated during GraphQL resolution. That is the whole reason both exist. Rule of thumb:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>You have</th>
      <th>Use</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>A route ID and params</td><td><code>buildUrl(routeId, params, query)</code></td></tr>
    <tr><td>An absolute URL from a route ID</td><td><code>buildAbsoluteUrl(routeId, params)</code></td></tr>
    <tr><td>An already-built path, server-side (resolver, controller)</td><td><code>localizeUrl(path)</code></td></tr>
  </tbody>
</table>

## Switching language

`switchLocalePath` is the pure, isomorphic helper behind language switching. It strips the current prefix to get the canonical path, then applies the target's:

```ts
import { switchLocalePath } from '@evershop/evershop/lib/locale/localeResolution';

switchLocalePath('/de/shoes', 'fr', 'en', ['en', 'de', 'fr']); // '/fr/shoes'
switchLocalePath('/de/shoes', 'en', 'en', ['en', 'de', 'fr']); // '/shoes'
switchLocalePath('/', 'de', 'en', ['en', 'de']);               // '/de'
```

`currentPath` is a **pathname only** — no query string. Preserve the query yourself if you need it.

### The `LanguageSwitcher` component

EverShop ships a switcher at `@components/common/LanguageSwitcher`. It takes **no props**, reads everything from the app state, and:

- returns `null` when fewer than two locales are enabled, so single-language stores render no extra markup;
- labels each option with `Intl.DisplayNames` in that language's own script, falling back to the upper-cased code;
- navigates to `switchLocalePath(...) + window.location.search` on change, preserving the query.

The markup is a plain `<select className="language-switcher">`, so a theme can restyle it with CSS alone. Core mounts it in the storefront header via a thin wrapper with `layout = { areaId: 'headerMiddleRight', sortOrder: 1 }`.

To place it somewhere else in your theme, mount the shared component with your own layout:

```tsx title="themes/mytheme/pages/frontStore/all/FooterLanguageSwitcher.tsx"
import LanguageSwitcher from '@components/common/LanguageSwitcher.js';
import React from 'react';

export default function FooterLanguageSwitcher() {
  return <LanguageSwitcher />;
}

export const layout = {
  areaId: 'footerMiddleLeft',
  sortOrder: 50
};
```

To build a custom switcher — links instead of a `<select>`, or flags — read the locale fields from app state and call `switchLocalePath` yourself.

## `hreflang` and `x-default`

`buildHreflangAlternates(currentUrl, defaultLocale, enabled, baseUrl)` produces the alternate set for a page: one absolute URL per enabled locale, **plus** an `x-default` entry pointing at the default-locale (unprefixed) URL. It returns `[]` when fewer than two locales are enabled, so a single-language store emits no `hreflang` markup at all.

The alternates surface as `PageInfo.alternates` in GraphQL and render in the document head:

```html
<link rel="alternate" hrefLang="en" href="https://yourstore.com/shoes" />
<link rel="alternate" hrefLang="de" href="https://yourstore.com/de/shoes" />
<link rel="alternate" hrefLang="x-default" href="https://yourstore.com/shoes" />
```

The same list also drives `og:locale:alternate` meta tags (with `x-default` and the current locale filtered out).

Two details worth knowing:

- **The query string is preserved on every alternate.** A page at `?page=2` produces alternates that also carry `?page=2`. Google discards a `hreflang` cluster whose self-reference disagrees with the page's canonical URL, and the canonical carries the query — so the alternates must too.
- **The set is self-referential.** The current locale appears in its own alternate list, which is what search engines expect.

The [sitemap](./sitemap) emits the *same* alternates from the *same* enabled-languages list, via `expandLocales` and the shared `applyLocalePrefix`. Head tags and sitemap therefore cannot drift, and there is nothing locale-specific to configure in either — enabling a language wires up both. Sitemap `hreflang` output can be turned off with the `sitemap.hreflang` config flag.

## What a theme can read: `eContext`

The render pipeline injects the locale payload into `eContext`, which reaches components through `useAppState()`:

```tsx
import { useAppState } from '@components/common/context/app';

function LocaleBadge() {
  const { locale, defaultLocale, availableLocales } = useAppState();

  if ((availableLocales ?? []).length < 2) {
    return null;
  }

  return <span>{locale === defaultLocale ? 'default' : locale}</span>;
}
```

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
      <td><code>locale</code></td>
      <td><code>string?</code></td>
      <td>The locale this page rendered in.</td>
    </tr>
    <tr>
      <td><code>defaultLocale</code></td>
      <td><code>string?</code></td>
      <td>The store's default locale, which is the one served unprefixed.</td>
    </tr>
    <tr>
      <td><code>availableLocales</code></td>
      <td><code>string[]?</code></td>
      <td>Every enabled locale, default first. Length <code>&lt; 2</code> means a single-language store.</td>
    </tr>
    <tr>
      <td><code>translations</code></td>
      <td><code>Record&lt;string, string&gt;?</code></td>
      <td>The dictionary for this page's locale. Read it through <code>_()</code>, not directly.</td>
    </tr>
  </tbody>
</table>

All four are **optional** — guard with `??` rather than assuming they are present. The same payload is serialized to `window.eContext`, which is where the client-side `_()` helper and the `X-Locale` fetch wrapper read from after hydration.

The rendered `<html>` element also carries `lang` set to the active locale.

## Checklist for extension and theme authors

- **Never hard-code a locale prefix.** Use `buildUrl` for route links and `localizeUrl` for already-built paths.
- **Register one route, not one per language.** Route matching sees the stripped path.
- **Read the canonical path from `request.localePath ?? request.originalUrl.split('?')[0]`** in custom middleware.
- **Use `originalUrl`, not `localePath`, for canonical/SEO output** — it is the prefixed, user-visible URL.
- **Do not import `localeContext` into client code.** It pulls `node:async_hooks` into the bundle. Client components use `_()`; server code uses `translate()`.
- **Pass a locale explicitly off-request** — cron jobs and subscribers have no ambient locale.
- **Gate multi-language UI on `availableLocales.length >= 2`** so single-language stores stay clean.
- **Return canonical, unprefixed paths** from sitemap collectors and similar extension points; the pipeline localizes them.

## See also

- [Translation](./translation) — authoring the CSV dictionaries, `translate()` and `_()`
- [Store Settings](./store-settings) — the setting table behind `storeLanguage`, `storeLanguages`, and `adminLanguage`
- [Sitemap & robots.txt](./sitemap) — multi-language sitemap output and `hreflang` alternates
- [The Routing System](./routing-system) — how routes are declared and matched
- [The Middleware System](./middleware-system) — where the locale middleware sits in the chain

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
