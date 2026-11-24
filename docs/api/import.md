---
sidebar_position: 30
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - Import
  - CSV Import
sidebar_label: Import
title: Import REST API
description: Use the EverShop REST API to upload a CSV file, check it, start, cancel and resume an import, read its problems, and download the template and the file with errors.
---

import Api from '@site/src/components/rest/Api';

# Import API

The routes behind **Admin → Import**. They need an admin session. The routes that **change** an import (`POST` and `DELETE`) also need the header `X-Import-Request: 1`, which a form on another site cannot send; without it the answer is `400 INVALID_REQUEST`. For the file formats and the workflow see [CSV Import](/docs/development/knowledge-base/csv-import).

An **import job** has an `uuid` (the name used in every URL), an `entity` (`product`, `category`, `customer` or `customerAddress`), a `mode` (`upsert`, `create` or `update`) and a `status`:

`uploaded` → `validating` → `validated` → `queued` → `running` → `completed`, or `stopped` (10 failed rows), `interrupted` (the worker stopped reporting), `failed` or `canceled`.

Errors use the usual JSON error shape with an extra `code`: `INVALID_REQUEST` (400), `NOT_FOUND` (404), `WRONG_STATUS` (409, the action is not allowed in the job's status), `IMPORT_RUNNING` (409, an upload for a type whose import is running), `IMPORT_ALREADY_RUNNING` (409, another import is queued or running), `OPEN_JOB_EXISTS` (409), `FILE_HAS_ERRORS` (409), `FILE_UNAVAILABLE` (409) and `FILE_TOO_LARGE` (413).

## Endpoints

### Upload a file

Streams a CSV file into a new job and returns it. **Send the form fields before the `file` field**: the fields are read while the file arrives. When the whole request has been read and is valid (a field that comes after the file, or a second file, makes it a `400` and changes nothing), the type's unstarted jobs are deleted and `replaced` is `true`. Nothing is parsed here: the check starts in the background.

<Api
method="POST"
url="/api/import-jobs"
requestSchema={{
  "type": "object",
  "description": "multipart/form-data",
  "properties": {
    "entity": { "type": "string", "enum": ["product", "category", "customer", "customerAddress"] },
    "mode": { "type": "string", "enum": ["upsert", "create", "update"], "default": "upsert" },
    "checkImages": { "type": "boolean", "default": false, "description": "Also check that image URLs can be reached while validating (slower)." },
    "file": { "type": "string", "format": "binary", "description": "The CSV file. Must be the last field." }
  },
  "required": ["entity", "file"]
}}
responseSample={`{
  "data": {
    "uuid": "6f1d9a52-0000-4000-8000-000000000001",
    "entity": "product",
    "mode": "upsert",
    "status": "uploaded",
    "fileName": "products.csv",
    "fileSize": 12345678,
    "counts": { "total": 0, "errors": 0, "warnings": 0 },
    "createdAt": "2026-10-19T09:00:00.000Z",
    "createdBy": { "id": 1, "name": "Jane" },
    "replaced": false
  }
}`}
/>

<hr/>

### Get a job

The job's status, stage and counts. This is what the admin page asks every 5 seconds while the job is at work.

<Api
method="GET"
url="/api/import-jobs/{id}"
responseSample={`{
  "data": {
    "uuid": "6f1d9a52-0000-4000-8000-000000000001",
    "entity": "product",
    "mode": "upsert",
    "status": "running",
    "stage": "writing",
    "cancelRequested": false,
    "fileName": "products.csv",
    "fileSize": 12345678,
    "fileKept": true,
    "options": { "checkImages": false },
    "counts": {
      "total": 49310, "errors": 0, "warnings": 25,
      "createRows": 48310, "updateRows": 1000,
      "created": 17400, "updated": 560, "failed": 3, "skipped": 0,
      "byCode": { "validate": {}, "import": { "WRITE_FAILED": 3 } }
    },
    "errorMessage": null,
    "createdAt": "2026-10-19T09:00:00.000Z",
    "startedAt": "2026-10-19T09:02:00.000Z",
    "finishedAt": null,
    "waitingSince": null,
    "createdBy": { "id": 1, "name": "Jane" }
  }
}`}
/>

<hr/>

### List the open jobs

The unfinished job of each type, and the stopped or interrupted ones. The upload page uses it to show the notices before an upload.

<Api
method="GET"
url="/api/import-open-jobs"
responseSample={`{ "data": [ { "uuid": "…", "entity": "category", "status": "validated" } ] }`}
/>

<hr/>

### List the problems of a job

The problems of the check (before the import started) or of the import (after it), a page at a time. Messages are in the language of the request (the `X-Locale` header, when it names an enabled language) or else the store's language; a job's `errorMessage` too. The same goes for the problems written in the file with errors. The problems are stored as a sentence and its values, so changing the store's language changes how an old import reads.

<Api
method="GET"
url="/api/import-jobs/{id}/issues"
requestSchema={{
  "type": "object",
  "description": "Query parameters",
  "properties": {
    "phase": { "type": "string", "enum": ["validate", "import"], "description": "Defaults to the check before the import started and to the import after it." },
    "severity": { "type": "string", "enum": ["error", "warning"] },
    "code": { "type": "string", "description": "For example REFERENCE_NOT_FOUND." },
    "column": { "type": "string" },
    "page": { "type": "integer", "default": 1 },
    "limit": { "type": "integer", "default": 50 }
  }
}}
responseSample={`{
  "data": {
    "phase": "validate",
    "page": 1,
    "limit": 50,
    "total": 2,
    "byCode": { "INVALID_VALUE": 1, "REFERENCE_NOT_FOUND": 1 },
    "truncated": false,
    "items": [
      { "row": 2, "key": null, "column": "url_key", "code": "INVALID_VALUE", "severity": "error",
        "params": {}, "message": "The value in column \"url_key\" must use only lowercase letters, digits and single hyphens…", "value": "bad key!" }
    ]
  }
}`}
/>

<hr/>

### Download the file with errors

Every row of the uploaded file plus an `_errors` column. A job that ended with no failed or skipped rows keeps no file, and the answer is `409 FILE_UNAVAILABLE`.

<Api
method="GET"
url="/api/import-jobs/{id}/file-with-errors.csv"
responseSample={`url_key,name,parent,status,position,_errors
bad key!,Bad key,,1,1,"url_key: The value in column ""url_key"" must use only lowercase letters…"`}
/>

<hr/>

### Download a template

The template of a type: the header row and two example rows, built for this store (it has a column for each attribute and custom field). `{entity}` is `products`, `categories`, `customers` or `customer-addresses`.

<Api
method="GET"
url="/api/import-templates/{entity}"
responseSample={`url_key,name,parent,status,position,description,meta_title,meta_description,image
example-category,Example category,,1,1,Describe the category here.,Example category,A few words for search engines.,https://example.com/images/example-category.jpg`}
/>

<hr/>

### Start an import

Moves a checked job without errors to `queued`. A worker picks it up, checks the file once more, and writes. `409 FILE_HAS_ERRORS` if the check found errors; `409 IMPORT_ALREADY_RUNNING` if another import is queued or running.

<Api
method="POST"
url="/api/import-jobs/{id}/start"
responseSample={`{ "data": { "uuid": "…", "status": "queued" } }`}
/>

<hr/>

### Cancel

Asks the worker to stop between two rows; a queued job that no worker has claimed is canceled at once. The rows already written stay.

<Api
method="POST"
url="/api/import-jobs/{id}/cancel"
responseSample={`{ "data": { "uuid": "…", "status": "running", "cancelRequested": true, "cancel": "requested" } }`}
/>

<hr/>

### Resume

Continues a `stopped` or `interrupted` job: the failed rows are tried again and the import goes on after the last saved row. `409 OPEN_JOB_EXISTS` if the type has another unfinished job.

<Api
method="POST"
url="/api/import-jobs/{id}/resume"
responseSample={`{ "data": { "uuid": "…", "status": "queued" } }`}
/>

<hr/>

### Check again

Runs the check again on the stored file of a checked job, for example after you created a record the file refers to.

<Api
method="POST"
url="/api/import-jobs/{id}/recheck"
responseSample={`{ "data": { "uuid": "…", "status": "uploaded" } }`}
/>

<hr/>

### Delete a job

Deletes the job, its file and its problems. `409 WRONG_STATUS` for a job that is at work (`uploading`, `validating`, `queued` or `running`). The rows already imported stay in the store.

<Api
method="DELETE"
url="/api/import-jobs/{id}"
responseSample={`{ "data": { "uuid": "…", "status": "completed" } }`}
/>

## GraphQL

The list of past imports in the admin is the query `importJobs(filters)`, and the largest accepted file is `importLimits { maxFileBytes }`. Filters: `status`, `entity`, `file` (part of the file name), `ob` and `od` (order by `created_at`, `entity`, `status`, `file_name` or `file_size`), `page` and `limit`.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
