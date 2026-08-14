---
sidebar_position: 25
keywords:
  - widget link
  - URN
  - link loader
  - resolveLink
  - previewComponent
  - widget development
sidebar_label: Widget Link Fields
title: Widget Link Fields and Preview Components
description: How EverShop stores widget links as URNs and resolves them to current URLs at request time with batched link loaders, plus the mandatory previewComponent every widget type must register.
---

# Widget Link Fields and Preview Components

Two parts of widget authoring have no equivalent in older EverShop versions and are easy to get wrong: **link fields**, which store a URN instead of a URL, and the **`previewComponent`**, which `registerWidget` now refuses to register without.

## Why widget links are not URLs

A widget CTA used to store whatever URL the merchant typed. Rename the category, change a page's slug, and every widget pointing at it broke silently — nothing in the system knew those strings referred to an entity.

Links are now stored as **URNs** and resolved to the entity's *current* URL at request time:

```
urn:evershop:<service>:<type>:<uuid>
```

```
urn:evershop:catalog:category:9c1a7f42-06d3-4c8b-a1f9-3e5d7c2b8a10
urn:evershop:cms:page:1b7e2d90-45aa-4f31-8c02-6d9f1e3a7b55
urn:evershop:promotion:landing_page:c81e7f2a-9b31-4d0c-8b6e-1a5f7c3d9042
```

A plain URL or relative path is still a valid stored value and passes straight through — the "Custom URL" tab of the link picker produces exactly that.

### Types registered out of the box

URNs are validated against a registry, so an unregistered `(service, type)` pair cannot even be built. The core set lives in `lib/urn/index.ts`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>URN</th>
      <th>Resolves via</th>
      <th>Registered by</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>catalog:product</code></td>
      <td><code>url_rewrite</code> (<code>entity_type = 'product'</code>), falling back to <code>buildUrl('productView', &#123; uuid &#125;)</code></td>
      <td>Built in</td>
    </tr>
    <tr>
      <td><code>catalog:category</code></td>
      <td><code>url_rewrite</code> (<code>entity_type = 'category'</code>), falling back to <code>buildUrl('categoryView', &#123; uuid &#125;)</code></td>
      <td>Built in</td>
    </tr>
    <tr>
      <td><code>cms:page</code></td>
      <td><code>url_rewrite</code> (<code>entity_type = 'cms_page'</code>), localized; null when the page has no rewrite</td>
      <td>Built in</td>
    </tr>
    <tr>
      <td><code>blog:post</code>, <code>blog:category</code>, <code>blog:tag</code></td>
      <td><code>url_rewrite</code>, falling back to the internal route</td>
      <td><code>modules/blog/bootstrap.ts</code></td>
    </tr>
    <tr>
      <td><code>promotion:landing_page</code></td>
      <td><code>landing_page.url_key</code> directly (that table keeps the slug inline), localized</td>
      <td><code>modules/promotion</code> bootstrap</td>
    </tr>
  </tbody>
</table>

There is deliberately **no collection loader**. Collections are non-navigable groupings with no public page; widgets that display a collection reference it by `code` in their settings instead.

## Storing a link: the admin side

Use `LinkPicker` in your setting component. It renders one tab per linkable entity type plus a freeform tab, and hands back a URN for entity picks and a plain string for custom URLs:

```tsx
import { LinkPicker } from '@components/common/page-builder/pickers/LinkPicker.js';

<LinkPicker
  value={link}
  onChange={({ url }) => setValue('settings.link', url)}
  initialKind="custom"
/>
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Prop</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>value</code></td><td>Current stored value — a URN or a plain URL.</td></tr>
    <tr><td><code>onChange</code></td><td>Receives <code>&#123; url, kind, label? &#125;</code>. Persist <code>url</code>; <code>kind</code> is an admin-only display hint.</td></tr>
    <tr><td><code>initialKind</code></td><td>Tab to open on. Defaults to <code>custom</code>. Ignored when <code>value</code> is a URN, because the tab is derivable from it.</td></tr>
    <tr><td><code>allowedKinds</code></td><td>Restrict the visible tabs, for a CTA that should only ever point at one kind of thing.</td></tr>
  </tbody>
</table>

Available kinds: `page`, `landingPage`, `category`, `product`, `blogPost`, `blogCategory`, `blogTag`, `custom`. For a full call-to-action (label + URL + new-tab + style) use `CtaField`, which wraps `LinkPicker`.

## Resolving a link: the storefront side

Resolution happens in your widget's **GraphQL resolver**, not in the React component. The GraphQL middleware builds a set of per-request loaders and puts them on the context as `linkLoaders`; your resolver passes each stored value through `resolveLink`:

```ts
import { resolveLink } from '@evershop/evershop/lib/widget/linkResolver';

export default {
  Query: {
    async myHeroWidget(_, { link, ctaUrl }, { linkLoaders }) {
      const [resolved, resolvedCta] = await Promise.all([
        resolveLink(link, linkLoaders),
        resolveLink(ctaUrl, linkLoaders)
      ]);
      return { link: resolved, ctaUrl: resolvedCta };
    }
  }
};
```

`resolveLink(value, loaders)` returns:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Input</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Empty / null / undefined</td><td><code>null</code></td></tr>
    <tr><td>Plain URL or relative path with a safe scheme</td><td>The same string, unchanged</td></tr>
    <tr><td>Plain URL with an unsafe scheme (<code>javascript:</code>, <code>data:</code>, <code>vbscript:</code>)</td><td><code>null</code> — the anchor must be suppressed</td></tr>
    <tr><td>A URN with a registered loader</td><td>The entity's current URL, or <code>null</code> when it cannot be found</td></tr>
    <tr><td>A URN with no registered loader</td><td><code>null</code></td></tr>
  </tbody>
</table>

The unsafe-scheme filter (`isSafeUrl`) is the security boundary — it strips ASCII control characters before testing the scheme, so a smuggled `java\tscript:` cannot slip through. Allowed schemes are `http`, `https`, `mailto` and `tel`; relative paths, anchors and query-only links are always safe.

Because a missing entity yields `null`, storefront components should render the element without an `href` (or not at all) rather than assuming a string:

```tsx
{url ? <a href={url}>{label}</a> : <span>{label}</span>}
```

## Batching

`createLinkLoaders(pool)` is called **once per request** by the GraphQL middleware. Each loader it produces is a small DataLoader-style batcher: `.load(id)` queues the id, and a `queueMicrotask` flush resolves the whole queue with one query. Results are cached per request, so the same entity referenced by twenty widgets costs one lookup.

The practical effect: a page with a 30-link mega-menu across products, categories and pages issues **one query per kind**, not thirty.

## Registering your own link loader

Two registrations, both from your module's `bootstrap.ts` — the value registry is locked once bootstrap completes, so a later call throws.

```ts
import { registerUrnSchema } from '@evershop/evershop/lib/urn';
import {
  registerLinkLoader,
  linkLoaderFromBatch
} from '@evershop/evershop/lib/widget/linkResolver';
import { select } from '@evershop/evershop/lib/postgres/query';

export default (): void => {
  registerUrnSchema({
    service: 'academy',
    type: 'course',
    description: 'Academy course'
  });

  registerLinkLoader(
    'academy',
    'course',
    linkLoaderFromBatch(async (uuids, pool) => {
      if (uuids.length === 0) {
        return [];
      }
      const rows = await select('uuid', 'slug')
        .from('academy_course')
        .where('uuid', 'IN', [...uuids])
        .execute(pool);
      const map = new Map(rows.map((r: any) => [r.uuid, `/course/${r.slug}`]));
      return uuids.map((u) => map.get(u) ?? null);
    })
  );
};
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Function</th>
      <th>Signature</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>registerUrnSchema</code></td>
      <td><code>(&#123; service, type, description &#125;) =&gt; void</code></td>
      <td>Throws if the pair is already registered. Without it, <code>UrnService.build</code> and <code>parse</code> both throw and the page builder rejects the value.</td>
    </tr>
    <tr>
      <td><code>registerLinkLoader</code></td>
      <td><code>(service, type, factory) =&gt; void</code></td>
      <td>Adds a processor to the <code>linkLoaderFactories</code> registry key. Bootstrap only.</td>
    </tr>
    <tr>
      <td><code>linkLoaderFromBatch</code></td>
      <td><code>(batchFn) =&gt; LinkLoaderFactory</code></td>
      <td>Wraps a batch function so you never write queueing code yourself.</td>
    </tr>
  </tbody>
</table>

Your batch function receives `(ids, pool)` and **must return an array of the same length, in the same order**, using `null` for ids it could not resolve. Returning a shorter array silently maps the tail to `null`.

Two real implementations to copy from:

- `modules/blog/bootstrap.ts` — one shared factory parameterized by `(entityType, routeId)`, registered three times for post, category and tag. Reads `url_rewrite` and falls back to `buildUrl(routeId, { uuid })`.
- `modules/promotion/services/landingPage/registerLandingPageLinkLoader.ts` — reads `url_key` straight off `landing_page` and wraps it in `localizeUrl('/' + url_key)` so non-default storefront locales get their prefix.

If your entity is reachable at a friendly URL, prefer reading `url_rewrite` over reconstructing the path — that is what keeps the link correct after a rename.

## The failure mode: a throwing loader fails silently

:::danger A loader that throws is swallowed by the batcher
The batcher's flush wraps your batch function in a `try/catch` and, on any error, **resolves every in-flight id to `null`**:

```ts
try {
  const values = await batchFn(ids, pool);
  batch.forEach(({ resolve }, i) => resolve(values[i] ?? null));
} catch {
  batch.forEach(({ resolve }) => resolve(null));
}
```

That is deliberate — one broken loader must not 500 the whole storefront page. But it means a bad query produces **no error anywhere**: no exception, no 500, nothing in the response. Every link of that kind simply renders as an unclickable anchor with no `href`, and the page otherwise looks perfect.
:::

This has bitten core. The `cms:page` loader originally did `select('uuid', 'url_key').from('cms_page')` — but `url_key` lives on `cms_page_description`, not `cms_page`. The query threw `column "url_key" does not exist` on every request, the batcher swallowed it, and every CMS page link in every menu became dead. Nothing surfaced it until someone clicked one.

How to avoid repeating it:

- **Test the loader directly.** Call the batch function against a real connection with a known uuid and assert it returns the URL. The guard test for the core loaders is `lib/widget/tests/unit/linkResolver.test.ts`.
- **When links render without an `href`, suspect the loader first.** The symptom is indistinguishable from "entity not found", so check your table and column names before anything else.
- **Log inside your batch function** while developing. The `catch` is in the batcher, not in your code, so a `try/catch` of your own around the query body is the only place you can observe the error.

## The mandatory `previewComponent`

Every widget type registers **three** components. The third one, `previewComponent`, is what the page-builder palette shows in its hover card, and `registerWidget` **throws** without it:

```ts
import path from 'path';
import { registerWidget } from '@evershop/evershop/lib/widget';

registerWidget({
  type: 'greeting_widget',
  name: 'Greeting Widget',
  category: 'content',
  settingComponent: path.resolve(
    import.meta.dirname,
    'components/widgets/GreetingWidgetSetting.js'
  ),
  component: path.resolve(
    import.meta.dirname,
    'components/widgets/GreetingWidget.js'
  ),
  previewComponent: path.resolve(
    import.meta.dirname,
    'components/widgets/GreetingWidgetPreview.js'
  ),
  enabled: true,
  defaultSettings: { text: 'Hello!' }
});
```

The rules `lib/widget/widgetManager.ts` enforces on the path are the same as for the other two components, and each violation is a thrown error, not a warning:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rule</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>The property must be present</td>
      <td>An empty or missing path fails the resolvable-path check and throws.</td>
    </tr>
    <tr>
      <td>The file must exist and be a <code>.js</code> file</td>
      <td>Paths point at <strong>compiled output</strong>, not your <code>.tsx</code> source. Author <code>GreetingWidgetPreview.tsx</code>, register <code>GreetingWidgetPreview.js</code>.</td>
    </tr>
    <tr>
      <td>The basename must start with an uppercase letter</td>
      <td>The master-component convention — a lowercase filename is treated as middleware everywhere else in EverShop.</td>
    </tr>
  </tbody>
</table>

### Writing one

The preview component **takes no props** and receives no GraphQL data, no widget settings and no page context. It renders a self-contained stylized mock — rectangles, lines, placeholder blocks — that tells a merchandiser at a glance what the widget looks like:

```tsx
import React from 'react';

export default function GreetingWidgetPreview(): React.ReactElement {
  return (
    <div style={{ padding: 16, background: '#fff' }}>
      <div style={{ height: 10, width: '55%', borderRadius: 3, background: '#111' }} />
      <div style={{ height: 6, width: '80%', marginTop: 8, borderRadius: 3, background: '#d4d4d8' }} />
      <div style={{ height: 6, width: '70%', marginTop: 5, borderRadius: 3, background: '#d4d4d8' }} />
    </div>
  );
}
```

Any `*Preview.tsx` under `modules/cms/components/` is a working reference.

### How it is bundled

The preview is compiled into the **admin** bundle under the wildcard-area key `admin_widget_preview_<type>` (by `lib/webpack/loaders/AreaLoader.js` in development and `bin/lib/buildEntry.js` in production builds), and looked up at runtime by `WidgetPreviewCard`. You never import it yourself — registering the path is the whole wiring.

Because it lands in the admin bundle, anything that only exists on the storefront (a storefront-only context, a browser API guarded elsewhere) will break it. Keep it pure and static.

## Common pitfalls

- **Calling `registerLinkLoader` outside `bootstrap.ts`.** The value registry locks after bootstrap; a later call throws.
- **Registering a loader without registering the URN schema.** `UrnService.build` and `parse` both throw for an unknown `(service, type)`, and `addChangesetOperation` rejects placements carrying it.
- **A batch function that returns a differently ordered or shorter array.** Results are matched by index; anything missing becomes `null`.
- **Expecting an error when a loader breaks.** You will not get one — every link of that kind just loses its `href`.
- **Resolving in the React component instead of the resolver.** `linkLoaders` lives on the GraphQL context. A component has no access to it.
- **Assuming `resolveLink` always returns a string.** It returns `null` for missing entities and for unsafe schemes. Handle it.
- **Registering `previewComponent` as a `.tsx` path.** It must point at compiled `.js`.
- **A lowercase preview filename.** `registerWidget` rejects it.
- **Giving the preview component props or data dependencies.** It is rendered prop-less in the admin palette, with nothing to feed it.

## See also

- [Widget Development](/docs/development/module/widget-development) — registering a widget type end to end
- [Page Builder](/docs/development/knowledge-base/page-builder) — where preview components and link fields are used
- [Landing Page API](/docs/api/landing-page) — the entity behind the `promotion:landing_page` URN
- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — the mechanism `registerLinkLoader` is built on

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
