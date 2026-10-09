---
sidebar_position: 52
title: Address Form
description: The schema-driven address form used by the address book, the shipping step and the billing step, and the four ways a theme customizes it.
keywords:
  - address form
  - AddressFields
  - AddressRendererProps
  - MasterField
  - checkout address
groups:
  - address
---

# Address Form

The storefront collects every address through one component, rendered from the **address schema** of the chosen country (`addressSchema(country, locale, surface)`): the country select first, then the country's fields in the record's row order, geographic levels as selects that load their options when the parent is chosen. The same component serves three surfaces.

<table className="table-auto not-prose">
  <thead>
    <tr><th>Surface</th><th>Used by</th><th><code>namePrefix</code></th><th>Countries offered</th></tr>
  </thead>
  <tbody>
    <tr><td><code>account</code></td><td>the address book (<code>MyAddresses</code>)</td><td><code>''</code></td><td><code>countries(scope: SELL_TO)</code></td></tr>
    <tr><td><code>shipping</code></td><td>the checkout shipping step (<code>Shipment</code>)</td><td><code>shippingAddress</code></td><td><code>countries(scope: SHIPPING)</code> — sell-to ∩ zone countries</td></tr>
    <tr><td><code>billing</code></td><td>the checkout billing step (<code>BillingAddress</code>)</td><td><code>billingAddress</code></td><td><code>countries(scope: SELL_TO)</code></td></tr>
  </tbody>
</table>

## Usage

```tsx
import CustomerAddressForm from '@components/frontStore/customer/address/addressForm/Index';

// Inside a react-hook-form <Form> (or a FormProvider)
<CustomerAddressForm surface="shipping" namePrefix="shippingAddress" address={cart.shippingAddress} />
```

<table className="table-auto not-prose">
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>surface</code></td><td><code>'account' | 'shipping' | 'billing'</code></td><td>Which form. Picks the country scope and the Area id suffix. Default <code>account</code>.</td></tr>
    <tr><td><code>namePrefix</code></td><td><code>string</code></td><td>Field-name prefix in the form: <code>shippingAddress.locality</code>, or <code>locality</code> when empty. Default <code>''</code>.</td></tr>
    <tr><td><code>address</code></td><td><code>AddressGraphql | null</code></td><td>A stored address to edit (the GraphQL shape with <code>formatted</code>). Omit for a new address; the store's default country is then pre-selected.</td></tr>
    <tr><td><code>countryScope</code></td><td><code>'SHIPPING' | 'SELL_TO' | 'ALL'</code></td><td>Override the scope the surface implies.</td></tr>
  </tbody>
</table>

The container fetches the countries for the scope and the schema for the current country, keeps the last schema mounted while the next loads, and hands everything to the renderer. The field values submit as the shared address columns (`recipient`, `address_line_1`, `locality`, `administrative_area`, `postal_code`, `country`, `telephone`, …) plus registered extra fields.

## Behavior

- **Country first, then the country's fields.** Hong Kong shows an area select and no postal code; Germany no administrative area; the United States a state select and a ZIP code with its pattern.
- **One country offered, no select.** When the surface offers exactly one country (a sell-to list of one, or a single zone country for shipping) the country renders as a read-only line with that value, still inside `addressField.country`, and the schema fetched is already that country's.
- **Lazy regions.** An enumerated level fetches `regions(country, parentPath)` when its parent has a value and is disabled until then. A stored key the data has retired is listed as "no longer available" until the customer picks again.
- **Country swap.** Changing the country clears a field only when it is absent from the new schema or its type, option source or pattern changed; everything else is kept. Region selects always clear, because their keys are country-scoped.
- **Validation.** `required` and `pattern` come from the schema and run in the browser; region keys and cross-field rules run on the server, whose `error.errors[]` land on the inputs through `form.setError`.
- **Live preview.** The lines the server will print (`formatted`) are shown under the fields with the same `formatAddress` the server uses.
- **Server rendering.** The form renders its loading skeleton on the server; the first client render matches it, then the schema arrives.

## Customizing it — four seams, cheapest first

### 1. CSS

`.address-fields__grid` (a 12-column grid), `.address-fields__field[data-row][data-field]` per field, `.address-preview`.

### 2. Areas

<table className="table-auto not-prose">
  <thead>
    <tr><th>Area id</th><th>Contains</th><th>Core sort orders</th></tr>
  </thead>
  <tbody>
    <tr><td><code>addressForm.account</code>, <code>addressForm.shipping</code>, <code>addressForm.billing</code></td><td>the whole block for one surface</td><td><code>addressFields</code> 10, <code>addressPreview</code> 20</td></tr>
    <tr><td><code>addressField.&lt;id&gt;</code> (e.g. <code>addressField.telephone</code>)</td><td>one field</td><td>the core renderer at 10 — register at 5 to put something above it, 15 below</td></tr>
  </tbody>
</table>

```tsx
// themes/<id>/src/pages/frontStore/checkout/TelephoneHint.tsx
export default function TelephoneHint() {
  return <p className="text-xs text-muted-foreground">{_('We only call about your delivery')}</p>;
}
export const layout = { areaId: 'addressField.telephone', sortOrder: 15 };
```

Area injections are registered per route, so the same decoration on all three surfaces is registered on each route.

### 3. The renderer map

`components/frontStore/customer/address/addressFieldRenderers.tsx` maps a field `type` to a component: `text` → `InputField`, `select` → `SelectField`, `tel` → `TelField`, `textarea` → `TextareaField`, `number` → `NumberField`, `email` → `EmailField`. Shadow the file in your theme to replace one renderer — a dial-code telephone widget replaces `tel` and keeps the schema's validation:

```tsx
// themes/<id>/src/components/frontStore/customer/address/addressFieldRenderers.tsx
export { TextRenderer, SelectRenderer, TextareaRenderer, NumberRenderer, EmailRenderer, FallbackRenderer, getAddressFieldRenderer } from '@evershop/evershop/components/frontStore/customer/address/addressFieldRenderers';
export const addressFieldRenderers = { ...core, tel: MyDialCodeTelField };
```

Every renderer receives `AddressFieldProps`: `field` (the schema field), `name` (prefixed), `label` (translated), `required`, `placeholder`, `rules` (react-hook-form rules from `required` and `pattern`), `defaultValue`, and for selects `options`, `disabled`, `onChange`. An unknown `type` falls back to a text input and warns once in the console.

### 4. A different layout

Shadow `components/frontStore/customer/address/AddressFields.tsx` and implement `AddressRendererProps` — the public contract:

```ts
interface AddressRendererProps {
  schema: ResolvedAddressSchema;      // fields in order, with row, type, labelType, required, pattern, optionSource, dependsOn
  namePrefix: string;                 // '', 'shippingAddress', 'billingAddress'
  surface: 'account' | 'shipping' | 'billing';
  countries: { value: string; label: string }[];
  initialValues?: Record<string, string>;   // a stored address by field id
  onCountryChange?: (country: string) => void;
}
```

Use `rulesFor(field, label)` for the react-hook-form rules, `useRegions(country, parentPath)` for region options and the helpers in `addressFormLogic.ts` (`fieldName`, `rowsOf`, `countrySwapPlan`); the container keeps doing the schema fetching, the country query and the error mapping. A minimal renderer that submits is in core's `rendererContract.test.tsx`.

## Related

- [Address Summary](./AddressSummary) — prints a saved address
- [Cart Context](./CartContext) — `addShippingAddress`, `fetchAvailableShippingMethods`
- [Address Formats](../../knowledge-base/address-formats) — where the schema comes from
