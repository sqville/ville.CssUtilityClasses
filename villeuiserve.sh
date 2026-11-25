#!/bin/zsh
set -e

# Define variables for easy maintenance
# Usage:
#   bash villeuiserve.sh                         -> default theme, source target
#   bash villeuiserve.sh [mantine|obsidian|shadcn] [source|build]
#   bash villeuiserve.sh [source|build]
APP_NAME="villeuiapp"
TARGET="source"
ALT_CONFIG="compile.json"
CSS_ENGINE=""

for arg in "$@"; do
  case "$arg" in
    source|build)
      TARGET="$arg"
      ;;
    mantine|obsidian|shadcn)
      CSS_ENGINE="$arg"
      ;;
  esac
done

CONFIG_ARGS=()
if [[ -n "$ALT_CONFIG" ]]; then
  CONFIG_ARGS=(-c "$ALT_CONFIG")
fi

ENV_ARGS=()
if [[ -n "$CSS_ENGINE" ]]; then
  ENV_ARGS=(--set-env "ville.cssEngine=$CSS_ENGINE")
  echo "🎨 Theme override: ville.cssEngine=$CSS_ENGINE"
fi

echo "🧹 Cleaning..."
npx qx clean "${CONFIG_ARGS[@]}"

echo "⚙️  Compiling Path B Ville UI app (target=$TARGET, ville-kernel.js + 3-Layer CSS Bundle)..."
npx qx compile "${CONFIG_ARGS[@]}" --app-name="$APP_NAME" --target="$TARGET" "${ENV_ARGS[@]}"

echo "🔍 Running Mode 3 / Path B Zero-qx.* Leak Audit (target=$TARGET)..."
node check-ville-leaks.js --target "$TARGET" --app "$APP_NAME"

echo "🌐 Starting development server (target=$TARGET)..."
npx qx serve "${CONFIG_ARGS[@]}" --app-name="$APP_NAME" --target="$TARGET" "${ENV_ARGS[@]}"
