---
sidebar_position: 47
title: CheckoutContext
description: Context for managing checkout process including order placement, shipping, and payment methods.
keywords:
  - EverShop CheckoutContext
  - checkout
  - order placement
groups:
  - contexts
---

# CheckoutContext

## Description

Manages checkout process state and operations. Handles order placement, shipping/payment methods, checkout data, and form state. Integrates with cart context for checkout flow.

## Import

```typescript
import { CheckoutProvider, useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';
```

## Usage

### Setup Provider

```tsx
import { CheckoutProvider } from '@components/frontStore/checkout/CheckoutContext';
import { FormProvider, useForm } from 'react-hook-form';

function CheckoutPage() {
  const methods = useForm();
  const [formEnabled, setFormEnabled] = useState(true);

  return (
    <FormProvider {...methods}>
      <CheckoutProvider
        placeOrderApi="/api/placeOrder"
        checkoutSuccessUrl="/checkout/success"
        allowGuestCheckout={true}
        form={methods}
        enableForm={() => setFormEnabled(true)}
        disableForm={() => setFormEnabled(false)}
      >
        {/* Checkout components */}
      </CheckoutProvider>
    </FormProvider>
  );
}
```

### Access Checkout State

```tsx
import { useCheckout } from '@components/frontStore/checkout/CheckoutContext';

function CheckoutSummary() {
  const { loading, requiresShipment, orderPlaced, orderId } = useCheckout();

  if (orderPlaced) {
    return <div>Order {orderId} placed successfully!</div>;
  }

  return (
    <div>
      {loading && <div>Processing...</div>}
      {requiresShipment && <div>Shipping required</div>}
    </div>
  );
}
```

### Use Checkout Actions

```tsx
import { useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';

function CheckoutButton() {
  const { checkout } = useCheckoutDispatch();

  const handleCheckout = async () => {
    try {
      const order = await checkout();
      window.location.href = `/checkout/success/${order.uuid}`;
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <button onClick={handleCheckout}>
      Place Order
    </button>
  );
}
```

## API

### CheckoutProvider Props

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>placeOrderApi</td>
      <td>string</td>
      <td>Yes</td>
      <td>API endpoint for placing order</td>
    </tr>
    <tr>
      <td>checkoutSuccessUrl</td>
      <td>string</td>
      <td>Yes</td>
      <td>Success page URL</td>
    </tr>
    <tr>
      <td>allowGuestCheckout</td>
      <td>boolean</td>
      <td>No</td>
      <td>Allow guest checkout (default: false)</td>
    </tr>
    <tr>
      <td>form</td>
      <td>UseFormReturn</td>
      <td>Yes</td>
      <td>React Hook Form instance</td>
    </tr>
    <tr>
      <td>enableForm</td>
      <td>() =&gt; void</td>
      <td>Yes</td>
      <td>Enable form callback</td>
    </tr>
    <tr>
      <td>disableForm</td>
      <td>() =&gt; void</td>
      <td>Yes</td>
      <td>Disable form callback</td>
    </tr>
    <tr>
      <td>children</td>
      <td>ReactNode</td>
      <td>Yes</td>
      <td>Child components</td>
    </tr>
  </tbody>
</table>

### useCheckout Hook

Returns checkout state:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>orderPlaced</td>
      <td>boolean</td>
      <td>True when order placed successfully</td>
    </tr>
    <tr>
      <td>orderId</td>
      <td>string</td>
      <td>Placed order ID</td>
    </tr>
    <tr>
      <td>loading</td>
      <td>boolean</td>
      <td>True when placing order</td>
    </tr>
    <tr>
      <td>cartId</td>
      <td>string</td>
      <td>Current cart UUID</td>
    </tr>
    <tr>
      <td>checkoutSuccessUrl</td>
      <td>string</td>
      <td>Success page URL</td>
    </tr>
    <tr>
      <td>requiresShipment</td>
      <td>boolean</td>
      <td>True if items need shipping</td>
    </tr>
    <tr>
      <td>allowGuestCheckout</td>
      <td>boolean</td>
      <td>Guest checkout allowed</td>
    </tr>
    <tr>
      <td>checkoutData</td>
      <td>CheckoutData</td>
      <td>Current checkout data</td>
    </tr>
    <tr>
      <td>form</td>
      <td>UseFormReturn</td>
      <td>Form instance</td>
    </tr>
    <tr>
      <td>registeredPaymentComponents</td>
      <td>Record&lt;string, Component&gt;</td>
      <td>Payment method renderers</td>
    </tr>
  </tbody>
</table>

### useCheckoutDispatch Hook

Returns checkout actions:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Signature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>placeOrder</td>
      <td>() =&gt; Promise&lt;any&gt;</td>
      <td>Place order (expects data in cart)</td>
    </tr>
    <tr>
      <td>checkout</td>
      <td>() =&gt; Promise&lt;any&gt;</td>
      <td>Checkout with all data submission</td>
    </tr>
    <tr>
      <td>getPaymentMethods</td>
      <td>() =&gt; PaymentMethod[]</td>
      <td>Get available payment methods</td>
    </tr>
    <tr>
      <td>getShippingMethods</td>
      <td>(params?) =&gt; Promise&lt;ShippingMethod[]&gt;</td>
      <td>Get shipping methods</td>
    </tr>
    <tr>
      <td>setCheckoutData</td>
      <td>(data: CheckoutData) =&gt; void</td>
      <td>Replace checkout data</td>
    </tr>
    <tr>
      <td>updateCheckoutData</td>
      <td>(data: Partial&lt;CheckoutData&gt;) =&gt; void</td>
      <td>Update checkout data</td>
    </tr>
    <tr>
      <td>clearCheckoutData</td>
      <td>() =&gt; void</td>
      <td>Clear all checkout data</td>
    </tr>
    <tr>
      <td>registerPaymentComponent</td>
      <td>(code, component) =&gt; void</td>
      <td>Register payment method renderer</td>
    </tr>
    <tr>
      <td>enableForm</td>
      <td>() =&gt; void</td>
      <td>Enable checkout form</td>
    </tr>
    <tr>
      <td>disableForm</td>
      <td>() =&gt; void</td>
      <td>Disable checkout form</td>
    </tr>
  </tbody>
</table>

## Type Definitions

### PaymentMethod

```typescript
interface PaymentMethod {
  code: string;
  name: string;
  [key: string]: any;  // Extended fields
}
```

### ShippingMethod

```typescript
interface ShippingMethod {
  code: string;
  name: string;
  cost?: {
    value: number;
    text: string;
  };
  [key: string]: any;  // Extended fields
}
```

### ShippingAddressParams

```typescript
interface ShippingAddressParams {
  country: string;
  province?: string;
  postcode?: string;
}
```

### PaymentMethodComponent

```typescript
interface PaymentMethodComponent {
  nameRenderer: React.ComponentType<{ isSelected: boolean }>;
  formRenderer: React.ComponentType<{ isSelected: boolean }>;
  checkoutButtonRenderer: React.ComponentType<{ isSelected: boolean }>;
}
```

## Examples

### Basic Checkout Flow

```tsx
import { CheckoutProvider, useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';
import { FormProvider, useForm } from 'react-hook-form';

function CheckoutPage() {
  const methods = useForm();
  const [formEnabled, setFormEnabled] = useState(true);

  return (
    <FormProvider {...methods}>
      <CheckoutProvider
        placeOrderApi="/api/placeOrder"
        checkoutSuccessUrl="/checkout/success"
        form={methods}
        enableForm={() => setFormEnabled(true)}
        disableForm={() => setFormEnabled(false)}
      >
        <CheckoutForm />
      </CheckoutProvider>
    </FormProvider>
  );
}

function CheckoutForm() {
  const { loading, orderPlaced } = useCheckout();
  const { checkout } = useCheckoutDispatch();

  const handleSubmit = async () => {
    try {
      await checkout();
    } catch (error) {
      console.error(error);
    }
  };

  if (orderPlaced) {
    return <div>Order placed!</div>;
  }

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Processing...' : 'Place Order'}
    </button>
  );
}
```

### Payment Methods

```tsx
import { useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';
import { useEffect, useState } from 'react';

function PaymentMethods() {
  const { getPaymentMethods } = useCheckoutDispatch();
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    const available = getPaymentMethods();
    setMethods(available);
  }, []);

  return (
    <div className="payment-methods">
      <h3>Payment Method</h3>
      {methods.map(method => (
        <label key={method.code}>
          <input type="radio" name="payment" value={method.code} />
          {method.name}
        </label>
      ))}
    </div>
  );
}
```

### Shipping Methods

```tsx
import { useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';
import { useState, useEffect } from 'react';

function ShippingMethods({ address }) {
  const { getShippingMethods } = useCheckoutDispatch();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setLoading(true);
      getShippingMethods({
        country: address.country,
        province: address.province,
        postcode: address.postcode
      })
        .then(setMethods)
        .finally(() => setLoading(false));
    }
  }, [address]);

  return (
    <div className="shipping-methods">
      <h3>Shipping Method</h3>
      {loading && <div>Loading...</div>}
      {methods.map(method => (
        <label key={method.code}>
          <input type="radio" name="shipping" value={method.code} />
          {method.name} - {method.cost?.text || 'Free'}
        </label>
      ))}
    </div>
  );
}
```

### Checkout Data Management

```tsx
import { useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';

function CheckoutForm() {
  const { updateCheckoutData, checkout } = useCheckoutDispatch();

  const handleAddressChange = (address) => {
    updateCheckoutData({
      shipping_address: address
    });
  };

  const handlePaymentChange = (paymentCode) => {
    updateCheckoutData({
      payment_method: paymentCode
    });
  };

  const handleSubmit = async () => {
    try {
      await checkout();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form>
      {/* Address fields */}
      {/* Payment selection */}
      <button type="button" onClick={handleSubmit}>
        Place Order
      </button>
    </form>
  );
}
```

### Register Payment Component

```tsx
import { useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';
import { useEffect } from 'react';

function PaymentMethodName({ isSelected }) {
  return <span>Credit Card</span>;
}

function PaymentMethodForm({ isSelected }) {
  if (!isSelected) return null;
  return (
    <div>
      <input placeholder="Card Number" />
      <input placeholder="Expiry" />
      <input placeholder="CVV" />
    </div>
  );
}

function CheckoutButton({ isSelected }) {
  if (!isSelected) return null;
  return <button>Pay with Card</button>;
}

function CreditCardPayment() {
  const { registerPaymentComponent } = useCheckoutDispatch();

  useEffect(() => {
    registerPaymentComponent('credit_card', {
      nameRenderer: PaymentMethodName,
      formRenderer: PaymentMethodForm,
      checkoutButtonRenderer: CheckoutButton
    });
  }, []);

  return null;
}
```

### Complete Checkout Page

```tsx
import { CheckoutProvider, useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext';
import { FormProvider, useForm } from 'react-hook-form';
import { useState } from 'react';

function CheckoutPage() {
  const methods = useForm();
  const [formEnabled, setFormEnabled] = useState(true);

  return (
    <FormProvider {...methods}>
      <CheckoutProvider
        placeOrderApi="/api/placeOrder"
        checkoutSuccessUrl="/checkout/success"
        allowGuestCheckout={true}
        form={methods}
        enableForm={() => setFormEnabled(true)}
        disableForm={() => setFormEnabled(false)}
      >
        <CheckoutContent formEnabled={formEnabled} />
      </CheckoutProvider>
    </FormProvider>
  );
}

function CheckoutContent({ formEnabled }) {
  const { loading, orderPlaced, orderId, requiresShipment } = useCheckout();
  const { 
    getPaymentMethods, 
    getShippingMethods, 
    updateCheckoutData, 
    checkout 
  } = useCheckoutDispatch();

  const handleSubmit = async () => {
    try {
      const order = await checkout();
      window.location.href = `/checkout/success/${order.uuid}`;
    } catch (error) {
      alert(error.message);
    }
  };

  if (orderPlaced) {
    return (
      <div className="success">
        <h1>Order Placed!</h1>
        <p>Order ID: {orderId}</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Shipping Address */}
      {requiresShipment && (
        <section>
          <h2>Shipping Address</h2>
          {/* Address form fields */}
        </section>
      )}

      {/* Shipping Method */}
      {requiresShipment && (
        <section>
          <h2>Shipping Method</h2>
          {/* Shipping method selection */}
        </section>
      )}

      {/* Payment Method */}
      <section>
        <h2>Payment Method</h2>
        {/* Payment method selection */}
      </section>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !formEnabled}
        className="checkout-btn"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}
```

## Methods Details

### placeOrder()

Places order with cart data already saved. Use when checkout data is already in cart context.

### checkout()

Validates form, submits all checkout data, and places order. Use for complete checkout flow.

### getShippingMethods(params?)

- **Without params**: Returns initial methods from cart
- **With params**: Fetches methods based on address

## Features

- **Order Placement**: Two methods (placeOrder, checkout)
- **Form Integration**: React Hook Form support
- **Payment Methods**: Registry system for custom renderers
- **Shipping Methods**: Dynamic fetching based on address
- **Checkout Data**: Centralized data management
- **Loading States**: Tracks order placement progress
- **Error Handling**: Retry mechanism with exponential backoff
- **Guest Checkout**: Optional guest checkout support
- **Form Control**: Enable/disable form during processing
- **Type Safe**: Full TypeScript support

## Requirements

- **CartContext**: Must be wrapped in cart provider
- **FormProvider**: Requires React Hook Form
- **Cart ID**: Cart must be initialized

## Related Components

- [CartContext](CartContext.md) - Shopping cart context
