/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import {translate} from '@docusaurus/Translate';
import {sortBy} from '@site/src/utils/jsUtils';

/*
 * ADD YOUR SITE TO THE DOCUSAURUS SHOWCASE
 *
 * Please don't submit a PR yourself: use the Github Discussion instead:
 * https://github.com/facebook/docusaurus/discussions/7826
 *
 * Instructions for maintainers:
 * - Add the site in the json array below
 * - `title` is the project's name (no need for the "Docs" suffix)
 * - A short (≤120 characters) description of the project
 * - Use relevant tags to categorize the site (read the tag descriptions on the
 *   https://docusaurus.io/showcase page and some further clarifications below)
 * - Add a local image preview (decent screenshot of the Docusaurus site)
 * - The image MUST be added to the GitHub repository, and use `require("img")`
 * - The image has to have minimum width 640 and an aspect of no wider than 2:1
 * - If a website is open-source, add a source link. The link should open
 *   to a directory containing the `docusaurus.config.js` file
 * - Resize images: node admin/scripts/resizeImage.js
 * - Run optimizt manually (see resize image script comment)
 * - Open a PR and check for reported CI errors
 *
 * Example PR: https://github.com/facebook/docusaurus/pull/7620
 */

// LIST OF AVAILABLE TAGS
// Available tags to assign to a showcase site
// Please choose all tags that you think might apply.
// We'll remove inappropriate tags, but it's less likely that we add tags.
export type TagType =
  | 'notification'
  // For open-source sites, a link to the source code is required.
  // The source should be the *website's* source, not the project's source!
  | 'checkout'
  | 'payment'
  // Feel free to add the 'design' tag as long as there's _some_ level of
  // CSS/swizzling.
  | 'shipment'
  // Site must have more than one locale.
  | 'authentication'
  | 'mechandise'
  // Large sites are defined as those with > 200 pages, excluding versions.
  | 'large'
  | 'meta'
  | 'personal'
  | 'cms'
  | 'theme'
  // Right-to-left direction.
  | 'rtl';

// Add sites to this list
// prettier-ignore
const Users: Extension[] = [
  {
    title: 'SendGrid Email',
    description: 'A SendGrid extension for sending transactional emails.',
    preview: require('./extension/sendgrid.png'),
    npm: 'https://npmjs.com/package/@evershop/sendgrid',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['notification'],
    author: "EverShop"
  },
  {
    title: 'Resend Email',
    description: 'A Resend extension for sending transactional emails.',
    preview: require('./extension/resend.png'),
    npm: 'https://npmjs.com/package/@evershop/resend',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['notification'],
    author: "EverShop"
  },
  {
    title: 'Google Login',
    description: 'A Google Login extension for authenticating customers.',
    preview: require('./extension/google-login.png'),
    npm: 'https://www.npmjs.com/package/@evershop/google_login',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['authentication'],
    author: "EverShop"
  },
  {
    title: 'Product Reviews',
    description:
      'A Product Reviews extension for collecting and displaying customer reviews.',
    preview: require('./extension/product-review.png'),
    npm: 'https://www.npmjs.com/package/@evershop/product_review',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['mechandise'],
    author: "EverShop"
  },
  {
    title: 'Azure Blob Storage',
    description:
      'An Azure Blob Storage extension for storing media files in Azure Blob Storage.',
    preview: require('./extension/azure-storage.png'),
    npm: 'https://www.npmjs.com/package/@evershop/azure_file_storage',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['cms'],
    author: "EverShop"
  },
  {
    title: 'Amazon S3 Storage',
    description:
      'An Amazon S3 Storage extension for storing media files in Amazon S3 Storage.',
    preview: require('./extension/s3-storage-evershop.png'),
    npm: 'https://www.npmjs.com/package/@evershop/s3_file_storage',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['cms'],
    author: "EverShop"
  },
  {
    title: 'Tidio Chat',
    description:
      'A Tidio Chat extension for providing customer support via chat.',
    preview: require('./extension/tidio.png'),
    npm: 'https://www.npmjs.com/package/evershop_tidio_widget',
    source: 'https://github.com/huangj1e/evershop_extended',
    tags: ['notification'],
    author: "huangj1e"
  },
  {
    title: 'Tawk Chat',
    description:
      'A Tawk Chat extension for providing customer support via chat.',
    preview: require('./extension/tawk.png'),
    npm: 'https://www.npmjs.com/package/evershop_tawk_widget',
    source: 'https://github.com/huangj1e/evershop_extended',
    tags: ['notification'],
    author: "huangj1e"
  },
  {
    title: 'SweetDream Bakery',
    description:
      'A SweetDream Bakery theme for EverShop e-commerce platform.',
    preview: require('./extension/sweetdreambakery.png'),
    demo: 'https://arcturus1235.evershop.app/',
    source: 'https://github.com/evershopcommerce/evershop',
    tags: ['theme'],
    author: "EverShop"
  }
];

export type Extension = {
  title: string;
  description: string;
  preview: string | null; // null = use our serverless screenshot service
  npm: string;
  source: string | null;
  tags: TagType[];
  price?: number | null;
  demo?: string;
  author: string;
};

export type Tag = {
  label: string;
  description: string;
  color: string;
};

export const Tags: {[type in TagType]: Tag} = {
  notification: {
    label: translate({message: 'Notification'}),
    description: '',
    color: '#e9669e',
  },

  checkout: {
    label: translate({message: 'Checkout'}),
    description: '',
    color: '#39ca30',
  },

  payment: {
    label: translate({message: 'Payment'}),
    description: '',
    color: '#dfd545',
  },

  shipment: {
    label: translate({message: 'Shipment'}),
    description: '',
    color: '#a44fb7',
  },

  authentication: {
    label: translate({message: 'Authentication'}),
    description: '',
    color: '#127f82',
  },
  mechandise: {
    label: translate({message: 'Merchandise'}),
    description: '',
    color: '#fe6829',
  },
  cms: {
    label: translate({message: 'CMS'}),
    description: '',
    color: '#fe6829',
  },
  theme: {
    label: translate({message: 'Theme'}),
    description: '',
    color: '#964B00',
  },
};

export const TagList = Object.keys(Tags) as TagType[];
function sortExtensions() {
  let result = Users;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  result = sortBy(result, (user) => !user.tags.includes('favorite'));
  return result;
}

export const sortedExtensions = sortExtensions();
