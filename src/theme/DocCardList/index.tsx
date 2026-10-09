import React from 'react';
import clsx from 'clsx';
import {
  useCurrentSidebarCategory,
  filterDocCardListItems,
} from '@docusaurus/plugin-content-docs/client';
import DocCard from '@theme/DocCard';
import type {Props} from '@theme/DocCardList';

function DocCardListForCurrentSidebarCategory({className}: Props) {
  const category = useCurrentSidebarCategory();
  return <DocCardList items={category.items} className={className} />;
}

export default function DocCardList(props: Props): JSX.Element {
  const {items, className} = props;
  if (!items) {
    return <DocCardListForCurrentSidebarCategory {...props} />;
  }
  const filteredItems = filterDocCardListItems(items);
  const links = filteredItems.filter((item) => item.type === 'link');
  return (
    <section className="doc-card-grid">
      {links.map((item, index) => (
        <DocCard item={item} key={index} />
      ))}
    </section>
  );
}
