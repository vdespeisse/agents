import * as admin from 'firebase-admin';

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}
interface NotificationOptions {
    badge?: number;
    sound?: string;
    priority?: 'high' | 'normal';
    contentAvailable?: boolean;
    mutableContent?: boolean;
}
interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
interface FirebaseConfig {
    serviceAccountPath?: string;
    appName?: string;
}
declare class NotificationError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
declare class InitializationError extends Error {
    path?: string | undefined;
    constructor(message: string, path?: string | undefined);
}

/**
 * Initialize Firebase Admin SDK with service account credentials
 * @param config - Optional configuration with service account path and app name
 * @returns The initialized Firebase app instance
 * @throws {InitializationError} If credentials are missing or invalid
 */
declare function initializeFirebase(config?: FirebaseConfig): admin.app.App;

/**
 * Send a push notification to a device
 * @param deviceToken - The FCM device token
 * @param payload - The notification payload with title, body, and optional data
 * @param options - Optional APNs-specific configuration
 * @returns A promise that resolves to the notification result
 */
declare function sendNotification(deviceToken: string, payload: NotificationPayload, options?: NotificationOptions): Promise<NotificationResult>;

export { type FirebaseConfig, InitializationError, NotificationError, type NotificationOptions, type NotificationPayload, type NotificationResult, initializeFirebase, sendNotification };
