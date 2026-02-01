# Copilot Instructions for Evershop Docs

## Project Overview

This repository hosts the documentation and marketing site for Evershop (evershop.io), built with **Docusaurus 3**. It features a custom React-based landing page, Tailwind CSS styling, and Netlify Functions for backend logic.

## Architecture & Data Flow

- **Framework**: Docusaurus (SSG) with React 18.
- **Styling**: Tailwind CSS (v3) + SASS. Docusaurus plugin `docusaurus-plugin-sass` is used, but Tailwind is compiled via a separate CLI process from `src/css/input.css` to `src/css/output.css`.
- **Backend**: Netlify Functions (`netlify/functions/`) handles API requests (e.g., contact forms) using standard Web API (`Request`/`Response`) patterns.
- **Animation**: Extensive use of `@react-spring/web` and `IntersectionObserver` for scroll-based animations on the homepage.

## Critical Workflows

### Styling Changes

- **Tailwind**: Do not edit `src/css/output.css` directly. It is a build artifact.
- **Global Styles**: Edit `src/css/input.css` for global directives or `@apply` rules.
- **Components**: Prefer inline Tailwind utility classes (e.g., `className="text-primary font-medium"`) over custom CSS.
- **Development**: Run `yarn tailwind` alongside `yarn start` if making CSS changes.

### Documentation Management

- **Content**: Located in `docs/`. Structure generally follows the file system.
- **Sidebar Logic**: `docusaurus.config.js` contains a custom `sidebarItemsGenerator`. It injects `frontMatter` (title, description) into `customProps` for sidebar items. Maintain this pattern if modifying sidebar logic.
- **Redirects**: Managed via `_redirects` file (Netlify format), moved to `build/` during build.

### Netlify Functions

- Located in `netlify/functions`.
- Use the standard Web API `Request` and `Response` objects (not the older AWS Lambda style `event`/`callback`).
- CORS handling is manually implemented in functions (see `contact.ts`).

## Project-Specific patterns

### Custom Components

- **Path Aliases**:
  - `@site/src/...`: Imports from source.
  - `@theme/...`: Usage of Docusaurus theme components.
- **Animations**: Use `useSpring` from `@react-spring/web` combined with `IntersectionObserver` refs for scroll-triggered reveal effects (example: `src/components/HeroBannerOne.js`).

### Build & Deploy

- **Scripts**:
  - `yarn start`: Local dev server.
  - `yarn build`: Production build (moves `_redirects` and `robots.txt` post-build).
- **Environment**: `WHERE_IS_THIS` variable controls SEO indexing (`noIndex` in `docusaurus.config.js`).

## Common Tasks

### Adding a new Doc Page

1. Create `.md` file in `docs/`.
2. Add Frontmatter (`id`, `title`, `sidebar_label`).
3. Images should go in `static/img/` or co-located if using relative paths.

### Modifying the Homepage

- The homepage is a custom React page at `src/pages/index.js`.
- It composes sections from `src/components/`.
- Data for some components is separated in `src/data/`.
