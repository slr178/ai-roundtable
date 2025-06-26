# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy server source code
COPY server/ ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const req = http.request('http://localhost:3001/health', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1); \
  }); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start the server
CMD ["npm", "start"] 