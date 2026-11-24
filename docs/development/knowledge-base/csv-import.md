---
sidebar_position: 68
keywords:
  - csv import
  - import products
  - import customers
  - import categories
  - bulk import
sidebar_label: CSV Import
title: CSV Import
description: Import categories, products, customers and customer addresses from CSV files. How the import works, the file formats, the checks it makes, how to run it safely on a live store, and how to configure it.
---

# CSV Import

EverShop can import **categories**, **products**, **customers** and **customer addresses** from CSV files. You upload a file in **Admin → Import**, EverShop checks the whole file and shows you every problem, and when the file is clean you start the import. The import runs in the background, so you can leave the page, and it uses the same services as the admin forms, so the same rules apply to imported records as to records you type in.

## How it works

1. **Choose what to import** and download the **template** for it: a CSV with the header row and two example rows. The template also has one `attr:` column for each attribute and one `metafield:` column for each custom field that exists in your store.
2. **Upload the file.** A new upload for a type **replaces** an unfinished import of the same type. The page asks first if the unfinished one belongs to another admin, or if it was stopped after it had written rows.
3. **Wait for the check.** The file is read twice: first for what the rows say, then against your store (does the category exist, is the SKU already used, …). Problems are listed with the row, the column and a message. **Download file with errors** gives you the whole file with a `_errors` column, so you can fix it in a spreadsheet and upload it again. **Check again** runs the check again on the file you already uploaded, for example after you created a missing category.
4. **Start the import** when the check found no errors. Warnings do not stop it. The import checks the file once more just before it writes anything, because the store may have changed since the first check.
5. **Follow the progress.** The page shows the rows done and the bar, and keeps updating while the import runs. **Cancel** stops between two rows; what was written stays. If the import stops after 10 failed rows, or the server restarts, **Resume** continues where it stopped.

A column that the type does not have (a column from another system, for example) is ignored, with a warning. When more than half of the columns of the file are ignored, the first warning says so ("17 of 23 columns were ignored because this type of file does not use them"): check that you chose the right type of file before you start the import.

Only one import runs at a time in a store, and a type has only one unfinished file. Finished imports are kept in the list for 7 days.

:::tip Import in this order
Categories, then products, then customers, then customer addresses. A product refers to a category and an address refers to a customer, and those must exist when the file is checked.
:::

## What every file follows

<table className="table-auto not-prose">
  <thead>
    <tr><th>Rule</th><th>Detail</th></tr>
  </thead>
  <tbody>
    <tr><td>Format</td><td>UTF-8 (a byte order mark is fine), comma separated, the first row is the header. Header names are lower case with underscores.</td></tr>
    <tr><td>Blank cell</td><td>On a <strong>new</strong> record it means "not provided". On an <strong>existing</strong> record it means <strong>leave as it is</strong>. There is no way to clear a field with a blank cell.</td></tr>
    <tr><td>Booleans</td><td><code>1</code>, <code>0</code>, <code>true</code> or <code>false</code>.</td></tr>
    <tr><td>Lists</td><td>Separated with <code>|</code>, for example <code>a|b|c</code>.</td></tr>
    <tr><td>References</td><td>Other records are named by name or code, never by id (ids differ between stores): a category by its <code>url_key</code>, an attribute group, tax class, package or customer group by its name. Letter case is ignored. A name that matches more than one record is an error.</td></tr>
    <tr><td>Custom columns</td><td><code>attr:&lt;attribute_code&gt;</code> for a product attribute, <code>metafield:&lt;namespace&gt;.&lt;key&gt;</code> for a custom field. The attribute or definition must already exist in the store; the import never creates one.</td></tr>
    <tr><td>Update or create</td><td>A row whose key already exists <strong>updates</strong> that record; otherwise it creates one. Choose "Only create" or "Only update" on the upload page to refuse the other case. Customer addresses are never matched: they are only added.</td></tr>
    <tr><td>Example rows</td><td>The rows of the template use reserved keys (<code>EXAMPLE-SKU-1</code>, <code>example-category</code>, …). They are skipped with a warning, so uploading the template as it is writes nothing.</td></tr>
  </tbody>
</table>

## Categories

<table className="table-auto not-prose">
  <thead>
    <tr><th>Column</th><th>Needed to create</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><code>url_key</code></td><td>no</td><td>The key of the row. When blank it is made from <code>name</code>.</td></tr>
    <tr><td><code>name</code></td><td>yes</td><td></td></tr>
    <tr><td><code>parent</code></td><td>no</td><td>The <code>url_key</code> of the parent. It may be anywhere in the file, or already in the store; parents are written first.</td></tr>
    <tr><td><code>status</code></td><td>yes</td><td><code>1</code> or <code>0</code>.</td></tr>
    <tr><td><code>position</code></td><td>no</td><td>A whole number from 0 to 32,767.</td></tr>
    <tr><td><code>description</code>, <code>meta_title</code>, <code>meta_description</code></td><td>no</td><td>A description may be plain text or HTML.</td></tr>
    <tr><td><code>image</code></td><td>no</td><td>An <code>http(s)</code> URL. The image is copied into your store's file storage.</td></tr>
  </tbody>
</table>

## Products

<table className="table-auto not-prose">
  <thead>
    <tr><th>Column</th><th>Needed to create</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><code>sku</code></td><td>yes</td><td>The key of the row.</td></tr>
    <tr><td><code>name</code></td><td>yes</td><td></td></tr>
    <tr><td><code>url_key</code></td><td>no</td><td>Made from <code>name</code> when blank on a new product. An update with a blank cell keeps the stored one, so renaming never changes the address.</td></tr>
    <tr><td><code>status</code>, <code>visibility</code></td><td>yes</td><td><code>1</code> or <code>0</code>.</td></tr>
    <tr><td><code>price</code></td><td>yes</td><td>0 or more, up to 2 decimals.</td></tr>
    <tr><td><code>qty</code></td><td>yes</td><td>A whole number.</td></tr>
    <tr><td><code>manage_stock</code>, <code>stock_availability</code></td><td>yes</td><td><code>1</code> or <code>0</code>. Without them a product would be unmanaged and out of stock, so they are required.</td></tr>
    <tr><td><code>attribute_group</code></td><td>yes</td><td>The name of the attribute group.</td></tr>
    <tr><td><code>package</code></td><td>no</td><td>The name of a package. A shippable product with a blank package gets the default package.</td></tr>
    <tr><td><code>no_shipping_required</code></td><td>no</td><td><code>1</code> for a product that is not shipped.</td></tr>
    <tr><td><code>weight</code>, <code>tax_class</code></td><td>no</td><td>The tax class by name.</td></tr>
    <tr><td><code>category</code></td><td>no</td><td>One category, by <code>url_key</code>.</td></tr>
    <tr><td><code>short_description</code>, <code>description</code>, <code>meta_title</code>, <code>meta_description</code></td><td>no</td><td></td></tr>
    <tr><td><code>images</code></td><td>no</td><td><code>|</code>-separated URLs; the first is the main image. On an update a non-blank cell <strong>replaces</strong> the product's images with exactly this list.</td></tr>
    <tr><td><code>variant_group</code>, <code>variant_axes</code></td><td>no</td><td>Rows with the same <code>variant_group</code> label become one group of variants. <code>variant_axes</code> lists the attribute codes that tell the variants apart, for example <code>color|size</code> (at most 5, all of type select). The rows of a group must be next to each other in the file.</td></tr>
    <tr><td><code>redirect_from</code></td><td>no</td><td><code>|</code>-separated old paths; each becomes a permanent (301) redirect to the product. Existing redirects stay.</td></tr>
    <tr><td><code>attr:&lt;code&gt;</code></td><td>if the attribute is required</td><td>The option <em>text</em> for a select, <code>|</code>-separated texts for a multiselect, free text otherwise. The attribute must be in the product's attribute group.</td></tr>
  </tbody>
</table>

Updating a product that belongs to a group of variants also changes the other members of the group for the fields they share (tax class, category, shipping, weight, package and the attributes that are not axes), so all rows of a group in the file must agree on them.

## Customers

<table className="table-auto not-prose">
  <thead>
    <tr><th>Column</th><th>Needed to create</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><code>email</code></td><td>yes</td><td>The key of the row. Letter case is ignored when deciding whether a customer exists.</td></tr>
    <tr><td><code>full_name</code></td><td>yes</td><td></td></tr>
    <tr><td><code>status</code></td><td>no</td><td></td></tr>
    <tr><td><code>group</code></td><td>no</td><td>The name of a customer group. Blank means the default group.</td></tr>
    <tr><td><code>password_hash</code></td><td>no</td><td>A bcrypt hash (<code>$2a$</code>, <code>$2b$</code> or <code>$2y$</code>, cost 04 to 15), stored as given. Hashes of other kinds (WordPress, MD5, …) cannot be used: they would be stored but never match.</td></tr>
    <tr><td><code>password</code></td><td>no</td><td>A plain password (6 characters or more), hashed on import. Allowed but not recommended: the file holds a secret. Not together with <code>password_hash</code>.</td></tr>
  </tbody>
</table>

A customer with no password gets a random one that nobody knows. They use **Forgot your password?** on the login page to choose theirs; the import sends no e-mail. Passwords are **ignored when a customer already exists**, so importing a file again never resets a password a customer has changed.

## Customer addresses

One row for each address, the customer named by `email` (the customer must already exist). The columns follow the address format of the country: `recipient` (or `given_name` and `family_name` if your store uses a split name), `organization`, `address_line_1`, `address_line_2`, `address_line_3`, `locality`, `dependent_locality`, `administrative_area` (the region **key**, for example `US-CA`), `postal_code`, `sorting_code`, `country` (two letters, for example `US`), `telephone`, `extra` (a JSON object for the extra fields a package registers for the country) and `is_default` (`1` makes it the customer's default address).

The import runs each address through the same checks as the account page, so what is required depends on the country: the United States needs a locality, a region and a postal code, Germany needs no region. **Addresses are only added**: importing the same file twice adds every address twice.

## Descriptions, images and custom fields

- **Descriptions.** Plain text becomes paragraphs (an empty line starts a new one); text with HTML tags is kept as HTML, cleaned of anything unsafe.
- **Images.** Only <code>http(s)</code> URLs are supported. EverShop downloads each image once, checks that it is really an image (JPEG, PNG, GIF, WebP and a few others; SVG is refused), and stores it in your file storage; it never links to the other site. Importing again replaces the stored file instead of adding a copy (the folder of a file comes from its URL: <code>catalog/&lt;8 digits&gt;/&lt;8 digits&gt;</code>; images imported before this layout keep their old folder, and an import of the same URL writes a new copy). A URL that cannot be fetched fails the **row**, with a message. Tick *Check that image URLs can be reached while validating* if you want to find such URLs before you start (slower).
- **Custom fields.** One column `metafield:<namespace>.<key>` per definition. A cell is read by the field's type (text, number, `1`/`0` for a boolean, `YYYY-MM-DD` for a date, `#RRGGBB` for a color, JSON for a group, `|`-separated for a list). The field's own rules (range, choices, required) apply.

## When something goes wrong

<table className="table-auto not-prose">
  <thead>
    <tr><th>You see</th><th>What it means</th></tr>
  </thead>
  <tbody>
    <tr><td>The check found errors</td><td>Nothing is written until the file is clean. Read the table, or download the file with errors, fix it and upload it again (or use <strong>Check again</strong> if you fixed the store, not the file).</td></tr>
    <tr><td>"The file was checked again when the import was about to start, and new problems were found."</td><td>The store changed between the check and the start (for example a category was deleted). Nothing was written. Fix the cause and start again.</td></tr>
    <tr><td>Stopped after 10 failed rows</td><td>The import stops itself so that a systematic problem does not fail the whole file. Fix the cause and press <strong>Resume</strong>: the failed rows are tried again and the import continues.</td></tr>
    <tr><td>Interrupted</td><td>The server restarted or the background process stopped. Press <strong>Resume</strong>: it continues from the last saved row.</td></tr>
    <tr><td>"The import has not started yet" for more than two minutes</td><td>The store's background process (it also sends events and runs scheduled jobs) may not be running.</td></tr>
    <tr><td>"Slowing down so the store stays fast"</td><td>The import waits for the store's event queue (search updates, webhooks, page addresses) to catch up before it goes on. This is normal on a large import.</td></tr>
  </tbody>
</table>

After an import of products or categories, the page addresses (URLs) are finished in the background and can take a few minutes on a large file.

### The language of the messages

The problems in the table, the `_errors` column of the file with errors and the reason a job stopped are shown in the language of the store (Settings → Store language), in the 17 languages EverShop is translated into. Names of columns and the values from your file stay as they are. A problem is stored as a sentence and its values, so if you change the store's language, an old import reads in the new one. The sentences are in `translations/<locale>/import.csv`, with `${1}`, `${2}` ... for the values; a developer who adds a message adds it to every language (a test fails otherwise).

## Running it on a live store

- The import runs in a **separate process** and writes through the same services as the admin, in small steps, so the store stays responsive. If the store's event queue grows too long it pauses until the queue shrinks.
- Every product and category you import fires the same events as if you had saved it in the admin: webhooks, search indexing and page addresses. A large import therefore causes a burst of events.
- A file is limited to 100 MB and 200,000 rows by default. Split a larger file.
- **A slow upload can be cut.** The upload is one request. EverShop sets no time limit of its own, but Node.js ends a request after 5 minutes by default, and a proxy or load balancer in front of the store often allows less. If a large file does not arrive on a slow connection, split the file or raise the limit of the proxy.
- **How long it takes.** In our tests, 50,000 simple products without images took about 10 minutes on a fast laptop (around 85 products a second) and about 22 minutes on a standard cloud machine with 4 CPUs (around 37 a second), and the storefront answered as fast as when idle. Your speed depends on the server and the database. Images take longer, because each one is downloaded from its URL: the more images and the slower their host, the longer the import.
- Customer data in the file is kept in the database (with the problems list) for as long as the import is kept, 7 days by default, and is removed at once when you delete the import.

## Configuration

All keys are optional and go under `system.import` in your configuration file (see the [Configuration Guide](/docs/development/knowledge-base/configuration-guide)).

<table className="table-auto not-prose">
  <thead>
    <tr><th>Key</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>maxFileSizeMb</code></td><td>100</td><td>The largest upload, in MB.</td></tr>
    <tr><td><code>maxRows</code></td><td>200000</td><td>The most rows in a file.</td></tr>
    <tr><td><code>maxCellLength</code></td><td>65536</td><td>The longest cell, in characters.</td></tr>
    <tr><td><code>maxIssues</code></td><td>100000</td><td>The most problems kept for one import and phase. The page says when more exist than are listed.</td></tr>
    <tr><td><code>retentionDays</code></td><td>7</td><td>How long a finished import is kept.</td></tr>
    <tr><td><code>imageTimeoutSeconds</code></td><td>30</td><td>How long one image download may take.</td></tr>
    <tr><td><code>imageConcurrency</code></td><td>4</td><td>How many images are fetched at the same time.</td></tr>
    <tr><td><code>maxWorkersPerInstance</code></td><td>2</td><td>How many import workers one server instance runs at a time.</td></tr>
    <tr><td><code>workerMemoryMb</code></td><td>1024</td><td>The memory ceiling of an import worker.</td></tr>
    <tr><td><code>lockTimeoutSeconds</code></td><td>10</td><td>How long a statement of an import worker waits for a lock held by someone else (<code>lock_timeout</code>). A row that times out is tried again after 1, 3 and 9 seconds like any short failure of the database.</td></tr>
    <tr><td><code>eventBacklogHigh</code>, <code>eventBacklogLow</code>, <code>eventBacklogMaxWaitMinutes</code></td><td>500, 100, 30</td><td>The import pauses when the event queue has more than <em>High</em> events, goes on below <em>Low</em>, and gives up (the import becomes "interrupted") after <em>MaxWait</em> minutes.</td></tr>
    <tr><td><code>allowPrivateNetworks</code></td><td>false</td><td>For testing only: allow image URLs that point to a private address.</td></tr>
  </tbody>
</table>

## REST API

The admin page uses a REST API that you can also call from your own tools: see the [Import API](/docs/api/import). Calls that change an import must send the header `X-Import-Request: 1`.

## Related

- [Metafields](/docs/development/knowledge-base/metafields) — the custom fields that `metafield:` columns fill
- [Address Formats](/docs/development/knowledge-base/address-formats) — the address rules that the addresses file follows
- [Events and Subscribers](/docs/development/knowledge-base/events-and-subscribers) — the process that starts the import worker
- [URL Redirects](/docs/development/knowledge-base/url-redirects) — the 301 redirects that `redirect_from` creates

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
