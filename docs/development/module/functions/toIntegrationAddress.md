---
sidebar_position: 88
keywords:
- toIntegrationAddress
- address
- integration
- carrier
- paypal
- stripe
groups:
- address
sidebar_label: toIntegrationAddress
title: toIntegrationAddress
description: Map a stored address to the consumer-neutral shape payment and carrier integrations build their payloads from.
---

# toIntegrationAddress

Maps a stored address row to a **consumer-neutral integration shape**: names resolved (region keys become names, the ISO suffix is kept for consumers that want `CA` rather than `US-CA`), street lines collected, the recipient composed from split names when the row has only parts. PayPal, Stripe, carriers and the tax lookup build their payloads from this shape instead of naming address columns — a package that changes a country's format therefore reaches every integration at once.

## Import

```typescript
import { toIntegrationAddress, toIntegrationAddressFromRow } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
await toIntegrationAddressFromRow(row: AddressRow, locale?: string): Promise<IntegrationAddress>

toIntegrationAddress(row: AddressRow, names: ResolvedNames, nameOrder?: 'given_first' | 'family_first'): IntegrationAddress
```

Use `toIntegrationAddressFromRow` in server code — it resolves the region names through the country's provider. The synchronous `toIntegrationAddress` is for callers that already hold the names.

## Return Value

```typescript
interface IntegrationAddress {
  recipient: string;                  // Stored recipient, or composed from the parts in nameOrder
  givenName?: string;                 // Passed through when the row has them; never invented
  familyName?: string;
  organization?: string;
  lines: string[];                    // Non-empty street lines, in order
  dependentLocality?: string;         // Resolved name (ward / neighbourhood)
  locality?: string;                  // Resolved name
  administrativeArea?: { key: string; name: string; isoSuffix?: string };   // US-CA → { key: 'US-CA', name: 'California', isoSuffix: 'CA' }
  postalCode?: string;
  sortingCode?: string;
  country: string;                    // ISO 3166-1 alpha-2
  telephone?: string;
}
```

## Examples

### A carrier payload

```typescript
import { toIntegrationAddressFromRow } from '@evershop/evershop/lib/address';

const a = await toIntegrationAddressFromRow(orderAddressRow);
const shipTo = {
  fullName: a.recipient,
  company: a.organization,
  address1: a.lines[0] ?? '',
  address2: a.lines.slice(1).join(', ') || undefined,
  dependentLocality: a.dependentLocality,
  city: a.locality ?? '',
  province: a.administrativeArea?.isoSuffix ?? a.administrativeArea?.key,
  postcode: a.postalCode ?? '',
  country: a.country,
  phone: a.telephone
};
```

### PayPal's `admin_area_1`

```typescript
const a = await toIntegrationAddressFromRow(row);
const paypal = {
  address_line_1: a.lines[0],
  address_line_2: a.lines.slice(1).join(', ') || undefined,
  admin_area_2: a.locality,
  admin_area_1: a.administrativeArea?.isoSuffix ?? a.administrativeArea?.key,
  postal_code: a.postalCode,
  country_code: a.country
};
```

## Notes

- Integration DTOs keep **their** field names (`CarrierAddress.company`, PayPal's `admin_area_1`); only the source of the values changed. Core's own carrier mapper now fills `company` and `dependentLocality`.
- A consumer that needs two name fields and has only `recipient` calls `splitNameFallback(recipient, nameOrder)` itself and owns that lossy decision — this function never guesses.
- The Stripe client maps from the typed GraphQL fields in the browser instead (`administrativeArea.isoCode`), with the same rules.

## See Also

- [formatAddress](/docs/development/module/functions/formatAddress) - Display lines rather than fields
- [Carrier Development](/docs/development/knowledge-base/carrier-development) - The `CarrierAddress` shape
- [Address formats](/docs/development/knowledge-base/address-formats#integrations) - Which integration reads what
