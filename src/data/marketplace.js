// Where the EverShop marketplace lives.
//
// The address is chosen at build time: docusaurus.config.js reads the
// MARKETPLACE_URL environment variable and passes it to the pages as
// `customFields.marketplace_url`. Without the variable it is production.
//   - `npm start` sets it to the local marketplace (package.json).
//   - A UAT build sets it in that build's environment variables.
// The UAT address is deliberately NOT written here: this repository is public,
// and anything in this file also ships in the site's JavaScript.
//
// Use `marketplaceUrl` for every link to the marketplace so a UAT build never
// sends visitors to production.
export const DEFAULT_MARKETPLACE_ORIGIN = "https://marketplace.evershop.io";

// `path` is what follows the origin, e.g. "" or "subscribe?plan=basic".
export const marketplaceUrl = (customFields, path = "") => {
  const origin = (
    customFields?.marketplace_url || DEFAULT_MARKETPLACE_ORIGIN
  ).replace(/\/+$/, "");
  return `${origin}/${path}`;
};
