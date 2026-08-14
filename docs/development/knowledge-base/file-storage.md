---
sidebar_position: 38
keywords:
  - file storage
  - S3
  - Azure Blob Storage
  - Google Cloud Storage
  - media
  - fileUploader
  - storage provider
sidebar_label: File Storage
title: File Storage
description: How EverShop stores uploaded media, the four-processor registry seam that swaps storage backends, the built-in S3, Azure Blob and Google Cloud Storage providers, and how to write your own.
---

# File Storage

Every file that reaches EverShop through the admin file manager — product images, CMS media, uploads made by your own extension — goes through four small service functions in the `cms` module. Each one resolves a **storage provider** from the registry at call time, then delegates to it.

The default provider writes to the local `media` folder. EverShop also ships **built-in providers for Amazon S3, Azure Blob Storage and Google Cloud Storage**, and the seam is open, so an extension can register a provider for anything else.

:::info Cloud storage is now part of core
S3 and Azure Blob Storage used to be distributed as separate marketplace extensions (`@evershop/s3_file_storage` and `@evershop/azure_file_storage`). **They are built into core now**, together with a Google Cloud Storage provider. You do **not** need to install an extension to use cloud storage — anything you read elsewhere telling you to `npm install` one of those packages is out of date. See [Migrating from the storage extensions](#migrating-from-the-storage-extensions).
:::

## The four services

These are the only entry points. Import them from `@evershop/evershop/cms/services`.

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Service</th>
      <th>Signature</th>
      <th>Registry value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>uploadFile</code></td>
      <td><code>(files, destinationPath) =&gt; Promise&lt;UploadedFile[]&gt;</code></td>
      <td><code>fileUploader</code></td>
    </tr>
    <tr>
      <td><code>browFiles</code></td>
      <td><code>(path) =&gt; Promise&lt;&#123; files, folders &#125;&gt;</code></td>
      <td><code>fileBrowser</code></td>
    </tr>
    <tr>
      <td><code>deleteFile</code></td>
      <td><code>(path) =&gt; Promise&lt;void&gt;</code></td>
      <td><code>fileDeleter</code></td>
    </tr>
    <tr>
      <td><code>createFolder</code></td>
      <td><code>(destinationPath) =&gt; Promise&lt;string&gt;</code></td>
      <td><code>folderCreator</code></td>
    </tr>
  </tbody>
</table>

The return shapes matter if you call these directly:

```ts
import {
  browFiles,
  createFolder,
  deleteFile,
  uploadFile
} from '@evershop/evershop/cms/services';

const uploaded = await uploadFile(files, 'catalog/2026');
// [{ name: 'shoe.png', mimetype: 'image/png', size: 20481, url: 'https://…/catalog/2026/shoe.png' }]

const listing = await browFiles('catalog/2026');
// { files: [{ name: 'shoe.png', url: 'https://…/catalog/2026/shoe.png' }], folders: ['thumbnails'] }

const created = await createFolder('catalog/2027');
// 'catalog/2027'  — the normalized path

await deleteFile('catalog/2026/shoe.png');
// resolves to undefined; deleting a path that is already gone is NOT an error
```

`browFiles` returns **one object with two arrays** — `files` is an array of `{ name, url }` and `folders` is an array of plain folder-name strings (not objects, and not full paths). Every provider returns exactly this shape.

The matching REST endpoints are `GET /api/files/*` (browse), `POST /api/files/*` (upload), `DELETE /api/files/*` (delete) and `POST /api/folders` (create folder). All four are `private`.

## The registry seam

Each service asks the registry for its provider, passing the **active provider id** as the context:

```ts
const fileUploader = getValueSync(
  'fileUploader',
  localUploader,
  { config: getFileStorageProvider() },
  (value) => value && typeof value.upload === 'function'
);
const results = await fileUploader.upload(files, destinationPath);
```

The initial value is always the local implementation. Processors registered against `fileUploader` receive it and either return it unchanged or return their own provider object. The built-in providers do exactly that, in `modules/cms/bootstrap.ts`:

```ts
addProcessor('fileUploader', function (value) {
  const ctx = this as { config?: string };
  return ctx.config === 's3' ? s3FileUploader : value;
});
```

Twelve such processors are registered — four contracts times three providers. Note the `function` keyword: the registry context is bound to `this` with `.call()`, so an arrow function cannot read `this.config`.

The fourth argument to `getValueSync` is a **validator**. A processor that returns something without the expected method (`upload`, `list`, `delete`, `create`) makes the call throw `Value fileUploader is invalid`, so a malformed provider fails loudly at the point of use rather than silently corrupting uploads.

Processors run in priority order, ascending. `addProcessor` defaults to priority 10, which is what all twelve built-in registrations use.

See [Registry and Processors](./registry-and-processors) for the general mechanics.

### Resolution happens at call time, not at boot

`getFileStorageProvider()` (in `modules/cms/services/storage/storageConfig.ts`) is evaluated on **every** call:

```ts
export function getFileStorageProvider(): string {
  return (
    getSettingSync('fileStorage', '') || getConfig('system.file_storage', 'local')
  );
}
```

Because the resolved provider id is passed as the registry **context**, and the registry caches a value only while both the initial value and the context are deep-equal to the previous call, changing the provider changes the context, which re-runs the processors and yields the other provider object.

**Switching storage providers therefore needs no restart.** Save the setting and the very next upload lands on the new backend. Files already uploaded keep their stored URLs (see [the base URL contract](#the-public-base-url-contract)).

## Configuration precedence

There are **two different precedence chains**, and they are deliberately inverted relative to each other.

**Provider selection** — the database setting wins:

```
setting `fileStorage`  →  config `system.file_storage`  →  'local'
```

**Provider credentials and options** — config and environment win:

```
config `system.<provider>.<key>`  →  environment variable  →  database setting  →  default
```

The reasoning: an operator pins credentials in infrastructure (config file, environment) and the admin panel must not be able to override them, while the choice of *which* backend is live is an operational switch that should be flippable from the admin panel. Any credential field that config or an environment variable pins is reported by `getFileStorageConfigOverrides()` and rendered disabled (and masked, for secrets) in the admin form.

### Environment variables

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Environment variable</th>
      <th>Config key</th>
      <th>Setting key</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>AWS_REGION</code></td>
      <td><code>system.s3.region</code></td>
      <td><code>s3Region</code></td>
      <td>Required to build AWS URLs when no endpoint or base URL is set.</td>
    </tr>
    <tr>
      <td><code>AWS_BUCKET_NAME</code></td>
      <td><code>system.s3.bucket</code></td>
      <td><code>s3Bucket</code></td>
      <td>Required. Missing bucket throws on the first storage call.</td>
    </tr>
    <tr>
      <td><code>AWS_ACCESS_KEY_ID</code></td>
      <td><code>system.s3.accessKeyId</code></td>
      <td><code>s3AccessKeyId</code></td>
      <td>Optional — omit to use the SDK default credential chain (IAM role, IRSA, shared config).</td>
    </tr>
    <tr>
      <td><code>AWS_SECRET_ACCESS_KEY</code></td>
      <td><code>system.s3.secretAccessKey</code></td>
      <td><code>s3SecretAccessKey</code></td>
      <td>Optional, same as above.</td>
    </tr>
    <tr>
      <td><code>AWS_S3_ENDPOINT</code></td>
      <td><code>system.s3.endpoint</code></td>
      <td><code>s3Endpoint</code></td>
      <td>S3-compatible endpoint (R2, MinIO, Spaces, Hetzner).</td>
    </tr>
    <tr>
      <td><code>AWS_S3_FORCE_PATH_STYLE</code></td>
      <td><code>system.s3.forcePathStyle</code></td>
      <td><code>s3ForcePathStyle</code></td>
      <td>Boolean. <code>1</code>, <code>true</code> or <code>yes</code> (case-insensitive) are true; default false.</td>
    </tr>
    <tr>
      <td><code>AWS_S3_BASE_URL</code></td>
      <td><code>system.s3.baseUrl</code></td>
      <td><code>s3BaseUrl</code></td>
      <td>Public base URL / CDN. See the base URL contract below.</td>
    </tr>
    <tr>
      <td><code>AZURE_STORAGE_CONNECTION_STRING</code></td>
      <td><code>system.azure.connectionString</code></td>
      <td><code>azureStorageConnectionString</code></td>
      <td>Required for Azure.</td>
    </tr>
    <tr>
      <td><code>AZURE_STORAGE_CONTAINER_NAME</code></td>
      <td><code>system.azure.containerName</code></td>
      <td><code>azureStorageContainerName</code></td>
      <td>Defaults to <code>images</code>.</td>
    </tr>
    <tr>
      <td><code>AZURE_STORAGE_BASE_URL</code></td>
      <td><code>system.azure.baseUrl</code></td>
      <td><code>azureBaseUrl</code></td>
      <td>Public base URL / CDN.</td>
    </tr>
    <tr>
      <td><code>GCS_BUCKET_NAME</code></td>
      <td><code>system.gcs.bucket</code></td>
      <td><code>gcsBucket</code></td>
      <td>Required for Google Cloud Storage.</td>
    </tr>
    <tr>
      <td><code>GCS_BASE_URL</code></td>
      <td><code>system.gcs.baseUrl</code></td>
      <td><code>gcsBaseUrl</code></td>
      <td>Public base URL / CDN.</td>
    </tr>
    <tr>
      <td><code>IMAGE_ALLOWED_HOSTS</code></td>
      <td>—</td>
      <td>—</td>
      <td>Comma-separated allowlist for the <code>/images</code> proxy. See below.</td>
    </tr>
  </tbody>
</table>

Two options have **no environment variable** — set them in the config file or from the admin panel:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Config key</th>
      <th>Setting key</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>system.azure.containerAccess</code></td>
      <td><code>azureContainerAccess</code></td>
      <td><code>private</code> (default) or <code>blob</code>.</td>
    </tr>
    <tr>
      <td><code>system.gcs.serviceAccountKey</code></td>
      <td><code>gcsServiceAccountKey</code></td>
      <td>Full service-account key JSON. Omit to use Application Default Credentials — including <code>GOOGLE_APPLICATION_CREDENTIALS</code>, which the Google SDK reads on its own.</td>
    </tr>
  </tbody>
</table>

### Config blocks

`system.file_storage` is an enum of `local`, `s3`, `azure`, `gcs`, defaulting to `local`. The per-provider blocks sit next to it:

```json
{
  "system": {
    "file_storage": "s3",
    "s3": {
      "region": "eu-central-1",
      "bucket": "my-store-media",
      "endpoint": "",
      "forcePathStyle": false,
      "baseUrl": "https://cdn.example.com"
    },
    "azure": {
      "containerName": "images",
      "containerAccess": "private",
      "baseUrl": "https://cdn.example.com/images"
    },
    "gcs": {
      "bucket": "my-store-media",
      "baseUrl": "https://cdn.example.com"
    }
  }
}
```

Keep secrets (`accessKeyId`, `secretAccessKey`, `connectionString`, `serviceAccountKey`) out of committed config files — use environment variables or the admin panel.

## The public base URL contract

All three cloud providers build a stored file URL the same way when a base URL is configured:

```
trimTrailingSlash(baseUrl) + '/' + encodeKeyForUrl(objectKey)
```

**Only the object key is appended. The bucket or container name is never inserted.** The value you configure must therefore resolve to the bucket/container **root**. A path prefix inside the value is fine (`https://cdn.example.com/media`), but the provider will not add anything you leave out.

Without a base URL each provider falls back to its native URL form:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Provider</th>
      <th>Native URL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>S3 (AWS)</td>
      <td><code>https://&#123;bucket&#125;.s3.&#123;region&#125;.amazonaws.com/&#123;key&#125;</code> — region-qualified, never the legacy global endpoint.</td>
    </tr>
    <tr>
      <td>S3 (custom endpoint)</td>
      <td>Virtual-hosted <code>&#123;bucket&#125;.&#123;endpointHost&#125;/&#123;key&#125;</code>, or path-style <code>&#123;endpoint&#125;/&#123;bucket&#125;/&#123;key&#125;</code> when <code>forcePathStyle</code> is on.</td>
    </tr>
    <tr>
      <td>Azure</td>
      <td>The SDK blob URL, which <strong>contains the container</strong>.</td>
    </tr>
    <tr>
      <td>Google Cloud Storage</td>
      <td><code>https://storage.googleapis.com/&#123;bucket&#125;/&#123;key&#125;</code></td>
    </tr>
  </tbody>
</table>

:::caution Azure and CDN base URLs
The native Azure blob URL includes the container name; the base-URL form does not. If you point `AZURE_STORAGE_BASE_URL` at a bare CDN or Front Door domain, every image 404s. Either set the CDN endpoint's origin path to `/{container}`, or include the container in the value itself: `https://cdn.example.net/images`.
:::

**Stored URLs are persisted at upload time.** `uploadFile` returns a fully-formed absolute URL and callers save it on the entity. Changing the base URL afterwards only affects **new** uploads — existing rows keep the URL they were saved with. Plan a data migration if you move a CDN domain.

Object keys are URL-encoded per segment (`/` preserved) because folder names are user input and are not sanitized. Upload, browse and delete all normalize paths through one shared `buildKey()` helper, so they can never disagree about the key format.

## The `/images` proxy allowlist

Storefront images render through `/images?src=…`. For an absolute URL the image processor fetches the origin with `secureFetch`, which enforces a **strict host allowlist** on every connection, including each redirect hop. A host that is not on the list is refused — this is both an SSRF guard and what stops the endpoint being used as a free image-optimization proxy for arbitrary third-party images.

That used to be the classic cloud-storage trap: uploads succeeded, and then every storefront image 404'd because the bucket host was not in `IMAGE_ALLOWED_HOSTS`.

Core now closes it. `modules/cms/bootstrap.ts` calls `registerAllowedImageHostsProvider(getFileStorageImageHosts)`, and the effective allowlist is the **union** of:

- `IMAGE_ALLOWED_HOSTS` (comma-separated), and
- every host contributed by a registered provider.

`getFileStorageImageHosts()` derives, for the currently active provider: the base URL host; the custom endpoint host and its virtual-hosted `{bucket}.{endpointHost}` form; the region-qualified AWS bucket host; `storage.googleapis.com`; and the Azure blob host parsed out of the connection string (`BlobEndpoint=` wins, otherwise `{AccountName}.blob.{EndpointSuffix}`).

Providers run **on every check**, not once at boot, so a provider switch made in the admin panel takes effect immediately. A provider that throws is skipped, so a misconfigured storage setting can never take image serving down.

One edge case on plain AWS: if the region comes only from the SDK's deeper chain (shared config, instance metadata) rather than explicit configuration, the derived bucket host appears after the first storage operation of each boot. Configuring the region explicitly avoids this.

Extensions can contribute hosts the same way:

```ts
import { registerAllowedImageHostsProvider } from '@evershop/evershop/lib/util/secureFetch';

export default () => {
  registerAllowedImageHostsProvider(() => ['media.partner-cdn.example']);
};
```

This is a plain module-level callback array, not the locked hook registry — but register it from `bootstrap.ts` anyway, so it is in place before the first request.

## Delete is idempotent

**Changed in 2.2.1.** Deleting a file that does not exist is a **successful no-op on every provider, including local storage.** `DELETE /api/files/<missing-path>` used to return 500 on local storage; it now succeeds.

The goal state ("the file is gone") is already true, so retries, double-clicks and stale file-manager views do not surface errors, and all four backends behave identically:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Provider</th>
      <th>Mechanism</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Local</td><td><code>ENOENT</code> is treated as success; logs a warning.</td></tr>
    <tr><td>S3</td><td>Bare <code>DeleteObject</code>, which is natively idempotent. No <code>HeadObject</code> precheck — it costs a round trip and reports 403 instead of 404 without <code>s3:ListBucket</code>.</td></tr>
    <tr><td>Azure</td><td><code>deleteIfExists()</code>; logs a warning when nothing was deleted.</td></tr>
    <tr><td>Google Cloud Storage</td><td><code>delete(&#123; ignoreNotFound: true &#125;)</code>.</td></tr>
  </tbody>
</table>

Deleting an **empty path** still throws on the cloud providers, and deleting a **directory** still throws on local storage. Only "not found" is forgiven.

If your own provider implements `fileDeleter`, match this contract.

## S3-compatible services

Setting a custom endpoint plus `forcePathStyle` is all that is needed for Cloudflare R2, MinIO, DigitalOcean Spaces and similar services:

```bash
AWS_S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
AWS_S3_FORCE_PATH_STYLE=false
AWS_BUCKET_NAME=my-store-media
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BASE_URL=https://media.example.com
```

MinIO needs `AWS_S3_FORCE_PATH_STYLE=true`. When an endpoint is configured, the region is no longer required to build URLs.

Two more S3 notes that come from the provider implementation rather than configuration:

- The browser paginates on `NextContinuationToken`, so folders with more than 1,000 entries list completely (`CommonPrefixes` count toward that cap).
- Uploads set `ContentType` from the file's mimetype. The SDK does not infer it, and without it objects are served as `binary/octet-stream`.
- Folders are zero-byte `{key}/` marker objects — the same convention the AWS console uses. The listing filters the marker by key, not by size, so genuinely empty files are still listed.

Public read access is a bucket-policy concern. New buckets have Block Public Access enabled and ACLs disabled, so the provider never sends `ACL: 'public-read'` — grant read access with a bucket policy, or keep the bucket private and put a CDN in front of it with `AWS_S3_BASE_URL`.

## Azure container access

`containerAccess` controls the access level applied **when the container is auto-created**:

<table className="table-auto not-prose">
  <thead>
    <tr>
      <th>Value</th>
      <th>Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>private</code> (default)</td>
      <td>Container is created private. Never conflicts with account policy. Serve files through a CDN using the base URL.</td>
    </tr>
    <tr>
      <td><code>blob</code></td>
      <td>Container is created with anonymous blob read access, so native blob URLs work directly.</td>
    </tr>
  </tbody>
</table>

:::caution AllowBlobPublicAccess
`blob` only works if the storage account permits anonymous access. Modern ARM storage accounts default to **prohibiting** it, and container creation then fails with `PublicAccessNotPermitted` — which surfaces as an error on your first upload. Either enable `AllowBlobPublicAccess` on the account, or leave `containerAccess` at `private` and serve through a CDN.
:::

The container is created once and memoized, not on every operation. Listing uses `listBlobsByHierarchy('/')` so browsing one folder returns one level instead of iterating every blob under the prefix.

## Writing a custom storage provider

A provider is four plain objects plus four processors. Register them from your module's `bootstrap.ts` — the registry is locked after bootstrap, so `addProcessor` throws if you call it from a middleware or request handler.

```ts
import { addProcessor } from '@evershop/evershop/lib/util/registry';
import type { ValueRegistry } from '@evershop/evershop/types/registry';

const PROVIDER_ID = 'mystorage';

const myFileUploader: ValueRegistry['fileUploader'] = {
  upload: async (files, destinationPath) =>
    Promise.all(
      files.map(async (file) => {
        const key = await putObject(destinationPath, file);
        return {
          name: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: `https://cdn.example.com/${key}`
        };
      })
    )
};

const myFileBrowser: ValueRegistry['fileBrowser'] = {
  list: async (path) => ({
    files: [{ name: 'shoe.png', url: 'https://cdn.example.com/shoe.png' }],
    folders: ['thumbnails']
  })
};

const myFileDeleter: ValueRegistry['fileDeleter'] = {
  delete: async (path) => {
    await removeObject(path);
  }
};

const myFolderCreator: ValueRegistry['folderCreator'] = {
  create: async (destinationPath) => destinationPath
};

export default () => {
  addProcessor('fileUploader', function (value) {
    return (this as { config?: string }).config === PROVIDER_ID
      ? myFileUploader
      : value;
  });
  addProcessor('fileBrowser', function (value) {
    return (this as { config?: string }).config === PROVIDER_ID
      ? myFileBrowser
      : value;
  });
  addProcessor('fileDeleter', function (value) {
    return (this as { config?: string }).config === PROVIDER_ID
      ? myFileDeleter
      : value;
  });
  addProcessor('folderCreator', function (value) {
    return (this as { config?: string }).config === PROVIDER_ID
      ? myFolderCreator
      : value;
  });
};
```

Rules to follow:

- **Use `function`, not an arrow function.** The provider id arrives as `this.config`.
- **Return `value` unchanged** when the context is not yours. That is what keeps providers composable.
- **Honor the contracts.** `list` must return `{ files, folders }` with `files` as `{ name, url }` objects and `folders` as strings. `create` must return the normalized path. `delete` must treat a missing file as success.
- **Add your id to the enum**, otherwise config validation rejects it. Extend `system.file_storage` from the same bootstrap:

  ```ts
  import { merge } from '@evershop/evershop/lib/util/merge';

  addProcessor('configurationSchema', (schema) => {
    merge(schema, {
      properties: {
        system: {
          type: 'object',
          properties: {
            file_storage: { type: 'string', enum: ['mystorage'] }
          }
        }
      }
    });
    return schema;
  });
  ```

  `merge` unions arrays, so the enum accumulates rather than replacing the core values.

- **Register the storage host** with `registerAllowedImageHostsProvider` if your files are served from a host the `/images` proxy must fetch.
- **Extensions bootstrap after core modules**, so an extension processor registered for an id that core also handles runs later and wins. You can override a built-in provider this way.

## Contributing a settings card

The admin System Setting page (`/admin/setting/system`) is a composition point, not a fixed form. The page owns a `<Form>` and renders `<Area id="systemSetting" />`; feature modules inject cards into it. Core's own file storage form does exactly that:

```tsx
export const layout = {
  areaId: 'systemSetting',
  sortOrder: 10
};
```

Drop a component at `pages/admin/systemSetting/YourSetting.tsx` in your extension with that `layout` export and your fields render inside the shared form, saved through the existing `saveSetting` API. Choose a `sortOrder` above 10 to sit below the file storage card.

That is the only admin-UI detail worth knowing as an extension author. Where the merchant types the credentials is a support question; the extension point is the area id.

## Migrating from the storage extensions

If you are on `@evershop/s3_file_storage` or `@evershop/azure_file_storage`:

1. **Remove the extension** from `system.extensions` in your config and uninstall the package. Leaving it enabled is not fatal — extensions bootstrap after core, so their processors would simply win — but you would keep running the older implementation and its known defects (legacy global-endpoint URLs, missing content types, listings truncated at 1,000 entries, unencoded keys).
2. **Keep your environment variables.** Core reads the same names the extensions used: `AWS_REGION`, `AWS_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME`. Nothing to rename.
3. **Keep `system.file_storage`** set to `s3` or `azure` — the core enum uses the same ids.
4. **Review your stored URLs.** The S3 provider now builds region-qualified `{bucket}.s3.{region}.amazonaws.com` URLs instead of the legacy `{bucket}.s3.amazonaws.com` form. URLs already saved on existing entities are unchanged, and the legacy host still resolves for older regions; new uploads use the correct form. If you want everything on one host, set `AWS_S3_BASE_URL` and re-point old rows in a data migration.
5. **Drop the `IMAGE_ALLOWED_HOSTS` entry for your bucket** if you added one — it is derived automatically now. Keeping it is harmless; the two sources are union'd.
6. **Expect delete to stop erroring** on missing files. If any of your code relied on a 500 from `DELETE /api/files/*` to detect a missing file, check for existence explicitly instead.

## See also

- [Registry and Processors](./registry-and-processors) — how `getValueSync`, contexts and processor ordering work.
- [Static File Serving](./static-file-serving) — how local files under `public/` and `media/` are served.
- [Configuration Guide](./configuration-guide) — configuration layers and environment variable handling.

import Sponsors from '@site/src/components/Sponsor';

<Sponsors/>
