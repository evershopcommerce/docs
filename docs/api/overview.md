---
sidebar_position: 1
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - REST API
  - GraphQL API
  - API Authentication
  - E-commerce API
sidebar_label: Overview
title: API Overview
description: Comprehensive overview of the EverShop API architecture. Learn about REST and GraphQL APIs, authentication methods, error handling, and best practices for integration.
---

# API Overview

## Introduction

EverShop is built on a modern API-first architecture, providing developers with powerful and flexible ways to interact with the platform. This approach enables seamless integration with various frontend technologies, third-party systems, and custom applications.

EverShop offers two complementary API approaches:

1. **RESTful API** - For creating, updating, and deleting resources
2. **GraphQL API** - For efficient querying of resources with precise control over returned data

This dual approach combines the simplicity and standardization of REST with the flexibility and efficiency of GraphQL.

:::info
For detailed information on API route configuration, refer to our [API Routes documentation](/docs/development/knowledge-base/api-routes.md).
:::

:::info
To learn about EverShop's GraphQL implementation, visit our [GraphQL API documentation](/docs/development/knowledge-base/graphql.md).
:::

## API Architecture

### REST API

The REST API follows standard RESTful principles with resource-oriented URLs and appropriate HTTP methods. This API is ideal for:

- Creating, updating, and deleting resources
- Standard CRUD operations
- Familiar, predictable patterns for developers

### GraphQL API

The GraphQL API provides a single endpoint that accepts complex queries. This API is ideal for:

- Retrieving exactly the data you need, no more or less
- Reducing the number of network requests
- Complex data requirements with nested relationships

## Content Types

All API requests and responses use the [JSON](https://www.json.org/json-en.html) format. The content type for both requests and responses is `application/json`.

When sending data to the API, include the following header:

```
Content-Type: application/json
```

## Authentication

### JWT-Based Authentication

EverShop currently implements JWT-based authentication. To authenticate:

1. Call the [admin token](/docs/api/authentication#get-admin-user-access-token) API endpoint
2. The API returns a JWT access token and a refresh token
3. Include this token in the `Authorization` Bearer header of all subsequent requests requiring authentication

### Public Endpoints

Some API endpoints are publicly accessible without authentication. These endpoints are identified by the `access` property set to `public` in their respective `route.json` files. No authentication credentials are required for these endpoints.

## HTTP Methods

EverShop's REST API uses standard HTTP methods to perform different actions on resources:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
      <th>Idempotent</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET</td>
      <td>Retrieves resources without modifying them</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>POST</td>
      <td>Creates new resources</td>
      <td>No</td>
    </tr>
    <tr>
      <td>PATCH</td>
      <td>Updates resources with partial data</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>DELETE</td>
      <td>Removes resources</td>
      <td>Yes</td>
    </tr>
  </tbody>
</table>

### Idempotency

Idempotent methods can be called multiple times with the same effect as calling them once. This is important for reliability and error recovery.

## Response Codes

EverShop uses standard HTTP status codes to indicate the result of API requests:

### Success Codes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Code</th>
      <th>Description</th>
      <th>Common Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>200</td>
      <td>OK</td>
      <td>Successful GET, PATCH, or DELETE</td>
    </tr>
    <tr>
      <td>201</td>
      <td>Created</td>
      <td>Successful POST that created a resource</td>
    </tr>
  </tbody>
</table>

### Client Error Codes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Description</th>
      <th>Common Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>400</td>
      <td>Bad Request</td>
      <td>Invalid input or missing parameters</td>
    </tr>
    <tr>
      <td>401</td>
      <td>Unauthorized</td>
      <td>Authentication failure</td>
    </tr>
    <tr>
      <td>403</td>
      <td>Forbidden</td>
      <td>Authenticated but insufficient permissions</td>
    </tr>
    <tr>
      <td>404</td>
      <td>Not Found</td>
      <td>Resource doesn't exist</td>
    </tr>
    <tr>
      <td>405</td>
      <td>Method Not Allowed</td>
      <td>HTTP method not supported for endpoint</td>
    </tr>
    <tr>
      <td>409</td>
      <td>Conflict</td>
      <td>Resource state conflict (e.g., duplicate)</td>
    </tr>
  </tbody>
</table>

### Server Error Codes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Description</th>
      <th>Common Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>500</td>
      <td>Internal Server Error</td>
      <td>Unexpected server-side errors</td>
    </tr>
  </tbody>
</table>

## Error Handling

When an API request fails, the response will include an error object with details about the failure:

```json
{
  "error": {
    "status": 500,
    "message": "Detailed error message"
  }
}
```

The error object contains:

- `status`: The HTTP status code
- `message`: A human-readable description of the error

## Pagination

For endpoints that return collections of resources, EverShop implements pagination to manage response size:

```json
{
  "data": [...],
  "links": {
    "first": "/api/resource?page=1",
    "last": "/api/resource?page=5",
    "prev": "/api/resource?page=2",
    "next": "/api/resource?page=4"
  },
  "meta": {
    "current_page": 3,
    "from": 41,
    "last_page": 5,
    "path": "/api/resource",
    "per_page": 20,
    "to": 60,
    "total": 100
  }
}
```

### Pagination Parameters

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>page</td>
      <td>Page number to retrieve</td>
      <td>1</td>
    </tr>
    <tr>
      <td>limit</td>
      <td>Number of items per page</td>
      <td>20</td>
    </tr>
  </tbody>
</table>

## Best Practices

1. **Use HTTPS** - Always use secure connections for API requests
2. **Limit Request Volume** - Implement proper caching and throttling mechanisms
3. **Handle Rate Limiting** - Be prepared to handle 429 Too Many Requests responses
4. **Validate Input** - Always validate request data before sending to the API
5. **Handle Errors Gracefully** - Implement proper error handling in your application
