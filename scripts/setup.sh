#!/bin/bash

# OpenCode Setup Script
# This script copies the selected agent to the target project's .opencode directory
# Usage: ./setup.sh <agent> [target-path]
# Example: ./setup.sh spec-driven /path/to/project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AGENTS_DIR="$REPO_ROOT/agents"

# Parse arguments
AGENT_NAME="$1"
TARGET_DIR="${2:-.}"

echo -e "${BLUE}OpenCode Setup${NC}"
echo "================================"

# Check if agent name is provided
if [ -z "$AGENT_NAME" ]; then
    echo -e "${RED}Error: Agent name is required${NC}"
    echo ""
    echo "Usage: $0 <agent> [target-path]"
    echo ""
    echo "Available agents:"
    for agent in "$AGENTS_DIR"/*; do
        if [ -d "$agent" ]; then
            echo -e "  - ${GREEN}$(basename "$agent")${NC}"
        fi
    done
    exit 1
fi

SOURCE_AGENT_DIR="$AGENTS_DIR/$AGENT_NAME"

# Check if source agent directory exists
if [ ! -d "$SOURCE_AGENT_DIR" ]; then
    echo -e "${RED}Error: Agent '$AGENT_NAME' not found at $SOURCE_AGENT_DIR${NC}"
    echo ""
    echo "Available agents:"
    for agent in "$AGENTS_DIR"/*; do
        if [ -d "$agent" ]; then
            echo -e "  - ${GREEN}$(basename "$agent")${NC}"
        fi
    done
    exit 1
fi

# Resolve target directory to absolute path
TARGET_DIR="$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")"
TARGET_OPENCODE_DIR="$TARGET_DIR/.opencode"
TARGET_AGENT_DIR="$TARGET_OPENCODE_DIR/agent"

echo -e "Agent: ${GREEN}$AGENT_NAME${NC}"
echo -e "Target: ${BLUE}$TARGET_DIR${NC}"
echo ""

# Create target .opencode directory if it doesn't exist
if [ ! -d "$TARGET_OPENCODE_DIR" ]; then
    echo -e "${GREEN}Creating .opencode directory...${NC}"
    mkdir -p "$TARGET_OPENCODE_DIR"
fi

# Remove existing agent directory if it exists
if [ -d "$TARGET_AGENT_DIR" ]; then
    echo -e "${YELLOW}Removing existing agent configuration...${NC}"
    rm -rf "$TARGET_AGENT_DIR"
fi

# Create agent directory
mkdir -p "$TARGET_AGENT_DIR"

# Copy agent contents to target
echo -e "${GREEN}Installing $AGENT_NAME agent...${NC}"
cp -r "$SOURCE_AGENT_DIR"/* "$TARGET_AGENT_DIR/"

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "Agent '${GREEN}$AGENT_NAME${NC}' has been installed to: ${BLUE}$TARGET_AGENT_DIR${NC}"
