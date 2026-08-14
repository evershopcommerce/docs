---
sidebar_position: 20
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Blog
  - Blog Post
  - Blog Category
  - Blog Tag
  - Blog Comment
  - REST API
sidebar_label: Blog
title: Blog REST API
description: Complete reference for EverShop's blog REST API — create, update and delete posts, categories and tags, moderate comments, and the public comment and reaction endpoints.
---

import Api from '@site/src/components/rest/Api';

# Blog API

## Overview

The Blog API manages the content of the core `blog` module: posts, categories, tags, comments, and reactions. It exposes **14 endpoints** across two very different access levels.

Eleven endpoints are **private** — they require an admin access token exactly like every other admin endpoint (see [Authentication](./authentication.md)).

Three endpoints are **public**. They accept unauthenticated writes from anonymous storefront visitors, because that is what a comment box and a reaction button need. Read the [Public endpoints](#public-endpoints) section before exposing your store — these are the only write surfaces in EverShop that anyone on the internet can call.

Every `{id}` path parameter is the entity's **uuid**, not its integer primary key.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Endpoint</th>
      <th>Access</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>POST</td><td><code>/api/blog/posts</code></td><td>Private</td><td>Create a post</td></tr>
    <tr><td>PATCH</td><td><code>/api/blog/posts/&#123;id&#125;</code></td><td>Private</td><td>Update a post</td></tr>
    <tr><td>DELETE</td><td><code>/api/blog/posts/&#123;id&#125;</code></td><td>Private</td><td>Delete a post</td></tr>
    <tr><td>POST</td><td><code>/api/blog/categories</code></td><td>Private</td><td>Create a category</td></tr>
    <tr><td>PATCH</td><td><code>/api/blog/categories/&#123;id&#125;</code></td><td>Private</td><td>Update a category</td></tr>
    <tr><td>DELETE</td><td><code>/api/blog/categories/&#123;id&#125;</code></td><td>Private</td><td>Delete a category</td></tr>
    <tr><td>POST</td><td><code>/api/blog/tags</code></td><td>Private</td><td>Create a tag</td></tr>
    <tr><td>PATCH</td><td><code>/api/blog/tags/&#123;id&#125;</code></td><td>Private</td><td>Update a tag</td></tr>
    <tr><td>DELETE</td><td><code>/api/blog/tags/&#123;id&#125;</code></td><td>Private</td><td>Delete a tag</td></tr>
    <tr><td>PATCH</td><td><code>/api/blog/comments/&#123;id&#125;</code></td><td>Private</td><td>Moderate a comment</td></tr>
    <tr><td>DELETE</td><td><code>/api/blog/comments/&#123;id&#125;</code></td><td>Private</td><td>Delete a comment</td></tr>
    <tr><td>POST</td><td><code>/api/blog/comments</code></td><td><strong>Public</strong></td><td>Submit a comment</td></tr>
    <tr><td>POST</td><td><code>/api/blog/comments/&#123;id&#125;/like</code></td><td><strong>Public</strong></td><td>Toggle a comment like</td></tr>
    <tr><td>POST</td><td><code>/api/blog/posts/&#123;id&#125;/react</code></td><td><strong>Public</strong></td><td>Toggle a post reaction</td></tr>
  </tbody>
</table>

There are no `GET` endpoints. Blog content is read through GraphQL — see the [Blog module guide](/docs/development/knowledge-base/blog) for the `blogPost`, `blogPosts`, `blogCategories`, `blogTags`, and `blogComments` queries.

## Endpoints

### Create A Blog Post

Creates a blog post. Only `name` is required; everything else has a database default.

`description` is a **block array** (the Editor.js document shape), not an HTML string — each entry is a row object containing `columns`, and each column carries `data.blocks`. `reading_time` is computed from it inside the transaction and stored on the post, so you never send it.

`url_key` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` — lowercase letters, digits, and single hyphens. Omit it and a database trigger slugifies `name` for you. Blog slugs get **no** numeric disambiguation suffix, so two posts with the same name collide on the `url_key` unique constraint; set an explicit `url_key` in that case.

`tags` is an array of blog tag ids, replacing the post's tag pivot. `category_id` and `author_id` accept an integer, a numeric string, or `null` — an empty string is coerced to `null`.

`metafields` is folded into the post's `meta_data` JSONB column and is shaped `{ namespace: { key: value } }`. It is validated against the `blog_post` metafield definitions. Omit the key entirely to leave `meta_data` untouched.

Setting `status` to `1` stamps `published_at` with the current time if it is not already set. There is no publishing scheduler.

<Api
method="POST"
url="/api/blog/posts"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1]
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "minLength": "Post name is required"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "short_description": {
      "type": ["string", "null"]
    },
    "description": {
      "type": "array",
      "skipEscape": true,
      "items": {
        "type": "object"
      }
    },
    "category_id": {
      "type": ["integer", "string", "null"]
    },
    "author_id": {
      "type": ["integer", "string", "null"]
    },
    "thumbnail": {
      "type": ["string", "null"]
    },
    "tags": {
      "type": "array",
      "items": {
        "type": ["integer", "string"]
      }
    },
    "published_at": {
      "type": ["string", "null"]
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    },
    "metafields": {
      "type": "object",
      "skipEscape": true
    }
  },
  "additionalProperties": true,
  "required": ["name"]
}}
responseSample={`{
  "data": {
    "blog_post_id": 12,
    "uuid": "9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55",
    "status": 1,
    "category_id": 3,
    "author_id": 1,
    "thumbnail": "/assets/catalog/blog/summer-guide.jpg",
    "reaction_counts": {},
    "comment_count": 0,
    "reading_time": 4,
    "published_at": "2026-02-18T09:12:44.108Z",
    "meta_data": {
      "custom": {
        "featured": true
      }
    },
    "created_at": "2026-02-18 09:12:44",
    "updated_at": "2026-02-18 09:12:44",
    "blog_post_description_id": 12,
    "blog_post_description_blog_post_id": 12,
    "name": "A Complete Guide To Summer Fabrics",
    "short_description": "Linen, cotton, and everything between.",
    "url_key": "a-complete-guide-to-summer-fabrics",
    "meta_title": "Summer Fabrics Guide",
    "meta_description": "How to choose fabrics that breathe.",
    "links": [
      {
        "rel": "blogPostGrid",
        "href": "/admin/blog/posts",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/blog/posts/edit/9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      }
    ]
  }
}`}
/>

A minimal `description` payload looks like this:

```json
{
  "name": "A Complete Guide To Summer Fabrics",
  "status": 1,
  "description": [
    {
      "id": "row-1",
      "size": 12,
      "columns": [
        {
          "id": "col-1",
          "size": 12,
          "data": {
            "blocks": [
              {
                "type": "header",
                "data": { "text": "Why fabric weight matters" }
              },
              {
                "type": "paragraph",
                "data": { "text": "Lighter weaves move more air." }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

<hr />

### Update A Blog Post

Updates an existing post. Identical to the create payload except that **nothing is required** — send only the fields you want to change.

`reading_time` is recomputed only when `description` is present in the payload. Supplying `tags` replaces the whole tag set; omitting it leaves the existing tags alone. Changing `url_key` re-points the post's `url_rewrite` row, so the old friendly URL stops resolving.

<Api
method="PATCH"
url="/api/blog/posts/9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1]
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "short_description": {
      "type": ["string", "null"]
    },
    "description": {
      "type": "array",
      "skipEscape": true,
      "items": {
        "type": "object"
      }
    },
    "category_id": {
      "type": ["integer", "string", "null"]
    },
    "author_id": {
      "type": ["integer", "string", "null"]
    },
    "thumbnail": {
      "type": ["string", "null"]
    },
    "tags": {
      "type": "array",
      "items": {
        "type": ["integer", "string"]
      }
    },
    "published_at": {
      "type": ["string", "null"]
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    },
    "metafields": {
      "type": "object",
      "skipEscape": true
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "blog_post_id": 12,
    "uuid": "9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55",
    "status": 1,
    "category_id": 3,
    "author_id": 1,
    "thumbnail": "/assets/catalog/blog/summer-guide.jpg",
    "reaction_counts": {
      "like": 8,
      "clap": 2
    },
    "comment_count": 5,
    "reading_time": 6,
    "published_at": "2026-02-18T09:12:44.108Z",
    "meta_data": {},
    "created_at": "2026-02-18 09:12:44",
    "updated_at": "2026-02-19 14:03:02",
    "name": "A Complete Guide To Summer Fabrics (2026)",
    "short_description": "Linen, cotton, and everything between.",
    "url_key": "a-complete-guide-to-summer-fabrics",
    "meta_title": "Summer Fabrics Guide",
    "meta_description": "How to choose fabrics that breathe.",
    "links": [
      {
        "rel": "blogPostGrid",
        "href": "/admin/blog/posts",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/blog/posts/edit/9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55",
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

### Delete A Blog Post

Permanently removes a post. The description row, tag pivot rows, and all comments cascade via foreign keys, and the post's `url_rewrite` row is removed by the `blog_post_deleted` subscriber. The response body is the post as it was before deletion.

<Api
method="DELETE"
url="/api/blog/posts/9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55"
responseSample={`{
  "data": {
    "blog_post_id": 12,
    "uuid": "9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55",
    "status": 1,
    "category_id": 3,
    "author_id": 1,
    "thumbnail": "/assets/catalog/blog/summer-guide.jpg",
    "reaction_counts": {
      "like": 8
    },
    "comment_count": 5,
    "reading_time": 6,
    "published_at": "2026-02-18T09:12:44.108Z",
    "meta_data": {},
    "created_at": "2026-02-18 09:12:44",
    "updated_at": "2026-02-19 14:03:02"
  }
}`}
/>

<hr />

### Create A Blog Category

Creates a blog category. `name` is required.

`comment_policy` decides what happens to comments submitted on posts in this category and accepts exactly `open`, `moderated`, or `closed`. It defaults to `moderated` at the database level, which stores new comments as `pending` until an admin approves them. `open` auto-approves; `closed` makes the public comment endpoint respond `403`.

`position` orders categories in listings. `metafields` is folded into the category's `meta_data` column against the `blog_category` definitions.

<Api
method="POST"
url="/api/blog/categories"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1]
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "minLength": "Category name is required"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "comment_policy": {
      "type": "string",
      "enum": ["open", "moderated", "closed"]
    },
    "short_description": {
      "type": ["string", "null"]
    },
    "position": {
      "type": ["integer", "string", "null"]
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    },
    "metafields": {
      "type": "object",
      "skipEscape": true
    }
  },
  "additionalProperties": true,
  "required": ["name"]
}}
responseSample={`{
  "data": {
    "blog_category_id": 3,
    "uuid": "1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b",
    "status": 1,
    "comment_policy": "moderated",
    "position": 10,
    "meta_data": {},
    "created_at": "2026-02-10 11:40:07",
    "updated_at": "2026-02-10 11:40:07",
    "blog_category_description_id": 3,
    "blog_category_description_blog_category_id": 3,
    "name": "Style Guides",
    "short_description": "How to wear it.",
    "url_key": "style-guides",
    "meta_title": "Style Guides",
    "meta_description": "Seasonal styling advice.",
    "links": [
      {
        "rel": "blogCategoryGrid",
        "href": "/admin/blog/categories",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/blog/categories/edit/1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b",
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

### Update A Blog Category

Updates a category. No field is required. Changing `comment_policy` affects comments submitted from that point on; comments already stored keep their status until moderated.

<Api
method="PATCH"
url="/api/blog/categories/1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": ["string", "integer"],
      "enum": ["0", "1", 0, 1]
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "comment_policy": {
      "type": "string",
      "enum": ["open", "moderated", "closed"]
    },
    "short_description": {
      "type": ["string", "null"]
    },
    "position": {
      "type": ["integer", "string", "null"]
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    },
    "metafields": {
      "type": "object",
      "skipEscape": true
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "blog_category_id": 3,
    "uuid": "1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b",
    "status": 1,
    "comment_policy": "open",
    "position": 10,
    "meta_data": {},
    "created_at": "2026-02-10 11:40:07",
    "updated_at": "2026-02-20 08:22:31",
    "name": "Style Guides",
    "short_description": "How to wear it.",
    "url_key": "style-guides",
    "meta_title": "Style Guides",
    "meta_description": "Seasonal styling advice.",
    "links": [
      {
        "rel": "blogCategoryGrid",
        "href": "/admin/blog/categories",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/blog/categories/edit/1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b",
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

### Delete A Blog Category

Permanently removes a category. Posts in the category are **not** deleted — `blog_post.category_id` is `ON DELETE SET NULL`, so those posts become uncategorised and fall back to the default `moderated` comment policy.

<Api
method="DELETE"
url="/api/blog/categories/1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b"
responseSample={`{
  "data": {
    "blog_category_id": 3,
    "uuid": "1a7d5e90-3c62-4f18-8b44-05e9d7c21a6b",
    "status": 1,
    "comment_policy": "open",
    "position": 10,
    "meta_data": {},
    "created_at": "2026-02-10 11:40:07",
    "updated_at": "2026-02-20 08:22:31"
  }
}`}
/>

<hr />

### Create A Blog Tag

Creates a tag. `name` is required. Tags are a single flat table — there is no description split, no status, and **no `metafields` key**.

<Api
method="POST"
url="/api/blog/tags"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "errorMessage": {
        "minLength": "Tag name is required"
      }
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    }
  },
  "additionalProperties": true,
  "required": ["name"]
}}
responseSample={`{
  "data": {
    "blog_tag_id": 7,
    "uuid": "c53f8a10-9b47-4de2-a1f6-77b0d3e4c982",
    "name": "Linen",
    "url_key": "linen",
    "meta_title": "Linen",
    "meta_description": "Posts about linen.",
    "created_at": "2026-02-11 16:05:19",
    "links": [
      {
        "rel": "blogTagGrid",
        "href": "/admin/blog/tags",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/blog/tags/edit/c53f8a10-9b47-4de2-a1f6-77b0d3e4c982",
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

### Update A Blog Tag

Updates a tag. No field is required.

<Api
method="PATCH"
url="/api/blog/tags/c53f8a10-9b47-4de2-a1f6-77b0d3e4c982"
requestSchema={{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "url_key": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "meta_title": {
      "type": ["string", "null"]
    },
    "meta_description": {
      "type": ["string", "null"]
    }
  },
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "blog_tag_id": 7,
    "uuid": "c53f8a10-9b47-4de2-a1f6-77b0d3e4c982",
    "name": "Linen & Cotton",
    "url_key": "linen-and-cotton",
    "meta_title": "Linen",
    "meta_description": "Posts about linen.",
    "created_at": "2026-02-11 16:05:19",
    "links": [
      {
        "rel": "blogTagGrid",
        "href": "/admin/blog/tags",
        "action": "GET",
        "types": [
          "text/xml"
        ]
      },
      {
        "rel": "edit",
        "href": "/admin/blog/tags/edit/c53f8a10-9b47-4de2-a1f6-77b0d3e4c982",
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

### Delete A Blog Tag

Permanently removes a tag. Its `blog_post_tag` pivot rows cascade, so the tag simply disappears from every post that carried it.

<Api
method="DELETE"
url="/api/blog/tags/c53f8a10-9b47-4de2-a1f6-77b0d3e4c982"
responseSample={`{
  "data": {
    "blog_tag_id": 7,
    "uuid": "c53f8a10-9b47-4de2-a1f6-77b0d3e4c982",
    "name": "Linen & Cotton",
    "url_key": "linen-and-cotton",
    "meta_title": "Linen",
    "meta_description": "Posts about linen.",
    "created_at": "2026-02-11 16:05:19"
  }
}`}
/>

<hr />

### Moderate A Blog Comment

Flips a comment's moderation status. `status` is **required** and must be one of `pending`, `approved`, or `spam`. The post's `comment_count` is recomputed from the approved comments in the same transaction.

Only `approved` comments are returned by the storefront `comments` GraphQL field. `spam` comments are retained in the database, never displayed.

<Api
method="PATCH"
url="/api/blog/comments/4e19b7c3-2a58-41d6-b0f9-6c8e5d2a7143"
requestSchema={{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "approved", "spam"]
    }
  },
  "required": ["status"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "uuid": "4e19b7c3-2a58-41d6-b0f9-6c8e5d2a7143",
    "status": "approved"
  }
}`}
/>

<hr />

### Delete A Blog Comment

Permanently removes a comment. Replies cascade through the self-referencing `parent_id` foreign key, the comment's like rows in `blog_reaction` are purged, and the post's `comment_count` is recomputed.

<Api
method="DELETE"
url="/api/blog/comments/4e19b7c3-2a58-41d6-b0f9-6c8e5d2a7143"
responseSample={`{
  "data": {
    "uuid": "4e19b7c3-2a58-41d6-b0f9-6c8e5d2a7143"
  }
}`}
/>

<hr />

## Public endpoints

:::warning Unauthenticated write surface
The three endpoints below carry `"access": "public"` in their `route.json`. They accept writes from **any unauthenticated caller** — no admin token, no customer session. This is intentional: anonymous visitors must be able to comment and react. It also means they are the blog module's spam and abuse surface.

The module ships these defences out of the box:

- **Moderation by default.** A category's `comment_policy` defaults to `moderated`, so submitted comments land as `pending` and never reach the storefront until an admin approves them. A post with no category also falls back to `moderated`.
- **Strict sanitisation.** `name` and `comment` are run through `sanitizeHtml` with **no allowed tags or attributes**, whitespace-collapsed, and truncated to 120 and 5000 characters respectively.
- **A honeypot field.** The optional `website` field is hidden in the storefront form. Any submission that fills it is stored as `spam`.
- **A link heuristic.** A comment containing more than three `http(s)://` occurrences is stored as `spam`.
- **Cookie-scoped reactions.** Reactions are de-duplicated by a signed, `httpOnly` `blog_visitor` cookie, and the unique constraint on `blog_reaction` caps a visitor at one reaction per post and one like per comment.

None of this is rate limiting. Put your usual rate limiter or WAF rule in front of these three routes before going live.
:::

### Submit A Blog Comment

Creates a comment on a published post. **Public — no authentication.**

The post is addressed by `post_uuid` **in the request body**, not by a path parameter, and it must resolve to a post with `status = 1`. Optionally set `parent_uuid` to reply to an existing comment; the parent must belong to the same post and already be `approved`, otherwise the reply is silently attached at the root instead.

`website` is the honeypot — leave it out of real submissions.

The response reports the status the comment was assigned, so the storefront can show "your comment is awaiting moderation" versus rendering it immediately.

When the post's category has `comment_policy: "closed"`, this endpoint responds `403` with `{ "error": { "status": 403, "message": "Comments are closed for this post" } }`.

<Api
method="POST"
url="/api/blog/comments"
requestSchema={{
  "type": "object",
  "properties": {
    "post_uuid": {
      "type": "string",
      "minLength": 1
    },
    "parent_uuid": {
      "type": ["string", "null"]
    },
    "name": {
      "type": "string",
      "skipEscape": true,
      "minLength": 1,
      "errorMessage": {
        "minLength": "Name is required"
      }
    },
    "email": {
      "type": "string",
      "pattern": "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      "errorMessage": {
        "pattern": "A valid email is required"
      }
    },
    "comment": {
      "type": "string",
      "skipEscape": true,
      "minLength": 1,
      "errorMessage": {
        "minLength": "Comment is required"
      }
    },
    "website": {
      "type": ["string", "null"]
    }
  },
  "required": ["post_uuid", "name", "email", "comment"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "uuid": "4e19b7c3-2a58-41d6-b0f9-6c8e5d2a7143",
    "status": "pending"
  }
}`}
/>

The stored comment's `email` is write-only. It is declared on the admin GraphQL schema only and is never exposed on the storefront.

<hr />

### Like A Blog Comment

Toggles the current visitor's like on an `approved` comment. **Public — no authentication.**

`{id}` is the comment uuid. There is no request body — `like` is the only reaction type a comment supports.

The visitor is identified by the signed, `httpOnly`, `sameSite: 'lax'` `blog_visitor` cookie. Because this is a write path, the cookie is **issued on the response** when the caller does not already have one, with a one-year lifetime. Calling the endpoint again with the same cookie removes the like. `blog_comment.like_count` is recomputed from `blog_reaction` inside the transaction.

<Api
method="POST"
url="/api/blog/comments/4e19b7c3-2a58-41d6-b0f9-6c8e5d2a7143/like"
responseSample={`{
  "data": {
    "likeCount": 13,
    "liked": true
  }
}`}
/>

<hr />

### React To A Blog Post

Toggles the current visitor's reaction on a published post. **Public — no authentication.**

`{id}` is the post uuid. `type` is **required** and must be one of exactly four values:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Entity</th>
      <th>Allowed reaction types</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Blog post</td>
      <td><code>like</code>, <code>love</code>, <code>clap</code>, <code>insightful</code></td>
    </tr>
    <tr>
      <td>Blog comment</td>
      <td><code>like</code> only (implicit — the like endpoint takes no body)</td>
    </tr>
  </tbody>
</table>

A visitor holds **at most one reaction per post**. Sending the same `type` twice removes the reaction and returns `"reacted": null`; sending a different `type` switches the existing reaction rather than adding a second one. The post's `reaction_counts` JSONB column is rebuilt from `blog_reaction` in the same transaction and returned as `counts` — it only contains keys with a non-zero count.

Like the comment-like endpoint, this is a write path, so the `blog_visitor` cookie is issued on the response when absent.

<Api
method="POST"
url="/api/blog/posts/9f2b1c44-6d81-4a20-9d0e-2f7c8a1b3e55/react"
requestSchema={{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["like", "love", "clap", "insightful"]
    }
  },
  "required": ["type"],
  "additionalProperties": true
}}
responseSample={`{
  "data": {
    "counts": {
      "like": 9,
      "clap": 2
    },
    "reacted": "like"
  }
}`}
/>

<hr />

## Get Blog Data with GraphQL

The Blog API is write-only. Posts, categories, tags, and comments are read through GraphQL — `blogPost`, `blogPosts`, `currentBlogPost`, `blogCategory`, `blogCategories`, `currentBlogCategory`, `blogTag`, `blogTags`, `currentBlogTag`, and the admin-only `blogComments`.

See the [Blog module guide](/docs/development/knowledge-base/blog) for the full schema and collection filters, and the [GraphQL documentation](/docs/development/knowledge-base/data-fetching) for how to issue queries.
