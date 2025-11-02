# OpenCode Setup Scripts

This directory contains scripts to easily install OpenCode setups in your projects.

## Available Setups

- **spec-driven**: Specification-driven development setup with agents for writing specs, coding, reviewing, and testing
- **tdd**: Test-driven development setup with agents for writing tests first and then implementing code, plus testing context files

## Quick Install (One-Line Command)

From any project directory, run:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) <setup-name> [target-path]
```

Or using wget:

```bash
bash <(wget -qO- https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) <setup-name> [target-path]
```

### Examples

Install the spec-driven setup in current directory:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven
```

Install the tdd setup in a specific directory:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) tdd /path/to/project
```

This will:

1. Clone the `opencode-setup` repository to a temporary directory
2. Create the `.opencode` directory if it doesn't exist
3. Copy the selected setup contents (agent/, context/, etc.) to `.opencode/`
4. Skip any files that already exist (won't overwrite)
5. Clean up temporary files

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

## Multiple Setups

You can install multiple setups in the same project! The script will **not overwrite** existing files, so you can safely layer different setups:

```bash
# Install spec-driven first
bash scripts/setup.sh spec-driven

# Add tdd context files without overwriting the spec-driven agent
bash scripts/setup.sh tdd
```

This allows you to combine different agents and context files in a single project.

## Scripts

### `install.sh`

The one-line installer that handles everything automatically:

- Clones the repository to a temporary location
- Runs the setup script with the specified setup
- Cleans up after itself

**Usage**: `./install.sh <setup-name> [target-path]`

### `setup.sh`

The main setup script that:

- Creates the `.opencode` directory if it doesn't exist
- Copies the selected setup contents to `.opencode/` (agent/, context/, etc.)
- **Does not overwrite existing files** - safe to run multiple times
- Lists available setups if none is specified

**Usage**: `./setup.sh <setup-name> [target-path]`

## Requirements

- Git must be installed
- SSH access to the GitHub repository (for the SSH clone method)
- Bash shell

## Examples

### Install spec-driven setup in current directory

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven
```

### Install tdd setup in current directory

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) tdd
```

### Install in specific directory

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven /path/to/project
```

### Layer multiple setups

Install multiple setups in the same project (files won't be overwritten):

```bash
# Install spec-driven first
bash scripts/setup.sh spec-driven

# Add tdd setup (keeps existing files, adds new ones)
bash scripts/setup.sh tdd
```

### Update a setup

Simply run the installer again with the same setup name - it will add any new files but preserve your existing ones:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven
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
