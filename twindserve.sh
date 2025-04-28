#!/bin/bash

# Install dependencies
npx tailwindcss -i ./source/resource/twindapp/css/app.css -o ./source/resource/twindapp/css/twindapp.css

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve --app-group="tailwind3"