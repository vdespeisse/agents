import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Mock firebase-admin
const mockApp = {
  messaging: vi.fn(() => ({
    send: vi.fn(),
  })),
};

vi.mock('firebase-admin', () => ({
  default: {
    initializeApp: vi.fn(() => mockApp),
    app: vi.fn(() => {
      throw new Error('App not found');
    }),
    credential: {
      cert: vi.fn((serviceAccount) => serviceAccount),
    },
  },
  initializeApp: vi.fn(() => mockApp),
  app: vi.fn(() => {
    throw new Error('App not found');
  }),
  credential: {
    cert: vi.fn((serviceAccount) => serviceAccount),
  },
}));

describe('Firebase Initialization', () => {
  const mockServiceAccount = {
    project_id: 'test-project',
    private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
    client_email: 'test@test-project.iam.gserviceaccount.com',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('successful initialization', () => {
    it('should initialize Firebase with valid credentials', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase, isInitialized } = await import('../src/firebase');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      const app = initializeFirebase({ serviceAccountPath: './test-service-account.json' });

      // Assert
      expect(existsSync).toHaveBeenCalledWith('./test-service-account.json');
      expect(readFileSync).toHaveBeenCalledWith('./test-service-account.json', 'utf8');
      expect(app).toBeDefined();
      expect(isInitialized()).toBe(true);
    });

    it('should initialize with custom config', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      const app = initializeFirebase({
        serviceAccountPath: './custom-path.json',
        appName: 'custom-app',
      });

      // Assert
      expect(existsSync).toHaveBeenCalledWith('./custom-path.json');
      expect(app).toBeDefined();
    });

    it('should return same instance on multiple calls (singleton)', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const admin = await import('firebase-admin');
      const { initializeFirebase } = await import('../src/firebase');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      const app1 = initializeFirebase();
      const app2 = initializeFirebase();

      // Assert
      expect(app1).toBe(app2);
      // Should only initialize once
      expect(vi.mocked(admin.initializeApp)).toHaveBeenCalledTimes(1);
    });
  });

  describe('environment variable support', () => {
    it('should read FIREBASE_SERVICE_ACCOUNT_PATH from environment', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      
      const originalEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH = './env-service-account.json';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      initializeFirebase();

      // Assert
      expect(existsSync).toHaveBeenCalledWith('./env-service-account.json');

      // Cleanup
      if (originalEnv) {
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH = originalEnv;
      } else {
        delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      }
    });

    it('should use default path when no config or env var provided', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      
      const originalEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      initializeFirebase();

      // Assert
      expect(existsSync).toHaveBeenCalledWith('./firebase-service-account.json');

      // Cleanup
      if (originalEnv) {
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH = originalEnv;
      }
    });
  });

  describe('error handling - missing credentials', () => {
    it('should throw InitializationError when service account file not found', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(false);

      // Act & Assert
      expect(() => {
        initializeFirebase({ serviceAccountPath: './missing.json' });
      }).toThrow(InitializationError);

      expect(() => {
        initializeFirebase({ serviceAccountPath: './missing.json' });
      }).toThrow('Service account file not found at path: ./missing.json');
    });

    it('should include file path in error', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(false);

      // Act & Assert
      try {
        initializeFirebase({ serviceAccountPath: './test-path.json' });
        expect.fail('Should have thrown InitializationError');
      } catch (error) {
        expect(error).toBeInstanceOf(InitializationError);
        expect((error as InitializationError).path).toBe('./test-path.json');
      }
    });
  });

  describe('error handling - invalid JSON', () => {
    it('should throw InitializationError for invalid JSON', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json {');

      // Act & Assert
      expect(() => {
        initializeFirebase();
      }).toThrow(InitializationError);

      expect(() => {
        initializeFirebase();
      }).toThrow(/Failed to parse service account JSON/);
    });

    it('should throw InitializationError for missing required fields', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase } = await import('../src/firebase');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        project_id: 'test-project',
        // missing private_key and client_email
      }));

      // Act & Assert
      expect(() => {
        initializeFirebase();
      }).toThrow(InitializationError);

      expect(() => {
        initializeFirebase();
      }).toThrow(/missing required fields: private_key, client_email/);
    });
  });

  describe('getFirebaseApp', () => {
    it('should return initialized app', async () => {
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase, getFirebaseApp } = await import('../src/firebase');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));
      initializeFirebase();

      // Act
      const app = getFirebaseApp();

      // Assert
      expect(app).toBeDefined();
    });

    it('should throw error if not initialized', async () => {
      // Need to reset module to get fresh state
      vi.resetModules();
      
      // Arrange
      const { getFirebaseApp } = await import('../src/firebase');
      const { InitializationError } = await import('../src/types');

      // Act & Assert
      expect(() => {
        getFirebaseApp();
      }).toThrow(InitializationError);

      expect(() => {
        getFirebaseApp();
      }).toThrow('Firebase has not been initialized');
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', async () => {
      // Need to reset module to get fresh state
      vi.resetModules();
      
      // Arrange
      const { isInitialized } = await import('../src/firebase');

      // Act & Assert
      expect(isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { initializeFirebase, isInitialized } = await import('../src/firebase');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      initializeFirebase();

      // Assert
      expect(isInitialized()).toBe(true);
    });
  });
});
