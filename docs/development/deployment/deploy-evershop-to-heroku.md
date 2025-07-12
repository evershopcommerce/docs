---
sidebar_position: 7
keywords:
  - Heroku deployment
  - EverShop hosting
  - PostgreSQL setup
  - Node.js cloud hosting
sidebar_label: Deploy to Heroku
title: Deploy EverShop to Heroku
description: A comprehensive guide for deploying your EverShop e-commerce application to Heroku with PostgreSQL database integration.
---

# Deploy EverShop to Heroku

This guide provides detailed instructions for deploying an EverShop application on Heroku's cloud platform using the Heroku Command Line Interface (CLI) and a PostgreSQL database add-on.

## Prerequisites

Before beginning the deployment process, ensure you have:

1. An active Heroku account
2. An EverShop project installed and running on your local machine
3. Git installed on your local machine
4. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed

## Step 1: Create a New Heroku App

1. Log in to the [Heroku dashboard](https://dashboard.heroku.com).
2. Click the "New" button and select "Create new app" from the dropdown menu.
3. Enter a unique app name, select your preferred region, and click "Create app".

<p align="center">

![Heroku Create New App](./img/heroku-create-app.png "Heroku Create New App")

</p>

## Step 2: Install and Configure Heroku CLI

1. If you haven't already, download and install the Heroku CLI from the [official Heroku documentation](https://devcenter.heroku.com/articles/heroku-cli).
2. Open your terminal and authenticate with Heroku:

```bash
heroku login
```

Follow the prompts to complete the authentication process.

## Step 3: Set Up a PostgreSQL Database

EverShop requires a PostgreSQL database. Add the Heroku Postgres add-on to your application:

```bash
heroku addons:create heroku-postgresql:PLAN_NAME -a YOUR_APP_NAME
```

:::caution
Replace `PLAN_NAME` with your desired PostgreSQL plan (e.g., `hobby-dev` for the free tier). See the [Heroku Postgres plans](https://devcenter.heroku.com/articles/heroku-postgres-plans) for available options.

Replace `YOUR_APP_NAME` with your Heroku application name.
:::

### Configure Database Connection

Heroku provides database credentials as a connection string in the `DATABASE_URL` environment variable. View this connection string with:

```bash
heroku config -a YOUR_APP_NAME
```

You'll see output similar to:

```
DATABASE_URL: postgres://username:password@host:port/database_name
```

Since EverShop requires individual database configuration parameters rather than a connection string, parse the `DATABASE_URL` and set the following environment variables:

```bash
heroku config:set DB_HOST=your_database_host -a YOUR_APP_NAME
heroku config:set DB_PORT=5432 -a YOUR_APP_NAME
heroku config:set DB_USER=your_database_username -a YOUR_APP_NAME
heroku config:set DB_PASSWORD=your_database_password -a YOUR_APP_NAME
heroku config:set DB_NAME=your_database_name -a YOUR_APP_NAME
heroku config:set DB_SSLMODE=no-verify -a YOUR_APP_NAME
```

:::tip
The values for these environment variables can be extracted from the `DATABASE_URL`. For example, if your `DATABASE_URL` is:

```
postgres://gqdnxqkaxcrbyd:dd3aecf3715167ce8a519c518f637sdfcb9ebb0dda3723d050e8a3b8a7cf19fc789@ec2-52-205-11-146.compute-1.amazonaws.com:5432/d468v1qsdfnb0arsqf
```

Then your environment variables would be:

```
DB_HOST=ec2-52-205-11-146.compute-1.amazonaws.com
DB_PORT=5432
DB_USER=gqdnxqkaxcrbyd
DB_PASSWORD=dd3aecf3715167ce8a519c518f637sdfcb9ebb0dda3723d050e8a3b8a7cf19fc789
DB_NAME=d468v1qsdfnb0arsqf
```

:::

## Step 4: Prepare Your Local Project

Assuming you have an EverShop project ready for deployment, you'll need to make a few configuration changes to ensure compatibility with Heroku.

A typical EverShop project structure looks like:

```
├── .evershop     # Production build files
├── .log          # Application logs
├── extensions    # Custom extensions
├── media         # Uploaded images and media
├── themes        # Custom themes
├── node_modules  # Node.js dependencies
├── public        # Static public files
├── .env          # Environment variables (local only)
├── package.json  # Project configuration
└── README.md     # Documentation
```

### Specify Node.js and NPM Versions

Add Node.js and NPM version specifications to your `package.json`:

```json title="package.json"
{
  "engines": {
    "node": "20.x",
    "npm": "9.x"
  }
}
```

### Configure Scripts for Heroku

Update your `package.json` with the necessary scripts for Heroku deployment:

```json title="package.json"
{
  "scripts": {
    "build": "evershop build --skip-minify",
    "start": "evershop start",
    "user:create": "evershop user:create"
  }
}
```

:::note
The `--skip-minify` flag speeds up the build process. Remove this flag for production-optimized assets if preferred.
:::

### Configure Build Behavior

Control how Heroku builds your application with these environment variables:

```bash
# Skip installing devDependencies (recommended for production)
heroku config:set NPM_CONFIG_PRODUCTION=true -a YOUR_APP_NAME

# Use 'npm install' instead of 'npm ci' (if you encounter issues with npm ci)
heroku config:set USE_NPM_INSTALL=true -a YOUR_APP_NAME
```

:::info
Heroku automatically sets `NODE_ENV=production` for all deployed applications.
:::

### Create a .gitignore File

Create a `.gitignore` file to exclude unnecessary files from deployment:

```bash title=".gitignore"
.evershop
.log
node_modules
.env
```

## Step 5: Deploy Your Application

### Initialize Git Repository

If your project isn't already in a Git repository:

```bash
git init
```

### Commit Your Changes

Add and commit all files:

```bash
git add .
git commit -m "Prepare EverShop for Heroku deployment"
```

### Connect to Heroku Remote

Link your local repository to your Heroku app:

```bash
heroku git:remote -a YOUR_APP_NAME
```

### Deploy to Heroku

Push your code to deploy:

```bash
git push heroku main
```

If your primary branch is named `master` instead of `main`, use:

```bash
git push heroku master
```

Heroku will automatically detect your Node.js application, install dependencies, run the build script, and start your application. You can monitor the deployment process in your terminal.

Once deployed, you can access your application at:

```
https://YOUR_APP_NAME.herokuapp.com
```

<p align="center">

![Heroku Default Domain](./img/heroku-default-domain.png "Heroku Default Domain")

</p>

## Step 6: Create an Administrator Account

After your first deployment, create an administrator account to access the admin panel:

```bash
heroku run npm run user:create -- --email "admin@example.com" --name "Admin User" --password "SecurePassword123!" -a YOUR_APP_NAME
```

:::caution
Replace the example credentials with a secure email, name, and strong password.
:::

Once created, you can access the admin panel at:

```
https://YOUR_APP_NAME.herokuapp.com/admin
```

## Troubleshooting and Maintenance

### Viewing Application Logs

Monitor your application logs with:

```bash
heroku logs --tail -a YOUR_APP_NAME
```

### Scaling Your Application

As your store grows, you may need to scale your application:

```bash
heroku ps:scale web=2 -a YOUR_APP_NAME
```

### Managing Database Backups

Create regular backups of your PostgreSQL database:

```bash
heroku pg:backups:capture -a YOUR_APP_NAME
```

### Updating Your Application

To deploy updates, simply commit your changes and push to Heroku:

```bash
git add .
git commit -m "Update application"
git push heroku main
```

## Conclusion

Congratulations! You've successfully deployed EverShop to Heroku. Your e-commerce application is now accessible to customers worldwide, backed by Heroku's reliable cloud infrastructure.
