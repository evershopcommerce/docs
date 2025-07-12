---
sidebar_position: 31
keywords:
  - evershop data loading, evershop data fetching, evershop graphql
sidebar_label: Data Fetching
title: Data Fetching
description: EverShop allows you to fetch data from the server using the GraphQL query language. This document explains how to fetch data from the server and pass it to React Component using GraphQL.
---

![Data Fetching In EverShop](./img/data-fetching-evershop.png "Data Fetching In EverShop")

# Data Fetching in EverShop

EverShop uses [GraphQL](https://graphql.org/) for data fetching. GraphQL is a query language for your API and a server-side runtime for executing queries using a type system you define for your data.

:::info
Check this [GraphQL document](/docs/development/knowledge-base/graphql) to learn more about GraphQL in EverShop.
:::

EverShop allows you to fetch data for your [React](https://reactjs.org/) components using the GraphQL query language. This document explains how to fetch data from the server using GraphQL.

## GraphQL Query in React Components

When creating a React component that requires data for SSR (Server-Side Rendering), you need to fetch the data from the server during the request time. To do this, export a GraphQL query in the React component file. The query will be executed on the server, and the result will be passed to the React component as a prop.

Let's look at the example below:

```js title="modules/catalog/pages/productView/GeneralInformation.jsx"
export default function GeneralInfo({ product }) {
  return (
    <Area
      id="productViewGeneralInfo"
      coreComponents={[
        {
          component: { default: Name },
          props: {
            name: product.name,
          },
          sortOrder: 10,
          id: "productSingleName",
        },
        {
          component: { default: Price },
          props: {
            regular: product.price.regular,
            special: product.price.special,
          },
          sortOrder: 10,
          id: "productSinglePrice",
        },
        {
          component: { default: Sku },
          props: {
            sku: product.sku,
          },
          sortOrder: 20,
          id: "productSingleSku",
        },
      ]}
    />
  );
}

// highlight-start

export const query = `
  query Query {
    product (id: getContextValue('productId')) {
      name
      sku
      price {
        regular {
          value
          text
        }
        special {
          value
          text
        }
      }
    }
  }`;

// highlight-end
```

In the example above, we export a GraphQL query in the `GeneralInformation.js` component file. During the request time, EverShop consolidates all queries from all components and executes them in a single request. The result of the GraphQL query is passed to the React component as a prop.

### When is the GraphQL Query Executed?

The query is executed on the server during the request time. It will only be executed if the component is rendered on the server.

The GraphQL query is extracted from the component file and executed on the server. The result of the query is then passed to the component as a prop.

### The GraphQL Query Format

:::warning
Since the build process uses Regex to parse, collect, and remove queries from the component file, you must ensure the export statement follows the format below:

```js
export const query = `<Your GraphQL query>`;
```

:::

### The `getContextValue` Function

Sometimes, you need to pass arguments to the GraphQL query. For example, to fetch product details for a specific product, you need to pass the product ID to the GraphQL query. To do this, use the `getContextValue` function. This function returns the value of the context key you pass to it.

```js title="modules/catalog/pages/productView/GeneralInformation.jsx"
export const query = `
  query Query {
    product (id: getContextValue('productId')) {
      name
      sku
      price {
        regular {
          value
          text
        }
        special {
          value
          text
        }
      }
    }
  }`;
```

To add a value to the context, use a middleware function. Here's an example:

```js title="modules/catalog/pages/categoryView/index.js"
import { select } from "@evershop/postgres-query-builder";
import { pool } from "@evershop/evershop/lib/postgres";
import { setContextValue } from "@evershop/evershop/graphql/services";

export default async (request, response, next) => {
  try {
    const query = select();
    query
      .from("category")
      .leftJoin("category_description")
      .on(
        "category.`category_id`",
        "=",
        "category_description.`category_description_category_id`"
      );

    query.where("category_description.`url_key`", "=", request.params.url_key);
    const category = await query.load(pool);

    if (category === null) {
      response.status(404);
      next();
    } else {
      setContextValue(request, "categoryId", category.category_id);
      setContextValue(request, "pageInfo", {
        title: category.meta_title || category.name,
        description: category.meta_description || category.short_description,
        url: request.url,
      });
      next();
    }
  } catch (e) {
    next(e);
  }
};
```

In the example above, the middleware function `index.js` validates the category's availability. If the category is available, we add the category ID to the context using the `setContextValue` function. The `getContextValue` function then retrieves the category ID from the context.

### The `setContextValue` Function

This function adds a value to the GraphQL execution context. It accepts three arguments:

- `request`: The request object.
- `key`: The context key.
- `value`: The context value.

:::info
By default, EverShop adds all data in the current `request` object to the context. For example, you can call the `getContextValue('url')` function to get the current request URL.
:::

## Client-Side Data Fetching

### GraphQL API Endpoint

EverShop provides a GraphQL API endpoint to fetch data from the server. The GraphQL API endpoint is available at the `/graphql` path. You can use this endpoint to fetch data from the server.

### The `useQuery` Hook from URQL

EverShop uses [URQL](https://formidable.com/open-source/urql/) to fetch data from the server using the GraphQL API. URQL is a fully-featured GraphQL client that supports all GraphQL features and can be used with any GraphQL server.

Example:

```js
import React from "react";
import { useQuery } from "urql";

const TodosQuery = `
  query {
    todos {
      id
      title
    }
  }
`;

const Todos = () => {
  const [result, reexecuteQuery] = useQuery({
    query: TodosQuery,
  });

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};
```

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
