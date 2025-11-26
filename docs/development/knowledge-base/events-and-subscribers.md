---
sidebar_position: 32
keywords:
  - event
sidebar_label: Events and Subscribers
title: Events and Subscribers
description: EverShop provides a powerful event system that allows you to subscribe to the event and execute your code when the event is triggered.
---

![Event and Subscribers In EverShop](./img/event-subscriber.png "Event and Subscribers In EverShop")

## Overview

This document explains the event system in EverShop. EverShop provides a powerful event system that allows you to subscribe to events and execute your code when those events are triggered.

Events are a way for your application to react to specific actions that occur. For example, when a product is created, you may want to send an email to the customer. In EverShop, you can subscribe to the `product_created` event and send an email to the customer.

EverShop core can trigger events at different points in the application, and your extensions can subscribe to these events and execute your code asynchronously when the event is triggered.

For example, when a product is created, EverShop core triggers the `product_created` event, and your extension can subscribe to this event and execute your code.

## Emitting Events

An event has a name and a data object. The name is used to identify the event, and the data object contains the data that will be passed to the event subscribers.

To emit an event, you can use the `emitter` helper function. This function accepts two parameters: the event name and the data object.

```ts title="Emit an event"
import { emit } from "@evershop/evershop/lib/event";

await emit("product_created", {
  product: {
    id: 1,
    name: "Product 1",
  },
});
```

Under the hood, an event is stored in the database, and the subscribers will be executed asynchronously.

:::info
An event will be removed from the pool when all subscribers are executed, regardless of the result of the execution.
:::

## Subscribe to an Event

To subscribe to an event, the first thing you need to do is create a `subscribers` folder in your extension directory. This folder will contain all the subscribers for your extension.

```bash

├── your-extension
│   ├── subscribers
```

Next, create a subfolder with the name of the event you want to subscribe to. For example, if you want to subscribe to the `product_created` event, you need to create a folder named `product_created`.

```bash
├── your-extension
│   ├── subscribers
│   │   ├── product_created
```

Next, create a TS file. This file will contain the code that will be executed when the event is triggered. You can have multiple subscribers for the same event.

```bash
├── your-extension
│   ├── subscribers
│   │   ├── product_created
│   │   │   ├── sendEmail.ts
```

Here is an example of a subscriber:

```ts title="your-extension/subscribers/product_created/sendEmail.ts"
export default async function sendMail(data) {
  // Send email to the customer
}
```

This function will be executed asynchronously when the `product_created` event is triggered. The data object passed to the event will be available in the subscriber function.

:::info
The subscriber function must be a default export.
:::

## List of Events

### A New Product Created

This event is triggered when a product is created.

```ts
// Event name: product_created
// Data object:
{
  "product_id": 214,
  "uuid": "217fb454-797b-493e-8b33-0daf7c767e1d",
  "type": "simple",
  "variant_group_id": null,
  "visibility": true,
  "group_id": 1,
  "sku": "new-product",
  "price": 120,
  "weight": 12,
  "tax_class": null,
  "status": true,
  "created_at": "2024-05-14T02:19:08.371545+00:00",
  "updated_at": "2024-05-14T02:19:08.371545+00:00",
  "category_id": null
}

// Example subscriber
// export default async function syncData(data) {
//     const productSku = data.sku;
// }
```

### A Product Updated

This event is triggered when a product is updated.

```js
// Event name: product_updated
// Data object:
{
  "product_id": 186,
  "uuid": "621e5159-0499-4e6a-aeee-13920d818aa9",
  "type": "simple",
  "variant_group_id": 105,
  "visibility": true,
  "group_id": 1,
  "sku": "NJC44203-Purple-M",
  "price": 255,
  "weight": 4.9,
  "tax_class": null,
  "status": true,
  "created_at": "2021-10-05T05:47:59+00:00",
  "updated_at": "2023-03-11T21:28:25+00:00",
  "category_id": null
}

// Example subscriber
// export default async function syncData(data) {
//     const productSku = data.sku;
// }
```

### A New Category Created

This event is triggered when a category is created.

```js
// Event name: category_created
// Data object:
{
  "category_id": 18,
  "uuid": "d5111391-d1ea-4ea0-9e21-1bfcffe23f48",
  "status": true,
  "parent_id": null,
  "include_in_nav": true,
  "position": null,
  "created_at": "2022-11-24T14:05:19+00:00",
  "updated_at": "2022-11-24T14:05:19+00:00"
}

// Example subscriber
// export default async function syncData(data) {
//     const categoryId = data.category_id;
// }
```

### A Category Updated

This event is triggered when a category is updated.

```js
// Event name: category_updated
// Data object:
{
  "category_id": 18,
  "uuid": "d5111391-d1ea-4ea0-9e21-1bfcffe23f48",
  "status": true,
  "parent_id": null,
  "include_in_nav": true,
  "position": null,
  "created_at": "2022-11-24T14:05:19+00:00",
  "updated_at": "2022-11-24T14:05:19+00:00"
}

// Example subscriber
// export default async function syncData(data) {
//     const categoryId = data.category_id;
// }
```

### An Order Created

This event is triggered when an order is created.

```js
// Event name: order_created
// Data object:
{
  "order_id": 2070,
  "uuid": "7afebbbd-69f6-4e2c-84c5-5b899173b867",
  "integration_order_id": null,
  "sid": "xu8STFfyGfi6IkQcPfZc9rXEgPZ3mjvY",
  "order_number": "12070",
  "cart_id": 26270,
  "currency": "USD",
  "customer_id": null,
  "customer_email": "admin@admin.com",
  "customer_full_name": null,
  "user_ip": null,
  "user_agent": null,
  "coupon": null,
  "shipping_fee_excl_tax": 5,
  "shipping_fee_incl_tax": 5,
  "discount_amount": 0,
  "sub_total": 504,
  "total_qty": 1,
  "total_weight": 6.4,
  "tax_amount": 0,
  "shipping_note": null,
  "grand_total": 509,
  "shipping_method": "7d0aba1a-fa8a-4b37-8b0c-5162cb34997e",
  "shipping_method_name": "Standard Delivery",
  "shipping_address_id": 4141,
  "payment_method": "stripe",
  "payment_method_name": "Credit Card",
  "billing_address_id": 4142,
  "shipment_status": "processing",
  "payment_status": "pending",
  "created_at": "2024-05-08T10:13:00.138845+00:00",
  "updated_at": "2024-05-08T10:13:00.138845+00:00",
  "sub_total_incl_tax": 504
}

// Example subscriber
// export default async function sendMail(data) {
//     const customerEmail = data.customer_email;
// }
```

### An Order Placed

This event is triggered when an order is placed. This event is triggered by the payment gateway.
For example, with offline payment methods like COD, this event will be triggered when the order is created.
With online payment gateways like Stripe or PayPal, this event will be triggered when the payment is successful.

```js
// Event name: order_placed
// Data object:
{
  "order_id": 2070,
  "uuid": "7afebbbd-69f6-4e2c-84c5-5b899173b867",
  "integration_order_id": null,
  "sid": "xu8STFfyGfi6IkQcPfZc9rXEgPZ3mjvY",
  "order_number": "12070",
  "cart_id": 26270,
  "currency": "USD",
  "customer_id": null,
  "customer_email": "admin@admin.com",
  "customer_full_name": null,
  "user_ip": null,
  "user_agent": null,
  "coupon": null,
  "shipping_fee_excl_tax": 5,
  "shipping_fee_incl_tax": 5,
  "discount_amount": 0,
  "sub_total": 504,
  "total_qty": 1,
  "total_weight": 6.4,
  "tax_amount": 0,
  "shipping_note": null,
  "grand_total": 509,
  "shipping_method": "7d0aba1a-fa8a-4b37-8b0c-5162cb34997e",
  "shipping_method_name": "Standard Delivery",
  "shipping_address_id": 4141,
  "payment_method": "stripe",
  "payment_method_name": "Credit Card",
  "billing_address_id": 4142,
  "shipment_status": "processing",
  "payment_status": "paid",
  "created_at": "2024-05-08T10:13:00.138845+00:00",
  "updated_at": "2024-05-08T10:13:00.138845+00:00",
  "sub_total_incl_tax": 504
}

// Example subscriber
// module.exports = async function sendMail(data) {
//     const customerName = data.customer_full_name;
// }
```

### Inventory Updated

This event is triggered when the inventory of a product is updated.

```js
// Event name: inventory_updated
// Data object:
{
  "old": {
    "product_inventory_id": 110,
    "product_inventory_product_id": 110,
    "qty": 997,
    "manage_stock": true,
    "stock_availability": true
  },
  "new": {
    "product_inventory_id": 110,
    "product_inventory_product_id": 110,
    "qty": 996,
    "manage_stock": true,
    "stock_availability": true
  }
}

// Example subscriber
// export default async function syncInventory(data) {
//     const productID = data.old.product_inventory_product_id;
//     const newStock = data.new.qty;
// }
```

### A New Customer Created

This event is triggered when a customer is created.

```js
// Event name: customer_registered
// Data object:
{
  "customer_id": 12670,
  "uuid": "7db52ab1-30a0-4477-9a56-8b681ac31f39",
  "status": 1,
  "group_id": 1,
  "email": "david@evershop.io",
  "full_name": "David Nguyen",
  "created_at": "2024-05-14T02:11:25.917Z",
  "updated_at": "2024-05-14T02:11:25.917Z"
}

// Example subscriber
// export default async function sendWelcomeEmail(data) {
//     const customerEmail = data.email;
// }
```

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
