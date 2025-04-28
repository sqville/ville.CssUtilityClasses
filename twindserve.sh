#!/bin/bash

# Install dependencies
npx tailwindcss -i ./source/resource/css/app.css -o ./source/resource/css/testapp.css

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve