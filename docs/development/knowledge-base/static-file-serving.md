---
sidebar_position: 37
keywords:
  - Static File Serving
sidebar_label: Static File Serving
title: Static File Serving
description: Learn how EverShop serves static files like images from the public directory and how to properly reference them in your code.
---

# Static File Serving

:::warning
For product images and category images, we recommend using cloud storage for production environments. This approach offers better scalability and performance. Please check the available extensions in the [EverShop Marketplace](https://evershop.io/extensions) for cloud storage solutions.
:::

EverShop provides a simple way to serve static files such as images, stylesheets, and JavaScript files through a directory called `public` in the root of your project. Files placed in this directory can be referenced in your code starting from the base URL (/).

For example, if you add an image at `public/banner.png`, you can access it in your code like this:

```js
<img src="/banner.png" alt="Banner" />
```

The `public` directory is ideal for storing:

- Favicon files (favicon.ico)
- Robots.txt
- Google Site Verification files
- Site manifests
- Static HTML files
- Images and other media files

:::info
After a fresh installation of EverShop, you'll need to manually create the `public` folder in the root directory of your project.
:::

:::info
The directory must be named exactly as `public` (not `publics`, `static`, etc.) to be properly recognized by EverShop.
:::

## Serving Static Files From Your Theme

In addition to the root `public` directory, EverShop also supports serving static files from individual themes. Each theme can have its own `public` folder for theme-specific static assets.

For example, if you have a theme named `my-theme`, you can create a `public` folder within it and place your static files there:

```bash
themes
└── my-theme
    ├── public
    │   └── banner.png
    └── other theme files...
```

You can then access these theme-specific static files using the same base URL pattern:

```js
<img src="/banner.png" alt="Theme Banner" />
```

This approach allows you to:

- Organize theme-specific assets within your theme directory
- Keep your project structure clean and modular
- Easily package and distribute themes with their required assets

:::info
If the same file exists in both the root `public` directory and a theme's `public` directory, the file from the theme takes precedence.
:::

## Best Practices for Static Files

When working with static files in EverShop, consider the following best practices:

### File Organization

Keep your static files organized in subdirectories based on their type:

```bash
public/
├── images/
│   ├── logo.png
│   └── banners/
├── js/
│   └── custom-scripts.js
├── css/
│   └── custom-styles.css
├── fonts/
└── favicon.ico
```

This structure makes it easier to manage assets as your project grows.

### Performance Considerations

- Optimize image files before adding them to the `public` directory
- Use appropriate image formats (WebP for better compression, SVG for graphics)
- Consider adding cache headers to your web server configuration for static files
- For large applications with many assets, consider using a Content Delivery Network (CDN)

### Security

- Never store sensitive information in files placed in the `public` directory
- Be cautious with user-uploaded files; validate and sanitize all user input
- Consider implementing a separate upload directory with proper access controls for user-generated content

By following these practices, you can maintain an organized, performant, and secure static file structure in your EverShop application.
