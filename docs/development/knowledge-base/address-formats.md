---
sidebar_position: 44
keywords:
  - address
  - address format
  - address schema
  - regions
  - provinces
  - postal code
  - checkout address
sidebar_label: Address Formats
title: Address Formats
description: How EverShop decides which address fields a country collects, validates them, prints them, and how extensions add countries, regions and fields without a migration.
---

# Address Formats

Every address in EverShop — the customer's address book, the cart's shipping and billing addresses, the order's copies — is driven by **one format record per country**. The record says which lines the country uses and in which order; the server derives the form, the validation, the printed lines and the integration payloads from it. A package can change a country, add regions below it, or add a field, with calls from its `bootstrap.ts` and nothing else: no migration, no GraphQL, no React.

This guide covers the vocabulary and storage, the format records, region providers, how a schema is resolved, validation, display, GraphQL, the store settings, extra fields, integrations, the storefront form, legacy orders, a package recipe, and the upgrade from the pre-2026 address model.

## Vocabulary and storage

The three address tables — `customer_address`, `cart_address`, `order_address` — share one set of columns and stay identical (a check in the test suite enforces it).

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Column</th>
      <th className="text-left">Layout token</th>
      <th className="text-left">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>recipient</code></td><td><code>%N</code></td><td>Full name as printed. Always stored, composed from the parts when the store collects split names.</td></tr>
    <tr><td><code>given_name</code>, <code>family_name</code></td><td>—</td><td>Name parts, only when the store collects them (<code>addressNameFormat = split</code>).</td></tr>
    <tr><td><code>organization</code></td><td><code>%O</code></td><td>Company.</td></tr>
    <tr><td><code>address_line_1</code>, <code>address_line_2</code>, <code>address_line_3</code></td><td><code>%A</code></td><td>Street lines. Line 3 only when enabled.</td></tr>
    <tr><td><code>dependent_locality</code></td><td><code>%D</code></td><td>Ward, neighbourhood or district below the city.</td></tr>
    <tr><td><code>locality</code></td><td><code>%C</code></td><td>City or town.</td></tr>
    <tr><td><code>administrative_area</code></td><td><code>%S</code></td><td>State, province, prefecture, region.</td></tr>
    <tr><td><code>postal_code</code></td><td><code>%Z</code></td><td>Postal or ZIP code.</td></tr>
    <tr><td><code>sorting_code</code></td><td><code>%X</code></td><td>Sorting code (CEDEX).</td></tr>
    <tr><td><code>country</code></td><td>—</td><td>ISO 3166-1 alpha-2, upper-case.</td></tr>
    <tr><td><code>telephone</code></td><td>—</td><td>E.164, normalized with the country's dial code.</td></tr>
    <tr><td><code>extra</code></td><td>—</td><td>JSONB: values of extra fields registered by extensions, keyed by field id.</td></tr>
  </tbody>
</table>

Geographic levels store the **region key** of the country's provider (`US-CA`, `VN-SG`, a Hong Kong area name, a Vietnamese ward code) where the level is enumerated, and free text where it is not. Names are resolved at read time; nothing snapshots them.

## Format records

A record has the shape of one entry of Google's open address metadata (libaddressinput), so a package can copy data from that reference without translating concepts:

```ts
import type { AddressFormat } from '@evershop/evershop/lib/address';

const US: AddressFormat = {
  fmt: '%N%n%O%n%A%n%C, %S %Z',   // layout: %n is a line break, tokens on one line share a row
  require: 'ACSZ',               // required tokens
  upper: 'CS',                   // printed upper-case on an envelope (display only)
  zip: '(\\d{5})(?:[ \\-](\\d{4}))?',
  zipex: '95014,22162-1010',     // the first example is the placeholder
  state_name_type: 'state',      // label types → "State", "ZIP code"
  zip_name_type: 'zip',
  languages: ['en'],
  name_order: 'given_first',     // EverShop extension: how split names compose the recipient
  telephone: { dialCode: '+1' }  // EverShop extension: dial code; a pattern comes from a package
};
```

Core ships one generated record per country (`lib/address/formats/`, CC-BY 4.0 attribution included) plus a `DEFAULT` record for unknown codes (`%N%n%O%n%A%n%C`, require `AC`). Countries whose native order differs from the Latin one (Japan, China, Korea, Hong Kong, Taiwan …) carry an `lfmt`; a reader whose language is not the record's native language gets the Latin layout, which is why resolution is keyed on `(country, locale)`.

A package changes a record with [`patchAddressFormat`](/docs/development/module/functions/patchAddressFormat) from `bootstrap.ts`:

```ts
patchAddressFormat('VN', {
  fmt: '%N%n%O%n%A%n%D%n%C%n%S',
  require: 'ADS',
  sublocality_name_type: 'ward',
  telephone: { dialCode: '+84', pattern: '^(\\+84|0)[0-9]{9}$', example: '0912 345 678' }
});
```

All registration calls throw once the address registry is **locked**, which happens right after every module's bootstrap in each process (web server, build, the event subscriber process that renders emails, cron).

## Region providers

Region data is server-side, hierarchical and read through one registry by the form (options), the display paths (names), the shipping-zone and tax admin pickers and the email.

```ts
import { registerRegionProvider, getRegions, resolveRegionName } from '@evershop/evershop/lib/address';

registerRegionProvider('VN', {
  levels: ['administrative_area', 'dependent_locality'],   // outermost first
  list: (parentPath, locale) => parentPath.length === 0 ? provinces : wardsOf(parentPath[0])
});

await getRegions('VN', ['VN-SG']);                                   // active wards of Hồ Chí Minh
await resolveRegionName('VN', 'administrative_area', 'VN-43', 'vi'); // "Bà Rịa - Vũng Tàu" — retired, still named
```

Core's default provider enumerates one `administrative_area` level for every country that has ISO 3166-2 subdivisions, plus Google's sub-region keys for Hong Kong and the Cayman Islands. Four rules hold everywhere:

1. **The stored value is the provider's key.** A level the provider does not enumerate is free text, and the text is its own key.
2. **Keys are append-only.** A refreshed dataset or a package may mark a key `retired` (hidden from selection, still resolvable) but never remove or rename one. This is what keeps legacy orders, zones and tax rates valid after a data refresh such as Vietnam's 2025 merger, whose 29 absorbed province codes are retired entries pointing at their successors.
3. **Level type follows data.** An enumerated level is a `select` in the form, with `dependsOn` naming the outer level; anything else is text.
4. **Display name follows the reader.** `name` is shown to readers of the record's language, `latinName` to everyone else.

Writes accept **active** keys only; editing a stored address that holds a retired key shows it marked "no longer available" until the customer picks again. See [`registerRegionProvider`](/docs/development/module/functions/registerRegionProvider).

## Resolution

[`resolveAddressSchema(country, locale, { surface })`](/docs/development/module/functions/resolveAddressSchema) turns the record into the ordered field list the form renders and the server validates:

1. Pick the layout: `lfmt` when the reader's language is not the record's native language, else `fmt`.
2. Expand each token into fields (`%A` into the enabled street lines, `%N` into one or two name fields), the enumerated levels into selects, and append `telephone` after the name.
3. Apply the store's address settings (telephone required/optional/hidden, company, line 2 and 3, extra required fields, name format).
4. Insert the registered extra fields for this country and surface.
5. Run the `addressSchema` processor — the hook for a merchant's own rule:

```ts
// bootstrap.ts — hide telephone store-wide
addProcessor('addressSchema', (schema) => ({ ...schema, fields: schema.fields.filter((f) => f.id !== 'telephone') }));
```

The result is cached per `(country, locale)` and invalidated by every registry change. GraphQL exposes it as `addressSchema(country, locale, surface)`; `country` may be null, in which case the store's default-country setting decides and the result says which country it resolved.

## Validation

Every address write runs the same pipeline: normalize (trim, upper-case the country, telephone to E.164 with the dial code, compose or split names), then [`validateAddress`](/docs/development/module/functions/validateAddress) against the resolved schema, then the rules extensions added with [`addAddressValidationRule`](/docs/development/module/functions/addAddressValidationRule).

<table className="table-auto not-prose">
  <thead>
    <tr><th className="text-left">Code</th><th className="text-left">When</th></tr>
  </thead>
  <tbody>
    <tr><td><code>unknown_field</code></td><td>A payload key that is neither a shared column nor a registered extra field. Input is never discarded silently.</td></tr>
    <tr><td><code>required</code></td><td>A field the country or the store requires is empty.</td></tr>
    <tr><td><code>pattern</code></td><td>Postal code, telephone or an extra field does not match its pattern.</td></tr>
    <tr><td><code>region_invalid</code></td><td>A key the provider does not list as active at that level, under those parents.</td></tr>
    <tr><td><code>type</code></td><td>Wrong JSON type.</td></tr>
    <tr><td><code>country_not_allowed</code></td><td>Outside the sell-to list; for a shipping address also outside every zone.</td></tr>
  </tbody>
</table>

REST answers `400` with `error.errors: [{ field, code, message }]`, every failing field at once, messages translated with the field label interpolated. The storefront form puts each message on its input. Client-side, the form enforces `required` and `pattern` itself from the schema; region keys and cross-field rules are checked on submit.

## Formatting and display

No display surface names an address column. They all print `formatted` — the lines [`formatAddress`](/docs/development/module/functions/formatAddress) produces from the record's layout with the resolved names, country included:

```text
Chan Tai Man
1 Nathan Road
Tsim Sha Tsui
Kowloon
Hong Kong SAR China
```

GraphQL returns `formatted: [String!]!` on every address; the order confirmation email prints `{{#each shippingAddress.formatted}}`; the admin order view and the storefront summary (`AddressSummary`) print the same array. A legacy order keeps printing its stored values because retired region keys still resolve to names.

## GraphQL

```graphql
interface Address {              # CartAddress, CustomerAddress, OrderAddress
  recipient: String
  givenName: String
  familyName: String
  organization: String
  addressLine1: String
  addressLine2: String
  addressLine3: String
  dependentLocality: Region      # { key, name, isoCode }
  locality: Region
  administrativeArea: Region
  postalCode: String
  sortingCode: String
  country: Country               # { code, name }
  telephone: String
  extra: JSON
  formatted: [String!]!
}

type Query {
  addressSchema(country: String, locale: String, surface: String): AddressSchema!
  regions(country: String!, parentPath: [String!], locale: String): [Region!]!
  countries(scope: CountryScope = ALL): [Country!]!   # ALL | SELL_TO | SHIPPING
}
```

`Cart.availableShippingMethods` takes `(country, administrativeArea, locality, dependentLocality, postalCode)`; `ShippingZone.regions` lists `{ country, level, key, name, retired, mergedInto }`; the admin-only `addressConfigWarnings` names zones and tax rates that point at retired keys or at countries the store no longer sells to.

## Settings

Eight rows of the `setting` table shape every form. The **Addresses** section of **Settings → Customer** edits seven of them; the sell-to list sits with the zones it interacts with, above them on **Settings → Shipping**. `POST /api/settings` accepts them like any other row. There are no config keys.

<table className="table-auto not-prose">
  <thead>
    <tr><th className="text-left">Setting</th><th className="text-left">Values</th><th className="text-left">Default</th></tr>
  </thead>
  <tbody>
    <tr><td><code>addressNameFormat</code></td><td><code>single</code> (one "Full name" field) or <code>split</code> (given + family name)</td><td><code>single</code></td></tr>
    <tr><td><code>addressTelephone</code></td><td><code>required</code>, <code>optional</code>, <code>hidden</code></td><td><code>required</code></td></tr>
    <tr><td><code>addressOrganization</code></td><td><code>hidden</code>, <code>optional</code>, <code>required</code></td><td><code>optional</code></td></tr>
    <tr><td><code>addressLine2</code></td><td><code>shown</code>, <code>hidden</code></td><td><code>shown</code></td></tr>
    <tr><td><code>addressLine3</code></td><td><code>enabled</code>, <code>disabled</code></td><td><code>disabled</code></td></tr>
    <tr><td><code>addressRequired</code></td><td>JSON object: postal field → <code>required</code>, to tighten what a country leaves optional</td><td><code>{'{}'}</code></td></tr>
    <tr><td><code>addressDefaultCountry</code></td><td><code>store</code> (the store's country), <code>none</code>, or a country code</td><td><code>store</code></td></tr>
    <tr><td><code>addressSellToCountries</code></td><td><code>all</code> or a JSON array of country codes</td><td><code>all</code></td></tr>
  </tbody>
</table>

A sell-to list of exactly one country is also the default country, whatever the Default country setting says, and the storefront shows the country as a read-only line instead of a select — there is nothing to choose. The same happens on the shipping step when the zones cover a single sold-to country. Switching the name format needs no data migration: a store moving to `split` still displays every stored `recipient`, pre-fills a legacy address with a labelled best-effort split when the customer edits it, and stores real parts from then on. The sell-to list is intent: a zone that covers a country outside the list is kept and flagged in the admin, never deleted.

## Extra fields

[`registerAddressField`](/docs/development/module/functions/registerAddressField) adds a field that lives in `extra` and travels with the row through the address book, the cart and the order. Scope it to countries (`countries: ['IT']`) or to forms (`surfaces: ['account']`); give it a pattern; it renders through the same renderer map as the built-in fields and validates on both sides.

## Integrations

Payment and carrier code builds its payloads from [`toIntegrationAddress`](/docs/development/module/functions/toIntegrationAddress) — resolved names, collected lines, the ISO suffix of the state for consumers that want `CA` — and keeps its own field names on the way out (`CarrierAddress.company`, PayPal's `admin_area_1`, Stripe's `state`). A country package therefore needs no integration work.

## The storefront form

The storefront renders the schema: country select first, then the country's fields in the record's row order, region levels as lazy selects that load their options when the parent is chosen. The same component serves the address book (`surface="account"`), the shipping step (`shipping`, countries from `countries(scope: SHIPPING)`) and the billing step (`billing`, `SELL_TO`). Changing the country clears only the fields that disappeared or changed shape. Themes have four seams — CSS, Areas (`addressForm.<surface>`, `addressField.<id>`, `addressSummary`), the renderer map, and a replacement layout over `AddressRendererProps` — documented in [Address Form](/docs/development/theme/components/AddressForm) and [Address Summary](/docs/development/theme/components/AddressSummary).

## Legacy orders

Orders placed before an upgrade or a data refresh must keep printing the same lines. Three things make that hold: the migration renamed columns without rewriting values; region keys are append-only, so a retired key still resolves to its name; and the format layout keeps the tokens legacy rows used (Vietnam's `%C` district line stays in the layout even though new addresses no longer collect a district). A fixture of pre-migration rows is part of the test suite.

## Package recipe

A country package is data plus two or three bootstrap calls. `@evershop/address-vn`, released on its own, is the reference:

```
extensions/address-vn/
├── package.json          # "type": "module", peerDependency on @evershop/evershop
├── src/bootstrap.ts      # patchAddressFormat + registerRegionProvider
├── src/data/wards.ts     # generated: 3,321 wards keyed by official code, grouped by province
└── sources.md            # where the data came from, its licence, the key decisions
```

```ts
// src/bootstrap.ts
import { getRegionProvider, patchAddressFormat, registerRegionProvider } from '@evershop/evershop/lib/address';
import { WARDS } from './data/wards.js';

export default () => {
  patchAddressFormat('VN', { fmt: '%N%n%O%n%A%n%D%n%C%n%S', require: 'ADS', sublocality_name_type: 'ward',
    telephone: { dialCode: '+84', pattern: '^(\\+84|0)[0-9]{9}$', example: '0912 345 678' } });
  const provinces = getRegionProvider('VN');            // keep core's keys, add a level below them
  registerRegionProvider('VN', {
    levels: ['administrative_area', 'dependent_locality'],
    list: (path, locale) => path.length === 0 ? provinces.list([], locale) : WARDS[path[0]] ?? []
  });
};
```

Enable it like any extension (`system.extensions` in `config/default.json`). Labels come from core's label types (`ward` → "Ward"), so the package ships no translation file. A package may import only `@evershop/evershop/*` public paths and its own files; the reference package's own test suite checks that and exercises the patch, the regions, the derived form, the validation and `formatted` against core's public API.

## Upgrading

This model replaced the fixed `full_name / address_1 / address_2 / city / province / postcode` form in the breaking address release. **Deploy it to a single replica or inside a maintenance window**: migrations run inside the new process at boot, so an old pod reading `full_name` fails as soon as a new pod has renamed the columns. Take a database backup first; `scripts/address-formats/rollback-schema.sql` plus redeploying the previous release is the documented reverse. Compile fully (`npm run compile`, not `compile:dev` — source files were deleted), build, then start. Every open cart re-quotes shipping once after the upgrade.

### Database (automatic, metadata-only, no values rewritten)

<table className="table-auto not-prose">
  <thead><tr><th className="text-left">Old</th><th className="text-left">New</th></tr></thead>
  <tbody>
    <tr><td><code>full_name</code> (all three address tables)</td><td><code>recipient</code></td></tr>
    <tr><td><code>address_1</code>, <code>address_2</code></td><td><code>address_line_1</code>, <code>address_line_2</code></td></tr>
    <tr><td><code>city</code></td><td><code>locality</code></td></tr>
    <tr><td><code>province</code></td><td><code>administrative_area</code></td></tr>
    <tr><td><code>postcode</code></td><td><code>postal_code</code></td></tr>
    <tr><td>—</td><td>new nullable <code>organization</code>, <code>address_line_3</code>, <code>dependent_locality</code>, <code>sorting_code</code>, <code>given_name</code>, <code>family_name</code>, <code>extra jsonb</code></td></tr>
    <tr><td><code>shipping_zone_province (zone_id, country, province)</code></td><td><code>shipping_zone_region (zone_id, country, level, region_key)</code>, unique on the four</td></tr>
    <tr><td><code>tax_rate.province</code>, <code>tax_rate.postcode</code></td><td><code>tax_rate.administrative_area</code>, <code>tax_rate.postal_code</code></td></tr>
  </tbody>
</table>

### GraphQL

<table className="table-auto not-prose">
  <thead><tr><th className="text-left">Old</th><th className="text-left">New</th></tr></thead>
  <tbody>
    <tr><td><code>Address.fullName / address1 / address2 / city / province {`{ code name }`} / postcode</code></td><td><code>recipient / addressLine1 / addressLine2 / locality {`{ key name }`} / administrativeArea {`{ key name isoCode }`} / postalCode</code>; new <code>givenName familyName organization addressLine3 dependentLocality sortingCode extra formatted</code></td></tr>
    <tr><td><code>type Province</code>, <code>Country.provinces</code>, <code>Query.provinces(countries:)</code></td><td><code>type Region</code>, <code>Country.regions(parentPath)</code>, <code>Query.regions(country, parentPath)</code></td></tr>
    <tr><td><code>Query.countries(countries:)</code>, <code>Query.allowedCountries</code>, <code>Setting.allowedCountries</code></td><td><code>Query.countries(scope: ALL | SELL_TO | SHIPPING)</code></td></tr>
    <tr><td><code>CustomerAddress.cartAddressId</code></td><td><code>CustomerAddress.customerAddressId</code></td></tr>
    <tr><td><code>ShippingZone.provinces: [Province]</code></td><td><code>ShippingZone.regions: [ZoneRegion!]!</code></td></tr>
    <tr><td><code>Cart.availableShippingMethods(country, province, postcode)</code></td><td><code>(country, administrativeArea, locality, dependentLocality, postalCode)</code></td></tr>
    <tr><td><code>TaxRate.province / postcode</code></td><td><code>administrativeArea / postalCode</code></td></tr>
    <tr><td>—</td><td>new <code>Query.addressSchema(country, locale, surface)</code>, admin <code>Query.addressConfigWarnings</code></td></tr>
  </tbody>
</table>

### REST

Payload keys of `addCartAddress`, `createCustomerAddress`, `updateCustomerAddress`, `createMyAddress` and `updateMyAddress` follow the column table; `country` is the only key the payload schema requires and the rest follows the country's schema (telephone is required by default). Unknown keys answer `unknown_field`; validation failures answer `400 INVALID_PAYLOAD` with `error.errors: [{ field, code, message }]` instead of a `500` with one joined message. `createShippingZone` / `updateShippingZone` take `regions: [{ country, level, key }]` instead of `provinces`; tax-rate endpoints take `administrative_area` / `postal_code`; `createOrder` and `loadOrderById()` carry the renamed address keys.

### TypeScript and import paths

<table className="table-auto not-prose">
  <thead><tr><th className="text-left">Old</th><th className="text-left">New</th></tr></thead>
  <tbody>
    <tr><td><code>@evershop/evershop/types/customerAddress</code> (<code>Address</code>, <code>CustomerAddressGraphql</code>)</td><td><code>@evershop/evershop/types/address</code> (<code>Address</code>, <code>AddressGraphql</code>)</td></tr>
    <tr><td><code>@evershop/evershop/lib/locale/countries</code>, <code>…/provinces</code></td><td><code>getCountries()</code>, <code>getCountryName()</code>, <code>getRegions()</code>, <code>resolveRegionName()</code> from <code>@evershop/evershop/lib/address</code></td></tr>
    <tr><td><code>validateAddress(address): {`{ valid, errors: string[] }`}</code></td><td><code>await validateAddress(address, {`{ locale, previous, surface }`}): {`{ valid, errors: AddressError[] }`}</code></td></tr>
    <tr><td><code>addAddressValidationRule({`{ id, func, errorMessage }`})</code></td><td><code>addAddressValidationRule({`{ id, func(address, schema), error: { field?, code, message } }`})</code></td></tr>
    <tr><td><code>ShippingContext.origin / destination</code> keys <code>province, city, postcode, address_1</code></td><td><code>administrative_area, locality, postal_code, address_line_1</code> (+ <code>dependent_locality</code>)</td></tr>
    <tr><td><code>resolveZonesForAddress({`{ country, province, postcode }`})</code></td><td><code>({`{ country, administrativeArea, postalCode }`})</code></td></tr>
    <tr><td><code>getAvailableShippingMethods(cartId, country, province, postcode)</code></td><td><code>getAvailableShippingMethods(cartId, destination?)</code></td></tr>
    <tr><td><code>getTaxRates(taxClassId, country, province, postcode)</code></td><td><code>(taxClassId, country, administrativeArea, postalCode)</code></td></tr>
    <tr><td><code>CarrierAddress</code></td><td>unchanged names; <code>company</code> now filled; new <code>dependentLocality?</code></td></tr>
    <tr><td><code>orderConfirmationEmailData.shippingAddress.full_name / province_name / …</code></td><td>renamed row keys + <code>formatted: string[]</code> and the derived <code>country_name</code>, <code>administrative_area_name</code>, <code>locality_name</code>, <code>dependent_locality_name</code>; <code>province_name</code> is gone — custom <code>templatePath</code> templates must change</td></tr>
    <tr><td>Registry key <code>customerDataBeforeUpdate</code> (misused for addresses)</td><td><code>customerAddressDataBeforeUpdate</code>; new <code>customerAddressDataBeforeCreate</code>, <code>cartAddressDataBeforeSave</code>, <code>addressSchema</code></td></tr>
    <tr><td><code>@components/common/locale/*</code></td><td>deleted; <code>LANGUAGES</code> → <code>@evershop/evershop/lib/locale/languages</code></td></tr>
  </tbody>
</table>

**Shipping provider and carrier extensions.** Map by token through `toIntegrationAddressFromRow` instead of reading columns. The same function serves the cart's shipping address, the country/region/postal-code estimate (empty street and city, add your own placeholders) and the store origin:

```ts
import type { Address } from '@evershop/evershop/types/address';
import { toIntegrationAddressFromRow } from '@evershop/evershop/lib/address';

export async function toCarrierPayload(a: Address) {
  const i = await toIntegrationAddressFromRow(a, 'en');
  const area = i.administrativeArea;
  return {
    // composed from given/family name when the store splits names
    name: i.recipient || 'Customer',
    company: i.organization,
    street1: i.lines[0] ?? '',
    street2: i.lines[1],
    // the ward / district, where a country has one
    street3: [...i.lines.slice(2), i.dependentLocality].filter(Boolean).join(', ') || undefined,
    city: i.locality ?? '',
    // `US-CA` → `CA`; a name key such as `Kowloon` passes through
    state: area ? area.isoSuffix ?? area.key : '',
    zip: i.postalCode ?? '',
    country: i.country,
    phone: i.telephone
  };
}
```

At label time the `CarrierAddress` core hands you is already mapped: add `company` and `dependentLocality` to your payload and keep stripping the ISO prefix from `province`, which carries the stored region key. The store's weight unit is the `weightUnit` setting (`getSetting('weightUnit', 'kg')`), no longer a config key.

### Themes

Area ids `customerAddressForm`, `checkoutShippingAddressForm`, `checkoutBillingAddressForm` became `addressForm.account | shipping | billing`, each field has `addressField.<id>`, and `addressSummary` is unchanged. Forks of `addressForm/AddressForm.tsx`, `NameAndTelephone.tsx`, `ProvinceAndPostcode.tsx` and `AddressSummary.jsx` are dead files; a fork of `addressForm/Index.tsx` still wins the alias chain and must adopt `AddressRendererProps`, otherwise it renders the old field names and fails at submit with `unknown_field`. The country select is now first and the collected fields change per country.

### Events and merchants

`customer_address_*` and `order_placed` payloads carry the renamed row keys. Every open cart re-quotes shipping once; zones or tax rates keyed on a retired region key stop matching new addresses and are flagged in the admin; the eight address settings take their code defaults until the merchant changes them (Settings → Customer → Addresses, and Sell to countries on Settings → Shipping).

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
