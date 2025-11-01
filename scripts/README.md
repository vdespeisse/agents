# OpenCode Setup Scripts

This directory contains scripts to easily install OpenCode agents in your projects.

## Available Agents

- **spec-driven**: Specification-driven development agent with subagents for writing specs, coding, reviewing, and testing
- **tdd**: Test-driven development agent for writing tests first and then implementing code

## Quick Install (One-Line Command)

From any project directory, run:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) <agent> [target-path]
```

Or using wget:

```bash
bash <(wget -qO- https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) <agent> [target-path]
```

### Examples

Install the spec-driven agent in current directory:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven
```

Install the tdd agent in a specific directory:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) tdd /path/to/project
```

This will:

1. Clone the `opencode-setup` repository to a temporary directory
2. Create the `.opencode` directory if it doesn't exist
3. Copy the selected agent to `.opencode/agent`
4. Clean up temporary files

## Manual Installation

If you prefer to clone the repository manually:

```bash
# Clone the repository
git clone git@github.com:vdespeisse/agents.git /tmp/opencode-setup

# Run the setup script in your project directory
cd /path/to/your/project
bash /tmp/opencode-setup/scripts/setup.sh spec-driven

# Or specify a target directory
bash /tmp/opencode-setup/scripts/setup.sh spec-driven /path/to/target/project
```

## Scripts

### `install.sh`

The one-line installer that handles everything automatically:

- Clones the repository to a temporary location
- Runs the setup script with the specified agent
- Cleans up after itself

**Usage**: `./install.sh <agent> [target-path]`

### `setup.sh`

The main setup script that:

- Creates the `.opencode` directory if it doesn't exist
- Copies the selected agent configuration to `.opencode/agent`
- Lists available agents if none is specified

**Usage**: `./setup.sh <agent> [target-path]`

## Requirements

- Git must be installed
- SSH access to the GitHub repository (for the SSH clone method)
- Bash shell

## Examples

### Install spec-driven agent in current directory

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven
```

### Install tdd agent in current directory

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) tdd
```

### Install in specific directory

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven /path/to/project
```

### Switch to a different agent

Simply run the installer again with a different agent name - it will replace the existing agent configuration:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) tdd
```

## Troubleshooting

### SSH Key Issues

If you get an error about SSH access, make sure:

1. You have SSH keys set up for GitHub
2. Your SSH key is added to your GitHub account
3. You can run `ssh -T git@github.com` successfully

Alternatively, you can modify the `REPO_URL` in `install.sh` to use HTTPS:

```bash
REPO_URL="https://github.com/vdespeisse/agents.git"
```
