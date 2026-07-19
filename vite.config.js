import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // In local dev, run `vercel dev` (port 3000) for the /api functions.
    proxy: { "/api": "http://localhost:3000" }
  }
});
