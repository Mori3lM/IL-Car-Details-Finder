import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base is "./" so the built site works on GitHub Pages / any static host subpath.
export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    globals: true,
    environment: "node",
  },
});
