---
sidebar_position: 20
keywords:
  - Styling
  - CSS
  - TailwindCSS
  - SCSS
  - Sass
sidebar_label: Styling
title: Styling Your EverShop Theme
description: Learn how to style your EverShop themes using CSS, SCSS, and TailwindCSS v4. This guide explains different styling approaches and how to implement them in your components and pages.
---

# Styling Your EverShop Theme

EverShop supports three styling approaches: **TailwindCSS v4**, **SCSS/Sass**, and **plain CSS**. You can use any combination of these in your theme. This document explains how each approach works and how to customize the default styling.

## How Styling Works

EverShop's build system processes stylesheets through this pipeline:

1. **SCSS** files (`.scss`) are compiled by `sass-loader`
2. **CSS** files (`.css`) and compiled SCSS are processed by **PostCSS** with the TailwindCSS v4 plugin
3. Final CSS is bundled into the page

This means Tailwind utility classes work in **both** `.css` and `.scss` files — you don't need to choose one approach over the other.

## TailwindCSS v4

EverShop uses [TailwindCSS v4](https://tailwindcss.com/) (`^4.1.x`), which is a major departure from Tailwind v3. In v4, configuration is done entirely in CSS using native directives — there is no `tailwind.config.js` file.

### Using Tailwind Classes

Use Tailwind utility classes directly in your JSX:

```tsx
export default function ProductBadge({ label }) {
  return (
    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
      {label}
    </span>
  );
}
```

### How Tailwind Is Loaded

EverShop loads Tailwind through a master-level component called `TailwindCss.tsx`, which lives in the `all/` folder and runs on every storefront page:

```tsx title="modules/base/pages/frontStore/all/TailwindCss.tsx"
import React from 'react';
import './tailwind.css';

export default function TailwindCss() {
  return null;
}

export const layout = {
  areaId: 'head',
  sortOrder: 1
};
```

The component returns `null` (renders nothing visible) — its purpose is to import the `tailwind.css` file, which contains all the Tailwind configuration and design tokens.

### The `tailwind.css` Configuration

The `tailwind.css` file is the entry point for TailwindCSS v4. Here are the key directives:

```css title="tailwind.css"
/* Import the Tailwind v4 framework */
@import 'tailwindcss';

/* Load the typography plugin */
@plugin "@tailwindcss/typography";

/* Import animation utilities */
@import 'tw-animate-css';

/* Import design tokens (colors, radius, etc.) */
@import './shadcn.css';

/* Define dark mode variant */
@custom-variant dark (&:is(.dark *));

/* Map CSS custom properties to Tailwind theme values */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... more mappings */
}
```

The design tokens (colors, border radius, etc.) are defined as CSS custom properties in `:root` and `.dark` selectors. This provides a consistent design system with built-in dark mode support.

The key Tailwind v4 directives used:

- **`@import 'tailwindcss'`** — Loads the Tailwind framework (replaces the old `@tailwind base/components/utilities` directives from v3)
- **`@plugin`** — Loads a Tailwind plugin (replaces the `plugins` array in v3's `tailwind.config.js`)
- **`@theme inline`** — Defines theme values that Tailwind uses for utility class generation (replaces the `theme.extend` object from v3)
- **`@custom-variant`** — Defines custom variant selectors (replaces `darkMode` config from v3)

### Customizing Tailwind Configuration

To customize the Tailwind configuration for your theme, override the `TailwindCss.tsx` component and its associated CSS files.

**Step 1:** Use the `theme:twizz` command to copy the component to your theme:

```bash
npx evershop theme:twizz
```

Select `TailwindCss.tsx` from the list. This copies the component, `tailwind.css`, and `shadcn.css` to your theme's `pages/all/` folder.

**Step 2:** Edit the `tailwind.css` file in your theme to customize the configuration. For example, to add a custom Tailwind plugin or additional theme values:

```css title="themes/my-theme/src/pages/all/tailwind.css"
@import 'tailwindcss';
@plugin "@tailwindcss/typography";
@import 'tw-animate-css';
@import './shadcn.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  /* Add your custom theme values here */
  --color-brand: var(--brand);
  --font-heading: 'Playfair Display', serif;
}
```

**Step 3:** Modify the CSS custom properties in the same file (or in `shadcn.css`) to change the actual color values, border radius, and other design tokens:

```css title="Customize colors by overriding :root variables"
:root {
  --radius: 0.5rem;
  --primary: oklch(0.55 0.2 250);        /* Custom blue */
  --primary-foreground: oklch(0.985 0 0); /* White text on primary */
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.15 0 0);
  --brand: oklch(0.6 0.25 30);           /* Custom brand color */
}

.dark {
  --primary: oklch(0.7 0.2 250);
  --background: oklch(0.12 0 0);
  --foreground: oklch(0.95 0 0);
}
```

After these changes, all Tailwind classes like `bg-primary`, `text-foreground`, `rounded-lg` will use your custom values.

:::info
For more information about the `theme:twizz` command, see the [Command Line Documentation](../knowledge-base/command-lines#theme-development-tool).
:::

## Using SCSS

EverShop supports SCSS (Sassy CSS) out of the box, allowing you to use variables, nesting, mixins, and other Sass features.

Import SCSS files directly in your components:

```tsx
import React from "react";
import "./style.scss";

export default function MyComponent() {
  return <div className="my-component">Hello World</div>;
}
```

```scss title="style.scss"
.my-component {
  padding: 1rem;
  border: 1px solid var(--border);

  &:hover {
    background-color: var(--accent);
  }

  h3 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
}
```

:::info
SCSS files are processed through the same PostCSS pipeline as CSS files, so Tailwind's `@apply` directive works inside SCSS if needed.
:::

## Adding Global CSS

There are two approaches for adding CSS that applies across your entire storefront.

### Approach 1: Override the `GlobalCss.tsx` Component (Recommended)

EverShop includes a `GlobalCss.tsx` component that loads on every storefront page. Override it in your theme to add your own global styles:

**Step 1:** Use `theme:twizz` to copy the component, or create it manually:

```tsx title="themes/my-theme/src/pages/all/GlobalCss.tsx"
import React from "react";
import "./global.scss";

export default function GlobalCss() {
  return null;
}

export const layout = {
  areaId: "head",
  sortOrder: 5,
};
```

**Step 2:** Add your global styles in the SCSS file:

```scss title="themes/my-theme/src/pages/all/global.scss"
body {
  font-family: 'Inter', sans-serif;
}

.page-width {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

a {
  color: var(--primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
```

This approach bundles your CSS into the page's JavaScript bundle, so it goes through the full build pipeline (SCSS compilation + Tailwind processing).

### Approach 2: Link External CSS via Configuration

For third-party CSS files, Google Fonts, or other external stylesheets that don't need build processing, add them to the `<head>` via configuration:

```json title="config/default.json"
{
  "themeConfig": {
    "headTags": {
      "links": [
        {
          "rel": "stylesheet",
          "href": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        },
        {
          "rel": "stylesheet",
          "href": "/custom.css"
        }
      ]
    }
  }
}
```

Local files (like `/custom.css`) should be placed in the `public/` folder of your theme or project root. See [Static File Serving](../knowledge-base/static-file-serving) for details.

:::warning
Files added via configuration are loaded as separate HTTP requests and are **not** processed by the build pipeline — no SCSS compilation, no Tailwind processing. Use this approach only for external resources or pre-built CSS.
:::

## Styling Best Practices

1. **Use Tailwind utility classes as the primary approach** — The default theme is built with Tailwind. Staying consistent makes your theme easier to maintain.

2. **Use SCSS for complex component styles** — When a component needs styles that are hard to express with utilities (animations, complex selectors), use a co-located SCSS file.

3. **Customize via design tokens, not overrides** — Instead of writing CSS that fights the defaults, modify the CSS custom properties in `tailwind.css` to change colors, spacing, and radius globally.

4. **Keep component styles co-located** — Place SCSS files next to the component that uses them (e.g., `ProductCard.tsx` and `ProductCard.scss` in the same folder).

5. **Use `var(--token)` for consistency** — Reference design tokens like `var(--primary)`, `var(--border)`, `var(--background)` in your SCSS so your styles respond to the same theme as Tailwind classes.
