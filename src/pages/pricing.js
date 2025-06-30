import React from "react";
import Layout from "@theme/Layout";
import Label from "../components/Label";

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
            Pay yearly <span className="text-green-500">save 20%</span>
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
              Pay yearly <span className="text-green-500">save 20%</span>
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
      className="w-4 h-4">
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

const prices = {
  monthly: {
    personal: 10,
    professional: 20,
  },
  yearly: {
    personal: 8,
    professional: 16,
  },
};

const Price = ({ plan, selected }) => {
  return (
    <div className="my-4 space-y-2">
      <div className="text-2xl font-bold">${prices[selected][plan]}</div>
      {selected === "monthly" && (
        <div className="text-sm">per month, save 20% by paying annually</div>
      )}
      {selected === "yearly" && (
        <div className="text-sm">
          ${prices[selected][plan] * 12} billed annually, excl taxes.
        </div>
      )}
    </div>
  );
};

function Pricing() {
  const [selected, setSelected] = React.useState("monthly");

  return (
    <header>
      <div className="container text-left pt-1">
        <div>
          <h1 className=" font-bold text-center">Flexible Pricing Plans</h1>
          <p className="text-center text-gray-500">
            Choose the perfect plan to power your eCommerce success
          </p>
          <div className="flex justify-center">
            <FakeSelect selected={selected} setSelected={setSelected} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 rounded-md divide-y md:divide-y-0 md:divide-x divide-gray-200 mt-16 max-w-5xl mx-auto">
          <div className="p-8 grid grid-cols-1 grid-rows-2 gap-4">
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold">Self-hosted</h2>
                <p>
                  Full-featured eCommerce platform with unlimited potential.
                  100% free and community-driven.
                </p>
              </div>
              <a
                className="button w-full p-3 text-base"
                href="/docs/development/getting-started/introduction">
                Get Started
              </a>
            </div>
            <div className="mt-4">
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Unlimited products
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Fully customizable
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Open source
                </li>
              </ul>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 grid-rows-2 gap-4">
            <div className="flex flex-col justify-between">
              <h2 className="text-2xl font-bold">Personal</h2>
              <p>Perfect for startups and growing online stores.</p>

              <Price plan="personal" selected={selected} />
              {/* <a
                className="button button--primary w-full p-3 text-base"
                href={`http://localhost:3000?plan=personal&billing=${selected}`}>
                Get Personal
              </a> */}
              <a
                className="button button--primary w-full p-3 text-base"
                href={`http://marketplace-acc.evershop.io?plan=personal&billing=${selected}`}>
                Get Personal
              </a>
            </div>
            <div className="mt-4">
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Unlimited products
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Free SSL certificate
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  S3 storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Configuration
                </li>
              </ul>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 grid-rows-2 gap-4">
            <div className="flex flex-col justify-between">
              <h2 className="text-2xl font-bold">Professional</h2>
              <p>Advanced features and support for scaling businesses.</p>
              <Price plan="professional" selected={selected} />
              {/* <a
                className="button button--primary w-full p-3 text-base"
                href={`http://localhost:3000?plan=professional&billing=${selected}`}>
                Get Professional
              </a> */}
              <a
                className="button button--primary w-full p-3 text-base"
                href={`http://marketplace-acc.evershop.io?plan=professional&billing=${selected}`}>
                Get Professional
              </a>
            </div>
            <div className="mt-4">
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Unlimited products
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Free SSL certificate
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  S3 storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Deploy from GitHub
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const faqs = [
  {
    question: "Can I use my own domain?",
    answer:
      "Yes, you can use your own domain. You might need to configure a A record for your domain to point to your server.",
  },
  {
    question: "How do I pay for the plan?",
    answer: "You can pay for the plan using a credit card.",
  },
  {
    question: "How do I cancel my plan?",
    answer:
      "You can cancel your plan at any time, but you must cancel at least 24 hours before the next billing cycle occurs. You will not be charged after your current billing period.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Your remaining billing will be applied as a discount.",
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
            Find answers to common questions about our plans and features.
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
      description="Pricing."
      wrapperClassName="contact__us">
      <main className="bg-green-conner bg-[#FCFCFC] py-16">
        <Pricing />
        <FAQ />
      </main>
    </Layout>
  );
}
