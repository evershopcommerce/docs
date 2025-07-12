---
sidebar_position: 5
keywords:
  - EverShop Stripe payment gateway integration
  - payment processing
  - e-commerce payments
sidebar_label: Stripe Payment Integration
title: Integrating Stripe Payment Gateway
description: This step-by-step guide demonstrates how to integrate the Stripe payment gateway with EverShop, providing a blueprint for implementing additional payment gateways in your e-commerce platform.
---

# Integrating Stripe Payment Gateway

By default, EverShop supports Stripe as an online payment gateway. This document walks you through the integration process, serving as a reference for implementing your own custom payment gateways with EverShop.

## Understanding the Integration Structure

Since Stripe is part of EverShop's core functionality, you can find the Stripe module in the `modules/stripe` folder.

If you want to create your own payment gateway, follow the [Create Your First Extension](/docs/development/module/create-your-first-extension) guide to establish the foundation for your payment integration.

## Registering Your Payment Gateway for Checkout

During checkout, EverShop renders a list of payment options for customers to choose from. To add your payment gateway to this list, you need to hook into the `getPaymentMethods` API.

To hook into an API, create a middleware function. Let's set up a middleware to register our payment gateway:

```bash
stripe
├── api
│   └── getPaymentMethods
│       └── registerStripe[sendMethods].js
```

The middleware name indicates that it executes before the `sendMethods` middleware, allowing us to add our payment gateway to the list before it's sent to the client.

Here's the complete middleware implementation:

```js
import { getConfig } from "@evershop/evershop/lib/util/getConfig";
import { getSetting } from "@evershop/evershop/setting/services";

export default async (request, response) => {
  // Check if Stripe is enabled
  const stripeConfig = getConfig("system.stripe", {});
  let stripeStatus;
  if (stripeConfig.status) {
    stripeStatus = stripeConfig.status;
  } else {
    stripeStatus = await getSetting("stripePaymentStatus", 0);
  }
  if (parseInt(stripeStatus, 10) === 1) {
    return {
      methodCode: "stripe",
      methodName: await getSetting("stripeDislayName", "Stripe"),
    };
  } else {
    return null;
  }
};
```

Your middleware should return a payment gateway object containing `methodCode` (a unique identifier) and `methodName` (the display name that appears on the checkout page). You can include validation logic, such as checking if the payment gateway is enabled, and return null if it should not be displayed.

After implementing this step, your payment gateway will appear in the checkout payment options.

## Adding the Payment Method to the Cart

When a customer selects a payment method during checkout, EverShop calls the `addPaymentMethod` API to associate that payment method with the cart. This API simply records the `methodCode` and `methodName` in the cart without initiating any payment processing.

:::info
You might wonder about validating the payment method before adding it to the cart. We'll cover validation in later sections. For now, we'll assume no validation is needed at this stage.
:::

## Creating a Payment Intent

Stripe requires creating a payment intent before processing a payment. For more information about payment intents, see the [Stripe documentation](https://stripe.com/docs/payments/payment-intents).

Let's create an API endpoint to generate a payment intent:

```bash
stripe
├── api
    └── createPaymentIntent
          └── [context]bodyParser[auth].js
          └── createPaymentIntent.js
          └── route.json
```

Here's the implementation of `createPaymentIntent.js`:

```js
import { select } from "@evershop/postgres-query-builder";
import { pool } from "@evershop/evershop/src/lib/postgres";
import smallestUnit from "zero-decimal-currencies";
import { getSetting } from "@evershop/evershop/setting/services";
import stripePayment from "stripe";
import { getConfig } from "@evershop/evershop/lib/util/getConfig";

export default async (request, response, next) => {
  const { body } = request;
  // Check the order
  const order = await select()
    .from("order")
    .where("uuid", "=", body.orderId)
    .load(pool);

  if (!order) {
    response.json({
      success: false,
      message: "The requested order does not exist",
    });
  } else {
    const stripeConfig = getConfig("system.stripe", {});
    let stripeSecretKey;
    if (stripeConfig.secretKey) {
      stripeSecretKey = stripeConfig.secretKey;
    } else {
      stripeSecretKey = await getSetting("stripeSecretKey", "");
    }

    const stripe = stripePayment(stripeSecretKey);
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: smallestUnit.default(order.grand_total, order.currency),
      currency: order.currency,
      metadata: {
        orderId: body.orderId,
      },
    });

    response.json({
      clientSecret: paymentIntent.client_secret,
      success: true,
    });
  }
};
```

And the corresponding `route.json` file:

```json
{
  "methods": ["POST"],
  "path": "/stripe/paymentIntents",
  "access": "public"
}
```

When a customer clicks the "Place Order" button, EverShop calls this API to create a payment intent and return the client secret to the frontend, which then uses it to complete the payment process.

## Creating a Payment Form

Stripe provides tools to create a secure payment form. For more information, see the [Stripe Quick Start Guide](https://stripe.com/docs/payments/payment-intents/quickstart).

Let's create a React component for our payment form that will display when a customer selects the Stripe payment method:

```bash
stripe
├── pages
│   └── frontStore
│       └── checkout
│           └── Stripe.jsx
```

Here's the implementation of `Stripe.jsx`:

```js
import PropTypes from "prop-types";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCheckout } from "@components/common/context/checkout";
import StripeLogo from "@components/frontStore/stripe/StripeLogo";
import CheckoutForm from "@components/frontStore/stripe/checkout/CheckoutForm";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// loadStripe is initialized with your real test publishable API key.
let stripe;
const stripeLoader = (publishKey) => {
  if (!stripe) {
    stripe = loadStripe(publishKey);
  }
  return stripe;
};

function StripeApp({ stripePublishableKey }) {
  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <div className="App">
      <Elements stripe={stripeLoader(stripePublishableKey)}>
        <CheckoutForm stripePublishableKey={stripePublishableKey} />
      </Elements>
    </div>
  );
}

StripeApp.propTypes = {
  stripePublishableKey: PropTypes.string.isRequired,
};

export default function StripeMethod({ setting }) {
  const checkout = useCheckout();
  const { paymentMethods, setPaymentMethods } = checkout;
  // Get the selected payment method
  const selectedPaymentMethod = paymentMethods
    ? paymentMethods.find((paymentMethod) => paymentMethod.selected)
    : undefined;

  return (
    <div>
      <div className="flex justify-start items-center gap-1">
        {(!selectedPaymentMethod ||
          selectedPaymentMethod.code !== "stripe") && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPaymentMethods((previous) =>
                previous.map((paymentMethod) => {
                  if (paymentMethod.code === "stripe") {
                    return {
                      ...paymentMethod,
                      selected: true,
                    };
                  } else {
                    return {
                      ...paymentMethod,
                      selected: false,
                    };
                  }
                })
              );
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-circle">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </a>
        )}
        {selectedPaymentMethod && selectedPaymentMethod.code === "stripe" && (
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2c6ecb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-check-circle">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        )}
        <div>
          <StripeLogo width={100} />
        </div>
      </div>
      <div>
        {selectedPaymentMethod && selectedPaymentMethod.code === "stripe" && (
          <div>
            <StripeApp stripePublishableKey={setting.stripePublishableKey} />
          </div>
        )}
      </div>
    </div>
  );
}

StripeMethod.propTypes = {
  setting: PropTypes.shape({
    stripePublishableKey: PropTypes.string.isRequired,
  }).isRequired,
};

export const layout = {
  areaId: "checkoutPaymentMethodstripe",
  sortOrder: 10,
};

export const query = `
  query Query {
    setting {
      stripeDislayName
      stripePublishableKey
    }
  }
`;
```

This component appears as a payment option on the checkout page. When selected, it displays the Stripe payment form.

Note how we use the `layout` property to specify where this component should appear. The `areaId` follows the pattern `checkoutPaymentMethod` + your payment method code. We also use GraphQL `query` to fetch the Stripe publishable key from settings.

Next, let's create the `CheckoutForm.jsx` component that handles the actual payment form:

```js
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useQuery } from "urql";
import { useCheckout } from "@components/common/context/checkout";
import "./CheckoutForm.scss";
import { Field } from "@components/common/form/Field";
import TestCards from "./TestCards";

const cartQuery = `
  query Query($cartId: String) {
    cart(id: $cartId) {
      billingAddress {
        cartAddressId
        fullName
        postcode
        telephone
        country {
          name
          code
        }
        province {
          name
          code
        }
        city
        address1
        address2
      }
      shippingAddress {
        cartAddressId
        fullName
        postcode
        telephone
        country {
          name
          code
        }
        province {
          name
          code
        }
        city
        address1
        address2
      }
      customerEmail
    }
  }
`;

const cardStyle = {
  style: {
    base: {
      color: "#737373",
      fontFamily: "Arial, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#737373",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

export default function CheckoutForm({ stripePublishableKey }) {
  const [, setSucceeded] = useState(false);
  const [cardComleted, setCardCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [showTestCard, setShowTestCard] = useState("success");
  const stripe = useStripe();
  const elements = useElements();
  const { cartId, orderId, orderPlaced, paymentMethods, checkoutSuccessUrl } =
    useCheckout();

  const [result] = useQuery({
    query: cartQuery,
    variables: {
      cartId,
    },
    pause: orderPlaced === true,
  });

  useEffect(() => {
    // Create PaymentIntent as soon as the order is placed
    if (orderId) {
      window
        .fetch("/api/stripe/paymentIntents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.data.clientSecret);
        });
    }
  }, [orderId]);

  useEffect(() => {
    const pay = async () => {
      const billingAddress =
        result.data.cart.billingAddress || result.data.cart.shippingAddress;
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: billingAddress.fullName,
            email: result.data.cart.customerEmail,
            phone: billingAddress.telephone,
            address: {
              line1: billingAddress.address1,
              country: billingAddress.country.code,
              state: billingAddress.province.code,
              postal_code: billingAddress.postcode,
              city: billingAddress.city,
            },
          },
        },
      });

      if (payload.error) {
        setError(`Payment failed ${payload.error.message}`);
      } else {
        setError(null);
        setSucceeded(true);
        // Redirect to checkout success page
        window.location.href = `${checkoutSuccessUrl}/${orderId}`;
      }
    };

    if (orderPlaced === true && clientSecret) {
      pay();
    }
  }, [orderPlaced, clientSecret, result]);

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    if (event.complete === true && !event.error) {
      setCardCompleted(true);
    }
  };

  const testSuccess = () => {
    setShowTestCard("success");
  };

  const testFailure = () => {
    setShowTestCard("failure");
  };

  if (result.error) {
    return (
      <p>
        Oh no...
        {error.message}
      </p>
    );
  }
  // Check if the selected payment method is Stripe
  const stripePaymentMethod = paymentMethods.find(
    (method) => method.code === "stripe" && method.selected === true
  );
  if (!stripePaymentMethod) return null;

  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <div>
      <div className="stripe-form">
        {stripePublishableKey && stripePublishableKey.startsWith("pk_test") && (
          <TestCards
            showTestCard={showTestCard}
            testSuccess={testSuccess}
            testFailure={testFailure}
          />
        )}
        <CardElement
          id="card-element"
          options={cardStyle}
          onChange={handleChange}
        />
      </div>
      {/* Show any error that happens when processing the payment */}
      {error && (
        <div className="card-error text-critical mb-2" role="alert">
          {error}
        </div>
      )}
      <Field
        type="hidden"
        name="stripeCartComplete"
        value={cardComleted ? 1 : ""}
        validationRules={[
          {
            rule: "notEmpty",
            message: "Please complete the card information",
          },
        ]}
      />
    </div>
  );
}

CheckoutForm.propTypes = {
  stripePublishableKey: PropTypes.string.isRequired,
};
```

The EverShop checkout process is organized in steps: contact information, shipping information, and payment information. The checkout context manages these steps and automatically triggers the order creation API when all steps are completed.

For the payment integration, we need to:

1. Manage the billing address form and payment method
2. Save the billing address and payment method
3. Mark the payment information step as completed
4. When an order is placed (and orderId is available), create a payment intent and get the client secret
5. Use the client secret to confirm the payment with Stripe
6. Process the payment result and redirect to the success page

## Managing Order Payment Status with Webhooks

When an order is initially placed, its payment status is set to `pending`.

After a successful payment, Stripe sends a webhook notification to your server, which updates the order payment status to `paid`. Let's set up this webhook system:

### Creating a Webhook Endpoint

Create a webhook endpoint to receive notifications from Stripe:

```bash
stripe
└── api
    └── stripeWebHook
          ├── route.json
          └── bodyJson.js
          └── [bodyJson]webhook.js
```

Define the route in `route.json`:

```json
{
  "methods": ["POST"],
  "path": "/stripe/webhook",
  "access": "public"
}
```

Implement the webhook handler in `[bodyJson]webhook.js`:

```js
import {
  insert,
  startTransaction,
  update,
  commit,
  rollback,
  select,
} from "@evershop/postgres-query-builder";
import { getConnection } from "@evershop/evershop/lib/postgres";
import { getConfig } from "@evershop/evershop/lib/util/getConfig";
import { emit } from "@evershop/evershop/lib/event";
import { debug } from "@evershop/evershop/lib/log";
import { getSetting } from "@evershop/evershop/setting/services";

export default async (request, response, next) => {
  const sig = request.headers["stripe-signature"];

  let event;
  const connection = await getConnection();
  try {
    const stripeConfig = getConfig("system.stripe", {});
    let stripeSecretKey;
    if (stripeConfig.secretKey) {
      stripeSecretKey = stripeConfig.secretKey;
    } else {
      stripeSecretKey = await getSetting("stripeSecretKey", "");
    }
    const stripe = require("stripe")(stripeSecretKey);

    // Webhook endpoint secret
    let endpointSecret;
    if (stripeConfig.endpointSecret) {
      endpointSecret = stripeConfig.endpointSecret;
    } else {
      endpointSecret = await getSetting("stripeEndpointSecret", "");
    }

    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    await startTransaction(connection);
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;
        // Load the order
        const order = await select()
          .from("order")
          .where("uuid", "=", orderId)
          .load(connection);

        // Update the order
        // Create payment transaction
        await insert("payment_transaction")
          .given({
            amount: paymentIntent.amount,
            payment_transaction_order_id: order.order_id,
            transaction_id: paymentIntent.id,
            transaction_type: "online",
            payment_action:
              paymentIntent.capture_method === "automatic"
                ? "Capture"
                : "Authorize",
          })
          .execute(connection);

        // Update the order status
        await update("order")
          .given({ payment_status: "paid" })
          .where("order_id", "=", order.order_id)
          .execute(connection);

        // Add an activity log
        await insert("order_activity")
          .given({
            order_activity_order_id: order.order_id,
            comment: `Customer paid by using credit card. Transaction ID: ${paymentIntent.id}`,
          })
          .execute(connection);

        // Emit event to add order placed event
        await emit("order_placed", { ...order });
        break;
      }
      case "payment_method.attached": {
        debug("PaymentMethod was attached to a Customer!");
        break;
      }
      // ... handle other event types
      default: {
        debug(`Unhandled event type ${event.type}`);
      }
    }
    await commit(connection);
    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  } catch (err) {
    await rollback(connection);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
};
```

This middleware processes incoming webhooks from Stripe, updating the order payment status to `paid`, creating a payment transaction record, and adding an activity log entry.

### Configuring the Webhook in Stripe Dashboard

To set up the webhook in your Stripe account:

1. Go to the Stripe dashboard
2. Navigate to Developers → Webhooks → Add endpoint
3. Enter your webhook URL: `https://<your-domain>/api/stripe/webhook`
4. Select the events you want to receive (at minimum, select `payment_intent.succeeded`)

## Implementing Stripe Settings in the Admin Panel

To provide administrative control over Stripe settings, create a settings page in the admin panel. This allows store administrators to configure API keys and webhook endpoints.

We won't detail this process here as it's similar to creating other admin pages. You can refer to previous tutorials on creating pages or extending layouts, or examine the source code [here](https://github.com/evershopcommerce/evershop/tree/dev/packages/evershop/src/modules/stripe) for implementation details.

## Summary

In this tutorial, we've covered how to integrate the Stripe payment gateway with EverShop:

1. We created middleware to register Stripe as a payment method
2. We built an API endpoint to create payment intents
3. We developed React components to display and handle Stripe payment forms
4. We set up a webhook system to process payment confirmations
5. We briefly discussed admin settings for configuring Stripe

Each payment gateway has its own unique flow and integration requirements. This tutorial focused on Stripe as an example, but the same principles apply when integrating other payment gateways with EverShop.

By following this pattern, you can extend EverShop to support additional payment methods that meet your specific business needs.
