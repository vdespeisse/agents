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
interface NotificationClientConfig {
    serviceAccountPath: string;
    appName?: string;
}
interface NotificationClient {
    sendNotification: (deviceToken: string, payload: NotificationPayload, options?: NotificationOptions) => Promise<NotificationResult>;
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
 * Create a notification client instance
 * @param serviceAccountPath - Path to Firebase service account JSON file
 * @param appName - Optional custom app name for Firebase instance
 * @returns A notification client with sendNotification method
 * @throws {InitializationError} If credentials are missing or invalid
 *
 * @example
 * ```typescript
 * const client = notificationClient('/path/to/service-account.json');
 * const result = await client.sendNotification('device-token', {
 *   title: 'Hello',
 *   body: 'World'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Destructure for convenience
 * const { sendNotification } = notificationClient('/path/to/service-account.json');
 * const result = await sendNotification('device-token', {
 *   title: 'Hello',
 *   body: 'World'
 * });
 * ```
 */
declare function notificationClient(serviceAccountPath: string, appName?: string): NotificationClient;

export { InitializationError, type NotificationClient, type NotificationClientConfig, NotificationError, type NotificationOptions, type NotificationPayload, type NotificationResult, notificationClient };
