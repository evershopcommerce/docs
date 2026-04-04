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
import { refreshSetting } from '@evershop/evershop/setting/services';

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
  getStorePostalCode
} from '@evershop/evershop/setting/services';
```

| Function | Default | Returns |
|----------|---------|---------|
| `getStoreName(default?)` | `'Evershop'` | Store display name |
| `getStoreDescription()` | `null` | Store description |
| `getStoreEmail()` | `null` | Store contact email |
| `getStorePhoneNumber()` | `null` | Store phone number |
| `getStoreCountry()` | `null` | Store country (ISO code) |
| `getStoreProvince()` | `null` | Store province/state |
| `getStoreCity()` | `null` | Store city |
| `getStoreAddress()` | `null` | Store street address |
| `getStorePostalCode()` | `null` | Store postal/zip code |

## Examples

```typescript
import { getStoreName, getStoreEmail } from '@evershop/evershop/setting/services';

const storeName = await getStoreName();        // 'My Shop'
const storeEmail = await getStoreEmail();      // 'contact@myshop.com'
```

## See Also

- [getSetting](/docs/development/module/functions/getSetting) — Get any setting by name
