// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  noIndex: process.env.WHERE_IS_THIS === "acc" ? true : false,
  title: "EverShop",
  // Docusaurus already adds a space on each side of the delimiter, so keep it
  // as a bare dash. A padded " - " produced "Page  -  EverShop" (double spaces).
  titleDelimiter: "-",
  customFields: {
    // Put your custom environment here
    where_is_this: process.env.WHERE_IS_THIS || "production", // "local", "acc", "production"
    // Footer content that is not part of the standard footer config:
    // the brand block (tagline + social icons) and the legal links in the bottom bar.
    // The link columns live in themeConfig.footer.links. Rendered by src/theme/Footer/Layout.
    footer: {
      tagline:
        "Open-source TypeScript ecommerce platform. Built with React, modular and fully customizable.",
      social: [
        {
          label: "GitHub",
          icon: "github",
          href: "https://github.com/evershopcommerce/evershop",
        },
        {
          label: "Discord",
          icon: "discord",
          href: "https://discord.com/invite/GSzt7dt7RM",
        },
        { label: "X (Twitter)", icon: "x", href: "https://twitter.com/evershopjs" },
        {
          label: "LinkedIn",
          icon: "linkedin",
          href: "https://www.linkedin.com/company/evershop-io",
        },
      ],
      legal: [
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/tos" },
        {
          label: "License",
          href: "https://github.com/evershopcommerce/evershop/blob/main/LICENSE",
        },
        { label: "Code of Conduct", to: "/code-of-conduct" },
      ],
    },
  },
  tagline:
    "TypeScript ecommerce platform with essential commerce features. Built with React, modular and fully customizable",
  url: "https://evershop.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  trailingSlash: false,
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "evershopcommerce", // Usually your GitHub org/user name.
  projectName: "evershop", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: [
    "docusaurus-plugin-sass",
    "@docusaurus/plugin-ideal-image",
    [
      "@docusaurus/plugin-google-gtag",
      {
        trackingID: "G-54D6B5061F",
        anonymizeIP: true,
      },
    ],
  ],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          sidebarItemsGenerator: async function ({
            defaultSidebarItemsGenerator,
            ...ctxArgs
          }) {
            // get default items
            const items = await defaultSidebarItemsGenerator({
              ...ctxArgs,
            });

            // helper to walk & inject customProps
            const inject = (itemsList) =>
              itemsList.map((item) => {
                // recurse categories
                if (item.type === "category" && Array.isArray(item.items)) {
                  return {
                    ...item,
                    items: inject(item.items),
                  };
                }

                // items of type 'doc' or 'link' - attach customProps safely
                // note: item.docId may contain the doc id
                const docId = item?.id ?? item?.docId;
                if (docId) {
                  // find the doc metadata from ctxArgs.docs (docs available in args)
                  const doc =
                    (ctxArgs.docs &&
                      ctxArgs.docs.find((d) => d.id === docId)) ||
                    null;

                  if (doc) {
                    // do not put frontMatter at top-level; use customProps
                    const customProps = {
                      ...(item.customProps || {}),
                      frontMatter: doc.frontMatter || {},
                      // optionally include other metadata:
                      title: doc.title,
                      description: doc.description,
                    };

                    return {
                      ...item,
                      customProps,
                    };
                  }
                }

                // fallback: return item unchanged
                return item;
              });

            return inject(items);
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/evershopcommerce/docs/tree/main/",
        },
        blog: {
          blogTitle: "EverShop Blog",
          blogDescription:
            "What's new in EverShop, and what it means for your store.",
          blogSidebarTitle: "Recent posts",
          blogSidebarCount: 10,
          postsPerPage: 10,
          showReadingTime: true,
          // Posts without a <!-- truncate --> marker render in full on the list
          // page. Warn rather than throw so a missing marker is visible in CI
          // without blocking a build.
          onUntruncatedBlogPosts: "warn",
          feedOptions: {
            type: "all",
            title: "EverShop Blog",
            description:
              "Release notes, upgrade guides and announcements from the EverShop team.",
            copyright: `Copyright © ${new Date().getFullYear()} EverShop.`,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/evershopcommerce/docs/tree/main/",
        },
        theme: {
          customCss: [
            require.resolve("./src/css/fonts.css"),
            require.resolve("./src/css/custom.scss"),
          ],
        },
      }),
    ],
    [
      "@docusaurus/plugin-sitemap",
      {
        ignorePatterns: ["/docs/tags/**"], // Adjust path if your tags are elsewhere
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "",
        logo: {
          alt: "EverShop",
          src: "img/logo.svg",
          width: 35,
          height: 35,
        },
        items: [
          {
            href: "/documentation",
            position: "left",
            label: "Docs",
          },
          {
            href: "/extensions",
            position: "left",
            label: "Marketplace",
          },
          {
            to: "/blog",
            position: "left",
            label: "Blog",
          },
          // {
          //   href: "/pricing",
          //   position: "left",
          //   label: "Pricing",
          // },
          {
            href: "/contact-us",
            position: "left",
            label: "Contact Us",
          },
          {
            type: "html",
            position: "right",
            value: `<a class="button button--primary button--xs flex items-center align-middle" href="/docs/development/getting-started/introduction"><span>Get started</span> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M3 9H15M15 9L10.5 4.5M15 9L10.5 13.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></a>`,
          },
        ],
      },
      footer: {
        style: "light",
        logo: {
          alt: "EverShop",
          src: "img/logo.svg",
          href: "/",
          className: "footer__logo",
        },
        links: [
          {
            title: "Product",
            items: [
              { label: "Documentation", to: "/documentation" },
              { label: "Marketplace", to: "/extensions" },
              { label: "Release Notes", to: "/blog/tags/release" },
            ],
          },
          {
            title: "Developers",
            items: [
              { label: "Getting Started", to: "/docs/development/getting-started/introduction" },
              { label: "Installation Guide", to: "/docs/development/getting-started/installation-guide" },
              { label: "REST API", to: "/docs/api/overview" },
              { label: "GraphQL", to: "/docs/development/knowledge-base/graphql" },
              { label: "Extension Development", to: "/docs/development/module/extension-overview" },
              { label: "Theme Development", to: "/docs/development/theme/theme-overview" },
              { label: "Function Reference", to: "/docs/development/module/functions" },
            ],
          },
          {
            title: "Resources",
            items: [
              { label: "Blog", to: "/blog" },
              { label: "Knowledge Base", to: "/docs/development/knowledge-base" },
              { label: "Architecture Overview", to: "/docs/development/knowledge-base/architecture-overview" },
              { label: "Deployment Guides", to: "/docs/development/deployment" },
              { label: "Production Checklist", to: "/docs/development/deployment/production-checklist" },
            ],
          },
          {
            title: "Community",
            items: [
              { label: "GitHub", href: "https://github.com/evershopcommerce/evershop" },
              { label: "Discord", href: "https://discord.com/invite/GSzt7dt7RM" },
              { label: "Contribute", href: "https://github.com/evershopcommerce/evershop/blob/main/CONTRIBUTING.md" },
              { label: "Report an Issue", href: "https://github.com/evershopcommerce/evershop/issues/new" },
              { label: "Support Us", to: "/support" },
              { label: "Contact Us", to: "/contact-us" },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} EverShop. Deploys by <a href="https://www.netlify.com" target="_blank" rel="noopener nofollow">Netlify</a>`,
      },
      // prism: {
      //   theme: darkTheme,
      // },
      metadata: [
        {
          name: "og:image",
          content: "https://evershop.io/img/social-card.jpg",
        },
      ],
      algolia: {
        // The application ID provided by Algolia
        appId: "YOUP0U3MFZ",

        // Public API key: it is safe to commit it
        apiKey: "d160d70304dd855502e1a83c4a312ad1",

        indexName: "evershopio",

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        // replaceSearchResultPathname: {
        //   from: "/docs/", // or as RegExp: /\/docs\//
        //   to: "/",
        // },

        // Optional: Algolia search parameters
        //searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        //searchPagePath: "search",

        //... other Algolia params
      },
    }),
};

export default config;
