#!/bin/bash

# OpenCode Setup Script
# This script copies the selected setup to the target project's .opencode directory
# Usage: ./setup.sh <setup-name> [target-path]
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
SETUPS_DIR="$REPO_ROOT/setups"

# Parse arguments
SETUP_NAME="$1"
TARGET_DIR="${2:-.}"

echo -e "${BLUE}OpenCode Setup${NC}"
echo "================================"

# Check if setup name is provided
if [ -z "$SETUP_NAME" ]; then
    echo -e "${RED}Error: Setup name is required${NC}"
    echo ""
    echo "Usage: $0 <setup-name> [target-path]"
    echo ""
    echo "Available setups:"
    for setup in "$SETUPS_DIR"/*; do
        if [ -d "$setup" ]; then
            echo -e "  - ${GREEN}$(basename "$setup")${NC}"
        fi
    done
    exit 1
fi

SOURCE_SETUP_DIR="$SETUPS_DIR/$SETUP_NAME"

# Check if source setup directory exists
if [ ! -d "$SOURCE_SETUP_DIR" ]; then
    echo -e "${RED}Error: Setup '$SETUP_NAME' not found at $SOURCE_SETUP_DIR${NC}"
    echo ""
    echo "Available setups:"
    for setup in "$SETUPS_DIR"/*; do
        if [ -d "$setup" ]; then
            echo -e "  - ${GREEN}$(basename "$setup")${NC}"
        fi
    done
    exit 1
fi

# Resolve target directory to absolute path
TARGET_DIR="$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")"
TARGET_OPENCODE_DIR="$TARGET_DIR/.opencode"

echo -e "Setup: ${GREEN}$SETUP_NAME${NC}"
echo -e "Target: ${BLUE}$TARGET_DIR${NC}"
echo ""

# Create target .opencode directory if it doesn't exist
if [ ! -d "$TARGET_OPENCODE_DIR" ]; then
    echo -e "${GREEN}Creating .opencode directory...${NC}"
    mkdir -p "$TARGET_OPENCODE_DIR"
fi

# Function to copy files without overwriting
copy_without_overwrite() {
    local src="$1"
    local dst="$2"
    local skipped=0
    local copied=0
    
    # Create destination directory if it doesn't exist
    mkdir -p "$dst"
    
    # Copy files recursively without overwriting
    while IFS= read -r -d '' file; do
        # Get relative path from source directory
        rel_path="${file#$src/}"
        target_file="$dst/$rel_path"
        
        if [ -f "$file" ]; then
            # Check if target file already exists
            if [ -f "$target_file" ]; then
                echo -e "  ${YELLOW}Skipping (exists): $rel_path${NC}"
                ((skipped++))
            else
                # Create parent directory if needed
                mkdir -p "$(dirname "$target_file")"
                cp "$file" "$target_file"
                echo -e "  ${GREEN}Copied: $rel_path${NC}"
                ((copied++))
            fi
        fi
    done < <(find "$src" -type f -print0)
    
    echo ""
    echo -e "${GREEN}Copied: $copied file(s)${NC}"
    if [ $skipped -gt 0 ]; then
        echo -e "${YELLOW}Skipped: $skipped file(s) (already exist)${NC}"
    fi
}

# Copy setup contents to target (without overwriting existing files)
echo -e "${GREEN}Installing $SETUP_NAME setup...${NC}"
echo ""

# Copy each subdirectory from the setup
for item in "$SOURCE_SETUP_DIR"/*; do
    if [ -d "$item" ]; then
        item_name=$(basename "$item")
        echo -e "${BLUE}Processing $item_name/...${NC}"
        copy_without_overwrite "$item" "$TARGET_OPENCODE_DIR/$item_name"
    fi
done

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "Setup '${GREEN}$SETUP_NAME${NC}' has been installed to: ${BLUE}$TARGET_OPENCODE_DIR${NC}"
