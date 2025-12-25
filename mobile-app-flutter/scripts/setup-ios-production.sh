#!/bin/bash

# setup-ios-production.sh
# Usage: ./setup-ios-production.sh "com.yourname.magicwork" "TEAM_ID"

NEW_BUNDLE_ID=$1
TEAM_ID=$2

if [ -z "$NEW_BUNDLE_ID" ] || [ -z "$TEAM_ID" ]; then
    echo "Usage: ./setup-ios-production.sh <BUNDLE_ID> <TEAM_ID>"
    echo "Example: ./setup-ios-production.sh com.magicwork.app ABC123XYZ"
    exit 1
fi

PROJECT_FILE="mobile-app-flutter/ios/Runner.xcodeproj/project.pbxproj"

echo "Updating Bundle ID to: $NEW_BUNDLE_ID"
sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = com.example.magicwork;/PRODUCT_BUNDLE_IDENTIFIER = $NEW_BUNDLE_ID;/g" "$PROJECT_FILE"

echo "Updating Development Team ID to: $TEAM_ID"
# Note: This adds or updates the DEVELOPMENT_TEAM key
sed -i '' "s/DEVELOPMENT_TEAM = [^;]*;/DEVELOPMENT_TEAM = $TEAM_ID;/g" "$PROJECT_FILE"

# If DEVELOPMENT_TEAM doesn't exist yet, we might need a more complex insertion, 
# but usually it's there as an empty or default string if edited via Xcode once.
# For a fresh setup, we'll try to insert it after the bundle identifier line.
if ! grep -q "DEVELOPMENT_TEAM" "$PROJECT_FILE"; then
    echo "Adding DEVELOPMENT_TEAM to project file..."
    sed -i '' "/PRODUCT_BUNDLE_IDENTIFIER = $NEW_BUNDLE_ID;/a\\
\\				DEVELOPMENT_TEAM = $TEAM_ID;" "$PROJECT_FILE"
fi

echo "✅ Setup complete. Please open Xcode and verify the 'Signing & Capabilities' tab."







