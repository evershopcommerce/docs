// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  noIndex: process.env.WHERE_IS_THIS === "acc" ? true : false,
  title: "EverShop",
  titleDelimiter: " - ",
  customFields: {
    // Put your custom environment here
    where_is_this: process.env.WHERE_IS_THIS || "production", // "local", "acc", "production"
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
  plugins: ["docusaurus-plugin-sass", "@docusaurus/plugin-ideal-image"],
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
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/evershopcommerce/docs/tree/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
        googleAnalytics: {
          trackingID: "G-54D6B5061F",
          // Optional fields.
          anonymizeIP: true, // Should IPs be anonymized?
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
          alt: "A Open-source NodeJS ecommerce platform",
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
            href: "/pricing",
            position: "left",
            label: "Pricing",
          },
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
          alt: "Evershop",
          src: "img/logo.svg",
          href: "https://evershop.io",
          className: "footer__logo",
        },
        links: [
          {
            items: [
              {
                label: "Support Us",
                to: "/support",
              },
              {
                label: "License",
                to: "https://github.com/evershopcommerce/evershop/blob/main/LICENSE",
              },
              {
                label: "Privacy",
                to: "/privacy",
              },
              {
                label: "Terms",
                to: "/tos",
              },
              {
                label: "Code of Conduct",
                to: "/code-of-conduct",
              },
              {
                label: "Discord",
                href: "https://discord.com/invite/GSzt7dt7RM",
              },
            ],
          },
        ],
        copyright: `© Copyright © ${new Date().getFullYear()} Evershop. Deploys by <a href="https://www.netlify.com" target="_blank" rel="nofollow">Netlify</a>`,
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
  ssrTemplate: `<!DOCTYPE html>
<html <%~ it.htmlAttributes %>>
  <head>
    <meta charset="UTF-8">
    <meta name="generator" content="Docusaurus v<%= it.version %>">
    <% it.metaAttributes.forEach((metaAttribute) => { %>
      <%~ metaAttribute %>
    <% }); %>
    <%~ it.headTags %>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
    rel="preload"
    href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
    <link
        href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap"
        rel="stylesheet"
        type="text/css"
    />
</noscript>
    <% it.stylesheets.forEach((stylesheet) => { %>
      <link rel="stylesheet" href="<%= it.baseUrl %><%= stylesheet %>" />
    <% }); %>
    <% it.scripts.forEach((script) => { %>
      <link rel="preload" href="<%= it.baseUrl %><%= script %>" as="script">
    <% }); %>
  </head>
  <body <%~ it.bodyAttributes %>>
    <%~ it.preBodyTags %>
    <div id="__docusaurus">
      <%~ it.appHtml %>
    </div>
    <% it.scripts.forEach((script) => { %>
      <script src="<%= it.baseUrl %><%= script %>"></script>
    <% }); %>
    <%~ it.postBodyTags %>
  </body>
</html>`,
};

export default config;
