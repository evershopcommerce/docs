---
sidebar_position: 27
keywords:
  - accessibility
  - a11y
  - aria
  - keyboard navigation
  - theme:twizz
sidebar_label: Accessibility
title: Accessibility Contracts A Theme Must Preserve
description: Core components carry accessibility behaviour that a theme silently reverts when it forks them. This page documents each contract and how to keep it.
---

# Accessibility Contracts A Theme Must Preserve

Most accessibility guidance for themes is generic: use real headings, label your controls, keep contrast up. This page is not that. It documents the accessibility behaviour that is **already implemented in core components** — behaviour a theme inherits for free right up until it forks the component that carries it.

That matters because forking is the normal workflow. `theme:twizz` exists precisely to copy a core component into your theme:

```bash
npm run theme:twizz
```

It lists every `.tsx` / `.jsx` file under core's `components/common/`, `components/frontStore/`, and every module's `pages/frontStore/`, lets you pick one, and copies it — plus its relative-import closure — into `themes/<active-theme>/src/`. From that moment your copy is frozen. Core can fix an accessibility bug in its version and your store will never see the fix, and if you restructure the markup while forking you can drop the behaviour on the spot.

The contracts below are the ones that are easy to lose and expensive to notice.

:::tip Before you fork
A fork that only swaps utility classes should be CSS instead, and a fork that only adds siblings should be an additive Area component instead — see [Templating](./templating.md). Both avoid this problem entirely, because the core component keeps rendering.
:::

## Contract 1 — Form field errors are wired to the input

Every field component in `@components/common/form/` implements the same error-announcement contract. A screen reader must be told (a) that the input is invalid and (b) *what* the error says — a red message rendered near the input is invisible to assistive technology unless it is associated with the input.

The wiring, from `InputField`:

```tsx
const resolvedName = useScopedFieldName(name);
const fieldError = getNestedError(resolvedName, errors, error);
const fieldId = `field-${resolvedName}`;

<InputGroupInput
  {...field}
  id={fieldId}
  aria-invalid={fieldError !== undefined ? 'true' : 'false'}
  aria-describedby={fieldError !== undefined ? `${fieldId}-error` : undefined}
/>

{fieldError && <FieldError id={`${fieldId}-error`}>{fieldError}</FieldError>}
```

Four things have to line up:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Element</th>
      <th>Requirement</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>The input</td>
      <td>Carries the <code>fieldId</code> as its <code>id</code>, and an <code>aria-invalid</code> that reflects the current error state.</td>
    </tr>
    <tr>
      <td><code>aria-describedby</code></td>
      <td>Points at the error element's id when there is an error, and is <code>undefined</code> (not an empty string, not a dangling id) when there is not.</td>
    </tr>
    <tr>
      <td><code>FieldError</code></td>
      <td>Rendered with the <strong>matching</strong> id — <code>&lt;fieldId&gt;-error</code>. Without the id the association is broken and the message is never announced.</td>
    </tr>
    <tr>
      <td><code>FieldLabel</code></td>
      <td>Carries <code>htmlFor</code> set to the same <code>fieldId</code>, so clicking the label focuses the input and the accessible name resolves.</td>
    </tr>
  </tbody>
</table>

`fieldId` is built from the **resolved** field name, not the raw `name` prop. Inside a [`WidgetSettingsScope`](./page-builder-primitives.md) the path is prefixed with `block.<uid>.`, which keeps ids unique when several widgets' setting forms share one page-level form. If you rebuild a field component, resolve the name first and derive the id from the result.

The wrapper also sets `data-invalid` on `<Field>`, which is what the error styling hangs off — so a fork that keeps `aria-*` but drops `data-invalid` loses the visual state, and one that keeps the styling but drops `aria-*` loses the announcement.

Seventeen field components implement this: `InputField`, `TextareaField`, `SelectField`, `CheckboxField`, `RadioGroupField`, `NumberField`, `RangeField`, `ToggleField`, `FileField`, `ReactSelectField`, `DateField`, `TimeField`, `DateTimeLocalField`, `EmailField`, `PasswordField`, `TelField` and `UrlField`. Fork any of them and you own this contract.

:::warning The hidden-input case
`InputField` special-cases `type="hidden"`: it renders no label and no wrapper, but it still renders `FieldError` with the id. Dropping that branch means a hidden field's validation error becomes completely unreachable — no visible message *and* no announcement.
:::

**Cheapest fix:** don't fork field components at all. Compose them. If you need a differently shaped input, wrap `InputField` or restyle it via classes rather than reimplementing the react-hook-form + aria plumbing.

## Contract 2 — Product-card Add to Cart must be reachable without a mouse

Product cards reveal their Add-to-Cart control on hover. Implemented naively, that control is **unreachable for keyboard users** (focus does not trigger `:hover`) and **unreachable on touch devices** (which have no hover at all) — which on a phone means a shopper simply cannot add to cart from a listing.

`ProductListItemRender` solves it with three parallel reveal conditions:

```tsx
<div className="product__list__actions p-4 invisible transform translate-y-4
  transition-all duration-300 ease-in-out
  group-hover:visible group-hover:translate-y-0
  group-focus-within:visible group-focus-within:translate-y-0
  [@media(hover:none)]:visible [@media(hover:none)]:translate-y-0">
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Variant</th>
      <th>Covers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>group-hover:</code></td>
      <td>Pointer users. Not sufficient on its own.</td>
    </tr>
    <tr>
      <td><code>group-focus-within:</code></td>
      <td>Keyboard users — the wrapper reveals as soon as anything inside it takes focus, including the button itself.</td>
    </tr>
    <tr>
      <td><code>[@media(hover:none)]:</code></td>
      <td>Touch devices — the control is simply always visible, since there is no hover state to wait for.</td>
    </tr>
  </tbody>
</table>

Each variant must set **both** `visible` and `translate-y-0`: revealing an element that is still translated out of place is a half-fix, and an element that is `visible` but shifted can end up outside its card.

The `group` class lives on the card's outer wrapper (`.product__list__item__inner`), so `group-focus-within` reacts to focus anywhere in the card. Both the `grid` and the `list` layout branches carry the full set — a fork that copies only one branch fixes half the storefront.

:::danger This is the single most commonly reverted contract
`group-hover:visible` alone is what a designer's mockup implies and what most hand-written card markup ends up with. It compiles, it looks right on a laptop, and it makes the store's listings unusable on a phone.
:::

If your card design shows the Add-to-Cart button unconditionally, none of this applies — the problem only exists for hover-reveal designs.

## Contract 3 — Icon-only controls carry an accessible name

Any control whose only child is an SVG has no accessible name unless one is supplied. Core's icon-only controls carry `aria-label`:

- **Product gallery** — `Media` labels its arrows and fullscreen close button with `_('Previous slide')`, `_('Next slide')` and `_('Close fullscreen view')`.
- **Mini cart** — `DefaultMiniCartIcon` labels the trigger with the item count, so the name conveys the current cart state rather than just "cart".
- **Search** — `SearchInfo`'s submit uses `_('Search')`; `SearchBox`'s toggle carries a plain `aria-label="Search"`.

Prefer the translated form (`_('…')`) for any label you add or replace — some of core's existing labels are still plain strings, which is a limitation to copy from, not a pattern to follow.

When you swap an icon set or restyle these controls, carry the `aria-label` across. If you replace an icon-only control with one that shows a text label, remove the now-redundant `aria-label` rather than leaving both.

## A review checklist for every fork

After `theme:twizz` copies a component into your theme, before you start restyling:

1. **Diff your copy against core on every upgrade.** A fork is a snapshot; core keeps moving. Keep the original path in a comment at the top of your file so the diff is a one-liner.
2. **Grep your fork for `aria-`, `role=`, `htmlFor`, `id=` and `sr-only`.** Every occurrence in core's version must survive in yours, with the ids still matching each other.
3. **Grep for `group-hover`.** If it appears without a `group-focus-within` sibling and a `hover:none` fallback, and the element it reveals is interactive, the fork is broken for keyboard and touch.
4. **Tab through the page.** Every interactive element must be reachable, must show a visible focus ring, and must not be hidden at the moment it receives focus.
5. **Test with a touch device or the browser's device emulation.** Emulation alone will not disable hover in every browser — the `hover: none` media query is what actually matters, so verify the element is visible with hover emulation off.
6. **Submit a form with invalid data and check the DOM.** The input should have `aria-invalid="true"` and an `aria-describedby` pointing at an element that exists.

## See also

- [Templating](./templating.md) — the override ladder, and why most changes should not be forks
- [Theme Overview](./theme-overview.md) — `theme:twizz` and the theme directory layout
- [InputField](./components/InputField.md) — the field component reference
- [ProductList](./components/ProductList.md) — the listing component that renders product cards

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
