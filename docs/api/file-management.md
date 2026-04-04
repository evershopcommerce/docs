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

Lists files in a directory. The path after `/files/` specifies which directory to browse.

<Api
method="GET"
url="/api/files/{path}"
responseSample={`{
  "data": {
    "files": [
      {
        "name": "product-image.jpg",
        "type": "file",
        "size": 45230,
        "path": "catalog/products/product-image.jpg"
      },
      {
        "name": "thumbnails",
        "type": "directory",
        "path": "catalog/products/thumbnails"
      }
    ]
  }
}`}
/>

<hr/>

### Upload File

Uploads a file to the specified directory path. Send the file as multipart form data.

<Api
method="POST"
url="/api/files/{path}"
responseSample={`{
  "data": {
    "files": [
      {
        "name": "uploaded-file.pdf",
        "path": "documents/uploaded-file.pdf",
        "size": 102400
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
    "success": true
  }
}`}
/>

<hr/>

## Image Operations

### Upload Image

Uploads an image file with automatic processing (resizing, thumbnail generation). Send the image as multipart form data.

<Api
method="POST"
url="/api/images/{path}"
responseSample={`{
  "data": {
    "files": [
      {
        "name": "product-photo.jpg",
        "path": "catalog/products/product-photo.jpg",
        "thumb": "catalog/products/product-photo-thumb.jpg"
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
    "success": true
  }
}`}
/>
