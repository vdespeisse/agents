# TDD Context Files

This directory contains reference documentation for TDD agents.

## Files

### typescript-testing.md

Agent reference for testing TypeScript code with Vitest.

**Contents:**

- How to run tests (`npm run test`)
- How to run specific test files
- Test file structure and naming
- Vitest matchers reference
- Arrange-Act-Assert pattern
- Testing async code
- Mocking guidelines (only when necessary)
- Testing best practices

**Purpose:**
Provides agents with the essential information needed to write and run tests without unnecessary context about TypeScript or Vitest features.

### nuxt-testing.md

Agent reference for testing Nuxt applications with `@nuxt/test-utils`.

**Contents:**

- Installation and setup
- Running tests (unit, component, e2e)
- Test configuration with Vitest
- Component testing with `mountSuspended` and `renderSuspended`
- End-to-end testing with Playwright
- Mocking Nuxt auto-imports and components
- Testing API endpoints
- Test organization and best practices

**Purpose:**
Provides practical guidance for testing Nuxt applications including components, composables, and end-to-end flows.

## Usage

Agents should read these context files when:

- Writing tests (tdd-tester)
- Running tests (tdd-coder)
- Testing Nuxt components and features
- Understanding test patterns
- Determining when to mock

The context is focused and practical - only what's needed to write good tests.
