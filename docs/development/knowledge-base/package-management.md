---
sidebar_position: 64
keywords:
  - package
  - parcel
  - dimensions
  - shipping
  - tare weight
  - packing
  - cartPackages
sidebar_label: Package Management
title: Package Management
description: The package (parcel sizing) entity added in EverShop 2.2.1 — schema, dimension snapshots, tare weight, the packing strategy, and how carriers receive parcels.
---

# Package Management

Before 2.2.1 EverShop knew how much a product weighed but nothing about the box it ships in. Every carrier extension worked around this with a hardcoded dummy parcel, which meant quotes and labels were priced against a fiction.

2.2.1 adds a `package` entity: an admin-managed list of box and envelope sizes, one of which every shippable product references. Its dimensions and its **tare weight** (the weight of the empty box) flow through the cart to shipping quotes, and through the order to label purchase.

## The `package` table

Created in `modules/catalog/migration/Version-1.0.9.ts`, alongside the product column that references it — both in the same migration on purpose, so the foreign key never depends on cross-module migration ordering.

```sql
CREATE TABLE IF NOT EXISTS "package" (
  "package_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar NOT NULL,
  "length" decimal(12,2) NOT NULL,
  "width" decimal(12,2) NOT NULL,
  "height" decimal(12,2) NOT NULL,
  "weight" decimal(12,4) NOT NULL DEFAULT 0,
  "is_default" boolean NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PACKAGE_UUID_UNIQUE" UNIQUE ("uuid"),
  CONSTRAINT "PACKAGE_NAME_UNIQUE" UNIQUE ("name"),
  CONSTRAINT "PACKAGE_LENGTH_POSITIVE" CHECK ("length" > 0),
  CONSTRAINT "PACKAGE_WIDTH_POSITIVE" CHECK ("width" > 0),
  CONSTRAINT "PACKAGE_HEIGHT_NON_NEGATIVE" CHECK ("height" >= 0),
  CONSTRAINT "PACKAGE_WEIGHT_NON_NEGATIVE" CHECK ("weight" >= 0)
);
```

Note `height >= 0` while length and width must be positive: **height 0 is a valid flat envelope**, and the packing heuristic handles it explicitly.

`weight` is the **tare** — the empty package's own weight, not the goods. It defaults to 0, so a merchant who never fills it in gets exactly pre-2.2.1 behaviour.

### The single-default partial unique index

```sql
CREATE UNIQUE INDEX IF NOT EXISTS "ONLY_ONE_DEFAULT_PACKAGE"
  ON "package" ("is_default") WHERE "is_default" = TRUE;
```

A partial unique index on a boolean column, restricted to the `TRUE` rows. It permits any number of `false` rows and at most one `true` row, which makes "there is at most one default package" a **database** guarantee rather than a service-layer convention. Two admins swapping the default concurrently get a constraint error rather than two defaults.

The service side (`modules/checkout/services/package/packageManager.ts`) does the swap inside a transaction — unset the current default, then set the new one — because with the index in place a non-transactional swap would fail loudly rather than corrupt quietly.

The migration also seeds one starter row (`'Standard Box'`, 30 × 25 × 10, tare 0, default). Without it, product creation on a fresh install dead-ends: the package field is mandatory for shippable products and there would be nothing to pick.

### `product.package_id`

```sql
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "package_id" INT
  REFERENCES "package" ("package_id") ON DELETE RESTRICT;
```

Two deliberate choices:

- **Nullable.** Products that existed before the upgrade keep `NULL` until they are next edited. Mandatory-ness is enforced at the application level, not by the column, and only for **shippable** products — `no_shipping_required` (virtual and downloadable) products are exempt and have their `package_id` forced to `NULL` on save.
- **`ON DELETE RESTRICT`.** Deleting a package that products reference raises SQLSTATE `23503`. The delete service catches that specific code and counts the blockers, so admins see `This package is used by 42 product(s). Assign those products to another package first.` rather than a constraint error. Deleting the *default* package is refused before the query even runs, because the product form needs a default to preselect.

Variant groups are handled at the service layer: variants in EverShop are siblings linked by `variant_group_id` (there is no parent product), and a variant group ships in one box, so `updateProduct` propagates a saved `package_id` to every member of the group inside the same transaction. Propagation happens on **every** save, not only when the package changed — that repairs siblings that drifted, and editing any one member un-legacies the whole group.

## The dimension snapshot chain

Dimensions are copied forward at two points and never joined back:

```
product.package_id
  └─(cart rebuild)→ cart_item.package_{length,width,height,weight}
       ├─(serializeItems)→ ShippingItem.dimensions        ← QUOTE TIME
       └─(orderCreator)→  order_item.package_{length,width,height,weight}
            └─(buildCreateLabelInput)→ CarrierItem.dimensions
                                     + CreateLabelInput.parcel  ← LABEL TIME
```

The two migrations that add the snapshot columns are `modules/checkout/migration/Version-1.0.11.ts` (cart) and `modules/oms/migration/Version-1.0.9.ts` (order):

```sql
ALTER TABLE "cart_item"
  ADD COLUMN IF NOT EXISTS "package_length" decimal(12,2),
  ADD COLUMN IF NOT EXISTS "package_width" decimal(12,2),
  ADD COLUMN IF NOT EXISTS "package_height" decimal(12,2),
  ADD COLUMN IF NOT EXISTS "package_weight" decimal(12,4);

ALTER TABLE "cart" ADD COLUMN IF NOT EXISTS "packages" jsonb;
```

Four columns, not three — `package_weight` carries the tare forward too, so label-time parcel building never needs a live join back to `package`.

### Why snapshots exist

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Row</th>
      <th>Refresh behaviour</th>
      <th>Reason</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cart_item.package_*</code></td>
      <td>Re-read from the product's current package on <strong>every cart rebuild</strong></td>
      <td>Same semantics as <code>product_weight</code> and price. A cart is a live projection; a merchant who resizes a box before checkout should see the new quote.</td>
    </tr>
    <tr>
      <td><code>order_item.package_*</code></td>
      <td>Copied from <code>cart_item</code> at placement, then <strong>never touched</strong></td>
      <td>An order is a historical record. Editing or deleting a package next month must not retroactively change what was shipped, what the customer was quoted, or what the label was bought against.</td>
    </tr>
  </tbody>
</table>

This is why there is **no foreign key** from `cart_item` or `order_item` back to `package`. A snapshot that could be invalidated by a delete would not be a snapshot.

The order-side copy needs no code of its own: `orderCreator` builds order items with `...item.export()`, and `DataObject.export()` dumps every registered field. Because the cart-item field keys match the `order_item` column names exactly, the copy happens automatically — and the query builder's `given()` silently drops keys that are not columns of the target table, which is also why `cart.packages` does not need an `order.packages` column.

`NULL` is a normal value throughout the chain: legacy products with no package, and non-shippable items. Nothing downstream blocks on it.

## Tare weight and `total_weight`

Postage is billed on goods **plus** packaging. The tare is added in exactly **one** place — the cart's `total_weight` field resolver in `registerCartBaseFields.js`:

```js
{
  key: 'total_weight',
  resolvers: [
    async function resolver() {
      let weight = 0;
      const items = this.getItems();
      items.forEach((i) => {
        weight += i.getData('product_weight') * i.getData('qty');
      });
      const parcels = this.getData('packages') ?? [];
      parcels.forEach((p) => {
        const tare = Number(p?.tareWeight);
        if (Number.isFinite(tare)) {
          weight += tare;
        }
      });
      return parseFloat(weight.toFixed(4));
    }
  ],
  dependencies: ['items', 'packages']
}
```

The `dependencies` array is what forces packing to resolve before the weight that reads it.

Everything downstream inherits the value without changes: `buildShippingContext` already read `cart.getData('total_weight')`, so `ShippingContext.totalWeight` includes tare; `orderCreator` spreads `cart.exportData()` into the order row, so `order.total_weight` records it too.

> **Per-item weights are goods-only, everywhere.** `ShippingItem.weight` and `CarrierItem.weight` never include packaging. Tare is parcel-level and enters only through `total_weight` and through `CreateLabelInput.parcel`. If your extension sums item weights itself, you are getting goods-only and must add the parcel tare separately — which is exactly why core populates `parcel`.

**Semantic change worth flagging in your own release notes:** `cart.total_weight` and `order.total_weight` now mean *shipping weight* (goods + packaging), not goods weight. Weight-based shipping price tables, free-shipping-by-weight rules and admin displays all see the new number. That is the correct basis for all of them, but it is a change.

## Packing: `buildDefaultParcels` and the `cartPackages` processor

Carriers want *parcels*; a cart has N items each carrying its own package dimensions. Real cartonization (bin packing) is explicitly out of scope for 2.2.1. What ships is one documented heuristic behind a processor, so a serious integration can replace it wholesale.

`modules/checkout/services/cart/packing.ts`:

```ts
export interface PackingCandidate {
  packageUuid: string | null;
  name: string | null;
  length: number;
  width: number;
  height: number;
  /** Tare — the empty package's own weight, store weight unit. */
  tareWeight: number;
}

export interface Parcel {
  packageUuid: string | null;
  name: string | null;
  length: number;
  width: number;
  height: number;
  tareWeight: number;
  /** Σ item weight × qty across the parcel's items. */
  goodsWeight: number;
}

export function buildDefaultParcels(
  candidates: PackingCandidate[],
  goodsWeight: number
): Parcel[];
```

The default strategy is: **one parcel, sized by the largest candidate by volume**, carrying that package's tare and the whole cart's goods weight. Its edge behaviour:

- Candidates with non-finite or non-positive length/width are dropped.
- If nothing survives (an all-legacy or all-virtual cart) it returns `[]`, and tare contributes nothing.
- For volume comparison only, height is floored at 1 unit — so a flat envelope (height 0) beats nothing but loses to any real box.
- A non-finite `tareWeight` becomes 0; `goodsWeight` is rounded to 4 decimals and guards non-numeric input.

The result is stored as the cart's `packages` field, a persisted JSONB column. The resolver hands it through the registry before returning:

```js
const parcels = buildDefaultParcels(candidates, goodsWeight);
return getValueSync('cartPackages', parcels, { items });
```

### Overriding the strategy

Register a processor from your extension's `bootstrap.ts`:

```ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';

export default () => {
  // A processor receives ONE argument (the value). The context — `{ items }` for
  // `cartPackages` — is bound to `this` via `callback.call(context, value)`, so
  // this must be a `function` expression, not an arrow.
  addProcessor('cartPackages', function (parcels) {
    return myBinPackingAlgorithm(this.items);
  });
};
```

Return an array of parcels in the same shape. Because `total_weight` sums `tareWeight` across whatever you return, a multi-parcel proposal automatically produces a multi-box shipping weight. The registry is locked after bootstrap, so this must not be called from a middleware.

## What a carrier actually receives

There are **two different types named `Parcel`** in the codebase, and confusing them is the easiest mistake to make here.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Type</th>
      <th>Defined in</th>
      <th>Shape</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Packing proposal</td>
      <td><code>modules/checkout/services/cart/packing.ts</code></td>
      <td><code>&#123; packageUuid, name, length, width, height, tareWeight, goodsWeight &#125;</code> — flat numbers in the store's units, no unit labels</td>
    </tr>
    <tr>
      <td>Carrier input</td>
      <td><code>modules/oms/types/carrier.ts</code></td>
      <td><code>&#123; weight?: Weight, dimensions?: Dimensions, insuranceUsd?: number &#125;</code> — unit-tagged value objects</td>
    </tr>
  </tbody>
</table>

`buildCreateLabelInput` (in `modules/oms/services/createShipment.ts`) converts one into the other, per shipment:

```ts
const [proposal] = buildDefaultParcels(parcelCandidates, goodsWeight);
const parcel: Parcel | undefined = proposal
  ? {
      weight: {
        value: parseFloat((goodsWeight + proposal.tareWeight).toFixed(4)),
        unit: weightUnit
      },
      dimensions: {
        length: proposal.length,
        width: proposal.width,
        height: proposal.height,
        unit: dimensionUnit
      }
    }
  : undefined;
```

Three things to note if you are writing a carrier:

1. **The packing runs over the shipment's items, not the cart's.** A multi-shipment order ships subsets, so the cart-time proposal does not apply. Consequently the order's `total_weight` and the sum of its shipment parcels may legitimately differ once a merchant splits shipments — quotes were priced on the best information available at checkout.
2. **`parcel.weight` is goods + tare.** The per-item `CarrierItem.weight` values in the same input are goods-only. Adding them together double-counts.
3. **`parcel` is optional.** An order composed entirely of legacy or virtual items produces `undefined`, and your extension's existing dummy-box fallback still applies. Neither checkout nor label purchase is ever blocked by missing dimensions.

Each `CarrierItem` also carries its own `dimensions` (`Dimensions | undefined`) from the order-item snapshot, for carriers that can build their own multi-parcel plans. At quote time the equivalent is `ShippingItem.dimensions`, populated by `serializeItems` from the cart item.

See [Carrier Development](./carrier-development) for the full `createLabel` contract, and [Shipping Provider Development](./shipping-provider-development) for the quote-time side.

## Units are labels, not conversions

Two store-wide admin settings, both under **Settings → Store Settings**:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Setting key</th>
      <th>Values</th>
      <th>Reader</th>
      <th>Legacy config fallback</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>weightUnit</code></td>
      <td><code>kg</code>, <code>g</code>, <code>lb</code>, <code>oz</code></td>
      <td><code>getWeightUnit()</code></td>
      <td><code>shop.weightUnit</code> (default <code>kg</code>)</td>
    </tr>
    <tr>
      <td><code>dimensionUnit</code></td>
      <td><code>cm</code>, <code>mm</code>, <code>in</code></td>
      <td><code>getDimensionUnit()</code></td>
      <td><code>shop.dimensionUnit</code> (default <code>cm</code>)</td>
    </tr>
  </tbody>
</table>

Both come from `@evershop/evershop/setting/services` and are synchronous cache reads.

**The stored numbers are unit-less.** `package.length` is `30`, not `30 cm`. There are no per-row unit columns anywhere in the chain — not on `package`, not on `cart_item`, not on `order_item`. The setting is applied at the boundary where a DTO is built, which is why `serializeItems` and `buildCreateLabelInput` each call the getter and tag the value.

The consequence: **changing a unit setting reinterprets existing data, it does not convert it.** A store that switches `dimensionUnit` from `cm` to `in` turns every 30 × 25 × 10 box into a 30 × 25 × 10 *inch* box overnight. This is the same behaviour `product.weight` has always had, and the admin form is explicit about it — but it is worth knowing before you write a migration that flips it.

Both readers normalise defensively at the point of use: an unrecognised value falls back to `cm` / `kg` rather than reaching a carrier API as garbage.

## Admin surfaces

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Surface</th>
      <th>Location</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Packages card (list, create, edit, delete)</td>
      <td><strong>Settings → Shipping Settings</strong></td>
    </tr>
    <tr>
      <td>Package selector + inline "New package" dialog</td>
      <td>Product edit → Shipping section</td>
    </tr>
    <tr>
      <td>Weight and dimension unit</td>
      <td><strong>Settings → Store Settings</strong></td>
    </tr>
  </tbody>
</table>

The product selector preselects the store default for a new product and the product's own package for an existing one. Legacy products get no preselection, so the required-field validation forces a choice on the next save.

### REST endpoints

All admin-only (`"access": "private"`):

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Method</th>
      <th>Path</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>POST</td>
      <td><code>/api/packages</code></td>
    </tr>
    <tr>
      <td>PATCH</td>
      <td><code>/api/packages/:id</code></td>
    </tr>
    <tr>
      <td>DELETE</td>
      <td><code>/api/packages/:id</code></td>
    </tr>
  </tbody>
</table>

`createPackage`, `updatePackage` and `deletePackage` are `hookable`, so you can wrap them with `hookBefore` / `hookAfter`.

### GraphQL

The package types are **admin-schema only** — the storefront has no consumer for box dimensions.

```graphql
type Package {
  packageId: Int!
  uuid: String!
  name: String!
  length: Float!
  width: Float!
  height: Float!
  weight: Weight!
  isDefault: Boolean!
  updateApi: String!
  deleteApi: String!
}

extend type Query {
  packages: [Package!]!
  package(id: String!): Package
}
```

Plus a shared dimension type used by the snapshot fields:

```graphql
type Dimension {
  value: Float!
  unit: String!
  text: String!
}

type PackageDimensions {
  length: Dimension!
  width: Dimension!
  height: Dimension!
}
```

and the fields that expose the chain: `Product.package`, `CartItem.packageDimensions`, `OrderItem.packageDimensions`, and `Cart.packages` (the packing proposal, as `[CartParcel!]!`).

The split is worth noting precisely. `Dimension` and `PackageDimensions` live in a plain `Dimension.graphql`, so they exist in **both** schemas. `Package`, the `packages` query, and every field above live in `.admin.graphql` files, so they exist only in the admin schema. If you extend this in your own module, remember that a non-admin `.graphql` file referencing an admin-only type produces `Unknown type` at storefront schema build — the two schemas are assembled separately, and the storefront never sees admin types.

## Validation rules

`validatePackagePayload` mirrors the database CHECK constraints so admins get readable messages instead of constraint codes:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Field</th>
      <th>Rule</th>
      <th>Required on create</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>Non-empty string, unique across packages</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><code>length</code>, <code>width</code></td>
      <td>Greater than 0</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><code>height</code></td>
      <td>0 or greater (0 = flat envelope)</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><code>weight</code> (tare)</td>
      <td>0 or greater</td>
      <td>No — defaults to 0</td>
    </tr>
  </tbody>
</table>

Updates validate in partial mode: omitted fields are skipped, present fields are always checked. A duplicate name surfaces as `A package with this name already exists` (SQLSTATE `23505` is translated), and turning off the default directly is refused with `This is the default package. Set another package as default first.`

On the product side, both `createProduct` and `updateProduct` throw `A package is required for shippable products`. `updateProduct` checks the **final** post-update state, which is what makes a legacy product pick a package on its next edit, and what forces a product being flipped from virtual to shippable to pick one in the same save.

## See also

- [Carrier Development](./carrier-development) — `CreateLabelInput`, `CarrierItem`, and how a carrier consumes `parcel`
- [Shipping Provider Development](./shipping-provider-development) — `ShippingContext` and `ShippingItem.dimensions` at quote time
- [Multi-Shipment and Fulfillment](./multi-shipment-and-fulfillment) — why packing runs per shipment rather than per order
- [Cart Field System](./cart-field-system) — how `packages` and `total_weight` are registered and how `dependencies` ordering works
- [Registry and Processors](./registry-and-processors) — the `cartPackages` processor seam
- [Store Settings](./store-settings) — where `weightUnit` and `dimensionUnit` are edited

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
