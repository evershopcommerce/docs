---
sidebar_position: 82
keywords:
- createShipment
- oms
- order
- shipment
- fulfillment
groups:
- oms
sidebar_label: createShipment
title: createShipment
description: Create a shipment for an order.
---

# createShipment

Create a shipment for an order. A shipment covers a **subset of the order's items** — an order can have many shipments, and the order-level `shipment_status` is a rollup recomputed from all of them.

## Import

```ts
import { createShipment } from '@evershop/evershop/oms/services';
```

`createShipment` is a named export of `@evershop/evershop/oms/services`.

## Syntax

```ts
createShipment(
  orderUuid: string,
  payload: CreateShipmentPayload,
  conn?: PoolClient
): Promise<CreateShipmentResult>
```

:::danger Breaking change
The legacy positional form `createShipment(orderUuid, carrier, trackingNumber, connection?)` **throws**. It created a shipment with no items, which is incompatible with the current `shipment_item` schema (`qty > 0` is enforced). Pass the payload object instead.
:::

### Parameters

**`orderUuid`**

**Type:** `string`

The UUID of the order (the `order.uuid` column, not `order_id`).

**`payload`**

**Type:** `CreateShipmentPayload`

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>items</code></td>
      <td><code>Array&lt;&#123; order_item_id: number; qty: number &#125;&gt;</code></td>
      <td>Yes</td>
      <td>The order items (and quantities) included in this shipment. Must be non-empty; every <code>qty</code> must be a positive integer that does not exceed the item's unshipped remainder.</td>
    </tr>
    <tr>
      <td><code>carrier</code></td>
      <td><code>string</code></td>
      <td>Yes</td>
      <td>The carrier code. Must be a <strong>registered</strong> carrier — see the note below.</td>
    </tr>
    <tr>
      <td><code>tracking_number</code></td>
      <td><code>string</code></td>
      <td>No</td>
      <td>A tracking number you already have. When omitted, <code>createShipment</code> asks the carrier to create a label (if the carrier implements <code>createLabel</code>).</td>
    </tr>
    <tr>
      <td><code>notifyCustomer</code></td>
      <td><code>boolean</code></td>
      <td>No</td>
      <td>Defaults to <code>true</code>. Forwarded on the <code>shipment_created</code> event payload; set <code>false</code> to suppress the shipment notification email.</td>
    </tr>
  </tbody>
</table>

**`conn`**

**Type:** `PoolClient` (optional)

An existing connection **with an open transaction**. When provided, `createShipment` joins your transaction instead of opening (and committing) its own.

## Return Value

Returns `Promise<CreateShipmentResult>`:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipment</code></td>
      <td><code>ShipmentRow</code></td>
      <td>The inserted <code>shipment</code> row. New shipments always land with <code>status: 'shipped'</code>.</td>
    </tr>
    <tr>
      <td><code>items</code></td>
      <td><code>Array&lt;&#123; order_item_id: number; qty: number &#125;&gt;</code></td>
      <td>The items that were actually written to <code>shipment_item</code>.</td>
    </tr>
    <tr>
      <td><code>labelCreated</code></td>
      <td><code>boolean</code></td>
      <td><code>true</code> when a label was purchased from the carrier during this call.</td>
    </tr>
  </tbody>
</table>

## Examples

### Ship selected items with a known tracking number

```ts
import { createShipment } from '@evershop/evershop/oms/services';

const { shipment, items, labelCreated } = await createShipment(
  '7afebbbd-69f6-4e2c-84c5-5b899173b867',
  {
    items: [
      { order_item_id: 41, qty: 2 },
      { order_item_id: 42, qty: 1 }
    ],
    carrier: 'custom',
    tracking_number: '1234567890'
  }
);

console.log(shipment.uuid, items.length, labelCreated); // labelCreated === false
```

### Let the carrier create the label

Omit `tracking_number`. If the registered carrier implements `createLabel`, the label is purchased inside `createShipment` (before the transaction opens) and the returned tracking number, label URL and carrier metadata are written onto the shipment row.

```ts
import { createShipment } from '@evershop/evershop/oms/services';

const result = await createShipment(orderUuid, {
  items: [{ order_item_id: 41, qty: 1 }],
  carrier: 'ups',
  notifyCustomer: true
});

if (result.labelCreated) {
  console.log(result.shipment.label_url, result.shipment.tracking_number);
}
```

### Within your own transaction

```ts
import { createShipment } from '@evershop/evershop/oms/services';
import { getConnection } from '@evershop/evershop/lib/postgres';
import {
  startTransaction,
  commit,
  rollback
} from '@evershop/evershop/lib/postgres/query';

const connection = await getConnection();
await startTransaction(connection);

try {
  await createShipment(
    orderUuid,
    {
      items: [{ order_item_id: 41, qty: 1 }],
      carrier: 'custom',
      tracking_number: '1Z999'
    },
    connection
  );
  await commit(connection);
} catch (e) {
  await rollback(connection);
  throw e;
}
```

## The carrier must be registered

`createShipment` validates `payload.carrier` against the carrier registry and throws
`Unknown carrier '<code>'. Install or register the carrier extension first.` when it is not found. Register carriers from a module's `bootstrap.ts`:

```ts
import { registerCarrier } from '@evershop/evershop/oms/services';

export default () => {
  registerCarrier({
    code: 'my_carrier',
    name: 'My Carrier',
    description: 'Label + tracking integration'
  });
};
```

Core ships one built-in carrier, `custom` ("Custom / Other"), with no capabilities — no `createLabel`, no tracking URL. Creating a shipment with it simply records that a shipment exists.

## Label creation

Label purchase happens **inside** `createShipment`, not in a separate call:

- `tracking_number` provided → no carrier call at all.
- `tracking_number` omitted **and** the carrier implements `createLabel` → the label is purchased *outside* the transaction (a network call must not hold a DB transaction open), then the resulting tracking number, label URL, label format, carrier shipment id and metadata are persisted with the shipment.
- `tracking_number` omitted and the carrier has no `createLabel` → the shipment is created with `tracking_number = null`. This is the normal path for the built-in `custom` carrier.

If the transaction fails after a label was purchased, `createShipment` makes a best-effort compensating `voidLabel()` call so no orphan tracking number is left at the carrier.

## Events

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Event</th>
      <th>When</th>
      <th>Payload</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>shipment_created</code></td>
      <td>Always, after commit</td>
      <td><code>&#123; shipmentId, orderId, notifyCustomer &#125;</code></td>
    </tr>
    <tr>
      <td><code>shipment_label_created</code></td>
      <td>Only when a label was purchased</td>
      <td><code>&#123; shipmentId, orderId, labelUrl, trackingNumber &#125;</code></td>
    </tr>
  </tbody>
</table>

## Notes

- Validation runs twice: once before the transaction, and again under a per-order advisory lock, so two concurrent calls cannot over-allocate the same item.
- Items flagged `no_shipping_required` (digital products) are rejected.
- Quantities already covered by non-canceled shipments count against the remainder — shipping more than the unshipped quantity throws.
- After insert, the order's `shipment_status` rollup is recomputed, which in turn re-resolves `order.status` through the `psoMapping`.
- An order activity log entry is written for every shipment.
- Hookable at `createShipment`, `validateShipmentItems`, `insertShipment` and `insertShipmentItems` (`hookBeforeCreateShipment` / `hookAfterCreateShipment`, etc.).

## See Also

- [updateShipmentStatus](/docs/development/module/functions/updateShipmentStatus) - Advance a single shipment's status
- [registerShipmentStatus](/docs/development/module/functions/registerShipmentStatus) - Register a custom per-shipment status
- [cancelOrder](/docs/development/module/functions/cancelOrder) - Cancel an order
