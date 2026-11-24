---
slug: request.logincustomer
sidebar_position: 142
keywords:
- loginCustomer
- authentication
- login
- social login
- customer
- session
groups:
- authentication
sidebar_label: request.loginCustomer
title: request.loginCustomer
description: Sign in a customer without a password, for a social login or another trusted identity check.
---

# request.loginCustomer

Signs in a customer without a password. Use it in an extension that has already confirmed who the customer is some other way, such as a social login (Google, GitHub) after the provider returned a verified email. This function is available on the Express request object.

For a sign-in with email and password, use [request.loginCustomerWithEmail](/docs/development/module/functions/request.logincustomerwithemail). Both leave the same state: the customer id in the session, and the customer (without the password) in `request.locals.customer`.

## Syntax

```typescript
request.loginCustomer(
  customerId: number,
  callback?: (err: Error | null) => void
): Promise<void>
```

### Parameters

**`customerId`**

**Type:** `number`

The `customer_id` of the account to sign in.

**`callback`**

**Type:** `(err: Error | null) => void` (optional)

Called after the session is saved. On a request without a session (an API route), it is called at once with `null`.

## Return Value

Returns `Promise<void>`. It rejects with `The customer does not exist or is disabled` when there is no active account (status 1) with that id. The session is then left as it was.

## Example: a social login callback

```typescript title="extensions/github_login/src/pages/frontStore/githubCallback/githubCallback.ts"
import {
  createCustomer,
  getCustomerByEmail
} from '@evershop/evershop/customer/services';
import { EvershopRequest } from '@evershop/evershop/types/request';
import { EvershopResponse } from '@evershop/evershop/types/response';
import { getVerifiedEmail } from '../../../services/github.js';

export default async (request: EvershopRequest, response: EvershopResponse) => {
  try {
    // Your provider code: exchange the code and read a VERIFIED email
    const { email, name } = await getVerifiedEmail(request.query.code as string);

    let customer = await getCustomerByEmail(email);
    if (customer && customer.status !== 1) {
      throw new Error('This account is disabled');
    }
    if (!customer) {
      // No password: a social account has none. The customer can set one
      // later with "Forgot your password?".
      customer = await createCustomer(
        { email, full_name: name },
        { allowNoPassword: true }
      );
    }
    await request.loginCustomer(customer.customer_id, (error) => {
      response.redirect(error ? '/account/login' : '/');
    });
  } catch (e) {
    response.redirect('/account/login');
  }
};
```

## Social login checklist

- **Only accept a verified email.** Check the provider's flag (Google returns `verified_email`; for GitHub, read `/user/emails` and take the primary address marked `verified`). An unverified address lets someone take an email they don't own.
- **Look the customer up with [getCustomerByEmail](/docs/development/module/functions/getcustomerbyemail)**, not `where('email', '=', ...)`. EverShop treats `Jane@x.com` and `jane@x.com` as one account.
- **Decide what to do when the email already has a password account.** Signing that customer in links the two. Refusing is the safe default unless the provider's email is verified and your extension says so to the customer.
- **Create the account with `allowNoPassword: true`**, not a made-up password. A made-up password must pass the store's password rules, which a store can make stricter.
- **For a headless storefront**, return tokens with [issueCustomerTokens](/docs/development/module/functions/issuecustomertokens) instead of a session.

## Hooks

`loginCustomer` can be hooked like the other request methods. The hook receives `(result, customerId)`:

```typescript
import { hookAfter } from '@evershop/evershop/lib/util/hookable';

hookAfter('loginCustomer', (result, customerId) => {
  // A customer signed in without a password
});
```

## See Also

- [request.loginCustomerWithEmail](/docs/development/module/functions/request.logincustomerwithemail) - Sign in with email and password
- [getCustomerByEmail](/docs/development/module/functions/getcustomerbyemail) - Find a customer by email
- [issueCustomerTokens](/docs/development/module/functions/issuecustomertokens) - Tokens for a headless storefront
- [request.logoutCustomer](/docs/development/module/functions/request.logoutcustomer) - Sign out
