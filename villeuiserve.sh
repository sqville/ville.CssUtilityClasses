#!/bin/zsh
set -e

# Define variables for easy maintenance
# Usage:
#   bash villeuiserve.sh                                         -> default theme, source target
#   bash villeuiserve.sh [mantine|obsidian|shadcn] [source|build|deploy]
#   bash villeuiserve.sh [source|build|deploy] [--no-prune|--prune] [--all-themes|--single-theme]
APP_NAME="villeuiapp"
TARGET="source"
PROFILE="source"
ALT_CONFIG="compile.json"
CSS_ENGINE=""
EXTRA_ENV_ARGS=()

for arg in "$@"; do
  case "$arg" in
    source|build)
      TARGET="$arg"
      PROFILE="$arg"
      ;;
    deploy)
      TARGET="build"
      PROFILE="deploy"
      EXTRA_ENV_ARGS+=(
        --set-env "ville.css.prune=true"
        --set-env "ville.css.bundleAllThemes=false"
        --set-env "ville.debug.domAttributes=false"
        --set-env "ville.bundle.mode=single"
        --set-env "ville.bundle.minify=true"
      )
      ;;
    mantine|obsidian|shadcn)
      CSS_ENGINE="$arg"
      ;;
    --no-prune)
      EXTRA_ENV_ARGS+=(--set-env "ville.css.prune=false")
      ;;
    --prune)
      EXTRA_ENV_ARGS+=(--set-env "ville.css.prune=true")
      ;;
    --all-themes)
      EXTRA_ENV_ARGS+=(--set-env "ville.css.bundleAllThemes=true")
      ;;
    --single-theme)
      EXTRA_ENV_ARGS+=(--set-env "ville.css.bundleAllThemes=false")
      ;;
    --no-qx-aliases)
      EXTRA_ENV_ARGS+=(--set-env "ville.kernel.qxAliases=false")
      ;;
  esac
done

CONFIG_ARGS=()
if [[ -n "$ALT_CONFIG" ]]; then
  CONFIG_ARGS=(-c "$ALT_CONFIG")
fi

ENV_ARGS=()
if [[ -n "$CSS_ENGINE" ]]; then
  ENV_ARGS+=(--set-env "ville.cssEngine=$CSS_ENGINE")
  echo "🎨 Theme override: ville.cssEngine=$CSS_ENGINE"
fi
ENV_ARGS+=("${EXTRA_ENV_ARGS[@]}")

echo "🧹 Cleaning..."
npx qx clean "${CONFIG_ARGS[@]}"

echo "⚙️  Compiling Path B Ville UI app (profile=$PROFILE, target=$TARGET, ville-kernel.js + 3-Layer CSS Bundle)..."
npx qx compile "${CONFIG_ARGS[@]}" --app-name="$APP_NAME" --target="$TARGET" "${ENV_ARGS[@]}"

echo "🔍 Running Mode 3 / Path B Zero-qx.* Leak Audit (target=$TARGET)..."
node check-ville-leaks.js --target "$TARGET" --app "$APP_NAME"

echo "🌐 Starting development server (profile=$PROFILE, target=$TARGET)..."
npx qx serve "${CONFIG_ARGS[@]}" --app-name="$APP_NAME" --target="$TARGET" "${ENV_ARGS[@]}"
