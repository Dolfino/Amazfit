# --- Stage 1: Build static assets ---
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve using Nginx as non-root ---
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build assets
COPY --from=builder /build/dist /usr/share/nginx/html

# Adjust folder permissions so Nginx can run as the non-root 'nginx' user
RUN touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx /usr/share/nginx/html

# Switch to the non-root user
USER nginx

# Expose port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
