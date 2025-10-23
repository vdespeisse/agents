export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationOptions {
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal';
  contentAvailable?: boolean;
  mutableContent?: boolean;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface NotificationClientConfig {
  serviceAccountPath: string;
  appName?: string;
}

export interface NotificationClient {
  sendNotification: (
    deviceToken: string,
    payload: NotificationPayload,
    options?: NotificationOptions
  ) => Promise<NotificationResult>;
}

export class NotificationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class InitializationError extends Error {
  constructor(message: string, public path?: string) {
    super(message);
    this.name = 'InitializationError';
  }
}
