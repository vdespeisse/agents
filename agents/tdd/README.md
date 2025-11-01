# TDD Agent System

A Test-Driven Development (TDD) agent system for TypeScript codebases using Vitest.

## Overview

This system follows strict TDD principles with three specialized agents:

1. **TDD Orchestrator** - Breaks down features into minimal TDD cycles
2. **TDD Tester** - Writes focused unit tests (Red phase)
3. **TDD Coder** - Implements minimal code to pass tests (Green phase)

## Documentation

- **[TypeScript Testing Guide](context/typescript-testing.md)** - Comprehensive guide on testing TypeScript with Vitest, including commands, patterns, and best practices

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TDD Orchestrator                         │
│  (Breaks down tasks into minimal TDD cycles)                │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Delegates
                           ▼
        ┌──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
┌──────────────────┐                  ┌──────────────────┐
│   TDD Tester     │                  │   TDD Coder      │
│  (Write Tests)   │                  │  (Write Code)    │
│   RED Phase      │                  │  GREEN Phase     │
└──────────────────┘                  └──────────────────┘
        │                                      │
        │ Test fails                           │ Runs: npm test
        └──────────────────────────────────────┘
                    Tests pass ✓
```

## TDD Workflow

### Phase 1: Planning

The orchestrator analyzes your request and creates a TDD plan:

```markdown
## Feature: User Authentication

**TDD Approach**: Build authentication step-by-step
**Total Cycles**: 5

### TDD Cycles

1. **Test**: Function returns null when user not found
   **Code**: Implement basic user lookup

2. **Test**: Function returns user when valid credentials
   **Code**: Add credential validation

3. **Test**: Function throws error when password is invalid
   **Code**: Add password validation logic

...
```

### Phase 2: TDD Cycles

For each cycle:

1. **RED** - TDD Tester writes a failing test
2. **GREEN** - TDD Coder writes minimal code to pass
3. **VERIFY** - TDD Coder runs `npm test` to confirm
4. **REFACTOR** - (Optional) Improve code while keeping tests green

### Phase 3: Completion

All tests passing, feature complete!

## Usage

### Invoke the TDD Orchestrator

```bash
@tdd-orchestrator Build a user validation function
```

The orchestrator will:

1. Present a TDD plan
2. Wait for your approval
3. Execute TDD cycles automatically
4. Report when complete

### Example Session

```
User: @tdd-orchestrator Create a function to calculate order totals

Orchestrator:
## Feature: Order Total Calculator

**TDD Approach**: Build calculator incrementally
**Total Cycles**: 4

1. **Test**: Returns 0 for empty order
   **Code**: Basic function structure

2. **Test**: Returns sum of item prices
   **Code**: Add price summation

3. **Test**: Applies discount percentage
   **Code**: Add discount logic

4. **Test**: Throws error for negative prices
   **Code**: Add validation

**AWAITING YOUR APPROVAL TO PROCEED**

User: Proceed

Orchestrator: [Delegates to TDD Tester for Cycle 1...]
TDD Tester: [Writes failing test...]
Orchestrator: [Delegates to TDD Coder for Cycle 1...]
TDD Coder: [Implements code, runs npm test...]
✓ All tests passing!

[Continues through all cycles...]

Orchestrator:
## TDD Session Complete: Order Total Calculator
**Total Cycles**: 4
**All Tests**: ✅ PASSING
```

## Technology Stack

- **Language**: TypeScript
- **Testing Framework**: Vitest
- **Test Runner**: npm test

## File Structure

```
.tasks/{feature-slug}/
  tdd/
    cycle-01-test.md      # Test documentation
    cycle-01-code.md      # Implementation documentation
    cycle-02-test.md
    cycle-02-code.md
    ...
```

## Agents

### TDD Orchestrator (`tdd-orchestrator.md`)

**Role**: Coordinator and planner

**Responsibilities**:

- Break features into minimal TDD cycles
- Present plans for approval
- Delegate to subagents
- Track progress
- Verify completion

**Does NOT**:

- Write code
- Write tests
- Run commands

### TDD Tester (`subagent/tdd-tester.md`)

**Role**: Test writer

**Responsibilities**:

- Write focused unit tests
- Use Vitest framework
- Follow Arrange-Act-Assert pattern
- Document test creation
- Expect tests to FAIL initially

**Does NOT**:

- Write implementation code
- Run tests
- Modify implementation files

### TDD Coder (`subagent/tdd-coder.md`)

**Role**: Implementation writer

**Responsibilities**:

- Write MINIMAL code to pass tests
- Run `npm test` after implementation
- Verify ALL tests pass
- Document implementation
- Refactor when requested

**Does NOT**:

- Write tests
- Over-engineer solutions
- Add untested features

## Best Practices

### Keep Cycles Minimal

✅ **Good** (One behavior):

- "Function returns empty array when no items exist"
- "Function filters items by status property"

❌ **Bad** (Multiple behaviors):

- "Implement complete CRUD operations"
- "Build entire authentication system"

### Write Simple Tests

✅ **Good**:

```typescript
it('should return user with id and name', () => {
  const user = createUser({ id: '123', name: 'John' })
  expect(user).toEqual({ id: '123', name: 'John' })
})
```

❌ **Bad**:

```typescript
it('should work', () => {
  const result = doSomething()
  expect(result).toBeTruthy()
})
```

### Write Minimal Code

✅ **Good**:

```typescript
export function getItems(data: any[]): any[] {
  return data
}
```

❌ **Bad** (over-engineered):

```typescript
export class ItemManager {
  private cache: Map<string, any[]> = new Map()

  getItems(data: any[], options?: GetOptions): any[] {
    // Complex caching logic...
    // Unnecessary optimization...
  }
}
```

## Advantages of This System

1. **Strict TDD Discipline** - Enforces Red-Green-Refactor cycle
2. **Minimal Steps** - Each cycle is small and focused
3. **Automatic Testing** - Tests run after every implementation
4. **Clear Documentation** - Every cycle is documented
5. **TypeScript + Vitest** - Modern, type-safe testing
6. **Prevents Over-Engineering** - Forces simplest solution first

## Comparison with Other Agents

| Feature       | TDD System               | Spec-Driven System         |
| ------------- | ------------------------ | -------------------------- |
| Approach      | Test-first, incremental  | Spec-first, complete       |
| Cycle Size    | Minimal (5-10 min)       | Larger (15-30 min)         |
| Testing       | Tests written first      | Tests written after        |
| Documentation | TDD cycle logs           | Specs + validation reports |
| Best For      | New features, algorithms | Complex features, APIs     |

## Tips

1. **Start Simple** - Begin with the simplest test case (empty, null, zero)
2. **One Behavior** - Each test should verify ONE thing
3. **Trust the Process** - Let tests drive the design
4. **Refactor Later** - Get to green first, clean up after
5. **Run Tests Often** - After every code change

## Example: Building a Calculator

```typescript
// Cycle 1: Test
it('should return 0 for empty input', () => {
  expect(calculate([])).toBe(0)
})

// Cycle 1: Code
export function calculate(numbers: number[]): number {
  return 0 // Simplest implementation
}

// Cycle 2: Test
it('should return sum of numbers', () => {
  expect(calculate([1, 2, 3])).toBe(6)
})

// Cycle 2: Code
export function calculate(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0)
}

// Cycle 3: Test
it('should throw error for negative numbers', () => {
  expect(() => calculate([-1])).toThrow('Negative numbers not allowed')
})

// Cycle 3: Code
export function calculate(numbers: number[]): number {
  if (numbers.some(n => n < 0)) {
    throw new Error('Negative numbers not allowed')
  }
  return numbers.reduce((sum, n) => sum + n, 0)
}
```

## Troubleshooting

### Tests Not Running

- Check `package.json` for test script
- Verify Vitest is installed
- Check test file naming (\*.test.ts)

### Tests Failing

- Read error message carefully
- Check expected vs received values
- Verify implementation matches test expectations
- Run tests again after fixes

### Over-Engineering

- Remember: Write the SIMPLEST code
- Don't add features not tested yet
- Trust that future tests will drive complexity

## License

Part of the opencode-setup project.
