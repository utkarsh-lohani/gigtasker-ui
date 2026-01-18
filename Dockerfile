# --- Stage 1: Build ---
FROM node:lts-alpine AS build
WORKDIR /app

ENV NODE_ENV=production

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Angular app
RUN npm run build -- --configuration=production

# --- Stage 2: Serve ---
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/dist/gigtasker-ui/browser /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
