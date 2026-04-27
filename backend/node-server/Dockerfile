# Use slim image for smaller footprint
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files and install production deps only
COPY package*.json ./
RUN npm install --production

# Copy built assets
COPY --from=builder /app/dist ./dist

# Standard production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.js"]
