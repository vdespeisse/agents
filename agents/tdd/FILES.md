# TDD Agent System - Files

## Directory Structure

```
agents/tdd/
├── README.md                         # Complete documentation
├── FILES.md                          # This file - file overview
├── tdd-orchestrator.md              # Main orchestrator agent
├── context/
│   └── typescript-testing.md        # TypeScript + Vitest testing guide
└── subagent/
    ├── tdd-tester.md                # Test writing subagent
    └── tdd-coder.md                 # Code implementation subagent
```

## File Descriptions

### Core Agent Files

- **tdd-orchestrator.md** - The main TDD orchestrator agent that breaks down tasks into minimal TDD cycles and coordinates the workflow
- **subagent/tdd-tester.md** - Subagent that writes focused unit tests using Vitest (RED phase)
- **subagent/tdd-coder.md** - Subagent that writes minimal code to pass tests and runs npm test (GREEN phase)

### Documentation

- **README.md** - Complete user guide with examples, workflow, and best practices
- **context/typescript-testing.md** - Comprehensive TypeScript + Vitest testing reference for agents to use

### Context Files

The `context/` directory contains reference material that agents can use:

- **typescript-testing.md** - How to test TypeScript code with Vitest
  - Test running commands
  - Vitest matchers reference
  - Mocking guidelines (only when necessary)
  - TypeScript best practices
  - Common testing patterns

## Quick Start

1. **Read the guide**: `README.md`
2. **Check testing reference**: `context/typescript-testing.md`
3. **Invoke orchestrator**: `@tdd-orchestrator Build a feature`

## For Agents

When working on TDD tasks, agents should:

1. Read `context/typescript-testing.md` for testing practices
2. Follow the patterns and examples provided
3. Use `npm run test` to run tests (which runs `vitest run`)
4. Mock only external dependencies (APIs, databases, etc.)
5. Follow TypeScript best practices with proper types

---

**Created**: 2025-11-01
**Version**: 1.0.0
