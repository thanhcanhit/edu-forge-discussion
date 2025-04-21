FROM nginx:alpine

# Install apache2-utils for htpasswd command
RUN apk add --no-cache apache2-utils

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy script to generate htpasswd file
COPY generate-htpasswd.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/generate-htpasswd.sh
