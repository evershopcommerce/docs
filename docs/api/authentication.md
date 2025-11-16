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

# Authentication API

## Overview

EverShop uses JWT (JSON Web Tokens) for secure API authentication across both admin and customer endpoints. JWTs are self-contained tokens that contain encoded user information and claims, eliminating the need for session management on the server. Each token is cryptographically signed to prevent tampering and verify authenticity.

## Endpoints

### JWT Token Types

EverShop issues two types of tokens:

- **Access Token**: Short-lived token used to authenticate API requests
- **Refresh Token**: Long-lived token used to obtain new access tokens without re-authenticating

### Configuration via Environment Variables

Configure JWT behavior using the following environment variables:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Description</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>JWT_ADMIN_SECRET</code></td>
      <td>Secret key for signing and verifying admin user access tokens</td>
      <td>Required</td>
    </tr>
    <tr>
      <td><code>JWT_ADMIN_REFRESH_SECRET</code></td>
      <td>Secret key for signing and verifying admin user refresh tokens</td>
      <td>Required</td>
    </tr>
    <tr>
      <td><code>JWT_CUSTOMER_SECRET</code></td>
      <td>Secret key for signing and verifying customer access tokens</td>
      <td>Required</td>
    </tr>
    <tr>
      <td><code>JWT_CUSTOMER_REFRESH_SECRET</code></td>
      <td>Secret key for signing and verifying customer refresh tokens</td>
      <td>Required</td>
    </tr>
    <tr>
      <td><code>JWT_ADMIN_TOKEN_EXPIRY</code></td>
      <td>Admin access token expiration (seconds)</td>
      <td>900 (15 minutes)</td>
    </tr>
    <tr>
      <td><code>JWT_ADMIN_REFRESH_TOKEN_EXPIRY</code></td>
      <td>Admin refresh token expiration (seconds)</td>
      <td>1,296,000 (15 days)</td>
    </tr>
    <tr>
      <td><code>JWT_CUSTOMER_TOKEN_EXPIRY</code></td>
      <td>Customer access token expiration (seconds)</td>
      <td>1,800 (30 minutes)</td>
    </tr>
    <tr>
      <td><code>JWT_CUSTOMER_REFRESH_TOKEN_EXPIRY</code></td>
      <td>Customer refresh token expiration (seconds)</td>
      <td>2,592,000 (30 days)</td>
    </tr>
  </tbody>
</table>

### Integration Flow

1. Authenticate with credentials to receive access and refresh tokens
2. Include the access token in subsequent API requests via the `Authorization: Bearer <token>` header
3. When the access token expires, use the refresh token to obtain a new one
4. Repeat steps 2-3 to maintain continuous authenticated access

import Api from '@site/src/components/rest/Api';

## Get Admin User Access Token

Generates a JWT (JSON Web Token) for admin user authentication. This endpoint allows authorized administrators to obtain a secure token that can be used for subsequent API requests. The token is issued with a configurable expiration time and contains claims that identify the user as an admin.

**Authentication:** Requires valid admin credentials (username and password, or API key)

**Use Cases:**

- Authenticate as an admin user to access restricted endpoints
- Obtain a token for programmatic access to admin-only resources
- Refresh or rotate admin authentication tokens

:::info
By default the access token is valid for 15 minutes. You can configure the token expiration time by using the `JWT_ADMIN_TOKEN_EXPIRY` environment variable with the desired duration in seconds. The refresh token is valid for 15 days by default and can be configured using the `JWT_ADMIN_REFRESH_TOKEN_EXPIRY` environment variable.
:::

<Api
method="POST"
url="/api/user/tokens"
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
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluX3VzZXJfaWQiOjEsInV1aWQiOiJjNmM4YThmNy1iOWI4LTQzYzYtYWQyNC0zMTdjMzRmY2ZlNzIiLCJzdGF0dXMiOnRydWUsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiZnVsbF9uYW1lIjoiYWRtaW4iLCJjcmVhdGVkX2F0IjoiMjAyNC0xMi0xMFQwNzowODoyMS4wMTFaIiwidXBkYXRlZF9hdCI6IjIwMjQtMTItMTBUMDc6MDg6MjEuMDExWiJ9LCJ0b2tlblR5cGUiOiJhZG1pbiIsInRva2VuS2luZCI6ImFjY2VzcyIsImlhdCI6MTc2MjE0NDQyOCwiZXhwIjoxNzYyMTczMjI4LCJhdWQiOiJhZG1pbiIsImlzcyI6ImV2ZXJzaG9wIn0.Dsd1DvAdWOthCv_0fAlHbVmxJNHFzrQvfeMy7p-ozhU",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluX3VzZXJfaWQiOjEsInV1aWQiOiJjNmM4YThmNy1iOWI4LTQzYzYtYWQyNC0zMTdjMzRmY2ZlNzIiLCJzdGF0dXMiOnRydWUsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiZnVsbF9uYW1lIjoiYWRtaW4iLCJjcmVhdGVkX2F0IjoiMjAyNC0xMi0xMFQwNzowODoyMS4wMTFaIiwidXBkYXRlZF9hdCI6IjIwMjQtMTItMTBUMDc6MDg6MjEuMDExWiJ9LCJ0b2tlblR5cGUiOiJhZG1pbiIsInRva2VuS2luZCI6InJlZnJlc2giLCJpYXQiOjE3NjIxNDQ0MjgsImV4cCI6MTc2MjE0NTMyOCwiYXVkIjoiYWRtaW4iLCJpc3MiOiJldmVyc2hvcCJ9.JF00yEJla1P51JRq8gRUkbnrt080f_GOeh2d8_XGqHU"
    }
}`}
isPrivate={false}
/>

**Response Properties**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>accessToken</code></td>
      <td>JWT access token for authenticated requests</td>
    </tr>
    <tr>
      <td><code>refreshToken</code></td>
      <td>JWT refresh token for obtaining new access tokens</td>
    </tr>
  </tbody>
</table>
      
<hr/>

## Refresh Admin User Access Token

Renews the admin access token using a valid refresh token. This endpoint allows you to obtain a new access token without requiring credentials, extending your authenticated session without interruption.

**Use Cases:**

- Obtain a new access token after the current one expires
- Maintain continuous authenticated access without re-entering credentials
- Implement seamless token rotation in your application

**Authentication:** Requires valid refresh token

<Api
method="GET"
url="/api/user/token/refresh"
requestSchema={{
  "type": "object",
  "properties": {
    "refreshToken": {
      "type": "string",
      "errorMessage": {
        "type": "Refresh token must be a string"
      }
    }
  },
  "required": ["refreshToken"],
  "errorMessage": {
    "required": {
      "refreshToken": "Refresh token is required"
    }
  }
}}
responseSample={`{
  "data": {}
}`}
isPrivate={false}
/>

<hr/>

## Get Customer Access Token

Generates JWT tokens for customer authentication. This API allows customers to securely log in and access their accounts using tokens.

**Authentication:** Requires valid customer credentials (email and password)

**Use Cases:**

- Authenticate customers for accessing their accounts
- Obtain tokens for programmatic access to customer-specific resources
- Refresh or rotate customer authentication tokens

:::info
By default the access token is valid for 30 minutes. You can configure the token expiration time by using the `JWT_CUSTOMER_TOKEN_EXPIRY` environment variable with the desired duration in seconds. The refresh token is valid for 30 days by default and can be configured using the `JWT_CUSTOMER_REFRESH_TOKEN_EXPIRY` environment variable.
:::

<Api
method="POST"
url="/api/customer/tokens"
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
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluX3VzZXJfaWQiOjEsInV1aWQiOiJjNmM4YThmNy1iOWI4LTQzYzYtYWQyNC0zMTdjMzRmY2ZlNzIiLCJzdGF0dXMiOnRydWUsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiZnVsbF9uYW1lIjoiYWRtaW4iLCJjcmVhdGVkX2F0IjoiMjAyNC0xMi0xMFQwNzowODoyMS4wMTFaIiwidXBkYXRlZF9hdCI6IjIwMjQtMTItMTBUMDc6MDg6MjEuMDExWiJ9LCJ0b2tlblR5cGUiOiJhZG1pbiIsInRva2VuS2luZCI6ImFjY2VzcyIsImlhdCI6MTc2MjE0NDQyOCwiZXhwIjoxNzYyMTczMjI4LCJhdWQiOiJhZG1pbiIsImlzcyI6ImV2ZXJzaG9wIn0.Dsd1DvAdWOthCv_0fAlHbVmxJNHFzrQvfeMy7p-ozhU",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluX3VzZXJfaWQiOjEsInV1aWQiOiJjNmM4YThmNy1iOWI4LTQzYzYtYWQyNC0zMTdjMzRmY2ZlNzIiLCJzdGF0dXMiOnRydWUsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiZnVsbF9uYW1lIjoiYWRtaW4iLCJjcmVhdGVkX2F0IjoiMjAyNC0xMi0xMFQwNzowODoyMS4wMTFaIiwidXBkYXRlZF9hdCI6IjIwMjQtMTItMTBUMDc6MDg6MjEuMDExWiJ9LCJ0b2tlblR5cGUiOiJhZG1pbiIsInRva2VuS2luZCI6InJlZnJlc2giLCJpYXQiOjE3NjIxNDQ0MjgsImV4cCI6MTc2MjE0NTMyOCwiYXVkIjoiYWRtaW4iLCJpc3MiOiJldmVyc2hvcCJ9.JF00yEJla1P51JRq8gRUkbnrt080f_GOeh2d8_XGqHU"
    }
}`}
isPrivate={false}
/>

**Response Properties**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>accessToken</code></td>
      <td>JWT access token for authenticated requests</td>
    </tr>
    <tr>
      <td><code>refreshToken</code></td>
      <td>JWT refresh token for obtaining new access tokens</td>
    </tr>
  </tbody>
</table>
      
<hr/>

## Refresh Customer Access Token

Renews the customer access token using a valid refresh token. This endpoint allows you to obtain a new access token without requiring credentials, extending your authenticated session without interruption.

**Use Cases:**

- Obtain a new access token after the current one expires
- Maintain continuous authenticated access without re-entering credentials
- Implement seamless token rotation in your application

**Authentication:** Requires valid refresh token

<Api
method="GET"
url="/api/customer/token/refresh"
requestSchema={{
  "type": "object",
  "properties": {
    "refreshToken": {
      "type": "string",
      "errorMessage": {
        "type": "Refresh token must be a string"
      }
    }
  },
  "required": ["refreshToken"],
  "errorMessage": {
    "required": {
      "refreshToken": "Refresh token is required"
    }
  }
}}
responseSample={`{
  "data": {}
}`}
isPrivate={false}
/>
