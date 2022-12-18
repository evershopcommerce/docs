import React from 'react';
import Link from '@docusaurus/Link';

const FeatureList = [
  [
    {
      image: '/img/variant.webp',
      title: 'Catalog Management',
      description: (
        <>
          Product management with attribute and variation. Multiple category and collection management.
        </>
      ),
      readMore: 'https://demo.evershop.io/admin/products',
      readMoreText: 'See the demo ->',
    },
    {
      image: '/img/checkout.webp',
      title: 'Checkout',
      description: (
        <>
          One-page Checkout process with online payment and shipping. Saved shopping cart. Integration with multiple payment gateways.
        </>
      ),
      readMore: 'https://demo.evershop.io/',
      readMoreText: 'See the demo ->',
    }
  ],
  [
    {
      image: '/img/discount.webp',
      title: 'Promotion Code',
      description: (
        <>
          Flexible coupons (pricing rules) with ability to restrict to customer groups, time period, products, and categories.
        </>
      ),
      readMore: 'https://demo.evershop.io/admin/coupons',
      readMoreText: 'See the demo ->',
    },
    {
      image: '/img/product-filter.webp',
      title: 'Layered Navigation',
      description: (
        <>
          Layered / faceted navigation for filtering of products in categories and search results. Filter products by price and attributes.
        </>
      ),
      readMore: 'https://demo.evershop.io/category/women',
      readMoreText: 'See the demo ->',
    }
  ],
  [
    {
      image: '/img/customer.webp',
      title: 'Customer Management',
      description: (
        <>
          Customer, cutomer group management. Customer group based discount and more.
        </>
      ),
      readMore: 'https://demo.evershop.io/admin',
      readMoreText: 'See the demo ->',
    },
    {
      image: '/img/cms.webp',
      title: 'Content Management',
      description: (
        <>
          Create and manage static content page from the admin panel. SEO friendly.
        </>
      ),
      readMore: 'https://demo.evershop.io/admin/pages/',
      readMoreText: 'See the demo ->',
    }
  ]
];

function Feature({ image, title, description, readMore, readMoreText = 'Read more ->' }) {
  return (
    <div className='p-20 border-[#E3E6E9]'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <img className='shadow-xl rounded-full' src={image} alt={title} />
        </div>
        <div>
          <h3 className='mb-3'>{title}</h3>
          <div className='mb-2'>{description}</div>
          <Link
            to={readMore}>
            {readMoreText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageEcommerceFeatures() {
  return (
    <section className='pt-10'>
      <h1 className='text-center largest font-bold'>Ecommerce features</h1>
      <div className='text-center mb-10'>
        EverShop eCommerce platforms provides rich e-commerce features that help you build online stores faster.
      </div>
      <div className='grid grid-cols-1 divide-y border-y-[#E3E6E9] border-y'>
        {FeatureList.map((list, idx) => (
          <div className='border-[#E3E6E9]'>
            <div className="container grid grid-cols-1 md:grid-cols-2 divide-x">
              {list.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
