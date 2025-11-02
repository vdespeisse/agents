# OpenCode Setup

A multi-agent orchestration system for spec-driven software development with built-in quality gates and security reviews.

## Overview

This repository provides a structured workflow system that coordinates specialized AI agents to transform feature requests into production-ready code. The system enforces a rigorous spec → code → validation → review cycle to ensure quality, security, and compliance.

## Architecture

### Agent System

The system consists of five specialized agents:

1. **Spec-Driven Agent** (Primary)
   - Analyzes user requests and creates task plans
   - Coordinates all subagents in sequence
   - Manages workflow and quality gates
   - Tracks progress and handles feedback loops

2. **Spec-Writer Subagent**
   - Transforms tasks into detailed specifications
   - Defines binary pass/fail acceptance criteria
   - Creates validation contracts for testing

3. **Coder Subagent**
   - Implements code according to specifications
   - Follows security best practices
   - Self-validates against acceptance criteria

4. **Spec-Tester Subagent**
   - Creates tests for testable contracts (JS functions, APIs)
   - Executes automated validation commands
   - Verifies acceptance criteria objectively
   - Reports PASS/FAIL with detailed results

5. **Reviewer Subagent**
   - Performs security audits
   - Assesses code quality and maintainability
   - Validates spec compliance and patterns

## Workflow

```
User Request
    ↓
Spec-Driven Agent (analyzes & plans)
    ↓
Spec-Writer (creates specification)
    ↓
Coder (implements code)
    ↓
Spec-Tester (creates tests & validates criteria)
    ↓ (if PASS)
Reviewer (security & quality review)
    ↓ (if PASS)
Complete ✓
```

If validation or review fails, the spec-driven agent loops back to the coder with feedback.

## Task Structure

Each feature creates a structured task directory:

```
.tasks/
└── {feature-slug}/
    ├── task-plan.md              # Master plan
    ├── specs/
    │   ├── 01-{task}.md          # Detailed specs
    │   └── 02-{task}.md
    ├── code/
    │   └── completion-log.md     # Implementation notes
    ├── validation/
    │   ├── validation-report-01.md
    │   └── validation-report-02.md
    └── review/
        └── review-report.md      # Security & quality findings
```

## Installation

### Quick Install (One-Line Command)

Install a setup directly into your project:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) <setup-name> [target-path]
```

Available setups:

- **spec-driven**: Full specification-driven development workflow
- **tdd**: Test-driven development workflow with testing context

Example:

```bash
# Install spec-driven setup in current directory
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven
```

### Manual Installation

If you have cloned this repository:

```bash
# Install spec-driven setup
./scripts/setup.sh spec-driven [target-directory]

# Install tdd setup
./scripts/setup.sh tdd [target-directory]
```

This copies the selected setup's contents (agents, context files, etc.) to your project's `.opencode` directory.

### Multiple Setups

You can layer multiple setups in the same project - existing files won't be overwritten:

```bash
# Install spec-driven first
./scripts/setup.sh spec-driven

# Add tdd setup (preserves existing files, adds new ones)
./scripts/setup.sh tdd
```

## Features

- **Spec-Driven Development**: Every feature starts with a detailed specification
- **Automated Validation**: Acceptance criteria are verified programmatically
- **Security-First**: Built-in security reviews on every implementation
- **Quality Gates**: Multiple checkpoints ensure code meets standards
- **Feedback Loops**: Automated retry with specific guidance when validation fails
- **Traceability**: Complete audit trail from request to completion

## Use Cases

- Complex feature implementation with multiple subtasks
- Security-critical code requiring thorough review
- Projects requiring formal acceptance criteria
- Teams needing structured development workflows
- Codebases with strict quality standards

## Requirements

- Node.js runtime (for demo server)
- OpenCode CLI access
- Appropriate AI model access for agents

## Documentation

Detailed specifications for each agent are available in the `specs/` directory:

- `spec-driven-agent-spec.md` - Workflow coordination
- `spec-writer-subagent-spec.md` - Specification creation
- `coder-subagent-spec.md` - Code implementation
- `spec-tester-subagent-spec.md` - Test creation and validation
- `reviewer-subagent-spec.md` - Security and quality review

## License

MIT
