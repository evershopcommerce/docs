#!/usr/bin/env node
/**
 * Checks the hand-written links of the API sidebar.
 *
 * The "html" items in sidebars.js (apiSidebar) link straight to endpoint
 * anchors such as /docs/api/product#create-a-product. Docusaurus' broken-link
 * checker does not look inside raw HTML, so a renamed heading breaks them
 * silently. This script reads those links and verifies, in the built site,
 * that the page exists and that it contains a heading with that id.
 *
 * Usage:
 *   npm run buildlocal        # or any build that writes ./build
 *   npm run check:sidebar     # optionally: node scripts/check-api-sidebar-links.js <buildDir>
 *
 * Exits with code 1 when a link is broken.
 */
const fs = require("fs");
const path = require("path");

const sidebars = require("../sidebars.js");
const buildDir = path.resolve(process.argv[2] || "build");

if (!fs.existsSync(buildDir)) {
  console.error(`Build directory not found: ${buildDir}\nRun a build first (npm run buildlocal).`);
  process.exit(2);
}

function* htmlItems(items) {
  for (const item of items || []) {
    if (typeof item === "string") continue;
    if (item.type === "html") yield item;
    if (item.items) yield* htmlItems(item.items);
  }
}

const pages = new Map();
const problems = [];
let checked = 0;

for (const item of htmlItems(sidebars.apiSidebar)) {
  for (const match of item.value.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    const [url, anchor] = href.split("#");
    if (!url.startsWith("/")) continue; // external link
    checked++;
    const file = path.join(buildDir, url.replace(/\/$/, "") + ".html");
    if (!fs.existsSync(file)) {
      problems.push(`${href}\n    page not found: ${path.relative(process.cwd(), file)}`);
      continue;
    }
    if (!anchor) continue;
    if (!pages.has(file)) pages.set(file, fs.readFileSync(file, "utf8"));
    if (!pages.get(file).includes(`id="${anchor}"`)) {
      problems.push(`${href}\n    no heading with id "${anchor}" on that page`);
    }
  }
}

if (problems.length) {
  console.error(`API sidebar: ${problems.length} broken link(s) out of ${checked}:\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`API sidebar: all ${checked} hand-written links resolve.`);
