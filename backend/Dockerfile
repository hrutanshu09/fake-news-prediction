# Use an official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the backend port (same as in server.js)
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
