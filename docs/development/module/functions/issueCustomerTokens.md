---
slug: issuecustomertokens
sidebar_position: 144
keywords:
- issueCustomerTokens
- authentication
- JWT
- token
- headless
- social login
groups:
- authentication
sidebar_label: issueCustomerTokens
title: issueCustomerTokens
description: Issue access and refresh tokens for a customer, for a social login on a headless storefront.
---

# issueCustomerTokens

Returns the access and refresh tokens that `POST /api/customer/tokens` returns after a password check, for a customer your extension has identified another way, such as a social login on a headless storefront.

## Import

```typescript
import { issueCustomerTokens } from '@evershop/evershop/customer/services';
```

## Syntax

```typescript
issueCustomerTokens(customerId: number): Promise<{
  accessToken: string;
  refreshToken: string;
}>
```

### Parameters

**`customerId`**

**Type:** `number`

The `customer_id` of the account.

## Return Value

The two tokens, signed with `JWT_CUSTOMER_SECRET` and `JWT_CUSTOMER_REFRESH_SECRET`. They carry the same customer payload as the password flow, never the password. The client uses them the same way (`Authorization: Bearer <accessToken>`, and `POST /api/customer/token/refresh` with the refresh token).

It rejects with `The customer does not exist or is disabled` when there is no active account (status 1) with that id.

## Example

```typescript
import {
  getCustomerByEmail,
  issueCustomerTokens
} from '@evershop/evershop/customer/services';

// After your provider returned a verified email
const customer = await getCustomerByEmail(verifiedEmail);
if (!customer || customer.status !== 1) {
  response.status(401).json({ error: { message: 'Sign-in failed' } });
  return;
}
response.json({ data: await issueCustomerTokens(customer.customer_id) });
```

Follow the [social login checklist](/docs/development/module/functions/request.logincustomer#social-login-checklist) before you issue tokens.

## See Also

- [request.loginCustomer](/docs/development/module/functions/request.logincustomer) - Sign in with a session
- [getCustomerByEmail](/docs/development/module/functions/getcustomerbyemail) - Find a customer by email
