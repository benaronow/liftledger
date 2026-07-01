import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

const keyPath = path.resolve(__dirname, "../../certificates/localhost-key.pem");
const certPath = path.resolve(__dirname, "../../certificates/localhost.pem");

// Local dev serves over https://localhost:3000 (mkcert). The cert pair is only
// present on dev machines — not in CI/Netlify — so only enable https for the
// dev server and only when the certs actually exist. `vite build` never reads
// them.
const httpsCerts =
  fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : undefined;

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    ...(command === "serve" && httpsCerts ? { https: httpsCerts } : {}),
  },
}));
