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
        <h2 className=" mb-4">1. Community Support (Free & Powerful)</h2>
        <p>
          The easiest way to help us is to spread the word. This helps us reach
          more developers and improves the ecosystem for everyone.
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
            <b>Join our Discord:</b> Help other developers, share your projects,
            or just say hi.{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://discord.gg/GSzt7dt7RM">
              💬 Join Discord
            </a>
          </li>
          <li>
            <b>Share your story:</b> Tweet about EverShop or write a blog post
            about your experience.
          </li>
        </ul>
        <br />
        <h2 className=" mb-4">2. Financial Contributions</h2>
        <p>
          EverShop is an open-source project. Donations help us cover the daily
          costs of hosting, maintenance, and documentation.
        </p>
        <p>
          {" "}
          <b>Open Collective</b>
        </p>
        <p>
          Support our open-source core through recurring or one-time donations.
          Every dollar goes directly back into maintaining the project.{" "}
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
        <h2 className=" mb-4">4. Contributing Code</h2>
        <p>
          We welcome contributions from developers of all skill levels. Whether
          it's fixing a bug, improving documentation, or building a new
          extension, your help is valued.
        </p>
        <ul>
          <li>
            Check our{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/evershopcommerce/evershop/blob/main/CONTRIBUTING.md">
              Contributing Guide
            </a>{" "}
            on GitHub.
          </li>
          <li>Submit a Pull Request or report an issue.</li>
        </ul>
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
