#!/bin/bash

# Install dependencies
# npx @tailwindcss/cli -i ./app.css -o ./mantineapp.css -m --cwd './source/resource/mantineapp/css'
npx lightningcss ./source/resource/mantineapp/css/app.css --bundle -o ./source/resource/mantineapp/css/mantineapp.css -m

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve -c compile-mantine.json