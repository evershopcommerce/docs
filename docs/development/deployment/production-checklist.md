---
sidebar_position: 2
keywords:
  - EverShop production checklist
  - environment variables
  - rate limiting
  - EVERSHOP_HOME_URL
  - TRUST_PROXY_HOPS
  - production deployment
sidebar_label: Production checklist
title: Production Checklist
description: Every environment variable EverShop reads at boot, the built-in per-IP rate limits, and the build and start sequence — the page to run down before you put a store live.
---

# Production Checklist

This page is the pre-launch pass. Whichever platform you deploy to — [AWS](./deploy-evershop-to-aws), [Azure](./deploy-evershop-to-azure), [DigitalOcean](./deploy-evershop-to-digitalocean-app-platform), [Heroku](./deploy-evershop-to-heroku) or your own machine — the same set of environment variables governs how the store boots, and the same rate limits govern how it behaves under load.

Read it top to bottom once before your first production start, and again whenever you move the store to a new host or put a CDN in front of it.

## Environment variables

EverShop is configured for deployment through environment variables. On a server they normally live in a `.env` file in the project root (the file `evershop install` writes) or in your platform's configuration panel — both end up in `process.env`, which is all EverShop reads.

Two of these have failure modes worth knowing before you set them: `EVERSHOP_HOME_URL` **aborts the boot** if it is malformed, and `TRUST_PROXY_HOPS` silently changes who your rate limits apply to. Both are covered in detail below the table.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Default</th>
      <th>What it controls, and what happens if it is wrong</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colSpan="3"><strong>Database</strong></td>
    </tr>
    <tr>
      <td><code>DB_HOST</code></td>
      <td>—</td>
      <td>PostgreSQL hostname. Required.</td>
    </tr>
    <tr>
      <td><code>DB_PORT</code></td>
      <td><code>5432</code></td>
      <td>PostgreSQL port. Managed providers often use a non-standard port (DigitalOcean uses <code>25060</code>).</td>
    </tr>
    <tr>
      <td><code>DB_NAME</code></td>
      <td>—</td>
      <td>Database name. Required.</td>
    </tr>
    <tr>
      <td><code>DB_USER</code></td>
      <td>—</td>
      <td>Database user. Needs <code>CREATE</code>, <code>ALTER</code> and <code>DROP</code> — migrations run on every start.</td>
    </tr>
    <tr>
      <td><code>DB_PASSWORD</code></td>
      <td>—</td>
      <td>Database password.</td>
    </tr>
    <tr>
      <td><code>DB_SSLMODE</code></td>
      <td>TLS off</td>
      <td>
        <code>disable</code> turns TLS off explicitly. <code>require</code>, <code>prefer</code>, <code>verify-ca</code> and <code>verify-full</code> all enable TLS <em>with</em> certificate verification. <code>no-verify</code> enables TLS but skips verification — acceptable as a stopgap, not as a permanent setting.
        <br /><br />
        <strong>Any unset or unrecognized value means no TLS at all.</strong> A typo here does not error; it silently sends your credentials in the clear.
      </td>
    </tr>
    <tr>
      <td><code>DB_SSLROOTCERT</code><br /><code>DB_SSLCERT</code><br /><code>DB_SSLKEY</code></td>
      <td>—</td>
      <td>Filesystem paths to a CA bundle / client certificate / client key. Read only in the verifying <code>DB_SSLMODE</code> modes. A path that does not exist throws at startup when the connection pool is created.</td>
    </tr>
    <tr>
      <td colSpan="3"><strong>Server</strong></td>
    </tr>
    <tr>
      <td><code>PORT</code></td>
      <td><code>3000</code></td>
      <td>Port the HTTP server binds to. A non-numeric value falls back to <code>3000</code> rather than failing — if your platform assigns a port dynamically, make sure it is exported before the process starts.</td>
    </tr>
    <tr>
      <td><code>NODE_ENV</code></td>
      <td>set by the CLI</td>
      <td>You do not need to set this. <code>evershop start</code> and <code>evershop build</code> force <code>production</code>; <code>evershop dev</code> forces <code>development</code>. A value you export is overwritten by the CLI for those commands.</td>
    </tr>
    <tr>
      <td><code>EVERSHOP_HOME_URL</code></td>
      <td><code>shop.homeUrl</code>, then localhost</td>
      <td><strong>Validated at boot — a malformed value is fatal.</strong> The store's public base URL, used for every absolute URL the store emits. See below.</td>
    </tr>
    <tr>
      <td><code>TRUST_PROXY_HOPS</code></td>
      <td><code>1</code></td>
      <td>Number of reverse proxies in front of the app. Determines <code>request.ip</code>, and therefore which bucket the rate limiter counts a request into. See below.</td>
    </tr>
    <tr>
      <td colSpan="3"><strong>Tokens and secrets</strong></td>
    </tr>
    <tr>
      <td><code>JWT_ADMIN_SECRET</code></td>
      <td>—</td>
      <td rowSpan="4">
        Signing keys for the token-based REST authentication endpoints (<code>POST /api/user/tokens</code>, <code>/api/user/token/refresh</code>, <code>/api/customer/tokens</code>, <code>/api/customer/token/refresh</code>, <code>/api/user/session/tokens</code>).
        <br /><br />
        There is no default and no boot-time check: the endpoints throw <code>JWT secret for … is not configured</code> the first time they are called. If you use the REST API from a headless frontend or a mobile app, set all four to long, independent random strings. Rotating one invalidates every token signed with it.
        <br /><br />
        Cookie-session logins to the admin panel and the storefront do not use these.
      </td>
    </tr>
    <tr>
      <td><code>JWT_ADMIN_REFRESH_SECRET</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>JWT_CUSTOMER_SECRET</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>JWT_CUSTOMER_REFRESH_SECRET</code></td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>JWT_ISSUER</code></td>
      <td><code>evershop</code></td>
      <td>The <code>iss</code> claim on issued tokens.</td>
    </tr>
    <tr>
      <td>
        <code>JWT_ADMIN_TOKEN_EXPIRY</code><br />
        <code>JWT_ADMIN_REFRESH_TOKEN_EXPIRY</code><br />
        <code>JWT_CUSTOMER_TOKEN_EXPIRY</code><br />
        <code>JWT_CUSTOMER_REFRESH_TOKEN_EXPIRY</code>
      </td>
      <td>
        <code>900</code><br />
        <code>54000</code><br />
        <code>1800</code><br />
        <code>108000</code>
      </td>
      <td>Token lifetimes in seconds (15 min / 15 h / 30 min / 30 h).</td>
    </tr>
    <tr>
      <td><code>ORDER_TRACKING_TOKEN_SECRET</code></td>
      <td>—</td>
      <td>Signs the anonymous order-tracking links embedded in shipment emails. If unset, those links cannot be generated and the tracking page renders "this link is no longer valid". Set it if guests can place orders.</td>
    </tr>
    <tr>
      <td colSpan="3"><strong>Images</strong></td>
    </tr>
    <tr>
      <td><code>IMAGE_ALLOWED_HOSTS</code></td>
      <td>empty</td>
      <td>
        Comma-separated allowlist of hosts the <code>/images</code> optimization proxy may fetch from. It is a strict allowlist: it blocks SSRF against internal addresses and stops the endpoint being used as a free image proxy for third-party sites.
        <br /><br />
        <strong>EverShop logs a warning at boot when this is unset</strong> and no cloud storage host can be derived from your configuration. With nothing allowed, only local <code>media</code>, <code>public</code> and theme images are optimized; external images are refused. When S3, Azure or GCS file storage is configured, that provider's host is allowed automatically — you do not need to repeat it here.
      </td>
    </tr>
    <tr>
      <td colSpan="3"><strong>Logging</strong></td>
    </tr>
    <tr>
      <td><code>LOG_FILE</code></td>
      <td>console</td>
      <td>Path to a log file. When set, log output goes to that file <em>instead of</em> the console — check it before you conclude the app is silent. Ignored in debug mode (<code>evershop dev</code>, or <code>--debug</code>), which always logs to the console.</td>
    </tr>
    <tr>
      <td><code>LOGGER_LEVEL</code></td>
      <td><code>warn</code></td>
      <td>Minimum level to record: <code>error</code>, <code>warn</code>, <code>info</code>, <code>http</code>, <code>verbose</code>, <code>debug</code>, <code>silly</code>. The default of <code>warn</code> means informational messages are dropped in production. Debug mode overrides this to <code>silly</code>.</td>
    </tr>
    <tr>
      <td colSpan="3"><strong>Cloud file storage</strong> — only needed for the provider you selected in Admin → Settings. See <a href="/docs/development/knowledge-base/file-storage">File Storage</a>.</td>
    </tr>
    <tr>
      <td>
        <code>AWS_BUCKET_NAME</code><br />
        <code>AWS_REGION</code><br />
        <code>AWS_ACCESS_KEY_ID</code><br />
        <code>AWS_SECRET_ACCESS_KEY</code><br />
        <code>AWS_S3_ENDPOINT</code><br />
        <code>AWS_S3_FORCE_PATH_STYLE</code><br />
        <code>AWS_S3_BASE_URL</code>
      </td>
      <td>—</td>
      <td>Amazon S3 and S3-compatible services. Omit the key pair to use the AWS SDK's default credential chain (instance role, IRSA, shared config) — the recommended setup on EC2 and EKS. <code>AWS_S3_ENDPOINT</code> plus <code>AWS_S3_FORCE_PATH_STYLE</code> cover R2, MinIO and Spaces; <code>AWS_S3_BASE_URL</code> serves files through a CDN instead of the bucket host.</td>
    </tr>
    <tr>
      <td>
        <code>GCS_BUCKET_NAME</code><br />
        <code>GCS_BASE_URL</code>
      </td>
      <td>—</td>
      <td>Google Cloud Storage. Credentials come from Application Default Credentials (an attached service account, or <code>GOOGLE_APPLICATION_CREDENTIALS</code>) unless you paste a service-account key in the admin settings.</td>
    </tr>
    <tr>
      <td>
        <code>AZURE_STORAGE_CONNECTION_STRING</code><br />
        <code>AZURE_STORAGE_CONTAINER_NAME</code><br />
        <code>AZURE_STORAGE_BASE_URL</code>
      </td>
      <td>container: <code>images</code></td>
      <td>Azure Blob Storage. The container is created on first use if it does not exist.</td>
    </tr>
  </tbody>
</table>

:::info
Anything set through an environment variable or `config/<env>.json` **wins over** the matching admin setting, and the admin form shows those fields as read-only. That is deliberate: it lets infrastructure pin credentials that a store operator must not be able to change from the browser.
:::

:::tip Installer variables
`evershop install` also reads `ADMIN_FULLNAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`, and skips the matching prompt when one is present. Useful for scripting an unattended first install. They have no effect on a running store.
:::

### `EVERSHOP_HOME_URL` — validated, and fatal when wrong

This is the recommended way to set your store's public base URL. It overrides the `shop.homeUrl` configuration key, so you can change the domain without editing a config file or rebuilding.

```bash
EVERSHOP_HOME_URL="https://your-store.com"
```

Everything the store emits as an absolute URL is derived from it:

- links in transactional emails (order confirmations, shipment notifications, password resets)
- `<loc>` entries in `sitemap.xml` and the absolute `Sitemap:` line in the generated `robots.txt`
- canonical tags and `hreflang` alternates on multi-language stores

Left unset, EverShop falls back to `shop.homeUrl` and then to `http://localhost:$PORT`. That fallback is the classic production bug: the store works fine in a browser, and every order confirmation emails a `localhost` link to the customer.

:::danger A malformed value stops the boot
The value is validated during module bootstrap. It must parse as a URL **and** use the `http` or `https` protocol. `your-store.com` (no scheme) and `ftp://your-store.com` both throw, and the process exits before it starts listening.

An unset or empty value is allowed — it just falls back. Only a *set but invalid* value is fatal. If a deploy suddenly fails to come up right after you touched this variable, that is where to look.
:::

Set the full origin, with the scheme and without a trailing slash or path. Update it when you move from a platform-assigned hostname to your custom domain, and again if you switch from `http` to `https`.

### `TRUST_PROXY_HOPS` — who the rate limiter sees

Every deployment in this section runs behind at least one proxy. EverShop only learns the real client address from the `X-Forwarded-For` header, and it only trusts as much of that header as you tell it to.

`TRUST_PROXY_HOPS` sets Express's `trust proxy` to a hop count. That determines `request.ip`, and `request.ip` is the key the [rate limiter](#built-in-rate-limits) buckets on.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Value</th>
      <th>Topology</th>
      <th>Failure mode when this is the wrong choice</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>0</code></td>
      <td>The Node process is directly internet-facing. <code>X-Forwarded-For</code> is not trusted at all.</td>
      <td>Correct only with no proxy. Behind one, every request is attributed to the proxy's address — one bucket for the entire internet.</td>
    </tr>
    <tr>
      <td><code>1</code> (default)</td>
      <td>One reverse proxy or load balancer: nginx, an ALB, the Heroku router, the App Service front end, the App Platform load balancer.</td>
      <td>The common case, and the reason this is the default.</td>
    </tr>
    <tr>
      <td><code>2</code> or more</td>
      <td>A chain: CDN → load balancer → app. Cloudflare or CloudFront in front of nginx is two.</td>
      <td>
        <strong>Set too low</strong> and the address you see is the last proxy's, not the visitor's — all traffic collapses into a single bucket and a normal traffic spike returns <code>429</code> to everybody at once.
        <br /><br />
        <strong>Set too high</strong> and the app trusts an entry in <code>X-Forwarded-For</code> that the client supplied. A client can then present a fresh fake IP on every request and never hit a limit at all.
      </td>
    </tr>
  </tbody>
</table>

Count the hops that actually terminate and re-forward the connection, and set the variable to exactly that number. An unset, empty, negative or non-integer value falls back to `1`.

## Built-in rate limits

EverShop ships a per-client-IP rate limiter, mounted early in the middleware stack — before session lookup and before any database work — so a flood is shed before it consumes a connection from the pool.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Tier</th>
      <th>Applies to</th>
      <th>Limit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Pages</td>
      <td>Everything not matched by another tier — storefront and admin pages.</td>
      <td><strong>300 requests per minute</strong> per IP (~5/second)</td>
    </tr>
    <tr>
      <td>API</td>
      <td><code>/api</code> and everything under <code>/api/</code>.</td>
      <td><strong>120 requests per minute</strong> per IP</td>
    </tr>
    <tr>
      <td>Auth</td>
      <td>
        <code>POST</code> to these paths only:
        <br /><code>/customer/login</code>
        <br /><code>/admin/user/login</code>
        <br /><code>/api/customers</code> (registration)
        <br /><code>/api/customers/reset-password</code>
        <br /><code>/api/customers/password</code>
      </td>
      <td><strong>8 requests per 15 minutes</strong> per IP</td>
    </tr>
  </tbody>
</table>

A leading locale prefix is stripped before matching, so `/fr/customer/login` lands in the auth tier just like `/customer/login`.

### Exempt paths

These never count against any limit:

- **Static assets** — any path ending in a known asset extension: `.js`, `.mjs`, `.cjs`, `.css`, `.map`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.avif`, `.ico`, `.woff`, `.woff2`, `.ttf`, `.eot`, `.txt`, `.xml`, `.json`. (This is why `/robots.txt` and `/sitemap.xml` are also exempt.)
- **Hot module replacement** — `/__webpack_hmr…` and any `.hot-update` path.
- **`/backend/`** — the admin development bundle.
- **`/health` and `/healthz`** — reserved for uptime probes, so a monitor polling every few seconds never exhausts a bucket.

:::caution
`/health` and `/healthz` are *exempt* from rate limiting, but EverShop core does not define them as routes — a request to either returns a 404 unless you add the route yourself in an extension. If your platform requires a health-check endpoint, point it at one of these two paths and implement it, so the probe traffic stays exempt.
:::

### The 429 contract

When a limit is exceeded, the response is `429 Too Many Requests` with:

- a **`Retry-After`** header, in seconds — `60` for the page and API tiers, `900` for the auth tier
- standard **`RateLimit-*`** headers on every response, so a well-behaved client can back off before it is throttled (the legacy `X-RateLimit-*` headers are not sent)
- a JSON body for `/api/**` paths, matching EverShop's normal error envelope:

```json
{
  "error": {
    "status": 429,
    "message": "Too many requests. Please slow down and try again later."
  }
}
```

- a plain-text body for page requests

### What you cannot change

**These limits are hardcoded and not operator-configurable.** There is no config key and no environment variable for the windows, the thresholds or the tiers. They are deliberately generous — sized so that an office or a mobile carrier sharing one NAT address still browses comfortably — and exist as a capacity safety net rather than as a tunable policy.

The limiter is skipped when `NODE_ENV=test`, which keeps integration suites deterministic. That is not an escape hatch for production: `evershop start` forces `NODE_ENV=production`, so a running store always has the limiter active.

:::warning A per-IP limit is not DDoS protection
Per-IP limits stop a single abusive source. A distributed flood arrives from thousands of addresses and each one stays under the threshold. If that is in your threat model, put a WAF or CDN with edge rate limiting in front of the store — and remember to raise `TRUST_PROXY_HOPS` when you do.
:::

## Build and start

Two commands, in this order:

```bash
npm run build
npm run start
```

`evershop build` compiles the production bundles for every route. It **takes no flags** — asset minification is always on for a production build and cannot be disabled. Run it on every deploy, after `npm install`, and re-run it whenever you change a theme, add an extension or upgrade EverShop.

`evershop start` boots the server in production mode. It sets `NODE_ENV=production` itself, loads `.env`, runs module bootstrap, and binds to `$PORT` (default `3000`).

### Migrations run on start

**Database migrations are applied automatically during startup**, after bootstrap and before the server accepts requests. There is no separate migrate command to run and nothing to schedule.

The practical consequences:

- The database user in `DB_USER` needs DDL privileges — `CREATE`, `ALTER`, `DROP` — permanently, not just at install time.
- **Take a backup before starting a new version.** Migrations are not reversible; rolling the application back does not roll the schema back.
- On a multi-instance deployment, be aware that every instance runs migrations at boot. Roll instances one at a time rather than restarting the whole fleet at once.
- The very first start on an empty database also creates the schema, so a fresh deploy has a longer cold start than subsequent ones.

Creating the first administrator is a separate, explicit step — `evershop install` does it locally, and on a server you run:

```bash
npm run user:create -- --email "admin@example.com" --name "Admin" --password "a-strong-password"
```

## Final pass before launch

- [ ] `EVERSHOP_HOME_URL` is set to the real public origin, with `https://` and no trailing slash — and a test email actually links to it.
- [ ] `TRUST_PROXY_HOPS` matches the real number of proxies. Confirm it by checking that different clients produce different addresses in your logs.
- [ ] `DB_SSLMODE` is one of the verifying modes, not left unset.
- [ ] The four JWT secrets are set to independent random strings if you use the REST API; `ORDER_TRACKING_TOKEN_SECRET` is set if guests can order.
- [ ] `IMAGE_ALLOWED_HOSTS` is set, or cloud file storage is configured — check the boot log for the warning.
- [ ] `LOG_FILE` points somewhere you will actually look, and log rotation is configured for it.
- [ ] Uploaded media is on cloud storage, or on a volume that survives a redeploy. See [File Storage](/docs/development/knowledge-base/file-storage).
- [ ] Automated database backups are on, and you have restored one at least once.
- [ ] No hand-written `public/robots.txt` or `public/sitemap.xml` is shadowing the generated ones. See [Static File Serving](/docs/development/knowledge-base/static-file-serving).
- [ ] Store settings — currency, timezone, units, languages, tax — are set in Admin → Settings. See [Store Settings](/docs/development/knowledge-base/store-settings).
- [ ] Demo seed data has **not** been run against the production database.
- [ ] `npm run build` completed without errors on the exact commit you are deploying.
