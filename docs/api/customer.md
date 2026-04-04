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

### Create Customer Address

Creates a new address for a customer.

<Api
method="POST"
url="/api/customers/{customer_id}/addresses"
requestSchema={{
  "type": "object",
  "properties": {
    "full_name": { "type": "string" },
    "telephone": { "type": "string" },
    "address_1": { "type": "string" },
    "address_2": { "type": "string" },
    "city": { "type": "string" },
    "province": { "type": "string" },
    "country": { "type": "string" },
    "postcode": { "type": "string" },
    "is_default": { "type": ["boolean", "integer"] }
  }
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customer_id": 21,
    "full_name": "John Smith",
    "address_1": "123 Main St",
    "city": "New York",
    "province": "NY",
    "country": "US",
    "postcode": "10001"
  }
}`}
isPrivate={false}
/>

<hr/>

### Update Customer Address

Updates an existing customer address.

<Api
method="PATCH"
url="/api/customers/{customer_id}/addresses/{address_id}"
requestSchema={{
  "type": "object",
  "properties": {
    "full_name": { "type": "string" },
    "telephone": { "type": "string" },
    "address_1": { "type": "string" },
    "address_2": { "type": "string" },
    "city": { "type": "string" },
    "province": { "type": "string" },
    "country": { "type": "string" },
    "postcode": { "type": "string" }
  }
}}
responseSample={`{
  "data": {
    "customer_address_id": 42,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "full_name": "John A. Smith",
    "address_1": "456 Oak Ave"
  }
}`}
isPrivate={false}
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
isPrivate={false}
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
  "data": {
    "success": true
  }
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
responseSample={`{
  "data": {
    "success": true
  }
}`}
isPrivate={false}
/>

<hr/>

### Get Customer Data with GraphQL

EverShop uses GraphQL for querying customer data. For detailed information on how to query customers, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
