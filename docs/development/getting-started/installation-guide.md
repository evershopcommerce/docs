---
sidebar_position: 10
keywords:
  - EverShop installation
sidebar_label: Installation guide
title: Evershop installation guide.
description: This document will guide you through the installation process of EverShop. The quick installation guide is also available to help you install EverShop template quickly.
---

# Installation guide

The following installation guides will guide you step-by-step to create a new EverShop project and get it started.

:::info

Please check [this document](/docs/development/getting-started/system-requirements) for the system requirements list.

:::

## Install EverShop Using `create-evershop-app` command

```bash
npx create-evershop-app my-evershop-app
```

The `create-evershop-app` command will create a new folder named `my-evershop-app` and install all of the dependencies for you.

## Install EverShop Using Docker

You can get started with EverShop in minutes by using the Docker image. The Docker image is a great way to get started with EverShop without having to worry about installing dependencies or configuring your environment.

```bash
curl -sSL https://raw.githubusercontent.com/evershopcommerce/evershop/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```

The Docker image will start a fresh EverShop installation with the default configuration. You can access the site at `http://localhost:3000` and the admin panel at `http://localhost:3000/admin`.

:::info
To create a new admin user, terminal into the Docker app container and run the following command:

```bash
npm run user:create -- --email "your email" --password "your password" --name "your name"
```

:::

:::caution
The public Docker image is for installing EverShop in your local environment only. If you are looking for a development solution, please check the development section below.
:::

## Install EverShop manually using Npm

<div className="block md:hidden">
<iframe width="100%" height="300" src="https://www.youtube.com/embed/-KBh_Lw8AC0?si=o2bNvvFQccvzaZ7W" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

<div className="hidden md:block">
<iframe width="100%" height="600" src="https://www.youtube.com/embed/-KBh_Lw8AC0?si=o2bNvvFQccvzaZ7W" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

### Step 1: Install The @evershop/evershop Npm Package

`@evershop/evershop` is the core of the EverShop platform. It contains all of the core modules like `catalog`, `checkout`, `order`.

```js title="Install the @evershop/evershop Npm package"
npm init -y;
npm install @evershop/evershop;
```

### Step 2: Install the core Npm scripts

Open the package.json file and add the following scripts:

```js title="Add the core npm scripts"
"scripts": {
    "setup": "evershop install",
    "build": "evershop build",
    "start": "evershop start",
    "seed": "evershop seed",
    "start:debug": "evershop start --debug",
    "user:create": "evershop user:create",
    "user:changePassword": "evershop user:changePassword"
}
```

### Step 3: Run the installation script

Before running this script, make sure that you have an empty Postgres database ready for EverShop.

:::info
Please check [this document](/docs/development/getting-started/system-requirements) for the system requirements list.
:::

The interactive setup wizard will prompt you for:

1. **Database connection details** — host, port, database name, user, and password
2. **Admin user details** — full name, email, and password (minimum 8 characters, must contain at least one letter and one digit)

Once you provide this information, the setup script will:

- Create a `.env` file in your project root with the database connection settings
- Create the `media` and `public` directories
- Set up the database schema (create all required tables)
- Run all database migrations
- Create your administrator account

```bash title="Installation script"
npm run setup
```

:::info
The `.env` file created by the setup script contains your database credentials:
```bash
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="evershop"
DB_USER="postgres"
DB_PASSWORD="your_password"
DB_SSLMODE="disable"
```
You can edit this file later to change your database connection settings. See the [Database documentation](/docs/development/knowledge-base/database) for more options including SSL configuration.
:::

### Step 4: Folder permission

EverShop needs to write some files to the disk. So you need to make sure that the following folders have the write permission:

- `public/`
- `.evershop`
- `.log`
- `media`

### Step 5: Run the `build` command to build the site

```bash title="Build the site"
npm run build
```

### Step 6: Run the `start` command to start your store in production mode

```bash title="Start the site"
npm run start
```

Your site will start at `http://localhost:3000`.

Admin panel can be accessed at `http://localhost:3000/admin`.

:::info
By default EverShop will start at port 3000. You can change the port by setting the `PORT` environment variable.
:::

## Upgrade EverShop

To upgrade EverShop to the latest version:

```bash title="Step 1: Install the latest version"
npm install @evershop/evershop@latest
```

```bash title="Step 2: Rebuild your store"
npm run build
```

```bash title="Step 3: Restart your store"
npm run start
```

Database migrations are run automatically when the application starts, so any schema changes in the new version are applied for you.

## Demo Data Seeding

After installation, you can populate your store with demo data using the seed command. This is useful for development and testing.

```bash
npm run seed
```

This command will populate your store with sample products, categories, and other data.

:::info
Demo data seeding is intended for development and testing environments only. Do not use it in production.
:::

## For developer

If you are a developer and want to start the project in the development mode, there are some additional steps you need to follow.

### Install some additional dependencies for development

To run the project in development mode, you need to install some additional dependencies. These dependencies are not required for production but are essential for development.

```bash
npm install --save-dev @types/node typescript @parcel/watcher @types/config @types/express @types/pg @types/react execa
```

### Adding the `dev` script to the package.json file.

Open the package.json and add the following script:

```js title="Add the core dev script"
"scripts": {
    "dev": "evershop dev"
}
```

### Adding the workspace configuration

Open the package.json and add the following configuration:

```json title="Adding the workspace configuration"
{
  "workspaces": [
    "extensions/*",
    "themes/*"
  ]
}
```

This allows each extension and theme to function as an independent package with its own dependencies.

### Start the project in development mode

```js title="Start the site in development mode"
npm run dev
```

### The debug mode

The `start:debug` script (already added in Step 2) starts the production server with debug logging enabled:

```bash title="Start the site in debug mode"
npm run start:debug
```

This outputs detailed middleware execution timings and request processing information.

:::info
Debug mode is enabled by default when you run the `dev` command, so you don't need to use `start:debug` during development.
:::

### Dockerize Your Project

Dockerizing your EverShop project allows you to create a portable, self-contained environment for your application. Below is a guide to creating your own Docker image and managing persistent data like media files.

#### Handling Persistent Media Files

When you dockerize your application, it's crucial to handle the `media` directory correctly. This directory contains user-uploaded files (like product images) and should **not** be copied directly into the Docker image. If you do, any uploaded files will be lost whenever the container is rebuilt.

There are two primary approaches for managing media files:

1.  **Docker Volumes**: This approach mounts a directory from your host machine into the container. Files are stored on the host, so they persist even if the container is removed. This is suitable for single-server deployments or local development.

2.  **Cloud Storage**: This approach uses a cloud storage service like Amazon S3 or Azure Blob Storage. This decouples file storage from your application container entirely, which is essential for auto-scaling environments and provides better durability and performance.

:::caution Production Recommendation
For any production environment, we **strongly recommend using cloud storage** (like AWS S3 or Azure Blob Storage). This approach is more scalable, reliable, and secure than using local volumes. It prevents data loss, simplifies backups, and is essential if you ever plan to run your application across multiple servers.

EverShop provides official extensions for [AWS S3](https://evershop.io/extensions/s3-file-storage) and [Azure Blob Storage](https://evershop.io/extensions/azure-file-storage) to make this integration seamless.
:::

#### 1. Building Your Docker Image

Here is an example `Dockerfile`. Note that we have removed the `COPY media ./media` line.

```dockerfile title="Dockerfile"
FROM node:20-alpine
WORKDIR /app
RUN npm install -g npm@10
COPY package*.json .
# Copy your custom theme.
COPY themes ./themes

# Copy your custom extensions.
COPY extensions ./extensions

# Copy your config.
COPY config ./config

# DO NOT copy the media folder. It will be handled by a volume.

# Copy your public files.
COPY public ./public

# We must copy translations to the image as they are required for the build.
COPY translations ./translations

# Run npm install.
RUN npm install

# Build assets.
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
```

#### 2. Using Docker Compose with a Volume

This `docker-compose.yml` file demonstrates how to build the image and attach a volume for the `media` directory.

```yml title="docker-compose.yml"
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    volumes:
      - ./media:/app/media # Mounts the host's media folder to the container
    environment:
      DB_HOST: database
      DB_PORT: 5432
      DB_PASSWORD: postgres
      DB_USER: postgres
      DB_NAME: postgres
    networks:
      - myevershop
    depends_on:
      - database
    ports:
      - 3000:3000

  #The postgres database:
  database:
    image: postgres:16
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    networks:
      - myevershop

networks:
  myevershop:
    name: MyEverShop
    driver: bridge

volumes:
  postgres-data:
```

With this configuration, any files uploaded to your application will be saved in the `media` folder on your host machine, ensuring they are not lost.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
