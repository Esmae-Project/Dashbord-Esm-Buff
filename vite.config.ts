import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Dashbord-Esm-Buff/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: false,
  },
});
