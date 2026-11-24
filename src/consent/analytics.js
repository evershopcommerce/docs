// Google Analytics, loaded only after the visitor accepts analytics cookies.
//
// This replaces @docusaurus/plugin-google-gtag, which put the gtag script in
// every page. It is a Docusaurus client module (see `clientModules` in
// docusaurus.config.js). As before, it tracks production builds only.
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import siteConfig from "@generated/docusaurus.config";
import { getSnapshot, subscribe } from "./consent";

const gtagId = siteConfig.customFields.analytics?.gtagId;
const trackingBuild = process.env.NODE_ENV === "production" && Boolean(gtagId);

let scriptAdded = false;
// null until the first decision is applied, so that a visitor who has not
// accepted gets old Google Analytics cookies removed once on load.
let active = null;

function addGtag() {
  if (scriptAdded) return;
  scriptAdded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag.js expects the `arguments` object, so this cannot be an arrow function.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    gtagId
  )}`;
  document.head.appendChild(script);
}

// Google Analytics sets its cookies on the highest domain it can (evershop.io),
// so try the host and every parent domain.
function removeCookies() {
  const names = ["_ga", `_ga_${gtagId.replace(/^G-/, "")}`];
  const parts = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i += 1) {
    domains.push(`; domain=.${parts.slice(i).join(".")}`);
  }
  names.forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    });
  });
}

function setActive(next) {
  if (next === active) return;
  active = next;
  // Google's documented switch to stop all measurement.
  window[`ga-disable-${gtagId}`] = !next;
  if (next) {
    addGtag();
    // Also sends the page_view for the page the visitor is on.
    window.gtag("config", gtagId, { anonymize_ip: true });
  } else {
    removeCookies();
  }
}

function applyConsent() {
  setActive(getSnapshot().decision?.analytics === true);
}

if (ExecutionEnvironment.canUseDOM && trackingBuild) {
  applyConsent();
  subscribe(applyConsent);
}

const clientModule = {
  // Page views for client-side navigation, as @docusaurus/plugin-google-gtag did.
  onRouteDidUpdate({ location, previousLocation }) {
    if (!active || !previousLocation) return;
    if (
      location.pathname === previousLocation.pathname &&
      location.search === previousLocation.search &&
      location.hash === previousLocation.hash
    ) {
      return;
    }
    // Wait one tick so the document title is already the new page's title.
    setTimeout(() => {
      window.gtag(
        "set",
        "page_path",
        location.pathname + location.search + location.hash
      );
      window.gtag("event", "page_view");
    });
  },
};

export default clientModule;
