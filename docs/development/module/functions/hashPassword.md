---
sidebar_position: 104
keywords:
- hashPassword
- comparePassword
- verifyPassword
- authentication
- security
groups:
- utilities
- authentication
sidebar_label: hashPassword
title: Password Utilities
description: Hash, compare, and validate passwords using bcrypt.
---

# Password Utilities

EverShop provides password utility functions for hashing, comparing, and validating passwords using bcrypt.

## Import

```typescript
import {
  hashPassword,
  comparePassword,
  verifyPassword,
  addPasswordValidationRule
} from '@evershop/evershop/lib/util/passwordHelper';
```

## hashPassword

Hash a plain-text password using bcrypt with a salt round of 10.

```typescript
hashPassword(password: string): string
```

### Example

```typescript
import { hashPassword } from '@evershop/evershop/lib/util/passwordHelper';

const hash = hashPassword('mySecurePassword');
// Returns: "$2a$10$..." (bcrypt hash string)
```

## comparePassword

Compare a plain-text password against a bcrypt hash.

```typescript
comparePassword(password: string, hash: string): boolean
```

### Example

```typescript
import { comparePassword } from '@evershop/evershop/lib/util/passwordHelper';

const isValid = comparePassword('mySecurePassword', storedHash);
if (isValid) {
  // Password matches
}
```

## verifyPassword

Validate a password against all registered validation rules. Throws an error if validation fails.

```typescript
verifyPassword(password: string): boolean
```

### Default Rules

- Password must be at least 6 characters

### Example

```typescript
import { verifyPassword } from '@evershop/evershop/lib/util/passwordHelper';

try {
  verifyPassword('ab'); // Throws: "Password must be at least 6 characters"
} catch (error) {
  console.error(error.message);
}
```

## addPasswordValidationRule

Add a custom password validation rule. Must be called during the bootstrap phase.

```typescript
addPasswordValidationRule(rule: Validator<string>): void
```

### Example

```typescript title="extensions/my-extension/src/bootstrap.ts"
import { addPasswordValidationRule } from '@evershop/evershop/lib/util/passwordHelper';

export default function () {
  addPasswordValidationRule({
    id: 'requireUppercase',
    func: (password) => /[A-Z]/.test(password),
    errorMessage: 'Password must contain at least one uppercase letter'
  });
}
```

## See Also

- [request.loginCustomerWithEmail](/docs/development/module/functions/request.loginCustomerWithEmail) - Customer login
- [updatePassword](/docs/development/module/functions/updatePassword) - Update customer password
