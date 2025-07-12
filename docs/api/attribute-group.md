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

### Get an Attribute Group

Retrieves detailed information about a specific attribute group.

<Api
method="GET"
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

### List All Attribute Groups

Retrieves a paginated list of all attribute groups in the system.

<Api
method="GET"
url="/api/attributeGroups"
responseSample={`{
  "data": [
    {
      "attribute_group_id": 49,
      "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89f",
      "group_name": "General Information",
      "created_at": "2023-02-06 09:13:35",
      "updated_at": "2023-02-06 09:13:35"
    },
    {
      "attribute_group_id": 50,
      "uuid": "363ba97f-8be7-4be9-be3f-a9f341f2b89w",
      "group_name": "Technical Specifications",
      "created_at": "2023-02-06 09:15:22",
      "updated_at": "2023-02-06 09:15:22"
    }
  ],
  "links": {
    "first": "/api/attributeGroups?page=1",
    "last": "/api/attributeGroups?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "/api/attributeGroups",
    "per_page": 20,
    "to": 2,
    "total": 2
  }
}`}
/>

## Error Handling

All endpoints may return the following error responses:

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Invalid parameters          |
| 401         | Unauthorized - Authentication required    |
| 403         | Forbidden - Insufficient permissions      |
| 404         | Not Found - Attribute group doesn't exist |
| 500         | Server Error - Something went wrong       |

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
