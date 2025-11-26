---
sidebar_position: 1
hide_table_of_contents: true
keywords:
  - EverShop API
  - Payment Methods
  - E-commerce Payments
  - Payment Gateway Integration
  - REST API
sidebar_label: Payment Methods
title: Payment Method API
description: Comprehensive guide to managing payment methods in EverShop. Learn how to retrieve available payment options, configure payment gateways, and integrate with your checkout process.
---

# Payment Method API

## Overview

The Payment Method API provides endpoints for managing payment options in your EverShop store. These endpoints allow you to retrieve available payment methods, which can be presented to customers during the checkout process, enabling them to complete their purchases securely.

import Api from '@site/src/components/rest/Api';

## Endpoints

### List Available Payment Methods

Retrieves all payment methods currently enabled in your EverShop store. Use this endpoint to display payment options to customers during checkout.

<Api
method="GET"
url="/api/paymentMethods"
responseSample={`{
  "data": {
    "methods": [
      {
        "code": "cod",
        "name": "Cash On Delivery"
      },
      {
        "code": "paypal",
        "name": "PayPal"
      },
      {
        "code": "stripe",
        "name": "Credit Card"
      }
    ]
  }
}`}
isPrivate={false}
/>
