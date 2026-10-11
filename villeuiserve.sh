#!/bin/bash

# Install dependencies
npx lightningcss ./source/resource/villeui/css/app-priority.css --bundle -o ./source/resource/villeui/css/villeui-priority.css -m

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve -c compile-villeui.json