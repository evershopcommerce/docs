---
sidebar_position: 5
keywords:
  - Azure deployment
  - EverShop cloud hosting
  - Microsoft Azure App Service
  - Node.js deployment
sidebar_label: Deploy to Azure
title: Deploy EverShop to Microsoft Azure
description: Follow this comprehensive guide to deploy your EverShop e-commerce platform to Microsoft Azure using Azure App Service with step-by-step instructions.
---

# Deploy EverShop to Microsoft Azure

This comprehensive guide walks you through the process of deploying your EverShop e-commerce platform to Microsoft Azure using Azure App Service and Azure Database for PostgreSQL.

:::tip
Before you go live, run down the [Production Checklist](./production-checklist) — it lists every environment variable EverShop reads at boot, the built-in per-IP rate limits, and what the build and start sequence actually does.
:::

## Prerequisites

Before beginning the deployment process, ensure you have:

1. An active Microsoft Azure account with subscription access
2. An EverShop project installed and running on your local machine
3. Git installed on your local machine (for version control and deployment)

## Step 1: Create a New Azure Web App

1. Log in to the Azure portal at [https://portal.azure.com](https://portal.azure.com).
<p align="center">

![Azure Create A Resource](./img/azure-create-resource.png "Azure Create A Resource")

</p>

2. Click the "+ Create a resource" button in the Azure portal dashboard.

3. Search for "Web App & Database" and select it from the search results.
   ![Azure Select Web And Database](./img/azure-select-web-database.png "Azure Select Web And Database")

4. Click the "Create" button to begin configuring your web application.

5. Configure your web application with the following settings:

<p align="center">

![Azure Configure Web App](./img/azure-configure-app.png "Azure Configure Web App")

</p>

6. Configure your database with appropriate settings for your EverShop deployment:

<p align="center">

![Azure Configure Database](./img/azure-configure-database.png "Azure Configure Database")

</p>

7. Click "Review + create" and then "Create" to provision your web application and database. Once completed, you'll see your resources in the Azure portal:

<p align="center">

![Azure Resource List](./img/azure-resouce-list.png "Azure Resource List")

</p>

## Step 2: Configure Deployment Options

Azure supports multiple deployment methods. For this guide, we'll use the local Git deployment approach:

1. Navigate to your newly created web app in the Azure portal.

2. In the left menu, select "Deployment Center."

3. Choose `Local Git` as your deployment option.

4. Click the "Save" button to confirm your deployment configuration.

<p align="center">

![Azure Configure Deployment Option](./img/azure-local-git-option.png "Azure Configure Deployment Option")

</p>

## Step 3: Add Git Remote to Your Local Project

After configuring the deployment options, Azure will generate a Git URL for your repository:

<p align="center">

![Azure Git Remote Url](./img/azure-local-git-url.png "Azure Git Remote Url")

</p>

Add this Git remote to your local EverShop project:

```bash
git remote add azure <your-git-url>
```

:::caution
If your local project is not already a Git repository, initialize one first by running:

```bash
git init
```

Then add and commit your files before proceeding to the next step:

```bash
git add .
git commit -m "Initial commit for Azure deployment"
```

:::

## Step 4: Configure Your Local Project

### Configure NPM Scripts

Azure's deployment process automatically runs `npm install` followed by `npm run build`. Ensure your `package.json` file includes these scripts:

```json title="package.json"
{
  "name": "evershop",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "build": "evershop build",
    "start": "evershop start",
    "user:create": "evershop user:create",
    "user:changePassword": "evershop user:changePassword"
  },
  "workspaces": ["extensions/*"],
  "author": "EverShop",
  "license": "ISC",
  "dependencies": {
    "@evershop/evershop": "latest"
  }
}
```

:::info
`evershop build` takes no flags. Asset minification is always on in a production build and cannot be turned off.
:::

### Add PM2 Configuration File

Azure App Service uses PM2 as its Node.js process manager. Create a PM2 configuration file in your project root:

```javascript title="ecosystem.config.cjs"
module.exports = {
  apps: [
    {
      name: "evershopAzure",
      script: "npm",
      env: {
        NODE_ENV: "production",
      },
      args: "run start",
    },
  ],
};
```

### Create a .gitignore File

Your local project structure should look similar to this:

```bash
├── .evershop
├── .log
├── extensions
├── media
├── themes
├── node_modules
├── public
├── .env
├── ecosystem.config.cjs
├── package.json
├── package-lock.json
└── README.md
```

Create a `.gitignore` file to exclude unnecessary files from deployment:

```bash title=".gitignore"
.evershop
.log
node_modules
.env
```

## Step 5: Configure Environment Variables

EverShop requires specific environment variables for database connectivity. Configure these in the Azure portal:

1. Go to your web app in the Azure portal and navigate to the "Configuration" section.

<p align="center">

![Azure Environment Variable List](./img/azure-env-list.png "Azure Environment Variable List")

</p>

2. Rename the following default Azure PostgreSQL environment variables to match EverShop's expected names:

   - `AZURE_POSTGRESQL_DBNAME` → `DB_NAME`
   - `AZURE_POSTGRESQL_USERNAME` → `DB_USER`
   - `AZURE_POSTGRESQL_PASSWORD` → `DB_PASSWORD`
   - `AZURE_POSTGRESQL_HOST` → `DB_HOST`
   - `AZURE_POSTGRESQL_PORT` → `DB_PORT`

3. Add these additional required environment variables:

   - `DB_SSLMODE`: Set to `require` to enable SSL connections to the database
   - `PORT`: Set to `3000` to specify the port EverShop will use
   - `EVERSHOP_HOME_URL`: Your store's public base URL, e.g. `https://your-app.azurewebsites.net` (or your custom domain once mapped)
   - `TRUST_PROXY_HOPS`: Set to `1` — App Service terminates TLS at its own front end and forwards to your container

### Set the public base URL

`EVERSHOP_HOME_URL` overrides the `shop.homeUrl` configuration key and is the recommended way to set your production base URL — no config file needs to be edited or redeployed to change it.

```bash
EVERSHOP_HOME_URL=https://your-app.azurewebsites.net
```

Everything EverShop emits as an absolute URL depends on it: links in transactional emails, canonical tags, `hreflang` alternates, and the `<loc>` entries plus the `Sitemap:` line in `robots.txt`. If it is left unset, EverShop falls back to `shop.homeUrl` and then to `http://localhost:<PORT>` — which means customer emails go out pointing at localhost.

:::danger A malformed value stops the server from booting
`EVERSHOP_HOME_URL` is validated during startup. It must be an **absolute** `http` or `https` URL. A value like `your-app.azurewebsites.net` (no scheme), or one using another protocol, throws during bootstrap and the process exits before it listens.

Set the full origin with a scheme and no trailing path. Leaving the variable unset is fine; setting it to something invalid is fatal.
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
      <td>Never correct on App Service — every request would be attributed to the front end.</td>
    </tr>
    <tr>
      <td><code>1</code> (default)</td>
      <td>One proxy: the App Service front end. This is the normal setting.</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>2</code> or more</td>
      <td>A proxy chain, e.g. Azure Front Door or a CDN in front of App Service.</td>
      <td>Too low and every visitor collapses into one bucket, so a moderate traffic spike triggers mass <code>429</code> responses for everyone. Too high and a client can spoof <code>X-Forwarded-For</code> to present a fresh IP per request and bypass the limits entirely.</td>
    </tr>
  </tbody>
</table>

An unset, empty or non-numeric value falls back to `1`. Count the hops that actually terminate and re-forward the connection, and set the variable to that number.

<p align="center">

![Azure Configure Environment Variables](./img/azure-adding-ssl-mode.png "Azure Configure Environment Variables")

</p>

<p align="center">

![Azure Configure Environment Variables](./img/azure-adding-port.png "Azure Configure Environment Variables")

</p>

4. Save your configuration changes.

## Step 6: Deploy Your Project

With configuration complete, deploy your EverShop application to Azure:

```bash
git push azure master
```

:::caution
During your first deployment, Azure will prompt you for Git credentials. You can find these in the "Deployment Center" section of your web app:

<p align="center">

![Azure Git Credentials](./img/azure-git-credentials.png "Azure Git Credentials")

</p>
:::

The initial deployment may take several minutes. Once completed, your site will be accessible at the URL provided by Azure:

<p align="center">

![Azure Default Domain](./img/azure-default-domain.png "Azure Default Domain")

</p>

## Step 7: Create an Administrator Account

After deploying your EverShop store, create an administrator account:

1. Connect to your web app using the SSH feature in the Azure portal.

<p align="center">

![Azure SSH](./img/azure-ssh.png "Azure SSH")

</p>

2. Navigate to your application directory:

```bash
cd /home/site/wwwroot
```

3. Create an admin user:

```bash
npm run user:create -- --email "admin@example.com" --password "securePassword" --name "Admin Name"
```

4. Access your admin panel at `https://<your-azure-domain>/admin` and log in using the credentials you just created.

## Step 8: Configure Custom Domain (Optional)

To use your own domain instead of the default Azure domain:

1. Navigate to the "Custom domains" section in your web app's settings.

2. Follow the [Azure Custom Domain Configuration Guide](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain) to map your domain to your Azure web app.

## Troubleshooting

If you encounter issues during deployment or while running your EverShop store on Azure:

1. Check the application logs in the Azure portal under "App Service logs"
2. Verify your environment variables are configured correctly
3. Ensure your database connection is working properly
4. Confirm that your PM2 configuration is correct

## Performance Optimization

For optimal performance of your EverShop store on Azure:

1. Enable Azure CDN for faster content delivery
2. Configure auto-scaling based on your expected traffic patterns
3. Use the appropriate App Service pricing tier for your needs
4. Consider adding Redis Cache for improved performance
