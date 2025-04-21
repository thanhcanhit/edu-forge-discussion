# Prisma Studio in Production

This document explains how to access and use Prisma Studio in a production environment.

## Overview

Prisma Studio is a visual database editor for your Prisma schema. In production, it's secured behind an Nginx proxy with basic authentication to prevent unauthorized access.

## Configuration

The following environment variables control Prisma Studio's configuration:

- `PRISMA_STUDIO_PORT`: The port on which Prisma Studio will be accessible (default: 5555)
- `PRISMA_STUDIO_USERNAME`: Username for basic authentication (default: admin)
- `PRISMA_STUDIO_PASSWORD`: Password for basic authentication (default: changeme)

You should change these defaults in your production environment by setting these variables in your `.env` file or through your deployment platform's environment variable settings.

## Accessing Prisma Studio

1. Make sure your Docker containers are running:

   ```
   docker-compose up -d
   ```

2. Access Prisma Studio through your browser:

   ```
   http://your-server-ip:5555
   ```

   or if you've set up a domain:

   ```
   http://prisma-studio.example.com
   ```

3. When prompted, enter the username and password you configured.

## Security Considerations

- **Change default credentials**: Always change the default username and password.
- **IP Restrictions**: Consider restricting access by IP in the Nginx configuration.
- **HTTPS**: For production, configure HTTPS by adding SSL certificates to Nginx.
- **VPN/SSH Tunnel**: For maximum security, consider only exposing Prisma Studio through a VPN or SSH tunnel.

## Additional IP Restrictions

To restrict access to specific IP addresses, uncomment and modify the following lines in `nginx/nginx.conf`:

```nginx
# Allow specific IPs or ranges
allow 192.168.1.0/24;
allow 10.0.0.0/8;
deny all;
```

## Setting Up HTTPS

For HTTPS, you'll need to:

1. Obtain SSL certificates (e.g., using Let's Encrypt)
2. Update the Nginx configuration to use HTTPS
3. Mount the certificates into the Nginx container

Example docker-compose addition:

```yaml
nginx:
  volumes:
    - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem
    - ./ssl/key.pem:/etc/nginx/ssl/key.pem
```

And update nginx.conf to use SSL:

```nginx
server {
    listen 443 ssl;
    server_name prisma-studio.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Rest of your configuration...
}
```
