import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

// Serves on port 3000 so we reuse the Auth0 SPA app's existing Allowed
// Callback / Logout / Web Origins (`https://localhost:3000`) and the API's
// CORS_ORIGINS list. Side effect: `yarn dev` (Next) and `yarn web:dev` (Vite)
// can't run at the same time — stop one before starting the other. After 3c
// removes Next, this is moot.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "../../certificates/localhost-key.pem"),
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../../certificates/localhost.pem"),
      ),
    },
  },
});
