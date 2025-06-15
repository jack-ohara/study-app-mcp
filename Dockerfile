# Use official Node.js 22 image as base
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3003

# Start the server
CMD ["node", "--experimental-strip-types", "index.ts"]
