import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

export const metadata: Metadata = {
  title: "Homelab Dashboard",
  description: "CasaOS-inspired launcher for homelab apps",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-glow-grid bg-[length:120px_120px]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
