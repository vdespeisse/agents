#!/bin/bash

# OpenCode Setup Script
# This script copies the .opencode directory to the target project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/.opencode"

# Determine target directory (default to current directory if not specified)
TARGET_DIR="${1:-.}"
TARGET_OPENCODE_DIR="$TARGET_DIR/.opencode"

echo -e "${BLUE}OpenCode Setup${NC}"
echo "================================"

# Check if source .opencode directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${YELLOW}Warning: Source .opencode directory not found at $SOURCE_DIR${NC}"
    exit 1
fi

# Create target .opencode directory if it doesn't exist
if [ ! -d "$TARGET_OPENCODE_DIR" ]; then
    echo -e "${GREEN}Creating .opencode directory...${NC}"
    mkdir -p "$TARGET_OPENCODE_DIR"
else
    echo -e "${YELLOW}.opencode directory already exists. Contents will be overwritten.${NC}"
fi

# Copy contents from source to target
echo -e "${GREEN}Copying .opencode contents...${NC}"
cp -r "$SOURCE_DIR"/* "$TARGET_OPENCODE_DIR/"

echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "OpenCode configuration has been installed to: ${BLUE}$TARGET_OPENCODE_DIR${NC}"
