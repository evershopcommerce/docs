---
sidebar_position: 27
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Customer Self Service
  - Customer Account
  - My Account
  - Customer Token
  - REST API
sidebar_label: Customer Self Service
title: Customer Self Service REST API
description: Use the EverShop REST API as a logged-in customer to update your own profile and manage your own address book, without an admin token.
---

import Api from '@site/src/components/rest/Api';

# Customer Self Service API

## Overview

Every endpoint on this page acts on **the customer making the request**. There is no customer id anywhere in the URL — the account is resolved from the credential attached to the request and nothing else. That is the single difference that matters between this page and the admin endpoints in the [Customer API](/docs/api/customer), which name their target in the path (`/api/customers/:customer_id/...`) and require an admin token.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left"></th>
      <th className="text-left">Self service (this page)</th>
      <th className="text-left">Admin (<code>customer.md</code>)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Path</b></td>
      <td><code>/api/customers/me/...</code></td>
      <td><code>/api/customers/:customer_id/...</code></td>
    </tr>
    <tr>
      <td><b>route.json access</b></td>
      <td><code>public</code></td>
      <td><code>private</code></td>
    </tr>
    <tr>
      <td><b>Credential</b></td>
      <td>Customer JWT or storefront session cookie</td>
      <td>Admin JWT or admin session cookie</td>
    </tr>
    <tr>
      <td><b>Who is edited</b></td>
      <td>Only the caller</td>
      <td>Any customer named in the path</td>
    </tr>
    <tr>
      <td><b>Protected fields</b></td>
      <td>Stripped from the payload before the write</td>
      <td>Writable</td>
    </tr>
  </tbody>
</table>

:::caution `access: "public"` does not mean unauthenticated
The `public` flag in `route.json` only tells the global **admin** auth middleware to stand down. Each handler then calls `request.getCurrentCustomer()` itself and answers `401` when there is no customer. A request with no credential is rejected — it is just rejected by the handler rather than by the router.
:::

## Authentication

Two credentials are accepted, checked in this order by the customer module's global middleware:

1. **Customer JWT** — `Authorization: Bearer <token>`, where the token was issued by `POST /api/customer/tokens` (see the [Authentication API](/docs/api/authentication)). The middleware decodes the token first and ignores it unless its `tokenType` is `customer`, so an admin token falls through and leaves the request anonymous here.
2. **Storefront session cookie** — the signed session cookie written when a customer logs in through the storefront. Its name comes from `system.session.cookieName` and defaults to `sid`. The session row is read straight from the database and the customer must still have `status = 1`.

Whichever path matched, the resolved account is what `getCurrentCustomer()` returns, and the handlers never read a customer id from the URL or the request body.

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer JWT>" \
  --data-raw '{"full_name":"John A. Smith"}' \
  https://<your domain>/api/customers/me
```

## Endpoints

### Update My Profile

Updates the calling customer's own record. Send only the fields you want to change.

The payload schema declares `full_name` and `email` but sets `additionalProperties: true`, so extension columns flow through untouched. Three fields are deleted from the body before the write no matter what you send:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Stripped field</th>
      <th className="text-left">Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>password</code></td>
      <td>Changing it goes through <code>POST /api/customers/password</code>, which verifies a reset token.</td>
    </tr>
    <tr>
      <td><code>group_id</code></td>
      <td>Self-promotion into another customer or pricing group.</td>
    </tr>
    <tr>
      <td><code>status</code></td>
      <td>Re-activating a disabled account.</td>
    </tr>
  </tbody>
</table>

If those are the only fields you sent, the request fails with `400` and `There is nothing to update`. Changing `email` to an address already owned by another customer fails with `400` and `Email is already used`.

<Api
method="PATCH"
url="/api/customers/me"
requestSchema={{
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Full name must be a string",
        "minLength": "Full name cannot be empty"
      }
    },
    "email": {
      "type": "string",
      "format": "email",
      "errorMessage": {
        "type": "Email must be a string",
        "format": "Email must be a valid email address (e.g., user@example.com)"
      }
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_id": 21,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "status": 1,
    "group_id": 1,
    "email": "john.smith@example.com",
    "full_name": "John A. Smith",
    "created_at": "2025-02-07T14:18:05.000Z",
    "updated_at": "2025-02-07T14:22:41.000Z",
    "links": [
      {
        "rel": "self",
        "href": "/api/customers/me",
        "action": "PATCH",
        "types": [
          "application/json"
        ]
      }
    ]
  }
}`}
isPrivate={false}
/>

The `password` column is removed from the returned row.

<hr />

### Create My Address

Adds an address to the calling customer's address book. `customer_id` is taken from the authenticated context; `customer_id`, `customer_address_id`, `uuid` and `address_id` are deleted from the body before the insert, so an attacker cannot graft an address onto another account.

Setting `is_default` to `true` clears the flag on every other address belonging to the same customer, in the same transaction.

The body uses the shared address vocabulary (the same column names as cart and order addresses). Which fields are required depends on the country — see [Address Validation](#address-validation) below.

<Api
method="POST"
url="/api/customers/me/addresses"
requestSchema={{
  "type": "object",
  "properties": {
    "recipient": { "type": ["string", "null"], "description": "Full name of the recipient (single name field)" },
    "given_name": { "type": ["string", "null"], "description": "Given name, when the store collects split names" },
    "family_name": { "type": ["string", "null"], "description": "Family name, when the store collects split names" },
    "organization": { "type": ["string", "null"], "description": "Company" },
    "address_line_1": { "type": ["string", "null"] },
    "address_line_2": { "type": ["string", "null"] },
    "address_line_3": { "type": ["string", "null"], "description": "Only when the store enables a third line" },
    "dependent_locality": { "type": ["string", "null"], "description": "Ward or neighbourhood; a region key where the country enumerates the level" },
    "locality": { "type": ["string", "null"], "description": "City; a region key where enumerated, free text elsewhere" },
    "administrative_area": { "type": ["string", "null"], "description": "State or province as a region key, for example US-CA" },
    "postal_code": { "type": ["string", "null"] },
    "sorting_code": { "type": ["string", "null"] },
    "country": { "type": "string", "minLength": 2, "maxLength": 2, "description": "ISO 3166-1 alpha-2. The only key the payload schema requires" },
    "telephone": { "type": ["string", "null"], "description": "Normalized to E.164 with the country's dial code" },
    "extra": { "type": ["object", "null"], "description": "Registered extra fields by id (top-level extra keys are folded in)" },
    "is_default": { "type": ["boolean", "number", "string", "null"] }
  },
  "required": [
    "country"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    "customer_id": 21,
    "recipient": "John Smith",
    "given_name": null,
    "family_name": null,
    "organization": null,
    "address_line_1": "123 Main St",
    "address_line_2": null,
    "address_line_3": null,
    "dependent_locality": null,
    "locality": "New York",
    "administrative_area": "US-NY",
    "postal_code": "10001",
    "sorting_code": null,
    "country": "US",
    "telephone": "+15550100",
    "extra": {},
    "is_default": true,
    "created_at": "2025-02-07T14:18:05.000Z",
    "updated_at": "2025-02-07T14:18:05.000Z",
    "links": [
      {
        "rel": "edit",
        "href": "/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890",
        "action": "UPDATE",
        "types": [
          "application/json"
        ]
      },
      {
        "rel": "delete",
        "href": "/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890",
        "action": "DELETE",
        "types": [
          "application/json"
        ]
      }
    ]
  }
}`}
isPrivate={false}
/>

:::info `action: "UPDATE"` is not a typo you should copy
The `edit` link reports `"action": "UPDATE"`. The endpoint is a `PATCH`. Follow the `href`, not the `action`.
:::

<hr />

### Update My Address

Updates one address that belongs to the calling customer. `{address_id}` is the address **uuid**.

The handler loads the row with `uuid = {address_id} AND customer_id = <current customer>` before writing anything. An address that exists but belongs to someone else is indistinguishable from one that does not exist: both answer `400` with `Invalid address`. The same four ownership columns (`customer_id`, `customer_address_id`, `uuid`, `address_id`) are stripped from the body.

A partial patch is safe: the service merges your fields over the stored row and validates the **merged** address against the country's schema, so sending only `locality` does not trip a required-field rule. Country-scoped extra fields of the stored row survive a patch that omits `country`. Setting `is_default` to `true` here also clears the flag on the customer's other addresses.

<Api
method="PATCH"
url="/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890"
requestSchema={{
  "type": "object",
  "properties": {
    "recipient": { "type": ["string", "null"], "description": "Full name of the recipient (single name field)" },
    "given_name": { "type": ["string", "null"], "description": "Given name, when the store collects split names" },
    "family_name": { "type": ["string", "null"], "description": "Family name, when the store collects split names" },
    "organization": { "type": ["string", "null"], "description": "Company" },
    "address_line_1": { "type": ["string", "null"] },
    "address_line_2": { "type": ["string", "null"] },
    "address_line_3": { "type": ["string", "null"], "description": "Only when the store enables a third line" },
    "dependent_locality": { "type": ["string", "null"], "description": "Ward or neighbourhood; a region key where the country enumerates the level" },
    "locality": { "type": ["string", "null"], "description": "City; a region key where enumerated, free text elsewhere" },
    "administrative_area": { "type": ["string", "null"], "description": "State or province as a region key, for example US-CA" },
    "postal_code": { "type": ["string", "null"] },
    "sorting_code": { "type": ["string", "null"] },
    "country": { "type": "string", "minLength": 2, "maxLength": 2, "description": "ISO 3166-1 alpha-2. The only key the payload schema requires" },
    "telephone": { "type": ["string", "null"], "description": "Normalized to E.164 with the country's dial code" },
    "extra": { "type": ["object", "null"], "description": "Registered extra fields by id (top-level extra keys are folded in)" },
    "is_default": { "type": ["boolean", "number", "string", "null"] }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    "customer_id": 21,
    "recipient": "John A. Smith",
    "given_name": null,
    "family_name": null,
    "organization": null,
    "address_line_1": "456 Oak Ave",
    "address_line_2": null,
    "address_line_3": null,
    "dependent_locality": null,
    "locality": "New York",
    "administrative_area": "US-NY",
    "postal_code": "10001",
    "sorting_code": null,
    "country": "US",
    "telephone": "+15550100",
    "extra": {},
    "is_default": true,
    "created_at": "2025-02-07T14:18:05.000Z",
    "updated_at": "2025-02-07T15:02:19.000Z",
    "links": [
      {
        "rel": "edit",
        "href": "/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890",
        "action": "UPDATE",
        "types": [
          "application/json"
        ]
      },
      {
        "rel": "delete",
        "href": "/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890",
        "action": "DELETE",
        "types": [
          "application/json"
        ]
      }
    ]
  }
}`}
isPrivate={false}
/>

<hr />

### Delete My Address

Permanently removes one address that belongs to the calling customer. `{address_id}` is the address **uuid**, and the same ownership check applies. The deleted row is echoed back — with no `links` array, unlike the create and update responses.

<Api
method="DELETE"
url="/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890"
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    "customer_id": 21,
    "recipient": "John A. Smith",
    "given_name": null,
    "family_name": null,
    "organization": null,
    "address_line_1": "456 Oak Ave",
    "address_line_2": null,
    "address_line_3": null,
    "dependent_locality": null,
    "locality": "New York",
    "administrative_area": "US-NY",
    "postal_code": "10001",
    "sorting_code": null,
    "country": "US",
    "telephone": "+15550100",
    "extra": {},
    "is_default": true,
    "created_at": "2025-02-07T14:18:05.000Z",
    "updated_at": "2025-02-07T15:02:19.000Z"
  }
}`}
isPrivate={false}
/>

<hr />

## Address Validation

The payload schemas above only check the shape of the keys and require `country`. Everything else is validated by the `createCustomerAddress` / `updateCustomerAddress` services against the **country's address schema** — the same `addressSchema(country)` the storefront form renders from — after the input has been normalized (trimmed, country upper-cased, telephone converted to E.164 with the country's dial code).

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Check</th>
      <th className="text-left"><code>code</code></th>
      <th className="text-left">Example message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A key that is neither a shared column nor a registered extra field</td>
      <td><code>unknown_field</code></td>
      <td>province is not a known address field</td>
    </tr>
    <tr>
      <td>A field the country requires (or the store requires through the address settings) is empty</td>
      <td><code>required</code></td>
      <td>ZIP code is required</td>
    </tr>
    <tr>
      <td>A value does not match the country's pattern (postal code, telephone, an extra field's pattern)</td>
      <td><code>pattern</code></td>
      <td>ZIP code is not valid</td>
    </tr>
    <tr>
      <td>A region key the country's provider does not list as active, at any enumerated level</td>
      <td><code>region_invalid</code></td>
      <td>State is not a valid region</td>
    </tr>
    <tr>
      <td>A value of the wrong JSON type</td>
      <td><code>type</code></td>
      <td>Company has the wrong type</td>
    </tr>
    <tr>
      <td>A country outside the merchant's sell-to list</td>
      <td><code>country_not_allowed</code></td>
      <td>We do not sell to Narnia</td>
    </tr>
    <tr>
      <td>A rule added by an extension with <code>addAddressValidationRule</code></td>
      <td>the rule's own code</td>
      <td>the rule's own message</td>
    </tr>
  </tbody>
</table>

Messages are translated into the request locale with the field's label interpolated, so a storefront can show them next to the input.

Failures answer `400` with every failing field at once:

```json
{
  "error": {
    "status": 400,
    "message": "Invalid address",
    "errors": [
      { "field": "postal_code", "code": "pattern", "message": "ZIP code is not valid" },
      { "field": "telephone", "code": "required", "message": "Telephone is required" }
    ]
  }
}
```

Extensions add rules from `bootstrap.ts` with [`addAddressValidationRule`](/docs/development/module/functions/addAddressValidationRule); the rules run after the schema checks, with the resolved schema as their second argument. The field vocabulary, region keys and the eight store settings that change what is required are explained in the [Address formats guide](/docs/development/knowledge-base/address-formats).

## Error Responses

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Status</th>
      <th className="text-left">When</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>401</code></td>
      <td>No customer JWT and no valid storefront session. Message: <code>You must be logged in to update your profile</code> or <code>You must be logged in to manage your addresses</code>.</td>
    </tr>
    <tr>
      <td><code>400</code></td>
      <td>Nothing left to update, duplicate email, or an address uuid that is not owned by the caller.</td>
    </tr>
    <tr>
      <td><code>500</code></td>
      <td>Address validation failure, or an unexpected error. The service message is passed through verbatim.</td>
    </tr>
  </tbody>
</table>

All errors use the standard envelope:

```json
{
  "error": {
    "status": 400,
    "message": "Invalid address"
  }
}
```

## Reading Your Own Data

There is no `GET /api/customers/me`. Read the current customer, their address book, and their orders through GraphQL — the storefront schema exposes them on the authenticated `currentCustomer` field. See the [data fetching documentation](/docs/development/knowledge-base/data-fetching).
