#!/bin/bash

# Install dependencies
npx @tailwindcss/cli -i ./source/resource/mantineapp/css/app.css -o ./source/resource/mantineapp/css/mantineapp.css

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve -c compile-mantine.json