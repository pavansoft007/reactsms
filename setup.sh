#!/bin/bash

echo "Setting up project with Yarn..."

# Install root dependencies
echo "Installing root dependencies..."
yarn install

# Install client dependencies  
echo "Installing client dependencies..."
cd client && yarn install && cd ..

# Install server dependencies
echo "Installing server dependencies..."
cd server && yarn install && cd ..

echo "Setup complete! You can now run:"
echo "  yarn dev - to start both client and server"
echo "  yarn client - to start only the client"
echo "  yarn server - to start only the server"
