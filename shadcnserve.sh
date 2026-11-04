#!/bin/zsh
set -e

APP_NAME="shadcnapp"
TARGET="source"

echo "🧹 Cleaning..."
npx qx clean

echo "⚙️  Generating transpiled files..."
npx qx compile -c compile-shadcn.json --target="$TARGET"

echo "📦 Harvesting classes and bundling Tailwind CSS..."
npx @tailwindcss/cli \
  -i "./source/resource/${APP_NAME}/css/app.css" \
  -o "./source/resource/${APP_NAME}/css/bundle.min.css" \
  --content "./compiled/${TARGET}/transpiled/**/*.js" \
  --minify

echo "🌐 Starting development server..."
npx qx serve -c compile-shadcn.json --target="$TARGET"
