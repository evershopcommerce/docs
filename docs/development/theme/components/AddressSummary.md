---
sidebar_position: 53
title: Address Summary
description: Prints a saved address from its server-formatted lines.
keywords:
  - AddressSummary
  - formatted
  - address display
groups:
  - address
---

# Address Summary

Prints an address exactly as the server formats it: the `formatted` lines (the layout of the address's country, region names resolved, country last) followed by the telephone. The address book, the checkout success page and the admin order view all use it, so a package that changes a country's layout changes every surface at once — and no summary names a field anymore (the old component never printed the second street line).

## Usage

```tsx
import { AddressSummary } from '@components/common/customer/address/AddressSummary';

<AddressSummary address={order.shippingAddress} />
```

<table className="table-auto not-prose">
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>address</code></td><td><code>{`{ formatted?: string[]; telephone?: string }`}</code> (any GraphQL address)</td><td>Select <code>formatted</code> and <code>telephone</code> in your query. A missing address renders nothing.</td></tr>
  </tbody>
</table>

```graphql
shippingAddress {
  formatted
  telephone
}
```

## Output

```html
<div class="address__summary">
  <div class="address-lines">
    <div>Chan Tai Man</div>
    <div>1 Nathan Road</div>
    <div>Tsim Sha Tsui</div>
    <div>Kowloon</div>
    <div>Hong Kong SAR China</div>
  </div>
  <div class="telephone">+85291234567</div>
</div>
```

## Customizing it

The component is an Area, `addressSummary`, with two core slots: `formatted` (sort order 10) and `telephone` (60). Register a component into the Area to add a line (a "Deliver to" label at 5, a map link at 70), or shadow `components/common/customer/address/AddressSummary.tsx` in the theme to change the markup. Style with `.address__summary`, `.address-lines`, `.telephone`.

:::caution
Do not reach for `address.addressLine1` or `address.locality.name` to rebuild the lines yourself: the order and the content differ per country and per reader language, and the server already did that work in `formatted`.
:::

## Related

- [Address Form](./AddressForm) — collecting the address
- [formatAddress](../../module/functions/formatAddress) — how the lines are produced
