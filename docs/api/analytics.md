---
sidebar_position: 29
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Analytics
  - Dashboard
  - Sales Report
  - Lifetime Sales
  - REST API
sidebar_label: Analytics
title: Analytics REST API
description: Read the two admin dashboard analytics endpoints in EverShop — lifetime sales totals and bucketed sales statistics — including their query parameters and exact response shapes.
---

import Api from '@site/src/components/rest/Api';

# Analytics API

## Overview

Two read-only endpoints back the widgets on the admin dashboard. They are the only sales aggregates exposed over REST — everything else about orders is read through GraphQL.

Both are declared `access: "private"` in `route.json`, so they require an admin credential (a `Bearer` admin JWT or an admin session cookie), and both aggregate over the **entire** `order` table with no store, channel or date scoping beyond what is described below.

:::caution Neither endpoint uses the `data` envelope
Every other EverShop REST endpoint answers `{"data": ...}`. These two call `response.json(...)` directly with the aggregate: `/api/lifetimesales` returns a bare object and `/api/salestatistic` returns a bare array. Client code that unwraps `.data` will read `undefined`.
:::

## Endpoints

### Get Lifetime Sales

Returns four headline numbers computed over every row in the `order` table. There are no query parameters and no request body — any query string is ignored.

<Api
method="GET"
url="/api/lifetimesales"
responseSample={`{
  "orders": 184,
  "total": "$41,207.55",
  "completed_percentage": 62,
  "cancelled_percentage": 0
}`}
/>

**Response Properties**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Property</th>
      <th className="text-left">Type</th>
      <th className="text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>orders</code></td>
      <td>integer</td>
      <td>Total number of order rows. No status filter — carts that became orders count even if payment never completed.</td>
    </tr>
    <tr>
      <td><code>total</code></td>
      <td>string</td>
      <td>Sum of <code>grand_total</code> across all orders, already <b>formatted as currency</b>. Not a number.</td>
    </tr>
    <tr>
      <td><code>completed_percentage</code></td>
      <td>integer</td>
      <td>Percentage of orders where <code>payment_status = 'paid'</code> <b>and</b> <code>shipment_status = 'delivered'</code>, rounded to the nearest integer. <code>0</code> when there are no orders.</td>
    </tr>
    <tr>
      <td><code>cancelled_percentage</code></td>
      <td>integer</td>
      <td>Percentage of orders where <code>payment_status = 'cancelled'</code> <b>and</b> <code>shipment_status = 'cancelled'</code>, rounded. <code>0</code> when there are no orders.</td>
    </tr>
  </tbody>
</table>

`total` is formatted server-side with `Intl.NumberFormat`, using the store currency from settings and the locale from the `shop.language` config key (default `en`). A store configured for `de` and `EUR` gets `"41.207,55 €"`, not `"$41,207.55"`. Parse it at your own risk — if you need a number, sum `Order.grandTotal` through GraphQL instead.

:::warning `cancelled_percentage` is always `0` on a stock install
The handler compares against the string `'cancelled'` (two `l`s). EverShop's registered status code is `canceled` (one `l`) — the spelling used by `cancelOrder`, the OMS status registry and the Stripe webhook. Nothing ever writes `'cancelled'`, so the counter never increments. Do not use this field to detect cancellations; derive them from `Order.status` / `Order.paymentStatus` through GraphQL.
:::

<hr />

### Get Sales Statistics

Returns six consecutive time buckets of order volume and revenue, oldest first. This backs the dashboard's sales chart.

<Api
method="GET"
url="/api/salestatistic?period=monthly"
responseSample={`[
  {
    "total": "3120.5000",
    "count": "14",
    "time": "Mar 31"
  },
  {
    "total": "4890.0000",
    "count": "21",
    "time": "Apr 30"
  },
  {
    "total": "5102.2500",
    "count": "19",
    "time": "May 31"
  },
  {
    "total": 0,
    "count": "0",
    "time": "Jun 30"
  },
  {
    "total": "6740.7500",
    "count": "27",
    "time": "Jul 31"
  },
  {
    "total": "2310.0000",
    "count": "9",
    "time": "Aug 31"
  }
]`}
/>

**Query Parameters**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Parameter</th>
      <th className="text-left">Type</th>
      <th className="text-left">Required</th>
      <th className="text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>period</code></td>
      <td>string</td>
      <td>No</td>
      <td><code>daily</code>, <code>weekly</code> or <code>monthly</code>. Defaults to <code>weekly</code>.</td>
    </tr>
  </tbody>
</table>

**Bucket Windows**

Six buckets are always returned, indexed oldest to newest, with the current period last.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left"><code>period</code></th>
      <th className="text-left">Each bucket spans</th>
      <th className="text-left">Range covered</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>daily</code></td>
      <td>One calendar day, <code>00:00:00</code> to <code>23:59:59</code></td>
      <td>Today and the five days before it</td>
    </tr>
    <tr>
      <td><code>weekly</code></td>
      <td>One calendar week, start-of-week to end-of-week</td>
      <td>This week and the five weeks before it</td>
    </tr>
    <tr>
      <td><code>monthly</code></td>
      <td>One calendar month, first day to last day</td>
      <td>This month and the five months before it</td>
    </tr>
  </tbody>
</table>

**Response Properties**

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th className="text-left">Property</th>
      <th className="text-left">Type</th>
      <th className="text-left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>total</code></td>
      <td>string or number</td>
      <td><code>SUM(grand_total)</code> for the bucket. PostgreSQL returns <code>numeric</code> as a <b>string</b> (<code>"3120.5000"</code>); an empty bucket yields the number <code>0</code> instead of <code>null</code>. Coerce before doing arithmetic.</td>
    </tr>
    <tr>
      <td><code>count</code></td>
      <td>string</td>
      <td><code>COUNT(order_id)</code> for the bucket. A <code>bigint</code>, so it is a string even when it is <code>"0"</code>.</td>
    </tr>
    <tr>
      <td><code>time</code></td>
      <td>string</td>
      <td>Label for the bucket, formatted <code>MMM DD</code> from the bucket's <b>end</b> date — so a monthly bucket is labelled with the last day of the month, not the first.</td>
    </tr>
  </tbody>
</table>

Buckets are computed purely from `order.created_at` between the window bounds. No status filter is applied: canceled and unpaid orders contribute to both `total` and `count`, which is why this endpoint's revenue will not match a paid-orders report.

:::info `period` is not validated
Only `daily`, `weekly` and `monthly` build a window. Any other value falls through all three branches and leaves the bucket bounds unset, so the request will not return usable figures. Validate the value on your side before sending it.
:::

<hr />

## Building Your Own Reports

These two endpoints are hardcoded for the dashboard widgets and take no filters beyond `period`. For anything else — revenue by status, by product, by customer group, over an arbitrary date range — query the `orders` collection through GraphQL, which supports filtering, sorting and pagination. See the [data fetching documentation](/docs/development/knowledge-base/data-fetching).
