import { marketplaceUrl } from "./marketplace";

// EverShop Cloud: the plan and the "Get EverShop Cloud" button, shared by the
// /pricing and /cloud pages so the price and the button live in one place.

// EverShop Cloud is ONE plan. In the marketplace it is the `basic` tier, sold
// under the name "EverShop Cloud" (`marketplace.plans.offered`), and these are
// its list prices in US dollars. They must be the same figures the marketplace
// charges: it reads them from the `basic-monthly` and `basic-yearly` product
// rows (extensions/mp-lifecycle), so change them there too.
// The yearly price is ten monthly payments, so "2 months free" is exact.
export const CLOUD_PLAN = {
  // The tier key the marketplace checkout expects in `?plan=`. It is never
  // shown to a visitor.
  tier: "basic",
  name: "EverShop Cloud",
  monthly: 29,
  yearly: 290,
};

// Where the "Get EverShop Cloud" button sends people. The marketplace captures
// `?plan=<tier>&billing=<cycle>` on any URL and carries it through login to
// checkout. The marketplace address depends on the environment (see
// ./marketplace.js).
export const planUrl = (customFields, billing) =>
  marketplaceUrl(customFields, `?plan=${CLOUD_PLAN.tier}&billing=${billing}`);

export const CLOUD_CTA = `Get ${CLOUD_PLAN.name}`;
