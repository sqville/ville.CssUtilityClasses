#!/bin/bash

# Install dependencies
# npx sass ./source/resource/tablerapp/scss/tablerapp.scss ./source/resource/tablerapp/css/tablerapp.css

# Build the project
echo "Cleaning..."
npx qx clean
echo "Cleaning done."

# Start the application
npx qx serve -c compile-tabler.json