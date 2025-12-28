#!/bin/bash

# Script to move project to local folder for better performance
# This avoids OneDrive sync delays that cause Tailwind timeouts

LOCAL_PATH="$HOME/Projects/HappyNeighbor"
CURRENT_PATH="/Users/zachsap/Library/CloudStorage/OneDrive-IndianaUniversity/Cursor stuff/HappyNeighbor"

echo "Moving project to local folder for better performance..."
echo "From: $CURRENT_PATH"
echo "To: $LOCAL_PATH"

# Create Projects directory if it doesn't exist
mkdir -p "$HOME/Projects"

# Copy project (excluding node_modules and .git if they exist)
rsync -av --exclude 'node_modules' --exclude '.git' --exclude 'neighborhoods.db' "$CURRENT_PATH/" "$LOCAL_PATH/"

echo ""
echo "✅ Project copied to: $LOCAL_PATH"
echo ""
echo "Next steps:"
echo "1. cd $LOCAL_PATH"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "Your original files are still in OneDrive for backup."

