import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationPayload, NotificationOptions } from '../src/types'

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

// Mock firebase-admin
const mockSend = vi.fn()
const mockMessaging = vi.fn(() => ({
  send: mockSend,
}))

const mockApp = {
  messaging: mockMessaging,
}

vi.mock('firebase-admin', () => ({
  default: {
    initializeApp: vi.fn(() => mockApp),
    app: vi.fn(() => {
      throw new Error('App not found')
    }),
    credential: {
      cert: vi.fn(serviceAccount => serviceAccount),
    },
  },
  initializeApp: vi.fn(() => mockApp),
  app: vi.fn(() => {
    throw new Error('App not found')
  }),
  credential: {
    cert: vi.fn(serviceAccount => serviceAccount),
  },
}))

describe('Notification Sending', () => {
  const mockServiceAccount = {
    project_id: 'test-project',
    private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
    client_email: 'test@test-project.iam.gserviceaccount.com',
  }

  const validDeviceToken = 'valid-device-token-12345'
  const validPayload: NotificationPayload = {
    title: 'Test Notification',
    body: 'This is a test notification',
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup default mocks
    const { existsSync, readFileSync } = await import('fs')
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockServiceAccount))
    mockSend.mockResolvedValue('projects/test-project/messages/msg-123')
  })

  describe('successful notification send', () => {
    it('should send notification successfully', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('projects/test-project/messages/msg-123')
      expect(result.error).toBeUndefined()
      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    it('should send notification with custom data', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const payloadWithData: NotificationPayload = {
        ...validPayload,
        data: {
          userId: '123',
          action: 'open_chat',
        },
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, payloadWithData)

      // Assert
      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: '123',
            action: 'open_chat',
          },
        })
      )
    })

    it('should send notification with options', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const options: NotificationOptions = {
        badge: 5,
        sound: 'default',
        priority: 'high',
        contentAvailable: true,
        mutableContent: true,
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload, options)

      // Assert
      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          apns: expect.objectContaining({
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: expect.objectContaining({
                badge: 5,
                sound: 'default',
                'content-available': 1,
                'mutable-content': 1,
              }),
            },
          }),
        })
      )
    })

    it('should use normal priority when specified', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const options: NotificationOptions = {
        priority: 'normal',
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload, options)

      // Assert
      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          apns: expect.objectContaining({
            headers: {
              'apns-priority': '5',
            },
          }),
        })
      )
    })

    it('should support destructured sendNotification', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const { sendNotification } = notificationClient('./test-service-account.json')

      // Act
      const result = await sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('projects/test-project/messages/msg-123')
    })
  })

  describe('invalid device token', () => {
    it('should return error for empty device token', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')

      // Act
      const result = await client.sendNotification('', validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Device token must be a non-empty string')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return error for whitespace-only device token', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')

      // Act
      const result = await client.sendNotification('   ', validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Device token must be a non-empty string')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should handle Firebase invalid token error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/invalid-registration-token',
        message: 'Invalid registration token',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or unregistered device token')
    })

    it('should handle Firebase unregistered token error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/registration-token-not-registered',
        message: 'Token not registered',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or unregistered device token')
    })
  })

  describe('invalid payload', () => {
    it('should return error for missing title', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const invalidPayload = {
        title: '',
        body: 'Test body',
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, invalidPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('title is required')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return error for missing body', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const invalidPayload = {
        title: 'Test title',
        body: '',
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, invalidPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('body is required')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return error for payload exceeding size limit', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const largePayload: NotificationPayload = {
        title: 'Test',
        body: 'x'.repeat(5000), // Exceeds 4KB limit
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, largePayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('exceeds size limit')
      expect(mockSend).not.toHaveBeenCalled()
    })
  })

  describe('invalid options', () => {
    it('should return error for negative badge', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const invalidOptions: NotificationOptions = {
        badge: -1,
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload, invalidOptions)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Badge must be a positive number')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return error for invalid priority', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const invalidOptions: any = {
        priority: 'invalid',
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload, invalidOptions)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Priority must be either "high" or "normal"')
      expect(mockSend).not.toHaveBeenCalled()
    })
  })

  describe('Firebase errors', () => {
    it('should handle authentication error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/authentication-error',
        message: 'Auth failed',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Firebase authentication failed')
    })

    it('should handle server unavailable error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/server-unavailable',
        message: 'Server unavailable',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Firebase messaging service is temporarily unavailable')
    })

    it('should handle internal error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/internal-error',
        message: 'Internal error',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Internal Firebase error occurred')
    })

    it('should handle invalid argument error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/invalid-argument',
        message: 'Invalid argument',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid notification payload or options')
    })

    it('should handle unknown Firebase error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue({
        code: 'messaging/unknown-error',
        message: 'Unknown error occurred',
      })

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error occurred')
    })

    it('should handle network error', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      mockSend.mockRejectedValue(new Error('Network timeout'))

      // Act
      const result = await client.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Network timeout')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in notification text', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const specialPayload: NotificationPayload = {
        title: 'Test 🎉 Title',
        body: 'Body with émojis and spëcial çharacters',
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, specialPayload)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should handle notification with only required fields', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client = notificationClient('./test-service-account.json')
      const minimalPayload: NotificationPayload = {
        title: 'Title',
        body: 'Body',
      }

      // Act
      const result = await client.sendNotification(validDeviceToken, minimalPayload)

      // Assert
      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          notification: {
            title: 'Title',
            body: 'Body',
          },
        })
      )
    })

    it('should handle client creation failure gracefully', async () => {
      // Need fresh module state
      vi.resetModules()

      // Arrange
      const { existsSync } = await import('fs')
      const { notificationClient } = await import('../src/index')
      const { InitializationError } = await import('../src/types')

      vi.mocked(existsSync).mockReturnValue(false)

      // Act & Assert
      expect(() => {
        notificationClient('./missing.json')
      }).toThrow(InitializationError)
    })
  })

  describe('multiple clients', () => {
    it('should allow multiple independent clients', async () => {
      // Arrange
      const { notificationClient } = await import('../src/index')
      const client1 = notificationClient('./service-account-1.json')
      const client2 = notificationClient('./service-account-2.json')

      // Act
      const result1 = await client1.sendNotification(validDeviceToken, validPayload)
      const result2 = await client2.sendNotification(validDeviceToken, validPayload)

      // Assert
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(mockSend).toHaveBeenCalledTimes(2)
    })
  })
})
