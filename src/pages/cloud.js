import React, { useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { CLOUD_PLAN, CLOUD_CTA, planUrl } from "../data/cloud";
import { marketplaceUrl } from "../data/marketplace";
import s from "./_cloud/cloud.module.css";
import {
  ArrowIcon,
  CheckIcon,
  HeroArt,
  ManagedArt,
  InstallArt,
  DomainArt,
  EmailArt,
  StorageArt,
  MarketArt,
} from "./_cloud/Art";

// The /cloud landing page for EverShop Cloud. The plan, its price and the
// button's destination come from src/data/cloud.js (shared with /pricing).
//
// Claims are limited to what we can stand behind: no uptime figures, no speed
// numbers, no backup schedule. The marketplace pricing rules and the billing
// rules repeat what /pricing and the Terms of Service say.

const TITLE = "EverShop Cloud: Managed Ecommerce Hosting";
const DESCRIPTION = `EverShop Cloud is managed hosting for your EverShop store: your own domain, email, backups and one-click themes and extensions. One plan, $${CLOUD_PLAN.monthly} a month.`;

// What a store owner does not have to do. Each line is crossed out as it
// scrolls into view, and names the feature that takes it over.
const CHORES = [
  { chore: "Rent and set up a server", by: "Fully managed infrastructure" },
  { chore: "Install EverShop and keep it up to date", by: "One-click installation" },
  { chore: "Renew your SSL certificate", by: "Your own domain, with SSL" },
  { chore: "Set up a service to send store emails", by: "Email service included" },
  { chore: "Remember to back up your database", by: "Automatic backups" },
  { chore: "Find a place to keep product images", by: "Cloud storage" },
];

// What the plan includes. The same list sits in the price card.
const INCLUDED = [
  "Fully managed infrastructure",
  "One-click installation",
  "Your own domain, with SSL",
  "Email service for your store",
  "Cloud storage for your assets",
  "Automatic database backups",
  "Secure, high-performance hosting",
  "One-click themes and extensions",
  "Performance-aligned marketplace pricing",
  "Email support",
  "No transaction fees on your sales",
];

const FAQS = [
  {
    q: "Do I need technical skills?",
    a: "No. You create your store, choose a theme and add your domain from the portal. We run the servers, the updates and the backups.",
  },
  {
    q: "Is this the same EverShop as the open-source one?",
    a: "Yes. EverShop Cloud runs the same EverShop software. With Cloud, we host and manage it for you. You can also run EverShop on your own servers for free.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Each store can have one custom domain. We show you the DNS records to create at your registrar. When the domain points to us, we issue its SSL certificate and renew it automatically.",
  },
  {
    q: "How does performance-aligned pricing work?",
    a: "When your shop is new and has few orders, we charge less for marketplace items. This is how we support new merchants. Free items cost nothing. A paid item has a monthly price for each store. You pay when you install it, for the rest of your billing period, and then it renews with your plan. Uninstall an item at any time and it will not renew.",
  },
  {
    q: "How do I pay, and can I cancel?",
    a: "You pay by card, through Stripe. You can cancel at any time from the portal, and your store keeps running until the end of the period you paid for. There is no free trial: pay monthly for the lowest commitment, or pay yearly with a 30-day money-back guarantee on the first payment.",
  },
  {
    q: "Do you take a cut of my sales?",
    a: "No. EverShop Cloud has no transaction fees. You pay the plan price and any paid marketplace items you choose. Your payment provider, such as Stripe or PayPal, still charges its own fee for each payment.",
  },
];

// The main button. It opens the marketplace (UAT or production, by build) with
// the plan and billing cycle in the link.
function CtaButton({ billing = "monthly", variant = "primary", block = false }) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  const variants = {
    primary: s.btnPrimary,
    light: s.btnLight,
  };
  const className = [s.btn, variants[variant], block && s.btnBlock]
    .filter(Boolean)
    .join(" ");
  return (
    <a className={className} href={planUrl(customFields, billing)}>
      {CLOUD_CTA}
      <ArrowIcon />
    </a>
  );
}

function Hero() {
  return (
    <header className={s.hero}>
      <div className={`${s.wrap} ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <p className={s.pill}>
            <span className={s.pillDot} />
            Managed hosting for EverShop
          </p>
          <h1 className={s.h1}>
            <span>Sell online.</span> <span>We run the servers.</span>
          </h1>
          <p className={s.lead}>
            EverShop Cloud is managed hosting for your EverShop store. You
            bring the products and the customers. We take care of the servers,
            the security and the backups.
          </p>
          <div className={s.ctaRow}>
            <CtaButton />
            <a className={s.textLink} href="#included">
              See what is included
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true">
                <path
                  d="M8 3v10m0 0 4-4m-4 4L4 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
          <p className={s.fine}>
            One plan, everything included: ${CLOUD_PLAN.monthly} a month. No
            transaction fees.
          </p>
        </div>
        <HeroArt />
      </div>
    </header>
  );
}

function Chores() {
  return (
    <section className={`${s.section} ${s.chores}`} aria-labelledby="chores-title">
      <div className={`${s.wrap} ${s.choresGrid}`}>
        <div className={s.choresHead}>
          <h2 id="chores-title" className={s.h2}>
            Your to-do list just got shorter.
          </h2>
          <p className={s.lead}>
            Running an online store brings a lot of quiet work. On EverShop
            Cloud, we do that work, so your time goes to products, orders and
            customers.
          </p>
        </div>
        <ul className={s.choreList}>
          {CHORES.map(({ chore, by }) => (
            <li key={chore} className={s.chore}>
              <span className={s.choreText}>
                <span className={s.srOnly}>Handled for you: </span>
                <span className={s.choreStrike}>{chore}</span>
              </span>
              <span className={s.choreBy}>
                <span className={s.tick} aria-hidden="true">
                  <CheckIcon />
                </span>
                {by}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section
      id="included"
      className={`${s.section} ${s.features}`}
      aria-labelledby="included-title">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="included-title" className={s.h2}>
            What is included in EverShop Cloud
          </h2>
          <p className={s.lead}>
            Every store gets all of this. There is only one plan.
          </p>
        </div>

        <div className={s.bento}>
          <article className={`${s.cell} ${s.c7}`}>
            <div className={`${s.stage} ${s.stageMint}`}>
              <ManagedArt />
            </div>
            <div className={s.cellText}>
              <h3 className={s.h3}>Fully managed infrastructure</h3>
              <p>
                We run the servers and apply the updates, so your store stays
                online and up to date. You do not need to touch a server.
              </p>
            </div>
          </article>

          <article className={`${s.cell} ${s.c5}`}>
            <div className={`${s.stage} ${s.stageMint}`}>
              <InstallArt />
            </div>
            <div className={s.cellText}>
              <h3 className={s.h3}>One-click installation</h3>
              <p>
                Create your store with one click. There is no server to set up
                and no command to run.
              </p>
            </div>
          </article>

          <article className={`${s.cell} ${s.c5}`}>
            <div className={`${s.stage} ${s.stageMint}`}>
              <EmailArt />
            </div>
            <div className={s.cellText}>
              <h3 className={s.h3}>Email service</h3>
              <p>
                An email service for your store is included, so your customers
                get the emails an online store needs to send, such as order
                confirmations.
              </p>
            </div>
          </article>

          <article className={`${s.cell} ${s.c7}`}>
            <div className={`${s.stage} ${s.stageMint}`}>
              <DomainArt />
            </div>
            <div className={s.cellText}>
              <h3 className={s.h3}>Your own domain, with SSL</h3>
              <p>
                Use your own address instead of a default subdomain. We show
                you the exact DNS records to create at your registrar, and we
                keep the SSL certificate renewed.
              </p>
            </div>
          </article>

          <article className={`${s.cell} ${s.c5}`}>
            <div className={`${s.stage} ${s.stageMint}`}>
              <StorageArt />
            </div>
            <div className={s.cellText}>
              <h3 className={s.h3}>Cloud storage for your assets</h3>
              <p>
                Product images, banners and files live in cloud storage that
                we manage for you.
              </p>
            </div>
          </article>

          <div className={`${s.cell} ${s.c7} ${s.cellList}`}>
            <dl className={s.facts}>
              <div>
                <dt>Automatic database backups</dt>
                <dd>
                  Your store data is backed up automatically. You do not need
                  to schedule anything.
                </dd>
              </div>
              <div>
                <dt>Secure</dt>
                <dd>
                  Your store runs over HTTPS. We issue and renew its SSL
                  certificate, and we apply platform updates for you.
                </dd>
              </div>
              <div>
                <dt>High performance</dt>
                <dd>
                  Your store is hosted by the team that builds EverShop, so
                  the platform and the hosting are made to work together.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marketplace() {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  return (
    <section
      className={`${s.section} ${s.deepBand}`}
      aria-labelledby="market-title">
      <div className={s.wrap}>
        <div className={s.bandGrid}>
          <div>
            <h2 id="market-title" className={s.h2}>
              Add a theme or an extension in one click
            </h2>
            <p className={s.lead}>
              Find what you need in the EverShop marketplace and install it
              from your store. There is no code to upload and nothing to
              deploy.
            </p>
            <p className={s.leadLink}>
              <a href={marketplaceUrl(customFields)}>
                Browse the marketplace
                <ArrowIcon />
              </a>
            </p>
          </div>
          <MarketArt />
        </div>

        <div className={`${s.bandGrid} ${s.bandGridSecond}`}>
          <div>
            <h3 className={s.h2}>
              <span className={s.nowrap}>Performance-aligned</span> pricing
            </h3>
            <p className={s.lead}>
              A new shop has few orders and little income. So we charge less
              for marketplace items while your shop is new and your orders
              are low. This is how we support new merchants.
            </p>
          </div>
          <ul className={s.bandList}>
            <li>You pay for an item when you install it. It then renews with your plan.</li>
            <li>Free items cost nothing.</li>
            <li>Uninstall an item at any time and it will not renew.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function PlanCard() {
  const [billing, setBilling] = useState("monthly");
  const yearly = billing === "yearly";
  return (
    <div className={s.plan}>
      <div className={s.planTop}>
        <h3 className={s.planName}>{CLOUD_PLAN.name}</h3>
        <div className={s.toggle} role="radiogroup" aria-label="Billing period">
          {["monthly", "yearly"].map((b) => (
            <label key={b} className={s.toggleOption}>
              <input
                type="radio"
                name="billing"
                value={b}
                checked={billing === b}
                onChange={() => setBilling(b)}
              />
              <span>
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "yearly" && <small>2 months free</small>}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={s.priceRow} aria-live="polite">
        <span className={s.price}>
          ${yearly ? CLOUD_PLAN.yearly : CLOUD_PLAN.monthly}
        </span>
        <span className={s.per}>/ {yearly ? "year" : "month"}</span>
      </div>
      <p className={s.priceNote}>
        {yearly
          ? "Billed yearly. That is two months free compared with paying monthly."
          : "Billed monthly. Pay yearly and get two months free."}
      </p>

      <ul className={s.checklist}>
        {INCLUDED.map((item) => (
          <li key={item}>
            <span className={s.tick} aria-hidden="true">
              <CheckIcon />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <CtaButton billing={billing} block />
      <p className={s.planFine}>
        Prices in US dollars, before any taxes. Marketplace themes and
        extensions are priced separately. Read the full rules in our{" "}
        <Link to="/tos">Terms of Service</Link>.
      </p>
    </div>
  );
}

function Pricing() {
  return (
    <section
      id="pricing"
      className={`${s.section} ${s.pricing}`}
      aria-labelledby="pricing-title">
      <div className={`${s.wrap} ${s.pricingGrid}`}>
        <div className={s.pricingCopy}>
          <h2 id="pricing-title" className={s.h2}>
            One plan. Everything included.
          </h2>
          <p className={s.lead}>
            There are no tiers to compare and no features to unlock. EverShop
            Cloud costs the same for every store.
          </p>
          <p className={s.leadLink}>
            <Link to="/pricing">
              Compare with running EverShop yourself
              <ArrowIcon />
            </Link>
          </p>
        </div>
        <PlanCard />
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section
      className={`${s.section} ${s.faq}`}
      aria-labelledby="faq-title">
      <div className={`${s.wrap} ${s.faqGrid}`}>
        <div>
          <h2 id="faq-title" className={s.h2}>
            Questions, answered
          </h2>
          <p className={s.lead}>
            Something missing? <Link to="/contact-us">Ask us</Link>.
          </p>
        </div>
        <div className={s.faqList}>
          {FAQS.map(({ q, a }) => (
            <details key={q} name="cloud-faq" className={s.faqItem}>
              <summary>{q}</summary>
              <p className={s.faqBody}>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className={s.finalWrap} aria-labelledby="final-title">
      <div className={s.wrap}>
        <div className={`${s.final} ${s.onDeep}`}>
          <span className={s.finalMark} aria-hidden="true" />
          <div>
            <h2 id="final-title" className={s.h2}>
              Spend your time on the shop, not the servers.
            </h2>
            <p className={s.lead}>
              Get your EverShop store online with one plan and no server work.
            </p>
          </div>
          <div className={s.finalActions}>
            <CtaButton variant="light" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CloudPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <div className={s.page}>
        <Hero />
        <main>
          <Chores />
          <Features />
          <Marketplace />
          <Pricing />
          <Faq />
          <FinalCta />
        </main>
      </div>
    </Layout>
  );
}
