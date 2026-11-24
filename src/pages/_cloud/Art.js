import React from "react";
import s from "./cloud.module.css";

// Illustrations for the /cloud page. They are drawn here (inline SVG and HTML)
// so the page loads no images, and none of them shows a real brand or a real
// store. Every illustration is decorative: it carries aria-hidden, or it is a
// role="img" with a text description, and the facts it shows are also written
// in the page text next to it.

/* ---------------------------------------------------------------- icons */

export const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M3 9h12m0 0-4.5-4.5M15 9l-4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      className={s.checkPath}
      d="m3.5 8.4 3 3 6-6.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="1.8" fill="currentColor" />
    <path
      d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M1.5 2h2l1.6 7.2h6.6l1.4-5H4.2"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6" cy="12.6" r="1.1" fill="currentColor" />
    <circle cx="11" cy="12.6" r="1.1" fill="currentColor" />
  </svg>
);

const PointerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 3.2 19 11l-6.2 1.7L10.4 19 5 3.2Z"
      fill="#101828"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------------------------------- product art */
// Three plain objects, drawn flat, so the storefront has "photos" without
// using anyone's product shots.

export const Mug = ({ className }) => (
  <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="58" cy="108" rx="34" ry="5" fill="#101828" opacity=".08" />
    <path
      d="M30 42h56v44a22 22 0 0 1-22 22H52a22 22 0 0 1-22-22V42Z"
      fill="#0F6B54"
    />
    <path
      d="M86 54h5a12 12 0 0 1 0 24h-5"
      stroke="#0F6B54"
      strokeWidth="7"
      strokeLinecap="round"
      fill="none"
    />
    <ellipse cx="58" cy="42" rx="28" ry="6" fill="#0A4A3A" />
    <path
      d="M39 56v28"
      stroke="#fff"
      strokeOpacity=".28"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

export const Tote = ({ className }) => (
  <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="110" rx="34" ry="4.5" fill="#101828" opacity=".08" />
    <path
      d="M46 52v-9a14 14 0 0 1 28 0v9"
      stroke="#B4623F"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M32 52h56l6 56H26l6-56Z" fill="#D9825F" />
    <rect x="48" y="70" width="24" height="17" rx="3" fill="#fff" opacity=".4" />
  </svg>
);

export const Vase = ({ className }) => (
  <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="110" rx="30" ry="4.5" fill="#101828" opacity=".08" />
    <path
      d="M60 58V26"
      stroke="#2F7D5B"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M60 44c-13-1-20-9-20-17 11 0 20 6 20 17Z" fill="#3B9A74" />
    <path d="M60 36c11-2 18-9 18-16-10 0-18 6-18 16Z" fill="#2F7D5B" />
    <path
      d="M50 58h20c0 9 16 15 16 34 0 11-6 17-26 17s-26-6-26-17c0-19 16-25 16-34Z"
      fill="#4C6A86"
    />
    <path
      d="M42 86c0 8 3 14 8 17"
      stroke="#fff"
      strokeOpacity=".25"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const PRODUCTS = [
  { name: "Ceramic mug", price: "$24", Art: Mug, tone: "toneSage" },
  { name: "Canvas tote", price: "$32", Art: Tote, tone: "toneClay" },
  { name: "Table vase", price: "$38", Art: Vase, tone: "toneSky" },
];

/* ------------------------------------------------------------- hero art */

const HANDLED = ["Hosting", "SSL certificate", "Database backups", "Store emails"];

export function HeroArt() {
  return (
    <div
      className={s.heroArt}
      role="img"
      aria-label="Illustration: an online store running at its own domain, with a padlock, next to a list of what EverShop Cloud handles for you: hosting, SSL certificate, database backups and store emails.">
      <div className={s.browser}>
        <div className={s.browserBar}>
          <span className={s.winDots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.address}>
            <LockIcon />
            yourstore.com
          </span>
        </div>
        <div className={s.shop}>
          <div className={s.shopNav}>
            <b>Your Store</b>
            <span>Shop</span>
            <span>Journal</span>
            <span>About</span>
            <span className={s.shopCart}>
              <CartIcon />
            </span>
          </div>
          <div className={s.shopBanner}>
            <div className={s.shopBannerText}>
              <span className={s.shopBannerTitle}>Made to be used every day</span>
              <i className={s.sk} style={{ width: "84%" }} />
              <i className={s.sk} style={{ width: "58%" }} />
              <span className={s.shopBtn}>Shop now</span>
            </div>
            <Mug className={s.bannerMug} />
          </div>
          <div className={s.shopGrid}>
            {PRODUCTS.map(({ name, price, Art, tone }) => (
              <div key={name} className={s.shopItem}>
                <div className={`${s.shopThumb} ${s[tone]}`}>
                  <Art />
                </div>
                <span className={s.shopItemName}>{name}</span>
                <span className={s.shopItemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={s.status}>
        <div className={s.statusTitle}>Handled for you</div>
        <ul>
          {HANDLED.map((label, i) => (
            <li key={label} style={{ "--i": i }}>
              <span className={s.tick}>
                <CheckIcon />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- feature art */

// "Fully managed infrastructure": your store on top, what we run underneath.
export function ManagedArt() {
  return (
    <div className={s.layers} aria-hidden="true">
      <div className={s.layerTop}>
        <span className={s.layerLabel}>Your store</span>
        <div className={s.chips}>
          <span>Products</span>
          <span>Orders</span>
          <span>Customers</span>
        </div>
      </div>
      <div className={s.layerLine}>
        <span>You</span>
        <i />
        <span>We run this</span>
      </div>
      <div className={s.layerBase}>
        <span className={s.layerLabel}>EverShop Cloud</span>
        <div className={s.chips}>
          <span>Servers</span>
          <span>Updates</span>
          <span>Security</span>
          <span>Backups</span>
          <span>Email</span>
          <span>Storage</span>
        </div>
      </div>
    </div>
  );
}

// "One-click installation": one button, then a store.
export function InstallArt() {
  return (
    <div className={s.install} aria-hidden="true">
      <div className={s.installBtn}>
        Create my store
        <span className={s.installPointer}>
          <PointerIcon />
        </span>
      </div>
      <div className={s.installDone}>
        <span className={s.tick}>
          <CheckIcon />
        </span>
        Your store is ready
      </div>
    </div>
  );
}

// "Custom domain": the three steps, ending at the store's address bar. The
// steps are real text (a list); only the address bar is decoration.
export function DomainArt() {
  return (
    <div className={s.domainFlow}>
      <ol className={s.flowSteps}>
        <li>
          <span aria-hidden="true">1</span>
          Add your domain in the portal.
        </li>
        <li>
          <span aria-hidden="true">2</span>
          Create the DNS records we show you.
        </li>
        <li>
          <span aria-hidden="true">3</span>
          We issue the SSL certificate and renew it.
        </li>
      </ol>
      <div className={s.addrBig} aria-hidden="true">
        <LockIcon />
        <span>yourstore.com</span>
        <em>SSL active</em>
      </div>
    </div>
  );
}

// "Email service": the kind of email a store sends.
export function EmailArt() {
  return (
    <div className={s.mail} aria-hidden="true">
      <div className={s.mailHead}>
        <span className={s.mailAvatar}>Y</span>
        <div>
          <b>Your Store</b>
          <small>Order confirmation</small>
        </div>
      </div>
      <div className={s.mailBody}>
        <span className={s.mailHello}>Thanks for your order!</span>
        <div className={s.mailItem}>
          <span className={`${s.mailThumb} ${s.toneSage}`}>
            <Mug />
          </span>
          <span>Ceramic mug</span>
          <b>$24</b>
        </div>
        <i className={s.sk} style={{ width: "92%" }} />
        <i className={s.sk} style={{ width: "64%" }} />
      </div>
    </div>
  );
}

// "Cloud storage": product images, laid out like a media library.
export function StorageArt() {
  const tiles = [
    { Art: Mug, tone: "toneSage" },
    { Art: Tote, tone: "toneClay" },
    { Art: Vase, tone: "toneSky" },
    { Art: Tote, tone: "toneSage" },
    { Art: Vase, tone: "toneClay" },
    { Art: Mug, tone: "toneSky" },
  ];
  return (
    <div className={s.library} aria-hidden="true">
      {tiles.map(({ Art, tone }, i) => (
        <span key={i} className={`${s.libTile} ${s[tone]}`}>
          <Art />
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------- marketplace */

// Two listings, one installed and one not. An example, labelled as such.
export function MarketArt() {
  return (
    <div className={s.market} aria-hidden="true">
      <div className={s.marketHead}>
        <span>Marketplace</span>
        <em>Example</em>
      </div>
      <div className={s.listing}>
        <span className={`${s.listingThumb} ${s.toneSage}`}>
          <Vase />
        </span>
        <div className={s.listingText}>
          <b>Storefront theme</b>
          <small>Theme</small>
        </div>
        <span className={s.listingInstalled}>
          <span className={s.tick}>
            <CheckIcon />
          </span>
          Installed
        </span>
      </div>
      <div className={s.listing}>
        <span className={`${s.listingThumb} ${s.toneSky}`}>
          <Tote />
        </span>
        <div className={s.listingText}>
          <b>Product reviews</b>
          <small>Extension</small>
        </div>
        <span className={s.listingInstall}>Install</span>
      </div>
    </div>
  );
}
