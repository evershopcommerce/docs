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

:::warning
Note that the file extension must be `.scss` (NOT `.css`) to be properly processed by EverShop's build system.
:::

## Using TailwindCSS

EverShop integrates [TailwindCSS](https://tailwindcss.com/) for utility-first styling. The default EverShop theme is built using TailwindCSS, making it easy to customize and extend.

### Using TailwindCSS in Your Theme

By default, EverShop themes include TailwindCSS so you can start using it immediately.

### Removing TailwindCSS

If you prefer not to use TailwindCSS in your theme, you can override the default layout template from the CMS module and remove the TailwindCSS imports.

To do this, create a new layout file in your theme:

```js title="themes/yourtheme/src/pages/all/Layout.jsx"
import React from "react";
import "./custom-layout.scss"; // Your custom styles
```

:::info
For more information on customizing layout templates, refer to the [templating documentation](./templating).
:::

### Customizing TailwindCSS Configuration

You can customize TailwindCSS by creating a `tailwind.config.js` file in your theme directory. This allows you to:

- Enable or disable specific plugins
- Customize colors, fonts, and spacing
- Define custom variants
- Add plugins

Here's an example configuration:

```js title="themes/src/yourtheme/tailwind.config.js"
module.exports = {
  corePlugins: {
    // Disable unused plugins to reduce bundle size
    lineHeight: false,
    ... // other plugins you want to disable
  },
  theme: {
    // Customize theme settings
    fontFamily: {
      sans: "Helvetica,Helvetica Neue,Arial,Lucida Grande,sans-serif",
    },
    fontSize: {
      base: ".875rem",
    },
    colors: {
      white: "#ffffff",
      primary: "#3a3a3a",
      secondary: "#111213",
    },
    spacing: {
      0: "0px",
    },
    margin: {
      0: "0px",
    },
    borderRadius: {
      DEFAULT: "0.25rem",
      100: "100%",
    },
    borderWidth: {
      0: "0px",
      DEFAULT: "1px",
    },
    boxShadow: {
      DEFAULT: "0 0 0 1px rgba(63,63,68,.05),0 1px 3px 0 rgba(63,63,68,.15)",
    },
  },
  variants: {
    extend: {
      borderWidth: ["first", "last"],
      margin: ["first", "last"],
      padding: ["first", "last"],
    },
  },
  plugins: [],
};
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
        },
        {
          "rel": "stylesheet",
          "href": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
        }
      ]
    }
  }
}
```

:::info
For more information about theme configuration options, refer to the [configuration guide](../knowledge-base/configuration-guide).
:::

### 2. Importing CSS in Global Components

Another approach is to import CSS files directly in a component that appears on every page of your storefront. This method provides more control over the loading order of your styles.

Create a global component that will be included in your layout:

```ts title="themes/yourtheme/src/pages/all/Global.tsx"
import React from "react";
import { ComponentLayout } from "@evershop/evershop";
import "./global-styles.scss"; // Your global styles

export default function Global() {
  // This component doesn't need to render anything visible
  return <></>;
}

export const layout: ComponentLayout = {
  areaId: "head", // This will include the component in the head section
  sortOrder: 1, // Lower numbers load first
};
```

## Best Practices for Styling in EverShop

When styling your EverShop theme, consider these recommendations:

1. **Choose a consistent approach**: Decide whether to use TailwindCSS, SCSS, or standard CSS throughout your theme for better maintainability.

2. **Leverage component-scoped styles**: Keep styles related to specific components in their own files to improve modularity.

3. **Minimize global styles**: Use global styles sparingly to avoid specificity issues and unintended side effects.

4. **Optimize for performance**: Be mindful of CSS bundle size, especially when using utility frameworks like TailwindCSS.

5. **Use variables for consistency**: Whether through SCSS variables or TailwindCSS configuration, use variables for colors, spacing, and other repeated values.
