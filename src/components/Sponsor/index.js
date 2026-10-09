import React from "react";
import Link from "@docusaurus/Link";

// Shown at the end of many docs. Styles: .sponsor-callout in src/css/custom.scss.
// The title is a paragraph, not a heading, so it does not add an h2 to every
// page's outline.
export default function Sponsor() {
  return (
    <aside className="sponsor-callout" aria-label="Support EverShop">
      <p className="sponsor-callout__title">Support us</p>
      <p className="sponsor-callout__text">
        EverShop is an open-source project that relies on community support. If
        you find our project useful, please consider sponsoring us.
      </p>
      <Link
        className="sponsor-callout__link"
        to="https://opencollective.com/evershopcommerce">
        Become a sponsor →
      </Link>
    </aside>
  );
}
