---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Customer Management
  - User Accounts
  - E-commerce API
  - REST API
sidebar_label: Customer
title: Customer REST API
description: Comprehensive guide to managing customer accounts in EverShop. Learn how to create, update, authenticate, and manage customer profiles using the REST API.
---

# Customer API

## Overview

The Customer API provides endpoints for managing customer accounts in your EverShop store. These endpoints allow you to create and manage customer profiles, handle authentication, and maintain customer data securely.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create A Customer

Creates a new customer account in the system. This endpoint registers a new user with their basic information and credentials.

<Api
method="POST"
url="/api/customers"
requestSchema={{
"type": "object",
"properties": {
"status": {
"type": ["string", "integer"],
"enum": ["0", "1", 0, 1],
"errorMessage": {
"type": "Status must be a string or number",
"enum": "Status must be either 0, 1, '0', or '1'"
}
},
"full_name": {
"type": "string",
"minLength": 1,
"errorMessage": {
"type": "Full name must be a string",
"minLength": "Full name is required and cannot be empty"
}
},
"email": {
"type": "string",
"format": "email",
"errorMessage": {
"type": "Email must be a string",
"format": "Email must be a valid email address (e.g., user@example.com)"
}
},
"password": {
"type": "string",
"minLength": 1,
"errorMessage": {
"type": "Password must be a string",
"minLength": "Password is required and cannot be empty"
}
}
},
"additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_id": 21,
    "uuid": "e1b20098a66c11edb46b60d819134f39",
    "status": 1,
    "group_id": 1,
    "email": "john.smith@example.com",
    "full_name": "John Smith",
    "created_at": "2023-02-07 14:18:05",
    "updated_at": "2023-02-07 14:18:05",
    "links": [
      {
        "rel": "customerGrid",
        "href": "/admin/customers",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/customers/edit/e1b20098a66c11edb46b60d819134f39",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

<hr />

### Update A Customer

Modifies an existing customer account. This endpoint allows you to update customer information such as email, name, or password.

<Api
method="PATCH"
url="/api/customers/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
"type": "object",
"properties": {
"status": {
"type": ["string", "integer"],
"enum": ["0", "1", 0, 1],
"errorMessage": {
"type": "Status must be a string or number",
"enum": "Status must be either 0, 1, '0', or '1'"
}
},
"full_name": {
"type": "string",
"minLength": 1,
"errorMessage": {
"type": "Full name must be a string",
"minLength": "Full name is required and cannot be empty"
}
},
"email": {
"type": "string",
"format": "email",
"errorMessage": {
"type": "Email must be a string",
"format": "Email must be a valid email address (e.g., user@example.com)"
}
},
"password": {
"type": "string",
"minLength": 1,
"errorMessage": {
"type": "Password must be a string",
"minLength": "Password is required and cannot be empty"
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
    "created_at": "2023-02-07 14:18:05",
    "updated_at": "2023-02-07 14:18:06",
    "links": [
      {
        "rel": "customerGrid",
        "href": "/admin/customers",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/customers/edit/433ba97f-8be7-4be9-be3f-a9f341f2b89f",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

<hr />

### Delete a Customer

Permanently removes a customer account from the system. This operation cannot be undone.

<Api
method="DELETE"
url="/api/customers/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "customer_id": 21,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "status": 1,
    "group_id": 1,
    "email": "john.smith@example.com",
    "full_name": "John A. Smith",
    "created_at": "2023-02-07 14:18:05",
    "updated_at": "2023-02-07 14:18:06"
  }
}`}
/>

<hr />

## Customer Addresses

Addresses use the shared address vocabulary (the same column names as cart and order addresses). `country` is the only key the payload schema requires; the service validates the rest against the country's address schema and answers `400` with field-targeted `error.errors[]` on failure — the codes and the error shape are documented under [Address Validation](/docs/api/customer-self-service#address-validation).

### Create Customer Address

Creates a new address for a customer.

<Api
method="POST"
url="/api/customers/{customer_id}/addresses"
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
  "required": ["country"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
    "is_default": true
  }
}`}
/>

<hr/>

### Update Customer Address

Updates an existing customer address. The patch is merged over the stored row before validation, so a partial body is fine.

<Api
method="PATCH"
url="/api/customers/{customer_id}/addresses/{address_id}"
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
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "recipient": "John A. Smith",
    "address_line_1": "456 Oak Ave"
  }
}`}
/>

<hr/>

### Delete Customer Address

Removes a customer address.

<Api
method="DELETE"
url="/api/customers/{customer_id}/addresses/{address_id}"
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}`}
/>

<hr/>

## Password Management

### Reset Password

Sends a password reset email to the customer.

<Api
method="POST"
url="/api/customers/reset-password"
requestSchema={{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": ["email"]
}}
responseSample={`{
  "data": {}
}`}
isPrivate={false}
/>

<hr/>

### Update Password

Updates a customer's password using a reset token received via email.

<Api
method="POST"
url="/api/customers/password"
requestSchema={{
  "type": "object",
  "properties": {
    "password": {
      "type": "string"
    },
    "token": {
      "type": "string"
    }
  },
  "required": ["password", "token"]
}}
responseSample={`{}`}
isPrivate={false}
/>

<hr/>

### Get Customer Data with GraphQL

EverShop uses GraphQL for querying customer data. For detailed information on how to query customers, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
