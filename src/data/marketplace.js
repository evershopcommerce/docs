// Where the EverShop marketplace lives in each environment.
//
// `where_is_this` comes from the WHERE_IS_THIS environment variable, which
// docusaurus.config.js reads at build time ("local", "acc" for UAT, or
// "production"; production is the default). Use `marketplaceUrl` for every link
// to the marketplace so a UAT build never sends visitors to production.
const MARKETPLACE_ORIGIN = {
  local: "http://localhost:3000",
  acc: "https://marketplace-uat.evershop.io",
  production: "https://marketplace.evershop.io",
};

// `path` is what follows the origin, e.g. "" or "?plan=basic&billing=yearly".
export const marketplaceUrl = (customFields, path = "") => {
  const origin =
    MARKETPLACE_ORIGIN[customFields?.where_is_this] ||
    MARKETPLACE_ORIGIN.production;
  return `${origin}/${path}`;
};
