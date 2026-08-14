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
description: Comprehensive guide to managing content pages in EverShop. Learn how to create, update, and delete CMS pages using the REST API.
---

# CMS Page API

## Overview

The CMS Page API provides endpoints for managing static content pages in your EverShop store. CMS pages are useful for creating informational content such as About Us, Contact Us, Terms and Conditions, Privacy Policy, and other content that doesn't fit within the product catalog structure.

Two things changed in recent releases that affect every integration:

- **Pages live at the root.** A page is served at `/<url_key>`, not `/page/<url_key>`. A literal request to `/page/<url_key>` answers `301` and redirects to `/<url_key>`.
- **`content` is a block array**, not an HTML string. It is the block-editor document that the admin page builder produces.

import Api from '@site/src/components/rest/Api';

## Endpoints

### Create A CMS Page

Creates a new content page.

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
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "minLength": 1,
      "maxLength": 255,
      "errorMessage": {
        "type": "URL key must be a string",
        "pattern": "URL key must contain only lowercase letters, numbers, and hyphens (e.g., 'my-product-name')",
        "minLength": "URL key cannot be empty",
        "maxLength": "URL key cannot exceed 255 characters"
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
  "required": [
    "status",
    "name",
    "url_key",
    "content",
    "meta_title"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "e15da567a66c11edb46b60d819134f39",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 10:15:32",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "about-us",
    "name": "About Our Company",
    "content": "[{\"id\":\"row-1\",\"size\":12,\"columns\":[{\"id\":\"col-1\",\"size\":12,\"data\":{\"blocks\":[{\"type\":\"paragraph\",\"data\":{\"text\":\"Welcome to our company.\"}}]}}]}]",
    "meta_title": "About Us | Our Company Story",
    "meta_keywords": "about us, company history, our story, mission",
    "meta_description": "Learn about our company's history, mission, and values.",
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
        "href": "/about-us",
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

Modifies an existing content page. Only `status` is required — send just the fields you want to change.

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
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "minLength": 1,
      "maxLength": 255,
      "errorMessage": {
        "type": "URL key must be a string",
        "pattern": "URL key must contain only lowercase letters, numbers, and hyphens (e.g., 'my-product-name')",
        "minLength": "URL key cannot be empty",
        "maxLength": "URL key cannot exceed 255 characters"
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
  "required": [
    "status"
  ],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 14:18:05",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "contact-us",
    "name": "Contact Us",
    "content": "[]",
    "meta_title": "Contact Us | Customer Support",
    "meta_keywords": "contact, customer service, support, help",
    "meta_description": "Contact our customer support team.",
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
        "href": "/contact-us",
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

Permanently removes a content page. Its `url_rewrite` row is removed with it.

<Api
method="DELETE"
url="/api/pages/433ba97f-8be7-4be9-be3f-a9f341f2b89f"
responseSample={`{
  "data": {
    "cms_page_id": 14,
    "uuid": "433ba97f-8be7-4be9-be3f-a9f341f2b89f",
    "status": 1,
    "created_at": "2023-02-07 10:15:32",
    "updated_at": "2023-02-07 14:18:05",
    "cms_page_description_id": 15,
    "cms_page_description_cms_page_id": 14,
    "url_key": "contact-us",
    "name": "Contact Us",
    "meta_title": "Contact Us | Customer Support",
    "meta_keywords": "contact, customer service, support, help",
    "meta_description": "Contact our customer support team."
  }
}`}
/>

<hr />

## The `content` Field

`content` is an array of **rows**. Each row has an `id`, a `size`, and a `columns` array; each column has an `id`, a `size`, and a `data` object holding the block-editor document.

```json
{
  "content": [
    {
      "id": "1a2b3c",
      "size": 12,
      "columns": [
        {
          "id": "4d5e6f",
          "size": 12,
          "data": {
            "blocks": [
              { "type": "header", "data": { "text": "About Us", "level": 1 } },
              { "type": "paragraph", "data": { "text": "We build things." } }
            ]
          }
        }
      ]
    }
  ]
}
```

Sending an HTML string fails validation with `Content must be an array`. Raw-HTML blocks inside the document are sanitized server-side on every save.

:::caution Asymmetric field
You **send** `content` as an array, but the REST response **returns** it as a JSON string. The column is `text`, so the array is serialized on write and echoed back verbatim. `JSON.parse` it before using it. The GraphQL `CmsPage.content` field parses it for you (and falls back to wrapping legacy raw HTML in a single block when the value is not valid JSON).
:::

:::info The `layout` column was dropped
`layout` is no longer part of the `cms_page` table. Sending it is harmless (unknown fields are dropped by the insert projection) but it is never persisted or returned.
:::

<hr />

## URL Key Rules

`url_key` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` — lowercase letters, digits and single hyphens between segments, 1 to 255 characters. `About Us`, `about_us`, `/about-us` and `about--us` are all rejected with a `400`.

Beyond the pattern, the save is rejected at the service layer when the slug would be unreachable or ambiguous. These checks run against the live route table and database, so they cannot be expressed in the payload schema:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rejection</th>
      <th>Message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Slug equals a single-segment storefront route (<code>cart</code>, <code>checkout</code>, <code>search</code>, <code>blog</code>, ...)</td>
      <td>URL key "cart" is reserved by a system route and would be unreachable.</td>
    </tr>
    <tr>
      <td>Slug equals an enabled language code (<code>fr</code>, <code>de</code>, ...)</td>
      <td>URL key "fr" conflicts with an enabled language code and would be unreachable.</td>
    </tr>
    <tr>
      <td>Slug already owned by another CMS page</td>
      <td>URL key "about-us" is already in use by another cms page.</td>
    </tr>
  </tbody>
</table>

Collisions **across** entity types are allowed — a landing page and a CMS page may share a slug, and request-time precedence resolves which one renders.

### Renaming Records a Redirect

Changing `url_key` on an existing page does three things in one transaction: it updates the page, repoints the page's `url_rewrite` row to the new slug, and records a `302` redirect from the old path to the new one. Old links keep working; you do not need to create the redirect yourself.

<hr />

## Reading Pages

There is no REST endpoint for reading CMS pages. Query them through GraphQL — see the [data fetching documentation](/docs/development/knowledge-base/data-fetching).
