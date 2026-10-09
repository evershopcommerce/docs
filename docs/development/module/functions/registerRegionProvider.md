---
sidebar_position: 84
keywords:
- registerRegionProvider
- address
- regions
- provinces
- wards
groups:
- address
sidebar_label: registerRegionProvider
title: registerRegionProvider
description: Provide the selectable regions (states, cities, wards) of a country.
---

# registerRegionProvider

Registers the **region provider** of a country: which levels below the country are enumerated (`administrative_area`, `locality`, `dependent_locality`) and the regions at each level. Enumerated levels become `select` fields in the storefront form, their keys are what addresses store, and every display path resolves names through the same provider.

## Import

```typescript
import { registerRegionProvider } from '@evershop/evershop/lib/address';
```

## Syntax

```typescript
registerRegionProvider(country: string, provider: RegionProvider): void
```

### Parameters

**`country`** — ISO 3166-1 alpha-2 code.

**`provider`**

```typescript
interface RegionProvider {
  /** Levels this country enumerates, outermost first. Empty = all levels are free text. */
  levels: AddressLevel[];                     // 'administrative_area' | 'locality' | 'dependent_locality'
  /** Children of `parentPath` (keys of the outer levels). `[]` returns the top level. */
  list(parentPath: string[], locale?: string): Region[] | Promise<Region[]>;
}

interface Region {
  key: string;          // What is stored: a code where the country uses codes (US-CA), a name elsewhere (Kowloon)
  name: string;         // Native name
  latinName?: string;   // Shown to readers of another language, when present
  isoCode?: string;     // Full ISO 3166-2 code when one exists
  retired?: boolean;    // Hidden from selection, still resolvable by name
  mergedInto?: string;  // For a retired region: its successor's key (admin warnings)
}
```

## Return Value

Returns `void`. Throws after bootstrap, or when the provider has no `levels` array or `list` function. Registering a country again replaces its provider.

## Examples

### Add a ward level under core's provinces (the `address-vn` package)

```typescript
import { getRegionProvider, registerRegionProvider } from '@evershop/evershop/lib/address';
import { WARDS } from './data/wards.js';

export default () => {
  const provinces = getRegionProvider('VN'); // core's 34 provinces + retired codes
  registerRegionProvider('VN', {
    levels: ['administrative_area', 'dependent_locality'],
    list: (parentPath, locale) => {
      if (parentPath.length === 0) return provinces.list([], locale);
      if (parentPath.length === 1) return WARDS[parentPath[0]] ?? [];
      return [];
    }
  });
};
```

### Names in the reader's language

```typescript
registerRegionProvider('JP', {
  levels: ['administrative_area'],
  list: (_parentPath, locale) =>
    PREFECTURES.map((p) => ({ key: p.iso, name: p.ja, latinName: p.en, isoCode: p.iso }))
});
```

## Notes

- **Keys are append-only.** A refreshed list may add entries or mark one `retired`; it must never remove or rename a key, because stored addresses, shipping zones and tax rates hold the key and `resolveRegionName` must keep naming it.
- Writes accept **active** keys only (`region_invalid` otherwise); the storefront shows a stored retired key as "no longer available" until the customer picks again.
- `dependsOn` in the derived schema follows `levels` order: the form loads the next level with `regions(country, parentPath)` after the parent is chosen.
- `list` may be async (a database or an API), but it runs on every schema resolution and name lookup — cache inside the provider.

## See Also

- [patchAddressFormat](/docs/development/module/functions/patchAddressFormat) - Add the token the level is printed with
- [Address formats](/docs/development/knowledge-base/address-formats#region-providers) - The default provider and the key rules
