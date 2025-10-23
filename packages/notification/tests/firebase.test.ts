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

describe('Firebase Client Creation', () => {
  const mockServiceAccount = {
    project_id: 'test-project',
    private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
    client_email: 'test@test-project.iam.gserviceaccount.com',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('successful client creation', () => {
    it('should create notification client with valid credentials', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { notificationClient } = await import('../src/index');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      const client = notificationClient('./test-service-account.json');

      // Assert
      expect(existsSync).toHaveBeenCalledWith('./test-service-account.json');
      expect(readFileSync).toHaveBeenCalledWith('./test-service-account.json', 'utf8');
      expect(client).toBeDefined();
      expect(client.sendNotification).toBeDefined();
      expect(typeof client.sendNotification).toBe('function');
    });

    it('should create client with custom app name', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { notificationClient } = await import('../src/index');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      const client = notificationClient('./custom-path.json', 'custom-app');

      // Assert
      expect(existsSync).toHaveBeenCalledWith('./custom-path.json');
      expect(client).toBeDefined();
      expect(client.sendNotification).toBeDefined();
    });

    it('should create multiple independent clients', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const admin = await import('firebase-admin');
      const { notificationClient } = await import('../src/index');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount));

      // Act
      const client1 = notificationClient('./service-account-1.json');
      const client2 = notificationClient('./service-account-2.json');

      // Assert
      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
      expect(client1).not.toBe(client2);
      // Should create separate Firebase apps
      expect(vi.mocked(admin.initializeApp)).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling - missing credentials', () => {
    it('should throw InitializationError when service account file not found', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync } = await import('fs');
      const { notificationClient } = await import('../src/index');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(false);

      // Act & Assert
      expect(() => {
        notificationClient('./missing.json');
      }).toThrow(InitializationError);

      expect(() => {
        notificationClient('./missing.json');
      }).toThrow('Service account file not found at path: ./missing.json');
    });

    it('should include file path in error', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync } = await import('fs');
      const { notificationClient } = await import('../src/index');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(false);

      // Act & Assert
      try {
        notificationClient('./test-path.json');
        expect.fail('Should have thrown InitializationError');
      } catch (error) {
        expect(error).toBeInstanceOf(InitializationError);
        expect((error as InstanceType<typeof InitializationError>).path).toBe('./test-path.json');
      }
    });
  });

  describe('error handling - invalid JSON', () => {
    it('should throw InitializationError for invalid JSON', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { notificationClient } = await import('../src/index');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json {');

      // Act & Assert
      expect(() => {
        notificationClient('./service-account.json');
      }).toThrow(InitializationError);

      expect(() => {
        notificationClient('./service-account.json');
      }).toThrow(/Failed to parse service account JSON/);
    });

    it('should throw InitializationError for missing required fields', async () => {
      // Reset modules for fresh state
      vi.resetModules();
      
      // Arrange
      const { existsSync, readFileSync } = await import('fs');
      const { notificationClient } = await import('../src/index');
      const { InitializationError } = await import('../src/types');
      
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        project_id: 'test-project',
        // missing private_key and client_email
      }));

      // Act & Assert
      expect(() => {
        notificationClient('./service-account.json');
      }).toThrow(InitializationError);

      expect(() => {
        notificationClient('./service-account.json');
      }).toThrow(/missing required fields: private_key, client_email/);
    });
  });
});
