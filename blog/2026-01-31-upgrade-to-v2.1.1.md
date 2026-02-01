---
slug: release-notes-v2-1-1
title: "Announcing Evershop v2.1.1: Digital Products, Shadcn UI, and Improved DX"
authors: [evershop]
image: /img/release-v2.1.1.svg
---

We are excited to announce the release of **Evershop v2.1.1**! This release brings highly requested features like reusable UI components based on Shadcn UI, support for digital products, and a significant upgrade to Tailwind CSS v4.

<!-- truncate -->

## Highlights

### 🎨 Shadcn UI & Tailwind CSS v4

We have completely revamped our UI foundation. We are now adopting **Shadcn UI** for our component library, providing accessible and customizable components that you can copy and paste into your apps.

Alongside this, we've updated dependencies to use **Tailwind CSS v4**, taking advantage of the latest performance improvements and features in the ecosystem. We also replaced `react-heroicons` with `lucide-react` for a more modern icon implementation.

### 📦 Digital Products Support

Selling non-physical goods just got easier. V2.1.1 introduces native support for **Digital Products**. You can now manage downloadable files, license keys, and other digital assets directly within Evershop.

### ⚡ Improved Developer Experience

We've streamlined the development environment: Evershop now runs with just two Webpack instances — one for the backend and one for the frontend—instead of multiple processes. This reduces memory usage and speeds up hot module replacement (HMR), resulting in a faster, smoother development workflow.

---

## Upgrade Guide

### How to Upgrade

To update your Evershop project to v2.1.1, run the standard update command:

```bash
npm update @evershop/evershop
```

### ⚠️ Breaking Changes & Migration

This release includes breaking changes, primarily due to the UI architecture shift.

#### 1. Component Removals

We have deprecated and removed several custom UI components in favor of standard Shadcn UI components. If your custom themes or extensions import the following, you will need to update them:

<table className="not-prose table-auto">
  <thead>
    <tr>
      <th>Removed Component</th>
      <th>Replacement</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`components/common/Button.tsx`</td>
      <td>Use Shadcn `Button`</td>
    </tr>
    <tr>
      <td>`components/common/modal/Modal.tsx`</td>
      <td>Use Shadcn `Dialog`</td>
    </tr>
    <tr>
      <td>`components/admin/Badge.tsx`</td>
      <td>Use Shadcn `Badge`</td>
    </tr>
    <tr>
      <td>`components/admin/Card.tsx`</td>
      <td>Use Shadcn `Card`</td>
    </tr>
  </tbody>
</table>
#### 2. Upgrade Tailwind CSS from v3 to v4

In previous versions, customizing the Tailwind configuration required creating a file named `frontstore.tailwind.js` in the theme folder.

Starting from v2.1.1 with Tailwind CSS v4, the customization process has changed:

- To customize Tailwind, you now overwrite the `Tailwind.tsx` component by running the following command:
  ```
  npm run theme:twizz
  ```
- This command generates a `tailwind.css` file in your theme folder, which you can edit to adjust your Tailwind 4 settings.

For example, you can update your `tailwind.css` as follows:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import "tw-animate-css";
@import "./shadcn.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-divider: var(--divider);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.325rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --divider: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

#### 2. Email Service Refactoring

The email service architecture has been simplified to use a single instance.

##### What Changed

- **Unified Email Service**: Previously, Evershop supported multiple email service instances, which could lead to configuration complexity and maintenance overhead. In v2.1.1, the architecture has been refactored to use a single, centralized email service instance for all transactional and notification emails.
- **Simplified Configuration**: Email provider configuration is now streamlined. Instead of configuring multiple services, you only need to specify your provider (e.g., Sendgrid, Resend) and credentials in one place.

##### Migration Steps

1. **Upgrade Extensions**:  
   Update your Sendgrid or Resend extension to the latest version:

   ```bash
   npm update @evershop/sendgrid
   ```

2. **Update Configuration**:
   - Update your email configuration to reflect the new unified service structure. Here’s an example configuration:

   ```javascript
    // config/config.json
    {
      ...,
      "system": {
        "notification_emails": {
          "from": "noreply@example.com",
          "order_confirmation": {
            "enabled": true,
            "templatePath": null, // In case you want to manage email template manually from source code. It should be the relative path from the project root. Missing this field or setting it to null will use the default template from EverShop
          },
          "customer_welcome": {
            "enabled": true,
            "templatePath": null,
          },
          "customer_password_reset": {
            "enabled": true,
            "templatePath": null,
          }
        }
      }
    }
   ```

3. **Test Email Delivery**:  
   After upgrading, send a test email (e.g., password reset or order confirmation) to verify that your configuration works as expected.
