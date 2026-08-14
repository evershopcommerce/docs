---
sidebar_position: 20
keywords:
  - widget development
  - EverShop customization
  - e-commerce widgets
sidebar_label: Widget Development
title: Developing Widgets for EverShop
description: Learn how to develop custom widgets for your EverShop store, enhancing functionality and providing a unique shopping experience.
---

## What is a Widget?

<p align="center">

![EverShop widget system](./img/widget.png "EverShop widget system")

</p>

Widgets are admin-configurable UI components that store owners place on storefront pages — without writing code. A developer creates the **widget type** (the code); a merchandiser creates **widget instances** (the configuration) and **placements** (where each instance appears).

### How Widgets Work

The widget system has three layers:

1. **Widget type** (developer) — registered once in `bootstrap.ts` with `registerWidget()`. It declares three React components (storefront render, admin settings form, palette preview), a JSON Schema describing its settings, an inline GraphQL settings type, and default settings.

2. **Widget instance** (merchandiser) — a `widget_instance` row: a chosen type plus a `settings` JSONB blob that is validated against the type's schema on every save.

3. **Widget placement** (merchandiser) — one or more `widget_placement` rows, each holding `route`, `area`, `sort_order` and an optional `entity_urn`. **One instance can have many placements**, which is how a single configured widget appears on several routes at once.

:::info Placement moved off the widget row in 2.2
`modules/cms/migration/Version-1.3.0.ts` renamed the `widget` table to `widget_instance` and moved `route`, `area` and `sort_order` out to the new `widget_placement` table. Anything that describes a widget row as carrying its own route or area predates 2.2.
:::

At request time EverShop loads the placements matching the current route (and the request's entity URN, if the page has one), joins their instance settings, and injects each widget into the [Area](/docs/development/theme/view-system#the-area-component) it targets — alongside regular master-level components, sorted by `sortOrder`.

### Where Widgets Are Created

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Surface</th>
      <th>URL</th>
      <th>What it does</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Page builder</strong> (primary)</td>
      <td><code>/admin/page-builder</code></td>
      <td>Drag a widget from the palette onto the canvas. Creates the instance and its placement in one action, with a live storefront preview, a settings drawer, and inline editing.</td>
    </tr>
    <tr>
      <td>Widget grid (legacy)</td>
      <td><code>/admin/widgets</code>, <code>/admin/widgets/new/:type</code>, <code>/admin/widgets/edit/:id</code></td>
      <td>Creates and configures an instance through a standalone form. Still shipped and still supported; placement happens in the page builder.</td>
    </tr>
  </tbody>
</table>

The [page builder](../knowledge-base/page-builder) is where widgets are placed, reordered, previewed and published. The legacy widget grid remains for editing an instance's settings in isolation.

Both surfaces render the **same** `settingComponent`, but they hand it different form plumbing. That difference is the single most common source of widget bugs — see [The setting component runs on two surfaces](#the-setting-component-runs-on-two-surfaces).

### Why Develop Custom Widgets?

- **Admin-managed content** — store owners add, configure, reorder and remove widgets without developer involvement
- **Reusable across routes** — one instance, many placements, one set of settings to maintain
- **Page-builder native** — your widget gets drag-and-drop placement, a live preview, and (if you opt in) inline text editing for free

:::warning Widget instances are scoped to a theme
`modules/pageBuilder/migration/Version-1.1.0.ts` added a `theme` column to both `widget_instance` and `widget_placement`, and `modules/cms/services/widget/loadWidgetInstances.js` filters both queries by the currently active theme (with `IS NOT DISTINCT FROM`, so "no custom theme" is its own bucket rather than a wildcard).

**Widget instances do not carry across themes.** Switch the active theme and the widgets configured under the previous one stop rendering until you switch back. The widget *type* you register in this guide **is** theme-independent — it is available under every theme, and themes cannot override its rendering (see [Customizing existing widgets](#customizing-existing-widgets)).
:::

## How to Develop a Widget

:::info
Before beginning widget development, we recommend reviewing the [EverShop Extension Overview](./extension-overview) and [Create Your First Extension](./create-your-first-extension) documentation to understand extension structure and extension development.
:::

This guide walks through building a custom widget end to end. We'll create a simple greeting widget that displays a customizable welcome message on your storefront.

We'll assume you have a running EverShop installation. If you haven't installed EverShop yet, please follow the [installation guide](../getting-started/installation-guide) first.

Let's start!

### Step 1: Create an Extension

The first step is an extension to hold the widget code. Create an extension called `greeting_widget` with the following structure:

```bash
extensions/
└── greeting_widget/
    ├── dist/                                 # Compiled output — what the runtime loads
    ├── src/
    │   ├── bootstrap.ts
    │   ├── components/
    │   │   └── widgets/
    │   │       ├── GreetingWidget.tsx        # Storefront render
    │   │       ├── GreetingWidgetSetting.tsx # Admin settings form
    │   │       └── GreetingWidgetPreview.tsx # Page-builder palette preview
    │   └── graphql/
    │       └── types/
    │           └── GreetingWidget/
    │               ├── GreetingWidget.graphql
    │               └── GreetingWidget.resolvers.ts
    ├── package.json
    └── tsconfig.json
```

Three components, not two. `registerWidget()` throws if any one of them is missing.

Create a `package.json` file:

```json title="extensions/greeting_widget/package.json"
{
  "name": "greeting_widget",
  "version": "1.0.0",
  "type": "module",
  "description": "A simple greeting widget for EverShop",
  "keywords": ["EverShop widget"],
  "scripts": {
    "compile": "tsc && copyfiles -u 1 \"src/**/*.{graphql,scss,json}\" dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

And a `tsconfig.json`:

```json title="extensions/greeting_widget/tsconfig.json"
{
  "compilerOptions": {
    "module": "NodeNext",
    "target": "ES2018",
    "lib": ["dom", "dom.iterable", "esnext"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react",
    "outDir": "./dist",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "allowArbitraryExtensions": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### Step 2: Register Your Widget

Create `bootstrap.ts`. This file runs once at startup, before the widget manager freezes.

```ts title="extensions/greeting_widget/src/bootstrap.ts"
import path from "path";
import { registerWidget } from "@evershop/evershop/lib/widget";

export default () => {
  registerWidget({
    type: "greeting_widget",
    name: "Greeting Widget",
    description: "Display a greeting message",
    category: "content",
    icon: "Type",
    component: path.resolve(
      import.meta.dirname,
      "components/widgets/GreetingWidget.js"
    ),
    settingComponent: path.resolve(
      import.meta.dirname,
      "components/widgets/GreetingWidgetSetting.js"
    ),
    previewComponent: path.resolve(
      import.meta.dirname,
      "components/widgets/GreetingWidgetPreview.js"
    ),
    enabled: true,
    defaultSettings: {
      text: "Hello, welcome to our store!",
      className: ""
    },
    schema: {
      type: "object",
      additionalProperties: true,
      properties: {
        text: { type: "string" },
        className: { type: "string" }
      }
    },
    graphql: {
      typeDefs: `
        type GreetingWidgetSettings {
          text: String
          className: String
        }
      `,
      settingsType: "GreetingWidgetSettings"
    }
  });
};
```

`import.meta.dirname` resolves inside the **compiled** extension, so these paths point at `extensions/greeting_widget/dist/components/widgets/*.js`. That is deliberate — the registration must reference compiled `.js`, never your `.tsx` source.

The registration properties:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Required</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>type</code></td>
      <td>Yes</td>
      <td>Unique widget-type id. Must match <code>/^[a-zA-Z_][a-zA-Z0-9_]*$/</code> — letters, digits and underscores only.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>Yes</td>
      <td>Label shown in the page-builder palette and the admin widget grid.</td>
    </tr>
    <tr>
      <td><code>component</code></td>
      <td>Yes</td>
      <td>Absolute path to the compiled storefront component.</td>
    </tr>
    <tr>
      <td><code>settingComponent</code></td>
      <td>Yes</td>
      <td>Absolute path to the compiled admin settings form.</td>
    </tr>
    <tr>
      <td><code>previewComponent</code></td>
      <td><strong>Yes</strong></td>
      <td>Absolute path to the compiled palette preview. Omitting it <strong>throws at bootstrap</strong> — see <a href="#step-5-create-the-preview-component">Step 5</a>.</td>
    </tr>
    <tr>
      <td><code>enabled</code></td>
      <td>Yes</td>
      <td>Whether the type is offered to merchandisers. Disabled types are skipped at render time.</td>
    </tr>
    <tr>
      <td><code>defaultSettings</code></td>
      <td>Yes</td>
      <td>Initial settings for a newly created instance. Validated against <code>schema</code> at registration.</td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td>No</td>
      <td>One-line explanation shown under the name in the palette.</td>
    </tr>
    <tr>
      <td><code>category</code></td>
      <td>Recommended</td>
      <td>Palette grouping. One of <code>content</code>, <code>commerce</code>, <code>navigation</code>, <code>marketing</code>, <code>layout</code>. Anything unset lands in "other".</td>
    </tr>
    <tr>
      <td><code>icon</code></td>
      <td>Recommended</td>
      <td>Icon badge in the palette and Layers tab.</td>
    </tr>
    <tr>
      <td><code>schema</code></td>
      <td>Recommended</td>
      <td>JSON Schema (draft-07) for <code>settings</code>. Registering without one logs a deprecation warning today and will be an error in a future version.</td>
    </tr>
    <tr>
      <td><code>graphql</code></td>
      <td>Recommended</td>
      <td>Inline SDL plus the name of its settings type. Without it, <code>Widget.settings</code> is <code>null</code> in the admin and page builder.</td>
    </tr>
  </tbody>
</table>

#### What `registerWidget()` validates

`lib/widget/widgetManager.ts` throws — it does not warn — on each of these:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rule</th>
      <th>Applies to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Path must exist on disk and end in <code>.js</code></td>
      <td><code>component</code>, <code>settingComponent</code>, <code>previewComponent</code></td>
    </tr>
    <tr>
      <td>Filename basename must start with an uppercase letter</td>
      <td><code>component</code>, <code>settingComponent</code>, <code>previewComponent</code></td>
    </tr>
    <tr>
      <td><code>type</code> must be non-empty and match the identifier pattern</td>
      <td><code>type</code></td>
    </tr>
    <tr>
      <td><code>schema</code> must be a compilable JSON Schema, and <code>defaultSettings</code> must validate against it</td>
      <td><code>schema</code></td>
    </tr>
    <tr>
      <td><code>graphql.settingsType</code> must be an object type declared inside <code>graphql.typeDefs</code>; SDL type names must be unique across all widgets</td>
      <td><code>graphql</code></td>
    </tr>
  </tbody>
</table>

Registering a `type` that already exists logs a warning and is skipped — it does not override. To change an existing widget, use `updateWidget()` instead.

:::warning Register from `bootstrap.ts` only
The widget manager freezes the first time `getAllWidgets()` is called, which happens during route handling. After that, `registerWidget`, `updateWidget` and `removeWidget` all throw. There is no way to register a widget from a middleware or a request handler.
:::

:::info Valid `icon` values
`icon` is matched against a curated map in `modules/pageBuilder/components/widgetIcons.ts`; unknown names silently fall back to a generic `Layers` icon. Names available today include `AlignLeft`, `BadgeCheck`, `Banknote`, `BookOpen`, `Box`, `Calendar`, `CircleHelp`, `Columns`, `Globe`, `Image`, `Images`, `Layers`, `LayoutGrid`, `LayoutTemplate`, `Link`, `ListOrdered`, `ListTree`, `Mail`, `Megaphone`, `Menu`, `Minus`, `Newspaper`, `Package`, `PanelTop`, `Quote`, `Rows3`, `Search`, `Share2`, `ShoppingBag`, `ShoppingCart`, `Sparkles`, `Star`, `Tag`, `TicketPercent`, `Type`, `Users` and `Video`.
:::

Ok, we have registered our widget. Let's move to the next step.

### Step 3: Define the GraphQL Schema

Your widget's React components fetch their settings through GraphQL. Add a type and a `Query` field whose **arguments are the setting keys** the components will ask for.

:::info
To learn more about GraphQL in EverShop, refer to the [GraphQL documentation](../knowledge-base/graphql).
:::

```graphql title="extensions/greeting_widget/src/graphql/types/GreetingWidget/GreetingWidget.graphql"
"""
A widget that displays a greeting message
"""
type GreetingWidget {
  text: String
  className: String
}

extend type Query {
  greetingWidget(text: String, className: String): GreetingWidget
}
```

```ts title="extensions/greeting_widget/src/graphql/types/GreetingWidget/GreetingWidget.resolvers.ts"
export default {
  Query: {
    greetingWidget(_, { text, className }) {
      return {
        text: text ?? "",
        className: className ?? ""
      };
    }
  }
};
```

The resolver is often a near-passthrough. It is the right place to normalize stored values (parse JSON, coerce types, resolve URNs into URLs) so the React component never has to defend itself. `modules/cms/graphql/types/Widget/Widget.resolvers.js` has real examples.

:::info Two GraphQL surfaces, not one
This `Query` field backs the **render query** your components export. It is unrelated to the `graphql: { typeDefs, settingsType }` block you passed to `registerWidget()`, which contributes a member to the `WidgetSettings` union that types the `Widget.settings` field the admin and page builder read. You need both: skip the render query and the storefront component gets no data; skip the registration block and `Widget.settings` is `null` and clients fall back to the untyped `Widget.rawSettings`.
:::

### Step 4: Create the Storefront Component

```tsx title="extensions/greeting_widget/src/components/widgets/GreetingWidget.tsx"
import React from "react";

interface GreetingWidgetProps {
  greetingWidget?: {
    text?: string;
    className?: string;
  };
}

export default function GreetingWidget({ greetingWidget }: GreetingWidgetProps) {
  const { text = "", className = "" } = greetingWidget ?? {};
  return (
    <div className={className}>
      <h1>{text}</h1>
    </div>
  );
}

export const query = `
  query Query($text: String, $className: String) {
    greetingWidget(text: $text, className: $className) {
      text
      className
    }
  }
`;

export const variables = `{
  text: getWidgetSetting("text"),
  className: getWidgetSetting("className")
}`;
```

`getWidgetSetting("<key>")` is a build-time placeholder, not a runtime function. The webpack GraphQL loader base64-encodes the key; the `buildQuery` middleware substitutes **this instance's stored value for that key** before the query executes. One key per variable — see [Reading settings with `getWidgetSetting`](#reading-settings-with-getwidgetsetting).

:::danger No `propTypes`, no `defaultProps`
EverShop 2.2 runs on React 19. `defaultProps` is **ignored** on function components (your documented fallbacks silently never apply) and `propTypes` support was removed. Use TypeScript types plus ES default values, as above. See [Upgrading to React 19](/blog/upgrading-to-react-19).
:::

### Step 5: Create the Preview Component

The preview is the stylized mock shown on the page-builder palette's hover card. It is **mandatory** — `registerWidget()` throws without it.

```tsx title="extensions/greeting_widget/src/components/widgets/GreetingWidgetPreview.tsx"
import React from "react";

export default function GreetingWidgetPreview(): React.ReactElement {
  return (
    <div style={{ padding: 16, background: "#ffffff", height: 130 }}>
      <div
        style={{ height: 10, width: "55%", borderRadius: 3, background: "#111111" }}
      />
      <div
        style={{
          height: 6,
          width: "80%",
          marginTop: 10,
          borderRadius: 3,
          background: "#d4d4d8"
        }}
      />
      <div
        style={{
          height: 6,
          width: "68%",
          marginTop: 6,
          borderRadius: 3,
          background: "#d4d4d8"
        }}
      />
    </div>
  );
}
```

The rules:

- It takes **no props**. It receives no GraphQL data, no widget settings and no page context.
- It must render without runtime data — rectangles, lines and stand-ins only.
- The filename must start with an uppercase letter, and the registered path must point at the compiled `.js`.
- It is bundled into the **admin** build under the key `admin_widget_preview_<type>` and looked up by `WidgetPreviewCard`. You never import it yourself — registering the path is the whole wiring. Because it lands in the admin bundle, anything that only exists on the storefront will break it.

Every `*Preview.tsx` under `modules/cms/components/` is a working reference. [Widget Link Fields and Preview Components](./widget-link-fields#the-mandatory-previewcomponent) covers the rules in more detail.

### Step 6: Create the Setting Component

This is the form a merchandiser fills in. It renders on both the page-builder settings drawer and the legacy widget-edit page.

```tsx title="extensions/greeting_widget/src/components/widgets/GreetingWidgetSetting.tsx"
import { InputField } from "@components/common/form/InputField.js";
import { TextareaField } from "@components/common/form/TextareaField.js";
import { _ } from "@evershop/evershop/lib/locale/translate/_";
import React from "react";

interface GreetingWidgetSettingProps {
  // Optional: in the page-builder drawer this component mounts via
  // <Area id="widget_setting_form"> without GraphQL props, because the
  // page-level form already holds the values.
  greetingWidget?: {
    text?: string;
    className?: string;
  };
}

export default function GreetingWidgetSetting({
  greetingWidget
}: GreetingWidgetSettingProps) {
  const { text = "", className = "" } = greetingWidget ?? {};

  return (
    <div className="space-y-3">
      <InputField
        name="settings.className"
        label={_("Custom CSS classes")}
        defaultValue={className}
        placeholder={_("Enter custom CSS classes")}
      />
      <TextareaField
        name="settings.text"
        label={_("Greeting message")}
        defaultValue={text}
      />
    </div>
  );
}

export const query = `
  query Query($text: String, $className: String) {
    greetingWidget(text: $text, className: $className) {
      text
      className
    }
  }
`;

export const variables = `{
  text: getWidgetSetting("text"),
  className: getWidgetSetting("className")
}`;
```

Key points:

- **You do not write submission logic.** Both surfaces persist the form for you.
- **Every field name is a dot path**: `settings.<field>`. That is what writes the value into the instance's `settings` JSONB column.
- **The props are optional.** In the page-builder drawer the component mounts without GraphQL props; default them or the drawer crashes.
- Field components come from `@components/common/form/` — `InputField`, `TextareaField`, `SelectField`, `CheckboxField`, `NumberField`, `ToggleField`, `RadioGroupField`, `RangeField`, `FileField`, `ReactSelectField` and friends. There is **no** `@components/common/form/Field` module; `@components/common/ui/Field` exists but is the low-level label/error wrapper those components are built on, not a form field you bind by name.

:::danger `settings[field]` is not a thing
Bracket syntax (`name="settings[text]"`) does not save. The convention throughout core is the dot path `name="settings.text"` — `modules/cms/components/TextBlockSetting.tsx` is the reference implementation.
:::

### Step 7: Enable Your Extension

Register the extension in your EverShop configuration file:

```json title="config/default.json"
{
  "system": {
    "extensions": [
      {
        "name": "greeting_widget",
        "resolve": "extensions/greeting_widget",
        "enabled": true,
        "priority": 20
      }
    ]
  }
}
```

This configuration specifies the extension name, the path to resolve its code, that it is enabled, and its load priority (lower numbers execute first).

:::warning
The three component paths must be resolvable by Node.js. Make sure the `extensions` folder is configured as a workspace in your project's root `package.json`.
:::

### Step 8: Test Your Widget in Development Mode

```bash
npm run dev
```

The dev server compiles your components and makes the widget available in the admin panel.

### Step 9: Build and Run in Production Mode

First, compile your extension's TypeScript. From your **extension directory**:

```bash
cd extensions/greeting_widget
npm run compile
```

Then, from your **EverShop root directory**, build and start:

```bash
cd ../..
npm run build
npm run start
```

### Step 10: Place the Widget on a Page

Open `/admin/page-builder`, pick a route, then drag **Greeting Widget** from the palette onto the canvas. That creates the instance and its placement in one action; the settings drawer opens your `GreetingWidgetSetting` form, and the canvas re-renders as you type.

Changes are staged in a draft changeset until you hit **Publish** (or schedule a rollout). Read [Page Builder](../knowledge-base/page-builder) for drafts, rollouts, undo/redo and preview tokens.

Congratulations — you've shipped a working EverShop widget.

## Widget Settings in Depth

### The settings schema

`schema` is a JSON Schema (draft-07) compiled with AJV at registration. It does three things:

1. Validates `defaultSettings` at registration — a mismatch throws at bootstrap.
2. Gates **every instance save**, from the page builder and the legacy form alike. An invalid payload is rejected.
3. Documents the settings shape for anyone reading your extension.

Keep `additionalProperties: true`. Instances saved before you added or renamed a field carry extra keys, and a strict schema would make those instances unsavable.

```ts
schema: {
  type: "object",
  additionalProperties: true,
  properties: {
    text: { type: "string" },
    className: { type: "string" },
    itemCount: { type: "integer", minimum: 1, maximum: 12 },
    items: { type: "array", items: { type: "object" } }
  }
}
```

### Reading settings with `getWidgetSetting`

Pass **one setting key per GraphQL variable**, and declare a typed argument for each on your `Query` field:

```tsx
export const query = `
  query Query($collections: [String], $productCount: Int, $divider: Boolean) {
    collectionStackWidget(
      collections: $collections
      productCount: $productCount
      divider: $divider
    ) {
      collections { name products { name url } }
      divider
    }
  }
`;

export const variables = `{
  collections: getWidgetSetting("collections"),
  productCount: getWidgetSetting("productCount"),
  divider: getWidgetSetting("divider")
}`;
```

Rules that matter:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rule</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Put the placeholder in <code>export const variables</code>, never inline in the query body</td>
      <td>Only the variables path strips the quotes around the key before looking it up. Every core widget does it this way.</td>
    </tr>
    <tr>
      <td>Dotted keys work</td>
      <td><code>getWidgetSetting("image.mobile.src")</code> reads a nested value out of the settings object.</td>
    </tr>
    <tr>
      <td>Put fallbacks in <code>defaultSettings</code>, not in the call</td>
      <td>Some core widgets pass a second argument (<code>getWidgetSetting("productCount", 4)</code>). It is harmless but it is <strong>not</strong> applied on the variables path — a missing key resolves to <code>null</code> regardless. <code>defaultSettings</code> is the reliable fallback, backed up by a default in the component or resolver.</td>
    </tr>
    <tr>
      <td>Avoid the no-argument form</td>
      <td><code>getWidgetSetting()</code> still resolves to the whole settings blob (<code>basic_menu</code> uses it with a <code>JSON</code> argument), but it defeats the typed per-field arguments and is not the convention for new widgets.</td>
    </tr>
  </tbody>
</table>

### The setting component runs on two surfaces

Your `settingComponent` is mounted in two places with different form plumbing. Writing for only one of them is the most common widget bug.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th></th>
      <th>Page-builder drawer</th>
      <th>Legacy widget editor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Wrapping form</td>
      <td>The editor's page-level form, shared with inline canvas editing</td>
      <td>A standalone <code>&lt;Form&gt;</code> on <code>/admin/widgets/edit/:id</code></td>
    </tr>
    <tr>
      <td>GraphQL props</td>
      <td><strong>None</strong> — optional-chain and default them</td>
      <td>Supplied from your <code>query</code> / <code>variables</code> exports</td>
    </tr>
    <tr>
      <td>Field paths</td>
      <td>Auto-prefixed to <code>block.&lt;uid&gt;.settings.&lt;field&gt;</code></td>
      <td><code>settings.&lt;field&gt;</code> verbatim</td>
    </tr>
    <tr>
      <td>List / object settings</td>
      <td>Real arrays and objects</td>
      <td>Seeded as a JSON <strong>string</strong> through a hidden input</td>
    </tr>
    <tr>
      <td>Saving</td>
      <td>Debounced auto-save per widget</td>
      <td>Form submit</td>
    </tr>
  </tbody>
</table>

Three rules keep a component correct on both:

**1. Default your props.** `const { text = '' } = greetingWidget ?? {};`

**2. Use `useScopedFormContext()`, not `useFormContext()`,** whenever you call `register` / `watch` / `setValue` / `getValues` / `useFieldArray` directly with a literal `settings.<x>` path. Outside the page builder it is a transparent passthrough; inside the drawer it prefixes the path for you. Field components from `@components/common/form/` are already scope-aware, so a form composed only of those needs nothing.

```tsx
import { useScopedFormContext } from "@components/common/page-builder/WidgetSettingsScope.js";

const { register, watch, setValue, getValues } = useScopedFormContext();
```

**3. Read list settings with `useArraySetting` / `asArray`.** Reading a list as `watch('settings.items') ?? initial` works in the drawer and throws `items.map is not a function` on the legacy page, because `??` only guards `null` and the legacy form hands you a JSON string.

```tsx
import { useArraySetting, asArray } from "@components/common/page-builder";

const items = useArraySetting<Item>("settings.items", initialItems);
const readItems = () => asArray<Item>(getValues("settings.items"), initialItems);
```

[Page Builder Primitives](../theme/page-builder-primitives) documents the full surface — `Editable` for inline canvas editing, `WidgetSettingsScope`, the array helpers, and the pickers.

### Link settings

Do not store a raw URL for a CTA, menu entry or tile. EverShop stores links as **URNs** (`urn:evershop:catalog:category:<uuid>`) and resolves them to the entity's current URL at request time, so a renamed category does not break every widget pointing at it. Use `LinkPicker` / `CtaField` in the setting component and `resolveLink()` in the resolver.

See [Widget Link Fields and Preview Components](./widget-link-fields) for the picker props, the resolver pattern, batching, registering your own link loader, and the silent-failure mode to watch for.

## Customizing Existing Widgets

Widget components are registered with **absolute file paths**, so they bypass the `@components` alias chain. Themes **cannot** override widget rendering by dropping a same-named file into the theme's `components/` folder.

To customize an existing widget, write an extension that calls `updateWidget()` from its `bootstrap.ts`:

```ts title="extensions/my-extension/src/bootstrap.ts"
import path from "path";
import { updateWidget } from "@evershop/evershop/lib/widget";

export default () => {
  updateWidget("greeting_widget", {
    component: path.resolve(
      import.meta.dirname,
      "components/widgets/GreetingWidgetNew.js"
    ),
    settingComponent: path.resolve(
      import.meta.dirname,
      "components/widgets/GreetingWidgetSettingNew.js"
    )
  });
};
```

`updateWidget()` re-validates `component` and `settingComponent` against the same `.js` + uppercase rules, and re-runs schema / GraphQL validation when you change `schema` or `graphql`. Everything else — `name`, `description`, `category`, `icon`, `defaultSettings` — is merged as given.

:::warning `previewComponent` is not re-validated on update
Unlike `registerWidget()`, `updateWidget()` assigns a new `previewComponent` without checking that the file exists, ends in `.js`, or starts with an uppercase letter. A typo there fails later, in the admin bundle, instead of at bootstrap. Double-check that path yourself.
:::

You can also remove a widget type entirely:

```ts
import { removeWidget } from "@evershop/evershop/lib/widget";

removeWidget("greeting_widget");
```

Both calls belong in `bootstrap.ts` — the widget manager is frozen by the time any request is handled.

:::info
Rebuild your project after any widget change:

```bash
npm run build
```

:::

## Troubleshooting

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Symptom</th>
      <th>Cause</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bootstrap throws <em>"Invalid or unresolvable previewComponent path"</em></td>
      <td>The <code>previewComponent</code> property is missing, points at a <code>.tsx</code> file, or the extension has not been compiled yet.</td>
    </tr>
    <tr>
      <td>Bootstrap throws <em>"must start with an uppercase letter"</em></td>
      <td>A component filename starts lowercase — that spelling means "middleware" everywhere else in EverShop.</td>
    </tr>
    <tr>
      <td>Bootstrap throws <em>"defaultSettings that don't match its schema"</em></td>
      <td>Your <code>defaultSettings</code> fails AJV validation. Check types, and set <code>additionalProperties: true</code>.</td>
    </tr>
    <tr>
      <td>Warning: <em>"registered without a schema"</em></td>
      <td>Add a <code>schema</code>. It is optional today and will be required in a future version.</td>
    </tr>
    <tr>
      <td><em>"Widget manager is in a read-only state"</em></td>
      <td>You called <code>registerWidget</code> / <code>updateWidget</code> / <code>removeWidget</code> outside <code>bootstrap.ts</code>.</td>
    </tr>
    <tr>
      <td>Schema build fails with <em>"Unknown type"</em> or a type-name collision</td>
      <td><code>graphql.settingsType</code> is not declared in <code>graphql.typeDefs</code>, or two widgets declare the same SDL type name. Name yours <code>&lt;Widget&gt;Settings</code>.</td>
    </tr>
    <tr>
      <td><code>Widget.settings</code> is <code>null</code> in the admin</td>
      <td>The widget has no <code>graphql</code> block. Clients fall back to the untyped <code>Widget.rawSettings</code>.</td>
    </tr>
    <tr>
      <td>Settings never persist</td>
      <td>Field names use bracket syntax. Use the dot path <code>settings.&lt;field&gt;</code>.</td>
    </tr>
    <tr>
      <td>Settings drawer crashes but the legacy edit page works</td>
      <td>The setting component assumes its GraphQL props exist. Optional-chain and default them.</td>
    </tr>
    <tr>
      <td><code>items.map is not a function</code> on <code>/admin/widgets/edit</code></td>
      <td>A list setting read with <code>watch(...) ?? initial</code>. Use <code>useArraySetting</code> / <code>asArray</code>.</td>
    </tr>
    <tr>
      <td>Documented default values never apply</td>
      <td><code>defaultProps</code> on a function component — ignored by React 19. Use ES default values.</td>
    </tr>
    <tr>
      <td>Widgets vanish after switching themes</td>
      <td>Expected. Instances and placements are theme-scoped; switch back or rebuild them under the new theme.</td>
    </tr>
    <tr>
      <td>A widget renders on one route but not another</td>
      <td>Placement, not configuration. Add a placement for the second route (the drawer's cross-route share list, or a second drag).</td>
    </tr>
  </tbody>
</table>

## Best Practices

1. **Keep widgets focused** — each widget should serve a single, clear purpose.
2. **Write the schema first** — it documents the settings contract and catches bad saves before they reach the storefront.
3. **Normalize in the resolver** — parse, coerce and resolve URNs there so the React component never defends against a bad shape.
4. **Make the preview honest** — a merchandiser picks from the palette based on it.
5. **Test both setting surfaces** — the page-builder drawer *and* `/admin/widgets/edit/:id`.
6. **Render gracefully when empty** — a freshly dropped widget has no content yet; render a hint in the editor rather than nothing at all.
7. **Use responsive design** — widgets are placed into layouts you don't control.

## Conclusion

In this guide, we've covered the complete process of developing a custom widget for EverShop:

- Creating an extension to house your widget code
- Registering a widget type with its three components, schema and GraphQL settings type
- Building the storefront, preview and settings components
- Wiring the render query and resolver
- Enabling the extension, building it, and placing the widget from the page builder

Custom widgets let store administrators compose storefront pages without touching code, while you keep full control over how each block renders.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
