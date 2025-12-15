import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slateglass: "rgba(255,255,255,0.08)",
        darkpanel: "rgba(15,15,20,0.8)",
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.15)",
      },
      backgroundImage: {
        "glow-grid": "radial-gradient(circle at 20px 20px, rgba(255,255,255,0.08), transparent 35%)",
      },
    },
  },
  plugins: [],
};

export default config;
