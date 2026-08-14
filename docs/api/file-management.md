---
sidebar_position: 16
hide_table_of_contents: true
displayed_sidebar: "apiSidebar"
keywords:
  - EverShop API
  - File Management
  - Media Upload
  - Image Upload
sidebar_label: File Management
title: File Management REST API
description: Use the EverShop REST API to browse, upload, and delete files and images.
---

import Api from '@site/src/components/rest/Api';

# File Management API

These endpoints manage files and media in your EverShop store. All file management endpoints require admin authentication.

## File Operations

### Browse Files

Lists the contents of a directory. The path after `/files/` specifies which directory to browse. Sub-directories and files are returned in **separate** keys: `folders` is a flat list of directory names, `files` carries a name and a servable URL.

<Api
method="GET"
url="/api/files/{path}"
responseSample={`{
  "data": {
    "folders": [
      "thumbnails"
    ],
    "files": [
      {
        "name": "product-image.jpg",
        "url": "/assets/catalog/products/product-image.jpg"
      }
    ]
  }
}`}
/>

<hr/>

### Upload File

Uploads one or more files to the specified directory. Send them as multipart form data under the field name **`images`** — up to 20 per request. The path segment must match `^[a-zA-Z0-9_/-]+$`.

<Api
method="POST"
url="/api/files/{path}"
responseSample={`{
  "data": {
    "files": [
      {
        "name": "uploaded-file.pdf",
        "mimetype": "application/pdf",
        "size": 102400,
        "url": "/assets/documents/uploaded-file.pdf"
      }
    ]
  }
}`}
/>

<hr/>

### Delete File

Deletes a file at the specified path.

<Api
method="DELETE"
url="/api/files/{path}"
responseSample={`{
  "data": {
    "path": "catalog/my-image.png"
  }
}`}
/>

<hr/>

## Image Operations

### Upload Image

Identical to `POST /api/files/{path}` except that every uploaded file must have an `image/*` mimetype — anything else is rejected with `400 Only images are allowed`.

No processing happens on upload: files are written as received. There is no resizing and no thumbnail generation. (Resizing is done on read by the storefront image processor, from the original.)

<Api
method="POST"
url="/api/images/{path}"
responseSample={`{
  "data": {
    "files": [
      {
        "name": "product-photo.jpg",
        "mimetype": "image/jpeg",
        "size": 88120,
        "url": "/assets/catalog/products/product-photo.jpg"
      }
    ]
  }
}`}
/>

<hr/>

## Folder Operations

### Create Folder

Creates a new directory in the media storage.

<Api
method="POST"
url="/api/folders"
requestSchema={{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Path for the new folder"
    }
  },
  "required": ["path"]
}}
responseSample={`{
  "data": {
    "path": "catalog/new-folder",
    "name": "new-folder"
  }
}`}
/>
