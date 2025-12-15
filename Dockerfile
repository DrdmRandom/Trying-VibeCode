# Multi-stage build for the CasaOS-style dashboard
# Uses podman-compatible instructions

FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY package.json ./
RUN npm install

# Build the application
COPY . .
RUN npm run build

# Prune dev dependencies for a lean runtime image
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5010

# Copy production dependencies and build output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 5010
CMD ["npm", "run", "start", "--", "-p", "5010"]
