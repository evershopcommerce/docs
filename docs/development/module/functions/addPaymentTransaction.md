---
sidebar_position: 126
keywords:
  - addPaymentTransaction
  - payment
  - transaction
  - OMS
groups:
  - oms
sidebar_label: addPaymentTransaction
title: addPaymentTransaction
description: Record a payment transaction for an order.
---

# addPaymentTransaction

Record a payment transaction (capture, refund, authorization) for an order.

## Import

```typescript
import { addPaymentTransaction } from "@evershop/evershop/oms/services";
```

## Syntax

```typescript
addPaymentTransaction(
  connection: Pool | PoolClient,
  orderId: number,
  amount: number,
  transactionId: string | number,
  transactionType: string,
  paymentAction: string,
  additionalInformation?: string,
  parentTransactionId?: string | number
): Promise<PaymentTransactionRow>
```

### Parameters

<table className="not-prose table-auto">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`connection`</td>
      <td>`Pool | PoolClient`</td>
      <td>Database connection</td>
    </tr>
    <tr>
      <td>`orderId`</td>
      <td>`number`</td>
      <td>Order database ID</td>
    </tr>
    <tr>
      <td>`amount`</td>
      <td>`number`</td>
      <td>Transaction amount</td>
    </tr>
    <tr>
      <td>`transactionId`</td>
      <td>`string | number`</td>
      <td>Provider's transaction ID</td>
    </tr>
    <tr>
      <td>`transactionType`</td>
      <td>`string`</td>
      <td>e.g., `'capture'`, `'refund'`, `'authorization'`</td>
    </tr>
    <tr>
      <td>`paymentAction`</td>
      <td>`string`</td>
      <td>e.g., `'Capture'`, `'Refund'`</td>
    </tr>
    <tr>
      <td>`additionalInformation`</td>
      <td>`string` (optional)</td>
      <td>Extra details (JSON string)</td>
    </tr>
    <tr>
      <td>`parentTransactionId`</td>
      <td>`string | number` (optional)</td>
      <td>Parent transaction for refunds</td>
    </tr>
  </tbody>
</table>

## Examples

```typescript
import { addPaymentTransaction } from "@evershop/evershop/oms/services";

// Record a capture
await addPaymentTransaction(
  connection,
  orderId,
  99.99,
  "pi_1234567890",
  "capture",
  "Capture",
  JSON.stringify({ provider: "stripe" }),
);

// Record a refund linked to the capture
await addPaymentTransaction(
  connection,
  orderId,
  49.99,
  "re_0987654321",
  "refund",
  "Refund",
  null,
  "pi_1234567890", // parent transaction
);
```

## See Also

- [updatePaymentStatus](/docs/development/module/functions/updatePaymentStatus) — Update payment status
- [Payment Method Development](/docs/development/knowledge-base/payment-method-development) — Payment gateway guide
