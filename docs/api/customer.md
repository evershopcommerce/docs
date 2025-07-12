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

### Create a Customer

Creates a new customer account in the system. This endpoint registers a new user with their basic information and credentials.

<Api
method="POST"
url="/api/customers"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": [
        "string",
        "integer"
      ],
      "enum": [
        "0",
        "1",
        0,
        1
      ],
      "description": "Customer account status: 1 for active, 0 for inactive"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Customer's email address (must be unique)"
    },
    "password": {
      "type": "string",
      "description": "Customer's account password"
    },
    "full_name": {
      "type": "string",
      "description": "Customer's full name"
    }
  },
  "required": [
    "email",
    "password",
    "full_name"
  ],
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

### Update a Customer

Modifies an existing customer account. This endpoint allows you to update customer information such as email, name, or password.

<Api
method="PATCH"
url="/api/customers/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "Customer's email address (must be unique)"
    },
    "password": {
      "type": "string",
      "description": "Customer's account password (only include if changing password)"
    },
    "full_name": {
      "type": "string",
      "description": "Customer's full name"
    },
    "status": {
      "type": [
        "string",
        "integer"
      ],
      "enum": [
        "0",
        "1",
        0,
        1
      ],
      "description": "Customer account status: 1 for active, 0 for inactive"
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

<hr/>

### Login

Authenticates a customer and creates a session. Returns a session identifier that should be used for authenticated requests.

<Api
method="POST"
url="/customer/login"
requestSchema={{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "Customer's email address"
    },
    "password": {
      "type": "string",
      "description": "Customer's account password"
    }
  },
  "required": [
    "email",
    "password"
  ]
}}
responseSample={`{
  "data": {
    "sid": "09d34c21-4af3-4db8-a38b-335ebf6d45fa"
  }
}`}
isPrivate={false}
/>

<hr/>

### Logout

Terminates a customer's active session. This invalidates the session identifier and requires re-authentication for future requests.

<Api
method="POST"
url="/customers/logout"
responseSample={`{
  "data": {}
}`}
isPrivate={false}
/>

<hr/>

### Get a Customer

Retrieves detailed information about a specific customer account.

<Api
method="GET"
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
    "updated_at": "2023-02-07 14:18:06",
    "addresses": [
      {
        "customer_address_id": 15,
        "uuid": "f2c30099a66c11edb46b60d819134f39",
        "full_name": "John A. Smith",
        "telephone": "555-123-4567",
        "address_1": "123 Main Street",
        "address_2": "Apt 4B",
        "city": "Springfield",
        "province": "IL",
        "country": "US",
        "postcode": "62701",
        "is_default": true
      }
    ]
  }
}`}
/>

<hr/>

### List All Customers

Retrieves a paginated list of all customer accounts in the system.

<Api
method="GET"
url="/api/customers"
responseSample={`{
  "data": [
    {
      "customer_id": 20,
      "uuid": "d1b20098a66c11edb46b60d819134f39",
      "status": 1,
      "group_id": 1,
      "email": "jane.doe@example.com",
      "full_name": "Jane Doe",
      "created_at": "2023-02-06 10:15:22",
      "updated_at": "2023-02-06 10:15:22"
    },
    {
      "customer_id": 21,
      "uuid": "e1b20098a66c11edb46b60d819134f39",
      "status": 1,
      "group_id": 1,
      "email": "john.smith@example.com",
      "full_name": "John A. Smith",
      "created_at": "2023-02-07 14:18:05",
      "updated_at": "2023-02-07 14:18:06"
    }
  ],
  "links": {
    "first": "/api/customers?page=1",
    "last": "/api/customers?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "/api/customers",
    "per_page": 20,
    "to": 2,
    "total": 2
  }
}`}
/>

## Authentication

Customer API endpoints use session-based authentication. After a successful login, include the session identifier (sid) in subsequent requests using one of the following methods:

1. **Cookie-based authentication** - The session cookie is automatically included in browser-based requests
2. **Header-based authentication** - Include the session ID in the `X-Session-ID` header

## Error Handling

All endpoints may return the following error responses:

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 400         | Bad Request - Invalid parameters       |
| 401         | Unauthorized - Authentication required |
| 403         | Forbidden - Insufficient permissions   |
| 404         | Not Found - Customer doesn't exist     |
| 409         | Conflict - Email already in use        |
| 500         | Server Error - Something went wrong    |

Error responses follow this format:

```json
{
  "error": {
    "status": 404,
    "message": "Customer not found"
  }
}
```
