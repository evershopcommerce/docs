/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import isInternalUrl from "@docusaurus/isInternalUrl";
import type { Props } from "@theme/Footer/LinkItem";

export default function FooterLinkItem({ item }: Props): JSX.Element {
  const { to, href, label, prependBaseUrlToHref, ...props } = item;
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });

  return (
    <Link
      className="footer__link-item"
      {...(href
        ? {
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}>
      {label}
      {href && !isInternalUrl(href) && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none">
          <path
            d="M15.8096 7.25001L15.8096 2.75001M15.8096 2.75001H11.3096M15.8096 2.75001L9.05957 9.5M7.55957 2.75H5.90957C4.64945 2.75 4.01939 2.75 3.53809 2.99524C3.11473 3.21095 2.77052 3.55516 2.55481 3.97852C2.30957 4.45982 2.30957 5.08988 2.30957 6.35V12.65C2.30957 13.9101 2.30957 14.5402 2.55481 15.0215C2.77052 15.4448 3.11473 15.789 3.53809 16.0048C4.01939 16.25 4.64945 16.25 5.90957 16.25H12.2096C13.4697 16.25 14.0997 16.25 14.581 16.0048C15.0044 15.789 15.3486 15.4448 15.5643 15.0215C15.8096 14.5402 15.8096 13.9101 15.8096 12.65V11"
            stroke="#101828"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Link>
  );
}
