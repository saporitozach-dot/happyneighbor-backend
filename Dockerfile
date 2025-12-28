FROM node:18-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for building better-sqlite3)
RUN npm ci

# Copy application files
COPY api-server.js ./
COPY neighborhoods.db* ./

# Create uploads directory
RUN mkdir -p uploads/verifications

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "api-server.js"]

