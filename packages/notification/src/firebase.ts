import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { NotificationClientConfig, InitializationError } from './types.js';

/**
 * Create a Firebase Admin app instance with service account credentials
 * @param config - Configuration with service account path and optional app name
 * @returns The initialized Firebase app instance
 * @throws {InitializationError} If credentials are missing or invalid
 */
export function createFirebaseApp(config: NotificationClientConfig): admin.app.App {
  const { serviceAccountPath, appName } = config;

  // Validate service account file exists
  if (!existsSync(serviceAccountPath)) {
    throw new InitializationError(
      `Service account file not found at path: ${serviceAccountPath}`,
      serviceAccountPath
    );
  }

  // Load and validate service account JSON
  let serviceAccount: any;
  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  } catch (error) {
    throw new InitializationError(
      `Failed to parse service account JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      serviceAccountPath
    );
  }

  // Validate required fields
  const requiredFields = ['project_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    throw new InitializationError(
      `Service account JSON is missing required fields: ${missingFields.join(', ')}`,
      serviceAccountPath
    );
  }

  // Initialize Firebase Admin SDK
  try {
    // Generate unique app name if not provided
    const finalAppName = appName || `notification-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if app with this name already exists
    try {
      return admin.app(finalAppName);
    } catch {
      // App doesn't exist, create it
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, finalAppName);
    }
  } catch (error) {
    throw new InitializationError(
      `Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : 'Unknown error'}`,
      serviceAccountPath
    );
  }
}
