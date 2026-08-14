---
sidebar_position: 12
keywords:
  - DigitalOcean deployment
  - App Platform hosting
  - EverShop cloud deployment
  - Node.js PostgreSQL deployment
sidebar_label: Deploy to DigitalOcean App Platform
title: Deploy EverShop to DigitalOcean App Platform
description: A comprehensive, step-by-step guide on deploying your EverShop e-commerce application to DigitalOcean App Platform with PostgreSQL database integration.
---

# Deploy EverShop to DigitalOcean App Platform

This guide provides detailed instructions for deploying EverShop to DigitalOcean App Platform with a managed PostgreSQL database. Follow these steps to get your e-commerce store running in a production environment.

:::tip
Before you go live, run down the [Production Checklist](./production-checklist) — it lists every environment variable EverShop reads at boot, the built-in per-IP rate limits, and what the build and start sequence actually does.
:::

## Prerequisites

Before beginning the deployment process, ensure you have:

- A DigitalOcean account with billing set up
- A registered domain name (for production use)
- A GitHub account
- A GitHub repository containing your EverShop application code

## Getting Started

### Prepare Your GitHub Repository

While DigitalOcean App Platform supports multiple deployment methods, this tutorial focuses on deployment via GitHub integration. This approach enables continuous deployment whenever you push changes to your repository.

Ensure your `package.json` file contains the following scripts that DigitalOcean will execute during deployment:

```json
{
  "scripts": {
    "build": "evershop build",
    "start": "evershop start",
    "user:create": "evershop user:create",
    "user:changePassword": "evershop user:changePassword"
  }
}
```

:::info
`evershop build` takes no flags. Asset minification is always on in a production build and cannot be turned off.
:::

### Create a New DigitalOcean App

1. Log in to your DigitalOcean account and navigate to the App Platform dashboard.

2. Click the "Create App" button to begin the setup process.

<p align="center">

![Create a new DigitalOcean App](./img/create-app-repo.png "Create a new DigitalOcean App")

</p>

3. In the "Resources" section, select your GitHub repository containing the EverShop code. If this is your first time connecting GitHub to DigitalOcean, click "Manage Access" to authorize the integration.

4. Configure your deployment settings. You can typically use the default settings, but verify the branch you want to deploy.

<p align="center">

![Deployment Branch Setup](./img/deployment-branch-setting.png "Deployment Branch Setup")

</p>

5. Click "Next" to proceed to the plan selection. Choose the plan that best fits your requirements. For testing or small-scale deployments, the "Basic" plan is often sufficient.

<p align="center">

![App Plan Review](./img/review-app-plan.png "App Plan Review")

</p>

:::warning
Do not add a database to your app at this stage. EverShop requires PostgreSQL 13 or higher, but DigitalOcean App Platform currently offers PostgreSQL 12 through its integrated database option. We'll create a compatible database separately in the next section.
:::

6. For now, leave the "Environment Variables" section empty. We'll configure these after creating the database.

<p align="center">

![App Environment Variables](./img/create-app-environment.png "App Environment Variables")

</p>

7. Complete the "Info" and "Review" sections, then finalize your app creation by clicking "Create Resources."

## Create a PostgreSQL Database

EverShop requires PostgreSQL version 13 or higher. Follow these steps to create a compatible managed database:

1. From the DigitalOcean dashboard, click "Databases" in the main navigation menu.

2. Click the "Create Database Cluster" button.

3. Select "PostgreSQL" as the database type and choose version 13 or higher.

4. Select your preferred region, typically the same region as your App Platform deployment.

5. Choose an appropriate plan based on your expected traffic and database usage.

<p align="center">

![Create a PostgreSQL Database](./img/create-postgresql-database.png "Create a PostgreSQL Database")

</p>

6. After the database is created, navigate to its "Overview" page to find the connection details you'll need for the next steps.

<p align="center">

![PostgreSQL Connection Details](./img/database-connection-details.png "PostgreSQL Connection Details")

</p>

:::warning
For App Platform integration, you must use the "Public Network" connection method, as DigitalOcean App Platform does not currently support private "VPC Network" connections to managed databases. Consider implementing additional security measures such as IP restrictions if your application handles sensitive data.
:::

## Configure Your EverShop Application

### Set Up Environment Variables

Now that your database is ready, configure your EverShop application with the appropriate connection details:

1. Return to your App Platform dashboard and select your EverShop application.

2. Navigate to the "Settings" tab and find the "App-level environment variables" section.

3. Add the following environment variables, using the values from your database connection details:

<p align="center">

![App Environment Variables](./img/setup-environment-variables.png "App Environment Variables")

</p>

- `DB_HOST`: The hostname of your PostgreSQL database
- `DB_PORT`: The port number (typically 25060 for DigitalOcean managed PostgreSQL)
- `DB_NAME`: Your database name
- `DB_USER`: Your database username
- `DB_PASSWORD`: Your database password
- `DB_SSLMODE`: Set to `no-verify` (or `require` if you've configured proper SSL)
- `EVERSHOP_HOME_URL`: Your store's public base URL, e.g. `https://your-app.ondigitalocean.app` (or your custom domain once configured)
- `TRUST_PROXY_HOPS`: Set to `1` — App Platform routes every request through its own load balancer

### Set the public base URL

`EVERSHOP_HOME_URL` overrides the `shop.homeUrl` configuration key and is the recommended way to set your production base URL — it lives with the rest of your App Platform environment variables, so changing it needs no code change.

```bash
EVERSHOP_HOME_URL=https://your-app.ondigitalocean.app
```

Everything EverShop emits as an absolute URL depends on it: links in transactional emails, canonical tags, `hreflang` alternates, and the `<loc>` entries plus the `Sitemap:` line in `robots.txt`. If it is left unset, EverShop falls back to `shop.homeUrl` and then to `http://localhost:<PORT>` — which means customer emails go out pointing at localhost.

:::danger A malformed value stops the app from booting
`EVERSHOP_HOME_URL` is validated during startup. It must be an **absolute** `http` or `https` URL. A value like `your-app.ondigitalocean.app` (no scheme), or one using another protocol, throws during bootstrap and the process exits before it listens — the deployment will fail its health check.

Set the full origin with a scheme and no trailing path. Leaving the variable unset is fine; setting it to something invalid is fatal.
:::

:::tip
Update `EVERSHOP_HOME_URL` when you attach your custom domain. Leaving it on the `*.ondigitalocean.app` hostname means every email and canonical URL keeps pointing at the platform domain.
:::

### Set the proxy hop count

`TRUST_PROXY_HOPS` tells EverShop how many reverse proxies sit in front of the app. It drives Express's `trust proxy` setting, which determines `request.ip` — and `request.ip` is what the built-in rate limiter buckets on.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Value</th>
      <th>Use when</th>
      <th>What goes wrong otherwise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>0</code></td>
      <td>The app is directly internet-facing with no proxy.</td>
      <td>Never correct on App Platform — every request would be attributed to the platform load balancer.</td>
    </tr>
    <tr>
      <td><code>1</code> (default)</td>
      <td>One proxy: the App Platform load balancer. This is the normal setting.</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>2</code> or more</td>
      <td>A proxy chain, e.g. Cloudflare or another CDN in front of App Platform.</td>
      <td>Too low and every visitor collapses into one bucket, so a moderate traffic spike triggers mass <code>429</code> responses for everyone. Too high and a client can spoof <code>X-Forwarded-For</code> to present a fresh IP per request and bypass the limits entirely.</td>
    </tr>
  </tbody>
</table>

An unset, empty or non-numeric value falls back to `1`. Count the hops that actually terminate and re-forward the connection, and set the variable to that number.

### Configure Deployment Commands

To ensure your application builds and starts correctly:

1. In the "Settings" tab, select your app component (typically named after your GitHub repository).

2. Navigate to the "Commands" section.

<p align="center">

![App Commands](./img/configure-deploy-commands.png "App Commands")

</p>

3. Verify that the build and run commands match the scripts in your package.json file:

<p align="center">

![App Commands](./img/build-start-commands.png "App Commands")

</p>

4. Save your changes. DigitalOcean will automatically redeploy your application with the new configuration.

After the deployment process completes, your EverShop application should be up and running on DigitalOcean App Platform. You can verify this by checking the deployment status:

<p align="center">

![App Deployed](./img/deploy-success.png "App Deployed")

</p>

## Create an Administrator Account

To access the admin panel and manage your store, create an administrator account:

1. From your App Platform dashboard, select your EverShop application.

2. Navigate to the "Console" tab to access a command-line interface.

3. Run the following command to create an admin user, replacing the placeholder values with your desired credentials:

```bash
npm run user:create -- --email "admin@example.com" --name "Admin User" --password "SecurePassword123!"
```

4. Once the command completes successfully, access your admin panel by visiting `https://<your-app-domain>/admin` and log in with your newly created credentials.

## Next Steps

Congratulations! You've successfully deployed EverShop to DigitalOcean App Platform. Here are some additional steps to consider:

### Configure Custom Domain

For production use, configure your custom domain through the App Platform "Settings" tab under the "Domains" section.

### Set Up Continuous Deployment

Your application is already configured for automatic deployment when you push changes to your GitHub repository. You can adjust these settings in the "Settings" tab under the "Components" section.

### Implement Monitoring

Consider setting up monitoring and alerts through DigitalOcean's Monitoring service to keep track of your application's health and performance.

### Regular Backups

Configure regular database backups through the DigitalOcean Managed Database dashboard to protect your store's data.

### Performance Optimization

As your store grows, consider scaling your resources in App Platform and optimizing your EverShop application for improved performance.
