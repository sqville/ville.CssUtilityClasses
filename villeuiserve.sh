#!/bin/bash

# Install dependencies
# npx @tailwindcss/cli -i ./app.css -o ./villeui.css -m --cwd './source/resource/villeui/css'
npx lightningcss ./source/resource/villeui/css/app.css -m --bundle -o ./source/resource/villeui/css/villeui.css

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve -c compile-villeui.json