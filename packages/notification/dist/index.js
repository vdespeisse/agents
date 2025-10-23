// src/firebase.ts
import * as admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";

// src/types.ts
var NotificationError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "NotificationError";
  }
};
var InitializationError = class extends Error {
  constructor(message, path) {
    super(message);
    this.path = path;
    this.name = "InitializationError";
  }
};

// src/firebase.ts
function createFirebaseApp(config) {
  const { serviceAccountPath, appName } = config;
  if (!existsSync(serviceAccountPath)) {
    throw new InitializationError(
      `Service account file not found at path: ${serviceAccountPath}`,
      serviceAccountPath
    );
  }
  let serviceAccount;
  try {
    const fileContent = readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(fileContent);
  } catch (error) {
    throw new InitializationError(
      `Failed to parse service account JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      serviceAccountPath
    );
  }
  const requiredFields = ["project_id", "private_key", "client_email"];
  const missingFields = requiredFields.filter((field) => !serviceAccount[field]);
  if (missingFields.length > 0) {
    throw new InitializationError(
      `Service account JSON is missing required fields: ${missingFields.join(", ")}`,
      serviceAccountPath
    );
  }
  try {
    const finalAppName = appName || `notification-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      return admin.app(finalAppName);
    } catch {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      }, finalAppName);
    }
  } catch (error) {
    throw new InitializationError(
      `Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : "Unknown error"}`,
      serviceAccountPath
    );
  }
}

// src/index.ts
function validateDeviceToken(token) {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new NotificationError("Device token must be a non-empty string", "INVALID_TOKEN");
  }
}
function validatePayload(payload) {
  if (!payload.title || typeof payload.title !== "string" || payload.title.trim().length === 0) {
    throw new NotificationError("Notification title is required and must be a non-empty string", "INVALID_PAYLOAD");
  }
  if (!payload.body || typeof payload.body !== "string" || payload.body.trim().length === 0) {
    throw new NotificationError("Notification body is required and must be a non-empty string", "INVALID_PAYLOAD");
  }
  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > 4096) {
    throw new NotificationError(
      `Notification payload exceeds size limit (${payloadSize} bytes > 4096 bytes)`,
      "PAYLOAD_TOO_LARGE"
    );
  }
}
function validateOptions(options) {
  if (!options) return;
  if (options.badge !== void 0 && (typeof options.badge !== "number" || options.badge < 0)) {
    throw new NotificationError("Badge must be a positive number", "INVALID_OPTIONS");
  }
  if (options.priority !== void 0 && options.priority !== "high" && options.priority !== "normal") {
    throw new NotificationError('Priority must be either "high" or "normal"', "INVALID_OPTIONS");
  }
}
function buildMessage(deviceToken, payload, options) {
  const message = {
    token: deviceToken,
    notification: {
      title: payload.title,
      body: payload.body
    },
    apns: {
      headers: {
        "apns-priority": options?.priority === "normal" ? "5" : "10"
      },
      payload: {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body
          },
          ...options?.badge !== void 0 && { badge: options.badge },
          ...options?.sound && { sound: options.sound },
          ...options?.contentAvailable && { "content-available": 1 },
          ...options?.mutableContent && { "mutable-content": 1 }
        }
      }
    }
  };
  if (payload.data) {
    message.data = payload.data;
  }
  return message;
}
function handleFirebaseError(error) {
  if (error.code) {
    const errorCode = error.code;
    let errorMessage = error.message;
    switch (errorCode) {
      case "messaging/invalid-registration-token":
      case "messaging/registration-token-not-registered":
        errorMessage = "Invalid or unregistered device token";
        break;
      case "messaging/invalid-argument":
        errorMessage = "Invalid notification payload or options";
        break;
      case "messaging/authentication-error":
        errorMessage = "Firebase authentication failed";
        break;
      case "messaging/server-unavailable":
        errorMessage = "Firebase messaging service is temporarily unavailable";
        break;
      case "messaging/internal-error":
        errorMessage = "Internal Firebase error occurred";
        break;
    }
    console.error(`Notification send failed [${errorCode}]:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
  if (error instanceof NotificationError) {
    console.error("Notification validation failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
  console.error("Notification send failed:", error.message || "Unknown error");
  return {
    success: false,
    error: error.message || "Failed to send notification"
  };
}
function notificationClient(serviceAccountPath, appName) {
  const app2 = createFirebaseApp({ serviceAccountPath, appName });
  const messaging = app2.messaging();
  async function sendNotification(deviceToken, payload, options) {
    try {
      validateDeviceToken(deviceToken);
      validatePayload(payload);
      validateOptions(options);
      const message = buildMessage(deviceToken, payload, options);
      const messageId = await messaging.send(message);
      return {
        success: true,
        messageId
      };
    } catch (error) {
      return handleFirebaseError(error);
    }
  }
  return {
    sendNotification
  };
}
export {
  InitializationError,
  NotificationError,
  notificationClient
};
