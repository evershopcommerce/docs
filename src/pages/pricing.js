import React from "react";
import Layout from "@theme/Layout";
import Label from "../components/Label";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

// EverShop Cloud is ONE plan. In the marketplace it is the `basic` tier, sold
// under the name "EverShop Cloud" (`marketplace.plans.offered`), and these are
// its list prices in US dollars — the same figures the marketplace charges
// (extensions/mp-lifecycle, Version-1.0.6: basic-monthly 19, basic-yearly 190).
// The yearly price is ten monthly payments, so "2 months free" is exact.
const CLOUD_PLAN = {
  // The tier key the marketplace checkout expects in `?plan=`. It is never
  // shown to a visitor.
  tier: "basic",
  name: "EverShop Cloud",
  monthly: 19,
  yearly: 190,
};

// Where the "Get EverShop Cloud" button sends people. The marketplace captures
// `?plan=<tier>&billing=<cycle>` on any URL and carries it through login to
// checkout. Production stays "Coming Soon" until the production marketplace
// is live — switch it to `https://marketplace.evershop.io/${query}` then.
const planUrl = (customFields, billing) => {
  const where = customFields?.where_is_this;
  const query = `?plan=${CLOUD_PLAN.tier}&billing=${billing}`;
  if (where === "local") return `http://localhost:3000/${query}`;
  if (where === "acc") return `https://marketplace-uat.evershop.io/${query}`;
  return "#";
};

const ctaLabel = (customFields) =>
  customFields?.where_is_this === "production"
    ? "Coming Soon"
    : `Get ${CLOUD_PLAN.name}`;

// "$19/month" or "$190/year" — the Cloud price for the chosen billing cycle.
const cloudPrice = (billing) =>
  billing === "yearly"
    ? `$${CLOUD_PLAN.yearly}/year`
    : `$${CLOUD_PLAN.monthly}/month`;

// The comparison, row by row. This is what a visitor reads to choose between
// running EverShop themselves and letting us run it; nothing in the platform
// depends on this list. Figures marked "~" are typical market prices, not
// ours, and the note under the table says so.
//
// `included: true` draws a check mark beside the Cloud value.
const comparison = [
  {
    label: "EverShop",
    selfHosted: "Free",
    cloud: (billing) => cloudPrice(billing),
  },
  { label: "Hosting", selfHosted: "~$10–30/month", cloud: "Included", included: true },
  { label: "Custom domain", selfHosted: "~$10–20/year", cloud: "Bring your own" },
  { label: "SSL certificate", selfHosted: "Free", cloud: "Included", included: true },
  { label: "Deployment", selfHosted: "You manage", cloud: "Managed", included: true },
  { label: "Email service", selfHosted: "You manage", cloud: "Included", included: true },
  { label: "Updates", selfHosted: "You manage", cloud: "Managed", included: true },
  // What the Terms of Service promise (section 4.3): email support during
  // business hours. Self-hosted users have the community channels.
  { label: "Support", selfHosted: "Community", cloud: "Email support", included: true },
  {
    label: "Extensions",
    selfHosted: "~$99 one-time / item",
    cloud: "~$5/month / item",
  },
  {
    label: "Themes",
    selfHosted: "~$149 one-time / item",
    cloud: "~$8/month / item",
  },
];

const cloudValue = (row, billing) =>
  typeof row.cloud === "function" ? row.cloud(billing) : row.cloud;

function FakeSelect({ selected, setSelected }) {
  const [show, setShow] = React.useState(false);
  return (
    <div
      className="border border-gray-200 p-2 relative cursor-pointer rounded-sm min-w-56"
      onClick={() => setShow(!show)}>
      <div className="flex justify-between items-center">
        {selected === "monthly" ? (
          <span>Pay monthly</span>
        ) : (
          <span>
            Pay yearly <span className="text-green-500">2 months free</span>
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
      {show && (
        <div className="absolute top-full left-0 right-0 w-full bg-white border border-gray-200 rounded-sm translate-y-6">
          <div className="p-2 hover:bg-gray-100">
            <span className="block" onClick={() => setSelected("monthly")}>
              Pay monthly
            </span>
          </div>
          <div className="p-2 hover:bg-gray-100">
            <span className="block" onClick={() => setSelected("yearly")}>
              Pay yearly <span className="text-green-500">2 months free</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4 flex-shrink-0">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  );
};

const ChevronRight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>
  );
};

const ChevronDown = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
};

const CloudPrice = ({ selected }) => {
  const amount = CLOUD_PLAN[selected];
  return (
    <div className="my-4 space-y-2">
      <div className="text-2xl font-bold">${amount}</div>
      {selected === "monthly" ? (
        <div className="text-sm">
          per month, billed monthly. Pay yearly and get 2 months free.
        </div>
      ) : (
        <div className="text-sm">
          per year, billed yearly. Two months free compared with paying monthly.
        </div>
      )}
    </div>
  );
};

const SelfHostedPrice = () => (
  <div className="my-4 space-y-2">
    <div className="text-2xl font-bold">Free</div>
    <div className="text-sm">
      Open source and free forever. You pay for your own hosting.
    </div>
  </div>
);

// One value of the comparison. On the Cloud side, "Included" and "Managed"
// carry a check mark: they are the things the visitor no longer does.
const Value = ({ children, included = false }) => (
  <span className="flex items-center gap-2">
    {included && (
      <span className="text-primary">
        <CheckIcon />
      </span>
    )}
    <span>{children}</span>
  </span>
);

const SelfHostedHeader = () => (
  <div className="flex flex-col justify-between h-full">
    <div>
      <h2 className="text-2xl font-bold">Self-hosted</h2>
      <p>The full open-source platform, on your own servers.</p>
      <SelfHostedPrice />
    </div>
    <a
      className="button w-full p-3 text-base"
      href="/docs/development/getting-started/introduction">
      Get Started
    </a>
  </div>
);

const CloudHeader = ({ customFields, selected }) => (
  <div className="flex flex-col justify-between h-full">
    <div>
      <h2 className="text-2xl font-bold">{CLOUD_PLAN.name}</h2>
      <p>We host, deploy and update your store for you.</p>
      <CloudPrice selected={selected} />
    </div>
    <a
      className="button button--primary w-full p-3 text-base"
      href={planUrl(customFields, selected)}>
      {ctaLabel(customFields)}
    </a>
  </div>
);

// Wide screens: one table, the two ways to run EverShop side by side.
function ComparisonTable({ customFields, selected }) {
  return (
    <div
      role="table"
      aria-label="Self-hosted compared with EverShop Cloud"
      className="hidden md:block border border-gray-200 rounded-md bg-white overflow-hidden mt-16 max-w-5xl mx-auto">
      <div
        role="row"
        className="grid grid-cols-3 md:divide-x divide-gray-200">
        <div role="columnheader" className="p-8">
          <span className="text-sm text-gray-500">
            Two ways to run EverShop. The software is the same.
          </span>
        </div>
        <div role="columnheader" className="p-8">
          <SelfHostedHeader />
        </div>
        <div role="columnheader" className="p-8 bg-primary-02">
          <CloudHeader customFields={customFields} selected={selected} />
        </div>
      </div>
      {comparison.map((row) => (
        <div
          key={row.label}
          role="row"
          className="grid grid-cols-3 md:divide-x divide-gray-200 border-t border-gray-200">
          <div role="rowheader" className="px-8 py-4 font-semibold">
            {row.label}
          </div>
          <div role="cell" className="px-8 py-4 text-gray-600">
            <Value>{row.selfHosted}</Value>
          </div>
          <div role="cell" className="px-8 py-4 bg-primary-02 font-medium">
            <Value included={row.included}>{cloudValue(row, selected)}</Value>
          </div>
        </div>
      ))}
    </div>
  );
}

// Narrow screens: three columns do not fit, so each way to run EverShop is a
// card of its own, with the same rows in the same order.
function ComparisonCards({ customFields, selected }) {
  return (
    <div className="md:hidden mt-8 space-y-6">
      <div className="border border-gray-200 rounded-md bg-primary-02 p-6">
        <CloudHeader customFields={customFields} selected={selected} />
        <ul className="list-none pl-0 mt-6 mb-0">
          {comparison.map((row) => (
            <li
              key={row.label}
              className="flex justify-between gap-4 py-2 border-t border-gray-200 text-sm">
              <span className="font-semibold">{row.label}</span>
              <span className="font-medium">
                <Value included={row.included}>
                  {cloudValue(row, selected)}
                </Value>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border border-gray-200 rounded-md bg-white p-6">
        <SelfHostedHeader />
        <ul className="list-none pl-0 mt-6 mb-0">
          {comparison.map((row) => (
            <li
              key={row.label}
              className="flex justify-between gap-4 py-2 border-t border-gray-200 text-sm">
              <span className="font-semibold">{row.label}</span>
              <span className="text-gray-600">{row.selfHosted}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Pricing() {
  const [selected, setSelected] = React.useState("monthly");
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  return (
    <header>
      <div className="container text-left pt-1">
        <div>
          <h1 className=" font-bold text-center">Simple pricing</h1>
          <p className="text-center text-gray-500">
            Run EverShop yourself for free, or let us host it for you.
          </p>
          <div className="flex justify-center">
            <FakeSelect selected={selected} setSelected={setSelected} />
          </div>
        </div>
        <ComparisonTable customFields={customFields} selected={selected} />
        <ComparisonCards customFields={customFields} selected={selected} />
        <p className="text-center text-xs text-gray-500 mt-6 max-w-3xl mx-auto">
          Prices in USD, before any applicable taxes. Amounts marked with ~ are
          typical prices: they depend on the provider or on the item you
          choose.
        </p>
        <p className="text-center text-sm text-gray-500 mt-4 max-w-3xl mx-auto">
          {CLOUD_PLAN.name} renews automatically on the day you subscribed, and
          we email you before every renewal. Cancel at any time: your store runs
          to the end of the period you paid for. Yearly billing carries a 30-day
          money-back guarantee on the first payment. The full rules are in our{" "}
          <a href="/tos">Terms of Service</a>.
        </p>
      </div>
    </header>
  );
}

const faqs = [
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Each store can have one custom domain. You add it in the portal, we show you the exact DNS records to create at your registrar, and once the domain points to us we issue and renew its SSL certificate automatically. Your default subdomain then redirects to your domain.",
  },
  {
    question: "How do I pay for EverShop Cloud?",
    answer:
      "By card, through Stripe. EverShop Cloud is charged in advance on the day you subscribe and renews on the same day each month or year. We email you 7 days before a monthly renewal and 14 days before a yearly one, with a one-click option not to renew.",
  },
  {
    question: "How do I cancel?",
    answer:
      "At any time, from the portal, with no notice period. Your store keeps running until the end of the period you have paid for, and you can undo the cancellation until then. We do not refund the unused part of a period. Yearly billing has a 30-day money-back guarantee on the first payment: the store stops immediately and every payment for it is refunded in full.",
  },
  {
    question: "What happens if a payment fails?",
    answer:
      "Your store keeps running for one billing month while we retry the card and remind you. If the payment still fails, the store is suspended and its data is kept. You can reactivate at any time by paying the outstanding month and any open invoices; a new subscription then starts at the current price.",
  },
  {
    question: "How are marketplace themes and extensions priced?",
    answer:
      "Free items cost nothing. A paid item has a monthly price per store, billed at the end of each month for the days it was installed. Some items step up in price as your store passes lifetime order milestones, up to a maximum that is shown before you install. Uninstall an item at any time to stop its charges.",
  },
  {
    question: "Will my price change later?",
    answer:
      "No. Your price stays fixed for as long as your subscription continues, including at renewals. A new list price applies only to new subscriptions.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "No. Paying monthly is the low-commitment way to try EverShop Cloud, and yearly billing carries a 30-day full money-back guarantee on the first payment.",
  },
];

function FAQ() {
  const [questions, setQuestions] = React.useState(
    faqs.map((faq) => ({
      ...faq,
      open: false,
    }))
  );

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-16 bg-primary rounded-xl px-10 py-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex justify-start">
            <Label label="FAQ" />
          </div>
          <h2 className="text-5xl font-normal mt-4 text-white">
            Frequently asked questions
          </h2>
          <p className="text-white w-2/3">
            Common questions about {CLOUD_PLAN.name}. The full rules are in our{" "}
            <a href="/tos" className="text-white underline">
              Terms of Service
            </a>
            .
          </p>
        </div>
        <div className="col-span-1 md:col-span-3">
          <div className="grid grid-cols-1 gap-4">
            {questions.map((faq, index) => (
              <div
                key={index}
                className="border border-[#ebeaea] rounded-xl bg-white p-6">
                <div className="flex justify-between">
                  <h3
                    className="text-lg font-normal mb-0 cursor-pointer"
                    onClick={() => {
                      setQuestions(
                        questions.map((question, i) =>
                          index === i
                            ? { ...question, open: !question.open }
                            : question
                        )
                      );
                    }}>
                    {faq.question}
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setQuestions(
                          questions.map((question, i) =>
                            index === i
                              ? { ...question, open: !question.open }
                              : question
                          )
                        );
                      }}>
                      {faq.open ? <ChevronDown /> : <ChevronRight />}
                    </a>
                  </div>
                </div>

                {faq.open && <p className="mt-4 mb-0">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Layout
      title="Pricing"
      description="EverShop pricing: self-hosted for free, or EverShop Cloud, hosted and managed for you.">
      <main className="bg-green-conner bg-[#FCFCFC] py-16">
        <Pricing />
        <FAQ />
      </main>
    </Layout>
  );
}
