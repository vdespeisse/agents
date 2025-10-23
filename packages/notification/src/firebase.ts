import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { FirebaseConfig, InitializationError } from './types.js';

let firebaseApp: admin.app.App | null = null;
let initialized = false;

/**
 * Check if Firebase has been initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Get the initialized Firebase app instance
 * @throws {InitializationError} If Firebase has not been initialized
 */
export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    throw new InitializationError('Firebase has not been initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

/**
 * Initialize Firebase Admin SDK with service account credentials
 * @param config - Optional configuration with service account path and app name
 * @returns The initialized Firebase app instance
 * @throws {InitializationError} If credentials are missing or invalid
 */
export function initializeFirebase(config?: FirebaseConfig): admin.app.App {
  // Return existing app if already initialized (singleton pattern)
  if (initialized && firebaseApp) {
    return firebaseApp;
  }

  // Determine service account path with priority order
  const serviceAccountPath = 
    config?.serviceAccountPath || 
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    './firebase-service-account.json';

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
    const appName = config?.appName || process.env.FIREBASE_APP_NAME || '[DEFAULT]';
    
    // Check if app with this name already exists
    try {
      firebaseApp = admin.app(appName);
      initialized = true;
      return firebaseApp;
    } catch {
      // App doesn't exist, create it
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, appName);
      
      initialized = true;
      return firebaseApp;
    }
  } catch (error) {
    throw new InitializationError(
      `Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : 'Unknown error'}`,
      serviceAccountPath
    );
  }
}
