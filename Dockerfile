
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache python3 make g++ wget

# Create app directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Make sure the data directory exists
RUN mkdir -p /app/data

# Expose the port
EXPOSE 8080

# Start the server
CMD ["npm", "run", "start"]
