---
sidebar_position: 35
keywords:
  - Evershop database
sidebar_label: The Database
title: Database
description: Learn what a database is and how to work with database in EverShop. Create and modify PostgreSQL database by following this tutorial.
---

# eCommerce platform with PostgreSQL database

EverShop uses [PostgreSQL](https://www.postgresql.org/) as a database storage. EverShop requires PostgreSQL 13 or higher.

## What is PostgreSQL?

PostgreSQL is a powerful and popular open-source relational database management system (RDBMS) that is known for its robustness, scalability, and extensibility. It is one of the most advanced and feature-rich databases available, offering features such as support for complex queries, indexes, transactions, and advanced data types like arrays, JSON, and XML.

PostgreSQL is often used as a backend database for web applications, and it is frequently deployed on Linux, Unix, and Windows servers. It also has a strong reputation for data integrity, and is often the preferred choice for applications that require ACID (Atomicity, Consistency, Isolation, and Durability) compliance.

PostgreSQL is developed and maintained by a global community of open-source developers, and is released under the PostgreSQL License, a permissive free software license.

## Working with PostgreSQL in EverShop

## Database connection setup

### Setup environment variables for database connection

EverShop uses [dotenv](https://www.npmjs.com/package/dotenv) to load environment variables from a `.env` file into `process.env`.

To setup the database connection, you need to create a `.env` file in the root folder of your project and add the following variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=evershop
DB_SSLMODE=disable
```

### Connect to PostgreSQL server using SSL

If you want to connect to the PostgreSQL server using SSL, you can change the `DB_SSLMODE` variable to `require`.

```bash
DB_SSLMODE=require
```

## Quick Tour

The EverShop database access layer abstracts and provides help with most aspects of dealing with relational databases such as, keeping connections to the server, building queries, preventing SQL injections, inspecting and altering schemas.

The functions described in this document illustrate what is possible to do with the lower-level database access API.

### Create a database connection

The below examples show you how to create a connection to the database. This method will return a connection object and can be used for further queries.

#### 1: The easiest way is to use the pool object

If what you are doing is just loading some data from the database or doing some simple insert/update that you do not care about the transaction, you can just use the pool object.

You let the pool object manage the connection for you rather than creating and managing connections one by one.

```js
import { pool } from "@evershop/evershop/lib/postgres";
import { select } from "@evershop/postgres-query-builder";

const query = select();
query
  .from("cms_page")
  .leftJoin("cms_page_description")
  .on(
    "cms_page.cms_page_id",
    "=",
    "cms_page_description.cms_page_description_cms_page_id"
  );
query.where("status", "=", 1);
query.where("cms_page_description.url_key", "=", request.params.url_key);

const cmsPage = await query.load(pool);
```

#### 2: Create a connection object

Sometimes you want to do some complex query and you want to control the transaction commit or rollback by yourself based on your logic, then you can create a single connection.

```js
import {
  rollback,
  insert,
  commit,
  select,
  update,
  startTransaction,
} from "@evershop/postgres-query-builder";
import { getConnection } from "@evershop/evershop/lib/postgres";
const connection = await getConnection();
await startTransaction(connection);

try {
  // Doing some insert/update queries here
  await commit(connection);
} catch (e) {
  await rollback(connection);
}
```

### Basic CRUD operations

#### Running Select Statements

```js
import { pool } from "@evershop/evershop/lib/postgres";
import { select } from "@evershop/postgres-query-builder";

const order = await select()
  .from("order")
  .where("order_id", "=", orderId)
  .load(pool);
```

It is also possible to perform a complex query by using a query builder.

```js
import { pool } from "@evershop/evershop/lib/postgres";
import { select } from "@evershop/postgres-query-builder";

const query = select();
query
  .from("cms_page")
  .leftJoin("cms_page_description")
  .on(
    "cms_page.cms_page_id",
    "=",
    "cms_page_description.cms_page_description_cms_page_id"
  );
query.where("status", "=", 1);
query.andWhere("cms_page_description.url_key", "=", request.params.url_key);

const cmsPage = await query.load(pool);
```

#### Running Insert Statements

```ts
import { EvershopRequest, EvershopResponse } from "@evershop/evershop";
import {
  rollback,
  insert,
  commit,
  startTransaction,
} from "@evershop/postgres-query-builder";
import { getConnection } from "@evershop/evershop/lib/postgres";

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    await insert("shipment")
      .given({
        shipment_order_id: orderId,
        carrier_name: carrierName,
        tracking_number: trackingNumber,
      })
      .execute(connection);
    await commit(connection);
  } catch (e) {
    await rollback(connection);
  }
};
```

In the above example, the data is passed to the insert statement is a ‘key-value’ pair object with the key is the table column name.

If the key provided does not exist, it will just be ignored and the query still being proceeded.

#### Running Update Statements

Updating rows in the database is equally intuitive, the following example will update the order with id 10:

```ts
import { EvershopRequest, EvershopResponse } from "@evershop/evershop";
import {
  rollback,
  update,
  commit,
  startTransaction,
} from "@evershop/postgres-query-builder";

import { getConnection } from "@evershop/evershop/lib/postgres";

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    await update("order")
      .given({
        shipment_status: "fullfilled",
      })
      .where("order_id", "=", 10)
      .execute(connection);
    await commit(connection);
  } catch (e) {
    await rollback(connection);
  }
};
```

#### Running Delete Statements

Similarly, the `del()` method is used to delete rows from the database, the following example deletes the order with id 10:

```js
import {
  rollback,
  del,
  commit,
  startTransaction,
} from "@evershop/postgres-query-builder";
import { getConnection } from "@evershop/evershop/lib/postgres";

export default async (request, response, next) => {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    await del("order").where("order_id", "=", 10).execute(connection);
    await commit(connection);
  } catch (e) {
    await rollback(connection);
  }
};
```
