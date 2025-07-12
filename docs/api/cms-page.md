---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - CMS Pages
  - Content Management
  - Static Pages
  - REST API
sidebar_label: CMS Pages
title: CMS Page REST API
description: Comprehensive guide to managing content pages in EverShop. Learn how to create, update, retrieve, and delete CMS pages using the REST API.
---

# CMS Page API

## Overview

The CMS Page API provides endpoints for managing static content pages in your EverShop store. CMS pages are useful for creating informational content such as About Us, Contact Us, Terms and Conditions, Privacy Policy, and other content that doesn't fit within the product catalog structure.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create a CMS Page

Creates a new content page in the system. You can specify the page content, layout, and SEO metadata.

<Api
method="POST"
url="/api/pages"
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
      "description": "Page status: 1 for published, 0 for unpublished"
    },
    "layout": {
      "type": "string",
      "enum": [
        "oneColumn",
        "twoColumnsLeft",
        "twoColumnsRight",
        "threeColumns"
      ],
      "description": "Page layout template to use for this content"
    },
    "name": {
      "type": "string",
      "description": "Title of the page displayed to visitors"
    },
    "content": {
      "type": "string",
      "description": "HTML content of the page"
    },
    "url_key": {
      "type": "string",
      "description": "URL-friendly identifier for the page"
    },
    "meta_title": {
      "type": "string",
      "description": "Meta title for SEO purposes"
    },
    "meta_description": {
      "type": "string",
      "description": "Meta description for SEO purposes"
    },
    "meta_keywords": {
      "type": "string",
      "description": "Meta keywords for SEO purposes"
    }
  },
  "required": [
    "status",
    "layout",
    "name",
    "url_key",
    "content",
    "meta_title",
    "meta_description",
    "meta_keywords"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "e15da567a66c11edb46b60d819134f39",
    "layout": "oneColumn",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 10:15:32",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "about-us",
    "name": "About Our Company",
    "content": "<h1>About Us</h1><p>Welcome to our company. We specialize in providing high-quality products and exceptional customer service.</p>",
    "meta_title": "About Us | Our Company Story",
    "meta_keywords": "about us, company history, our story, mission",
    "meta_description": "Learn about our company's history, mission, and values. Discover why customers choose us for their shopping needs.",
    "links": [
      {
        "rel": "cmsPageGrid",
        "href": "/admin/pages",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/pages/edit/e15da567a66c11edb46b60d819134f39",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/page/about-us",
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

### Update a CMS Page

Modifies an existing content page. You can update any of the page attributes, including content, layout, and SEO metadata.

<Api
method="PATCH"
url="/api/pages/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
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
      "description": "Page status: 1 for published, 0 for unpublished"
    },
    "layout": {
      "type": "string",
      "enum": [
        "oneColumn",
        "twoColumnsLeft",
        "twoColumnsRight",
        "threeColumns"
      ],
      "description": "Page layout template to use for this content"
    },
    "name": {
      "type": "string",
      "description": "Title of the page displayed to visitors"
    },
    "content": {
      "type": "string",
      "description": "HTML content of the page"
    },
    "url_key": {
      "type": "string",
      "description": "URL-friendly identifier for the page"
    },
    "meta_title": {
      "type": "string",
      "description": "Meta title for SEO purposes"
    },
    "meta_description": {
      "type": "string",
      "description": "Meta description for SEO purposes"
    },
    "meta_keywords": {
      "type": "string",
      "description": "Meta keywords for SEO purposes"
    }
  },
  "required": [
    "name"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "layout": "oneColumn",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 14:18:05",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "contact-us",
    "name": "Contact Us",
    "content": "<h1>Contact Us</h1><p>We'd love to hear from you! Please use the form below to get in touch with our customer service team.</p><form>...</form>",
    "meta_title": "Contact Us | Customer Support",
    "meta_keywords": "contact, customer service, support, help",
    "meta_description": "Contact our customer support team for assistance with orders, returns, or product questions.",
    "links": [
      {
        "rel": "cmsPageGrid",
        "href": "/admin/pages",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/pages/edit/433ba97f-8be7-4be9-be3f-a9f341f2b89f",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "view",
        "href": "/page/contact-us",
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

### Delete a CMS Page

Permanently removes a content page from the system.

<Api
method="DELETE"
url="/api/pages/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "layout": "twoColumnsLeft",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 14:18:05",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "contact-us",
    "name": "Contact Us",
    "content": "<h1>Contact Us</h1><p>We'd love to hear from you! Please use the form below to get in touch with our customer service team.</p><form>...</form>",
    "meta_title": "Contact Us | Customer Support",
    "meta_keywords": "contact, customer service, support, help",
    "meta_description": "Contact our customer support team for assistance with orders, returns, or product questions."
  }
}`}
/>

<hr />

### Get a CMS Page

Retrieves detailed information about a specific content page.

<Api
method="GET"
url="/api/pages/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "layout": "oneColumn",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 14:18:05",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "contact-us",
    "name": "Contact Us",
    "content": "<h1>Contact Us</h1><p>We'd love to hear from you! Please use the form below to get in touch with our customer service team.</p><form>...</form>",
    "meta_title": "Contact Us | Customer Support",
    "meta_keywords": "contact, customer service, support, help",
    "meta_description": "Contact our customer support team for assistance with orders, returns, or product questions."
  }
}`}
/>

<hr />

### List All CMS Pages

Retrieves a paginated list of all content pages in the system.

<Api
method="GET"
url="/api/pages"
responseSample={`{
  "data": [
    {
      "cms_page_id": 12,
      "uuid": "d15da567a66c11edb46b60d819134f39",
      "layout": "oneColumn",
      "status": 1,
      "created_at": "2023-02-06 10:15:32",
      "updated_at": "2023-02-06 10:15:32",
      "name": "About Us",
      "url_key": "about-us",
      "content": "<h1>About Us</h1><p>Welcome to our company...</p>"
    },
    {
      "cms_page_id": 13,
      "uuid": "d35da567a66c11edb46b60d819134f39",
      "layout": "twoColumnsRight",
      "status": 1,
      "created_at": "2023-02-06 11:20:15",
      "updated_at": "2023-02-06 11:20:15",
      "name": "Terms and Conditions",
      "url_key": "terms-and-conditions",
      "content": "<h1>Terms and Conditions</h1><p>Please read our terms carefully...</p>"
    },
    {
      "cms_page_id": 14,
      "uuid": "e15da567a66c11edb46b60d819134f39",
      "layout": "oneColumn",
      "status": 1,
      "created_at": "2023-02-07 10:15:32",
      "updated_at": "2023-02-07 14:18:05",
      "name": "Contact Us",
      "url_key": "contact-us",
      "content": "<h1>Contact Us</h1><p>We'd love to hear from you...</p>"
    }
  ],
  "links": {
    "first": "/api/pages?page=1",
    "last": "/api/pages?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "/api/pages",
    "per_page": 20,
    "to": 3,
    "total": 3
  }
}`}
/>

## Error Handling

All endpoints may return the following error responses:

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 400         | Bad Request - Invalid parameters       |
| 401         | Unauthorized - Authentication required |
| 403         | Forbidden - Insufficient permissions   |
| 404         | Not Found - CMS page doesn't exist     |
| 500         | Server Error - Something went wrong    |

Error responses follow this format:

```json
{
  "error": {
    "status": 404,
    "message": "CMS page not found"
  }
}
```

## Page Layouts

EverShop provides several page layout options for CMS pages:

| Layout Option   | Description                                    |
| --------------- | ---------------------------------------------- |
| oneColumn       | Full-width content area                        |
| twoColumnsLeft  | Content area with a left sidebar               |
| twoColumnsRight | Content area with a right sidebar              |
| threeColumns    | Content area with both left and right sidebars |
