import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import BlogListPaginator from "@theme/BlogListPaginator";
import SearchMetadata from "@theme/SearchMetadata";
import Link from "@docusaurus/Link";

function BlogListPageMetadata(props) {
  const { metadata } = props;
  const { blogDescription, blogTitle } = metadata;
  return (
    <>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogPostCard({ content: BlogPostContent }) {
  const { metadata, frontMatter, assets } = BlogPostContent;
  const { permalink, title, date, formattedDate } = metadata;
  const { authors, tags } = metadata;

  const image = assets?.image || frontMatter.image || "/img/social-card.jpg";
  const tag = tags.length > 0 ? tags[0].label : null;
  const dateObj = new Date(date);
  const dateString = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col h-full group border border-Neutrals-06 p-3 rounded-lg">
      <Link to={permalink} className="block mb-4 overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={image}
            alt={title}
          />
        </div>
      </Link>
      <div className="flex flex-col flex-1">
        <div className="flex items-center text-sm mb-2">
          <time dateTime={date}>{formattedDate || dateString}</time>
          {/* {tag && (
            <>
              <span className="mx-2">·</span>
              <span>{tag}</span>
            </>
          )} */}
        </div>
        <Link to={permalink} className="block">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center">
          {authors.length > 0 &&
            authors.map((author, idx) => (
              <div key={idx} className="flex items-center mr-4">
                {author.imageURL && (
                  <img
                    className="h-6 w-6 rounded-full mr-2"
                    src={author.imageURL}
                    alt={author.name}
                  />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {author.name}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function BlogListPageContent(props) {
  const { metadata, items } = props;

  return (
    <Layout
      title={metadata.blogTitle}
      description={metadata.blogDescription}
      wrapperClassName={ThemeClassNames.wrapper.blogPages}>
      <div className="bg-gray-50 dark:bg-[#101012] py-10 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {metadata.blogTitle}
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            News, updates, and tutorials from the Evershop team.
          </p>
        </div>
      </div>

      <div className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
              <BlogPostCard
                key={item.content.metadata.permalink}
                content={item.content}
              />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <BlogListPaginator metadata={metadata} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}>
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
