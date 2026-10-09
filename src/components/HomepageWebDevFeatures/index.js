import React from "react";
import Link from "@docusaurus/Link";
import BlockHead from "../BlockHead";

const FeatureList = [
  {
    icon: "/img/graphql-icon.webp",
    title: "Built with GraphQL",
    description: (
      <>
        Seamlessly integrate GraphQL to fetch data at the component level.
        Simplify your API queries for faster, more efficient development.
      </>
    ),
    readMore: "/docs/development/knowledge-base/data-fetching",
  },
  {
    icon: "/img/configuration-icon.webp",
    title: "Zero Configuration",
    description: (
      <>
        Enjoy automatic compilation and bundling from the start. Focus on
        coding, while we handle the configuration for optimal performance.
      </>
    ),
    readMore: "/docs/development/getting-started/installation-guide",
  },
  {
    icon: "/img/fast-refresh-icon.webp",
    title: "Fast Refresh",
    description: (
      <>
        Experience real-time updates with EverShop’s fast refresh. See code
        changes live within seconds for an uninterrupted workflow.
      </>
    ),
    readMore: "/docs/development/knowledge-base/fast-refresh",
  },
  {
    icon: "/img/middleware-icon.webp",
    title: "File-Based Middleware",
    description: (
      <>
        Easily add or modify middleware with a file-based approach. Extend and
        customize middleware effortlessly.
      </>
    ),
    readMore: "/docs/development/knowledge-base/middleware-system",
  },
  {
    icon: "/img/api-icon.webp",
    title: "Flexible API Endpoints",
    description: (
      <>
        Create powerful API routes with ease. Extend backend functionality while
        maintaining full customization.
      </>
    ),
    readMore: "/docs/development/knowledge-base/api-routes",
  },
  {
    icon: "/img/css-support-icon.webp",
    title: "Integrated CSS Support",
    description: (
      <>
        Import CSS from JavaScript with built-in Sass and TailwindCSS support.
        Enjoy live reloading for seamless styling updates.
      </>
    ),
    readMore: "/docs/development/theme/styling",
  },
];

function Feature({ icon, title, description, readMore }) {
  return (
    <div className="feature__card p-5 lg:p-6 box-border">
      <div className="dev-features-icon flex justify-center items-center">
        <img src={icon} alt={title} width={84} height={84} />
      </div>
      <h3 className="mb-2 mt-5 md:mt-3 text-[20px] font-semibold">{title}</h3>
      <div className="mb-4 text-Neutrals-04">{description}</div>
      <Link
        to={readMore}
        className={"readmore flex items-center font-semibold gap-2"}>
        <span>Read more</span>
        <span className="flex justify-center items-center content-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none">
            <path
              d="M1.33301 6H14.6663M14.6663 6L9.66634 1M14.6663 6L9.66634 11"
              stroke="#008060"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className="bg-Other-01 py-16 mt-16 md:py-20 md:mt-20">
      <div className="container">
        <BlockHead
          label="Toolkits"
          heading={{
            className: "max-w-screen-sm",
            text: "Essential tools for fast, efficient website development",
          }}
          subheading={{
            className: "",
            text: "Streamline your development process with EverShop's integrated toolkits",
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
