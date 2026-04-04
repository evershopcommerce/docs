---
sidebar_position: 118
keywords:
  - refreshSetting
  - getStoreName
  - getStoreEmail
  - settings
groups:
  - settings
sidebar_label: refreshSetting
title: Setting Convenience Functions
description: Retrieve and refresh store settings.
---

# Setting Convenience Functions

EverShop provides convenience functions for common store settings. All are imported from `@evershop/evershop/setting/services`.

## refreshSetting

Reload all settings from the database. Call this after programmatically updating settings to ensure the cache is fresh.

```typescript
import { refreshSetting } from "@evershop/evershop/setting/services";

await refreshSetting();
```

## Store Information Functions

These functions read from the `setting` database table (managed via the admin panel). Each returns `Promise<string | null>` (or `Promise<string>` with a default).

```typescript
import {
  getStoreName,
  getStoreDescription,
  getStoreEmail,
  getStorePhoneNumber,
  getStoreCountry,
  getStoreProvince,
  getStoreCity,
  getStoreAddress,
  getStorePostalCode,
} from "@evershop/evershop/setting/services";
```

<table className="not-prose table-auto">
  <thead>
    <tr>
      <th>Function</th>
      <th>Default</th>
      <th>Returns</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`getStoreName(default?)`</td>
      <td>`'Evershop'`</td>
      <td>Store display name</td>
    </tr>
    <tr>
      <td>`getStoreDescription()`</td>
      <td>`null`</td>
      <td>Store description</td>
    </tr>
    <tr>
      <td>`getStoreEmail()`</td>
      <td>`null`</td>
      <td>Store contact email</td>
    </tr>
    <tr>
      <td>`getStorePhoneNumber()`</td>
      <td>`null`</td>
      <td>Store phone number</td>
    </tr>
    <tr>
      <td>`getStoreCountry()`</td>
      <td>`null`</td>
      <td>Store country (ISO code)</td>
    </tr>
    <tr>
      <td>`getStoreProvince()`</td>
      <td>`null`</td>
      <td>Store province/state</td>
    </tr>
    <tr>
      <td>`getStoreCity()`</td>
      <td>`null`</td>
      <td>Store city</td>
    </tr>
    <tr>
      <td>`getStoreAddress()`</td>
      <td>`null`</td>
      <td>Store street address</td>
    </tr>
    <tr>
      <td>`getStorePostalCode()`</td>
      <td>`null`</td>
      <td>Store postal/zip code</td>
    </tr>
  </tbody>
</table>

## Examples

```typescript
import {
  getStoreName,
  getStoreEmail,
} from "@evershop/evershop/setting/services";

const storeName = await getStoreName(); // 'My Shop'
const storeEmail = await getStoreEmail(); // 'contact@myshop.com'
```

## See Also

- [getSetting](/docs/development/module/functions/getSetting) — Get any setting by name
