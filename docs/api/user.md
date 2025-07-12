---
sidebar_position: 1
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - User Authentication
  - Admin API
  - RESTful API
  - User Management
sidebar_label: User
title: User REST API
description: Use the EverShop REST API to manage user authentication and account operations for admin users.
---

# User API

The User API enables secure authentication and management of administrative user accounts in your EverShop store. This API provides endpoints for user login, logout, and account management.

import Api from '@site/src/components/rest/Api';

## Login

Authenticates an administrative user and creates a session.

<Api
method="POST"
url="admin/user/login"
requestSchema={{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string"
    }
  },
  "required": [
    "email",
    "password"
  ]
}}
responseSample={`{
  "data": {
    "sid": "auxzei_bEdRGT-HwfACmq7D5XyHf2l5M"
  }
}`}
isPrivate={false}
/>

### Response Properties

| Property | Description                                 |
| -------- | ------------------------------------------- |
| sid      | Session ID token for authenticated requests |

<hr/>

## Logout

Terminates the current user session.

<Api
method="GET"
url="admin/user/logout"
responseSample={`{
  "data": {}
}`}
isPrivate={false}
/>

<hr/>

## Get Current User

Retrieves information about the currently authenticated user.

<Api
method="GET"
url="admin/user/me"
responseSample={`{
  "data": {
    "user_id": 1,
    "uuid": "a89fe85c-d7de-4a79-9006-bfb4e0e49e8b",
    "status": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role_id": 1,
    "role_name": "Administrator",
    "created_at": "2022-10-15 08:45:32",
    "updated_at": "2023-02-07 10:22:45"
  }
}`}
/>

<hr/>

## Create User

Creates a new administrative user account.

<Api
method="POST"
url="admin/users"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "password_confirm": {
      "type": "string",
      "minLength": 8
    },
    "status": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"]
    },
    "role_id": {
      "type": ["integer", "string"]
    }
  },
  "required": [
    "name",
    "email",
    "password",
    "password_confirm",
    "status",
    "role_id"
  ]
}}
responseSample={`{
  "data": {
    "user_id": 3,
    "uuid": "b56f17d2-8a8f-42c3-9e42-7d6bfca8c205",
    "status": 1,
    "email": "staff@example.com",
    "name": "Staff User",
    "role_id": 2,
    "created_at": "2023-07-12 14:32:18",
    "updated_at": "2023-07-12 14:32:18"
  }
}`}
/>

<hr/>

## Update User

Updates an existing administrative user account.

<Api
method="PATCH"
url="admin/users/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "password_confirm": {
      "type": "string",
      "minLength": 8
    },
    "status": {
      "type": ["integer", "string"],
      "enum": [0, 1, "0", "1"]
    },
    "role_id": {
      "type": ["integer", "string"]
    }
  }
}}
responseSample={`{
  "data": {
    "user_id": 3,
    "uuid": "b56f17d2-8a8f-42c3-9e42-7d6bfca8c205",
    "status": 1,
    "email": "staff_updated@example.com",
    "name": "Staff User Updated",
    "role_id": 2,
    "created_at": "2023-07-12 14:32:18",
    "updated_at": "2023-07-12 15:45:22"
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| id        | string | Yes      | The UUID of the user to update |

### Request Parameters

All parameters are optional for updates. Only include the parameters you want to modify. If updating the password, both `password` and `password_confirm` must be provided.

<hr/>

## Delete User

Removes an administrative user account.

<Api
method="DELETE"
url="admin/users/{id}"
responseSample={`{
  "data": {
    "user_id": 3,
    "uuid": "b56f17d2-8a8f-42c3-9e42-7d6bfca8c205",
    "status": 1,
    "email": "staff@example.com",
    "name": "Staff User",
    "role_id": 2,
    "created_at": "2023-07-12 14:32:18",
    "updated_at": "2023-07-12 14:32:18"
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| id        | string | Yes      | The UUID of the user to delete |

<hr/>

## Get User

Retrieves detailed information about a specific administrative user.

<Api
method="GET"
url="admin/users/{id}"
responseSample={`{
  "data": {
    "user_id": 3,
    "uuid": "b56f17d2-8a8f-42c3-9e42-7d6bfca8c205",
    "status": 1,
    "email": "staff@example.com",
    "name": "Staff User",
    "role_id": 2,
    "role_name": "Staff",
    "created_at": "2023-07-12 14:32:18",
    "updated_at": "2023-07-12 14:32:18"
  }
}`}
/>

### Path Parameters

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| id        | string | Yes      | The UUID of the user to retrieve |

<hr/>

## List Users

Retrieves a paginated list of administrative users.

<Api
method="GET"
url="admin/users"
responseSample={`{
  "data": [
    {
      "user_id": 1,
      "uuid": "a89fe85c-d7de-4a79-9006-bfb4e0e49e8b",
      "status": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role_id": 1,
      "role_name": "Administrator",
      "created_at": "2022-10-15 08:45:32",
      "updated_at": "2023-02-07 10:22:45"
    },
    {
      "user_id": 3,
      "uuid": "b56f17d2-8a8f-42c3-9e42-7d6bfca8c205",
      "status": 1,
      "email": "staff@example.com",
      "name": "Staff User",
      "role_id": 2,
      "role_name": "Staff",
      "created_at": "2023-07-12 14:32:18",
      "updated_at": "2023-07-12 14:32:18"
    }
  ],
  "total": 2,
  "currentPage": 1,
  "limit": 20,
  "links": [
    {
      "rel": "first",
      "href": "/admin/users?page=1",
      "action": "GET"
    },
    {
      "rel": "last",
      "href": "/admin/users?page=1",
      "action": "GET"
    }
  ]
}`}
/>

## Troubleshooting

### Common Error Codes

| Status Code | Description  | Solution                                          |
| ----------- | ------------ | ------------------------------------------------- |
| 400         | Bad Request  | Check your request payload for invalid data       |
| 401         | Unauthorized | User credentials are incorrect or session expired |
| 403         | Forbidden    | User does not have permission for this operation  |
| 404         | Not Found    | The specified user ID does not exist              |
| 409         | Conflict     | Email address is already in use                   |
| 500         | Server Error | Contact support if the issue persists             |
