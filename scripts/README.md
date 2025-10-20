# OpenCode Setup Scripts

This directory contains scripts to easily install the OpenCode configuration in your projects.

## Quick Install (One-Line Command)

From any project directory, run:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/opencode-setup/main/scripts/install.sh)
```

Or using wget:

```bash
bash <(wget -qO- https://raw.githubusercontent.com/vdespeisse/opencode-setup/main/scripts/install.sh)
```

This will:
1. Clone the `opencode-setup` repository to a temporary directory
2. Copy the `.opencode` directory to your current project
3. Clean up temporary files

## Manual Installation

If you prefer to clone the repository manually:

```bash
# Clone the repository
git clone git@github.com:vdespeisse/opencode-setup.git /tmp/opencode-setup

# Run the setup script in your project directory
cd /path/to/your/project
bash /tmp/opencode-setup/scripts/setup.sh

# Or specify a target directory
bash /tmp/opencode-setup/scripts/setup.sh /path/to/target/project
```

## Scripts

### `install.sh`
The one-line installer that handles everything automatically:
- Clones the repository to a temporary location
- Runs the setup script
- Cleans up after itself

### `setup.sh`
The main setup script that:
- Creates the `.opencode` directory if it doesn't exist
- Copies all OpenCode configuration files
- Can be run with an optional target directory argument

## Requirements

- Git must be installed
- SSH access to the GitHub repository (for the SSH clone method)
- Bash shell

## Examples

### Install in current directory
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/opencode-setup/main/scripts/install.sh)
```

### Install in specific directory
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/opencode-setup/main/scripts/install.sh) /path/to/project
```

### Update existing installation
Simply run the installer again - it will overwrite the existing `.opencode` directory with the latest version.

## Troubleshooting

### SSH Key Issues
If you get an error about SSH access, make sure:
1. You have SSH keys set up for GitHub
2. Your SSH key is added to your GitHub account
3. You can run `ssh -T git@github.com` successfully

Alternatively, you can modify the `REPO_URL` in `install.sh` to use HTTPS:
```bash
REPO_URL="https://github.com/vdespeisse/opencode-setup.git"
```
