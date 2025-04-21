# Builder stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
ENV HUSKY=0
RUN npm install --ignore-scripts

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy all source files
COPY . .

# Build application
RUN npm run build

# Generate Prisma client for production
RUN npm install -D ts-node typescript @types/node && \
    npx prisma generate

# Production stage
FROM node:20-alpine AS production

# Install only necessary packages
RUN apk add --no-cache postgresql-client && \
    apk add --no-cache --virtual .build-deps curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/prisma ./prisma
COPY --from=build-stage /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build-stage /app/node_modules/@prisma ./node_modules/@prisma

# Install production dependencies plus ts-node for seeding
ENV HUSKY=0
RUN npm install --omit=dev --ignore-scripts && \
    npm install -D ts-node typescript @types/node && \
    npm cache clean --force

# Copy the entrypoint and utility scripts
COPY docker-entrypoint.sh ./
COPY scripts/ ./scripts/
RUN chmod +x ./docker-entrypoint.sh ./scripts/*.sh

# Expose ports for API and Prisma Studio
EXPOSE 3008 5555

# Set NODE_ENV
ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
