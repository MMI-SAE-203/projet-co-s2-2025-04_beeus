// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import alpinejs from "@astrojs/alpinejs";

import react from "@astrojs/react";

import icon from "astro-icon";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ["pocketbase"],
      },
    },
    resolve: {
      alias: {
        pocketbase: "/node_modules/pocketbase/dist/pocketbase.es.js",
      },
    },
  },

  integrations: [alpinejs(), react(), icon()],
  output: "server",
  adapter: netlify(),
});
