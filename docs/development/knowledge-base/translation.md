---
sidebar_position: 51
keywords:
  - EverShop Translation
  - Localization
  - Multilingual
  - CSV translation files
  - translate function
sidebar_label: Translation
title: Translating Your EverShop Application
description: Author translations for EverShop as CSV dictionaries loaded at runtime, and look them up with translate() on the server and _() on the client.
---

# Translation

EverShop keeps its user-facing strings in **CSV dictionaries** on disk. Each dictionary maps an English source string to its translation in one locale. The dictionaries are read into memory **at boot**, not at build time — so adding or editing a translation only requires a **server restart**, never a rebuild.

This page covers *authoring* translations: where the files live, their format, and the two lookup helpers. For the other half of the story — how a request picks a locale, how `/de/...` URLs are routed, and how a theme renders a language switcher — see [Multi-Language Stores](./multi-language).

:::info
Earlier versions of EverShop compiled translations into the client bundle, which meant `npm run build` after every change. That is no longer the case. Translations are loaded at runtime by `loadAllLocales()`, called from the `base` module's bootstrap.
:::

## Where translation files live

Translations live in a `translations` directory at the **root of your project** — the same level as `config/`, `themes/`, and `extensions/`:

```bash
/translations
    /de
        general.csv
    /fr
        account.csv
        admin.csv
        blog.csv
        catalog.csv
        checkout.csv
        general.csv
        paypal.csv
        store.csv
```

Each subdirectory is named with the locale code it translates. Locale codes follow ISO 639-1 (two letters), matching the codes you enable as store languages.

:::warning
The translations directory is resolved **once, from the project root**. Extensions and themes cannot ship their own `translations/` folder and have it merged automatically — if your extension needs new strings translated, its consumers add those rows to the project-root dictionaries.
:::

### English is the source language and has no folder

Source strings in the codebase *are* English, so there is deliberately **no `translations/en` folder**. When a locale has no folder, or a key is missing from its dictionary, both lookup helpers return the source string unchanged. That is also why a store running in English does zero dictionary work.

## CSV format

Each file is a two-column CSV with **no header row**:

- **Column 1** — the exact English source string as it appears in the code.
- **Column 2** — the translation.

```csv
Please select, Veuillez sélectionner
Continue shopping, Continuer vos achats
404 Page Not Found, 404 Page non trouvée
```

Standard CSV quoting applies, and you need it whenever a value contains a comma:

```csv
"Your order has been placed, thank you!","Votre commande a été passée, merci !"
```

### Comment rows

A row whose **first cell starts with `#`** is skipped. Use it to section a large file:

```csv
#,Checkout — shipping step
Shipping address, Adresse de livraison
Shipping method, Mode de livraison
```

### Placeholders

Dynamic values use `${name}` placeholders. Keep the placeholder names identical between the source string and the translation — they are substituted by name, not by position, so you are free to reorder them to suit the target language:

```csv
Discount ${discount} For All Orders Over ${price}, Remise de ${discount} pour toutes les commandes de plus de ${price}
```

Substitution is **single-pass**: a value that itself contains `${...}` is not substituted again. A placeholder whose key is absent from the supplied values is left in the output untouched, which makes missing values easy to spot.

## How files merge

Every `*.csv` file inside a locale folder is read and merged into **one flat dictionary** for that locale. Files are merged in **sorted filename order**, and on a duplicate key **the later file wins**.

With the standard file set, that resolution order is:

```bash
account.csv → admin.csv → blog.csv → catalog.csv → checkout.csv → general.csv → paypal.csv → store.csv
```

So a key defined in both `catalog.csv` and `store.csv` resolves to the `store.csv` value. Splitting files by feature is purely organizational — there is one namespace per locale, and filenames only decide precedence. To override a core string in your own store, put it in a file that sorts **after** the file that defines it (for example `zz-overrides.csv`).

## Loading and reloading

`loadAllLocales()` scans every folder under `translations/`, builds each locale's dictionary, and holds it in memory for the process lifetime. It runs from the `base` module's bootstrap, which means it happens **before migrations and before any request is served**, and it needs neither the database nor config.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Import from</th>
      <th>What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>loadAllLocales()</code></td>
      <td><code>@evershop/evershop/lib/locale/dictionary</code></td>
      <td>Builds every locale dictionary from disk. Called at bootstrap.</td>
    </tr>
    <tr>
      <td><code>reloadLocale(locale)</code></td>
      <td><code>@evershop/evershop/lib/locale/dictionary</code></td>
      <td>Rebuilds one locale and hot-swaps it in.</td>
    </tr>
    <tr>
      <td><code>reloadAllLocales()</code></td>
      <td><code>@evershop/evershop/lib/locale/dictionary</code></td>
      <td>Rebuilds every locale.</td>
    </tr>
    <tr>
      <td><code>getDictionary(locale)</code></td>
      <td><code>@evershop/evershop/lib/locale/dictionary</code></td>
      <td>The full in-memory dictionary for a locale; <code>&#123;&#125;</code> when it has no folder.</td>
    </tr>
    <tr>
      <td><code>getAvailableLocales()</code></td>
      <td><code>@evershop/evershop/lib/locale/dictionary</code></td>
      <td>The locale codes that have a dictionary on disk.</td>
    </tr>
  </tbody>
</table>

:::warning
**Edited a CSV file? Restart the server.** Dictionaries are read once at bootstrap and cached in memory — a running process will not notice the change. `npm run build` is *not* required; translations are no longer part of the bundle.

```bash
npm run start
```

:::

### Overriding the dictionary source

`composeLocaleDictionary()` passes each freshly-loaded dictionary through the `localeDictionary` registry value before it is stored. With no processor registered the behaviour is identity. Registering one from your extension's `bootstrap` file lets you layer database-managed or remote translations on top of the disk files without touching any call site:

```ts title="extensions/my-extension/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default async function bootstrap() {
  // A processor receives ONE argument. The context (`{ locale }` here) is bound
  // to `this` via `callback.call(context, value)` — there is no second parameter,
  // and an arrow function cannot see `this`.
  addProcessor(
    'localeDictionary',
    async function (this: { locale: string }, base: Record<string, string>) {
      return {
        ...base,
        ...(await loadOverridesFromDatabase(this.locale))
      };
    },
    10
  );
}
```

See [Registry and Processors](./registry-and-processors) for how processors are ordered and registered.

## Looking up a translation

There are two helpers. Which one you use depends on where the code runs.

### `translate()` — server-side

```ts
function translate(
  enText: string,
  values: Record<string, string> = {},
  locale?: string
): string;
```

```ts title="Server-side translation"
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

const greeting = translate('Hello world!');

const message = translate('Discount ${discount} For All Orders Over ${price}', {
  discount: '10%',
  price: '$50'
});
```

`translate()` resolves its dictionary in this order:

1. **The explicit `locale` argument**, when supplied.
2. **The current request's locale**, read from the async locale context set by the locale middleware.
3. **The default store language**, as the off-request fallback.

The third argument matters for **off-request callers**. Cron jobs, event subscribers, and email builders run outside any request, so there is no ambient locale for them to inherit — pass the locale you want explicitly, usually the recipient's:

```ts title="Translating for a specific recipient, off-request"
import { translate } from '@evershop/evershop/lib/locale/translate/translate';

const subject = translate('Your order ${orderNumber} has shipped', {
  orderNumber: order.order_number
}, customer.locale);
```

`translate()` is **server-only** — it reaches into a Node async-context store. Never import it into a React component that ships to the browser.

### `_()` — client-side and isomorphic

```ts
function _(text: string, values?: Record<string, string>): string;
```

```tsx title="Translating in a React component"
import { _ } from '@evershop/evershop/lib/locale/translate/_';

function Greeting({ name }) {
  return (
    <div>
      <h1>{_('Hello world!')}</h1>
      <p>{_('Welcome back, ${name}!', { name })}</p>
    </div>
  );
}
```

`_()` reads the **active dictionary** — the one the server seeds for the current render during SSR, and `window.eContext.translations` after hydration. It imports nothing server-only, so it is safe in any component. Use it for every user-facing string in a theme.

### Both helpers fall back to the source string

A missing key *and* an empty translation both fall back to the English source. An untranslated store therefore renders correctly rather than showing blank labels — you can ship a partial dictionary and fill it in over time.

## Keep `_()` arguments literal

Translation keys are extracted from source by scanning for `_("…")` / `_('…')` calls with a **static string literal**. A variable or a template literal cannot be extracted:

```tsx
// Extractable
{_('Add to cart')}

// NOT extractable — the key can never be found by tooling
{_(label)}
{_(`Add ${name} to cart`)}
```

Always pass a literal source string and put the dynamic parts in the `values` argument:

```tsx
{_('Add ${name} to cart', { name })}
```

## Locales that ship with EverShop

EverShop ships dictionaries for **17 locales**:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Code</th>
      <th>Language</th>
      <th>Code</th>
      <th>Language</th>
      <th>Code</th>
      <th>Language</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>de</code></td><td>German</td><td><code>hu</code></td><td>Hungarian</td><td><code>pt</code></td><td>Portuguese</td></tr>
    <tr><td><code>el</code></td><td>Greek</td><td><code>it</code></td><td>Italian</td><td><code>ru</code></td><td>Russian</td></tr>
    <tr><td><code>es</code></td><td>Spanish</td><td><code>mn</code></td><td>Mongolian</td><td><code>sr</code></td><td>Serbian</td></tr>
    <tr><td><code>fa</code></td><td>Persian</td><td><code>nb</code></td><td>Norwegian Bokmål</td><td><code>ta</code></td><td>Tamil</td></tr>
    <tr><td><code>fr</code></td><td>French</td><td><code>ne</code></td><td>Nepali</td><td><code>vi</code></td><td>Vietnamese</td></tr>
    <tr><td><code>nl</code></td><td>Dutch</td><td><code>zh</code></td><td>Chinese</td><td></td><td></td></tr>
  </tbody>
</table>

They are a starting point, not a guarantee of completeness — coverage varies by locale, and any key they miss falls back to English. The current files are in the [EverShop repository](https://github.com/evershopcommerce/evershop/tree/main/translations); copy the folder you need into your project's `translations/` directory and extend it.

## Authoring guidance

### Match the source string exactly

Lookup is an exact string match on the English source, including punctuation, capitalization, and trailing characters. `Add to cart` and `Add to Cart` are two different keys. When a string does not appear translated, the cause is almost always a mismatch — copy the source string out of the code rather than retyping it.

### Keep terminology consistent

Use one translation per concept across the whole dictionary. If "Add to cart" is `Ajouter au panier` on the product page, it must be the same on the collection page — otherwise the store reads as if two people wrote it.

### Plurals need distinct source strings

There is no plural-form engine. A language with several plural forms needs the *source* to distinguish them, which means writing distinct English strings and translating each:

```csv
${count} item, ${count} article
${count} items, ${count} articles
```

### Do not translate content through the dictionary

Product names, descriptions, and CMS copy are **content**, not interface strings. The CSV dictionaries are for the fixed strings baked into templates and code. Content that varies per store belongs in the database.

### Test with the target locale actually served

Because the dictionary is chosen per request, the only reliable test is to load the store under the target locale prefix and walk the real pages — checking that strings are translated, that special characters render, and that longer translations do not break layout.

## See also

- [Multi-Language Stores](./multi-language) — enabled languages, locale resolution, URL prefixes, and the language switcher
- [Registry and Processors](./registry-and-processors) — how to register a `localeDictionary` processor
- [Store Settings](./store-settings) — the setting rows that hold your store and admin languages
- [Sitemap & robots.txt](./sitemap) — `hreflang` alternates for multi-language stores

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
