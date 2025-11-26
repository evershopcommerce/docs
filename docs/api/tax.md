---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Tax Management
  - REST API
sidebar_label: Tax Management
title: Tax Management REST API
description: Comprehensive guide to managing taxes in EverShop. Learn how to create, update, retrieve, and delete tax rules using the REST API.
---

# Tax Management API

## Overview

The Tax Management API provides endpoints for managing tax rules in your EverShop store. Tax rules are essential for calculating and applying taxes to orders based on various criteria such as customer location, product type, and more.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create A Tax Class

Creates a new tax class in the system. You can specify the class name, and associated tax rules.

<Api
method="POST"
url="/api/tax/classes"
requestSchema={{
"type": "object",
"properties": {
"name": {
"type": "string"
}
},
"additionalProperties": true,
"required": ["name"]
}
}
responseSample={`{
  "data": {
    "tax_class_id": 1,
    "uuid": "e15da567a66c11edb46b60d819134f39",
    "name": "Taxable Goods"
  }
}`}
/>

<hr />

### Update A Tax Class

Updates an existing tax class with new information.

<Api
method="PATCH"
url="/api/tax/classes/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
"type": "object",
"properties": {
"name": {
"type": "string"
}
}}
}
responseSample={`{
  "data": {
    "tax_class_id": 1,
    "uuid": "e15da567a66c11edb46b60d819134f39",
    "name": "Taxable Goods"
  }
}`}
/>

<hr />

### Create A Tax Rate

Creates a new tax rate in the system. You can specify the rate amount, associated tax class, and other details.

<Api
method="POST"
url="/tax/classes/:class_id/rates"
requestSchema={{
"type": "object",
"properties": {
"name": {
"type": "string"
},
"country": {
"type": "string"
},
"provnice": {
"type": "string"
},
"postcode": {
"type": "string"
},
"rate": {
"type": ["string", "number"],
"pattern": "^\\d+(\\.\\d{1,2})?$"
    },
    "is_compound": {
      "type": ["string", "number"],
      "enum": [0, 1, "0", "1"]
    },
    "priority": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+$"
}
},
"additionalProperties": true,
"required": ["name", "rate"]
}}
responseSample={`{
  "data": {
    "tax_rate_id": 1,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "name": "Taxable Goods",
    "tax_class_id": 1,
    "country": "US",
    "provnice": "CA",
    "postcode": "90001",
    "rate": "7.25",
    "is_compound": 0,
    "priority": 1
  }
}`}
/>

<hr />

### Update A Tax Rate

Updates an existing tax rate in the system. You can specify the new rate amount, associated tax class, and other details.

<Api
method="PATCH"
url="/tax/rates/:id"
requestSchema={{
"type": "object",
"properties": {
"name": {
"type": "string"
},
"country": {
"type": "string"
},
"provnice": {
"type": "string"
},
"postcode": {
"type": "string"
},
"rate": {
"type": ["string", "number"],
"pattern": "^\\d+(\\.\\d{1,2})?$"
    },
    "is_compound": {
      "type": ["string", "number"],
      "enum": [0, 1, "0", "1"]
    },
    "priority": {
      "type": ["string", "number"],
      "pattern": "^[0-9]+$"
}
},
"additionalProperties": true,
"required": ["name", "rate"]
}}
responseSample={`{
  "data": {
    "tax_rate_id": 1,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "name": "Taxable Goods",
    "tax_class_id": 1,
    "country": "US",
    "provnice": "CA",
    "postcode": "90001",
    "rate": "7.25",
    "is_compound": 0,
    "priority": 1
  }
}`}
/>

<hr />

### Delete A Tax Rate

Deletes an existing tax rate from the system.

<Api
method="DELETE"
url="/tax/rates/:id"
responseSample={`{
  "data": {
    "tax_rate_id": 1,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "name": "Taxable Goods",
    "tax_class_id": 1,
    "country": "US",
    "provnice": "CA",
    "postcode": "90001",
    "rate": "7.25",
    "is_compound": 0,
    "priority": 1
  }
}`}
/>

<hr />

### Get Tax Data with GraphQL

EverShop uses GraphQL for querying tax data. For detailed information on how to query tax data, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
