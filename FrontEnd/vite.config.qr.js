import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración para QR (puerto 5180)
export default defineConfig({
  plugins: [react()],
  root: "./QR",
  server: {
    port: 5180,
    strictPort: true,
  },
  build: {
    outDir: "../dist-qr",
  },
});
