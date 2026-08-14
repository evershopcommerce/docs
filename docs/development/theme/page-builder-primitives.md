---
sidebar_position: 32
keywords:
  - page builder
  - widget settings
  - Editable
  - WidgetSettingsScope
  - useArraySetting
  - inline editing
sidebar_label: Page Builder Primitives
title: Page Builder Primitives For Themes And Widgets
description: The @components/common/page-builder surface — Editable, widget context, settings scoping, and the two-surface rule that makes list settings crash if you read them naively.
---

# Page Builder Primitives For Themes And Widgets

Widgets are configured and arranged in the [page builder](../knowledge-base/page-builder.md). Everything a widget needs to participate — inline text editing on the canvas, correct form-path scoping in the settings drawer, safe reads of list settings — comes from one barrel:

```ts
import {
  Editable,
  WidgetContextProvider,
  WidgetSettingsScope,
  useWidgetUid,
  useWidgetSettings,
  useScopedFieldName,
  useScopedFormContext,
  useArraySetting,
  asArray,
  normalizeImageSrc
} from '@components/common/page-builder';
```

Every one of these is inert outside the page builder. A widget built with them renders as plain markup on the production storefront and behaves identically on the standalone widget editor — that is the point.

## The rule that breaks widgets: two surfaces, two form shapes

**A widget's setting component runs in two completely different form environments.** Almost every widget bug that reaches production is a consequence of only testing one.

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
      <td>Where</td>
      <td>The settings drawer inside <code>/admin/page-builder/edit/:routeId</code></td>
      <td><code>/admin/widgets/edit/:uuid</code></td>
    </tr>
    <tr>
      <td>The form</td>
      <td>One <strong>page-level</strong> <code>useForm</code> owned by the editor, shared by every widget on the route, with <code>shouldUnregister: false</code></td>
      <td>A standalone <code>{'<Form>'}</code> with <code>shouldUnregister: true</code></td>
    </tr>
    <tr>
      <td>Field paths</td>
      <td>Auto-prefixed to <code>block.&lt;uid&gt;.settings.&lt;field&gt;</code></td>
      <td>Used verbatim: <code>settings.&lt;field&gt;</code></td>
    </tr>
    <tr>
      <td>List / object settings</td>
      <td>Real arrays and objects</td>
      <td><strong>JSON strings</strong>, seeded through a hidden input</td>
    </tr>
    <tr>
      <td>GraphQL props</td>
      <td><strong>None</strong> — the component is mounted without its query's data</td>
      <td>Supplied from the component's <code>query</code> export</td>
    </tr>
    <tr>
      <td>Saving</td>
      <td>Per-widget debounced auto-save (one operation per widget per ~300 ms)</td>
      <td>Explicit submit, validated against the widget's JSON schema</td>
    </tr>
  </tbody>
</table>

The last three rows are where the traps live. Take them one at a time.

## Field paths: `WidgetSettingsScope`

A widget setting component writes field names as if it owned the form:

```tsx
<InputField name="settings.heading" label={_('Heading')} />
```

That is correct on the standalone page, where the form's values are shaped `{ name, status, settings: { … } }`. In the drawer, several widgets share one form, so each needs its own namespace. The drawer supplies it by mounting the widget's setting component inside a scope:

```tsx
<WidgetSettingsScope uid={widget.uid}>
  <Area id="widget_setting_form" />
</WidgetSettingsScope>
```

`WidgetSettingsScope` publishes `pathPrefix = 'block.<uid>.'` through React context. Two hooks consume it:

### `useScopedFieldName(name)`

Resolves one field name against the active scope. Returns the input unchanged when no scope is mounted, and is idempotent if the name already starts with the prefix.

```ts
const resolvedName = useScopedFieldName('settings.heading');
// drawer:     'block.9f3c….settings.heading'
// standalone: 'settings.heading'
```

**Every field component in `@components/common/form/` already calls this.** If your setting form is composed purely of `InputField`, `SelectField`, `ToggleField` and friends, scoping is handled — you write bare `settings.*` names and both surfaces work.

### `useScopedFormContext()`

A drop-in replacement for react-hook-form's `useFormContext` whose `register`, `watch`, `setValue`, `unregister` and `getValues` auto-prefix their path argument (including array-of-paths forms). Everything else on the context is passed through untouched.

```tsx
import { useScopedFormContext } from '@components/common/page-builder';

const { register, watch, setValue, getValues } = useScopedFormContext();
```

:::warning Use it whenever you touch the form directly
If your setting component calls `register` / `watch` / `setValue` / `getValues` / `useFieldArray` with a literal `settings.<x>` path — instead of going through a Field component — swap `useFormContext` for `useScopedFormContext`. Outside the page builder it is a transparent passthrough; inside the drawer it is the difference between writing to the right widget and writing nowhere.

A third-party widget still importing vanilla `useFormContext` works on the standalone page and quietly does nothing in the drawer.
:::

## List settings: `useArraySetting` and `asArray`

The legacy widget editor is a plain form: it cannot carry an array through a submit, so `<Form>` seeds list and object settings as a JSON **string** in a hidden input:

```tsx
<input type="hidden" {...register('settings.menus')}
       defaultValue={JSON.stringify(initialMenus)} />
```

Which means this extremely natural line is a crash:

```tsx
// ✗ Works in the drawer. Throws on /admin/widgets/edit/:uuid.
const items = watch('settings.items') ?? initialItems;
```

`??` only guards `null` and `undefined`. A JSON **string** is neither, so it sails straight through into `items.map(…)` — `items.map is not a function`. And if it survived rendering, the string would fail the widget's array schema on save, because settings are never parsed anywhere in the save path.

Use the helpers instead:

```tsx
import { useArraySetting, asArray } from '@components/common/page-builder';

export default function MyWidgetSetting({ myWidget }) {
  const { getValues, setValue } = useScopedFormContext();
  const widgetSettings = useWidgetSettings();

  const initialItems = asArray(
    myWidget?.items ?? widgetSettings.items,
    []
  );

  // Display: always an array, and normalizes form state to a real array on mount.
  const items = useArraySetting('settings.items', initialItems);

  // Mutation reads: never trust getValues to return an array either.
  const readItems = () => asArray(getValues('settings.items'), initialItems);

  const addItem = () => setValue('settings.items', [...readItems(), blank()], {
    shouldDirty: true
  });

  return (
    <RepeatableAccordion
      items={items}
      onRemove={(i) => setValue('settings.items', readItems().filter((_, x) => x !== i))}
      /* … */
    />
  );
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Helper</th>
      <th>Signature</th>
      <th>Behaviour</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>asArray</code></td>
      <td><code>asArray&lt;T&gt;(value, fallback)</code></td>
      <td>Pure coercion. Arrays pass through; JSON strings are parsed (and returned only if they parse to an array); anything else returns <code>fallback</code>. Never throws.</td>
    </tr>
    <tr>
      <td><code>useArraySetting</code></td>
      <td><code>useArraySetting&lt;T&gt;(name, fallback)</code></td>
      <td>Reads the setting through <code>useScopedFormContext().watch</code> and coerces with <code>asArray</code>. Additionally, once on mount, if the stored value is a string it rewrites form state to the parsed array with <code>shouldDirty: false</code> — so the save path sees an array. No-ops in the drawer, where the value is already an array.</td>
    </tr>
  </tbody>
</table>

Reads inside mutators must use `asArray(getValues(name), fallback)` rather than closing over the rendered `items`, so back-to-back edits do not clobber each other.

An alternative that is also correct: hold the array with `useFieldArray` and pass the fallback as `watch`'s second (default) argument — core's `SlideshowSetting` predates the helpers and does this. `RepeatableAccordion` additionally carries a defensive `Array.isArray(items) ? items : []` backstop, but do not rely on it: it protects the render, not the save.

## No GraphQL props in the drawer

On the standalone widget editor, a setting component's `query` export is executed and its results arrive as props. **In the drawer, the component is mounted with no props from that query at all** — the editor injects a synthetic widget entry into the Area machinery, and there is no props mapping for it.

So every prop your setting component declares must be optional and optional-chained, with a fallback:

```tsx
interface MyWidgetSettingProps {
  // Optional: the page-builder drawer mounts this without GraphQL props.
  myWidget?: { items?: Item[]; className?: string };
}

export default function MyWidgetSetting({ myWidget }: MyWidgetSettingProps) {
  const widgetSettings = useWidgetSettings();

  const initialItems = asArray(
    myWidget?.items ?? (widgetSettings.items as Item[] | undefined),
    []
  );
  const initialClassName =
    myWidget?.className ?? ((widgetSettings.className as string) ?? '');
  // …
}
```

`useWidgetSettings()` is the reliable settings source in the drawer — it reads the widget's currently-applied settings (overlay already merged) from widget context. Core's `BasicMenuSetting` is the canonical implementation of this pattern.

## Widget identity: `WidgetContextProvider` and `useWidgetUid`

```tsx
<WidgetContextProvider uid={uuid} settings={settings}>
  {children}
</WidgetContextProvider>
```

Wraps a rendered widget so nested components can identify which instance they belong to without prop drilling. The page-builder iframe's widget shell mounts one per widget render; the production storefront provides the context too, at no DOM cost.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Export</th>
      <th>Returns</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>useWidgetUid()</code></td>
      <td>The widget instance uid, or <code>null</code> outside a provider.</td>
    </tr>
    <tr>
      <td><code>useWidgetSettings()</code></td>
      <td>The widget's currently-applied settings object, or <code>{'{}'}</code> outside a provider.</td>
    </tr>
  </tbody>
</table>

## Inline editing: `Editable`

`<Editable>` makes a piece of a widget's text editable directly on the canvas.

```tsx
import { Editable } from '@components/common/page-builder';

<Editable as="h2" fieldPath="settings.heading" className="banner__heading">
  {heading}
</Editable>
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>fieldPath</code></td>
      <td>string</td>
      <td>—</td>
      <td>Dot path under the widget's settings — <code>"settings.heading"</code>, or nested: <code>"settings.slides.0.heading"</code>.</td>
    </tr>
    <tr>
      <td><code>children</code></td>
      <td>string</td>
      <td><code>''</code></td>
      <td>The current text. <strong>Must be a string</strong> — plain text only.</td>
    </tr>
    <tr>
      <td><code>as</code></td>
      <td>ElementType</td>
      <td><code>'span'</code></td>
      <td>The tag to render.</td>
    </tr>
    <tr>
      <td><code>multiline</code></td>
      <td>boolean</td>
      <td><code>false</code></td>
      <td>Allow line breaks. When false, Enter blurs instead of inserting a newline.</td>
    </tr>
    <tr>
      <td><code>className</code></td>
      <td>string</td>
      <td>—</td>
      <td>Applied on both the production and the editable element, so styling is identical.</td>
    </tr>
    <tr>
      <td><code>focusOnMount</code></td>
      <td>boolean</td>
      <td><code>false</code></td>
      <td>Grab focus and place the caret at the end on mount — for click-to-edit wrappers.</td>
    </tr>
    <tr>
      <td><code>onBlur</code></td>
      <td>function</td>
      <td>—</td>
      <td>Called after blur, once the pending edit has flushed.</td>
    </tr>
  </tbody>
</table>

How it behaves:

- **On the production storefront it renders `<Tag className={className}>{children}</Tag>` and nothing else.** No contenteditable, no listeners, no injected stylesheet.
- **SSR-safe by construction.** The first render is always the production path; page-builder mode is detected after mount, so there is no hydration mismatch.
- **It needs a widget uid.** With no `WidgetContextProvider` above it, it stays on the production path even inside the builder.
- **Edits flush on a 250 ms input debounce and again on blur.** Escape reverts to the original text and blurs. Pasted content is stripped to plain text.
- **It sends the full new settings object**, patched at `fieldPath`, so the editor's save path is the same one the settings drawer uses — one debounced operation per widget, whichever surface produced the change.

Related exports in the same barrel: `EditableMarkdown` (click-to-edit rich body text) and `EditableImage` / `EditableImageOverlay` (inline image replacement).

## Image paths: `normalizeImageSrc`

Any value picked from the file manager must be routed through `normalizeImageSrc` before you store it:

```ts
import { normalizeImageSrc } from '@components/common/page-builder';

setValue('settings.image', normalizeImageSrc(picked), { shouldDirty: true });
```

It collapses accidental duplicate slashes in plain paths (`/assets//file.jpg`, emitted by older file-browser builds) while leaving absolute (`https://bucket.s3.amazonaws.com/key`) and protocol-relative (`//cdn.example.com/key`) URLs untouched.

:::danger Never hand-roll this normalization
The obvious `raw.replace(/\/{2,}/g, '/')` corrupts `https://` into `https:/`. Cloud file storage returns full URLs, the storefront image proxy checks for a literal `https://` prefix, and a single-slash URL is treated as a local path and 404s. Browsers silently repair `https:/` in the address bar, so the value looks fine everywhere *except* through `/images` — which is exactly where your widget renders it.
:::

## Drawer UI primitives

The same barrel exports the building blocks core's own setting forms are made of, so a third-party widget's drawer looks native:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Export</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>Section</code>, <code>Field</code></td>
      <td>Collapsible group and labelled row layout.</td>
    </tr>
    <tr>
      <td><code>Segmented</code>, <code>Slider</code>, <code>Toggle</code></td>
      <td>Compact drawer-sized controls.</td>
    </tr>
    <tr>
      <td><code>drawerInputClass</code>, <code>drawerTextareaClass</code></td>
      <td>Class strings matching the drawer's input styling.</td>
    </tr>
    <tr>
      <td><code>RepeatableAccordion</code></td>
      <td>Add / remove / reorder list editor. Requires a real array — see above.</td>
    </tr>
    <tr>
      <td><code>AnchorPicker</code>, <code>ANCHOR_CELLS</code></td>
      <td>Nine-cell content-position picker.</td>
    </tr>
    <tr>
      <td><code>ImagePickerField</code>, <code>ColorSwatchField</code>, <code>MarkdownBodyField</code>, <code>CtaField</code></td>
      <td>Composite fields for the common widget settings.</td>
    </tr>
    <tr>
      <td><code>CategoryPicker</code>, <code>ProductPicker</code>, <code>CollectionPicker</code>, <code>PagePicker</code>, <code>LandingPagePicker</code>, <code>LinkPicker</code></td>
      <td>Entity pickers backed by admin search.</td>
    </tr>
  </tbody>
</table>

## Testing checklist for a widget setting component

1. Open it in the **page-builder drawer**, change every field, and confirm the canvas updates and the change survives a reload.
2. Open the same widget at **`/admin/widgets/edit/:uuid`**, change every field, and **save**. Any list or object setting that was only tested in the drawer will surface here.
3. Confirm the component renders without crashing when its GraphQL prop is `undefined`.
4. Confirm the widget renders correctly on the **production storefront**, where none of these primitives are active.

## See also

- [Page Builder](../knowledge-base/page-builder.md) — the editor, changesets, and publishing
- [Widget Development](../module/widget-development.md) — registering a widget type and its settings schema
- [Theme Content](./theme-content.md) — shipping widget instances and placements in `theme.json`
- [The View System](./view-system.md) — Areas, the placement targets

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
