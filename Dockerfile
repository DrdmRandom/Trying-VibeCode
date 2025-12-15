# Multi-stage build for the CasaOS-style dashboard
# Uses podman-compatible instructions and a glibc base for arm64/amd64 parity

FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json ./
RUN npm install --no-progress

# Build the application
COPY . .
RUN npm run build

# Prune dev dependencies for a lean runtime image
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5010

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy production dependencies and build output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 5010
CMD ["npm", "run", "start", "--", "-p", "5010"]
