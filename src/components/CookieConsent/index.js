import React, { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "@docusaurus/Link";
import {
  closeSettings,
  getServerSnapshot,
  getSnapshot,
  saveDecision,
  subscribe,
} from "@site/src/consent/consent";
import styles from "./styles.module.css";

// The cookie banner. It sits at the bottom of the page and does not block it.
// It shows on a first visit and when "Cookie settings" in the footer is
// clicked. The consent state lives in src/consent/consent.js.

export default function CookieConsent() {
  const { ready, decision, panelOpen, gpc } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const visible = ready && (panelOpen || (decision === null && !gpc));
  const bannerRef = useRef(null);

  // Opened from the footer: move focus into the banner, let Escape close it,
  // and give focus back to the footer link afterwards.
  useEffect(() => {
    if (!visible || !panelOpen) return undefined;
    const opener = document.activeElement;
    bannerRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeSettings();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (opener && opener.isConnected) opener.focus();
    };
  }, [visible, panelOpen]);

  if (!visible) return null;

  return (
    <section
      ref={bannerRef}
      className={styles.banner}
      role="region"
      aria-labelledby="cookie-consent-title"
      tabIndex={-1}>
      <p id="cookie-consent-title" className={styles.title}>
        Cookies on evershop.io
      </p>
      <p className={styles.text}>
        We use analytics cookies to see which pages are useful, so we can
        improve our docs. They stay off unless you accept. You can change this
        any time with “Cookie settings” in the footer. See our{" "}
        <Link to="/privacy">Privacy Policy</Link> for details.
      </p>
      {decision && (
        <p className={styles.state}>
          {`Your choice: analytics cookies are ${
            decision.analytics ? "on" : "off"
          }.`}
        </p>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => saveDecision({ analytics: true })}>
          Accept
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => saveDecision({ analytics: false })}>
          Decline
        </button>
      </div>
      {panelOpen && (
        <button
          type="button"
          className={styles.close}
          aria-label="Close cookie settings"
          onClick={closeSettings}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true">
            <path
              d="m4 4 8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </section>
  );
}
