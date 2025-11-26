---
sidebar_position: 73
keywords:
- getCustomersBaseQuery
- customer
- query
groups:
- customer
sidebar_label: getCustomersBaseQuery
title: getCustomersBaseQuery
description: Get base query for customers table.
---

# getCustomersBaseQuery

Get a base SELECT query for the customers table.

## Import

```typescript
import { getCustomersBaseQuery } from "@evershop/evershop/customer/services";
```

## Syntax

```typescript
getCustomersBaseQuery(): SelectQuery
```

## Return Value

Returns `SelectQuery` object for `customer` table.

## Examples

### Basic Query

```typescript
import { getCustomersBaseQuery } from "@evershop/evershop/customer/services";

const query = getCustomersBaseQuery();
const customers = await query.execute(pool);
```

## See Also

- [select](/docs/development/module/functions/select) - Query builder
- [createCustomer](/docs/development/module/functions/createCustomer) - Create customer
- [updateCustomer](/docs/development/module/functions/updateCustomer) - Update customer
