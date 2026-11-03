#!/bin/zsh

# Exit immediately if any command fails
set -e

# Define variables for easy maintenance
APP_NAME="mantineapp"
TARGET="source"

echo "🧹 Cleaning..."
npx qx clean 
echo "✅ Cleaning done."

# 1. We must compile once so the 'compiled/source/transpiled' folders 
# are created for the bundler to analyze.
echo "⚙️  Generating transpiled files..."
npx qx compile --app-name="$APP_NAME" --target="$TARGET"

# 2. Run the Mantine CSS Bundler
# Now that the files exist in 'compiled/', the bundler can see what was used.
echo "📦 Bundling Mantine CSS..."
node bundle-mantine.js "$APP_NAME"

# 3. Start the application and watch for changes
# This is the final step because it stays open.
echo "🌐 Starting development server..."
npx qx serve --app-name="$APP_NAME" --target="$TARGET"