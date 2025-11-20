# --- Stage 1: Build ---
FROM node:24-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app
# This will create /app/dist/gigtasker-ui/browser
RUN npm run build -- --configuration=production

# --- Stage 2: Serve ---
FROM nginx:alpine

# Clean default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output.
# CRITICAL: Note the '/browser' at the end!
COPY --from=build /app/dist/gigtasker-ui/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
