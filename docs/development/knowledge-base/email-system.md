---
sidebar_position: 41
keywords:
  - email
  - email service
  - email template
  - notifications
sidebar_label: Email System
title: Email System
description: Learn how EverShop sends emails, how to register a custom email service provider, and how to customize email templates and data.
---

# Email System

EverShop provides a pluggable email system that separates the email sending logic from the email content. This allows you to use any email provider (SendGrid, Resend, Amazon SES, etc.) while keeping the same email templates and triggers.

## How It Works

The email system has three layers:

1. **Email Service** — The provider that actually sends emails (e.g., Resend, SMTP).
2. **Email Templates** — Handlebars templates that define the email body.
3. **Email Triggers** — Code that calls `sendEmail()` when something happens (e.g., order placed).

## Registering an Email Service

By default, EverShop does not send emails — you must register an email service. This is typically done in an extension's `bootstrap.ts`:

```ts title="extensions/my-email-provider/src/bootstrap.ts"
import { registerEmailService } from '@evershop/evershop/lib/mail/emailHelper';

export default () => {
  registerEmailService({
    sendEmail: async (args) => {
      // args.to      — Recipient email
      // args.from    — Sender email (from config if not set)
      // args.subject — Email subject
      // args.body    — Compiled HTML body
      // args.cc      — Optional CC recipients (array)

      await myProvider.send({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.body
      });
    }
  });
};
```

### The EmailService Interface

Your email service must implement this interface:

```typescript
interface EmailService {
  sendEmail: (args: SendEmailArguments) => Promise<void>;
}

type SendEmailArguments = {
  from?: string;       // Sender email (falls back to config)
  to: string;          // Recipient email (required)
  subject: string;     // Email subject (required)
  body?: string;       // Pre-compiled HTML body
  template: string;    // Handlebars template string
  data: EmailData;     // Template data
  cc?: string[];       // CC recipients
};
```

## Sending Emails

Use the `sendEmail()` function to send an email from anywhere in your code:

```ts
import { sendEmail } from '@evershop/evershop/lib/mail/emailHelper';

await sendEmail('order_confirmation', {
  to: customer.email,
  subject: 'Your order has been placed',
  template: '<h1>Thank you, {{customerName}}!</h1><p>Order #{{orderNumber}}</p>',
  data: {
    customerName: 'John',
    orderNumber: '12345'
  }
});
```

The first argument (`id`) identifies the email type. This is used by processors to customize specific email types.

### Template Syntax

Email templates use [Handlebars](https://handlebarsjs.com/) syntax. EverShop provides two built-in helpers:

```handlebars
<!-- Format a number as currency -->
{{currency 49.99}}
<!-- Output: $49.99 (based on shop.currency config) -->

<!-- Format a date -->
{{date orderDate}}
<!-- Output: Jan 15, 2024 (based on shop.language config) -->
```

### Automatic Store Information

EverShop automatically adds `storeInfo` to every email's template data:

```handlebars
<p>From: {{storeInfo.storeName}}</p>
<p>Email: {{storeInfo.storeEmail}}</p>
<p>Phone: {{storeInfo.phone}}</p>
<img src="{{storeInfo.logo.src}}" alt="{{storeInfo.logo.alt}}" />
<p>{{storeInfo.address.street}}, {{storeInfo.address.city}}</p>
```

This data is pulled from the admin settings (store name, email, phone, address, logo).

## Customizing Emails with Processors

Extensions can modify email arguments or template data using processors:

### Modify Email Arguments

```ts title="extensions/my-ext/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  // Add a CC recipient to all order confirmation emails
  addProcessor('emailArguments', (args) => {
    if (this.id === 'order_confirmation') {
      args.cc = [...(args.cc || []), 'manager@store.com'];
    }
    return args;
  });
};
```

### Modify Template Data

```ts title="extensions/my-ext/src/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  // Add custom data to all email templates
  addProcessor('emailTemplateData', (data) => {
    data.supportEmail = 'support@store.com';
    data.returnPolicy = 'https://store.com/returns';
    return data;
  });
};
```

## Default Sender Address

If no `from` address is provided, EverShop falls back to the `system.notification_emails.from` config value:

```json title="config/default.json"
{
  "system": {
    "notification_emails": {
      "from": "noreply@mystore.com"
    }
  }
}
```

## See Also

- [Registry and Processors](/docs/development/knowledge-base/registry-and-processors) — How processors work
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — Trigger emails from events
- [Configuration Guide](/docs/development/knowledge-base/configuration-guide) — Email-related config options

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
