---
sidebar_position: 20
keywords:
  - widget development
  - EverShop customization
  - e-commerce widgets
sidebar_label: Widget Development
title: Developing Widgets for EverShop
description: Learn how to develop custom widgets for your EverShop store, enhancing functionality and providing a unique shopping experience.
---

## What is a Widget?

<p align="center">

![EverShop widget system](./img/widget.png "EverShop widget system")

</p>

Widgets are modular, self-contained components that can be embedded throughout your EverShop storefront. They serve as building blocks that display specific content or provide functionality to users. Widgets can present various types of content, such as product listings, promotional banners, or informational text. They can also offer interactive functionality, like search boxes or shopping cart summaries.

In EverShop, widgets are a key part of the storefront's user interface. Store administrators can create, configure, and manage widgets through the admin panel without requiring technical knowledge. Once configured, these widgets display on the customer-facing pages, creating a dynamic and engaging shopping experience.

## Why Develop Custom Widgets?

Custom widgets offer significant benefits for EverShop stores:

1. **Flexible Content Display**: Widgets provide a structured way to present various types of content throughout your store.

2. **Enhanced User Experience**: Well-designed widgets can improve navigation, highlight key products, and streamline the shopping process.

3. **Store Customization**: Custom widgets allow store owners to create a unique brand identity and shopping experience that distinguishes them from competitors.

4. **Modular Functionality**: Widgets encapsulate specific functionality in reusable components, making your codebase more maintainable.

5. **Non-Technical Management**: Once developed, widgets can be managed by non-technical staff through the admin interface.

## How to Develop a Widget

:::info
Before beginning widget development, we recommend reviewing the [EverShop Extension Overview](./extension-overview) and [Create Your First Extension](./create-your-first-extension) documentation to understand extension structure and extension development.
:::

This guide will walk you through the process of developing a custom widget for EverShop. We'll create a simple greeting widget that displays a customizable welcome message on your storefront.

We'll assume you have a running EverShop installation. If you haven't installed EverShop yet, please follow the [installation guide](../getting-started/installation-guide) first.

Let's start!

### Step 1: Create an Extension

The first step in developing a widget is to create an extension that will contain your widget code. Let's create an extension called `greeting_widget` with the following structure:

```bash
extensions/
└── greeting_widget/
    ├── dist/                     # Compiled code for the extension
    ├── src/
    │   ├── bootstrap.ts
    │   ├── components/
    │   │   └── widgets/
    │   │       ├── GreetingWidgetSetting.tsx
    │   │       └── GreetingWidget.tsx
    └── package.json
```

Create a `package.json` file with the following content:

```json title="extensions/greeting_widget/package.json"
{
  "name": "greeting_widget",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "compile": "tsc && copyfiles -u 1 \"src/**/*.{graphql,scss,json}\" dist"
  },
  "description": "A simple greeting widget for EverShop",
  "keywords": ["EverShop widget"]
}
```

### Step 2: Register Your Widget

Next, create a `bootstrap.ts` file to register your widget with EverShop. This file runs when your extension initializes:

```ts title="extensions/greeting_widget/src/bootstrap.ts"
import config from "config";
import path from "path";
import { CONSTANTS } from "@evershop/evershop/lib/helpers";
import { registerWidget } from "@evershop/evershop/lib/widget";

export default () => {
  // Register our greeting widget
  registerWidget({
    type: "greeting_widget",
    name: "Greeting Widget",
    description: "Display a greeting message",
    settingComponent: path.resolve(
      CONSTANTS.LIBPATH,
      "components/widgets/GreetingWidgetSetting.js"
    ),
    component: path.resolve(
      CONSTANTS.LIBPATH,
      "components/widgets/GreetingWidget.js"
    ),
    enabled: true,
    defaultSettings: {
      text: "Hello, welcome to our store!",
      className: "",
    },
  });
};
```

Let's examine the properties in the widget registration object:

- `settingComponent`: Path to the component that renders the widget's configuration interface in the admin panel
- `component`: Path to the component that renders the actual widget on the storefront
- `name`: The name displayed in the admin panel when adding the widget
- `type`: A unique identifier for the widget type, used internally by EverShop
- `description`: A brief explanation of the widget's purpose and functionality
- `defaultSettings`: Initial configuration values for newly created widgets
- `enabled`: Flag that determines whether the widget is available for use

:::warning
Both `settingComponent` and `component` paths must be resolvable by Node.js. Make sure you've configured the `extensions` folder as a workspace in your project's root `package.json` file. This allows Node.js to locate your components correctly.
:::

Ok, we have registered our widget. Let's move to the next step.

### Step 3: Create the Setting Component

The setting component provides the configuration interface for your widget in the admin panel. This component allows administrators to customize how your widget behaves and appears.

Create a file called `GreetingWidgetSetting.tsx`:

```javascript title="extensions/greeting_widget/components/widget/GreetingWidgetSetting.tsx"
import React from "react";
import PropTypes from "prop-types";
import { Field } from "@components/common/form/Field";

export default function GreetingWidgetSetting({
  greetingWidget: { text, className },
}) {
  return (
    <div>
      <p>Configure your greeting widget</p>
      <Field
        type="text"
        name="settings[className]"
        label="Custom CSS Classes"
        value={className}
        placeholder="Enter custom CSS classes"
      />
      <Field
        type="textarea"
        name="settings[text]"
        label="Greeting Message"
        value={text}
      />
    </div>
  );
}

GreetingWidgetSetting.propTypes = {
  greetingWidget: PropTypes.shape({
    text: PropTypes.string,
    className: PropTypes.string,
  }),
};

GreetingWidgetSetting.defaultProps = {
  greetingWidget: {
    text: "Hello, welcome to our store!",
    className: "",
  },
};

export const query = `
  query Query($settings: JSON) {
    greetingWidget(settings: $settings) {
      text
      className
    }
  }
`;

export const variables = `{
  settings: getWidgetSetting()
}`;
```

Key points about the setting component:

- EverShop handles form submission automatically, so you don't need to implement submission logic.

- The component uses GraphQL to fetch current widget settings. The query returns data based on the widget's configured settings.

- The special function `getWidgetSetting()` retrieves the settings for the specific widget instance being configured. EverShop automatically injects this data into your query.

- Each setting field must have a name that follows the format `settings[fieldName]` to be properly saved by EverShop.

### Step 4: Define the GraphQL Schema

Next, we need to create GraphQL types and resolvers to support our widget's data requirements. Create the following directory structure:

```bash
extensions/
└── greeting_widget/
    ├── dist/                     # Compiled code for the extension
    ├── src/
    │   ├── bootstrap.ts
    │   ├── components/
    │   │   └── widgets/
    │   │       ├── GreetingWidgetSetting.tsx
    │   │       └── GreetingWidget.tsx
    │   ├── graphql/
    │   └── types/
    │       └── GreetingWidget/
    │           ├── GreetingWidget.graphql
    │           └── GreetingWidget.resolvers.ts
```

:::info
To learn more about GraphQL in EverShop, refer to the [GraphQL documentation](../knowledge-base/graphql).
:::

First, let's define the GraphQL type for our Greeting widget:

```graphql title="extensions/greeting_widget/graphql/types/GreetingWidget/GreetingWidget.graphql"
"""
A widget that displays a greeting message
"""
type GreetingWidget {
  text: String
  className: String
}

extend type Query {
  greetingWidget(settings: JSON): GreetingWidget
}
```

Next, create the resolver that will handle our widget's data:

```ts title="extensions/greeting_widget/src/graphql/types/GreetingWidget/GreetingWidget.resolvers.ts"
export default {
  Query: {
    greetingWidget(_, { settings }) {
      return {
        text: settings.text,
        className: settings.className,
      };
    },
  },
};
```

This GraphQL schema defines:

1. A `GreetingWidget` type with `text` and `className` fields
2. A query called `greetingWidget` that accepts settings as input and returns a GreetingWidget object
3. A resolver that transforms the input settings into the proper format

The resolver is straightforward in this example, but for more complex widgets, you could perform additional processing, validation, or data fetching here.

### Step 5: Create the Main Component

Now, let's create the component that will render your widget on the storefront:

```javascript title="extensions/greeting_widget/src/components/widget/GreetingWidget.jsx"
import React from "react";
import PropTypes from "prop-types";

export default function GreetingWidget({
  greetingWidget: { text, className },
}) {
  return (
    <div className={className}>
      <h1>{text}</h1>
    </div>
  );
}

GreetingWidget.propTypes = {
  greetingWidget: PropTypes.shape({
    text: PropTypes.string,
    className: PropTypes.string,
  }),
};

GreetingWidget.defaultProps = {
  greetingWidget: {
    text: "",
    className: "",
  },
};

export const query = `
  query Query($settings: JSON) {
    greetingWidget(settings: $settings) {
      text
      className
    }
  }
`;

export const variables = `{
  settings: getWidgetSetting()
}`;
```

This component:

1. Receives the configured settings through props
2. Renders a heading with the greeting text
3. Applies any custom CSS classes specified in the settings
4. Uses the same GraphQL query as the settings component to fetch data
5. Defines PropTypes for type checking and default values

### Step 6: Enable Your Extension

To make your widget available, you need to enable your extension in your EverShop configuration file:

```javascript title="./config/production.json"
{
    ...,
    "system": {
        "extensions": [
            {
                "name": "greeting_widget",
                "resolve": "extensions/greeting_widget",
                "enabled": true,
                "priority": 20
            }
        ]
    }
}
```

This configuration:

- Specifies the extension name
- Provides the path to resolve your extension code
- Sets the extension to enabled
- Assigns a priority (lower numbers execute first)

### Step 7: Test Your Widget In Development Mode

After enabling your extension, you can start your development server to see your changes in action:

```bash
npm run dev
```

This process compiles your components and makes your widget available in the admin panel.

Congratulations! You've successfully developed a widget for EverShop. You can now create instances of your widget from the admin panel and display them on your storefront.

### Step 8: Build Your Extension And Run Your Project In Production Mode

To prepare your extension for production, you need to build it. Run the following command in your extension directory:

```bash
npm run compile
```

This command compiles your TypeScript code and prepares the extension for deployment.
After building your extension, you can run your project in production mode:

```bash
npm run start
```

## Customizing Existing Widgets

EverShop allows you to override widget components to customize their appearance or behavior without modifying the original code. This is particularly useful when working with third-party extensions or core widgets.

### How to Override a Widget Component

To override a widget component, update your configuration file to specify a custom component path:

```ts title="extensions/greeting_widget/src/bootstrap.ts"
import config from "config";
import path from "path";
import { CONSTANTS } from "@evershop/evershop/lib/helpers";
import { updateWidget } from "@evershop/evershop/lib/widget";

export default () => {
  // Register our greeting widget
  updateWidget("greeting_widget", {
    settingComponent: path.resolve(
      CONSTANTS.LIBPATH,
      "components/widgets/GreetingWidgetSettingNew.js"
    ),
    component: path.resolve(
      CONSTANTS.LIBPATH,
      "components/widgets/GreetingWidgetNew.js"
    ),
  });
};
```

:::info
Remember to rebuild your project after changing widget configuration settings:

```bash
npm run build
```

:::

## Best Practices for Widget Development

When developing widgets for EverShop, consider these best practices:

1. **Keep widgets focused**: Each widget should serve a single, clear purpose.

2. **Make settings intuitive**: Design your configuration interface to be straightforward for administrators.

3. **Optimize performance**: Ensure your widget loads efficiently and doesn't negatively impact page performance.

4. **Use responsive design**: Make sure your widget displays correctly on all device sizes.

5. **Implement error handling**: Add fallbacks to handle cases where data might be missing or incorrectly formatted.

## Conclusion

In this guide, we've covered the complete process of developing a custom widget for EverShop:

- Creating an extension to house your widget code
- Registering your widget with EverShop
- Building configuration and display components
- Setting up GraphQL schema and resolvers
- Enabling your extension and building your project
- Overriding existing widget components

Custom widgets are a powerful way to enhance your EverShop store's functionality and provide a unique shopping experience for your customers. By leveraging the widget system, you can create modular, reusable components that store administrators can easily configure through the user interface.
