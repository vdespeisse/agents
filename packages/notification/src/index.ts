import { getFirebaseApp, initializeFirebase, isInitialized } from './firebase.js';
import { 
  NotificationPayload, 
  NotificationOptions, 
  NotificationResult,
  NotificationError 
} from './types.js';

/**
 * Validate device token format
 */
function validateDeviceToken(token: string): void {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new NotificationError('Device token must be a non-empty string', 'INVALID_TOKEN');
  }
}

/**
 * Validate notification payload
 */
function validatePayload(payload: NotificationPayload): void {
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
    throw new NotificationError('Notification title is required and must be a non-empty string', 'INVALID_PAYLOAD');
  }
  
  if (!payload.body || typeof payload.body !== 'string' || payload.body.trim().length === 0) {
    throw new NotificationError('Notification body is required and must be a non-empty string', 'INVALID_PAYLOAD');
  }

  // Check payload size (iOS limit is approximately 4KB)
  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > 4096) {
    throw new NotificationError(
      `Notification payload exceeds size limit (${payloadSize} bytes > 4096 bytes)`,
      'PAYLOAD_TOO_LARGE'
    );
  }
}

/**
 * Validate notification options
 */
function validateOptions(options?: NotificationOptions): void {
  if (!options) return;

  if (options.badge !== undefined && (typeof options.badge !== 'number' || options.badge < 0)) {
    throw new NotificationError('Badge must be a positive number', 'INVALID_OPTIONS');
  }

  if (options.priority !== undefined && options.priority !== 'high' && options.priority !== 'normal') {
    throw new NotificationError('Priority must be either "high" or "normal"', 'INVALID_OPTIONS');
  }
}

/**
 * Send a push notification to a device
 * @param deviceToken - The FCM device token
 * @param payload - The notification payload with title, body, and optional data
 * @param options - Optional APNs-specific configuration
 * @returns A promise that resolves to the notification result
 */
export async function sendNotification(
  deviceToken: string,
  payload: NotificationPayload,
  options?: NotificationOptions
): Promise<NotificationResult> {
  try {
    // Validate inputs
    validateDeviceToken(deviceToken);
    validatePayload(payload);
    validateOptions(options);

    // Auto-initialize Firebase if not already initialized
    if (!isInitialized()) {
      try {
        initializeFirebase();
      } catch (error) {
        return {
          success: false,
          error: `Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }

    // Get Firebase app and messaging instance
    const app = getFirebaseApp();
    const messaging = app.messaging();

    // Build FCM message with APNs configuration for iOS
    const message: any = {
      token: deviceToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      apns: {
        headers: {
          'apns-priority': options?.priority === 'normal' ? '5' : '10',
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            ...(options?.badge !== undefined && { badge: options.badge }),
            ...(options?.sound && { sound: options.sound }),
            ...(options?.contentAvailable && { 'content-available': 1 }),
            ...(options?.mutableContent && { 'mutable-content': 1 }),
          },
        },
      },
    };

    // Add custom data if provided
    if (payload.data) {
      message.data = payload.data;
    }

    // Send the notification
    const messageId = await messaging.send(message);

    return {
      success: true,
      messageId,
    };
  } catch (error: any) {
    // Handle Firebase-specific errors
    if (error.code) {
      const errorCode = error.code;
      let errorMessage = error.message;

      // Map common Firebase error codes to user-friendly messages
      switch (errorCode) {
        case 'messaging/invalid-registration-token':
        case 'messaging/registration-token-not-registered':
          errorMessage = 'Invalid or unregistered device token';
          break;
        case 'messaging/invalid-argument':
          errorMessage = 'Invalid notification payload or options';
          break;
        case 'messaging/authentication-error':
          errorMessage = 'Firebase authentication failed';
          break;
        case 'messaging/server-unavailable':
          errorMessage = 'Firebase messaging service is temporarily unavailable';
          break;
        case 'messaging/internal-error':
          errorMessage = 'Internal Firebase error occurred';
          break;
      }

      console.error(`Notification send failed [${errorCode}]:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Handle validation errors
    if (error instanceof NotificationError) {
      console.error('Notification validation failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Handle unknown errors
    console.error('Notification send failed:', error.message || 'Unknown error');
    return {
      success: false,
      error: error.message || 'Failed to send notification',
    };
  }
}

// Export Firebase initialization for manual control
export { initializeFirebase } from './firebase.js';

// Export all types
export * from './types.js';
