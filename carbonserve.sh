#!/bin/bash

# Install dependencies
npx sass ./source/resource/carbonapp/scss/carbonapp.scss ./source/resource/carbonapp/css/carbonapp.css \
 --load-path=node_modules \
 --style compressed

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve