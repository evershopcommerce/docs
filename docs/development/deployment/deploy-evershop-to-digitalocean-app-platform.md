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
"scripts": {
    "build": "evershop build --skip-minify",
    "start": "evershop start",
    "user:create": "evershop user:create",
    "user:changePassword": "evershop user:changePassword"
}
```

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
