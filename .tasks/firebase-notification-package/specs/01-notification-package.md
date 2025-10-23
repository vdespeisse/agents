# 01. Firebase Admin Notification Package

> **Updated**: 2025-10-23 - Refactored from singleton pattern to functional client-based API. Removed process.env dependency for service account path.

## Meta

- **ID**: firebase-notification-package-01
- **Depends On**: []

## Objective

Build a simple, secure backend notification package using firebase-admin that can send push notifications to iOS devices with proper TypeScript types, error handling, and credential management. Uses a functional client-based API instead of singleton pattern.

## Deliverables

- [ ] File: `packages/notification/src/types.ts` - TypeScript type definitions for notification payloads, configuration, and responses
- [ ] File: `packages/notification/src/firebase.ts` - Firebase Admin SDK initialization with service account credential loading
- [ ] File: `packages/notification/src/index.ts` - Main exports with sendNotification function
- [ ] File: `packages/notification/package.json` - Updated with firebase-admin dependency
- [ ] File: `packages/notification/tests/notification.test.ts` - Unit tests for notification sending
- [ ] File: `packages/notification/tests/firebase.test.ts` - Unit tests for Firebase initialization
- [ ] File: `packages/notification/README.md` - Usage documentation with examples

## Implementation Steps

### 1. Define TypeScript Types (`src/types.ts`)

- Create `NotificationPayload` interface with title, body, and optional data object
- Create `NotificationOptions` interface for additional APNs configuration
- Create `NotificationResult` interface for success/failure responses
- Create `NotificationClientConfig` interface for service account path and app name (required path)
- Create `NotificationClient` interface with sendNotification method
- Export error types: `NotificationError`, `InitializationError`

### 2. Implement Firebase App Creation (`src/firebase.ts`)

- Create `createFirebaseApp(config: NotificationClientConfig)` function
- Load service account credentials from required file path parameter
- Validate credentials exist before initialization
- Handle initialization errors with descriptive messages
- Generate unique app name if not provided to support multiple clients
- Return initialized Firebase app instance

### 3. Implement Notification Client (`src/index.ts`)

- Create `notificationClient(serviceAccountPath: string, appName?: string)` function
- Initialize Firebase app on client creation (not lazy)
- Return client object with `sendNotification` method
- Build FCM message with APNs-specific configuration for iOS
- Set proper APNs headers and priority
- Handle device token validation
- Implement error handling for:
  - Invalid device tokens
  - Network failures
  - Firebase authentication errors
  - Invalid payload format
- Return `NotificationResult` with success status and message ID or error details
- Export all types from types.ts
- Support multiple independent clients

### 4. Update Package Configuration (`package.json`)

- Add `firebase-admin` to dependencies (version ^12.0.0)
- Add `@types/node` to devDependencies for Node.js types
- Ensure build script generates proper ESM and CJS outputs
- Add test coverage script

### 5. Implement Comprehensive Tests

- **Unit Tests for Firebase Initialization**:
  - Test successful initialization with valid credentials
  - Test initialization with custom config
  - Test singleton pattern (multiple calls return same instance)
  - Test error handling for missing credentials file
  - Test error handling for invalid JSON in credentials
  - Mock firebase-admin module

- **Unit Tests for Notification Sending**:
  - Test successful notification send
  - Test auto-initialization on first send
  - Test invalid device token handling
  - Test missing required payload fields
  - Test network error handling
  - Test Firebase authentication errors
  - Mock Firebase messaging methods

### 6. Create Documentation (`README.md`)

- Installation instructions
- Environment variable setup (FIREBASE_SERVICE_ACCOUNT_PATH)
- Basic usage example with sendNotification
- Manual initialization example
- Error handling examples
- TypeScript type usage examples
- Security best practices for credential storage

## Acceptance Criteria

- [ ] **Type Safety**: All functions have proper TypeScript types with no `any` types
  - Validation: Run `npm run build` and check for type errors
  - Command: `cd packages/notification && npm run build`

- [ ] **Firebase Initialization**: Firebase Admin SDK initializes successfully with valid service account
  - Validation: Unit test passes with mocked credentials
  - Command: `cd packages/notification && npm test -- firebase.test.ts`

- [ ] **Singleton Pattern**: Multiple initialization calls return the same Firebase app instance
  - Validation: Test verifies app instance identity
  - Command: `cd packages/notification && npm test -- firebase.test.ts -t "singleton"`

- [ ] **Notification Sending**: sendNotification successfully sends to valid device token
  - Validation: Mock Firebase messaging returns success response
  - Command: `cd packages/notification && npm test -- notification.test.ts -t "successful"`

- [ ] **Error Handling - Missing Credentials**: Throws descriptive error when service account file not found
  - Validation: Test catches InitializationError with file path in message
  - Command: `cd packages/notification && npm test -- firebase.test.ts -t "missing credentials"`

- [ ] **Error Handling - Invalid Token**: Returns error result for invalid device token
  - Validation: Test verifies NotificationResult.success is false with error message
  - Command: `cd packages/notification && npm test -- notification.test.ts -t "invalid token"`

- [ ] **Error Handling - Invalid Payload**: Validates required fields (title, body) are present
  - Validation: Test verifies error thrown for missing required fields
  - Command: `cd packages/notification && npm test -- notification.test.ts -t "invalid payload"`

- [ ] **Environment Variable Support**: Reads FIREBASE_SERVICE_ACCOUNT_PATH from environment
  - Validation: Test with mocked process.env returns correct path
  - Command: `cd packages/notification && npm test -- firebase.test.ts -t "environment"`

- [ ] **ESM/CJS Compatibility**: Package builds both ESM and CJS formats with type definitions
  - Validation: Check dist/ contains index.js, index.cjs, and index.d.ts
  - Command: `cd packages/notification && npm run build && ls -la dist/`

- [ ] **No Credentials in Code**: No hardcoded credentials or service account data in source files
  - Validation: Grep for common credential patterns
  - Command: `cd packages/notification && grep -r "private_key\|client_email\|project_id" src/ || echo "No credentials found"`

## Test Requirements

**Unit Tests**:

- `firebase.ts`: initializeFirebase, getFirebaseApp, singleton behavior, error cases (AAA pattern)
- `index.ts`: sendNotification with various payloads, auto-initialization, error handling (AAA pattern)
- Mock firebase-admin module completely to avoid real Firebase calls
- Use vitest mocking capabilities (vi.mock, vi.fn)

**Edge Cases**:

- Empty device token string
- Null/undefined payload fields
- Very long notification body (>4KB)
- Special characters in notification text
- Missing service account file
- Malformed JSON in service account file
- Network timeout scenarios
- Firebase quota exceeded errors

**Coverage Target**: 90%

## API Design

### Types (`src/types.ts`)

```typescript
export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
}

export interface NotificationOptions {
  badge?: number
  sound?: string
  priority?: 'high' | 'normal'
  contentAvailable?: boolean
  mutableContent?: boolean
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface NotificationClientConfig {
  serviceAccountPath: string // Required
  appName?: string
}

export interface NotificationClient {
  sendNotification: (
    deviceToken: string,
    payload: NotificationPayload,
    options?: NotificationOptions
  ) => Promise<NotificationResult>
}

export class NotificationError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'NotificationError'
  }
}

export class InitializationError extends Error {
  constructor(
    message: string,
    public path?: string
  ) {
    super(message)
    this.name = 'InitializationError'
  }
}
```

### Firebase App Creation (`src/firebase.ts`)

```typescript
export function createFirebaseApp(config: NotificationClientConfig): admin.app.App
```

### Main API (`src/index.ts`)

```typescript
export function notificationClient(serviceAccountPath: string, appName?: string): NotificationClient

export * from './types'
```

## Client-Based Approach

### Service Account Loading Strategy

1. **Required Parameter**:
   - Service account path must be explicitly provided to `notificationClient()`
   - No environment variable fallback or default path
   - Forces explicit credential management

2. **Validation**:
   - Check file exists using `fs.existsSync()`
   - Validate JSON structure has required fields: `project_id`, `private_key`, `client_email`
   - Throw `InitializationError` with descriptive message if validation fails

3. **Client Creation**:
   - Use `admin.initializeApp()` with credential from file
   - Generate unique app name if not provided (supports multiple clients)
   - Return client object with sendNotification method
   - Each client is independent with its own Firebase app instance

4. **Multiple Clients**:
   - Support creating multiple clients for different Firebase projects
   - Each client maintains its own Firebase app instance
   - No shared state between clients

### Usage Pattern

```typescript
// Single client
const client = notificationClient('/path/to/service-account.json')
await client.sendNotification('token', { title: 'Hi', body: 'There' })

// Destructured (recommended)
const { sendNotification } = notificationClient('/path/to/service-account.json')
await sendNotification('token', { title: 'Hi', body: 'There' })

// Multiple clients
const prodClient = notificationClient('/path/to/prod.json', 'prod')
const devClient = notificationClient('/path/to/dev.json', 'dev')
```

## Error Handling Strategy

### Error Categories

1. **Initialization Errors** (`InitializationError`):
   - Missing service account file
   - Invalid JSON format
   - Missing required credential fields
   - Firebase Admin SDK initialization failure

2. **Notification Errors** (`NotificationError`):
   - Invalid device token format
   - Empty or missing required payload fields
   - Firebase messaging API errors
   - Network/timeout errors

### Error Response Format

```typescript
// Success
{
  success: true,
  messageId: "projects/myproject/messages/0:1234567890"
}

// Failure
{
  success: false,
  error: "Invalid device token format",
  code: "INVALID_TOKEN" // Optional error code
}
```

### Error Handling Implementation

- **Validation Errors**: Throw synchronously before Firebase call
- **Firebase Errors**: Catch and convert to `NotificationResult` with error details
- **Network Errors**: Catch and return descriptive error in result
- **Log Errors**: Use console.error for debugging (can be disabled in production)

## Security Considerations

### Credential Management

1. **Never Commit Credentials**:
   - Add `firebase-service-account.json` to `.gitignore`
   - Add `**/firebase-service-account*.json` pattern
   - Document in README.md

2. **File Permissions**:
   - Service account file should be readable only by application user
   - Recommend `chmod 600` for service account file
   - Document in README.md

3. **Environment Variables**:
   - Prefer environment variables over hardcoded paths in production
   - Use secrets management in CI/CD (GitHub Secrets, etc.)
   - Never log credential file contents

4. **Validation**:
   - Validate device token format before sending
   - Sanitize error messages to avoid leaking sensitive data
   - Don't include credential details in error messages

### Input Validation

1. **Device Token**:
   - Check non-empty string
   - Validate format (APNs tokens are 64 hex characters or FCM tokens)
   - Reject tokens with suspicious patterns

2. **Notification Payload**:
   - Validate title and body are non-empty strings
   - Limit body length (iOS limit is ~4KB)
   - Sanitize data object keys and values
   - Reject payloads exceeding size limits

3. **Options**:
   - Validate badge is positive integer
   - Validate priority is 'high' or 'normal'
   - Validate sound is valid filename

### Production Recommendations

- Use environment variables for all configuration
- Implement rate limiting in consuming applications
- Monitor Firebase quota usage
- Rotate service account keys periodically
- Use Firebase Admin SDK's built-in retry logic
- Implement logging for audit trails (without sensitive data)

## Validation

```bash
# Build succeeds with no errors
cd packages/notification && npm run build
# Expected: dist/ contains index.js, index.cjs, index.d.ts

# TypeScript compilation succeeds
cd packages/notification && npx tsc --noEmit
# Expected: no errors

# All tests pass
cd packages/notification && npm test
# Expected: all tests pass, coverage > 90%

# No credentials in source code
cd packages/notification && grep -r "private_key\|client_email" src/ || echo "Clean"
# Expected: "Clean" output

# Package can be imported
cd packages/notification && node -e "import('./dist/index.js').then(m => console.log(Object.keys(m)))"
# Expected: ['sendNotification', 'initializeFirebase', 'NotificationPayload', ...]
```

## Exit Criteria

- [ ] All deliverables complete and committed
- [ ] All acceptance criteria pass
- [ ] Tests pass with >90% coverage
- [ ] Build produces ESM, CJS, and type definitions
- [ ] README.md documents all usage patterns
- [ ] No credentials committed to repository
- [ ] Package can be imported in external projects
