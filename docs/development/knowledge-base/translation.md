---
sidebar_position: 51
keywords:
  - EverShop Translation
  - Localization
  - Multilingual
sidebar_label: Translation
title: Translating Your EverShop Application
description: Learn how to translate your EverShop application into different languages and make your theme fully translatable for international customers.
---

# Translation System

EverShop provides a comprehensive translation system that allows you to create multilingual stores with minimal effort. This guide explains how to set up translations and manage language files for your EverShop application.

## How to Translate Your Front Store

By default, EverShop is available in English. You can translate your store into any language by following these steps.

### 1. Set the Store Language

To set your store's default language, update the `config/<yourenvironment>.json` file located in the root directory of your project. Edit the `shop.language` property with the appropriate language code. For example, to set your store language to French:

```json
{
  "shop": {
    ..., // other configurations
    "language": "fr"
  }
}
```

:::note
Language codes use the ISO 639-1 standard, which consists of two letters for each language. You can find a complete list of language codes [here](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
:::

### 2. Create a Translation Directory Structure

From your project's root directory, create a new folder named `translations`. Inside this folder, create a subdirectory named with your target language code. For example, for French translations:

```bash
/translations
    /fr
```

This structure allows EverShop to automatically locate translation files for each supported language.

### 3. Create Translation CSV Files

Within your language folder, create CSV files containing your translations. Each file should have two columns:

- First column: The original English text
- Second column: The translated text in your target language

Start with a `general.csv` file for common phrases:

```csv
en,fr
"Hello, world!","Bonjour le monde!"
"Welcome to our store","Bienvenue dans notre boutique"
"Add to cart","Ajouter au panier"
```

For better organization, you can create multiple CSV files grouped by functionality:

```bash
/translations
    /fr
        /catalog.csv    # Product and category related translations
        /checkout.csv   # Cart and checkout process translations
        /customer.csv   # Customer account related translations
        /general.csv    # General site-wide translations
```

This organization makes it easier to manage translations as your store grows.

### 4. Translate Text in Your code

From the server-side code, you can use the `translate` function to retrieve translated strings. For example:

```ts title="Using translate in server-side code"
import { _, translate } from "@evershop/evershop/lib/locale/index";
const greeting = translate("Hello, world!");
console.log(greeting); // Outputs: "Bonjour le monde!" if the language is set to French
```

From the client-side code, you can use the `_` function to access translations in your React components:

```jsx title="Using useTranslation in React"
import { _ } from "@evershop/evershop/lib/locale/index";

const MyComponent = () => {
  return <div>{_("Hello, world!")}</div>;
};
```

with dynamic content:

```jsx title="Using useTranslation with dynamic content"
import { _ } from "@evershop/evershop/lib/locale/index";
const MyComponent = ({ name }) => {
  return <div>{_("Hello, ${name}!", { name })}</div>;
};
```

### 5. Sample Translations

You can find sample translation files in the official EverShop repository [here](https://github.com/evershopcommerce/evershop/tree/main/translations). These samples can serve as a starting point for your own translations.

:::warning
After changing your store's language or updating translation files, you must run the `build` command again for the changes to take effect:

```bash
npm run build
# or
yarn build
```

:::

## Translation Best Practices

When translating your EverShop application, consider the following best practices:

### Maintain Consistent Terminology

Use consistent translations for key terms across your entire store. For example, if you translate "Add to cart" as "Ajouter au panier" in one place, use the same translation everywhere this phrase appears.

### Handle Pluralization

Some languages have different forms for singular and plural. Consider this when translating phrases like "1 item" vs "2 items" - you may need context-specific translations.

```csv
en,fr
Search results for "${keyword}", Résultats de recherche pour "${keyword}"
${count} item, ${count} article
```

### Test Your Translations

After implementing translations, thoroughly test your store in each language to ensure:

- All user-facing text is translated
- Special characters display correctly
- Translated text fits within the UI elements

### Dynamic Content

When translating dynamic content (like product descriptions), consider whether these should be managed through the translation system or as separate content entries in your database.
