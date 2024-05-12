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
npx create-evershop-app my-app
```

The `create-evershop-app` command will create a new folder named `my-app` and install all of the dependencies for you.

## Install EverShop Using Docker

You can get started with EverShop in minutes by using the Docker image. The Docker image is a great way to get started with EverShop without having to worry about installing dependencies or configuring your environment.

```bash
curl -sSL https://raw.githubusercontent.com/evershopcommerce/evershop/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```

The Docker image will start a fresh EverShop installation with the default configuration. You can access the site at `http://localhost:3000` and the admin panel at `http://localhost:3000/admin`.

:::info
The docker installation above will also set up a config/ and translations/ folder as a volume, this is where you place custom configurations & translations to supported languages. Default location for these would be

```bash
cd /var/lib/docker/volumes/
```
:::

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
npm init;
npm install @evershop/evershop;
```

### Step 2: Install the core Npm scripts

Open the package.json file and add the following scripts:

```js title="Add the core npm scripts"
"scripts": {
    "setup": "evershop install",
    "build": "evershop build",
    "start": "evershop start",
    "start:debug": "evershop start --debug",
    "dev": "evershop dev",
    "user:create": "evershop user:create",
    "user:changePassword": "evershop user:changePassword"
}
```

### Step 3: Run the installation script

Before running this script, make sure that you have an empty Postgres database ready for EverShop.

:::info
Please check [this document](/docs/development/getting-started/system-requirements) for the system requirements list.
:::

This installation script will do the following tasks:

- Create a default configuration file.
- Create your administrator user.

```js title="Installation script"
npm run setup
```

:::caution
During the installation process, you will be asked for some information like database connection, your shop information…
:::

### Step 4: Folder permission

EverShop needs to write some files to the disk. So you need to make sure that the following folders have the write permission:

- `public/`
- `.evershop`
- `.log`
- `media`

### Step 5: Run the `build` command to build the site

```js title="Build the site"
npm run build
```

### Step 6: Run the `start` command to start your store in production mode

```js title="Start the site"
npm run start
```

Your site will start at `http://localhost:3000`.

Admin panel can be accessed at `http://localhost:3000/admin`.

## Upgrade EverShop

To upgrade EverShop version, you can run the following command:

```js title="Upgrade EverShop"
npm install @evershop/evershop@latest
```

EverShop will take care of the database migration for you.

:::caution
Upgrading EverShop requires running the `build` command again.
:::

## For developer

If you are a developer and want to start the project in the development mode, there are some additional steps you need to follow.

### Adding the `dev` script

Open the package.json and add the following script:

```js title="Add the core dev script"
"scripts": {
    "setup": "evershop install",
    "build": "evershop build",
    "start": "evershop start",
    "dev": "evershop dev"
}
```

### Adding the workspace configuration

Open the package.json and add the following configuration:

```js title="Adding the workspace configuration"
 "workspaces": [
    "extensions/*" #This is where you put your extensions
  ],
```

### Start the project in development mode

```js title="Start the site in development mode"
npm run dev
```

### Adding `jsconfig.json` file

Open the `jsconfig.json` file and add the following content:

```js title="Add the jsconfig.json file"
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": [
        "./themes/<Your Theme Folder>/components/*",
        "./node_modules/@evershop/evershop/src/components/*"
      ],
      "@components-origin/*": [
        "./node_modules/@evershop/evershop/src/components/*"
      ],
      "@default-theme/*" : [
        "./node_modules/@evershop/evershop/src/modules/*/pages/*"
      ]
    }
  }
}
```

### The debug mode

To run the project in debug mode, you are required to add the debugging script to the `package.json` file.

```js title="Add the debugging scripts"
"scripts": {
    ...,
    "start:debug": "evershop start --debug",
}
```

And then you can run the project in debug mode by running the following commands:

```js title="Start the site in debug mode"
npm run start:debug
```

:::info
The debug mode is enabled by default when you run the `dev` command.
:::

### Dockerize your project - Build your own Docker image

You can build your own Docker image by using the following `Dockerfile`:

```dockerfile title="Dockerfile"
FROM node:18-alpine
WORKDIR /app
RUN npm install -g npm@9
COPY package*.json .
# Copy your custom theme.
COPY themes ./themes

# Copy your custom extensions.
COPY extensions ./extensions

# Copy your config.
COPY config ./config

# Copy your media.
COPY media ./media

# Copy your public files.
COPY public ./public

# Copy your translations.
COPY translations ./translations

# Run npm install.
RUN npm install

# Build assets.
RUN npm run build

EXPOSE 80
CMD ["npm", "run", "start"]
```

And this is the `docker-compose.yml` file:

```yml title="docker-compose.yml"
# With new versions of docker compose & docker engine using "version" to validate compose files is obsolete.
# You would instead use "name:" or none of them and start your file from "services"
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    restart: always
    volumes:
    - config:/app/config
    - translations:/app/translations
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
  postgres-data: {}
  config: {}
  translations: {}
```