import React from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import type {Props} from '@theme/DocCategoryGeneratedIndexPage';

import styles from './styles.module.css';
import { PropSidebarItem } from '@docusaurus/plugin-content-docs/src/sidebars/types.js';

function DocCategoryGeneratedIndexPageMetadata({
  categoryGeneratedIndex,
}: Props): JSX.Element {
  return (
    <PageMetadata
      title={categoryGeneratedIndex.title}
      description={categoryGeneratedIndex.description}
      keywords={categoryGeneratedIndex.keywords}
      // TODO `require` this?
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

function FunctionList({items}: {items: PropSidebarItem[]}) {
  // Each item contains tags, tags is an rray of string. We get the list of tag with items

  const groupSet = {};
  items.forEach((item) => {
    console.log('item', item);
    if (item.type === 'link' && item.customProps?.frontMatter?.groups) {
      const itemGroups = item.customProps.frontMatter.groups as string[];
      itemGroups.forEach((tag) => {
        if(!groupSet.hasOwnProperty(tag)) {
          groupSet[tag] = {items: []};
        }
        groupSet[tag].items.push(item);
      });
    }
  });
  const defaultSinceVersion = '2.1.0';
  return (
    <div className='space-y-8'>
      {Object.keys(groupSet).map((group) => (
        <div key={group}>
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-300">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-hash w-4 h-4 text-muted-foreground"
      aria-hidden="true"
    >
      <line x1={4} x2={20} y1={9} y2={9} />
      <line x1={4} x2={20} y1={15} y2={15} />
      <line x1={10} x2={8} y1={3} y2={21} />
      <line x1={16} x2={14} y1={3} y2={21} />
    </svg>
    <span className="text-black/80 capitalize">{group}</span>
    <span
      data-slot="badge"
      className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 ml-auto"
    >
      {groupSet[group].items.length} functions
    </span>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {groupSet[group].items.map((item, index) => (
      <div className="group flex items-start gap-4 p-4 rounded-lg border border-gray-300 bg-card hover:bg-accent hover:border-black/30 transition-all">
      <div className="p-2 rounded-md bg-black/10 text-black/80 mt-0.5 flex justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-code w-4 h-4"
          aria-hidden="true"
        >
          <path d="m16 18 6-6-6-6" />
          <path d="m8 6-6 6 6 6" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <a href={item.href} className='text-black/80 hover:text-black/80'><code className=" px-2">
            {item.label}
          </code></a>
        </div>
        <p className="text-muted-foreground text-sm mb-2">
          {item.customProps?.frontMatter?.description || ''}
        </p>
        <div className="text-xs text-muted-foreground">
          <span className="font-mono bg-green-100 px-2 py-0.5 rounded text-xs">Since {item.customProps?.frontMatter?.since || defaultSinceVersion}</span>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-arrow-right w-4 h-4 text-muted-foreground group-hover:text-black/80 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>))}
  </div>
</div>
      ))}
    </div>
  );
}

function DocCategoryGeneratedIndexPageContent({
  categoryGeneratedIndex,
}: Props): JSX.Element {
  const category = useCurrentSidebarCategory();
  console.log('category', category);
  return (
    <div className={styles.generatedIndexPage}>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
      <header className='prose mt-8'>
        <Heading as="h1" >
          {categoryGeneratedIndex.title}
        </Heading>
        {categoryGeneratedIndex.description && (
          <p>{categoryGeneratedIndex.description}</p>
        )}
      </header>
      <article className="margin-top--lg">
        {category && category.customProps?.isFunctionReference ? (
          <FunctionList items={category.items} />
        ) : (
          <DocCardList items={category.items} />
        )}
      </article>
      <footer className="margin-top--lg">
        <DocPaginator
          previous={categoryGeneratedIndex.navigation.previous}
          next={categoryGeneratedIndex.navigation.next}
        />
      </footer>
    </div>
  );
}

export default function DocCategoryGeneratedIndexPage(
  props: Props,
): JSX.Element {
  return (
    <>
      <DocCategoryGeneratedIndexPageMetadata {...props} />
      <DocCategoryGeneratedIndexPageContent {...props} />
    </>
  );
}
