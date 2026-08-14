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

<Api
method="POST"
url="/api/customers/me/addresses"
requestSchema={{
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string"
    },
    "telephone": {
      "type": "string"
    },
    "address_1": {
      "type": "string"
    },
    "address_2": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "province": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "postcode": {
      "type": "string"
    },
    "is_default": {
      "type": "boolean"
    }
  },
  "required": [
    "full_name",
    "address_1",
    "province",
    "country",
    "postcode"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    "customer_id": 21,
    "full_name": "John Smith",
    "telephone": "+1 555 0100",
    "address_1": "123 Main St",
    "address_2": null,
    "postcode": "10001",
    "city": "New York",
    "province": "US-NY",
    "country": "US",
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

A partial patch is safe: the service merges your fields over the stored row and validates the **merged** address, so sending only `city` does not trip the "Full name is required" rule. Setting `is_default` to `true` here also clears the flag on the customer's other addresses.

<Api
method="PATCH"
url="/api/customers/me/addresses/a1b2c3d4-e5f6-4890-abcd-ef1234567890"
requestSchema={{
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string"
    },
    "telephone": {
      "type": "string"
    },
    "address_1": {
      "type": "string"
    },
    "address_2": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "province": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "postcode": {
      "type": "string"
    },
    "is_default": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
    "customer_id": 21,
    "full_name": "John A. Smith",
    "telephone": "+1 555 0100",
    "address_1": "456 Oak Ave",
    "address_2": null,
    "postcode": "10001",
    "city": "New York",
    "province": "US-NY",
    "country": "US",
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
    "full_name": "John A. Smith",
    "telephone": "+1 555 0100",
    "address_1": "456 Oak Ave",
    "address_2": null,
    "postcode": "10001",
    "city": "New York",
    "province": "US-NY",
    "country": "US",
    "is_default": true,
    "created_at": "2025-02-07T14:18:05.000Z",
    "updated_at": "2025-02-07T15:02:19.000Z"
  }
}`}
isPrivate={false}
/>

<hr />

## Address Validation

The three address endpoints have **no** `payloadSchema.json`. Nothing is validated by AJV at the router level — validation happens inside the `createCustomerAddress` / `updateCustomerAddress` services, driven by the shared `addressValidator` rule set:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Rule</th>
      <th className="text-left">Message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>full_name</code> present and not blank</td>
      <td>Full name is required</td>
    </tr>
    <tr>
      <td><code>address_1</code> present and not blank</td>
      <td>Address is required</td>
    </tr>
    <tr>
      <td><code>province</code> present and not blank</td>
      <td>Province is required</td>
    </tr>
    <tr>
      <td><code>country</code> present and not blank</td>
      <td>Country is required</td>
    </tr>
    <tr>
      <td><code>postcode</code> present and not blank</td>
      <td>Postcode is required</td>
    </tr>
  </tbody>
</table>

Extensions add to this list from `bootstrap.ts` with `addAddressValidationRule(...)`, so a live store may enforce more than the five rules above.

:::caution Validation failures come back as `500`, not `400`
A failed address rule is thrown by the service and caught by the generic `catch` in the handler, which answers `500` with the joined rule messages as the error text (for example `Full name is required, Postcode is required`). Only the ownership and authentication checks produce `400` / `401`. Treat a `500` from these endpoints as "possibly your payload" rather than "the server is broken".
:::

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
