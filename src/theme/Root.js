import React from "react";
import CookieConsent from "@site/src/components/CookieConsent";

// Wraps the whole site. The cookie banner lives here so it is on every page.
export default function Root({ children }) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}
