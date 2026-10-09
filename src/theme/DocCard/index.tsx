import React from "react";
import Link from "@docusaurus/Link";
import {
  useDocById,
  findFirstSidebarItemLink,
} from "@docusaurus/plugin-content-docs/client";
import { usePluralForm } from "@docusaurus/theme-common";
import isInternalUrl from "@docusaurus/isInternalUrl";
import { translate } from "@docusaurus/Translate";

import type { Props } from "@theme/DocCard";
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from "@docusaurus/plugin-content-docs";

// Card used by the category index pages (see DocCardList). Styles: .doc-card in
// src/css/custom.scss. The title is the one real link; its ::after stretches
// over the whole card, so the entire card is clickable and screen readers hear
// one link named after the page, not a row of "Read" links. The footer is a
// visual cue only and sits at the bottom of every card, so dividers line up
// across a row.

function useCategoryItemsPlural() {
  const { selectMessage } = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          message: "1 item|{count} items",
          id: "theme.docs.DocCard.categoryDescription.plurals",
          description:
            "The default description for a category card in the generated index about how many items this category includes",
        },
        { count }
      )
    );
}

function CardLayout({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description?: string;
  cta: string;
}): JSX.Element {
  return (
    <div className="doc-card">
      <h2 className="doc-card__title">
        <Link href={href} className="doc-card__link">
          {title}
        </Link>
      </h2>
      {description && <p className="doc-card__description">{description}</p>}
      <div className="doc-card__footer" aria-hidden="true">
        <span>{cta}</span>
        <svg
          className="doc-card__arrow"
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function CardCategory({
  item,
}: {
  item: PropSidebarItemCategory;
}): JSX.Element | null {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();

  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }

  return (
    <CardLayout
      href={href}
      title={item.label}
      description={item.description ?? categoryItemsPlural(item.items.length)}
      cta="Browse"
    />
  );
}

function CardLink({ item }: { item: PropSidebarItemLink }): JSX.Element {
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      href={item.href}
      title={item.label}
      description={item.description || doc?.description}
      cta={isInternalUrl(item.href) ? "Read" : "Open"}
    />
  );
}

export default function DocCard({ item }: Props): JSX.Element {
  switch (item.type) {
    case "link":
      return <CardLink item={item} />;
    case "category":
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
