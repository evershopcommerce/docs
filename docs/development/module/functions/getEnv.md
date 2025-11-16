---
sidebar_position: 3
keywords:
- getEnv
- Environment variables
- Process environment
sidebar_label: getEnv
title: getEnv
description: Read environment variable values with optional default values.
groups:
  - utilities
---

# getEnv

Read environment variable values with optional default values.

## Import

```typescript
import { getEnv } from '@evershop/evershop/lib/util/getEnv';
```

## Syntax

```typescript
getEnv(name: string, defaultValue?: string): string
```

## Parameters

### `name`

**Type:** `string`

The name of the environment variable.

### `defaultValue`

**Type:** `string` (optional)

The value to return if the environment variable is not set.

## Return Value

Returns the environment variable value. If the variable is not set, returns the `defaultValue` if provided, otherwise returns `undefined`.

## Examples

### Basic Usage

```typescript
import { getEnv } from '@evershop/evershop/lib/util/getEnv';

// Get database host
const dbHost = getEnv('DB_HOST', 'localhost');

// Get API key
const apiKey = getEnv('STRIPE_SECRET_KEY');

// Get port number
const port = getEnv('PORT', '3000');
```

### With Type Conversion

```typescript
import { getEnv } from '@evershop/evershop/lib/util/getEnv';

// Convert to number
const port = parseInt(getEnv('PORT', '3000'), 10);

// Convert to boolean
const isProduction = getEnv('NODE_ENV') === 'production';

// Parse JSON
const allowedOrigins = JSON.parse(getEnv('ALLOWED_ORIGINS', '[]'));
```

### Database Configuration

```typescript
import { getEnv } from '@evershop/evershop/lib/util/getEnv';

const dbConfig = {
  host: getEnv('DB_HOST', 'localhost'),
  port: parseInt(getEnv('DB_PORT', '5432'), 10),
  database: getEnv('DB_NAME', 'evershop'),
  user: getEnv('DB_USER', 'postgres'),
  password: getEnv('DB_PASSWORD')
};
```

### Feature Flags

```typescript
import { getEnv } from '@evershop/evershop/lib/util/getEnv';

// Check if feature is enabled
const enableCache = getEnv('ENABLE_CACHE', 'true') === 'true';
const enableDebug = getEnv('DEBUG') === '1';

if (enableDebug) {
  console.log('Debug mode enabled');
}
```

### API Configuration

```typescript
import { getEnv } from '@evershop/evershop/lib/util/getEnv';

// External API configuration
const apiConfig = {
  stripe: {
    publicKey: getEnv('STRIPE_PUBLIC_KEY'),
    secretKey: getEnv('STRIPE_SECRET_KEY')
  },
  sendgrid: {
    apiKey: getEnv('SENDGRID_API_KEY')
  },
  aws: {
    accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    region: getEnv('AWS_REGION', 'us-east-1')
  }
};
```

## Environment Files

Environment variables are typically stored in `.env` files:

```bash
# .env file
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evershop
DB_USER=postgres
DB_PASSWORD=secret

NODE_ENV=development
PORT=3000

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

## Notes

- Environment variables are loaded at application startup
- Values are always returned as strings
- Type conversion must be done manually when needed
- Sensitive values (API keys, passwords) should only be stored in environment variables
- The `.env` file should be added to `.gitignore`
- Use different `.env` files for different environments

## See Also

- [getConfig](/docs/development/module/functions/getConfig) - Read configuration values
- [Configuration Guide](../../knowledge-base/configuration-guide.md) - Comprehensive guide on application configuration
