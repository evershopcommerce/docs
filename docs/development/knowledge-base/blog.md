---
sidebar_position: 55
keywords:
  - blog
  - blog post
  - blog category
  - blog tag
  - blog comment
  - reactions
  - rss
sidebar_label: Blog
title: Blog Module
description: How EverShop's core blog module works — storefront routes and friendly URLs, the database schema, the GraphQL surface, comment moderation, reactions, reading time, the featured blogs widget, blog URNs, metafields, and sitemap collectors.
---

# Blog Module

The **blog** module is a core EverShop module (`packages/evershop/src/modules/blog`) that adds posts, categories, tags, comments, and reactions to the storefront. It is enabled by default — there is nothing to install. Like every other core module it owns its own migration, GraphQL types, admin pages, storefront pages, REST endpoints, and a `bootstrap.ts` that registers a widget, sitemap collectors, URN link loaders, and collection filters.

This page describes how the module is wired. For the HTTP surface, see the [Blog REST API](/docs/api/blog).

## Storefront routes and friendly URLs

The module declares five storefront routes. Two of them are addressable directly; the other three are only ever reached through a `url_rewrite` row.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Route ID</th>
      <th>Declared path</th>
      <th>Friendly URL</th>
      <th>Editable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>blogHome</code></td>
      <td><code>/blog</code></td>
      <td><code>/blog</code></td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><code>blogRss</code></td>
      <td><code>/blog/rss.xml</code></td>
      <td><code>/blog/rss.xml</code></td>
      <td>No</td>
    </tr>
    <tr>
      <td><code>blogPostView</code></td>
      <td><code>/blogPost/:uuid</code></td>
      <td><code>/blog/&lt;slug&gt;</code></td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><code>blogCategoryView</code></td>
      <td><code>/blogCategory/:uuid</code></td>
      <td><code>/blog/category/&lt;slug&gt;</code></td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><code>blogTagView</code></td>
      <td><code>/blogTag/:uuid</code></td>
      <td><code>/blog/tag/&lt;slug&gt;</code></td>
      <td>Yes</td>
    </tr>
  </tbody>
</table>

`editable: true` means the page participates in the page builder, so widgets can be placed on it.

### How the friendly URLs are built

Post, category, and tag URLs are **not** hardcoded in the router. They come from rows in the shared `url_rewrite` table, written by event subscribers when the entity is created or updated and removed when it is deleted:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Event</th>
      <th>Subscriber</th>
      <th>Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>blog_post_created</code> / <code>blog_post_updated</code></td>
      <td><code>subscribers/blog_post_*/buildUrlRewrite.ts</code></td>
      <td>Upserts <code>/blog/&#123;url_key&#125;</code> → <code>/blogPost/&#123;uuid&#125;</code></td>
    </tr>
    <tr>
      <td><code>blog_category_created</code> / <code>blog_category_updated</code></td>
      <td><code>subscribers/blog_category_*/buildUrlRewrite.ts</code></td>
      <td>Upserts <code>/blog/category/&#123;url_key&#125;</code> → <code>/blogCategory/&#123;uuid&#125;</code></td>
    </tr>
    <tr>
      <td><code>blog_tag_created</code> / <code>blog_tag_updated</code></td>
      <td><code>subscribers/blog_tag_*/buildUrlRewrite.ts</code></td>
      <td>Upserts <code>/blog/tag/&#123;url_key&#125;</code> → <code>/blogTag/&#123;uuid&#125;</code></td>
    </tr>
    <tr>
      <td><code>blog_post_deleted</code> / <code>blog_category_deleted</code> / <code>blog_tag_deleted</code></td>
      <td><code>subscribers/*_deleted/deleteUrlRewrite.ts</code></td>
      <td>Deletes the row by <code>entity_uuid</code> + <code>entity_type</code></td>
    </tr>
  </tbody>
</table>

The upsert uses `entity_uuid` as the conflict key, so renaming a post replaces its `request_path` rather than accumulating stale rewrites. Every subscriber is a no-op when `url_key` is missing, and every one swallows its own errors through `error()` so a rewrite failure never rolls back the entity write — the entity is still reachable at its internal `/blogPost/<uuid>` path.

The `entity_type` values written are `blog_post`, `blog_category`, and `blog_tag`.

### `/blog` is a reserved slug

`assertUrlKeyAvailable` (`modules/base/services/assertUrlKeyAvailable.ts`) refuses any `url_key` that matches a **single-segment, non-admin, non-API storefront route**. It builds that list dynamically from the live route table rather than from a hardcoded array:

```ts
const reserved = getRoutes()
  .filter((r) => !r.isAdmin && !r.isApi && /^\/[a-zA-Z0-9-]+$/.test(r.path))
  .map((r) => r.path);
```

Because `blogHome` declares `/blog`, creating a CMS page or a landing page with `url_key: "blog"` throws:

```
URL key "blog" is reserved by a system route and would be unreachable.
```

This is not cosmetic — the route matcher runs before the `url_rewrite` fallback, so a CMS page at `/blog` would be permanently shadowed by the blog home page. Note that the other blog routes are **not** reserved: `/blogPost/:uuid`, `/blogCategory/:uuid`, and `/blogTag/:uuid` contain a parameter and `/blog/rss.xml` has two segments, so none of them match the single-segment pattern.

### The RSS feed

`blogRss` is a plain middleware page with no React component. It selects the 20 most recent published posts, renders RSS 2.0 by hand, sets `Content-Type: application/rss+xml; charset=utf-8` plus `Cache-Control: public, max-age=3600`, and calls `response.send()` **without** calling `next()` — which short-circuits the React render pipeline. Item links are built from the pretty path (`<baseUrl>/blog/<url_key>`).

### Page context values

The storefront middlewares publish context so resolvers can find the current entity:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Context key</th>
      <th>Set by</th>
      <th>Used by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>currentBlogPostId</code></td>
      <td><code>blogPostView</code></td>
      <td><code>currentBlogPost</code> query</td>
    </tr>
    <tr>
      <td><code>currentBlogCategoryId</code></td>
      <td><code>blogCategoryView</code></td>
      <td><code>currentBlogCategory</code> query</td>
    </tr>
    <tr>
      <td><code>currentBlogTagId</code></td>
      <td><code>blogTagView</code></td>
      <td><code>currentBlogTag</code> query</td>
    </tr>
    <tr>
      <td><code>blogVisitor</code></td>
      <td><code>blogPostView</code></td>
      <td><code>BlogComment.liked</code></td>
    </tr>
    <tr>
      <td><code>blogPostReactedType</code></td>
      <td><code>blogPostView</code></td>
      <td><code>BlogPost.reactions[].reacted</code></td>
    </tr>
    <tr>
      <td><code>filtersFromUrl</code></td>
      <td><code>blogHome</code>, <code>blogCategoryView</code>, <code>blogTagView</code></td>
      <td>Collection paging / filtering</td>
    </tr>
  </tbody>
</table>

All three view pages also set `request.locals.pageBuilderEntityUrn` to the entity's URN so page-builder content can be scoped per entity, and call `setPageMetaInfo` with breadcrumbs. `blogPostView` additionally emits Open Graph `article` metadata (`publishedTime`, `authors`, `tags`, `image`).

Each view page returns a 404 when the entity is missing **or unpublished** — `blogPostView` and `blogCategoryView` both add `status = 1` to their lookup.

## Admin routes

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Route ID</th>
      <th>Path (auto-prefixed with <code>/admin</code>)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>blogPostGrid</code></td><td><code>/blog/posts</code></td></tr>
    <tr><td><code>blogPostNew</code></td><td><code>/blog/posts/new</code></td></tr>
    <tr><td><code>blogPostEdit</code></td><td><code>/blog/posts/edit/:id</code></td></tr>
    <tr><td><code>blogCategoryGrid</code></td><td><code>/blog/categories</code></td></tr>
    <tr><td><code>blogCategoryNew</code></td><td><code>/blog/categories/new</code></td></tr>
    <tr><td><code>blogCategoryEdit</code></td><td><code>/blog/categories/edit/:id</code></td></tr>
    <tr><td><code>blogTagGrid</code></td><td><code>/blog/tags</code></td></tr>
    <tr><td><code>blogTagNew</code></td><td><code>/blog/tags/new</code></td></tr>
    <tr><td><code>blogTagEdit</code></td><td><code>/blog/tags/edit/:id</code></td></tr>
    <tr><td><code>blogCommentGrid</code></td><td><code>/blog/comments</code></td></tr>
  </tbody>
</table>

## Data model

Everything is created by a single migration, `modules/blog/migration/Version-1.0.0.ts`, in FK-dependency order.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Table</th>
      <th>Purpose</th>
      <th>Notable columns</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>blog_category</code></td>
      <td>Category record</td>
      <td><code>uuid</code>, <code>status</code> (default 1), <code>comment_policy</code> (default <code>moderated</code>), <code>position</code>, <code>meta_data</code> (JSONB)</td>
    </tr>
    <tr>
      <td><code>blog_category_description</code></td>
      <td>Translatable category fields</td>
      <td><code>name</code>, <code>short_description</code>, <code>url_key</code> (UNIQUE), <code>meta_title</code>, <code>meta_description</code></td>
    </tr>
    <tr>
      <td><code>blog_tag</code></td>
      <td>Tag record (single table, no description split)</td>
      <td><code>uuid</code>, <code>name</code>, <code>url_key</code> (UNIQUE), <code>meta_title</code>, <code>meta_description</code>, <code>created_at</code></td>
    </tr>
    <tr>
      <td><code>blog_post</code></td>
      <td>Post record</td>
      <td><code>uuid</code>, <code>status</code> (default 0), <code>category_id</code>, <code>author_id</code>, <code>thumbnail</code>, <code>reaction_counts</code> (JSONB), <code>comment_count</code>, <code>reading_time</code>, <code>published_at</code>, <code>meta_data</code> (JSONB)</td>
    </tr>
    <tr>
      <td><code>blog_post_description</code></td>
      <td>Translatable post fields</td>
      <td><code>name</code>, <code>short_description</code>, <code>description</code> (text — JSON blocks), <code>url_key</code> (UNIQUE), <code>meta_title</code>, <code>meta_description</code></td>
    </tr>
    <tr>
      <td><code>blog_post_tag</code></td>
      <td>Many-to-many pivot</td>
      <td><code>post_id</code>, <code>tag_id</code>, UNIQUE on the pair</td>
    </tr>
    <tr>
      <td><code>blog_comment</code></td>
      <td>Comment, self-referencing for threads</td>
      <td><code>uuid</code>, <code>post_id</code>, <code>parent_id</code>, <code>customer_id</code>, <code>name</code>, <code>email</code>, <code>comment</code>, <code>status</code> (default <code>pending</code>), <code>like_count</code></td>
    </tr>
    <tr>
      <td><code>blog_reaction</code></td>
      <td>Post reactions and comment likes</td>
      <td><code>entity_type</code>, <code>entity_id</code>, <code>reaction_type</code>, <code>fingerprint</code>, UNIQUE on <code>(entity_type, entity_id, fingerprint)</code></td>
    </tr>
  </tbody>
</table>

Two deliberate design decisions in the schema are worth knowing:

- **`blog_post.author_id` and `blog_comment.customer_id` carry no database foreign key.** Module migration order across modules is not guaranteed, so a hard FK to `admin_user` / `customer` could run before those tables exist. The resolvers tolerate a missing or orphaned id and return `null`.
- **`blog_reaction` is UNIQUE on `(entity_type, entity_id, fingerprint)` — the reaction type is deliberately excluded.** A visitor therefore holds at most **one** reaction per post; picking a different type switches it rather than adding a second.

### `url_key` triggers

The migration installs a blog-specific `build_blog_url_key()` PL/pgSQL function and attaches it as a `BEFORE INSERT OR UPDATE` trigger on `blog_post_description`, `blog_category_description`, and `blog_tag`. It slugifies `NEW.name` when `url_key` is `NULL`, and rejects an explicit `url_key` containing `/`, `\` or `#`.

Unlike catalog's `build_url_key`, it does **not** append a random numeric suffix — blog slugs stay clean. The consequence is that two posts with the same name collide on the `url_key` UNIQUE constraint; the author must set an explicit `url_key` to disambiguate.

### Denormalized counters

`blog_post.comment_count`, `blog_post.reaction_counts`, and `blog_comment.like_count` are caches. Every write path that can change them recomputes them from the source rows **inside the same transaction** — for example `submitBlogComment`, `moderateBlogComment`, and `deleteBlogComment` all re-run `SELECT COUNT(*) ... WHERE status='approved'`, and `reactToBlogPost` rebuilds `reaction_counts` with `jsonb_object_agg` over `blog_reaction`.

## Services, hooks, and events

The write services live in `modules/blog/services/` and are re-exported from `services/index.ts`. Each follows the standard EverShop shape: a `hookable`-wrapped implementation, `hookBefore*` / `hookAfter*` helpers, a registry key for the data payload, and an event emitted **after** commit.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Service</th>
      <th>Registry key</th>
      <th>Event emitted</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>createBlogPost</code></td><td><code>blogPostDataBeforeCreate</code></td><td><code>blog_post_created</code></td></tr>
    <tr><td><code>updateBlogPost</code></td><td><code>blogPostDataBeforeUpdate</code></td><td><code>blog_post_updated</code></td></tr>
    <tr><td><code>deleteBlogPost</code></td><td>—</td><td><code>blog_post_deleted</code></td></tr>
    <tr><td><code>createBlogCategory</code></td><td><code>blogCategoryDataBeforeCreate</code></td><td><code>blog_category_created</code></td></tr>
    <tr><td><code>updateBlogCategory</code></td><td><code>blogCategoryDataBeforeUpdate</code></td><td><code>blog_category_updated</code></td></tr>
    <tr><td><code>deleteBlogCategory</code></td><td>—</td><td><code>blog_category_deleted</code></td></tr>
    <tr><td><code>createBlogTag</code></td><td><code>blogTagDataBeforeCreate</code></td><td><code>blog_tag_created</code></td></tr>
    <tr><td><code>updateBlogTag</code></td><td><code>blogTagDataBeforeUpdate</code></td><td><code>blog_tag_updated</code></td></tr>
    <tr><td><code>deleteBlogTag</code></td><td>—</td><td><code>blog_tag_deleted</code></td></tr>
  </tbody>
</table>

Each create/update service also runs its AJV data schema through a registry key so extensions can widen it: `createBlogPostDataJsonSchema`, `updateBlogPostDataJsonSchema`, and the equivalent `...BlogCategory...` / `...BlogTag...` keys.

:::note
Unlike `catalog`, `cms`, `oms`, and the other core modules, the blog module has **no `@evershop/evershop/blog/services` subpath in `package.json`** as of v2.2.1. The `hookBefore*` / `hookAfter*` helpers exist and are re-exported from `modules/blog/services/index.ts`, but they are not reachable from an extension through a published import path. Extend blog writes through the registry keys and events above instead — both are public API.
:::

Adding a field to the post payload and reacting to the write, from an extension `bootstrap.ts`:

```ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default function bootstrap() {
  addProcessor('blogPostDataBeforeCreate', async function (data) {
    // `this` is the processor context — do not use an arrow function here.
    return data;
  });

  addProcessor('createBlogPostDataJsonSchema', function (schema) {
    schema.properties.reviewed_by = { type: ['string', 'null'] };
    return schema;
  });
}
```

Both must be registered from `bootstrap.ts` — the registry locks once bootstrap finishes.

Two behaviours are shared by `createBlogPost` and `updateBlogPost`:

- **Empty foreign keys are coerced.** The admin form sends `''` for an unselected category or author; both services rewrite `''` to `null` before the insert, because the integer columns reject the empty string.
- **`published_at` is stamped on first publish.** When `status` is `1` and `published_at` is not already set, the service stamps the current ISO timestamp. There is no scheduler — a post is visible on the storefront when `status = 1`, full stop.

`updateBlogPost` and `updateBlogCategory` tolerate a payload that touches only the base table: the description update is wrapped in a `try/catch` that swallows the query builder's `No data was provided` error.

### Reading time

`services/readingTime.ts` exports a pure, side-effect-free `readingTime(content, options)`. It walks the Editor.js document shape (rows → `columns` → `data.blocks`) that `components/common/Editor.tsx` renders and counts words per block type:

<table className="table-auto not-prose">
  <thead>
    <tr><th>Block type</th><th>Counted as</th></tr>
  </thead>
  <tbody>
    <tr><td><code>paragraph</code>, <code>header</code>, <code>quote</code></td><td>Words in <code>data.text</code> plus <code>data.caption</code></td></tr>
    <tr><td><code>list</code></td><td>Words across <code>data.items</code></td></tr>
    <tr><td><code>raw</code></td><td>Words in <code>data.html</code> (tags stripped)</td></tr>
    <tr><td><code>image</code></td><td>An image, not words</td></tr>
    <tr><td><code>productList</code></td><td>12 words per product</td></tr>
  </tbody>
</table>

Words are divided by `wpm` (default 200). Images add decaying time — the first image costs `secondsPerImage` (default 10), each subsequent image one second less, with a floor of 3 seconds. The result is `Math.ceil` of the total minutes, minimum 1.

Because it is pure, it runs inside the create/update transaction and its output is cached in `blog_post.reading_time`. The GraphQL resolver prefers the cached value and recomputes from `description` only when the cache is absent or non-positive:

```ts
readingTime: ({ readingTime: cached, description }) =>
  typeof cached === 'number' && cached > 0 ? cached : readingTime(description)
```

`updateBlogPost` recomputes `reading_time` **only when `description` is supplied** — an update that changes just the title leaves the cached value alone.

## Comments and moderation

A comment's fate is decided by the **category's** `comment_policy`, not the post's:

<table className="table-auto not-prose">
  <thead>
    <tr><th><code>comment_policy</code></th><th>Result of <code>submitBlogComment</code></th></tr>
  </thead>
  <tbody>
    <tr><td><code>open</code></td><td>Stored with <code>status = 'approved'</code> and immediately visible</td></tr>
    <tr><td><code>moderated</code> (default)</td><td>Stored with <code>status = 'pending'</code>, hidden until an admin approves</td></tr>
    <tr><td><code>closed</code></td><td><code>CommentsClosedError</code> → the API responds <code>403</code></td></tr>
  </tbody>
</table>

A post with no category falls back to `moderated`.

`services/comment/submitBlogComment.ts` treats the input as hostile, since comments are untrusted text rendered back to other visitors:

- `name` and `comment` go through `sanitizeHtml` with **no allowed tags or attributes**, then whitespace is collapsed and the value is truncated (120 characters for `name`, 5000 for `comment`). This is deliberately *not* `sanitizeRawHtml`, which is Editor.js-specific and permissive.
- A hidden `website` field acts as a **honeypot**. Humans never see it; a bot that fills it gets `status = 'spam'`.
- A comment containing more than three `http(s)://` occurrences is also auto-marked `spam`.

Spam comments are still stored — they are simply never shown. Only `status = 'approved'` comments reach the storefront.

`moderateBlogComment(uuid, status)` accepts exactly `pending`, `approved`, or `spam` and recomputes the post's `comment_count` in the same transaction. `deleteBlogComment(uuid)` deletes the comment (replies cascade via the `parent_id` FK), purges the comment's `blog_reaction` rows, and recomputes `comment_count`.

The `BlogComment` storefront resolver loads all approved comments for a post in **one** query and assembles the reply tree in JavaScript, avoiding N+1 recursion. Note that `email` is declared only on `BlogComment.admin.graphql` — it is write-only and never exposed on the storefront.

## Reactions and reactor resolution

Reactions are visitor-scoped, not customer-scoped. The identity used is a **fingerprint** produced by `services/reaction/resolveReactor.ts`:

```ts
export function resolveReactor(
  request: EvershopRequest,
  response?: EvershopResponse,
  issue = false
): string | null;
```

The fingerprint is the value of a signed, `httpOnly`, `sameSite: 'lax'` cookie named `blog_visitor` with a one-year `maxAge`. There is no IP or user-agent hashing.

The `issue` flag is what separates the read path from the write path:

- **Write path** (`POST .../react`, `POST .../like`) calls `resolveReactor(request, response, true)`. If the cookie is absent, a fresh `randomUUID()` is generated and set on the response.
- **Read path** (`blogPostView` GET) calls `resolveReactor(request)` with `issue` defaulting to `false`, so a GET never sets a cookie. It returns `null` when no cookie exists, and the resolvers simply report `reacted: false` / `liked: false`.

Reaction types are fixed lists in `services/reaction/reactionTypes.ts`:

```ts
export const REACTION_TYPES = ['like', 'love', 'clap', 'insightful'] as const;
```

Posts accept all four. Comments only ever use `'like'` — `likeBlogComment` is the degenerate single-type case and takes no type argument.

Toggle semantics differ slightly between the two:

- **`reactToBlogPost(postId, type, fingerprint)`** — same type again removes the reaction (`reacted: null`); a *different* type updates the existing row in place (a visitor never holds two reactions on one post); no row yet inserts one. Returns `{ counts, reacted }`.
- **`likeBlogComment(commentId, fingerprint)`** — a pure toggle. Returns `{ likeCount, liked }`.

Both recompute the denormalized counter from `blog_reaction` inside the transaction.

## GraphQL surface

The module ships storefront types plus `.admin.graphql` extensions. Remember that the two schemas build separately: a type defined in an `.admin.graphql` file is invisible to the storefront schema.

### Queries

<table className="table-auto not-prose">
  <thead>
    <tr><th>Query</th><th>Returns</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><code>blogPost(id: ID)</code></td><td><code>BlogPost</code></td><td><code>id</code> is the post <code>uuid</code></td></tr>
    <tr><td><code>blogPosts(filters: [FilterInput])</code></td><td><code>BlogPostCollection</code></td><td>Non-admin callers are restricted to <code>status = 1</code></td></tr>
    <tr><td><code>currentBlogPost</code></td><td><code>BlogPost</code></td><td>Returns <code>null</code> unless the current route is <code>blogPostView</code></td></tr>
    <tr><td><code>blogCategory(id: ID)</code></td><td><code>BlogCategory</code></td><td></td></tr>
    <tr><td><code>blogCategories(filters: [FilterInput])</code></td><td><code>BlogCategoryCollection</code></td><td></td></tr>
    <tr><td><code>currentBlogCategory</code></td><td><code>BlogCategory</code></td><td>Bound to <code>blogCategoryView</code></td></tr>
    <tr><td><code>blogTag(id: ID)</code></td><td><code>BlogTag</code></td><td></td></tr>
    <tr><td><code>blogTags(filters: [FilterInput])</code></td><td><code>BlogTagCollection</code></td><td></td></tr>
    <tr><td><code>currentBlogTag</code></td><td><code>BlogTag</code></td><td>Bound to <code>blogTagView</code></td></tr>
    <tr><td><code>blogComments(filters: [FilterInput])</code></td><td><code>BlogCommentCollection</code></td><td><strong>Admin only</strong> — declared in <code>BlogComment.admin.graphql</code>, powers the moderation grid</td></tr>
    <tr><td><code>featuredBlogsWidget(...)</code></td><td><code>FeaturedBlogsWidget</code></td><td>Backs the <code>featured_blogs</code> widget</td></tr>
  </tbody>
</table>

### `BlogPost`

```graphql
type BlogPost {
  blogPostId: Int
  uuid: String!
  status: Int!
  name: String!
  urlKey: String!
  shortDescription: String
  description: JSON
  thumbnail: String
  publishedAt: String
  readingTime: Int!
  commentCount: Int!
  reactions: [BlogReactionCount!]!
  url: String!
  category: BlogCategory
  author: BlogAuthor
  tags: [BlogTag!]!
  related(limit: Int = 3): [BlogPost!]!
  metaTitle: String
  metaDescription: String
  comments: [BlogComment!]!
}
```

Resolver behaviour worth knowing:

- **`url`** looks up the `url_rewrite` row and falls back to `/blog/<urlKey>`, then runs the result through `localizeUrl` so the locale prefix is preserved.
- **`description`** is `JSON`, not HTML. It is the Editor.js block array; the resolver parses the stored string and returns `[]` on malformed JSON.
- **`reactions`** always returns one entry per type in `REACTION_TYPES`, with `count: 0` for types nobody has used, and `reacted` true for the type matching `blogPostReactedType` in context.
- **`related(limit)`** returns published posts in the same category, excluding the post itself, newest first.

The admin schema adds `metaData: JSON`, `authorId`, `editUrl`, `updateApi`, and `deleteApi` to `BlogPost`; `editUrl` / `updateApi` / `deleteApi` to `BlogCategory` and `BlogTag`; and `moderateApi` / `deleteApi` to `BlogComment`.

### Collection filters

`blogPosts` supports these filter keys, plus the shared pagination filters (`page`, `limit`, `od`):

<table className="table-auto not-prose">
  <thead>
    <tr><th>Key</th><th>Operations</th><th>Effect</th></tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td><code>eq</code>, <code>like</code></td><td>Exact match or <code>ILIKE %value%</code> on the post name</td></tr>
    <tr><td><code>keyword</code></td><td><code>eq</code></td><td><code>ILIKE %value%</code> on the post name</td></tr>
    <tr><td><code>status</code></td><td><code>eq</code></td><td>Filters <code>blog_post.status</code></td></tr>
    <tr><td><code>category</code></td><td><code>eq</code>, <code>in</code></td><td><code>in</code> takes a comma-separated list of category ids</td></tr>
    <tr><td><code>tag</code></td><td><code>eq</code></td><td>Joins <code>blog_post_tag</code> and filters by tag id</td></tr>
    <tr><td><code>ob</code></td><td><code>eq</code></td><td>Order by <code>name</code>, <code>published_at</code>, or <code>created_at</code></td></tr>
  </tbody>
</table>

`blogCategories` supports `name` and `status`; `blogTags` supports `name`; `blogComments` supports `status` and `keyword`. All four filter sets are registered from `bootstrap.ts` via `addProcessor` on `blogPostCollectionFilters`, `blogCategoryCollectionFilters`, `blogTagCollectionFilters`, and `blogCommentCollectionFilters` — so an extension can add its own filter the same way.

## The `featured_blogs` widget

`bootstrap.ts` registers one widget:

```ts
registerWidget({
  type: 'featured_blogs',
  name: 'Featured blogs',
  description: 'A list of featured blog posts',
  category: 'content',
  icon: 'Newspaper',
  enabled: true,
  defaultSettings: {
    eyebrow: '',
    heading: '',
    subText: '',
    postUuids: [],
    count: 3,
    columns: 3
  }
});
```

Its three components live in the module: `components/admin/FeaturedBlogsSetting.tsx`, `components/admin/FeaturedBlogsPreview.tsx`, and `components/frontStore/FeaturedBlogs.tsx`.

The settings schema constrains `count` to 1–24 and `columns` to one of `[1, 2, 3, 4]`. `postUuids` is an explicitly curated, **ordered** list — the `featuredBlogsWidget` resolver fetches the matching published posts and re-orders them to match the pick order before slicing to `count`:

```ts
const ordered = uuids.map((u) => byUuid.get(u)).filter(Boolean);
```

An empty `postUuids` returns no posts — the widget does not auto-fill with recent posts.

Like every widget, `registerWidget` must be called from `bootstrap.ts`; the registry is locked afterwards.

## Blog URNs and link loaders

Blog entities are addressable by URN in the form `urn:evershop:blog:<type>:<uuid>`, with three registered types:

- `urn:evershop:blog:post:<uuid>`
- `urn:evershop:blog:category:<uuid>`
- `urn:evershop:blog:tag:<uuid>`

`modules/blog/lib/BlogUrn.ts` is a thin re-export — the schemas themselves are registered centrally in `lib/urn/index.ts` alongside the catalog and CMS schemas so they are available on both client and server:

```ts
export const BlogUrn = {
  post: (uuid: string) => UrnService.build('blog', 'post', uuid),
  category: (uuid: string) => UrnService.build('blog', 'category', uuid),
  tag: (uuid: string) => UrnService.build('blog', 'tag', uuid)
};
```

`bootstrap.ts` registers a **link loader** for each type so a URN can be resolved to a live URL at request time. Each loader is built with `linkLoaderFromBatch`, batching the uuids into one `url_rewrite` lookup and falling back to the internal route when no rewrite exists:

```ts
registerLinkLoader('blog', 'post', blogLinkLoader('blog_post', 'blogPostView'));
registerLinkLoader('blog', 'category', blogLinkLoader('blog_category', 'blogCategoryView'));
registerLinkLoader('blog', 'tag', blogLinkLoader('blog_tag', 'blogTagView'));
```

This is what lets a page-builder link or a rich-text mention point at a post without hardcoding its slug — rename the post and the URN still resolves.

## Metafields

Blog posts and blog categories are metafield owners. The owner types are:

<table className="table-auto not-prose">
  <thead>
    <tr><th>Owner type</th><th>Value storage</th></tr>
  </thead>
  <tbody>
    <tr><td><code>blog_post</code></td><td><code>blog_post.meta_data</code></td></tr>
    <tr><td><code>blog_category</code></td><td><code>blog_category.meta_data</code></td></tr>
  </tbody>
</table>

Blog **tags** are not metafield owners — `blog_tag` has no `meta_data` column.

`bootstrap.ts` wires the write path by registering a folder on the same registry keys the services already run:

```ts
function makeMetafieldFolder(ownerType: string) {
  return async function foldMetafields(data) {
    if (data && data.metafields !== undefined) {
      data.meta_data = await validateMetafields(ownerType, data.metafields);
    }
    return data;
  };
}

addProcessor('blogPostDataBeforeCreate', makeMetafieldFolder('blog_post'));
addProcessor('blogPostDataBeforeUpdate', makeMetafieldFolder('blog_post'));
```

The folder runs **only when `metafields` is explicitly present** in the payload, so an ordinary API update that omits the key leaves `meta_data` untouched rather than wiping it.

On the read side, `BlogPostMetafields.graphql` and `BlogCategoryMetafields.graphql` extend both types with `metafields(namespace: String)` and `metafield(namespace: String!, key: String!)`.

Deleting a metafield definition is cleaned up by two subscribers on `metafield_definition_deleted` — `pruneBlogPost.ts` and `pruneBlogCategory.ts` — which strip the key from every row's `meta_data` with the JSONB `#-` operator. Both are idempotent and no-op when the deleted definition belongs to a different owner type.

See [Metafields](./metafields.md) for definition management, field types, and validation.

## Sitemap

Blog registers its own sitemap collectors from `bootstrap.ts` — nothing in `modules/base` knows about blog:

```ts
registerSitemapCollector(
  createEntityCollector({
    name: 'blog-posts',
    table: 'blog_post',
    entityType: 'blog_post',
    where: 'e.status = 1',
    changefreq: 'weekly',
    priority: 0.5
  })
);
```

<table className="table-auto not-prose">
  <thead>
    <tr><th>Collector</th><th>Table</th><th>Filter</th><th>changefreq</th><th>priority</th></tr>
  </thead>
  <tbody>
    <tr><td><code>blog-posts</code></td><td><code>blog_post</code></td><td><code>e.status = 1</code></td><td>weekly</td><td>0.5</td></tr>
    <tr><td><code>blog-categories</code></td><td><code>blog_category</code></td><td><code>e.status = 1</code></td><td>weekly</td><td>0.4</td></tr>
    <tr><td><code>blog-tags</code></td><td><code>blog_tag</code></td><td>none</td><td>monthly</td><td>0.3</td></tr>
  </tbody>
</table>

The tag collector passes `updatedAtColumn: 'created_at'` because `blog_tag` has no `updated_at` column. Each collector is served at `/sitemap-<name>.xml` — so `/sitemap-blog-posts.xml`, `/sitemap-blog-categories.xml`, and `/sitemap-blog-tags.xml` — and referenced from the `/sitemap.xml` index. Each inherits multi-language `hreflang`, 50,000-per-file chunking, and change detection for free.

The `/blog` landing page itself is not an entity, so include it through the sitemap's `staticPaths` configuration if you want it listed. See [Sitemap](./sitemap.md).

## REST API

Fourteen endpoints, eleven admin-only and **three unauthenticated public write surfaces** (`POST /api/blog/comments`, `POST /api/blog/comments/:id/like`, `POST /api/blog/posts/:id/react`). See the [Blog REST API reference](/docs/api/blog) for payloads and responses.

## See also

- [Metafields](./metafields.md) — custom fields on `blog_post` and `blog_category`
- [Sitemap](./sitemap.md) — how blog collectors plug into `/sitemap.xml`
- [Events and Subscribers](./events-and-subscribers.md) — the `blog_*_created` / `updated` / `deleted` events
- [Registry and Processors](./registry-and-processors.md) — the `blog*DataBefore*` and `blog*CollectionFilters` keys
- [Routing System](./routing-system.md) — `url_rewrite` resolution and route matching order

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
