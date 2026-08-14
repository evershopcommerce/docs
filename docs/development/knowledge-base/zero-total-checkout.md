---
sidebar_position: 44
keywords:
  - zero total
  - free order
  - zero checkout
  - payment method
  - 100% discount
  - billing address
sidebar_label: Zero-Total Checkout
title: Zero-Total Checkout
description: How EverShop places orders whose grand total is zero, the reserved zero_checkout payment method, and what it breaks for existing payment extensions.
---

# Zero-Total Checkout

A cart can legitimately reach a grand total of zero: a 100% discount coupon, a free product, a free-shipping rule on a free item, a fully credited order. Before EverShop 2.2.1 these carts had nowhere to go — every payment method wanted a charge, and the order transaction crashed on the missing billing address.

2.2.1 adds a built-in payment method, `zero_checkout` ("No payment required"), owned by the checkout module itself. It is always registered, has no setting and no config toggle, and its validator is exactly "is the cart total zero".

If you maintain a payment extension, read the next section first — the change affects your method whether or not you care about free orders.

## Read this first: your validator is no longer the last word

`getAvailablePaymentMethods()` applies a **central filter after every validator has run**. When the caller supplies a cart total of zero or less, every method except `zero_checkout` is discarded — including yours, and including methods whose validator returned `true`.

```ts
// modules/checkout/services/getAvailablePaymentMethods.ts
const applicableMethods: PaymentMethodInfo[] = [];
for (const method of methods) {
  const methodInfo = await method.init();
  if (applicableMethods.some((m) => m.code === methodInfo.code)) {
    throw new Error(`Duplicate payment method code: ${methodInfo.code}`);
  }
  if (!method.validator || (await method.validator(context))) {
    applicableMethods.push(methodInfo);
  }
}
// A zero-total order accepts only the zero-checkout method.
if (typeof context.cartTotal === 'number' && context.cartTotal <= 0) {
  return applicableMethods.filter((m) => m.code === ZERO_CHECKOUT_CODE);
}
return applicableMethods;
```

Consequences worth internalizing:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Situation</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Your validator returns <code>true</code>, <code>cartTotal</code> is <code>0</code></td>
      <td>Your method is <strong>dropped</strong>. There is no opt-out</td>
    </tr>
    <tr>
      <td>Your validator returns <code>true</code>, <code>cartTotal</code> is <code>undefined</code></td>
      <td>Your method is kept — the filter needs a number to fire</td>
    </tr>
    <tr>
      <td>Caller passes no context at all</td>
      <td>Legacy behavior: every valid method is listed, and <code>zero_checkout</code> is hidden by its own validator</td>
    </tr>
    <tr>
      <td>Your method wants to handle free orders itself</td>
      <td>Not supported. <code>zero_checkout</code> is the single sanctioned path</td>
    </tr>
  </tbody>
</table>

The filter is central for a reason: a gateway validator cannot know it is looking at a zero-total cart, and a gateway asked to charge zero either errors or creates a junk transaction. The reverse direction — hiding `zero_checkout` when the total is above zero or unknown — is handled by the method's own validator, not by the filter.

`zero_checkout` is a **reserved code**. Registering a method with that code makes `getAvailablePaymentMethods()` throw `Duplicate payment method code: zero_checkout` on every call, which takes down the storefront payment list and admin listings alike.

## The validator signature changed

Validators now receive a context object:

```ts
// modules/checkout/services/getAvailablePaymentMethods.ts
export const ZERO_CHECKOUT_CODE = 'zero_checkout';

export type PaymentMethodInfo = {
  code: string;
  name: string;
};

export interface PaymentMethodValidationContext {
  /** The cart's grand_total in major currency units. Omitted when no cart is in scope. */
  cartTotal?: number;
}

export type PaymentMethodFactory = {
  init: () => PaymentMethodInfo | Promise<PaymentMethodInfo>;
  validator?: (
    context?: PaymentMethodValidationContext
  ) => boolean | Promise<boolean>;
};
```

Both the parameter and its `cartTotal` field are optional, so existing zero-argument validators keep compiling and keep working. Opt in when you have a real minimum or maximum:

```ts title="extensions/my-payment/src/bootstrap.ts"
import {
  registerPaymentMethod,
  type PaymentMethodValidationContext
} from '@evershop/evershop/checkout/services';
import { getSetting } from '@evershop/evershop/setting/services';

export default () => {
  registerPaymentMethod({
    init: async () => ({
      code: 'my_payment',
      name: await getSetting('myPaymentDisplayName', 'My Payment Method')
    }),
    validator: async (context?: PaymentMethodValidationContext) => {
      const enabled = parseInt(await getSetting('myPaymentStatus', 0), 10) === 1;
      if (!enabled) {
        return false;
      }
      // `cartTotal` is undefined for context-less callers — don't reject on that.
      if (typeof context?.cartTotal === 'number' && context.cartTotal < 10) {
        return false;
      }
      return true;
    }
  });
};
```

:::warning
`validator` is typed optional but is effectively mandatory. The registry validates every registered factory with `typeof method.validator === 'function'`, and a factory without one makes the whole `checkoutPaymentMethods` value invalid — every payment-method listing then throws. Always supply one, even `async () => true`.
:::

Two callers populate the context today, so the storefront list reacts to coupon changes through the normal cart re-sync:

```ts
// modules/checkout/graphql/types/PaymentMethod/AvailablePaymentMethod.resolvers.ts
availablePaymentMethods: async ({ grandTotal }) => {
  const methods = await getAvailablePaymentMethods({ cartTotal: grandTotal });
  return methods;
}
```

The `payment_method` cart field resolver does the same, and declares `grand_total` as a dependency so the field re-resolves whenever the total moves. A method that was valid before a coupon was applied self-clears and blocks placement through `checkCartError`.

## The zero-checkout method

Registration lives in the checkout module's bootstrap:

```ts
// modules/checkout/services/zeroCheckout.ts
export function registerZeroCheckoutPaymentMethod(): void {
  registerPaymentMethod({
    init: () => ({ code: ZERO_CHECKOUT_CODE, name: 'No payment required' }),
    validator: (context?: PaymentMethodValidationContext) =>
      isZeroTotal(context?.cartTotal)
  });
}
```

```ts
// modules/checkout/bootstrap.ts
registerZeroCheckoutPaymentMethod();
registerZeroCheckoutOrderValidation();
hookAfter<CreateOrderContext, CreateOrderResult>(
  'createOrderFunc',
  async function markZeroCheckoutOrderPaidHook(order) {
    await markZeroCheckoutOrderPaid(order);
  }
);
```

`isZeroTotal` treats only a real number `<= 0` as zero — `undefined` and `NaN` mean "total unknowable", and the method stays hidden. `grand_total` is registered by the promotion module, so on an installation without it the field read throws, the helper returns `undefined`, and the whole feature degrades to pre-2.2.1 behavior instead of misfiring.

The client side is the usual null-rendering registrar at `pages/frontStore/checkout/ZeroCheckout.tsx`, plus one extra effect: it auto-selects `zero_checkout` when the availability list is *exactly* that one method, and clears a stale zero selection when the list changes back. It keys on the **list**, not on the total — the payment step toasts an error when the selected code is missing from `availablePaymentMethods`, so total-keyed selection would race the cart re-sync.

## Placement-boundary rules

Selecting a wrong method explicitly is already rejected by the `payment_method` cart-field resolver. But a cart whose `payment_method` was never set carries no field error, so two order-validation rules close that bypass at `validateBeforeCreateOrder` — the funnel both order-creation endpoints go through:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Rule id</th>
      <th>Rejects</th>
      <th>Error message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>zeroTotalRequiresZeroCheckout</code></td>
      <td>A zero-total cart placed with any method other than <code>zero_checkout</code>, including none at all</td>
      <td><code>Zero-total orders must use the 'No payment required' payment method</code></td>
    </tr>
    <tr>
      <td><code>zeroCheckoutRequiresZeroTotal</code></td>
      <td>A cart that selected <code>zero_checkout</code> but whose total is above zero</td>
      <td><code>The 'No payment required' payment method cannot be used when the order total is greater than zero</code></td>
    </tr>
  </tbody>
</table>

Both are scoped narrowly. A methodless cart with a total above zero is pre-existing platform behavior and stays untouched, and an unreadable `grand_total` passes both rules rather than blocking checkout.

Failures surface from `createOrder` as:

```
Order validation failed: Zero-total orders must use the 'No payment required' payment method
```

You add your own rules the same way:

```ts title="extensions/my-rules/src/bootstrap.ts"
import { addOrderValidationRule } from '@evershop/evershop/checkout/services';

export default () => {
  addOrderValidationRule({
    id: 'requirePhoneForFreeOrders',
    func: (cart) => Boolean(cart.getData('customer_phone')),
    errorMessage: 'A phone number is required'
  });
};
```

## Automatic payment

Zero-total orders are created with the default `pending` payment status like any other order, then immediately flipped to `paid` by a `createOrderFunc` after-hook:

```ts
// modules/checkout/services/zeroCheckout.ts
export async function markZeroCheckoutOrderPaid(
  order: (Partial<OrderRow> & Pick<OrderRow, 'order_id' | 'payment_method'>) | null | undefined,
  complete: (orderId: number) => Promise<void> = completeZeroCheckoutOrder
): Promise<void>;
```

It returns immediately unless `order.payment_method === 'zero_checkout'`, so it never touches anyone else's orders. `completeZeroCheckoutOrder` then, in one transaction:

1. `updatePaymentStatus(orderId, 'paid', connection)` — whose `changePaymentStatus` after-hook recomputes `order.status` from the PSO mapping on the same connection.
2. Writes an activity log entry, `Payment completed automatically (zero-total order)`.

After the commit it re-loads the order row and emits `order_placed` with it, so subscribers — the confirmation email among them — see `payment_status: 'paid'` rather than a half-finished order.

:::note
Errors inside the hook are logged and swallowed. The order transaction has already committed by then, so throwing would fail the checkout response for an order that exists. A zero-total order left in `pending` is the same failure class as a lost gateway webhook: visible in admin, fixable by hand.
:::

This is also why `zero_checkout` does not need an `order_placed` emitter of its own the way COD, Stripe, and PayPal do — the auto-payment path emits it.

## Billing address is now optional at zero total

This is the change most likely to break code that has nothing to do with free orders.

Historically a billing address was never formally required — it was *accidentally* enforced by the order transaction throwing a `TypeError` on a null address row. 2.2.1 replaced that with an explicit rule:

```ts
// modules/checkout/services/orderValidator.ts — the `billingAddress` rule
func: (cart: Cart) => {
  let total;
  try {
    total = cart.getData('grand_total');
  } catch (e) {
    total = undefined;
  }
  if (typeof total === 'number' && !Number.isNaN(total) && total <= 0) {
    return true;
  }
  return Boolean(cart.getData('billing_address_id'));
},
errorMessage: 'Billing address is required'
```

Nothing is charged, taxed, or invoiced on a zero-total order, so the address is not collected. `orderCreator` makes the insert conditional the same way the shipping address already was:

```ts
// modules/checkout/services/orderCreator.ts
let billAddr;
if (cart.getData('billing_address_id')) {
  const cartBillingAddress = await select()
    .from('cart_address')
    .where('cart_address_id', '=', cart.getData('billing_address_id'))
    .load(connection);
  delete cartBillingAddress.uuid;
  billAddr = await insert('order_address').given(cartBillingAddress).execute(connection);
}

// ...
billing_address_id: billAddr ? billAddr.insertId : null,
```

:::danger
`order.billing_address_id` **can be null**. Any payment, invoicing, tax, fraud, export, or email code that assumed an order always has a billing address is now wrong.

Core renderers were updated to tolerate the null, but the shared `AddressSummary` component was **not** — it dereferences the address. Always conditionalize at the call site:

```tsx
{order.billingAddress ? <AddressSummary address={order.billingAddress} /> : null}
```
:::

The checkout UI hides the billing section and its gates when `totalQty > 0 && grandTotal.value <= 0`. The `totalQty` guard matters: a freshly created cart has a `grandTotal` of zero before the first sync, and without the guard the billing step would flicker away on every new cart.

If your extension genuinely needs a billing address on free orders — a compliance requirement, say — add your own validation rule rather than reverting the core one:

```ts title="extensions/strict-billing/src/bootstrap.ts"
import { addOrderValidationRule } from '@evershop/evershop/checkout/services';

export default () => {
  addOrderValidationRule({
    id: 'billingAddressAlwaysRequired',
    func: (cart) => Boolean(cart.getData('billing_address_id')),
    errorMessage: 'Billing address is required'
  });
};
```

## Checklist for payment extensions

1. Accept the optional context parameter in your `validator` and never treat `cartTotal === undefined` as a rejection.
2. Do not attempt to serve zero-total carts — you will be filtered out regardless.
3. Never register the reserved code `zero_checkout`.
4. Stop assuming `order.billing_address_id` is non-null: guard every read, in server code and in components.
5. If you list payment methods yourself, pass `{ cartTotal }` so the same rules apply as on the storefront.
6. When testing, place an order with a 100% coupon and confirm your method disappears, the order lands `paid`, and your subscribers still receive `order_placed`.

## See Also

- [Payment Method Development](./payment-method-development) — the full registration, client, and gateway contract
- [Order Status Management](./order-status-management) — how `paid` becomes `processing` or `completed`
- [Cart Field System](./cart-field-system) — the `grand_total` and `payment_method` field resolvers
- [Events and Subscribers](./events-and-subscribers) — what listens to `order_placed`
- [Multi-Shipment and Fulfillment](./multi-shipment-and-fulfillment) — the other 2.2.1 order-pipeline change

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
