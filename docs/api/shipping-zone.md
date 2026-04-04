---
sidebar_position: 14
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Shipping Zone
  - Shipping Method
sidebar_label: Shipping Zone
title: Shipping Zone REST API
description: Use the EverShop REST API to manage shipping zones and their methods.
---

import Api from '@site/src/components/rest/Api';

# Shipping Zone API

Shipping zones define geographic regions and the shipping methods available to them. Each zone can have multiple shipping methods with different pricing models.

## Endpoints

### Create a Shipping Zone

Creates a new shipping zone with a name, country, and optional province restrictions.

<Api
method="POST"
url="/api/shippingZones"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "provinces": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["name", "country"]
}}
responseSample={`{
  "data": {
    "shipping_zone_id": 3,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "US West Coast",
    "country": "US",
    "provinces": ["CA", "OR", "WA"]
  }
}`}
/>

<hr/>

### Update a Shipping Zone

Updates an existing shipping zone.

<Api
method="PATCH"
url="/api/shippingZones/{id}"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "provinces": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["name", "country"]
}}
responseSample={`{
  "data": {
    "shipping_zone_id": 3,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "US West Coast Updated"
  }
}`}
/>

<hr/>

### Delete a Shipping Zone

Permanently removes a shipping zone and all its associated methods.

<Api
method="DELETE"
url="/api/shippingZones/{id}"
responseSample={`{
  "data": {
    "success": true
  }
}`}
/>

<hr/>

## Zone Methods

### Add Method to Shipping Zone

Adds a shipping method to a zone with pricing and condition rules.

<Api
method="POST"
url="/api/shippingZones/{id}/methods"
requestSchema={{
  "type": "object",
  "properties": {
    "method_id": {
      "type": "string",
      "description": "Unique method identifier"
    },
    "cost": {
      "type": ["string", "number"],
      "description": "Flat rate cost"
    },
    "is_enabled": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false]
    },
    "calculation_type": {
      "type": "string",
      "enum": ["flat_rate", "price_based_rate", "weight_based_rate", "api"]
    },
    "condition_type": {
      "type": "string",
      "enum": ["weight", "price", "none"]
    },
    "min": {
      "type": ["string", "number"],
      "description": "Minimum weight or price for condition"
    },
    "max": {
      "type": ["string", "number"],
      "description": "Maximum weight or price for condition"
    }
  },
  "required": ["method_id", "condition_type"]
}}
responseSample={`{
  "data": {
    "method_id": "standard_shipping",
    "zone_id": 3,
    "cost": 5.99,
    "is_enabled": true,
    "calculation_type": "flat_rate",
    "condition_type": "none"
  }
}`}
/>

<hr/>

### Update Zone Method

Updates an existing shipping method within a zone.

<Api
method="PATCH"
url="/api/shippingZones/{zone_id}/methods/{method_id}"
requestSchema={{
  "type": "object",
  "properties": {
    "cost": {
      "type": ["string", "number"]
    },
    "is_enabled": {
      "type": ["integer", "string", "boolean"],
      "enum": [0, 1, "0", "1", true, false]
    },
    "calculation_type": {
      "type": "string",
      "enum": ["flat_rate", "price_based_rate", "weight_based_rate", "api"]
    },
    "condition_type": {
      "type": "string",
      "enum": ["weight", "price", "none"]
    }
  },
  "required": ["condition_type", "calculation_type"]
}}
responseSample={`{
  "data": {
    "method_id": "standard_shipping",
    "cost": 7.99
  }
}`}
/>

<hr/>

### Delete Zone Method

Removes a shipping method from a zone.

<Api
method="DELETE"
url="/api/shippingZones/{zone_id}/methods/{method_id}"
responseSample={`{
  "data": {
    "success": true
  }
}`}
/>
