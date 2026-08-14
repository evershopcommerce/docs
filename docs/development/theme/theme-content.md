---
sidebar_position: 28
keywords:
  - theme.json
  - theme content
  - theme manifest
  - theme:active
  - theme:status
  - theme:export-content
  - widget placement
sidebar_label: Theme Content
title: Theme Content And The theme.json Manifest
description: How a theme ships its storefront widgets and placements in theme.json, how EverShop versions installs and upgrades, and the full theme CLI reference.
---

# Theme Content And The `theme.json` Manifest

A theme has two halves.

The **presentation** half is code — components, CSS, and static files that live on disk and are picked up by the build. That half is covered in [Theme Overview](./theme-overview.md), [The View System](./view-system.md), and [Templating](./templating.md).

The **content** half is data — the widget instances the storefront renders and the areas they are placed in. Those live in the database, not in your repository. `theme.json` is how a theme ships them: a versioned manifest that `theme:active` installs, upgrades, and diffs against what is actually in the store.

A theme without a `theme.json` is perfectly valid. Activating it prints:

```
No theme.json for 'my-theme' — presentation-only theme, no content to install.
```

## The manifest

`theme.json` sits at the root of the theme directory, next to `package.json`:

```
themes/my-theme/
├── package.json
├── theme.json
├── public/
└── src/
```

```json
{
  "theme_name": "My Theme",
  "version": "1.3.0",
  "widgets": [
    {
      "uuid": "a1b2c3d4-0001-4000-8000-000000000001",
      "type": "basic_menu",
      "name": "Header menu",
      "settings": {
        "isMain": true,
        "menus": [
          { "id": "1", "name": "Shop", "url": "/shop", "type": "custom" }
        ]
      }
    },
    {
      "uuid": "a1b2c3d4-0002-4000-8000-000000000002",
      "type": "coupon_block",
      "name": "Launch coupon",
      "settings": {
        "code": "SAVE20",
        "heading": "Take 20% off your order",
        "ctaLabel": "Shop now"
      }
    }
  ],
  "placements": [
    {
      "uuid": "b1b2c3d4-0001-4000-8000-000000000001",
      "widget_instance_uuid": "a1b2c3d4-0001-4000-8000-000000000001",
      "route": "all",
      "area": "headerMiddleLeft",
      "sort_order": 100
    },
    {
      "uuid": "b1b2c3d4-0002-4000-8000-000000000002",
      "widget_instance_uuid": "a1b2c3d4-0002-4000-8000-000000000002",
      "route": "homepage",
      "area": "content",
      "sort_order": 20
    }
  ],
  "metafieldDefinitions": []
}
```

### Top-level fields

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>theme_name</code></td>
      <td>string</td>
      <td>No</td>
      <td>Free-form display name. Deliberately not validated. On export it defaults to the theme's directory id.</td>
    </tr>
    <tr>
      <td><code>version</code></td>
      <td>string</td>
      <td>Yes</td>
      <td>A valid SemVer string. Load-bearing — it gates every install and upgrade. <code>"1.2"</code>, <code>""</code> and <code>"abc"</code> are rejected.</td>
    </tr>
    <tr>
      <td><code>widgets</code></td>
      <td>array</td>
      <td>Yes</td>
      <td>Widget instances to create. May be empty, but the key must be present and an array.</td>
    </tr>
    <tr>
      <td><code>placements</code></td>
      <td>array</td>
      <td>Yes</td>
      <td>Where each widget renders. May be empty, but the key must be present and an array.</td>
    </tr>
    <tr>
      <td><code>metafieldDefinitions</code></td>
      <td>array</td>
      <td>No</td>
      <td>Custom fields the theme declares. Provisioned separately from the content diff — see <a href="./metafields">Using Metafields</a>.</td>
    </tr>
  </tbody>
</table>

### Widget entries

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>uuid</code></td>
      <td>string</td>
      <td>A UUID <strong>v4</strong>. This is the stable identity of the widget across every store that installs your theme — never regenerate it once shipped.</td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td>string</td>
      <td>The registered widget type (<code>basic_menu</code>, <code>banner</code>, <code>slideshow</code>, your extension's type…). Non-empty string.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>string</td>
      <td>Admin-facing label shown in the page builder's Layers panel and the widget list.</td>
    </tr>
    <tr>
      <td><code>settings</code></td>
      <td>object</td>
      <td>The widget's settings. Must be a plain object (not an array, not <code>null</code>).</td>
    </tr>
  </tbody>
</table>

Installed widgets are stamped `status: true` — the manifest never carries a status field. A merchant can disable an instance afterwards in the page builder.

### Placement entries

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>uuid</code></td>
      <td>string</td>
      <td>A UUID v4, distinct from every widget uuid in the same manifest.</td>
    </tr>
    <tr>
      <td><code>widget_instance_uuid</code></td>
      <td>string</td>
      <td>Must match a <code>uuid</code> in <code>widgets[]</code>. A dangling reference fails validation.</td>
    </tr>
    <tr>
      <td><code>route</code></td>
      <td>string</td>
      <td>The route id this placement applies to (<code>homepage</code>, <code>categoryView</code>, <code>cart</code>…), or <code>"all"</code>.</td>
    </tr>
    <tr>
      <td><code>area</code></td>
      <td>string</td>
      <td>The <a href="./view-system">Area</a> id to render into (<code>content</code>, <code>headerMiddleLeft</code>, <code>footerMiddleLeft</code>…).</td>
    </tr>
    <tr>
      <td><code>sort_order</code></td>
      <td>number</td>
      <td>Any finite number, including fractions — the page builder mints midpoints like <code>201.25</code> when you drop a widget between two others.</td>
    </tr>
  </tbody>
</table>

`entity_urn` must be absent or `null`. Theme manifests carry route-level placements only; entity-scoped placements (a widget shown on one specific CMS page) are a merchant-side page-builder feature and cannot be shipped in a theme.

### `route: "all"` for global areas

Header and footer areas render on every page, so a placement targeting them uses the pseudo-route `"all"` rather than repeating the placement for every route id:

```json
{
  "uuid": "d0b0435d-8b5e-4660-87ff-912010cb2c03",
  "widget_instance_uuid": "e992fb49-390d-4f56-b891-3c345c365702",
  "route": "all",
  "area": "headerMiddleLeft",
  "sort_order": 100
}
```

At render time a placement is a candidate when `placement.route === 'all'` or `placement.route === <current route id>`.

### Nested widgets

A widget placed inside a `columns` container uses a synthetic area id of the form `columnsContainer_<parent-widget-uuid>_col_<index>`. Validation enforces that the embedded parent uuid exists in `widgets[]` **and** that its `type` is `columns`. You do not build these by hand — [export the content](#authoring-workflow) after arranging it in the page builder.

## Strict theme bucketing

:::danger A theme must ship every storefront widget it needs

Widget instances and placements are tagged with the theme that owns them. The storefront loads only rows whose `theme` matches the currently-active theme, using `IS NOT DISTINCT FROM` semantics — so `NULL` (the "no custom theme" bucket) matches only when no custom theme is active.

**Activating a theme therefore hides every NULL-bucket widget instance**: the base store's header menu, footer links, homepage banners — everything a merchant built before switching. They are not deleted; they are invisible until the theme is deactivated.

This is by design (the theme's design should not be contaminated by content built for another theme), but it means a theme is responsible for the storefront's entire widget-driven surface. If your theme's `theme.json` omits a header menu, the header renders without one.
:::

The same rule applies to the admin surfaces: the standalone widget editor at `/admin/widgets/edit/:uuid` treats a widget belonging to a dormant theme as not found, and page-builder drafts are scoped per (admin user, theme).

## Versioning: how installs and upgrades are decided

EverShop records the manifest it installed as a snapshot in `theme_install_state`. Every subsequent `theme:active` compares the manifest's `version` against that snapshot's:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Comparison</th>
      <th>Outcome</th>
      <th>What happens</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>No snapshot yet</td>
      <td><code>install</code></td>
      <td>Every widget and placement in the manifest is inserted. Rows that already exist in the DB <em>under this same theme</em> are adopted (left untouched) and counted as <code>Adopted</code>, so an author who built content in the page builder and exported it does not collide with themselves.</td>
    </tr>
    <tr>
      <td>Manifest version &lt; installed</td>
      <td><code>rejected</code></td>
      <td>Refused. Nothing is applied and the active theme is not changed: <em>"cannot downgrade … reverting a theme is not allowed"</em>.</td>
    </tr>
    <tr>
      <td>Manifest version == installed</td>
      <td><code>no-op</code></td>
      <td>Nothing is applied. If the manifest's <em>content</em> differs from the snapshot, the CLI warns that the version is unchanged and the changes will not apply until you bump it.</td>
    </tr>
    <tr>
      <td>Manifest version &gt; installed</td>
      <td><code>upgrade</code></td>
      <td>A three-way diff runs and the resulting operations are applied in one transaction. The recorded version advances even when the content diff is empty.</td>
    </tr>
  </tbody>
</table>

:::warning Same-version content drift is a silent no-op

Editing `theme.json` without bumping `version` does nothing. You get a warning, not an error, and the store keeps rendering the previously installed content. During development, bump the patch version on every content change.
:::

Every install, upgrade and uninstall also appends a row to `theme_install_log` with the per-table counts and the full conflict tuples as JSONB, so a merchant can audit what an upgrade preserved.

## Upgrades preserve merchant customizations

An upgrade is a **three-way merge** between:

- **S** — the snapshot: the manifest as of the last install.
- **M** — the manifest: what your new release ships.
- **D** — the live database rows.

Per field, the rules are:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Situation</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>You did not change the field (S == M)</td>
      <td>The merchant's value is kept.</td>
    </tr>
    <tr>
      <td>You changed it, the merchant did not (D == S)</td>
      <td>Your new value is applied.</td>
    </tr>
    <tr>
      <td>You both changed it to the same thing (D == M)</td>
      <td>No operation.</td>
    </tr>
    <tr>
      <td>You both changed it differently</td>
      <td><strong>Conflict — the merchant wins.</strong> Your value is discarded and the conflict is reported.</td>
    </tr>
    <tr>
      <td>You added a new settings key</td>
      <td>Inserted.</td>
    </tr>
    <tr>
      <td>You removed a settings key the merchant had customized</td>
      <td>Kept, and reported as a conflict.</td>
    </tr>
    <tr>
      <td>The merchant deleted a widget you still ship</td>
      <td>Stays deleted — it is not resurrected.</td>
    </tr>
  </tbody>
</table>

Nested settings objects are merged recursively. **Arrays are opaque** — a list setting is compared and replaced as a whole, never merged item by item.

`type`, `status` and `uuid` are never merged on a widget; `widget_instance_uuid` is never merged on a placement. Those are structural.

Conflicts are printed at activation:

```
Upgraded 'my-theme' (version 1.3.0).
  Added:    1 widgets, 1 placements
  Updated:  2 widgets, 0 placements
  Removed:  0 widgets, 0 placements
  Conflicts: 1 (your customizations preserved):
    widget a1b2c3d4-… field settings.heading: manifest="Summer sale" kept="Winter sale"
```

## What is *not* validated

Validation covers structure, UUID format, cross-references, and DB collisions. It deliberately does **not** cover widget settings:

- **Settings are not schema-validated at install.** The CLI never bootstraps the widget registry, so a settings object with the wrong shape installs cleanly and then fails (or silently renders nothing) at request time. Test your manifest by actually loading the storefront.
- **Unknown widget types produce a soft warning, not an error.** If a type in your manifest has never been instantiated on this install, you get a `[WARN]` line — legitimate when the module providing that type is brand new, a typo otherwise. The warning is suppressed on a completely empty database, where typos and new modules are indistinguishable.
- **A uuid already owned by a different theme is a hard error.** This is the one DB check: `widget 'a1b2…' already exists under theme 'other', cannot install it under 'mine'`.

Validation errors are collected and printed together, then activation aborts with exit code 1 without touching `config/default.json`.

## Metafield definitions

`metafieldDefinitions` is provisioned by `theme:active` as a **separate step, in its own transaction, after** the content installer — and again on **every server boot**, so a deployment that bakes `config.system.theme` into config and never runs the CLI still gets its fields.

That places it deliberately **outside the SemVer protocol**: editing `metafieldDefinitions` does not require a version bump, and provisioning still runs on a fresh install and on a same-version `no-op`. It is skipped only when activation stops early — a validation failure, a `--dry-run`, or a rejected downgrade. Provisioning is idempotent, and conflicts (a field that already exists with an incompatible `type` or `isList`) are reported with the existing definition kept:

```
  Metafields: 3 seeded, 1 adopted, 0 retired
  Metafield conflicts: 1 (declaration skipped, existing definition kept):
    product.mytheme.material: type declared="short_text" existing="number" — immutable; use a new key
```

See [Using Metafields in a Theme](./metafields.md) for the entry shape and the rules (own namespace, no `required: true`, `appearance.placeholder` as the storefront fallback).

## CLI reference

All theme commands are exposed as npm scripts in a store project. With npm you must pass arguments after `--`:

```bash
npm run theme:active -- my-theme --dry-run
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Command</th>
      <th>What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>theme:active [&lt;id&gt;]</code></td>
      <td>Validate + install/upgrade the manifest, provision metafield definitions, then set <code>config.system.theme</code>.</td>
    </tr>
    <tr>
      <td><code>theme:status [&lt;id&gt;]</code></td>
      <td>List installed theme content, or show one theme's pending diff. Read-only, no prompts — safe in CI.</td>
    </tr>
    <tr>
      <td><code>theme:uninstall &lt;id&gt;</code></td>
      <td>Delete a theme's content after a previewed confirmation.</td>
    </tr>
    <tr>
      <td><code>theme:export-content &lt;id&gt; &lt;version&gt;</code></td>
      <td>Serialize the theme's live content back into <code>theme.json</code>.</td>
    </tr>
  </tbody>
</table>

### `theme:active [<id>] [--dry-run] [--content-only] [-y]`

```bash
npm run theme:active -- my-theme
```

Omit the id and you get an interactive picker listing the directories under `themes/`. The theme directory must exist — a typo never reaches the config write, because a bogus `config.system.theme` would break the server on its next start.

The full sequence:

1. Read `themes/<id>/theme.json`. Missing file → skip straight to step 5.
2. Validate. Any error prints all errors and exits `1`.
3. Warn about never-before-seen widget types.
4. Install or upgrade, print counts, adoptions and conflicts. Provision `metafieldDefinitions`.
5. Write `system.theme` into `config/default.json`.
6. Offer to run `npm run build`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Flag</th>
      <th>Effect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>--dry-run</code></td>
      <td>Print the plan and stop. Nothing is installed, no config is written, exit code <code>0</code>. On a not-yet-installed theme it reports what a fresh install would insert; otherwise it prints the pending counts and conflict count. Declared metafield definitions are reported as a separate line, since they are not part of the content diff.</td>
    </tr>
    <tr>
      <td><code>--content-only</code></td>
      <td>Install the content but leave <code>config.system.theme</code> untouched and skip the build prompt. Built for CI provisioning and e2e fixtures.</td>
    </tr>
    <tr>
      <td><code>-y</code>, <code>--yes</code></td>
      <td>Skip the post-activation "run npm run build?" prompt. The prompt is also skipped automatically when stdin is not a TTY.</td>
    </tr>
  </tbody>
</table>

:::note `theme:active` rewrites `config/default.json`
On a running dev server that rewrite triggers a restart. If you added a dependency since the last boot without installing it, the restart is what surfaces the failure — even though the original boot was fine.
:::

### `theme:status [<id>]`

With no argument, lists every theme that has content installed, marks the active one, and reports per-theme counts of theme-provisioned metafield definitions (flagging orphans left by themes that are no longer active — attribution survives uninstall):

```
Installed theme content:
  my-theme   updated 2026-08-11T09:14:22.104Z  (active)
  old-theme  updated 2026-05-02T11:00:03.881Z
Theme-provisioned metafield definitions:
  my-theme   4
  old-theme  2  (orphaned — theme not active)
```

With a theme id, it runs the same diff `--dry-run` would and prints the pending changes, the conflict count, and the definitions the theme provisioned. It handles the edge cases: a theme with an install snapshot but no `theme.json` on disk, and a theme with no install state but surviving metafield provisions.

### `theme:uninstall <id> [-y]`

Previews everything that will be deleted — widgets, placements, draft changesets and their operation counts, rollout plans — then asks for confirmation. Without `--yes` in a non-interactive shell it refuses rather than proceeding.

Deletion is transactional and ordered by FK direction: rollout plans → changesets (cascading their operations) → widget instances (cascading placements) → install state, with the audit-log row written last.

**Metafield definitions provisioned by the theme are deliberately left in place** — merchant data outlives presentation, and deleting a definition fires a value-prune fan-out across entity tables. The command says so explicitly, and `theme:status` keeps reporting them as orphans.

### `theme:export-content <id> <version> [--set-version <x.y.z>] [--force]`

```bash
npm run theme:export-content -- my-theme 1.4.0 --force
```

Serializes the theme's live content into `themes/<id>/theme.json`.

- **The version is required** and must be valid SemVer. Supply it as the second positional argument or as `--set-version`. It is *not* `--version` — the top-level `evershop` CLI reserves that for the package version and exits before dispatch.
- **UUIDs are read straight from the database and never regenerated.** That stability is the entire contract that lets a buyer's customizations survive your next release.
- **Only `status = TRUE` widgets are exported.** A widget you disabled in the page builder is not part of the shipped theme, and its placements are dropped with it.
- **`theme_name` is preserved** from an existing `theme.json`; otherwise it defaults to the theme id.
- **Metafield definitions attributed to the theme are exported too** — both manifest-declared ones and any created lazily through the page builder — sanitized to the strict manifest shape.
- Refuses to overwrite an existing `theme.json` without `--force`.

## Authoring workflow

The intended loop for building a theme's content is to arrange it visually and export, not to hand-write UUIDs:

1. Activate the theme with `--content-only` (or with no manifest at all) so it is the active theme.
2. Build the storefront content in the [page builder](../knowledge-base/page-builder.md): add widgets, place them, configure them, publish.
3. `npm run theme:export-content -- my-theme 1.0.0` to capture it.
4. Commit `theme.json`.
5. For the next release, edit or re-export, **bump `version`**, and ship.

For a merchant upgrading, the whole surface is `npm run theme:active -- my-theme` — validated, transactional, and conflict-preserving.

## See also

- [Theme Overview](./theme-overview.md) — theme anatomy, activation, and the build pipeline
- [The View System](./view-system.md) — Areas, the target of every placement
- [Using Metafields in a Theme](./metafields.md) — the `metafieldDefinitions` section in detail
- [Page Builder Primitives](./page-builder-primitives.md) — what widget setting components must implement

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
