---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Attribute Groups
  - Product Attributes
  - REST API
  - E-commerce API
sidebar_label: Attribute Group
title: Attribute Group REST API
description: Comprehensive guide to interacting with EverShop attribute groups via REST API endpoints. Create, update, retrieve, and delete attribute groups efficiently.
---

# Attribute Group API

## Overview

The Attribute Group API allows you to manage product attribute groups in your EverShop store. Attribute groups help organize product attributes into logical categories, making product management more efficient and structured.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create an Attribute Group

Creates a new attribute group in the system. Attribute groups are used to categorize product attributes for better organization.

<Api
method="POST"
url="/api/attributeGroups"
requestSchema={{
  "type": "object",
  "properties": {
    "group_name": {
      "type": "string",
      "description": "The name of the attribute group"
    }
  },
  "required": [
    "group_name"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "attribute_group_id": 49,
    "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "group_name": "Attribute Group Name",
    "created_at": "2023-02-06 09:13:35",
    "updated_at": "2023-02-06 09:13:35"
  }
}`}
/>

<hr />

### Update an Attribute Group

Updates an existing attribute group's information. Use this endpoint to modify the name of an attribute group.

<Api
method="PATCH"
url="/api/attributeGroups/363ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "group_name": {
      "type": "string",
      "description": "The updated name of the attribute group"
    }
  },
  "required": [
    "group_name"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "attribute_group_id": 50,
    "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "group_name": "Attribute Group Name",
    "created_at": "2023-02-06 09:13:35",
    "updated_at": "2023-02-06 09:13:35"
  }
}`}
/>

<hr />

### Delete an Attribute Group

Permanently removes an attribute group from the system. Note that this operation cannot be undone, and any attributes associated with this group may need to be reassigned.

<Api
method="DELETE"
url="/api/attributeGroups/363ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "attribute_group_id": 50,
    "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "group_name": "Attribute Group Name",
    "created_at": "2023-02-06 09:13:35",
    "updated_at": "2023-02-06 09:13:35"
  }
}`}
/>

<hr />

### Reading Attribute Groups

:::warning No REST read endpoints
`GET /api/attributeGroups` and `GET /api/attributeGroups/{uuid}` **do not exist**. The catalog module registers no `GET` route for attribute groups — calling either returns a 404.
:::

Read attribute groups through **GraphQL**. `Query.attributeGroups` is defined in an `.admin.graphql` file, so it exists only on the admin schema — send it to the authenticated endpoint `POST /admin/graphql`:

```graphql
query AttributeGroups($filters: [FilterInput]) {
  attributeGroups(filters: $filters) {
    items {
      attributeGroupId
      uuid
      groupName
      attributes {
        items {
          attributeId
          attributeCode
          attributeName
        }
        total
      }
    }
    currentPage
    total
  }
}
```

See the [GraphQL documentation](/docs/development/knowledge-base/graphql) for filters and the full schema.

## Error Handling

All endpoints may return the following error responses:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>400</td>
      <td>Bad Request - Invalid parameters</td>
    </tr>
    <tr>
      <td>401</td>
      <td>Unauthorized - Authentication required</td>
    </tr>
    <tr>
      <td>403</td>
      <td>Forbidden - Insufficient permissions</td>
    </tr>
    <tr>
      <td>404</td>
      <td>Not Found - Attribute group doesn't exist</td>
    </tr>
    <tr>
      <td>500</td>
      <td>Server Error - Something went wrong</td>
    </tr>
  </tbody>
</table>

Error responses follow this format:

```json
{
  "error": {
    "status": 404,
    "message": "Attribute group not found"
  }
}
```

## Best Practices

1. **Organization**: Create logical attribute groups based on product categories or features
2. **Naming**: Use clear, descriptive names for attribute groups
3. **Maintenance**: Regularly review and update attribute groups as product catalogs evolve
4. **Integration**: Use these APIs to integrate EverShop with PIM (Product Information Management) systems
