---
slug: open-source-shopify-alternative
title: "EverShop: an Open-Source Shopify Alternative with No Transaction Fees"
description: "Looking for an open-source Shopify alternative? EverShop is a Node.js and React ecommerce platform with no transaction fees and no lock-in. Self-host it for free or let EverShop Cloud run it for you."
authors: [evershop]
tags: [comparison, shopify]
image: /img/blog/open-source-shopify-alternative/cover.png
keywords:
  - shopify alternative open source
  - self-hosted shopify alternative
  - shopify alternative no transaction fees
---

Shopify is the default answer to "how do I start an online store?", and for good reason: it's quick to set up, someone else runs the servers, and there's an app for almost everything. But more and more developers, agencies and store owners go looking for an **open-source Shopify alternative**, usually for one of three reasons:

1. **Fees that grow with revenue.** A monthly plan, an extra fee on every sale if you use your own payment provider, and paid apps add up.
2. **Lock-in.** Your store runs on someone else's platform, under their rules, and you can't take the code with you.
3. **Customization limits.** Past a certain point, you're working around the platform instead of building on it.

This post is an honest look at **EverShop**, an open-source ecommerce platform built on Node.js, TypeScript, React, GraphQL and PostgreSQL: where it's a good Shopify alternative, and where it isn't.

{/* truncate */}

## What is EverShop?

EverShop is a free, open-source ecommerce platform licensed under GPL-3.0. The source code is on [GitHub](https://github.com/evershopcommerce/evershop), where the project has over 10,000 stars.

It's a **full-stack platform**: the storefront, the admin panel and the API ship together, so you don't need to build or host a separate frontend to get a working store. The storefront is rendered on the server with React, which keeps pages fast and easy for search engines to crawl.

**The stack:**

- **TypeScript** throughout
- **Node.js** on the server
- **PostgreSQL** as the database (13 or higher, 15+ recommended)
- **React** for the storefront and the admin panel, with server-side rendering and hydration
- **GraphQL** for the storefront and admin APIs
- **Tailwind CSS** and Sass for styling

**What's built in:**

- **Catalog:** products, variants, categories, attributes, collections and search
- **Checkout:** cart, shipping zones and rates, and payment methods
- **Payments:** Stripe, PayPal and Cash on Delivery
- **Orders:** order management, multi-shipment fulfillment and status tracking
- **Customers:** accounts, addresses and authentication
- **Promotions:** coupons and discount rules
- **Tax:** tax classes, rates and calculation
- **Content:** CMS pages, a widget-based page builder and a blog
- **CSV import:** categories, products, customers and addresses
- **SEO basics:** sitemap and URL redirects

## Two ways to run it

EverShop is the same software either way:

- **Self-hosted, for free.** Run it on your own server or cloud account. You handle deployment, updates and backups.
- **[EverShop Cloud](/cloud), from $29/month.** We host, install, update and back up your store. It includes your own domain with SSL, an email service for store emails, storage for your images, and one-click themes and extensions. Pay monthly, or $290/year (two months free).

Neither takes a cut of your sales.

## EverShop vs Shopify at a glance

| | **Shopify** | **EverShop (self-hosted)** | **EverShop Cloud** |
| --- | --- | --- | --- |
| License | Proprietary SaaS | Open source (GPL-3.0) | Same open-source EverShop, hosted for you |
| Who runs the servers | Shopify | You | EverShop |
| Platform price | Monthly plan ([Shopify pricing](https://www.shopify.com/pricing)) | $0, plus your own hosting | $29/month or $290/year |
| Fee per sale | Extra fee if you don't use Shopify Payments | None | None |
| Payment processing | Shopify Payments rates, or your provider's rates plus Shopify's fee | Your provider's rates only | Your provider's rates only |
| Source code | Closed | All of it | All of it (self-host any time) |
| Your data | Exportable, stored on Shopify | Your own PostgreSQL database | Hosted by EverShop |
| Customization | Liquid themes, apps, Shopify APIs | Anything: themes, extensions, core | Marketplace themes and extensions |
| Ecosystem | Thousands of apps and themes | Smaller and growing | Smaller and growing |

## The case for EverShop

### 1. No transaction fees

This is the reason most people search for a **Shopify alternative with no transaction fees**.

On Shopify, if you use a payment provider other than Shopify Payments, Shopify adds its own fee to every sale on top of what that provider charges. Shopify Payments isn't available in every country, so for many merchants that fee isn't optional.

EverShop doesn't charge anything per sale, self-hosted or on Cloud. You connect Stripe or PayPal, pay their standard processing fees, and that's it. Your platform cost stays the same whether you sell $1,000 or $1,000,000 a month.

### 2. You own the code and the data

With EverShop, your store is a Node.js application and a PostgreSQL database. When you self-host, you can:

- run it on any provider you like (the docs have deployment guides for AWS, Azure, DigitalOcean App Platform and Heroku),
- back up and query your data directly with SQL,
- read, patch or fork any part of the platform,
- move hosts without asking anyone's permission.

EverShop Cloud runs the same open-source software, so running it on your own servers is always an option.

### 3. Customize without fighting the platform

Shopify customization happens inside the lines Shopify draws: Liquid templates, app extensions and API limits. EverShop is built to be changed:

- **Extensions** add features or change behavior without touching core code: new GraphQL types, API routes, middleware, admin pages and storefront components.
- **Themes** control the whole storefront with React components and Tailwind CSS.
- **The admin panel** is a React app you can extend too.

For developers, that means working in a stack you already know (TypeScript, React, GraphQL, SQL) instead of learning a proprietary template language.

### 4. Built for developers and agencies

If you build stores for clients, Shopify's per-store plans and app fees get passed on to every client. Self-hosted EverShop has no per-store license. You can reuse your own extensions and themes across projects, and you're never blocked waiting on someone else's roadmap.

## When Shopify is still the better choice

An open-source platform isn't the right answer for everyone. Shopify is likely the better fit if:

- **You depend on specific Shopify apps.** Shopify's app ecosystem is far larger. If your store relies on niche apps, check that EverShop has an equivalent in the [marketplace](https://marketplace.evershop.io/), or budget to build it.
- **You need point of sale or multichannel selling built in.** Shopify POS and its marketplace and social channel integrations are mature. EverShop focuses on the online store.
- **You want 24/7 phone support.** Self-hosted EverShop is supported by the community on [Discord](https://discord.com/invite/GSzt7dt7RM) and GitHub.

If fees, lock-in or customization limits are what's holding you back, EverShop is worth a serious look. If you don't want to run a server, [EverShop Cloud](/cloud) takes care of that part.

## What it costs to run EverShop

EverShop itself is free. What you pay for depends on how you run it.

**Self-hosted:**

- **Hosting.** The recommended production setup is 4+ CPU cores, 4 GB of RAM or more and a 20 GB+ SSD, plus a PostgreSQL database. Large catalogs (10,000+ products) or high traffic call for around 8 GB of RAM.
- **Payment processing.** Your provider's standard rates. Nothing on top from EverShop.
- **Development time.** Setup, theming and any custom features. This is the real cost to plan for.

**EverShop Cloud:**

- **The plan:** $29/month, or $290/year.
- **Payment processing:** your provider's standard rates.
- **Paid marketplace items, if you choose any.** Many are free. See [pricing](/pricing) for details.

## Try it in five minutes

You need Node.js 20.9 or higher and PostgreSQL 13 or higher. Create a new project with one command:

```bash
npx create-evershop-app my-evershop-app
```

Or try it with Docker (for local evaluation only):

```bash
curl -sSL https://raw.githubusercontent.com/evershopcommerce/evershop/main/docker-compose.yml > docker-compose.yml
docker compose up -d
```

Then open `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the admin panel. With Docker, create your admin account inside the app container:

```bash
npm run user:create -- --email "you@example.com" --password "yourpassword1" --name "Your Name"
```

The full walkthrough, including a manual npm install, is in the [installation guide](/docs/development/getting-started/installation-guide). Just want to look around? Open the [demo store](https://demo.evershop.io).

## Moving from Shopify to EverShop

There's no one-click Shopify importer, but [CSV import](/docs/development/knowledge-base/csv-import) does most of the heavy lifting:

1. **Export your data from Shopify** as CSV: products and customers.
2. **Set up EverShop**, self-hosted or on [Cloud](/cloud), and create your attributes, shipping and tax settings.
3. **Download the import templates** from **Admin → Import** and copy your Shopify data into them. EverShop ignores columns it doesn't know (with a warning), so match your columns to the template.
4. **Upload and check.** EverShop checks the whole file and lists every problem by row and column before it writes anything. Fix, upload again, then start the import.
5. **Choose or build a theme**, from the marketplace or with React and Tailwind.
6. **Redirect old URLs.** Map every Shopify product and collection URL to its new EverShop URL with 301 redirects (built in) so you keep your search rankings.
7. **Connect Stripe or PayPal**, test checkout end to end, and point your domain at the new store.

## FAQ

**Is EverShop really free?**
Yes. EverShop is open source under the GPL-3.0 license, with no license fee, subscription or per-sale charge. You pay for your own hosting and payment processing. If you'd rather not host it, EverShop Cloud is $29/month.

**Does EverShop charge transaction fees?**
No, neither self-hosted nor on EverShop Cloud. You only pay your payment provider's processing fees.

**Is EverShop headless?**
No. EverShop is a full-stack platform: it includes a server-rendered React storefront, an admin panel and a GraphQL API. You get a complete store out of the box, and you can still use the API for custom integrations.

**What payment methods does EverShop support?**
Stripe, PayPal and Cash on Delivery are built in. Other providers can be added as extensions.

**Can I self-host EverShop anywhere?**
Yes, anywhere that runs Node.js 20.9+ and PostgreSQL 13+. The docs have guides for AWS, Azure, DigitalOcean App Platform and Heroku.

**Do I need to be a developer to use EverShop?**
Not with EverShop Cloud: you create your store, choose a theme and add your domain from the portal. Self-hosting requires deploying and maintaining a Node.js app, so it suits developers, agencies, and store owners who work with one.

## The bottom line

Shopify is a great product if you want an all-in-one platform with a huge app ecosystem, and you're fine with its fees in return. If you'd rather own your stack, pay nothing per sale and customize freely in TypeScript and React, **EverShop is a strong open-source Shopify alternative**, on your own servers or on [EverShop Cloud](/cloud).

[Get started with EverShop](/docs/development/getting-started/introduction) · [Try EverShop Cloud](/cloud) · [Star it on GitHub](https://github.com/evershopcommerce/evershop) · [Join the Discord](https://discord.com/invite/GSzt7dt7RM)
