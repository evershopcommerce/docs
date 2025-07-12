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

### Cookie-Based Authentication

EverShop currently implements cookie-based authentication. To authenticate:

1. Call the [admin login](/docs/api/user) API endpoint
2. The API returns a session cookie
3. Include this cookie in all subsequent requests requiring authentication

### Public Endpoints

Some API endpoints are publicly accessible without authentication. These endpoints are identified by the `access` property set to `public` in their respective `route.json` files. No authentication credentials are required for these endpoints.

## HTTP Methods

EverShop's REST API uses standard HTTP methods to perform different actions on resources:

| Method | Description                                | Idempotent |
| ------ | ------------------------------------------ | ---------- |
| GET    | Retrieves resources without modifying them | Yes        |
| POST   | Creates new resources                      | No         |
| PATCH  | Updates resources with partial data        | Yes        |
| DELETE | Removes resources                          | Yes        |

### Idempotency

Idempotent methods can be called multiple times with the same effect as calling them once. This is important for reliability and error recovery.

## Response Codes

EverShop uses standard HTTP status codes to indicate the result of API requests:

### Success Codes

| Code | Description | Common Use Cases                        |
| ---- | ----------- | --------------------------------------- |
| 200  | OK          | Successful GET, PATCH, or DELETE        |
| 201  | Created     | Successful POST that created a resource |

### Client Error Codes

| Code | Description        | Common Use Cases                           |
| ---- | ------------------ | ------------------------------------------ |
| 400  | Bad Request        | Invalid input or missing parameters        |
| 401  | Unauthorized       | Authentication failure                     |
| 403  | Forbidden          | Authenticated but insufficient permissions |
| 404  | Not Found          | Resource doesn't exist                     |
| 405  | Method Not Allowed | HTTP method not supported for endpoint     |
| 409  | Conflict           | Resource state conflict (e.g., duplicate)  |

### Server Error Codes

| Code | Description           | Common Use Cases              |
| ---- | --------------------- | ----------------------------- |
| 500  | Internal Server Error | Unexpected server-side errors |

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

| Parameter | Description              | Default |
| --------- | ------------------------ | ------- |
| page      | Page number to retrieve  | 1       |
| limit     | Number of items per page | 20      |

## Best Practices

1. **Use HTTPS** - Always use secure connections for API requests
2. **Limit Request Volume** - Implement proper caching and throttling mechanisms
3. **Handle Rate Limiting** - Be prepared to handle 429 Too Many Requests responses
4. **Validate Input** - Always validate request data before sending to the API
5. **Handle Errors Gracefully** - Implement proper error handling in your application
