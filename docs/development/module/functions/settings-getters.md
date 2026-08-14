---
sidebar_position: 136
since: 2.2.1
keywords:
- getSetting
- getSettingSync
- refreshSetting
- getStoreCurrency
- getStoreTimezone
- getWeightUnit
- getDimensionUnit
- getStoreLanguage
- getEnabledLanguages
- getAllowGuestCheckout
- getPricePrecision
- getCollectionPageSize
- store settings
groups:
- settings
sidebar_label: Settings Getters
title: Store Settings Getters
description: Read merchant-configured store settings, synchronously or asynchronously.
---

# Store Settings Getters

Store-wide values a merchant can change from the admin panel — currency, units, address, rounding, catalog behaviour — live in the `setting` table, not in `config/`. These getters read them.

Every getter follows the same three-step resolution: **admin setting → config fallback → hard default**. That is why an upgraded store behaves exactly as it did before the merchant ever opens the settings page.

## The sync / async split

This is the distinction that matters most on this page.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th></th>
      <th>Synchronous getters</th>
      <th>Asynchronous getters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Reads</strong></td>
      <td>An in-memory cache only. Never touches the database.</td>
      <td>The same cache — but populates it from the database on the first call.</td>
    </tr>
    <tr>
      <td><strong>Cold cache</strong></td>
      <td>Returns the config fallback / hard default.</td>
      <td><code>SELECT * FROM setting</code>, then answers.</td>
    </tr>
    <tr>
      <td><strong>Safe in</strong></td>
      <td>Hot and genuinely synchronous paths — the pricing formatter, cart build, Handlebars email helpers, AJV schema builders, the SSR context builder, pagination filters.</td>
      <td>Everything else. Prefer these when you can <code>await</code>.</td>
    </tr>
  </tbody>
</table>

The cache is warmed at boot by `modules/setting/bootstrap.ts` (in every process that loads module bootstraps — HTTP, cron, subscriber) and refreshed whenever a setting is saved. A warm-up failure is non-fatal: on a brand-new database the `setting` table does not exist yet, and the async path lazy-loads later.

:::warning A synchronous getter on a cold cache returns the fallback, not the stored value
`getSettingSync` has no way to wait. Before boot warm-up completes — in a unit test with no database, for instance — it returns `defaultValue`. That is the deliberate trade that makes it safe inside `toPrice`. If you need the stored value guaranteed, use the async getter.
:::

Values coming back from the `setting` table are TEXT (`"true"`, `"20"`, `"ceil"`), while a config fallback is already a real boolean or number. The typed getters below coerce both shapes, so you never have to compare against a stray string. Raw `getSetting` / `getSettingSync` do not coerce — they only `JSON.parse` rows stored as JSON.

---

## Core setting functions

```ts
import {
  getSetting,
  getSettingSync,
  refreshSetting
} from '@evershop/evershop/setting/services';
```

### getSetting

```ts
getSetting<T>(name: string, defaultValue: T): Promise<T>
```

Read one setting by name. Loads the whole `setting` table into the cache on the first call, then serves from memory. Rows persisted as JSON (objects and arrays, such as `storeLanguages`) are parsed back; malformed JSON falls back to `defaultValue`.

### getSettingSync

```ts
getSettingSync<T>(name: string, defaultValue: T): T
```

The synchronous companion. Reads the already-loaded cache and never touches the database. Returns `defaultValue` when the cache is cold or the row is absent.

### refreshSetting

```ts
refreshSetting(): Promise<void>
```

Reload the cache from the database. Call it after writing settings outside the admin save path.

```ts
import { getSetting, getSettingSync, refreshSetting } from '@evershop/evershop/setting/services';

const banner = await getSetting<string | null>('promoBanner', null);

// Inside a synchronous formatter:
const currencySymbolStyle = getSettingSync<string>('currencyDisplay', 'symbol');

await refreshSetting();
```

---

## Store identity and address

```ts
import {
  getStoreName,
  getStoreDescription,
  getStoreEmail,
  getStorePhoneNumber,
  getStoreCountry,
  getStoreProvince,
  getStoreCity,
  getStoreAddress,
  getStorePostalCode
} from '@evershop/evershop/setting/services';
```

All **asynchronous**.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Returns</th>
      <th>Setting name</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getStoreName(defaultValue?)</code></td>
      <td><code>Promise&lt;string&gt;</code></td>
      <td><code>storeName</code></td>
      <td><code>'Evershop'</code>, overridable via the argument</td>
    </tr>
    <tr>
      <td><code>getStoreDescription()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storeDescription</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStoreEmail()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storeEmail</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStorePhoneNumber()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storePhoneNumber</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStoreCountry()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storeCountry</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStoreProvince()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storeProvince</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStoreCity()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storeCity</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStoreAddress()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storeAddress</code></td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td><code>getStorePostalCode()</code></td>
      <td><code>Promise&lt;string | null&gt;</code></td>
      <td><code>storePostalCode</code></td>
      <td><code>null</code></td>
    </tr>
  </tbody>
</table>

These five address getters are exactly what `getOriginAddress()` composes into the shipping origin.

---

## Currency, units and timezone

```ts
import {
  getStoreCurrency,
  getStoreTimezone,
  getWeightUnit,
  getDimensionUnit
} from '@evershop/evershop/setting/services';
```

All **synchronous** and cache-only, because they are read inside the pricing formatter, cart build and email helpers.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Returns</th>
      <th>Setting → config fallback → default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getStoreCurrency()</code></td>
      <td><code>string</code></td>
      <td><code>storeCurrency</code> → <code>shop.currency</code> → <code>'USD'</code></td>
    </tr>
    <tr>
      <td><code>getStoreTimezone()</code></td>
      <td><code>string</code></td>
      <td><code>storeTimeZone</code> → <code>shop.timezone</code> → <code>'UTC'</code></td>
    </tr>
    <tr>
      <td><code>getWeightUnit()</code></td>
      <td><code>string</code></td>
      <td><code>weightUnit</code> → <code>shop.weightUnit</code> → <code>'kg'</code></td>
    </tr>
    <tr>
      <td><code>getDimensionUnit()</code></td>
      <td><code>string</code></td>
      <td><code>dimensionUnit</code> → <code>shop.dimensionUnit</code> → <code>'cm'</code></td>
    </tr>
  </tbody>
</table>

:::warning `shop.currency`, `shop.weightUnit` and `shop.dimensionUnit` are gone from `getConfig`
They were removed from the typed configuration surface — they are admin settings now. The getters above still read them untyped as a backward-compatible fallback, but `getConfig('shop.currency')` no longer typechecks.
:::

Two further notes:

- `getStoreTimezone()` is the **display** timezone (it drives the `DateTime` GraphQL type). It is *not* the database session timezone, which stays on `shop.timezone` in config and is applied by the pool at connection time.
- Changing a weight or dimension unit **relabels** stored values; it does not convert them. Product and package measurements are unit-less numbers.

---

## Languages

```ts
import {
  getStoreLanguage,
  getEnabledLanguages,
  getAdditionalLanguages,
  getAdminLanguage
} from '@evershop/evershop/setting/services';
```

All **asynchronous**.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Returns</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getStoreLanguage()</code></td>
      <td><code>Promise&lt;string&gt;</code></td>
      <td>The default storefront locale. <code>storeLanguage</code> (normalised) → config <code>shop.language</code> → <code>'en'</code>.</td>
    </tr>
    <tr>
      <td><code>getEnabledLanguages()</code></td>
      <td><code>Promise&lt;string[]&gt;</code></td>
      <td>The deduped union of the default and the configured <code>storeLanguages</code> list, <strong>default first</strong>. The default is always enabled; a default that also appears in the additional list is simply deduped.</td>
    </tr>
    <tr>
      <td><code>getAdditionalLanguages()</code></td>
      <td><code>Promise&lt;string[]&gt;</code></td>
      <td>The enabled set minus the default — what the admin form shows under "Additional languages". Strips the default even when a legacy <code>storeLanguages</code> value still contains it.</td>
    </tr>
    <tr>
      <td><code>getAdminLanguage()</code></td>
      <td><code>Promise&lt;string&gt;</code></td>
      <td>The admin panel locale, independent of the storefront. <code>adminLanguage</code> (normalised) → <code>'en'</code>.</td>
    </tr>
  </tbody>
</table>

```ts
const [defaultLocale, enabled] = await Promise.all([
  getStoreLanguage(),
  getEnabledLanguages()
]);
// defaultLocale: 'en'
// enabled:       ['en', 'fr', 'de']
```

---

## Checkout and pricing settings

```ts
import {
  getAllowGuestCheckout,
  getPricePrecision,
  getPriceRounding
} from '@evershop/evershop/checkout/services';
```

All three are **synchronous** — they are read inside `toPrice`, the promotion calculators, the order validator and request handlers.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Returns</th>
      <th>Setting → config fallback → default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getAllowGuestCheckout()</code></td>
      <td><code>boolean</code></td>
      <td><code>allowGuestCheckout</code> → <code>checkout.allowGuestCheckout</code> → <code>true</code></td>
    </tr>
    <tr>
      <td><code>getPricePrecision()</code></td>
      <td><code>number</code></td>
      <td><code>pricingPrecision</code> → <code>pricing.precision</code> → <code>2</code></td>
    </tr>
    <tr>
      <td><code>getPriceRounding()</code></td>
      <td><code>RoundType</code></td>
      <td><code>pricingRounding</code> → <code>pricing.rounding</code> → <code>'round'</code></td>
    </tr>
  </tbody>
</table>

`getPriceRounding()` returns one of `'round' | 'ceil' | 'floor' | 'up' | 'down'`. `round`, `ceil` and `floor` are the admin values; `up` and `down` are accepted legacy aliases so a pre-existing config value still flows through unchanged. An unrecognised value falls back to `'round'`.

---

## Catalog behaviour settings

```ts
import {
  getShowOutOfStockProducts,
  getCollectionPageSize,
  getProductImageDimensions
} from '@evershop/evershop/catalog/services';
```

All **synchronous** — they run in the pagination filter and the SSR context builder.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Returns</th>
      <th>Setting → config fallback → default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getShowOutOfStockProducts()</code></td>
      <td><code>boolean</code></td>
      <td><code>catalogShowOutOfStockProduct</code> → <code>catalog.showOutOfStockProduct</code> → <code>false</code></td>
    </tr>
    <tr>
      <td><code>getCollectionPageSize()</code></td>
      <td><code>number</code></td>
      <td><code>catalogCollectionPageSize</code> → <code>catalog.collectionPageSize</code> → <code>20</code>. Clamped to a minimum of <code>1</code>.</td>
    </tr>
    <tr>
      <td><code>getProductImageDimensions()</code></td>
      <td><code>&#123; width: number; height: number &#125;</code></td>
      <td><code>catalogProductImageWidth</code> / <code>catalogProductImageHeight</code> → <code>catalog.product.image.width</code> / <code>.height</code> → <code>1200</code> each</td>
    </tr>
  </tbody>
</table>

```ts
import { getCollectionPageSize } from '@evershop/evershop/catalog/services';

const limit = getCollectionPageSize(); // 20
```

## See Also

- [Store Settings](/docs/development/knowledge-base/store-settings) — The settings model and the admin UI
- [Checkout Settings](/docs/development/knowledge-base/checkout-settings) — Guest checkout and pricing behaviour
- [Multi-language](/docs/development/knowledge-base/multi-language) — How the locale list drives routing and translation
- [getSetting](/docs/development/module/functions/getSetting) — Standalone page for the raw reader
- [refreshSetting](/docs/development/module/functions/refreshSetting) — Standalone page for the cache refresh
- [getConfig](/docs/development/module/functions/getConfig) — Reading `config/` values, which is a different thing
