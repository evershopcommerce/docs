---
sidebar_position: 5
keywords:
  - EverShop system requirements
  - Node.js requirements
  - PostgreSQL requirements
  - Server requirements
sidebar_label: System requirements
title: System Requirements
description: Complete system requirements for running EverShop. Review the hardware, software, and environment prerequisites before installing EverShop.
---

# System Requirements

Before installing EverShop, ensure your system meets the following requirements. This guide covers the necessary software, hardware, and environment specifications for optimal performance.

![EverShop Backend](./img/backend.png)

## Overview

EverShop is a modern e-commerce platform built on Node.js and PostgreSQL. It requires specific system configurations to run efficiently and securely.

## Operating System

EverShop is cross-platform compatible and can run on:

- **Linux** (Ubuntu 20.04 LTS or later, CentOS 8+, Debian 10+)
- **macOS** (10.15 Catalina or later)
- **Windows** (10 or later, Windows Server 2019+)

:::tip Recommended
For production environments, we recommend using **Linux-based systems** (Ubuntu Server or CentOS) for better performance and stability.
:::

## Software Requirements

### Node.js

**Required Version:** Node.js 20.x or higher

- Download from [nodejs.org](https://nodejs.org/)
- We recommend using the **LTS (Long Term Support)** version
- Verify installation: `node --version`

:::caution Version Compatibility
Node.js versions below 20.x are not supported and may cause compatibility issues.
:::

### NPM (Node Package Manager)

**Required Version:** NPM 9.x or higher

- NPM is included with Node.js installation
- Verify installation: `npm --version`
- Update NPM if needed: `npm install -g npm@latest`

### PostgreSQL Database

**Required Version:** PostgreSQL 13 or higher

- Download from [postgresql.org](https://www.postgresql.org/)
- **Recommended:** PostgreSQL 15+ for improved performance
- Verify installation: `psql --version`

**Database Configuration Requirements:**

- An empty PostgreSQL database for EverShop
- Database user with full privileges (CREATE, ALTER, DROP, INSERT, UPDATE, DELETE)
- UTF-8 character encoding
- Recommended extensions: `pg_trgm` for full-text search

:::info Database Setup
During installation, EverShop will automatically create the necessary database schema and tables. Ensure your database user has sufficient privileges.
:::

## Hardware Requirements

### Minimum Requirements

Suitable for development and testing environments:

- **CPU:** 2 cores
- **RAM:** 2 GB
- **Storage:** 10 GB available disk space
- **Network:** Stable internet connection for package installation

### Recommended Requirements

For production environments and optimal performance:

- **CPU:** 4+ cores
- **RAM:** 4 GB or more
- **Storage:** 20 GB+ SSD storage
- **Network:** High-speed internet connection with low latency

:::tip Performance
For stores with high traffic or large product catalogs (10,000+ products), consider scaling up to 8 GB RAM and using SSD storage for better database performance.
:::

## Development Environment (Optional)

For developers working on EverShop customization or extension development:

### Required Tools

- **Git** (version 2.x or higher) - for version control
- **Code Editor** - VS Code, Sublime Text, or similar
- **Docker** (optional) - for containerized development

### Additional Dependencies

When running EverShop in development mode, you'll need:

```json
{
  "@types/node": "^20.x",
  "typescript": "^5.x",
  "@parcel/watcher": "^2.x",
  "@types/config": "^3.x",
  "@types/express": "^4.x",
  "@types/pg": "^8.x",
  "@types/react": "^18.x",
  "execa": "^8.x"
}
```

These will be installed automatically when running `npm install` with the `--save-dev` flag.

## Network and Security Requirements

### Firewall Configuration

Ensure the following ports are accessible:

- **Port 3000** - Default EverShop application port (configurable)
- **Port 5432** - PostgreSQL database port (if remote database)
- **Port 443** - HTTPS (for production with SSL)
- **Port 80** - HTTP (redirects to HTTPS)

### SSL/TLS Certificate

For production environments:
- Valid SSL/TLS certificate (Let's Encrypt, commercial CA, or similar)
- Configured reverse proxy (Nginx, Apache, or similar)

## Browser Requirements

### Admin Panel

The EverShop admin panel supports:

- **Chrome/Edge** (latest 2 versions)
- **Firefox** (latest 2 versions)
- **Safari** (latest 2 versions)

### Storefront

The customer-facing store supports:

- Modern browsers with ES6+ support
- JavaScript enabled
- Cookies enabled

## Docker Requirements (Optional)

If using Docker for deployment:

- **Docker:** 20.10 or higher
- **Docker Compose:** 2.0 or higher
- Sufficient resources allocated to Docker containers (2GB+ RAM)

## Cloud Platform Compatibility

EverShop can be deployed on various cloud platforms:

- **AWS** (EC2, ECS, Elastic Beanstalk)
- **Google Cloud Platform** (Compute Engine, Cloud Run)
- **Microsoft Azure** (Virtual Machines, App Service)
- **DigitalOcean** (Droplets, App Platform)
- **Heroku**
- **Railway**
- **Vercel** (with serverless PostgreSQL)

## Checking Your System

Before installing EverShop, verify your system meets the requirements:

### Check Node.js Version

```bash
node --version
# Should output: v20.x.x or higher
```

### Check NPM Version

```bash
npm --version
# Should output: 9.x.x or higher
```

### Check PostgreSQL Version

```bash
psql --version
# Should output: psql (PostgreSQL) 13.x or higher
```

### Check Available Disk Space

**Linux/macOS:**
```bash
df -h
```

**Windows:**
```bash
wmic logicaldisk get size,freespace,caption
```

## Next Steps

Once your system meets all requirements:

1. Proceed to the [Installation Guide](/docs/development/getting-started/installation-guide)
2. Set up your PostgreSQL database
3. Install EverShop using your preferred method

## Troubleshooting

### Common Issues

**Node.js version mismatch:**
- Use [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage multiple Node.js versions
- Switch to Node.js 20: `nvm install 20 && nvm use 20`

**PostgreSQL connection issues:**
- Verify PostgreSQL service is running: `systemctl status postgresql` (Linux)
- Check database connection settings in EverShop configuration
- Ensure firewall allows PostgreSQL connections

**Insufficient permissions:**
- On Linux/macOS, you may need to use `sudo` for global npm installations
- Consider using nvm to avoid permission issues

## Support

If you encounter issues with system requirements:

- Check our [GitHub Issues](https://github.com/evershopcommerce/evershop/issues)
- Join our [Discord Community](https://discord.gg/GSzt7dt7RM)
- Review the [Documentation](/docs/development/getting-started/installation-guide)
