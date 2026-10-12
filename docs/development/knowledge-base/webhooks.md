---
sidebar_position: 67
keywords:
  - webhook
  - webhooks
  - outbound webhook
  - event notification
  - HMAC signature
  - X-EverShop-Signature
  - integration
sidebar_label: Webhooks
title: Webhooks
description: Send EverShop store events (orders, shipments, products, categories, customers) to your own URLs. Covers admin setup, the request format, signature verification, automatic retries, the delivery log, security rules, and how extensions add events.
---

# Webhooks

A webhook tells another system that something happened in your store. When an order is placed, a shipment is created or a product is updated, EverShop sends an HTTP `POST` request with a JSON body to a URL you choose, so your ERP, accounting tool, Slack bot or automation platform can react right away.

You set webhooks up in the admin panel, with no code. Each request is signed, failed requests are retried automatically, and every delivery is logged so you can see what was sent and what happened.

## What it does

- Sends **21 store events** to up to **10 URLs**. Each webhook chooses which events it wants.
- Signs every request with an **HMAC-SHA256** signature so your server can verify that it came from your store.
- **Retries** failed deliveries up to 5 times, then lets an admin retry by hand.
- Keeps a **delivery log** per webhook, with the payload, attempts and result of each delivery.
- Only talks to **public HTTPS** addresses by default, so a webhook cannot be used to reach your internal network.
- Is extensible: extensions can add their own events to the list.

## Set up a webhook

1. Go to **Settings → Webhooks** in the admin panel.
2. Click **New webhook**.
3. Fill in the form:
   - **Name**: a label for you, for example `Order sync`.
   - **URL**: where EverShop sends the requests. It must start with `https://`.
   - **Status**: enabled or disabled.
   - **Events**: tick the events to send. The list is grouped (Orders, Shipments, Products, Categories, Customers); open a group to see its events. A group shows how many of its events are selected.
4. Click **Save**. You are taken to the edit page.
5. On the edit page, copy the **Signing secret**. Your server needs it to verify requests.
6. Click **Send test event** to check the URL and the secret. EverShop sends a `webhook_ping` event right away and shows the result.

The edit page also lists the webhook's **Deliveries**, newest first. You can filter by status, view the exact JSON that was sent, and retry failed deliveries.

:::info
You can create at most **10 webhooks**. The grid shows each webhook's name, URL, number of events, status, and how many deliveries are pending or failed.
:::

:::warning
Order, shipment and customer events contain personal data such as names, email addresses and addresses. Only send them to systems that are allowed to receive that data.
:::

## What EverShop sends

Every delivery is an HTTP `POST` with a JSON body and these headers:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Header</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>Content-Type</code></td><td><code>application/json</code></td></tr>
    <tr><td><code>User-Agent</code></td><td><code>EverShop-Webhook/1.0</code></td></tr>
    <tr><td><code>X-EverShop-Topic</code></td><td>The event name, for example <code>order_placed</code>.</td></tr>
    <tr><td><code>X-EverShop-Delivery</code></td><td>A unique ID for this delivery. It is the same on every retry, so use it to detect duplicates.</td></tr>
    <tr><td><code>X-EverShop-Signature</code></td><td>The signature, in the form <code>t=1791424730,v1=f7a4b5f9...</code>. See <a href="#verify-the-signature">Verify the signature</a>.</td></tr>
  </tbody>
</table>

The body is an envelope around the event data:

```json title="Request body"
{
  "id": "6f1c0a9e-3f0b-4e55-9a57-0d9a6a3c1e10",
  "event_id": "b7d5c3a4-81e2-4d0b-a3f6-5c2d9e7f4a18",
  "topic": "order_status_updated",
  "created_at": "2026-10-08T09:30:00.000Z",
  "data": {
    "orderId": 2070,
    "before": "processing",
    "after": "completed"
  }
}
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>id</code></td><td>The delivery ID. Same value as the <code>X-EverShop-Delivery</code> header, and the same on every retry.</td></tr>
    <tr><td><code>event_id</code></td><td>The ID of the underlying EverShop event. <code>null</code> for a test event.</td></tr>
    <tr><td><code>topic</code></td><td>The event name.</td></tr>
    <tr><td><code>created_at</code></td><td>When the delivery was queued (ISO 8601, UTC). Not the time of the attempt.</td></tr>
    <tr><td><code>data</code></td><td>The event data. The shape depends on the event; see <a href="#available-events">Available events</a>.</td></tr>
  </tbody>
</table>

The body of a retry is exactly the same as the first attempt. Only the signature timestamp changes.

## Verify the signature

Anyone who knows your URL could send a fake request to it. The signature lets you prove a request really came from your store.

`X-EverShop-Signature` looks like `t=1791424730,v1=f7a4b5f9...`:

- `t` is the Unix time (in seconds) when the request was signed.
- `v1` is the hex-encoded HMAC-SHA256 of the string `<t>.<raw body>`, using the webhook's signing secret as the key.

To verify a request:

1. Read the **raw body** exactly as received. Do not parse and re-serialize it, because any change in whitespace or key order changes the signature.
2. Split the header into `t` and `v1`.
3. Compute `HMAC-SHA256(secret, t + "." + rawBody)` and compare it with `v1` in constant time.
4. Reject the request if `t` is too old (five minutes is a good limit). This stops someone from replaying a request they captured.

```ts title="Verify a webhook in Node.js (Express)"
import crypto from 'crypto';
import express from 'express';

const SECRET = process.env.EVERSHOP_WEBHOOK_SECRET as string;
const TOLERANCE_SECONDS = 300;

function verifyEverShopSignature(
  secret: string,
  header: string | undefined,
  rawBody: string
): boolean {
  const parts = Object.fromEntries(
    (header ?? '').split(',').map((part) => part.split('='))
  );
  const timestamp = Number(parts.t);
  const received = parts.v1 ?? '';
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const app = express();

// express.raw keeps the body as the bytes that were signed.
app.post(
  '/webhooks/evershop',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const rawBody = req.body.toString('utf8');
    if (
      !verifyEverShopSignature(
        SECRET,
        req.header('X-EverShop-Signature'),
        rawBody
      )
    ) {
      return res.sendStatus(400);
    }

    const deliveryId = req.header('X-EverShop-Delivery');
    const event = JSON.parse(rawBody);
    // 1. If deliveryId was already processed, return 200 and stop.
    // 2. Otherwise save it, hand the work to a queue, and respond.
    res.sendStatus(200);
  }
);
```

The algorithm is plain HMAC-SHA256, so the same check works in any language.

## Respond quickly, expect duplicates

How your server answers decides what happens next:

- **Reply with a `2xx` status within 10 seconds.** That counts as delivered. The response body is ignored and never stored.
- **Anything else counts as a failure**: a `4xx` or `5xx` status, a timeout, a connection or DNS error. Note that `4xx` responses are **retried too**, not treated as final.
- **Redirects are not followed.** A `301` or `302` answer is a failure. Put the final URL in the webhook.
- Do slow work after you respond. Save the delivery, answer `200`, then process it from a queue.

Once a delivery is queued, EverShop sends it **at least once**, not exactly once. In rare cases, for example when the server restarts in the middle of a request, the same delivery can arrive twice. Store the `X-EverShop-Delivery` value and ignore a delivery you have already handled.

Events are also **not ordered**. Two events that happen close together can arrive in either order, and a retried delivery arrives later than newer ones. If order matters, use a timestamp in the event data, such as `updated_at`, to decide which version is newer.

## Retries

If an attempt fails, the delivery is retried automatically. A background job checks for due retries every minute, so each retry can be up to a minute later than the times below.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Attempt</th>
      <th>When</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Immediately when the event happens</td></tr>
    <tr><td>2</td><td>1 minute after attempt 1 failed</td></tr>
    <tr><td>3</td><td>5 minutes after attempt 2 failed</td></tr>
    <tr><td>4</td><td>30 minutes after attempt 3 failed</td></tr>
    <tr><td>5</td><td>2 hours after attempt 4 failed</td></tr>
  </tbody>
</table>

After the fifth failed attempt the delivery is marked **Failed**. Open the webhook, find the delivery and click **Retry** to give it another full round of 5 attempts. Retry is only available for failed deliveries of an **enabled** webhook.

If you **disable** a webhook, its pending deliveries are canceled for good (a canceled delivery cannot be retried), and events that happen while it is disabled are not queued. If your server is only down for a while, leave the webhook enabled instead: failed deliveries are kept and can be retried once the server is back.

## Delivery log

Each delivery is stored with its payload, so the edit page of a webhook doubles as a log.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Status</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Pending</strong></td><td>Waiting to be sent, or waiting for its next retry. The row shows the attempt count and the next try time.</td></tr>
    <tr><td><strong>Sending</strong></td><td>An attempt is in progress.</td></tr>
    <tr><td><strong>Delivered</strong></td><td>Your server answered with a 2xx status.</td></tr>
    <tr><td><strong>Failed</strong></td><td>All 5 attempts failed. The last HTTP status or error is shown. Can be retried.</td></tr>
    <tr><td><strong>Canceled</strong></td><td>The webhook was disabled before the delivery was sent.</td></tr>
  </tbody>
</table>

How long entries are kept:

- **Delivered** and **canceled** deliveries: the newest 100 per webhook. Change the number under **Settings → Webhooks → Delivery log** (between 10 and 1000).
- **Failed** deliveries: 30 days, or until you retry them.
- **Pending** and sending deliveries are never deleted, because they are waiting to be sent.

Deleting a webhook deletes its deliveries too.

:::info
Stored payloads contain the same personal data that was sent. They are removed by the rules above, so choose a log size that fits your privacy policy.
:::

## Available events

These are the events an admin can choose. Each sends the same data as the matching event in [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers), which shows example payloads.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Group</th>
      <th>Event</th>
      <th>Sent when / data</th>
    </tr>
  </thead>
  <tbody>
    <tr><td rowSpan={5}>Orders</td><td><code>order_placed</code></td><td>An order is placed: payment succeeded, or the payment method (such as Cash on Delivery) does not need it up front. Use this for "new order" notifications. Sends the order.</td></tr>
    <tr><td><code>order_created</code></td><td>An order record is created, whatever its payment state. For online payments this can happen before <code>order_placed</code>. Sends the order.</td></tr>
    <tr><td><code>order_status_updated</code></td><td>An order's status changes. Sends the order ID and the previous and new status.</td></tr>
    <tr><td><code>order_canceled</code></td><td>An order is canceled. Sends the order ID and the reason, if one was given.</td></tr>
    <tr><td><code>order_refunded</code></td><td>An order is refunded, fully or partly. Sends the order ID, amount, currency, whether it is a full refund, the transaction ID and the payment method.</td></tr>
    <tr><td rowSpan={5}>Shipments</td><td><code>shipment_created</code></td><td>A shipment is created. Sends the shipment ID, the order ID and whether the customer should be notified.</td></tr>
    <tr><td><code>shipment_status_changed</code></td><td>A shipment's status changes. Sends the shipment ID, order ID, previous and new status, and the phase.</td></tr>
    <tr><td><code>shipment_delivered</code></td><td>A shipment reaches the delivered phase. Sends the shipment ID and the order ID.</td></tr>
    <tr><td><code>shipment_label_created</code></td><td>A carrier label is purchased. Sends the shipment ID, order ID, label URL (can be empty) and tracking number.</td></tr>
    <tr><td><code>shipment_label_voided</code></td><td>An admin voids a shipping label. Sends the shipment ID, order ID and tracking number.</td></tr>
    <tr><td rowSpan={4}>Products</td><td><code>product_created</code></td><td>A product is created. Sends the product.</td></tr>
    <tr><td><code>product_updated</code></td><td>A product is updated. Sends the product.</td></tr>
    <tr><td><code>product_deleted</code></td><td>A product is deleted. Sends the deleted product.</td></tr>
    <tr><td><code>inventory_updated</code></td><td>A product's inventory changes. Sends the inventory before and after. This event also fires when a product is saved without a stock change, so compare <code>old</code> and <code>new</code>.</td></tr>
    <tr><td rowSpan={3}>Categories</td><td><code>category_created</code></td><td>A category is created. Sends the category.</td></tr>
    <tr><td><code>category_updated</code></td><td>A category is updated. Sends the category.</td></tr>
    <tr><td><code>category_deleted</code></td><td>A category is deleted. Sends the deleted category.</td></tr>
    <tr><td rowSpan={4}>Customers</td><td><code>customer_created</code></td><td>A customer account is created, whatever its status. Sends the customer.</td></tr>
    <tr><td><code>customer_registered</code></td><td>A customer account is created and active. Sends the customer.</td></tr>
    <tr><td><code>customer_updated</code></td><td>A customer account is updated. Sends the customer.</td></tr>
    <tr><td><code>customer_deleted</code></td><td>A customer account is deleted. Sends the deleted customer.</td></tr>
  </tbody>
</table>

Customer payloads never include the password. EverShop removes any field named `password` from every payload before it is stored or sent.

### The test event

**Send test event** sends a `webhook_ping` event:

```json title="Test event body"
{
  "id": "0b3f8f1e-2c64-4b8a-9a0e-7d1d6a4c5e22",
  "event_id": null,
  "topic": "webhook_ping",
  "created_at": "2026-10-08T09:30:00.000Z",
  "data": {
    "message": "Test event from EverShop",
    "webhook_uuid": "3c9a6a52-1f0d-4d3e-8c55-2b7e1a9d4f60"
  }
}
```

It ignores the event selection, works even if the webhook is disabled, is **not** retried, and appears in the delivery list like any other delivery. The admin waits for the result, so the request can take up to 10 seconds.

## Security

**HTTPS only.** A webhook URL must start with `https://` and must not contain a username or password.

**Public addresses only.** EverShop refuses to send a webhook to a private or reserved address: loopback (`127.0.0.0/8`, `::1`), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`, which includes the `169.254.169.254` cloud metadata address) and other reserved ranges, as well as `localhost`. This stops a webhook from being used to probe your internal network.

The check is made when the request is sent, on the address that is actually connected to, not only when you save the URL. A hostname that later resolves to an internal address is blocked as well. A blocked delivery fails with `Blocked: the URL points to a private or reserved address`.

**Local development and private networks.** To send webhooks to a service on your own network (a self-hosted n8n, an ERP, or `http://localhost` while you develop), turn the restriction off in your configuration. It is a server setting on purpose, not an admin panel option:

```json title="config/local.json"
{
  "system": {
    "webhook": {
      "allowPrivateNetworks": true
    }
  }
}
```

With it on, `http://` URLs and private addresses are accepted. Leave it off in production unless you need it.

**The signing secret.** EverShop generates the secret (`whsec_` followed by random characters) when you create the webhook. You cannot choose it. Click **Regenerate** on the edit page to replace it; the old secret stops working immediately, so update your server first or accept that deliveries fail until you do. Deliveries that are already queued are signed with the new secret.

## Add your own events

Developers can add events to the list in the admin panel. The event must already be emitted with [`emit`](/docs/development/knowledge-base/events-and-subscribers#emitting-events). Register it in your extension's `bootstrap.ts`:

```ts title="extensions/my-extension/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

type WebhookTopic = {
  name: string;
  label?: string;
  description?: string;
  group?: string;
};

export default () => {
  addProcessor('webhookTopics', (topics: WebhookTopic[]) => [
    ...topics,
    {
      name: 'my_custom_event',
      label: 'My custom event',
      description: 'Sent when ... Sends the ...',
      group: 'My extension'
    }
  ]);
};
```

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td>The event name, exactly as passed to <code>emit</code>. Required.</td></tr>
    <tr><td><code>label</code></td><td>The name shown to the admin. Defaults to <code>name</code>.</td></tr>
    <tr><td><code>description</code></td><td>One or two sentences saying when it is sent and what data it carries. Say what the receiver gets, because some events carry only IDs.</td></tr>
    <tr><td><code>group</code></td><td>The section of the events list. Defaults to <code>Other</code>.</td></tr>
  </tbody>
</table>

Registering a name that already exists replaces that entry, so an extension can reword a core event. Labels, descriptions and groups are English text that is translated at display time; add them to a [translation](/docs/development/knowledge-base/translation) file to translate them.

To strip more fields from every webhook payload, register extra field names. A key with that name is removed at any depth:

```ts title="extensions/my-extension/bootstrap.ts"
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  addProcessor('webhookRedactedFields', (fields: string[]) => [...fields, 'ssn']);
};
```

:::warning
Both lists must be fixed lists that do not depend on the event being processed. Do not compute them from event data.
:::

### Send every event to your own code

Webhooks are built on a general feature of the event system: a subscriber folder named `_all` runs for **every** event. If you need the same data inside your own code instead of over HTTP, see [Subscribing to every event](/docs/development/knowledge-base/events-and-subscribers#subscribe-to-every-event-_all).

## REST API

The admin panel uses these endpoints, and you can call them too. They are admin-only; see [Authentication](/docs/api/authentication). `:id` is the UUID of the webhook (or of the delivery).

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Path</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>POST</code></td><td><code>/api/webhooks</code></td><td>Create a webhook. Returns it, including the generated <code>secret</code>.</td></tr>
    <tr><td><code>PATCH</code></td><td><code>/api/webhooks/:id</code></td><td>Update any of <code>name</code>, <code>url</code>, <code>topics</code>, <code>enabled</code>. Send <code>"regenerateSecret": true</code> to replace the secret. Disabling cancels pending deliveries.</td></tr>
    <tr><td><code>DELETE</code></td><td><code>/api/webhooks/:id</code></td><td>Delete a webhook and its deliveries.</td></tr>
    <tr><td><code>POST</code></td><td><code>/api/webhooks/:id/test</code></td><td>Send a <code>webhook_ping</code> now. Returns <code>deliveryUuid</code>, <code>status</code>, <code>statusCode</code> and <code>error</code>.</td></tr>
    <tr><td><code>POST</code></td><td><code>/api/webhook-deliveries/:id/retry</code></td><td>Queue a failed delivery for another round of attempts. It is sent within a minute.</td></tr>
  </tbody>
</table>

```json title="POST /api/webhooks"
{
  "name": "Order sync",
  "url": "https://example.com/webhooks/evershop",
  "topics": ["order_placed", "order_status_updated"],
  "enabled": true
}
```

Validation errors answer `400` with `{ "error": { "status": 400, "message": "..." } }`, and an unknown webhook or delivery answers `404`.

## Troubleshooting

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>What you see</th>
      <th>Why, and what to do</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>"Webhook URL must start with https://"</td><td>Plain <code>http://</code> is refused by default. Use HTTPS, or set <code>system.webhook.allowPrivateNetworks</code> for local development.</td></tr>
    <tr><td>"Webhook URL points to a private or reserved address"</td><td>The host is <code>localhost</code> or a private IP. Use a public address, or set <code>system.webhook.allowPrivateNetworks</code>.</td></tr>
    <tr><td>Delivery fails with "Blocked: the URL points to a private or reserved address"</td><td>The hostname resolves to a private address. Same fix as above.</td></tr>
    <tr><td>Nothing arrives after creating a webhook</td><td>Check the webhook is <strong>Enabled</strong> and the event is ticked. A new or changed webhook can take up to 10 seconds to take effect. Use <strong>Send test event</strong> to isolate the URL from the events.</td></tr>
    <tr><td>Deliveries stay <strong>Pending</strong></td><td>Retries are sent by a background job that runs every minute in the cron process. Make sure the store was started with <code>npm run start</code> (or <code>npm run dev</code>), which starts it.</td></tr>
    <tr><td>Failed with "Timed out after 10 seconds"</td><td>Your server did not answer in time. Respond first, process afterwards.</td></tr>
    <tr><td>Failed with an HTTP 3xx</td><td>Redirects are not followed. Use the final URL.</td></tr>
    <tr><td>Failed with an HTTP 4xx</td><td>Your server rejected the request, often a signature check. Compare the secret, and verify the <strong>raw</strong> body. 4xx responses are retried, so fix the server and use <strong>Retry</strong>.</td></tr>
    <tr><td>The same delivery arrived twice</td><td>Delivery is at-least-once. Ignore a repeated <code>X-EverShop-Delivery</code> value.</td></tr>
    <tr><td>Retry button is missing</td><td>Only <strong>Failed</strong> deliveries can be retried, and only while the webhook is enabled.</td></tr>
    <tr><td>You added an event to your extension but it does not appear</td><td>Register it in <code>bootstrap.ts</code> (see <a href="#add-your-own-events">Add your own events</a>) and restart the store.</td></tr>
  </tbody>
</table>

## How it works

For developers who want to know what happens behind the scenes:

1. When EverShop emits an event, a subscriber (the `_all` wildcard) checks whether any enabled webhook wants it. If none does, it returns immediately and costs almost nothing.
2. For each matching webhook it **writes a delivery row first**, then makes the first attempt. From that moment the row, not the event, is the source of truth.
3. A cron job named `webhookProcessDeliveries` runs every minute. It sends due retries, recovers deliveries that were interrupted by a crash, cancels deliveries of disabled webhooks, and trims the log.

This differs from the normal [event system](/docs/development/knowledge-base/events-and-subscribers), where an event is handled once and never retried. Writing the row first is what makes retries and the delivery log possible. See also [Cron Jobs](/docs/development/knowledge-base/cron-jobs).

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Limit</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Webhooks</td><td>10</td></tr>
    <tr><td>Attempts per delivery</td><td>5 (1 immediate and 4 retries)</td></tr>
    <tr><td>Request timeout</td><td>10 seconds</td></tr>
    <tr><td>Pending deliveries per webhook</td><td>10,000. Above that, new events for that webhook are skipped (and a warning is logged) until it catches up.</td></tr>
    <tr><td>Webhook name / URL length</td><td>255 / 2048 characters</td></tr>
  </tbody>
</table>

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
