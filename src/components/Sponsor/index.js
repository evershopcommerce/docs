import React from "react";
import Link from "@docusaurus/Link";

export default function Sponsor() {
  return (
    <div className="">
      <hr />
      <br />
      <div className="">
        {/* Not a heading: this block is shown at the end of ~50 docs and would
            otherwise add an extra h2 to each page's outline. Styled like the h2
            it replaces. */}
        <p
          className="text-3xl"
          style={{
            margin: "1.6em 0 0.8em",
            fontWeight: 600,
            color: "var(--heading-font-color)",
          }}>
          Support us
        </p>
        <br />
        <p>
          EverShop is an open-source project that relies on community support.
          If you find our project useful, please consider sponsoring us.
        </p>
        <div className="flex justify-center">
          <Link to="https://opencollective.com/evershopcommerce">
            Become a sponsor
          </Link>
        </div>
      </div>
    </div>
  );
}
