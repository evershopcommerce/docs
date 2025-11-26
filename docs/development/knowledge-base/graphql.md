---
sidebar_position: 30
keywords:
  - graphql, evershop graphql
sidebar_label: GraphQL
title: GraphQL System
description: This document explains how the EverShop GraphQL system works, how to create a GraphQL type, and how to extend existing GraphQL types.
---

![EverShop GraphQL system](./img/evershop-graphql.jpg "EverShop GraphQL system")

# EverShop GraphQL System

[GraphQL](https://graphql.org/) is a query language for your API and a server-side runtime for executing queries using a type system you define for your data.

In EverShop, we use [GraphQL](https://graphql.org/) for server-side data fetching and as an API for the front-end to consume.

## GraphQL Organization in EverShop

In EverShop, every module has its own GraphQL folder. The GraphQL folder contains the type definitions and resolvers for the module. Let's take a look at the GraphQL folder structure of the catalog module.

```bash
./
├── api
├── graphql
    └── types
        ├── Attribute
        │   ├── Attribute.graphql
        │   └── Attribute.resolvers.ts
        ├── Category
        │   ├── Category.graphql
        │   └── Category.resolvers.ts
        ├── FeaturedCategory
        │   ├── FeaturedCategory.graphql
        │   └── FeaturedCategory.resolvers.ts
        ├── FeaturedProduct
        │   ├── FeaturedProduct.graphql
        │   └── FeaturedProduct.resolvers.ts
        └── Product
            ├── Attribute
            │   ├── ProductAttribute.graphql
            │   └── ProductAttribute.resolvers.ts
            ├── CustomOption
            │   ├── CustomOption.graphql
            │   └── CustomOption.resolvers.ts
            ├── Image
            │   ├── ProductImage.graphql
            │   └── ProductImage.resolvers.ts
            ├── Inventory
            │   ├── Inventory.resolvers.ts
            │   └── TypeDef.graphql
            ├── Price
            │   ├── ProductPrice.graphql
            │   └── ProductPrice.resolvers.ts
            ├── Product.graphql
            ├── Product.resolvers.ts
            └── Variant
                ├── Variant.graphql
                └── Variant.resolvers.ts
```

## GraphQL Type Definition

The GraphQL type definition is written in the [GraphQL Schema Definition Language](https://graphql.org/learn/schema/). The type definition is used to define the type of data that can be fetched from the server.

In EverShop, to create a new GraphQL type, we need to create a new folder with the name of the type in the `graphql/types` folder. The folder name should be in PascalCase. The folder should contain two files: one for the type definition and one for the resolvers.

The type definition file must have the `.graphql` extension.

```graphql title="Product.graphql"
type Product {
  productId: ID!
  name: String!
  status: Int!
  sku: String!
  weight: Weight!
  taxClass: Int
  description: String
  urlKey: String
  metaTitle: String
  metaDescription: String
  metaKeywords: String
  variantGroupId: ID
  visibility: Int
  groupId: ID
  categories: [Category]
  url: String
  editUrl: String
}
```

### Extend an Existing Type

During startup, EverShop consolidates the type definitions and resolvers from many local schema instances into a single executable schema. This is useful for building a single local service schema from many individually-managed parts.

To extend an existing type, we use the `extend` keyword.

Let's say you develop an extension and want to add a new field to the `Product` type. You can do it by adding the following code to your type definition file.

```graphql title="YourType.graphql":
extend type Product {
  yourField: String
}
```

Below is an example of extending the root `Query` type to add our `Product` type.

```graphql title="Product.graphql"
type Product {
  productId: ID!
  name: String!
  status: Int!
  sku: String!
  weight: Weight!
  taxClass: Int
  description: String
  urlKey: String
  metaTitle: String
  metaDescription: String
  metaKeywords: String
  variantGroupId: ID
  visibility: Int
  groupId: ID
  categories: [Category]
  url: String
  editUrl: String
}

extend type Query {
  product(id: ID): Product
}
```

## GraphQL Resolvers

The resolvers are used to fetch data from the database. The resolvers are written in JavaScript. The resolvers file must have the `.resolvers.js` extension.

```ts title="Product.resolvers.js"
import { select } from "@evershop/postgres-query-builder";
import { buildUrl } from "@evershop/evershop/lib/router";
import { camelCase } from "@evershop/evershop/lib/util/camelCase";

export default {
  Product: {
    categories: async (product, _, { pool }) => {
      const query = select().from("category");
      query
        .leftJoin("category_description", "des")
        .on(
          "des.`category_description_category_id`",
          "=",
          "category.`category_id`"
        );
      return (
        await query
          .where(
            "category_id",
            "IN",
            (
              await select("category_id")
                .from("product_category")
                .where("product_id", "=", product.productId)
                .execute(pool)
            ).map((row) => row.category_id)
          )
          .execute(pool)
      ).map((row) => camelCase(row));
    },
    url: (product, _, { pool }) => {
      return buildUrl("productView", { url_key: product.urlKey });
    },
    editUrl: (product, _, { pool }) => {
      return buildUrl("productEdit", { id: product.productId });
    },
  },
  Query: {
    product: async (_, { id }, { pool }) => {
      const query = select().from("product");
      query
        .leftJoin("product_description")
        .on(
          "product_description.`product_description_product_id`",
          "=",
          "product.`product_id`"
        );
      query.where("product_id", "=", id);
      const result = await query.load(pool);
      if (!result) {
        return null;
      } else {
        return camelCase(result);
      }
    },
  },
};
```

## GraphQL in Use

:::info
Check the [data fetching document](./data-fetching) for more information about data fetching.
:::
