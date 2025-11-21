# Use Node.js 20 (Vite 7 requires Node 20+)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without cache mount
RUN npm install --legacy-peer-deps --cache /tmp/npm-cache && \
    rm -rf /tmp/npm-cache

# Copy application code
COPY . .

# Build application
RUN npm run build

# Install serve to run static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve static files
CMD ["serve", "-s", "dist", "-l", "3000"]
