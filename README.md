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
