import React from "react";
import Link from "@docusaurus/Link";

// The cards used to link to demo.evershop.io, which was shut down for good
// (2026-11-26). `readMore` is optional: add it back to link a card somewhere.
const FeatureList = [
  [
    {
      image: "/img/variant.webp",
      title: "Catalog Management",
      description: (
        <>
          Product management with attribute and variation. Multiple category and
          collection management.
        </>
      ),
    },
    {
      image: "/img/checkout.webp",
      title: "Checkout",
      description: (
        <>
          One-page Checkout process with online payment and shipping. Saved
          shopping cart. Integration with multiple payment gateways.
        </>
      ),
    },
  ],
  [
    {
      image: "/img/discount.webp",
      title: "Promotion Code",
      description: (
        <>
          Flexible coupons (pricing rules) with ability to restrict to customer
          groups, time period, products, and categories.
        </>
      ),
    },
    {
      image: "/img/product-filter.webp",
      title: "Layered Navigation",
      description: (
        <>
          Layered / faceted navigation for filtering of products in categories
          and search results. Filter products by price and attributes.
        </>
      ),
    },
  ],
  [
    {
      image: "/img/customer.webp",
      title: "Customer Management",
      description: (
        <>
          Customer, cutomer group management. Customer group based discount and
          more.
        </>
      ),
    },
    {
      image: "/img/cms.webp",
      title: "Content Management",
      description: (
        <>
          Create and manage static content page from the admin panel. SEO
          friendly.
        </>
      ),
    },
  ],
];

function Feature({
  image,
  title,
  description,
  readMore,
  readMoreText = "Read more ->",
  index,
}) {
  const className =
    index === 0
      ? "p-5 lg:p-20 lg:pl-0 border-[#E3E6E9]"
      : "p-5 lg:p-20 lg:pr-0 border-[#E3E6E9]";
  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="text-center">
          <img
            width={220}
            height={220}
            className="shadow-xl rounded-full"
            src={image}
            alt={title}
            style={{ maxWidth: "100% !important", height: "auto" }}
          />
        </div>
        <div>
          <h3 className="mb-3">{title}</h3>
          <div className="mb-2">{description}</div>
          {readMore && (
            <Link to={readMore} rel="nofollow">
              {readMoreText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomepageEcommerceFeatures() {
  return (
    <section className="pt-10">
      <h1 className="text-center largest font-semibold">Ecommerce features</h1>
      <div className="text-center mb-10">
        The EverShop ecommerce platform provides rich ecommerce features that help
        you build online stores faster.
      </div>
      <div className="grid grid-cols-1 divide-y border-y-[#E3E6E9] border-y">
        {FeatureList.map((list, idx) => (
          <div className="border-[#E3E6E9]">
            <div className="container grid grid-cols-1 md:grid-cols-2 md:divide-x">
              {list.map((props, index) => (
                <Feature index={index} key={index} {...props} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
