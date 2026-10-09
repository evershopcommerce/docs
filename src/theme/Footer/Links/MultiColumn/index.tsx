import React from "react";
import LinkItem from "@theme/Footer/LinkItem";
import type { Props } from "@theme/Footer/Links/MultiColumn";

type ColumnType = Props["columns"][number];
type ColumnItemType = ColumnType["items"][number];

function ColumnLinkItem({ item }: { item: ColumnItemType }) {
  return item.html ? (
    <li
      className="footer__item"
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: item.html }}
    />
  ) : (
    <li className="footer__item">
      <LinkItem item={item} />
    </li>
  );
}

function Column({ column, index }: { column: ColumnType; index: number }) {
  // The title is a paragraph, not a heading: the footer should not add an
  // h2 to the outline of every page. The list is named after it instead.
  const titleId = `footer-column-${index}`;
  return (
    <div className="footer__col">
      {column.title && (
        <p className="footer__title" id={titleId}>
          {column.title}
        </p>
      )}
      <ul
        className="footer__items clean-list"
        aria-labelledby={column.title ? titleId : undefined}>
        {column.items.map((item, i) => (
          <ColumnLinkItem key={i} item={item} />
        ))}
      </ul>
    </div>
  );
}

export default function FooterLinksMultiColumn({
  columns,
}: Props): JSX.Element {
  return (
    <nav className="footer__links" aria-label="Footer">
      {columns.map((column, i) => (
        <Column key={i} column={column} index={i} />
      ))}
    </nav>
  );
}
