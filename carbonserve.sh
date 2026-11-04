#!/bin/zsh
set -e

APP_NAME="carbonapp"
TARGET="source"

echo "🧹 Cleaning..."
npx qx clean

echo "⚙️  Generating transpiled files..."
npx qx compile -c compile-carbon.json --target="$TARGET"

echo "📦 Bundling Carbon SCSS..."
node bundle-carbon.js "$APP_NAME" "$TARGET"

echo "🌐 Starting development server..."
npx qx serve -c compile-carbon.json --target="$TARGET"
