# TypeScript Testing with Vitest - Agent Reference

This document describes how to run tests and write tests for TypeScript code using Vitest.

## Running Tests

### Run All Tests

```bash
npm run test
```

Runs `vitest run` - executes all test files once and exits.

### Run Specific Test File

```bash
npm run test -- path/to/file.test.ts
```

### Run Tests for Specific Package (Monorepo)

```bash
npm test -w @opencode-setup/notification
```

## Test File Structure

### File Naming

- `{module}.test.ts` or `{module}.spec.ts`

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { functionToTest } from '../src/module'

describe('ModuleName', () => {
  describe('functionToTest', () => {
    it('should do something specific', () => {
      // Arrange - Set up test data
      const input = { id: '123', name: 'Test' }

      // Act - Execute the function
      const result = functionToTest(input)

      // Assert - Verify the result
      expect(result).toEqual({ id: '123', name: 'Test', processed: true })
    })
  })
})
```

## Vitest Matchers Reference

### Equality

```typescript
// Strict equality (===)
expect(value).toBe(5)
expect(value).toBe('hello')

// Deep equality (for objects/arrays)
expect(user).toEqual({ id: '123', name: 'John' })
expect(array).toEqual([1, 2, 3])

// Strict deep equality (checks types too)
expect(value).toStrictEqual({ count: 5 })
```

### Truthiness

```typescript
expect(value).toBeTruthy() // truthy value
expect(value).toBeFalsy() // falsy value
expect(value).toBeNull() // null
expect(value).toBeUndefined() // undefined
expect(value).toBeDefined() // not undefined
```

### Numbers

```typescript
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeLessThanOrEqual(5)
expect(0.1 + 0.2).toBeCloseTo(0.3) // floating point
```

### Strings

```typescript
expect(string).toMatch(/pattern/)
expect(string).toMatch('substring')
expect(string).toContain('substring')
```

### Arrays and Iterables

```typescript
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toContainEqual({ id: '123' }) // deep equality
```

### Objects

```typescript
expect(object).toHaveProperty('key')
expect(object).toHaveProperty('key', 'value')
expect(object).toMatchObject({ id: '123' }) // partial match
```

### Exceptions

```typescript
expect(() => throwError()).toThrow()
expect(() => throwError()).toThrow(Error)
expect(() => throwError()).toThrow('error message')
expect(() => throwError()).toThrow(/error/)
```

### Async/Promises

```typescript
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
await expect(promise).rejects.toThrow('error message')
```

## Test Patterns

### 1. Arrange-Act-Assert (AAA)

```typescript
it('should calculate total with discount', () => {
  // Arrange - Set up test data
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ]
  const discount = 0.1 // 10% discount

  // Act - Execute the function
  const total = calculateTotal(items, discount)

  // Assert - Verify the result
  expect(total).toBe(225) // (200 + 50) * 0.9
})
```

### 2. Test Edge Cases

```typescript
it('should return 0 for empty cart', () => {
  expect(calculateTotal([], 0)).toBe(0)
})

it('should throw error for negative discount', () => {
  const items = [{ price: 100, quantity: 1 }]
  expect(() => calculateTotal(items, -0.1)).toThrow('Invalid discount')
})
```

### 3. Setup and Teardown

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('DatabaseService', () => {
  let db: Database

  // Run before each test
  beforeEach(() => {
    db = new Database()
    db.connect()
  })

  // Run after each test
  afterEach(() => {
    db.disconnect()
  })

  it('should insert user', () => {
    const user = { id: '123', name: 'John' }
    db.insert('users', user)
    expect(db.findById('users', '123')).toEqual(user)
  })
})
```

### 4. Testing Async Code

```typescript
it('should fetch user from API', async () => {
  const user = await api.getUser('123')
  expect(user).toHaveProperty('id', '123')
})

it('should reject with 404 error', () => {
  return expect(api.getUser('invalid')).rejects.toThrow('User not found')
})
```

## Mocking in Vitest

### When to Mock

**Mock ONLY when necessary:**

- ✅ External API calls
- ✅ Database connections
- ✅ File system operations
- ✅ Time-dependent code (dates, timers)
- ✅ Third-party services
- ❌ Simple pure functions
- ❌ Internal business logic
- ❌ Data transformations

### Mock Functions

```typescript
import { describe, it, expect, vi } from 'vitest'

// Simple mock function
it('should call callback with result', () => {
  const callback = vi.fn()
  processData('test', callback)

  expect(callback).toHaveBeenCalledWith('PROCESSED: test')
  expect(callback).toHaveBeenCalledTimes(1)
})

// Mock function with implementation
it('should use custom validator', () => {
  const validator = vi.fn((data: string) => data.length > 5)

  const result = processWithValidator('hello world', validator)

  expect(validator).toHaveBeenCalledWith('hello world')
  expect(result).toBe(true)
})
```

### Mock Modules

```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock entire module
vi.mock('../api/client', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: '123', name: 'John' })),
}))

import { fetchUser } from '../api/client'

it('should fetch user data', async () => {
  const user = await fetchUser('123')
  expect(user).toEqual({ id: '123', name: 'John' })
})
```

### Mock Specific Module Exports

```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock only specific exports
vi.mock('../utils/date', () => ({
  getCurrentDate: vi.fn(() => new Date('2024-01-01')),
  formatDate: vi.fn(date => date.toISOString()),
}))

import { getCurrentDate } from '../utils/date'

it('should use mocked date', () => {
  const date = getCurrentDate()
  expect(date).toEqual(new Date('2024-01-01'))
})
```

### Spying on Functions

```typescript
import { describe, it, expect, vi } from 'vitest'

it('should call logger', () => {
  const logger = {
    log: vi.fn(),
    error: vi.fn(),
  }

  const service = new UserService(logger)
  service.createUser({ name: 'John' })

  expect(logger.log).toHaveBeenCalledWith('Creating user: John')
})
```

### Mock Timers

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('should execute after delay', () => {
  const callback = vi.fn()
  setTimeout(callback, 1000)

  // Fast-forward time
  vi.advanceTimersByTime(1000)

  expect(callback).toHaveBeenCalled()
})
```

### When NOT to Mock

```typescript
// ❌ Bad - Mocking simple functions unnecessarily
vi.mock('../utils/math', () => ({
  add: vi.fn((a, b) => a + b), // Just use the real function!
}))

// ✅ Good - Test the real implementation
import { add } from '../utils/math'

it('should add two numbers', () => {
  expect(add(2, 3)).toBe(5)
})

// ❌ Bad - Mocking internal business logic
vi.mock('../services/userService', () => ({
  validateUser: vi.fn(() => true), // We should test the real validation!
}))

// ✅ Good - Test real validation logic
import { validateUser } from '../services/userService'

it('should validate user email format', () => {
  expect(validateUser({ email: 'test@example.com' })).toBe(true)
  expect(validateUser({ email: 'invalid' })).toBe(false)
})
```

## Testing Best Practices

### DO ✅

1. **Write focused tests** - One behavior per test
2. **Use descriptive test names** - "should do X when Y"
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **Test edge cases** - Empty, null, invalid inputs
5. **Mock external dependencies only** - APIs, databases, file system
6. **Keep tests simple** - Easy to read and understand

### DON'T ❌

1. **Mock unnecessarily** - Only mock external dependencies
2. **Test implementation details** - Test behavior, not internals
3. **Write complex test logic** - Tests should be simple
4. **Skip error cases** - Test both success and failure paths
5. **Write multiple assertions for different behaviors** - Split into separate tests

## Dynamic Matchers

```typescript
// Use when exact values are unknown
expect(user).toEqual({
  id: expect.any(String),
  createdAt: expect.any(Date),
})
```
