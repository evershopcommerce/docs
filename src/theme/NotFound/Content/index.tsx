import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import type { Props } from "@theme/NotFound/Content";

// Opens the same Algolia search modal as the navbar search button.
function openSearch() {
  const searchButton = document.querySelector(".DocSearch-Button");
  if (searchButton instanceof HTMLElement) {
    searchButton.click();
  }
}

const SHORTCUTS = [
  { label: "Documentation", to: "/documentation" },
  { label: "API reference", to: "/docs/api/overview" },
  { label: "Marketplace", to: "/extensions" },
  { label: "Blog", to: "/blog" },
];

export default function NotFoundContent({ className }: Props): JSX.Element {
  return (
    <main className={clsx("container margin-vert--xl", className)}>
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Heading as="h1" className="hero__title">
            Page Not Found
          </Heading>
          <p>
            We could not find that page. It may have been moved, renamed or
            removed.
          </p>
          <p>Try searching the documentation, or start from one of these pages:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              type="button"
              className="button button--primary"
              onClick={openSearch}>
              Search the docs
            </button>
            {SHORTCUTS.map((item) => (
              <Link
                key={item.to}
                className="button button--secondary"
                to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
