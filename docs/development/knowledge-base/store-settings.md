---
sidebar_position: 13
keywords:
  - store settings
  - setting table
  - getSetting
  - getSettingSync
  - configuration migration
  - EverShop settings API
sidebar_label: Store Settings
title: Store Settings
description: How EverShop stores merchant-editable settings in the setting table, the sync and async getter family, and how to migrate extension code from config keys to setting getters.
---

# Store Settings

EverShop has two layers of configuration, and they answer different questions:

- **`config/<env>.json`** — *deployment* concerns. Database credentials, the active theme, session secrets, extension wiring. Set by a developer, changed by a redeploy.
- **The `setting` table** — *merchant* concerns. Currency, timezone, units, languages, catalog display, tax rounding, file storage. Changed in the admin at runtime, with no restart.

Over recent releases a number of values **moved from the first layer to the second**. If your extension reads them with `getConfig()`, it is reading a legacy fallback at best and failing to type-check at worst. This page documents the setting system and gives you the [migration table](#config--setting-migration-table) to update against.

## The `setting` table

Settings are a schemaless key/value store — there is **no migration to write** when you add one:

```sql
CREATE TABLE "setting" (
  "setting_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid (),
  "name" varchar NOT NULL,
  "value" text DEFAULT NULL,
  "is_json" boolean NOT NULL DEFAULT FALSE,
  CONSTRAINT "SETTING_UUID_UNIQUE" UNIQUE ("uuid"),
  CONSTRAINT "SETTING_NAME_UNIQUE" UNIQUE ("name")
)
```

Two consequences follow from `value` being `text`:

- **Every value comes back as a string.** A getter that must return a number or boolean has to coerce it. Core uses helpers from `lib/util/coerce.ts` (`toInt`, `toFloat`, `toBoolean`, `toEnum`) for exactly this.
- **Arrays and objects need `is_json`.** They are stored JSON-stringified and parsed back on read.

## The uniform resolution chain

Every setting getter in EverShop resolves in the same three steps:

**DB setting → legacy `config.json` fallback → hard-coded default**

```ts
export function getStoreCurrency(): string {
  return getSettingSync<string>(
    'storeCurrency',
    getLegacyConfig('shop.currency', 'USD')
  );
}
```

Read that inside-out: `getLegacyConfig('shop.currency', 'USD')` computes the fallback — the config value if the store still declares one, otherwise `'USD'` — and `getSettingSync` overrides it with the `storeCurrency` row when one exists.

This ordering is what makes the config→setting move a **non-breaking** change. A store that never touches the admin keeps the exact behaviour it had when the value was config-driven; the moment a merchant saves the setting, the DB row wins.

:::warning[One exception: file-storage credentials invert the order]
The storage **credential** getters (`getS3StorageConfig`, `getAzureStorageConfig`, `getGcsStorageConfig`) resolve **config → environment variable → setting**, so config *wins* over the DB row. That is deliberate: an operator who pins S3 credentials in config or the environment must not have them silently overridden from the admin UI. `getFileStorageConfigOverrides()` reports which keys are currently pinned, which is how the admin form knows to render them read-only.

The provider selector is **not** inverted — `getFileStorageProvider()` follows the normal order (`setting fileStorage` → `config system.file_storage` → `'local'`). Two chains, deliberately opposed. See [File Storage](./file-storage#configuration-precedence).
:::

## Sync vs async getters

This is the distinction that matters most when you call a getter.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Getter</th>
      <th>Kind</th>
      <th>Setting key</th>
      <th>Fallback chain</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>getSettingSync(name, default)</code></td>
      <td><strong>sync</strong></td>
      <td>any</td>
      <td>cache only, never the DB</td>
    </tr>
    <tr>
      <td><code>getStoreCurrency()</code></td>
      <td><strong>sync</strong></td>
      <td><code>storeCurrency</code></td>
      <td>legacy <code>shop.currency</code> → <code>USD</code></td>
    </tr>
    <tr>
      <td><code>getStoreTimezone()</code></td>
      <td><strong>sync</strong></td>
      <td><code>storeTimeZone</code></td>
      <td><code>shop.timezone</code> → <code>UTC</code></td>
    </tr>
    <tr>
      <td><code>getWeightUnit()</code></td>
      <td><strong>sync</strong></td>
      <td><code>weightUnit</code></td>
      <td>legacy <code>shop.weightUnit</code> → <code>kg</code></td>
    </tr>
    <tr>
      <td><code>getDimensionUnit()</code></td>
      <td><strong>sync</strong></td>
      <td><code>dimensionUnit</code></td>
      <td>legacy <code>shop.dimensionUnit</code> → <code>cm</code></td>
    </tr>
    <tr>
      <td><code>getSetting(name, default)</code></td>
      <td>async</td>
      <td>any</td>
      <td>lazy-loads the cache from the DB on first call</td>
    </tr>
    <tr>
      <td><code>getStoreLanguage()</code></td>
      <td>async</td>
      <td><code>storeLanguage</code></td>
      <td><code>shop.language</code> → <code>en</code></td>
    </tr>
    <tr>
      <td><code>getEnabledLanguages()</code></td>
      <td>async</td>
      <td><code>storeLanguages</code> + default</td>
      <td>→ <code>[defaultLocale]</code></td>
    </tr>
    <tr>
      <td><code>getAdditionalLanguages()</code></td>
      <td>async</td>
      <td>derived</td>
      <td>enabled minus default</td>
    </tr>
    <tr>
      <td><code>getAdminLanguage()</code></td>
      <td>async</td>
      <td><code>adminLanguage</code></td>
      <td>→ <code>en</code></td>
    </tr>
    <tr>
      <td><code>getStoreName()</code>, <code>getStoreEmail()</code>, <code>getStoreDescription()</code>, address getters</td>
      <td>async</td>
      <td><code>storeName</code>, <code>storeEmail</code>, &hellip;</td>
      <td>→ parameter default / <code>null</code></td>
    </tr>
  </tbody>
</table>

All of these import from `@evershop/evershop/setting/services`:

```ts
import {
  getSetting,
  getSettingSync,
  getStoreCurrency,
  getStoreTimezone,
  getWeightUnit,
  getDimensionUnit,
  getStoreLanguage,
  getEnabledLanguages,
  refreshSetting
} from '@evershop/evershop/setting/services';
```

### Why some getters are synchronous

The four scalar getters run in paths that **cannot** await:

- the **pricing formatter**, which formats a money value inside a synchronous render;
- **cart and shipping serialization**, called per line item;
- **Handlebars email helpers**, which are synchronous by contract;
- **AJV schema builders**, which construct schemas eagerly.

Making them async would not just be awkward — it would be actively harmful. `getSetting()` lazy-loads the cache with a real query, so an async getter in the cart-build path triggers a genuine `pool.connect()`. That turns previously DB-free code into DB-dependent code and **breaks unit tests that run without a database**.

`getSettingSync` avoids this by reading the in-memory cache *only*. When the cache is cold it returns the fallback rather than reaching for a connection:

```ts
export function getSettingSync<T>(name: string, defaultValue: T): T {
  if (!setting) {
    return defaultValue;
  }
  // ...
}
```

A cold cache therefore yields the config fallback — precisely the behaviour those paths had before the value moved to the database. Moving a value from config to a setting never adds a DB dependency to a previously synchronous path.

:::tip
The rule for your own code: **prefer async `getSetting`**. Reach for `getSettingSync` only when you are in a genuinely synchronous path, and accept that a cold cache gives you the default.
:::

## Cache warming

The cache is a module-level array, filled by `refreshSetting()`, and warmed in three places:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>When</th>
      <th>Where</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>At boot</td>
      <td><code>modules/setting/bootstrap.ts</code></td>
      <td>Makes the sync getters reliable from the first request onward. Runs in every process that loads bootstraps — HTTP, cron, subscriber.</td>
    </tr>
    <tr>
      <td>After a save</td>
      <td><code>saveSetting</code>, after commit</td>
      <td>An admin change takes effect immediately, with no restart.</td>
    </tr>
    <tr>
      <td>Per event batch</td>
      <td><code>lib/event/event-manager.ts</code> (<code>beforeBatch</code>)</td>
      <td>The subscriber process is long-lived; off-request emails and jobs pick up admin changes.</td>
    </tr>
  </tbody>
</table>

Boot-time warming is **non-fatal by design**. Bootstraps run *before* migrations, so on a brand-new database the `setting` table does not exist yet. That specific case — Postgres error code `42P01`, `undefined_table` — logs at **debug** level so a fresh install does not look like a crash. Any other failure (connection refused, bad credentials) still logs as an error:

```ts
if ((e as { code?: string })?.code === '42P01') {
  debug(
    'Setting cache warm-up skipped: the setting table is not migrated yet (fresh install). The cache will load after migrations run.'
  );
} else {
  error(e);
}
```

## Writing settings

### `POST /api/settings`

One private endpoint upserts **arbitrary keys**. The payload is a flat object; every top-level key becomes a `setting` row. There is no payload schema, so you do not need to register anything to persist your extension's own settings.

```bash
curl -X POST https://yourstore.com/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-access-token>" \
  -d '{"storeCurrency": "EUR", "weightUnit": "lb", "myExtensionApiKey": "abc123"}'
```

`is_json` is decided per value:

```ts
if (value !== null && typeof value === 'object') {
  // JSON.stringify(value), is_json: 1
} else {
  // value ?? '', is_json: 0
}
```

So arrays and objects round-trip correctly, while a scalar is stored as text. The explicit `!== null` guard matters: `typeof null === 'object'`, so without it an absent optional field would be stored as the literal string `"null"` and shown as `null` in the admin form after saving.

All writes happen in **one transaction**, and `refreshSetting()` runs after the commit.

:::note
There is **no `GET /api/settings`**. Settings are read through the GraphQL `Query.setting` field, whose type is assembled from several modules (`StoreSetting`, `ShippingSetting`, `BrandingSetting`, `CheckoutSetting`, `FileStorageSetting`). Secret values — `s3SecretAccessKey`, `azureStorageConnectionString`, `gcsServiceAccountKey` — are masked in the GraphQL response.
:::

### Adding a setting from an extension

Because the table is schemaless and the endpoint takes arbitrary keys, adding a setting is just: POST the key, then read it back with a getter of your own that follows the standard chain.

```ts title="extensions/my-extension/services/mySettings.ts"
import { getSettingSync } from '@evershop/evershop/setting/services';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';

export function getMyFeatureLimit(): number {
  const raw = getSettingSync<string | number>(
    'myFeatureLimit',
    getConfig('myExtension.featureLimit', 50)
  );
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isNaN(parsed) ? 50 : parsed;
}
```

Note the coercion — the DB hands you a string even when the config default is a number.

## config → setting migration table

If your extension reads any of these config keys, switch to the getter. The config key still works as a *fallback*, but it is no longer the source of truth, and a merchant editing the admin will not affect your code until you migrate.

### Shop

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Old config key</th>
      <th>Now</th>
      <th>Import from</th>
      <th>Status of the config key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shop.currency</code></td>
      <td><code>getStoreCurrency()</code> — sync</td>
      <td><code>@evershop/evershop/setting/services</code></td>
      <td><strong>Removed from typed <code>getConfig</code></strong>; untyped legacy fallback only</td>
    </tr>
    <tr>
      <td><code>shop.weightUnit</code></td>
      <td><code>getWeightUnit()</code> — sync</td>
      <td><code>@evershop/evershop/setting/services</code></td>
      <td><strong>Removed from typed <code>getConfig</code></strong>; untyped legacy fallback only</td>
    </tr>
    <tr>
      <td><code>shop.dimensionUnit</code></td>
      <td><code>getDimensionUnit()</code> — sync</td>
      <td><code>@evershop/evershop/setting/services</code></td>
      <td><strong>Removed from typed <code>getConfig</code></strong>; untyped legacy fallback only</td>
    </tr>
    <tr>
      <td><code>shop.timezone</code></td>
      <td><code>getStoreTimezone()</code> — sync, for <em>display</em></td>
      <td><code>@evershop/evershop/setting/services</code></td>
      <td><strong>Still typed and still required</strong> — see the note below</td>
    </tr>
    <tr>
      <td><code>shop.language</code></td>
      <td><code>getStoreLanguage()</code> — async</td>
      <td><code>@evershop/evershop/setting/services</code></td>
      <td><strong>Still typed</strong>; the locale system's synchronous fallback</td>
    </tr>
  </tbody>
</table>

The typed `ConfigStructure` now declares exactly three `shop.*` keys: `language`, `timezone`, `homeUrl`. **`getConfig('shop.currency')` no longer type-checks** — nor do the two unit keys. Call the getter instead.

The rule that decided what stayed: *a `shop.*` key stays typed only if something reads it directly and operationally, not merely as a getter fallback.* `shop.timezone` sets the **database session timezone** in `connection.ts` at connect time — before any query can run — so it fundamentally cannot be a DB setting. `shop.language` is read directly by the locale system as its synchronous fallback. Currency and the units were pure getter fallbacks, so they were removed.

:::warning[Two different timezones]
`shop.timezone` (config) is the **operational** timezone that gates the DB session. `storeTimeZone` (setting, read via `getStoreTimezone()`) is the **display** timezone used by date formatting. They are not interchangeable.
:::

### Catalog

Import from `@evershop/evershop/catalog/services`. All sync.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Old config key</th>
      <th>Getter</th>
      <th>Setting key</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>catalog.showOutOfStockProduct</code></td>
      <td><code>getShowOutOfStockProducts()</code></td>
      <td><code>catalogShowOutOfStockProduct</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>catalog.collectionPageSize</code></td>
      <td><code>getCollectionPageSize()</code></td>
      <td><code>catalogCollectionPageSize</code></td>
      <td><code>20</code> (clamped to at least 1)</td>
    </tr>
    <tr>
      <td><code>catalog.product.image.width</code> / <code>.height</code></td>
      <td><code>getProductImageDimensions()</code></td>
      <td><code>catalogProductImageWidth</code>, <code>catalogProductImageHeight</code></td>
      <td><code>1200</code> / <code>1200</code></td>
    </tr>
  </tbody>
</table>

Not migrated, still config-only: `catalog.crossSell.recomputeSchedule`, `catalog.crossSell.recomputeEnabled`, `catalog.crossSell.maxOrderKeys`.

### Pricing and tax

Pricing getters import from `@evershop/evershop/checkout/services`. All sync.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Old config key</th>
      <th>Getter</th>
      <th>Setting key</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>pricing.rounding</code></td>
      <td><code>getPriceRounding()</code></td>
      <td><code>pricingRounding</code></td>
      <td><code>round</code></td>
    </tr>
    <tr>
      <td><code>pricing.precision</code></td>
      <td><code>getPricePrecision()</code></td>
      <td><code>pricingPrecision</code></td>
      <td><code>2</code></td>
    </tr>
    <tr>
      <td><code>pricing.tax.rounding</code></td>
      <td><code>getTaxRounding()</code></td>
      <td><code>taxRounding</code></td>
      <td><code>round</code></td>
    </tr>
    <tr>
      <td><code>pricing.tax.precision</code></td>
      <td><code>getTaxPrecision()</code></td>
      <td><code>taxPrecision</code></td>
      <td><code>2</code></td>
    </tr>
    <tr>
      <td><code>pricing.tax.round_level</code></td>
      <td><code>getTaxRoundLevel()</code></td>
      <td><code>taxRoundLevel</code></td>
      <td><code>unit</code> (<code>total</code> | <code>line</code> | <code>unit</code>)</td>
    </tr>
    <tr>
      <td><code>pricing.tax.price_including_tax</code></td>
      <td><code>getPriceIncludingTax()</code></td>
      <td><code>priceIncludingTax</code></td>
      <td><code>false</code></td>
    </tr>
  </tbody>
</table>

The four tax getters live in `modules/tax/services/taxSettings.ts` and are **not on the public export map** — there is no `@evershop/evershop/tax/services`. Read the setting keys directly with `getSettingSync` if you need them from an extension.

:::note
The inline defaults in `taxSettings.ts` intentionally differ from the tax module's bootstrap config defaults (`total` / `true`). The inline value is the last-resort default when neither a setting nor a config value exists.
:::

### Checkout

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Old config key</th>
      <th>Getter</th>
      <th>Import from</th>
      <th>Setting key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>checkout.allowGuestCheckout</code></td>
      <td><code>getAllowGuestCheckout()</code> — sync, default <code>true</code></td>
      <td><code>@evershop/evershop/checkout/services</code></td>
      <td><code>allowGuestCheckout</code></td>
    </tr>
  </tbody>
</table>

`checkout.showShippingNote` has **not** moved; it is still config-only.

### File storage and uploads

Config keys `system.file_storage` and `system.s3.*` / `system.azure.*` / `system.gcs.*` map to setting rows managed on the admin file-storage screen. The getters live in `modules/cms/services/storage/storageConfig.ts` and are not on the public export map.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Old config key</th>
      <th>Setting key(s)</th>
      <th>Getter</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>system.file_storage</code></td>
      <td><code>fileStorage</code></td>
      <td><code>getFileStorageProvider()</code> — sync</td>
    </tr>
    <tr>
      <td><code>system.s3.*</code></td>
      <td><code>s3Bucket</code>, <code>s3Region</code>, <code>s3AccessKeyId</code>, <code>s3SecretAccessKey</code>, <code>s3Endpoint</code>, <code>s3ForcePathStyle</code>, <code>s3BaseUrl</code></td>
      <td><code>getS3StorageConfig()</code> — async</td>
    </tr>
    <tr>
      <td><code>system.azure.*</code></td>
      <td><code>azureStorageConnectionString</code>, <code>azureStorageContainerName</code>, <code>azureContainerAccess</code>, <code>azureBaseUrl</code></td>
      <td><code>getAzureStorageConfig()</code> — async</td>
    </tr>
    <tr>
      <td><code>system.gcs.*</code></td>
      <td><code>gcsBucket</code>, <code>gcsServiceAccountKey</code>, <code>gcsBaseUrl</code></td>
      <td><code>getGcsStorageConfig()</code> — async</td>
    </tr>
    <tr>
      <td><code>system.upload_allowed_mime_types</code></td>
      <td><code>uploadAllowedMimeTypes</code></td>
      <td>read in <code>getMulter</code></td>
    </tr>
    <tr>
      <td><code>system.upload_max_file_size</code></td>
      <td><code>uploadMaxFileSize</code></td>
      <td>read in <code>getMulter</code> (config wins)</td>
    </tr>
  </tbody>
</table>

The S3, Azure, and GCS getters also read AWS-style environment variables (`AWS_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_ENDPOINT`, `AWS_S3_FORCE_PATH_STYLE`) between config and the setting. Remember the [inverted precedence](#the-uniform-resolution-chain) for those three: config → env → setting. `getFileStorageProvider()` is not inverted.

[File Storage](./file-storage) documents the provider services, the base-URL contract, and how to write a custom storage provider.

### Branding: `themeConfig.logo` was removed outright

`themeConfig.logo` is **gone from `ConfigStructure` with no fallback**. Unlike the currency and unit keys — which kept an untyped legacy read — a `themeConfig.logo` block in `config.json` is now **ignored entirely**. `getConfig('themeConfig.logo')` does not type-check and there is no compatibility path.

The logo is now three setting rows, saved from the admin store-settings screen:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Old config path</th>
      <th>Setting key</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>themeConfig.logo.src</code></td><td><code>logo</code></td></tr>
    <tr><td><code>themeConfig.logo.width</code></td><td><code>logoWidth</code></td></tr>
    <tr><td><code>themeConfig.logo.height</code></td><td><code>logoHeight</code></td></tr>
  </tbody>
</table>

Related branding keys that are settings and never had a config equivalent: `favicon`, `socialSharingImage`, `gaMeasurementId`. Themes read all of these through the GraphQL `BrandingSetting` type rather than from config.

`themeConfig` still exists and still holds `headTags` (`links`, `metas`, `scripts`, `bases`) and `copyRight`.

:::danger
A theme that still reads `themeConfig.logo` renders **no logo** — it does not fall back and it does not warn. This is the one migration on this page that silently changes behaviour, so grep your themes for it.
:::

## Units are relabel, not convert

`weightUnit` and `dimensionUnit` are **display labels only**. Product and package weights and dimensions are stored as unit-less decimals (`product.weight`, `package_length`, `package_width`, `package_height`, `package_weight`).

Changing the unit **reinterprets** those numbers; it does **not** convert them. A stored `2.5` stays `2.5` — it is simply relabeled from `2.5 kg` to `2.5 lb`. There is no data migration, and switching units silently changes what your catalog means.

The `Weight` and `Dimension` GraphQL types wrap a raw number and attach the `unit` plus a formatted `text` from the getters. Shipping code normalizes the unit string into carrier-specific vocabularies at the boundary.

## Gotchas

- **The DB hands you strings.** `getSetting`/`getSettingSync` return `value` verbatim unless `is_json` is set. Coerce numbers and booleans.
- **A cold cache returns the default, silently.** In a unit test with no database, `getSettingSync` gives you the config fallback. That is intentional, but it means a test asserting on a DB-backed setting must warm the cache or stub the getter.
- **`getSetting` lazy-loads on first call.** The first async read in a cold process performs a query. Do not put it inside a tight loop; read once and pass the value down.
- **Language settings are async.** Unlike currency and units, `getStoreLanguage()` and `getEnabledLanguages()` must be awaited — they normalize locale codes and merge lists.
- **There is no `GET /api/settings`.** Read through GraphQL.
- **`storeLanguages` cannot be set from the admin in 2.2.1.** The multiselect is commented out; use the settings API. See [Multi-Language Stores](./multi-language#the-enabled-languages-model).

## See also

- [Configuration Guide](./configuration-guide) — the `config/<env>.json` layer and how modules declare config defaults
- [Multi-Language Stores](./multi-language) — the language settings and how a request resolves its locale
- [Translation](./translation) — authoring the CSV dictionaries
- [File Storage](./file-storage) — the storage providers and their inverted precedence chain
- [The Database](./database) — the typed query builder behind `getSetting` and `saveSetting`
- [Registry and Processors](./registry-and-processors) — the `configurationSchema` processor that declares config defaults

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
