import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

function SupportUs() {
  return (
    <header className="hero--primary justify-center">
      <div className="container text-left" style={{ maxWidth: "1000px" }}>
        <h1 className="text-center">Support EverShop</h1>
        <br />
        <p>
          Thank you for being part of the EverShop journey! Your support is what
          fuels our mission to build the most modern, developer-friendly Node.js
          commerce platform in the world.
        </p>
        <p>There are three ways you can help us grow:</p>
        <br />
        <h2 className=" mb-4">
          1. Contribute to the Ecosystem (Community & Code)
        </h2>
        <p>
          The strength of EverShop lies in its community. Whether you are a
          developer or an enthusiast, your involvement matters.
        </p>
        <ul>
          <li>
            <b>Star our GitHub:</b> It helps increase our visibility and
            attracts more contributors.{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/evershopcommerce/evershop">
              ⭐ Star on GitHub
            </a>
          </li>
          <li>
            <b>Join the Development:</b> Help us fix bugs or build new features.
            Check our{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/evershopcommerce/evershop/blob/main/CONTRIBUTING.md">
              Contributing Guide
            </a>
          </li>
          <li>
            <b>Share your story:</b> Tweet about EverShop or write a blog post
            about your experience.
          </li>
        </ul>
        <br />
        <h2 className=" mb-4">2. Project Sponsorship (Donations)</h2>
        <p>
          EverShop is an open-source project. Financial contributions help us
          cover the daily costs of hosting, maintenance, and keeping the core
          engine free for everyone.
        </p>
        <p>
          {" "}
          <b>Open Collective</b>
        </p>
        <p>
          Support our open-source mission through recurring or one-time
          donations. Every contribution goes directly into the project's
          sustainability.{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://opencollective.com/evershopcommerce">
            👉 Support on Open Collective
          </a>
        </p>
        <br />
        <h2 className=" mb-4">3. Strategic Investment 🚀</h2>
        <p>
          We are currently scaling EverShop from a popular open-source tool into
          a global commerce ecosystem. We are building EverShop Cloud and an
          integrated Marketplace to serve the next generation of online
          merchants.
        </p>
        <p>
          We are open to conversations with VCs and Angel Investors who are
          passionate about:
        </p>
        <ul>
          <li>The future of Node.js and React in eCommerce.</li>
          <li>Open-core business models.</li>
          <li>
            Building the modern alternative to legacy platforms like Magento and
            Shopify.
          </li>
        </ul>
        <p>
          If you are interested in our Seed round, vision, and roadmap, we would
          love to connect.
        </p>
        <p>
          📩 Direct Contact:{" "}
          <a
            href="mailto:support@evershop.io?subject=Strategic%20Investment%20Inquiry"
            target="_blank"
            rel="noopener noreferrer">
            Email us about Strategic Investment
          </a>
        </p>
        <br />
        <p>
          <b>Thank you for helping us build the future of commerce!</b>
        </p>
      </div>
      <br />
    </header>
  );
}

export default function SupportPage() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Support" description="Support EverShop.">
      <main>
        <SupportUs />
      </main>
    </Layout>
  );
}
