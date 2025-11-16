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

### Create A CMS Page

Creates a new content page in the system. You can specify the page content, layout, and SEO metadata.

<Api
method="POST"
url="/api/pages"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1],
      "errorMessage": {
        "type": "Status must be a string or number",
        "enum": "Status must be either 0, 1, '0', or '1'"
      }
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Page name must be a string",
        "minLength": "Page name is required and cannot be empty"
      }
    },
    "content": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "errorMessage": {
              "type": "Content block ID must be a string"
            }
          },
          "size": {
            "type": "number",
            "errorMessage": {
              "type": "Content block size must be a number"
            }
          },
          "columns": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "errorMessage": {
                    "type": "Column ID must be a string"
                  }
                },
                "size": {
                  "type": "number",
                  "errorMessage": {
                    "type": "Column size must be a number"
                  }
                },
                "data": {
                  "type": "object",
                  "errorMessage": {
                    "type": "Column data must be an object"
                  }
                }
              },
              "required": ["id", "size", "data"],
              "errorMessage": {
                "required": {
                  "id": "Column ID is required",
                  "size": "Column size is required",
                  "data": "Column data is required"
                }
              }
            },
            "errorMessage": {
              "type": "Columns must be an array"
            }
          }
        },
        "required": ["id", "size", "columns"],
        "errorMessage": {
          "required": {
            "id": "Content block ID is required",
            "size": "Content block size is required",
            "columns": "Content block columns are required"
          }
        }
      },
      "default": [],
      "errorMessage": {
        "type": "Content must be an array"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^\\S+$",
      "errorMessage": {
        "type": "URL key must be a string",
        "pattern": "URL key cannot contain spaces"
      }
    },
    "meta_title": {
      "type": "string",
      "errorMessage": {
        "type": "Meta title must be a string"
      }
    },
    "meta_description": {
      "type": "string",
      "errorMessage": {
        "type": "Meta description must be a string"
      }
    },
    "meta_keywords": {
      "type": "string",
      "errorMessage": {
        "type": "Meta keywords must be a string"
      }
    }
  },
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

### Update A CMS Page

Modifies an existing content page. You can update any of the page attributes, including content, layout, and SEO metadata.

<Api
method="PATCH"
url="/api/pages/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1],
      "errorMessage": {
        "type": "Status must be a string or number",
        "enum": "Status must be either 0, 1, '0', or '1'"
      }
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "type": "Page name must be a string",
        "minLength": "Page name is required and cannot be empty"
      }
    },
    "content": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "errorMessage": {
              "type": "Content block ID must be a string"
            }
          },
          "size": {
            "type": "number",
            "errorMessage": {
              "type": "Content block size must be a number"
            }
          },
          "columns": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "errorMessage": {
                    "type": "Column ID must be a string"
                  }
                },
                "size": {
                  "type": "number",
                  "errorMessage": {
                    "type": "Column size must be a number"
                  }
                },
                "data": {
                  "type": "object",
                  "errorMessage": {
                    "type": "Column data must be an object"
                  }
                }
              },
              "required": ["id", "size", "data"],
              "errorMessage": {
                "required": {
                  "id": "Column ID is required",
                  "size": "Column size is required",
                  "data": "Column data is required"
                }
              }
            },
            "errorMessage": {
              "type": "Columns must be an array"
            }
          }
        },
        "required": ["id", "size", "columns"],
        "errorMessage": {
          "required": {
            "id": "Content block ID is required",
            "size": "Content block size is required",
            "columns": "Content block columns are required"
          }
        }
      },
      "default": [],
      "errorMessage": {
        "type": "Content must be an array"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^\\S+$",
      "errorMessage": {
        "type": "URL key must be a string",
        "pattern": "URL key cannot contain spaces"
      }
    },
    "meta_title": {
      "type": "string",
      "errorMessage": {
        "type": "Meta title must be a string"
      }
    },
    "meta_description": {
      "type": "string",
      "errorMessage": {
        "type": "Meta description must be a string"
      }
    },
    "meta_keywords": {
      "type": "string",
      "errorMessage": {
        "type": "Meta keywords must be a string"
      }
    }
  },
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

### Delete A CMS Page

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

### Get CMS Page Data with GraphQL

EverShop uses GraphQL for querying CMS page data. For detailed information on how to query CMS pages, refer to the [GraphQL API documentation](/docs/development/knowledge-base/data-fetching).
