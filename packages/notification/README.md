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

## Basic Usage

### Create a Notification Client

```typescript
import { notificationClient } from '@opencode-setup/notification';

// Create a client with your service account path
const client = notificationClient('/path/to/firebase-service-account.json');

// Send a notification
const result = await client.sendNotification(
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

### Destructured API (Recommended)

```typescript
import { notificationClient } from '@opencode-setup/notification';

// Destructure for convenience
const { sendNotification } = notificationClient('/path/to/service-account.json');

const result = await sendNotification('device-token', {
  title: 'Hello',
  body: 'World',
});
```

### Send Notification with Custom Data

```typescript
const { sendNotification } = notificationClient('/path/to/service-account.json');

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
import { notificationClient, NotificationOptions } from '@opencode-setup/notification';

const { sendNotification } = notificationClient('/path/to/service-account.json');

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

## Multiple Clients

You can create multiple independent notification clients for different Firebase projects:

```typescript
import { notificationClient } from '@opencode-setup/notification';

// Client for production
const prodClient = notificationClient('/path/to/prod-service-account.json', 'prod-app');

// Client for staging
const stagingClient = notificationClient('/path/to/staging-service-account.json', 'staging-app');

// Use them independently
await prodClient.sendNotification('token', { title: 'Prod', body: 'Message' });
await stagingClient.sendNotification('token', { title: 'Staging', body: 'Message' });
```

## Error Handling

The package provides comprehensive error handling:

```typescript
import { notificationClient } from '@opencode-setup/notification';

const { sendNotification } = notificationClient('/path/to/service-account.json');
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

### Initialization Errors

The package throws `InitializationError` when client creation fails:

```typescript
import { notificationClient, InitializationError } from '@opencode-setup/notification';

try {
  const client = notificationClient('/invalid/path.json');
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
  NotificationClient,
  NotificationClientConfig,
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

### 3. Secure Path Management

Store service account paths securely:

```typescript
// Use environment variables
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not set');
}

const { sendNotification } = notificationClient(serviceAccountPath);
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
const { sendNotification } = notificationClient('/path/to/service-account.json');
const result = await sendNotification(token, payload);

if (!result.success && result.error?.includes('Invalid or unregistered')) {
  // Remove invalid token from database
  await removeTokenFromDatabase(token);
}
```

## API Reference

### `notificationClient(serviceAccountPath, appName?)`

Create a notification client instance.

**Parameters:**
- `serviceAccountPath` (string): Path to Firebase service account JSON file (required)
- `appName` (string): Custom Firebase app name (optional)

**Returns:** `NotificationClient` - A client object with `sendNotification` method

**Throws:** `InitializationError` if credentials are missing or invalid

**Example:**
```typescript
const client = notificationClient('/path/to/service-account.json');
// or with custom app name
const client = notificationClient('/path/to/service-account.json', 'my-app');
```

### `client.sendNotification(deviceToken, payload, options?)`

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
