---
slug: importorder
sidebar_position: 141
keywords:
- importOrder
- historical order
- order migration
- OMS
groups:
- oms
sidebar_label: importOrder
title: importOrder
description: Write an order that already happened, for example when you move orders from another system, without taking stock again or announcing a new order.
---

# importOrder

Write an order that already happened: the order, its items, its two addresses, its payment transactions and its activity log, in one database transaction. Use it to move the history of another system into EverShop.

A new order, written by [createOrder](/docs/development/module/functions/createorder), takes the quantity off the stock and writes the event `order_created` (which starts webhooks, e-mail and analytics). Both are wrong for an order that was placed a year ago. While `importOrder` runs, those two database triggers step aside; they work as usual for everything else.

## Import

```typescript
import { importOrder } from '@evershop/evershop/oms/services';
```

## Syntax

```typescript
importOrder(
  data: HistoricalOrderInput,
  options?: { connection?: PoolClient }
): Promise<ImportedOrder>
```

### `data`

<table className="table-auto not-prose">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>currency</code></td><td>string</td><td>Required. For example <code>USD</code>.</td></tr>
    <tr><td><code>items</code></td><td>array</td><td>Required, at least one. See below.</td></tr>
    <tr><td><code>paymentStatus</code></td><td>string</td><td>Required. A key of <code>oms.order.paymentStatus</code>, for example <code>paid</code>.</td></tr>
    <tr><td><code>shipmentStatus</code></td><td>string</td><td>A shipment status of the store. Default: <code>delivered</code> when no item needs shipping, otherwise <code>pending</code>.</td></tr>
    <tr><td><code>createdAt</code></td><td>Date | string</td><td>When the order was placed. Default: now.</td></tr>
    <tr><td><code>orderNumber</code></td><td>string</td><td>Default: the next number, as a new order gets it. A number of only digits above 10000 is refused: the numbers 10001 and up are the ones that new orders will get, and a collision would make checkout fail. Keep an old number with a prefix, for example <code>IMP-10050</code>.</td></tr>
    <tr><td><code>customer</code></td><td>object</td><td><code>{'{ id?, email?, fullName? }'}</code>. The customer is not looked up; <code>id</code> is stored as given.</td></tr>
    <tr><td><code>coupon</code></td><td>string</td><td>The coupon code. Its use is counted (<code>used_time</code> goes up by one).</td></tr>
    <tr><td><code>shippingAddress</code>, <code>billingAddress</code></td><td>object</td><td>The columns of <code>order_address</code> (<code>recipient</code>, <code>address_line_1</code>, <code>locality</code>, <code>administrative_area</code>, <code>postal_code</code>, <code>country</code>, …). Stored as given: only <code>country</code> must be a country EverShop knows.</td></tr>
    <tr><td><code>shipping</code></td><td>object</td><td><code>{'{ methodName?, methodData?, feeExclTax?, feeInclTax?, taxAmount?, note? }'}</code>. A fee given with tax only has the tax taken out of it (<code>taxAmount</code>, else none); a fee given without tax has <code>taxAmount</code> added.</td></tr>
    <tr><td><code>paymentMethod</code>, <code>paymentMethodName</code></td><td>string</td><td>For example <code>stripe</code> and <code>Credit Card</code>.</td></tr>
    <tr><td><code>transactions</code></td><td>array</td><td>Payment transactions: <code>{'{ transactionId?, type, amount, paymentAction, parentTransactionId?, additionalInformation?, createdAt? }'}</code>. A transaction without <code>transactionId</code> is stored without one (several are allowed).</td></tr>
    <tr><td><code>activity</code></td><td>array</td><td>Extra lines for the order's history: <code>{'{ comment, customerNotified?, createdAt? }'}</code>.</td></tr>
    <tr><td><code>metaData</code></td><td>object</td><td>Stored in the order's <code>meta_data</code>.</td></tr>
  </tbody>
</table>

Each entry of **`items`**:

<table className="table-auto not-prose">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>sku</code></td><td>string</td><td>Required. The product is found by its sku and must exist in the store. Use <code>productId</code> to name the product by id instead.</td></tr>
    <tr><td><code>name</code></td><td>string</td><td>Required. The name on the order (it need not match the product today).</td></tr>
    <tr><td><code>qty</code></td><td>integer</td><td>Required, above 0.</td></tr>
    <tr><td><code>price</code></td><td>number</td><td>Required. The unit price <strong>without</strong> tax.</td></tr>
    <tr><td><code>priceInclTax</code>, <code>taxPercent</code></td><td>number</td><td>The unit price with tax and the tax rate. Give either: the other is worked out. With neither, the item has no tax. If both are given they must agree to one cent.</td></tr>
    <tr><td><code>discountAmount</code></td><td>number</td><td>The discount of the whole line, without tax. Default 0, at most the line. It comes off before the tax is worked out.</td></tr>
    <tr><td><code>weight</code>, <code>thumbnail</code>, <code>variantOptions</code></td><td></td><td>Stored on the order item.</td></tr>
    <tr><td><code>noShippingRequired</code></td><td>boolean</td><td>For a download or a service.</td></tr>
  </tbody>
</table>

### `options.connection`

By default `importOrder` opens its own transaction. To make it part of yours, pass a connection that is **already in a transaction** (started with `startTransaction` of the query builder); the function refuses any other. You commit or roll back, also when a hook throws: the order is then still in your transaction until you roll it back. The "do not take stock" flag lasts until your transaction ends, so do not write a new order on the same transaction after the call.

### Return value

```typescript
{
  orderId: number;
  uuid: string;
  orderNumber: string;
  status: string;          // resolved from the payment and shipment statuses
  paymentStatus: string;
  shipmentStatus: string;
}
```

## What it does, and what it does not

- The **order status** is resolved from the payment and shipment statuses with the store's mapping (see [Order Status Management](/docs/development/knowledge-base/order-status-management)); it is never given by hand. A status the store does not have is an error.
- The **amounts** are worked out from the items and the shipping you give, not from today's prices, taxes or shipping rules: the order is a record of what was charged. The order totals are the sum of the items, so they agree with them.
- The **stock** is not changed and the event `order_created` is not written. No e-mail is sent.
- **`placed_at`** is set to `createdAt`, unless the payment status is `pending`, `canceled` or a failed status, no transaction is given and the payment method is not `cod`: such an order was never placed. A Cash on Delivery order is placed when it is created. `order_placed` is not written (see [markOrderPlaced](/docs/development/module/functions/markorderplaced)).
- Nothing is written when the data is not an order (no item, a sku the store does not have, a country EverShop does not know, an unknown status, an amount that is not a number, a discount above its line), or, in its own transaction, when a hook throws.
- A closed placeholder cart is created, because an order must belong to a cart.

## Example

```typescript
import { importOrder } from '@evershop/evershop/oms/services';

const order = await importOrder({
  currency: 'USD',
  createdAt: '2023-03-04T05:06:07Z',
  customer: { email: 'jane@example.com', fullName: 'Jane Doe' },
  items: [
    { sku: 'MUG-BLUE', name: 'Blue mug', qty: 2, price: 10, taxPercent: 8 }
  ],
  shippingAddress: {
    recipient: 'Jane Doe',
    address_line_1: '1 Main Street',
    locality: 'Springfield',
    administrative_area: 'US-IL',
    postal_code: '62701',
    country: 'US'
  },
  shipping: { methodName: 'Ground', feeExclTax: 5, feeInclTax: 5 },
  paymentMethod: 'stripe',
  paymentStatus: 'paid',
  shipmentStatus: 'delivered',
  transactions: [
    { transactionId: 'pi_123', type: 'online', amount: 26.6, paymentAction: 'capture' }
  ]
});
// order.status === 'completed' with the default order status mapping
```

## Hooks

`importOrder` is hookable. Register from `bootstrap.ts`, with a `function`, not an arrow function.

```typescript
import {
  hookBeforeImportOrder,
  hookAfterImportOrder
} from '@evershop/evershop/oms/services';

// Before the writes: (data, connection)
hookBeforeImportOrder(async function (data, connection) {
  // …
});

// After the writes, in the same transaction: (result, data, connection).
// The result comes first. Throwing here rolls the whole order back (when
// importOrder opened the transaction; with your connection, you roll back).
hookAfterImportOrder(async function (result, data, connection) {
  // …
});
```

## See Also

- [createOrder](/docs/development/module/functions/createorder) — Creates an order from a cart
- [addOrderActivityLog](/docs/development/module/functions/addorderactivitylog) — Adds a line to an order's history
- [addPaymentTransaction](/docs/development/module/functions/addpaymenttransaction) — Records a payment transaction
- [Order Status Management](/docs/development/knowledge-base/order-status-management) — How the order status is resolved
