#!/bin/bash

# Install dependencies
npx @tailwindcss/cli -i ./app.css -o ./villeui.css -m --cwd './source/resource/villeui/css'

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve -c compile-villeui.json