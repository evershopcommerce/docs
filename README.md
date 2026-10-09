# EverShop Documentation

Source of the [EverShop documentation site](https://evershop.io/documentation), built with [Docusaurus 3](https://docusaurus.io/) and deployed by Netlify.

## Requirements

- Node.js 18 or newer
- npm (the repo uses `package-lock.json`)

## Local development

```bash
npm install
npm start
```

This starts the dev server with hot reload (http://localhost:3000 by default; use `npm start -- --port 3100` if that port is taken). It first regenerates `src/css/output.css` from Tailwind.

## Building

| Command | What it does |
| --- | --- |
| `npm run buildlocal` | Production build into `build/`. Use this to test locally. |
| `npm run serve` | Serves the `build/` folder. |
| `npm run build` | The deploy build. It also **moves** `_redirects`, `robots.txt` and the verification file out of the repo root into `build/`, so do not run it for local testing. |
| `npm run buildacc` | Acceptance build (uses `robots_acc.txt`). |
| `npm run check:sidebar` | After a build, checks that every hand-written link in the API sidebar points at a page and heading that exist. |
| `npm run tailwind:build` | Regenerates `src/css/output.css`. Runs automatically before `start` and the builds. |

## Project layout

```
docs/
  development/   Getting started, knowledge base, module, theme, deployment guides
  api/           REST API reference
blog/            Release notes and articles
src/
  pages/         Custom pages (/documentation, /extensions, /contact-us, ...)
  theme/         Swizzled Docusaurus components (navbar, footer, doc cards, 404, ...)
  components/    Shared React components
  css/           custom.scss, fonts.css (self-hosted Inter), output.css (generated Tailwind)
static/          Files served as-is (images, robots files)
sidebars.js      docsSidebar (generated from docs/development) and apiSidebar (hand-written)
docusaurus.config.js  Site config, navbar and footer. Footer columns: themeConfig.footer.links; brand block and legal links: customFields.footer
_redirects       Netlify redirects (old URLs)
```

## Writing conventions

- American English (behavior, canceled, normalize, color).
- Title Case for page titles and sidebar labels (`Installation Guide`).
- Spell the product and technologies as: EverShop, ecommerce, Node.js, TypeScript, GraphQL, PostgreSQL, frontend.
- One `h1` per page, and do not skip heading levels.
- Give every page a `description` in the front matter (about 70 to 160 characters). Without one, Docusaurus uses the first heading.
- Use HTML tables (`<table className="table-auto not-prose">`) rather than Markdown tables.
- If you rename a page, add a redirect to `_redirects`.
- If you rename a heading that the API sidebar links to, update `sidebars.js` and run `npm run check:sidebar`.
