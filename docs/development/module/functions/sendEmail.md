---
sidebar_position: 117
keywords:
- sendEmail
- email
- notifications
groups:
- email
sidebar_label: sendEmail
title: sendEmail
description: Send an email using the registered email service.
---

# sendEmail

Send an email using the registered email service. The template is compiled with Handlebars, and store information is automatically injected into the template data.

## Import

```typescript
import { sendEmail } from '@evershop/evershop/lib/mail/emailHelper';
```

## Syntax

```typescript
sendEmail(id: string, args: SendEmailArguments): Promise<void>

type SendEmailArguments = {
  from?: string;       // Sender (falls back to config)
  to: string;          // Recipient (required)
  subject: string;     // Subject (required)
  template: string;    // Handlebars template (required)
  body?: string;       // Pre-compiled HTML (skips template compilation)
  data: EmailData;     // Template data
  cc?: string[];       // CC recipients
};
```

### Parameters

**`id`** — Identifier for the email type (e.g., `'order_confirmation'`). Used by `emailArguments` processors to target specific emails.

**`args`** — Email arguments including recipient, subject, template, and data.

## Examples

```typescript
import { sendEmail } from '@evershop/evershop/lib/mail/emailHelper';

await sendEmail('order_confirmation', {
  to: 'customer@example.com',
  subject: 'Order #12345 Confirmed',
  template: '<h1>Thank you, {{customerName}}!</h1><p>Order: {{orderNumber}}</p>',
  data: {
    customerName: 'John',
    orderNumber: '12345'
  }
});
```

### Built-in Template Helpers

```handlebars
{{currency 49.99}}     <!-- $49.99 -->
{{date orderDate}}     <!-- Jan 15, 2024 -->
```

## Notes

- Throws if no email service is registered
- `from` falls back to `system.notification_emails.from` config
- `storeInfo` is automatically added to template data

## See Also

- [registerEmailService](/docs/development/module/functions/registerEmailService) — Register an email provider
- [Email System](/docs/development/knowledge-base/email-system) — Full email system guide
