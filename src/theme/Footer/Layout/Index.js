/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import clsx from "clsx";

export default function FooterLayout({ style, links, logo, copyright }) {
  return (
    <footer
      className={clsx("footer", {
        "footer--dark": style === "dark",
      })}>
      <div className="container container-fluid">
        <div className="flex justify-items-center items-center gap-9">
          {logo && <div>{logo}</div>}
          {links}
        </div>
        {(logo || copyright) && (
          <div className="footer__bottom">
            {logo && <div>{logo}</div>}
            <div className="text--left">{copyright}</div>
          </div>
        )}
      </div>
    </footer>
  );
}
