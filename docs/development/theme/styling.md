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
description: Learn how to style your EverShop themes using CSS, SCSS, and TailwindCSS. This guide explains different styling approaches and how to implement them in your components and pages.
---

# Styling Your EverShop Theme

EverShop provides multiple options for styling your storefront, including standard CSS, Sass/SCSS, and TailwindCSS. This flexibility allows you to choose the approach that best fits your workflow and project requirements. This document explains how to implement different styling methods in your EverShop themes.

## Using SCSS Files

EverShop supports SCSS (Sassy CSS) out of the box, allowing you to use variables, nesting, mixins, and other Sass features to make your styles more maintainable.

To use SCSS in a component or page:

```js
import React from "react";
import "./style.scss";

export default function MyComponent() {
  return <div className="my-component">Hello World</div>;
}
```

In this example, the `style.scss` file is imported directly into the component. You can write your SCSS styles in that file, and they will be applied to the component.

## Using TailwindCSS

EverShop integrates [TailwindCSS](https://tailwindcss.com/) for utility-first styling. The default EverShop theme is built using TailwindCSS, making it easy to customize and extend.

### Using TailwindCSS in Your Theme

By default, EverShop themes include TailwindCSS v4 so you can start using it immediately.

:::info
For more information on customizing layout templates, refer to the [templating documentation](./templating).
:::

### Customizing TailwindCSS Configuration

You can customize TailwindCSS by overriding the default `TailwindCss.tsx` component.

:::info
You can use the `theme:twizz` command to create component overrides for your theme. This tool will automatically copy the selected component and its dependencies to your active theme directory, maintaining the correct file structure for theme overrides. For more details, refer to the [theme development tool documentation](../knowledge-base/command-lines#theme-development-tool).
:::

The `TailwindCss.tsx` component imports the `tailwind.css` file and return `null` since it doesn't render any visible content. After you create an override of this component, you can modify the `tailwind.css` file to customize your TailwindCSS 4 configuration.

Here's the default `tailwind.css` file included in the default theme:

```css title="modules/base/pages/frontStore/all/tailwind.css"
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import "tw-animate-css";
@import "./shadcn.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-divider: var(--divider);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.325rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --divider: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

## Using Sass

In addition to SCSS, EverShop supports the indented syntax of [Sass](https://sass-lang.com/). This provides a more concise way to write your styles with meaningful whitespace.

Example of SCSS syntax:

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: inline-block;
  }

  a {
    display: block;
    padding: 6px 12px;
    text-decoration: none;
  }
```

You can import these files into your components just as you would with SCSS files.

## Adding Global CSS

There are two approaches to include global CSS that will be applied across your entire storefront:

### 1. Using Configuration Files

You can add external CSS files to your theme by modifying the `themeConfig` section in your configuration file. This approach is useful for third-party libraries or fonts that need to be loaded across your entire site.

```js title="config/default.json"
{
  // Other configuration settings
  "themeConfig": {
    "headTags": {
      "links": [
        {
          "rel": "stylesheet",
          "href": "/custom.css"
        }
      ]
    }
  }
}
```

:::info
For more information about theme configuration options, refer to the [configuration guide](../knowledge-base/configuration-guide).
:::

:::info
For more information about how to serve static assets in your theme, refer to the [static assets documentation](../knowledge-base/static-file-serving).
:::

### 2. Importing CSS in Global Components

Another approach is to import CSS files directly in a component that appears on every page of your storefront. This method provides more control over the loading order of your styles.

You can do it by overriding the `GlobalCss.tsx` component that will be included in your layout:

```ts title="themes/yourtheme/src/pages/all/GlobalCss.tsx"
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

And then you can add your global styles in the `global.scss` file:

```scss title="themes/yourtheme/src/pages/all/global.scss"
body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

## Best Practices for Styling in EverShop

When styling your EverShop theme, consider these recommendations:

1. **Choose a consistent approach**: Decide whether to use TailwindCSS, SCSS, or standard CSS throughout your theme for better maintainability.

2. **Leverage component-scoped styles**: Keep styles related to specific components in their own files to improve modularity.

3. **Minimize global styles**: Use global styles sparingly to avoid specificity issues and unintended side effects.

4. **Optimize for performance**: Be mindful of CSS bundle size, especially when using utility frameworks like TailwindCSS.

5. **Use variables for consistency**: Whether through SCSS variables or TailwindCSS configuration, use variables for colors, spacing, and other repeated values.
