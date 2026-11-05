#!/bin/zsh
set -e

# Define variables for easy maintenance
APP_NAME="mantineapp"
TARGET="source"

echo "🧹 Cleaning..."
npx qx clean

echo "⚙️  Generating transpiled files..."
npx qx compile --app-name="$APP_NAME" --target="$TARGET"

echo "📦 Bundling Mantine CSS..."
# -----------------------------------------------------------------------------
# bundle-mantine.js Configuration Options:
# -----------------------------------------------------------------------------
# The bundler script supports dynamic named arguments (in any order):
#
# --app-name   : The namespace/name of your qooxdoo app (default: myapp)
# --target     : The compilation target, 'source' or 'build' (default: source)
# --styles-dir : [Optional] Path to the directory containing Mantine CSS files.
#                If omitted, defaults to: node_modules/@mantine/core/styles
# --map-path   : [Optional] Path to the directory containing mantine-map.json,
#                or the direct path to the file itself.
#                If omitted, defaults to: source/resource/ville
#
# Example with all flags:
# node bundle-mantine.js --app-name="$APP_NAME" --target="$TARGET" --styles-dir="custom/path" --map-path="custom/path"
# -----------------------------------------------------------------------------
node bundle-mantine.js --app-name="$APP_NAME" --target="$TARGET"

echo "🌐 Starting development server..."
npx qx serve --app-name="$APP_NAME" --target="$TARGET"