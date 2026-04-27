# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage: serve with Nginx
FROM nginx:stable-alpine

# Copy built app to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Copy a custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
