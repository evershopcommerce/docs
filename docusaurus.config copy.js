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
          trackingID: "G-NL5DS5R8SM",
          // Optional fields.
          anonymizeIP: true, // Should IPs be anonymized?
        },
      }),
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
            type: "html",
            value: `
              <a class="navbar__link" href="/docs/development/getting-started/introduction"><span>Docs</span> <img src="/img/chevron-down.svg" alt="divider" class="divider" width="21" height="24" /></a> 
              <div class="mega__menu__dropdown">
                      <div style="padding-left: 35px; display:flex"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="9" viewBox="0 0 18 9" fill="none">
<path d="M9 0L17.6603 9H0.339746L9 0Z" fill="white"/>
</svg></div>
                      <div class="bg-white flex flex-col width-[780px]">
        <div class="top--section grid grid-cols-1 gap-5 md:grid-cols-3 p-6">
          <div>
            <div class="header flex gap-2 justify-start items-center border-b border-Neutrals-06 pb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  opacity="0.4"
                  d="M20.1667 15.1252V17.8752C20.1667 19.2502 19.25 20.1668 17.875 20.1668H5.5C5.87583 20.1668 6.26083 20.1118 6.61833 19.9927C6.71917 19.956 6.81999 19.9193 6.92082 19.8735C7.24166 19.7452 7.55334 19.5618 7.82834 19.3235C7.91084 19.2593 8.00251 19.1768 8.08501 19.0943L8.12165 19.0577L14.355 12.8335H17.875C19.25 12.8335 20.1667 13.7502 20.1667 15.1252Z"
                  fill="#008060"
                />
                <path
                  opacity="0.6"
                  d="M16.8396 10.3492L14.3554 12.8334L8.12207 19.0575C8.76374 18.3975 9.16708 17.49 9.16708 16.5V7.64504L11.6512 5.16088C12.6229 4.18921 13.9246 4.18921 14.8963 5.16088L16.8396 7.10421C17.8112 8.07588 17.8112 9.37755 16.8396 10.3492Z"
                  fill="#008060"
                />
                <path
                  d="M6.87467 1.8335H4.12467C2.74967 1.8335 1.83301 2.75016 1.83301 4.12516V16.5002C1.83301 16.7477 1.8605 16.9952 1.90633 17.2335C1.93383 17.3527 1.96133 17.4718 1.998 17.591C2.04383 17.7285 2.08967 17.866 2.14467 17.9943C2.15384 18.0035 2.15385 18.0127 2.15385 18.0127C2.16301 18.0127 2.16301 18.0127 2.15385 18.0218C2.28218 18.2785 2.42884 18.526 2.603 18.7552C2.70384 18.8743 2.80469 18.9843 2.90552 19.0943C3.00635 19.2043 3.11634 19.296 3.23551 19.3877L3.24468 19.3968C3.47385 19.571 3.72134 19.7177 3.978 19.846C3.98717 19.8368 3.98718 19.8368 3.98718 19.846C4.12468 19.9102 4.26217 19.956 4.40884 20.0018C4.52801 20.0385 4.64719 20.066 4.76635 20.0935C5.00469 20.1393 5.25217 20.1668 5.49967 20.1668C5.87551 20.1668 6.26051 20.1118 6.61801 19.9927C6.71884 19.956 6.81966 19.9193 6.9205 19.8735C7.24133 19.7452 7.55302 19.5618 7.82802 19.3235C7.91052 19.2593 8.00218 19.1768 8.08468 19.0943L8.12133 19.0577C8.76299 18.3977 9.16634 17.4902 9.16634 16.5002V4.12516C9.16634 2.75016 8.24967 1.8335 6.87467 1.8335ZM5.49967 17.8752C4.73884 17.8752 4.12467 17.261 4.12467 16.5002C4.12467 15.7393 4.73884 15.1252 5.49967 15.1252C6.26051 15.1252 6.87467 15.7393 6.87467 16.5002C6.87467 17.261 6.26051 17.8752 5.49967 17.8752Z"
                  fill="#008060"
                />
              </svg>
              <span class="text-[12px] leading-4 uppercase font-medium text-Neutrals-04">
                GETTING STARTED
              </span>
            </div>
            <div class="flex flex-col gap-5 mt-5">
              <a href="/docs/development/getting-started/introduction" class="font-medium text-sm text-Neutrals-01">
                Introduction
              </a>
              <a href="/docs/development/getting-started/system-requirements" class="font-medium text-sm text-Neutrals-01">
                System Requirements
              </a>
              <a href="/docs/development/getting-started/installation-guide" class="font-medium text-sm text-Neutrals-01">
                Installation Guide
              </a>
            </div>
          </div>
          <div>
            <div class="header flex gap-2 justify-start items-center border-b border-Neutrals-06 pb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  d="M19.4426 12.1368L13.1634 19.0485C11.9718 20.3593 10.0284 20.3593 8.83675 19.0485L2.55758 12.1368C1.85174 11.3577 1.62258 9.946 2.04425 8.9835L2.77758 7.3335H19.2226L19.9559 8.9835C20.3776 9.946 20.1484 11.3577 19.4426 12.1368Z"
                  fill="#008060"
                />
                <path
                  opacity="0.4"
                  d="M19.2223 7.3332H2.77734L4.39067 3.7032C4.82151 2.74987 5.49984 1.9707 7.05818 1.9707H14.9415C16.4998 1.9707 17.1782 2.74987 17.609 3.7032L19.2223 7.3332Z"
                  fill="#008060"
                />
              </svg>
              <span class="text-[12px] leading-4 uppercase font-medium text-Neutrals-04">
                MODULE DEVELOPMENT
              </span>
            </div>
            <div class="flex flex-col gap-5 mt-5">
              <a href="/docs/development/module/module-overview" class="font-medium text-sm text-Neutrals-01">
                Overview
              </a>
              <a href="/docs/development/module/extension-development" class="font-medium text-sm text-Neutrals-01">
                Extention Development
              </a>
              <a href="/docs/development/module/create-your-first-extension" class="font-medium text-sm text-Neutrals-01">
                Create Your First Extention
              </a>
            </div>
          </div>
          <div>
            <div class="header flex gap-2 justify-start items-center border-b border-Neutrals-06 pb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  opacity="0.4"
                  d="M14.8405 1.8335H7.15884C3.82217 1.8335 1.83301 3.82266 1.83301 7.15933V14.8318C1.83301 18.1777 3.82217 20.1668 7.15884 20.1668H14.8313C18.168 20.1668 20.1572 18.1777 20.1572 14.841V7.15933C20.1663 3.82266 18.1772 1.8335 14.8405 1.8335Z"
                  fill="#008060"
                />
                <path
                  d="M19.5247 11.2109H16.3347C15.4363 11.2109 14.6388 11.7059 14.2355 12.5126L13.4655 14.0343C13.2822 14.4009 12.9155 14.6301 12.5122 14.6301H9.50551C9.22134 14.6301 8.81801 14.5659 8.55217 14.0343L7.78217 12.5218C7.37884 11.7243 6.57217 11.2201 5.68301 11.2201H2.47467C2.11717 11.2201 1.83301 11.5043 1.83301 11.8618V14.8501C1.83301 18.1776 3.83134 20.1668 7.16801 20.1668H14.8497C17.9938 20.1668 19.928 18.4434 20.1663 15.3818V11.8526C20.1663 11.5043 19.8822 11.2109 19.5247 11.2109Z"
                  fill="#008060"
                />
                <path
                  d="M12.4208 7.15003H9.57917C9.22167 7.15003 8.9375 6.86587 8.9375 6.50837C8.9375 6.15087 9.22167 5.8667 9.57917 5.8667H12.4208C12.7783 5.8667 13.0625 6.15087 13.0625 6.50837C13.0625 6.86587 12.7692 7.15003 12.4208 7.15003Z"
                  fill="#008060"
                />
                <path
                  d="M13.136 9.70765H8.86432C8.50682 9.70765 8.22266 9.42348 8.22266 9.06598C8.22266 8.70848 8.50682 8.42432 8.86432 8.42432H13.1268C13.4843 8.42432 13.7685 8.70848 13.7685 9.06598C13.7685 9.42348 13.4843 9.70765 13.136 9.70765Z"
                  fill="#008060"
                />
              </svg>
              <span class="text-[12px] leading-4 uppercase font-medium text-Neutrals-04">
                THEME DEVELOPMENT
              </span>
            </div>
            <div class="flex flex-col gap-5 mt-5">
              <a href="/docs/development/theme/theme-overview" class="font-medium text-sm text-Neutrals-01">
                Overview
              </a>
              <a href="/docs/development/theme/view-system" class="font-medium text-sm text-Neutrals-01">
                The View System
              </a>
              <a href="/docs/development/theme/styling" class="font-medium text-sm text-Neutrals-01">
                Styling
              </a>
            </div>
          </div>
        </div>
        <div class="bg-Other-01 p-6 rounded-b-2xl">
          <div class="grid grid-cols-3 md:gap-10">
            <div class="flex gap-2 justify-start items-center ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  opacity="0.4"
                  d="M10.9997 4.85822V19.5524C10.8438 19.5524 10.6788 19.5249 10.5505 19.4516L10.5138 19.4332C8.75384 18.4707 5.68301 17.4624 3.69384 17.1966L3.42801 17.1599C2.54801 17.0499 1.83301 16.2249 1.83301 15.3449V4.27155C1.83301 3.18072 2.72217 2.35572 3.81301 2.44739C5.73801 2.60322 8.65301 3.57489 10.2847 4.59239L10.5138 4.72989C10.6513 4.81239 10.8255 4.85822 10.9997 4.85822Z"
                  fill="#008060"
                />
                <path
                  d="M20.1667 4.2809V15.3451C20.1667 16.2251 19.4517 17.0501 18.5717 17.1601L18.2692 17.1967C16.2708 17.4626 13.1908 18.4801 11.4308 19.4517C11.3117 19.5251 11.165 19.5526 11 19.5526V4.8584C11.1742 4.8584 11.3483 4.81257 11.4858 4.73007L11.6417 4.62923C13.2733 3.60257 16.1975 2.62173 18.1225 2.45673H18.1775C19.2683 2.36507 20.1667 3.1809 20.1667 4.2809Z"
                  fill="#008060"
                />
                <path
                  d="M7.10449 8.47021H5.04199C4.66616 8.47021 4.35449 8.15855 4.35449 7.78271C4.35449 7.40688 4.66616 7.09521 5.04199 7.09521H7.10449C7.48033 7.09521 7.79199 7.40688 7.79199 7.78271C7.79199 8.15855 7.48033 8.47021 7.10449 8.47021Z"
                  fill="#008060"
                />
                <path
                  d="M7.79199 11.2202H5.04199C4.66616 11.2202 4.35449 10.9085 4.35449 10.5327C4.35449 10.1569 4.66616 9.84521 5.04199 9.84521H7.79199C8.16783 9.84521 8.47949 10.1569 8.47949 10.5327C8.47949 10.9085 8.16783 11.2202 7.79199 11.2202Z"
                  fill="#008060"
                />
              </svg>
              <a href="/docs/development/knowledge-base" class="text-xs md:text-[12px] leading-4 uppercase font-medium text-Neutrals-04">
                KNOWLEDGE
              </a>
            </div>
            <div class="flex gap-2 justify-start items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  opacity="0.4"
                  d="M18.7913 6.41683V13.7502H5.82051C4.38134 13.7502 3.20801 14.9235 3.20801 16.3627V6.41683C3.20801 2.75016 4.12467 1.8335 7.79134 1.8335H14.208C17.8747 1.8335 18.7913 2.75016 18.7913 6.41683Z"
                  fill="#008060"
                />
                <path
                  d="M18.7913 13.75V16.9583C18.7913 18.7275 17.3522 20.1667 15.583 20.1667H6.41634C4.64717 20.1667 3.20801 18.7275 3.20801 16.9583V16.3625C3.20801 14.9233 4.38134 13.75 5.82051 13.75H18.7913Z"
                  fill="#008060"
                />
                <path
                  d="M14.6663 7.104H7.33301C6.95717 7.104 6.64551 6.79234 6.64551 6.4165C6.64551 6.04067 6.95717 5.729 7.33301 5.729H14.6663C15.0422 5.729 15.3538 6.04067 15.3538 6.4165C15.3538 6.79234 15.0422 7.104 14.6663 7.104Z"
                  fill="#008060"
                />
                <path
                  d="M11.9163 10.3125H7.33301C6.95717 10.3125 6.64551 10.0008 6.64551 9.625C6.64551 9.24917 6.95717 8.9375 7.33301 8.9375H11.9163C12.2922 8.9375 12.6038 9.24917 12.6038 9.625C12.6038 10.0008 12.2922 10.3125 11.9163 10.3125Z"
                  fill="#008060"
                />
              </svg>
              <a href="/docs/development/advanced" class="text-xs md:text-[12px] leading-4 uppercase font-medium text-Neutrals-04">
                ADVANCED GUIDES
              </a>
            </div>
            <div class="flex gap-2 justify-start items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none">
                <path
                  opacity="0.4"
                  d="M20.1663 7.3335V14.841C20.1663 18.1777 18.1772 20.1668 14.8405 20.1668H7.15884C3.82217 20.1668 1.83301 18.1777 1.83301 14.841V7.34266L20.1663 7.3335Z"
                  fill="#008060"
                />
                <path
                  d="M8.25021 16.271C8.14937 16.271 8.03937 16.2435 7.94771 16.1977C7.24187 15.8402 6.63687 15.3085 6.19687 14.6485C5.83021 14.0985 5.83021 13.3927 6.19687 12.8427C6.63687 12.1827 7.24187 11.651 7.94771 11.3027C8.28687 11.1285 8.69937 11.2752 8.87354 11.6144C9.04771 11.9535 8.91021 12.366 8.56187 12.5402C8.06687 12.7877 7.64521 13.1635 7.34271 13.6219C7.28771 13.7044 7.28771 13.8144 7.34271 13.906C7.64521 14.3644 8.06687 14.7402 8.56187 14.9877C8.90104 15.1619 9.03854 15.5744 8.87354 15.9136C8.74521 16.1336 8.49771 16.271 8.25021 16.271Z"
                  fill="#008060"
                />
                <path
                  d="M13.9425 16.2707C13.6858 16.2707 13.4475 16.1332 13.3283 15.8949C13.1541 15.5557 13.2916 15.1432 13.64 14.9691C14.135 14.7216 14.5566 14.3457 14.8591 13.8874C14.9141 13.8049 14.9141 13.6949 14.8591 13.6032C14.5566 13.1449 14.135 12.7691 13.64 12.5216C13.3008 12.3474 13.1633 11.9349 13.3283 11.5957C13.5025 11.2566 13.915 11.1191 14.2541 11.2841C14.96 11.6416 15.565 12.1732 16.005 12.8332C16.3716 13.3832 16.3716 14.0891 16.005 14.6391C15.565 15.2991 14.96 15.8307 14.2541 16.1791C14.1441 16.2432 14.0433 16.2707 13.9425 16.2707Z"
                  fill="#008060"
                />
                <path
                  d="M20.1663 7.15933V7.3335L1.83301 7.34266V7.15933C1.83301 3.82266 3.82217 1.8335 7.15884 1.8335H14.8405C18.1772 1.8335 20.1663 3.82266 20.1663 7.15933Z"
                  fill="#008060"
                />
              </svg>
              <a href="/docs/development/deployment" class="text-xs md:text-[12px] leading-4 uppercase font-medium text-Neutrals-04">
                DEPLOYMENT GUIDES
              </a>
            </div>
          </div>
        </div>
      </div>
              </div>
            `,
          },
          {
            type: "doc",
            docId: "api/overview",
            position: "left",
            label: "API",
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
    <link
    rel="preload"
    href="https://fonts.googleapis.com/css?family=Inter:400,500,600&display=swap"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
    <link
        href="https://fonts.googleapis.com/css?family=Inter:500,600&display=swap"
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
