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
This page is about the `public` directory — static files you ship with your project. It is **not** where uploaded product and category images live; those go to the `media` folder or to a cloud storage provider.

For production, use cloud storage for uploaded media. Amazon S3, Azure Blob Storage and Google Cloud Storage are **built into EverShop core** — no extension to install. See [File Storage](./file-storage).
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
You do not need to create the `public` folder by hand. The `evershop install` setup script creates it (along with `media`), and sitemap generation creates it on demand if it is missing. Create it yourself only if you are adding static files before running the installer.
:::

:::info
The directory must be named exactly as `public` (not `publics`, `static`, etc.) to be properly recognized by EverShop.
:::

:::danger A static `robots.txt` or `sitemap.xml` shadows the generated one
EverShop generates `/robots.txt` and `/sitemap.xml` (plus the `/sitemap-*.xml` children) at request time. That handler is a **cold path**: it only runs on a request that would otherwise 404. Static serving comes first, so a physical file always wins.

If you drop a hand-written `public/robots.txt` into your project, it is served verbatim and the generated one never runs — including the absolute `Sitemap: https://your-store.com/sitemap.xml` line that EverShop builds from your base URL. Search engines then have no pointer to your sitemap. The same applies to a physical `public/sitemap.xml`, which permanently freezes your sitemap at whatever you committed.

This applies to a **theme's** `public/` folder too. If a theme you installed ships a `robots.txt`, it is served and the generated one is suppressed, even though your own project's `public/` folder is empty.

Note that the generator itself writes its output into `public/`, so a generated `public/sitemap.xml` appearing there is expected — the danger is a file *you* put there.

If you need custom `robots.txt` content, do not create the file. Use the **`robotsTxt` store setting** instead: it replaces the generated body through the same handler, so it keeps working as a single source of truth. See [Sitemap](./sitemap.md).
:::

:::warning
Static files must have a **file extension** (e.g., `.png`, `.css`, `.js`). Requests for paths without a file extension (like `/about`) are not served as static files — they are passed to the router for page matching instead.
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
If the same file exists in both the root `public` directory and a theme's `public` directory, the file from the **root** `public` directory wins. `publicStatic` is mounted before `themePublicStatic` (`bin/lib/addDefaultMiddlewareFuncs.ts:56-58`) and terminates the request as soon as it matches, so the theme copy is served only when the root folder has nothing at that path.
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
