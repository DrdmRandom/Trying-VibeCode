# Homelab Dashboard (CasaOS-inspired)

A CasaOS-inspired dashboard built with Next.js (App Router) and TypeScript for showcasing homelab services. Tiles support status checks, localStorage persistence, and time-based ambient themes.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features
- Responsive grid of app tiles with icons, status (online/offline/unknown), descriptions, and tags.
- Time-based themes (Dark, Warm, Day) that update every minute using the local clock.
- Add apps via modal form with validation for domain or IP/port entries; persists to `localStorage` with seed apps on first load.
- Optional lightweight status checks through `/api/ping?url=...` with timeout and CORS-aware fallback.
- TailwindCSS + shadcn-style components, lucide-react icons, and glassy CasaOS aesthetic.

## Running with Podman/Docker on arm64 (Fedora/AL2/etc.)

The included multi-stage container uses a glibc-based Node 20 image that ships arm64 and amd64 variants, so builds run natively on Fedora arm servers without emulation.

```bash
# Build (podman or docker)
podman build -t homelab-dashboard .

# Run on port 5010
podman run --rm -p 5010:5010 homelab-dashboard
```
