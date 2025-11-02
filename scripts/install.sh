#!/bin/bash

# OpenCode One-Line Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh | bash -s <setup-name> [target-path]
# Or: bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) <setup-name> [target-path]
# Example: bash <(curl -fsSL https://raw.githubusercontent.com/vdespeisse/agents/main/scripts/install.sh) spec-driven .

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

REPO_URL="git@github.com:vdespeisse/agents.git"
TEMP_DIR=$(mktemp -d)
SETUP_NAME="$1"
TARGET_DIR="${2:-.}"

echo -e "${BLUE}OpenCode Setup Installer${NC}"
echo "================================"

# Cleanup function
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        echo -e "${YELLOW}Cleaning up temporary files...${NC}"
        rm -rf "$TEMP_DIR"
    fi
}

# Register cleanup on exit
trap cleanup EXIT

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git first.${NC}"
    exit 1
fi

# Check if setup name is provided
if [ -z "$SETUP_NAME" ]; then
    echo -e "${RED}Error: Setup name is required${NC}"
    echo ""
    echo "Usage: $0 <setup-name> [target-path]"
    echo ""
    echo "Available setups: spec-driven, tdd"
    exit 1
fi

# Clone the repository
echo -e "${GREEN}Cloning opencode-setup repository...${NC}"
if ! git clone --depth 1 "$REPO_URL" "$TEMP_DIR" 2>/dev/null; then
    echo -e "${RED}Error: Failed to clone repository. Make sure you have SSH access to the repository.${NC}"
    echo -e "${YELLOW}Tip: You may need to set up SSH keys for GitHub.${NC}"
    exit 1
fi

# Run the setup script
echo -e "${GREEN}Running setup script...${NC}"
bash "$TEMP_DIR/scripts/setup.sh" "$SETUP_NAME" "$TARGET_DIR"

echo -e "${GREEN}✓ Installation complete!${NC}"
echo -e "You can now use OpenCode with the $SETUP_NAME setup in your project."
