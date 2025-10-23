# @opencode-setup/notification

A simple, secure backend notification package using Firebase Admin SDK for sending push notifications to iOS devices with proper TypeScript types, error handling, and credential management.

## Installation

```bash
npm install @opencode-setup/notification
```

## Prerequisites

1. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. **Service Account**: Download your Firebase service account JSON file:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely (DO NOT commit to version control)

## Environment Setup

Set the path to your Firebase service account JSON file:

```bash
export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

Or place the file at the default location: `./firebase-service-account.json` (relative to your project root)

## Basic Usage

### Send a Simple Notification

```typescript
import { sendNotification } from '@opencode-setup/notification';

const result = await sendNotification(
  'device-token-here',
  {
    title: 'Hello!',
    body: 'This is a test notification',
  }
);

if (result.success) {
  console.log('Notification sent:', result.messageId);
} else {
  console.error('Failed to send:', result.error);
}
```

### Send Notification with Custom Data

```typescript
import { sendNotification } from '@opencode-setup/notification';

const result = await sendNotification(
  'device-token-here',
  {
    title: 'New Message',
    body: 'You have a new message from John',
    data: {
      userId: '123',
      chatId: '456',
      action: 'open_chat',
    },
  }
);
```

### Send Notification with Options

```typescript
import { sendNotification, NotificationOptions } from '@opencode-setup/notification';

const options: NotificationOptions = {
  badge: 5,              // Badge count on app icon
  sound: 'default',      // Notification sound
  priority: 'high',      // 'high' or 'normal'
  contentAvailable: true, // Wake app in background
  mutableContent: true,  // Allow notification modification
};

const result = await sendNotification(
  'device-token-here',
  {
    title: 'Important Update',
    body: 'Please check this message',
  },
  options
);
```

## Manual Initialization

By default, Firebase is auto-initialized on the first notification send. For more control, you can manually initialize:

```typescript
import { initializeFirebase, sendNotification } from '@opencode-setup/notification';

// Initialize with custom path
initializeFirebase({
  serviceAccountPath: '/custom/path/to/service-account.json',
  appName: 'my-custom-app',
});

// Now send notifications
const result = await sendNotification('device-token', {
  title: 'Hello',
  body: 'World',
});
```

## Error Handling

The package provides comprehensive error handling:

```typescript
import { sendNotification } from '@opencode-setup/notification';

const result = await sendNotification(deviceToken, payload);

if (!result.success) {
  // Handle specific error cases
  switch (result.error) {
    case 'Invalid or unregistered device token':
      // Remove token from database
      break;
    case 'Firebase authentication failed':
      // Check service account credentials
      break;
    case 'Firebase messaging service is temporarily unavailable':
      // Retry later
      break;
    default:
      console.error('Notification failed:', result.error);
  }
}
```

### Error Types

The package exports custom error classes for initialization errors:

```typescript
import { initializeFirebase, InitializationError } from '@opencode-setup/notification';

try {
  initializeFirebase({
    serviceAccountPath: '/invalid/path.json',
  });
} catch (error) {
  if (error instanceof InitializationError) {
    console.error('Init failed:', error.message);
    console.error('Path:', error.path);
  }
}
```

## TypeScript Types

All types are fully typed and exported:

```typescript
import {
  NotificationPayload,
  NotificationOptions,
  NotificationResult,
  FirebaseConfig,
  NotificationError,
  InitializationError,
} from '@opencode-setup/notification';

// Use types in your code
const payload: NotificationPayload = {
  title: 'Hello',
  body: 'World',
  data: {
    key: 'value',
  },
};

const options: NotificationOptions = {
  badge: 1,
  sound: 'default',
  priority: 'high',
};
```

## Security Best Practices

### 1. Never Commit Credentials

Add to your `.gitignore`:

```gitignore
# Firebase credentials
firebase-service-account.json
**/firebase-service-account*.json
```

### 2. File Permissions

Restrict access to your service account file:

```bash
chmod 600 /path/to/firebase-service-account.json
```

### 3. Environment Variables

Use environment variables in production:

```bash
# .env file (also add to .gitignore)
FIREBASE_SERVICE_ACCOUNT_PATH=/secure/path/to/service-account.json
```

### 4. Secrets Management

In CI/CD environments, use secrets management:

- **GitHub Actions**: Use GitHub Secrets
- **AWS**: Use AWS Secrets Manager
- **Docker**: Use Docker secrets
- **Kubernetes**: Use Kubernetes secrets

### 5. Validate Device Tokens

Always validate device tokens before storing them in your database:

```typescript
const result = await sendNotification(token, payload);

if (!result.success && result.error?.includes('Invalid or unregistered')) {
  // Remove invalid token from database
  await removeTokenFromDatabase(token);
}
```

## API Reference

### `sendNotification(deviceToken, payload, options?)`

Send a push notification to a device.

**Parameters:**
- `deviceToken` (string): The FCM device token
- `payload` (NotificationPayload): The notification content
  - `title` (string): Notification title (required)
  - `body` (string): Notification body (required)
  - `data` (Record<string, string>): Custom data (optional)
- `options` (NotificationOptions): APNs-specific options (optional)
  - `badge` (number): Badge count
  - `sound` (string): Sound filename
  - `priority` ('high' | 'normal'): Notification priority
  - `contentAvailable` (boolean): Wake app in background
  - `mutableContent` (boolean): Allow notification modification

**Returns:** `Promise<NotificationResult>`
- `success` (boolean): Whether the notification was sent
- `messageId` (string): Firebase message ID (if successful)
- `error` (string): Error message (if failed)

### `initializeFirebase(config?)`

Manually initialize Firebase Admin SDK.

**Parameters:**
- `config` (FirebaseConfig): Configuration options (optional)
  - `serviceAccountPath` (string): Path to service account JSON
  - `appName` (string): Custom Firebase app name

**Returns:** `admin.app.App` - The initialized Firebase app instance

**Throws:** `InitializationError` if initialization fails

## Validation

The package automatically validates:

- Device token is non-empty string
- Title and body are non-empty strings
- Payload size doesn't exceed 4KB (iOS limit)
- Badge is a positive number
- Priority is 'high' or 'normal'
- Service account file exists and is valid JSON
- Service account has required fields (project_id, private_key, client_email)

## Testing

The package includes comprehensive unit tests with >90% coverage:

```bash
cd packages/notification
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Building

Build the package for distribution:

```bash
npm run build
```

This generates:
- `dist/index.js` - ESM format
- `dist/index.cjs` - CommonJS format
- `dist/index.d.ts` - TypeScript definitions

## License

ISC

## Support

For issues and questions, please open an issue on the repository.
