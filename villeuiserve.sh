#!/bin/zsh
set -e

# Define variables for easy maintenance
APP_NAME="villeuiapp"
TARGET="source"
ALT_CONFIG="compile-villeuiapp.json"

CONFIG_ARGS=()
if [[ -n "$ALT_CONFIG" ]]; then
  CONFIG_ARGS=(-c "$ALT_CONFIG")
fi

echo "🧹 Cleaning..."
npx qx clean "${CONFIG_ARGS[@]}"

echo "⚙️  Generating transpiled files..."
npx qx compile "${CONFIG_ARGS[@]}" --app-name="$APP_NAME" --target="$TARGET"

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
node bundle-mantine.js --app-name="$APP_NAME" --target="$TARGET" --styles-dir="source/resource/mantine/core/styles"

echo "🌐 Starting development server..."
npx qx serve "${CONFIG_ARGS[@]}" --app-name="$APP_NAME" --target="$TARGET"
