---
sidebar_position: 10
keywords:
  - AWS deployment
  - EC2 hosting
  - RDS PostgreSQL
  - Node.js production deployment
sidebar_label: Deploy to AWS
title: Deploy EverShop to AWS
description: A comprehensive guide for deploying EverShop to Amazon Web Services using EC2 for application hosting and RDS for PostgreSQL database management.
---

# Deploy EverShop to AWS

This comprehensive guide walks you through the process of deploying EverShop to Amazon Web Services (AWS) using EC2 for application hosting and RDS for PostgreSQL database management. This approach provides a scalable, reliable production environment for your e-commerce platform.

:::tip
Before you go live, run down the [Production Checklist](./production-checklist) — it lists every environment variable EverShop reads at boot, the built-in per-IP rate limits, and what the build and start sequence actually does.
:::

## Prerequisites

Before beginning, ensure you have:

- An active AWS account (this guide uses free tier resources where possible)
- Basic familiarity with AWS console navigation
- SSH client for connecting to your EC2 instance

## EC2 Instance Setup

### Creating an EC2 Instance

First, we need to provision a virtual server to host the EverShop application:

:::info
If you're new to AWS, follow the [official EC2 getting started guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) for detailed instructions on creating your first instance.
:::

For optimal compatibility with EverShop, we recommend:

- **Operating System**: Ubuntu 20.04 LTS
- **Instance Type**: t2.micro for testing (free tier eligible) or t3.small/medium for production use
- **Storage**: At least 20GB of EBS storage
- **Security Group**: Configure to allow HTTP (port 80), HTTPS (port 443), and SSH (port 22)

### Installing Required Software

After creating and connecting to your EC2 instance via SSH, install the necessary software components:

#### 1. Install Node.js and NPM

EverShop requires Node.js version 20.x or higher and NPM version 9.x or higher:

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify the installation:

```bash
node -v  # Should show v20.x.x or higher
npm -v   # Should show 9.x.x or higher
```

#### 2. Install PM2 Process Manager

PM2 will ensure your EverShop application runs continuously and restarts automatically if the server reboots:

```bash
sudo npm install -g pm2
```

Verify the installation:

```bash
pm2 -v
```

Configure PM2 to start automatically on server boot:

```bash
pm2 startup systemd
```

Follow any additional instructions provided by the command.

#### 3. Install and Configure Nginx

Nginx will act as a reverse proxy, directing traffic to your Node.js application:

```bash
sudo apt install -y nginx
```

Create a configuration file for your EverShop application:

```bash
sudo nano /etc/nginx/sites-available/evershop.conf
```

Add the following configuration, replacing `yourdomain.com` with your actual domain name (or use the EC2 public DNS temporarily):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Handle large file uploads
    client_max_body_size 50M;
}
```

Enable the configuration and disable the default site:

```bash
sudo ln -s /etc/nginx/sites-available/evershop.conf /etc/nginx/sites-enabled/
sudo unlink /etc/nginx/sites-enabled/default
```

Test the configuration and restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Database Setup

### Creating an RDS PostgreSQL Instance

EverShop requires PostgreSQL 13 or higher. Let's create a managed database instance:

:::info
For detailed instructions on creating an RDS instance, refer to the [AWS RDS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.html).
:::

1. Navigate to the RDS dashboard in the AWS console
2. Click "Create database"
3. Select "Standard create" and choose PostgreSQL
4. Select version 13 or higher
5. Choose the appropriate instance size (db.t3.micro is free tier eligible)
6. Configure storage, connectivity, and security settings
7. Set your master username and password
8. Complete the creation process

### Configuring Security Groups

For your EC2 instance to access the RDS database:

1. Identify the security group of your RDS instance
2. Edit its inbound rules to allow PostgreSQL traffic (port 5432) from your EC2 instance's security group or IP address

:::info
For detailed instructions on configuring security groups, see the [AWS RDS VPC documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html).
:::

### Creating the Database and User

Connect to your RDS instance using a PostgreSQL client like pgAdmin or psql:

```bash
psql -h your-rds-endpoint.rds.amazonaws.com -U master_username -d postgres
```

Create a dedicated database and user for EverShop:

```sql
CREATE DATABASE evershop;
CREATE USER evershop WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE evershop TO evershop;
```

## Source Code Deployment

### Setting Up Your Repository

For streamlined deployment:

1. Fork the [EverShop project template](https://github.com/evershopcommerce/project-template) to your GitHub account
2. Add any custom themes or extensions to your forked repository

### Creating a Deployment Script

Create a deployment script on your EC2 instance to automate the process:

```bash
sudo mkdir -p /var/www/evershop
cd /var/www/evershop
sudo nano deploy.sh
```

Add the following script, replacing the placeholder values with your actual GitHub information:

```bash
#!/bin/bash

# GitHub authentication and repository details
TOKEN="your_github_personal_access_token"
REPO_OWNER="your_github_username"
REPO_NAME="your_repository_name"
BRANCH="main"

# Check if tar is installed
echo "Checking if tar is installed..."
if ! command -v tar &> /dev/null
then
    echo "tar is not installed, installing now..."
    sudo apt-get install tar -y
fi

# Set deployment directories
CURRENT_BUILD="current"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
NEW_BUILD="build_$TIMESTAMP"

# Download source from GitHub
echo "Downloading source from GitHub..."
wget --header="Authorization: token $TOKEN" -O $NEW_BUILD.tar.gz https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/tarball/${BRANCH}

# Extract source code
echo "Extracting source to $NEW_BUILD..."
mkdir $NEW_BUILD
tar -xf $NEW_BUILD.tar.gz -C $NEW_BUILD --strip-components 1
rm $NEW_BUILD.tar.gz

# Carry the runtime configuration into the new build BEFORE building.
# `evershop build` reads the .env file, so it has to be in place first.
if [ -f "$CURRENT_BUILD/.env" ]; then
  echo "Copying .env into the new build..."
  cp $CURRENT_BUILD/.env $NEW_BUILD/
fi

if [ -d "$CURRENT_BUILD/config" ]; then
  cp -R $CURRENT_BUILD/config $NEW_BUILD/
fi

# Install dependencies
echo "Installing npm dependencies..."
cd $NEW_BUILD && npm install --production

# Build the application
echo "Building the application..."
npm run build
cd ..

# Backup current build
if [ -d "$CURRENT_BUILD" ]; then
  echo "Backing up current build..."
  if [ -d "previous-build" ]; then
    rm -rf previous-build
  fi
  mv $CURRENT_BUILD previous-build
fi

# Deploy new build
echo "Deploying new build..."
mv $NEW_BUILD $CURRENT_BUILD

# Copy uploaded media forward from the previous build
if [ -d "previous-build" ]; then
  echo "Copying media files..."
  if [ -d "previous-build/media" ]; then
    cp -R previous-build/media $CURRENT_BUILD/
  else
    mkdir -p $CURRENT_BUILD/media
  fi
fi

# Set permissions
echo "Setting permissions..."
chmod -R 755 $CURRENT_BUILD
chmod -R 777 $CURRENT_BUILD/media

# Re-restrict the environment file — the recursive chmod above widened it.
if [ -f "$CURRENT_BUILD/.env" ]; then
  chmod 600 $CURRENT_BUILD/.env
fi

# Restart application with PM2
echo "Restarting application..."
cd $CURRENT_BUILD
pm2 stop evershop 2>/dev/null || true
pm2 start npm --name "evershop" -- start

echo "Deployment completed successfully!"
```

Make the script executable:

```bash
sudo chmod +x deploy.sh
```

### Creating Your Environment File

EverShop reads its database credentials from **environment variables**, loaded from a `.env` file in the project root. This is the same file the `evershop install` setup wizard writes on a local install — on a server you create it by hand.

Create it in the directory the deployment script treats as the live build:

```bash
sudo mkdir -p /var/www/evershop/current
sudo nano /var/www/evershop/current/.env
```

Add your database connection and the production settings:

```bash title=".env"
DB_HOST="your-rds-endpoint.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="evershop"
DB_USER="evershop"
DB_PASSWORD="secure_password"
DB_SSLMODE="require"

PORT="3000"

EVERSHOP_HOME_URL="https://yourdomain.com"
TRUST_PROXY_HOPS="1"
```

Lock the file down — it holds your database password:

```bash
sudo chmod 600 /var/www/evershop/current/.env
```

:::info
RDS instances present a certificate signed by the Amazon RDS CA. Use `DB_SSLMODE="require"` for an encrypted connection. If you want full certificate verification, download the RDS root certificate bundle and point `DB_SSLROOTCERT` at it; use `DB_SSLMODE="no-verify"` only as a temporary fallback.
:::

:::caution
The `config/<env>.json` files are still read, but the **database connection is not configured there**. Putting a `system.database` block in `config/default.json` has no effect — EverShop reads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` and `DB_SSLMODE` from the environment. Use `config/` for non-secret deployment settings such as the active theme and extension wiring.
:::

### Setting the Public Base URL

`EVERSHOP_HOME_URL` overrides the `shop.homeUrl` configuration key and is the recommended way to set your production base URL.

```bash
EVERSHOP_HOME_URL="https://yourdomain.com"
```

Everything EverShop emits as an absolute URL depends on it: links in transactional emails, canonical tags, `hreflang` alternates, and the `<loc>` entries plus the `Sitemap:` line in `robots.txt`. If it is left unset, EverShop falls back to `shop.homeUrl` and then to `http://localhost:<PORT>` — which means customer emails go out pointing at localhost.

:::danger A malformed value stops the server from booting
`EVERSHOP_HOME_URL` is validated during startup. It must be an **absolute** `http` or `https` URL. A value like `yourdomain.com` (no scheme), or one using another protocol, throws during bootstrap and the process exits before it listens — PM2 will show the app repeatedly restarting.

Set the full origin with a scheme and no trailing path. Leaving the variable unset is fine; setting it to something invalid is fatal.
:::

:::tip
Set it to your HTTPS domain once Certbot has issued your certificate (see [Securing Your Deployment](#securing-your-deployment) below). If you set it to `http://` and later switch to HTTPS, remember to update it — otherwise emails keep linking to the insecure URL.
:::

### Setting the Proxy Hop Count

Nginx sits in front of the Node process and forwards the client address in `X-Forwarded-For` (that is what the `proxy_set_header X-Forwarded-For` line in the Nginx config above does). `TRUST_PROXY_HOPS` tells EverShop how many of those proxies to trust. It drives Express's `trust proxy` setting, which determines `request.ip` — and `request.ip` is what the built-in rate limiter buckets on.

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
      <td>The Node process is directly internet-facing with no proxy at all.</td>
      <td>Wrong for this guide — with Nginx in front, every request would be attributed to <code>127.0.0.1</code>.</td>
    </tr>
    <tr>
      <td><code>1</code> (default)</td>
      <td>One proxy: the Nginx reverse proxy on the EC2 instance. This is the setup in this guide.</td>
      <td>—</td>
    </tr>
    <tr>
      <td><code>2</code> or more</td>
      <td>A proxy chain, e.g. an Application Load Balancer or CloudFront in front of Nginx.</td>
      <td>Too low and every visitor collapses into one bucket, so a moderate traffic spike triggers mass <code>429</code> responses for everyone. Too high and a client can spoof <code>X-Forwarded-For</code> to present a fresh IP per request and bypass the limits entirely.</td>
    </tr>
  </tbody>
</table>

An unset, empty or non-numeric value falls back to `1`. Count the hops that actually terminate and re-forward the connection, and set the variable to that number. If you put an ALB or CloudFront in front of this instance, raise the value to `2`.

### Running the Deployment

Execute the deployment script:

```bash
cd /var/www/evershop
sudo ./deploy.sh
```

After deployment completes, your EverShop application should be running. You can access it using your EC2 instance's public DNS or your custom domain (if configured).

The admin panel is available at `https://yourdomain.com/admin` or `http://your-ec2-public-dns/admin`.

## Securing Your Deployment

### Installing SSL Certificate with Let's Encrypt

For production environments, secure your site with HTTPS:

1. Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. Obtain and install a certificate:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. Follow the interactive prompts to complete the process.

Certbot will automatically modify your Nginx configuration to redirect HTTP traffic to HTTPS.

### Setting Up Automatic Certificate Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

```bash
sudo systemctl status certbot.timer
```

This command should show that the automatic renewal service is active.

## Maintenance and Monitoring

### Setting Up Log Rotation

Configure log rotation to manage your application logs:

```bash
sudo nano /etc/logrotate.d/pm2
```

Add the following configuration:

```
/var/www/evershop/.pm2/logs/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 0640 ubuntu ubuntu
}
```

### Monitoring Your Application

Use PM2 to monitor your application:

```bash
pm2 monit
```

For more advanced monitoring, consider integrating with AWS CloudWatch.

## Conclusion

You've successfully deployed EverShop to AWS using EC2 for hosting the application and RDS for managing the PostgreSQL database. This setup provides a robust, scalable foundation for your e-commerce platform.

For production environments, consider implementing additional best practices:

- Setting up automatic backups for your RDS instance
- Implementing AWS CloudWatch for comprehensive monitoring
- Configuring a CDN like CloudFront for improved content delivery
- Setting up an auto-scaling group for handling variable traffic loads

By following this guide, you've created a deployment that balances performance, security, and maintainability for your EverShop store.
