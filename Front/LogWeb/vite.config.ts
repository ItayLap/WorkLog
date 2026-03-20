import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7176", //(http://localhost:5067, это и даёт 307)
        changeOrigin: true,
        secure: false
      }
    }
  }
});
