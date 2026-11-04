#!/bin/zsh
set -e

APP_NAME="shadcnapp"
TARGET="build"

echo "🧹 Cleaning..."
npx qx clean

echo "⚙️  Compiling production build..."
npx qx compile -c compile-shadcn.json --target="$TARGET"

echo "📦 Bundling production Tailwind CSS..."
npx @tailwindcss/cli \
  -i "./source/resource/${APP_NAME}/css/app.css" \
  -o "./source/resource/${APP_NAME}/css/bundle.min.css" \
  --content "./compiled/${TARGET}/transpiled/**/*.js" \
  --minify

# Sync bundle into the compiled build distribution directory
TARGET_DIR="compiled/${TARGET}/resource/${APP_NAME}/css"
mkdir -p "$TARGET_DIR"
cp "./source/resource/${APP_NAME}/css/bundle.min.css" "$TARGET_DIR/bundle.min.css"

echo "✅ Production build complete: compiled/${TARGET}/"
