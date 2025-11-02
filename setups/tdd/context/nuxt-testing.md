# Nuxt Testing - Agent Reference

This document describes how to test Nuxt applications, including component testing and end-to-end testing.

## Running Tests

### Run All Tests

```bash
npx vitest
```

### Run Specific Test Project

```bash
# Run only unit tests
npx vitest --project unit

# Run only Nuxt tests
npx vitest --project nuxt

# Run only e2e tests
npx vitest --project e2e
```

### Run in Watch Mode

```bash
npx vitest --watch
```

## Test Configuration

### Vitest Config with Multiple Projects

`vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      },
    ],
  },
})
```

### Simple Config (All Tests in Nuxt Environment)

```typescript
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
  },
})
```

## Component Testing

### Testing Components with `mountSuspended`

`mountSuspended` allows testing Vue components within the Nuxt environment with async setup and plugin access.

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should render component', async () => {
    const component = await mountSuspended(MyComponent)
    expect(component.text()).toContain('Expected text')
  })

  it('should render with props', async () => {
    const component = await mountSuspended(MyComponent, {
      props: {
        title: 'Test Title',
      },
    })
    expect(component.text()).toContain('Test Title')
  })
})
```

### Testing Components with `renderSuspended`

Use `renderSuspended` with Testing Library utilities:

```typescript
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should display button', async () => {
    await renderSuspended(MyComponent)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('should handle click events', async () => {
    await renderSuspended(MyComponent)
    const button = screen.getByRole('button')
    await fireEvent.click(button)
    expect(screen.getByText('Clicked')).toBeDefined()
  })
})
```

## End-to-End Testing

### E2E Test Setup

Each `describe` block needs to call `setup()` before tests:

```typescript
import { describe, test } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('My E2E test', async () => {
  await setup({
    // test context options
  })

  test('my test', () => {
    // ...
  })
})
```

### Setup Options

```typescript
await setup({
  rootDir: '.', // Path to Nuxt app
  setupTimeout: 120000, // Setup timeout in ms
  server: true, // Launch test server
  port: 3000, // Optional port number
  browser: false, // Launch browser for testing
  browserOptions: {
    type: 'chromium', // 'chromium', 'firefox', or 'webkit'
  },
})
```

### E2E API Methods

#### `$fetch(url)`

Fetch HTML from server-rendered page:

```typescript
import { $fetch } from '@nuxt/test-utils/e2e'

test('renders home page', async () => {
  const html = await $fetch('/')
  expect(html).toContain('<h1>Home</h1>')
})
```

#### `fetch(url)`

Get full response:

```typescript
import { fetch } from '@nuxt/test-utils/e2e'

test('returns correct headers', async () => {
  const res = await fetch('/')
  expect(res.headers.get('content-type')).toContain('text/html')
})
```

#### `url(path)`

Get full URL with test server port:

```typescript
import { url } from '@nuxt/test-utils/e2e'

test('generates correct URL', () => {
  const pageUrl = url('/page')
  // Returns: 'http://localhost:6840/page'
})
```

## Browser Testing

### Using Playwright with `createPage`

```typescript
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { describe, test, expect } from 'vitest'

describe('browser test', async () => {
  await setup({
    browser: true,
  })

  test('navigate and interact', async () => {
    const page = await createPage('/login')

    // Fill form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')

    // Click button
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/dashboard')

    // Assert
    expect(await page.textContent('h1')).toBe('Dashboard')
  })
})
```

### Playwright Test Runner

Install Playwright:

```bash
npm i --save-dev @playwright/test @nuxt/test-utils
```

Configure `playwright.config.ts`:

```typescript
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
```

Write tests using Playwright:

```typescript
import { expect, test } from '@nuxt/test-utils/playwright'

test('renders home page', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading')).toHaveText('Welcome!')
})
```

## Mocking in Nuxt Tests

### Mock Nuxt Auto-imports

```typescript
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useStorage', () => {
  return () => {
    return { value: 'mocked storage' }
  }
})
```

### Mock with Multiple Implementations

```typescript
import { vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { useStorageMock } = vi.hoisted(() => {
  return {
    useStorageMock: vi.fn(() => ({ value: 'mocked storage' })),
  }
})

mockNuxtImport('useStorage', () => useStorageMock)

// In tests
test('with different implementation', () => {
  useStorageMock.mockImplementation(() => ({ value: 'something else' }))
  // ...
})
```

### Mock Components

```typescript
import { mockComponent } from '@nuxt/test-utils/runtime'

mockComponent('MyComponent', {
  props: {
    value: String,
  },
  setup(props) {
    // mock implementation
  },
})

// Or redirect to mock component
mockComponent('MyComponent', () => import('./MockComponent.vue'))
```

### Mock API Endpoints

```typescript
import { registerEndpoint } from '@nuxt/test-utils/runtime'

// GET endpoint
registerEndpoint('/api/users', () => ({
  users: [{ id: 1, name: 'John' }],
}))

// POST endpoint
registerEndpoint('/api/users', {
  method: 'POST',
  handler: () => ({ success: true }),
})
```

## Test Organization

### Recommended Directory Structure

```
test/
├── e2e/
│   ├── ssr.test.ts
│   └── navigation.test.ts
├── nuxt/
│   ├── components.test.ts
│   └── composables.test.ts
└── unit/
    └── utils.test.ts
```

### File Naming

- **Unit tests**: `*.test.ts` or `*.spec.ts` in `test/unit/`
- **Nuxt tests**: `*.nuxt.test.ts` or in `test/nuxt/`
- **E2E tests**: `*.test.ts` in `test/e2e/`

## Common Testing Patterns

### Test Component with Route

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime'

test('component with route', async () => {
  const component = await mountSuspended(App, {
    route: '/test',
  })
  expect(component.html()).toContain('Test page')
})
```

### Test Composable

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime'

test('useMyComposable', async () => {
  const component = await mountSuspended({
    setup() {
      const { data } = useMyComposable()
      return { data }
    },
    template: '<div>{{ data }}</div>',
  })
  expect(component.text()).toContain('expected data')
})
```

### Test Server API

```typescript
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('API tests', async () => {
  await setup()

  test('GET /api/users', async () => {
    const users = await $fetch('/api/users')
    expect(users).toHaveLength(3)
  })

  test('POST /api/users', async () => {
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: { name: 'John' },
    })
    expect(response.success).toBe(true)
  })
})
```

### Test Navigation

```typescript
import { createPage, setup } from '@nuxt/test-utils/e2e'

describe('navigation', async () => {
  await setup({ browser: true })

  test('navigate between pages', async () => {
    const page = await createPage('/')

    await page.click('a[href="/about"]')
    await page.waitForURL('/about')

    expect(await page.textContent('h1')).toBe('About')
  })
})
```

## Testing Best Practices

### DO ✅

1. **Separate test types** - Keep unit, Nuxt, and E2E tests in different directories
2. **Use `mountSuspended` for components** - Provides Nuxt context and async setup
3. **Mock external dependencies** - Use `registerEndpoint` for API calls
4. **Test user interactions** - Use Playwright for browser testing
5. **Wait for hydration** - Use `{ waitUntil: 'hydration' }` with Playwright

### DON'T ❌

1. **Mix test environments** - Don't use runtime and e2e helpers in same file
2. **Mock Nuxt internals unnecessarily** - Only mock external APIs
3. **Skip setup in E2E tests** - Always call `setup()` in describe blocks
4. **Test implementation details** - Test user-facing behavior
5. **Forget async/await** - Most Nuxt test helpers are async

## Environment-Specific Testing

### Opt out of Nuxt environment per file

```typescript
// @vitest-environment node
import { test } from 'vitest'

test('my test', () => {
  // Runs without Nuxt environment
})
```

### Test against deployed app

```typescript
await setup({
  host: 'http://localhost:8787', // Use existing server
})
```

## Dynamic Matchers

```typescript
// When testing with dates or generated IDs
expect(user).toEqual({
  id: expect.any(String),
  createdAt: expect.any(Date),
  name: 'John',
})
```
