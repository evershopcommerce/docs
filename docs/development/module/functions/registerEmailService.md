---
sidebar_position: 116
keywords:
- registerEmailService
- email
- email provider
groups:
- email
sidebar_label: registerEmailService
title: registerEmailService
description: Register a custom email service provider for sending emails.
---

# registerEmailService

Register a custom email service provider. EverShop does not send emails by default — you must register an email service in your extension's bootstrap.

## Import

```typescript
import { registerEmailService } from '@evershop/evershop/lib/mail/emailHelper';
```

## Syntax

```typescript
registerEmailService(service: EmailService): void

interface EmailService {
  sendEmail: (args: SendEmailArguments) => Promise<void>;
}
```

### Parameters

**`service`** — An object implementing the `EmailService` interface with a `sendEmail` method.

The `sendEmail` method receives:
- `to` (string) — Recipient email
- `from` (string) — Sender email
- `subject` (string) — Email subject
- `body` (string) — Compiled HTML body
- `template` (string) — Raw Handlebars template
- `data` (EmailData) — Template data
- `cc` (string[], optional) — CC recipients

## Examples

```typescript title="extensions/resend-email/src/bootstrap.ts"
import { registerEmailService } from '@evershop/evershop/lib/mail/emailHelper';
import { Resend } from 'resend';

export default () => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  registerEmailService({
    sendEmail: async (args) => {
      await resend.emails.send({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.body
      });
    }
  });
};
```

## See Also

- [sendEmail](/docs/development/module/functions/sendEmail) — Send an email
- [Email System](/docs/development/knowledge-base/email-system) — Full email system guide
