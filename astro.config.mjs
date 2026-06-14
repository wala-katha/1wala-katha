import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import gtm from "astro-gtm-lite";
import { defineConfig, fontProviders, sharpImageService } from "astro/config";
import config from "./src/config/config.json";
import theme from "./src/config/theme.json";

// Helper to parse font string format: "FontName:wght@400;500;600;700"
function parseFontString(fontStr) {
  const [name, weightPart] = fontStr.split(":");
  let weights = [400];

  if (weightPart) {
    const weightMatch = weightPart.match(/wght@?([\d;]+)/);
    if (weightMatch) {
      weights = weightMatch[1].split(";").map((w) => parseInt(w, 10));
    }
  }

  const cleanName = name.replace(/\+/g, " ");
  return { name: cleanName, weights };
}

// Build fonts configuration from theme.json
const fontsConfig = Object.entries(theme.fonts.font_family)
  .filter(([key]) => !key.includes("_type"))
  .map(([key, fontStr]) => {
    const { name, weights } = parseFontString(fontStr);
    const typeKey = `${key}_type`;
    const fallback = theme.fonts.font_family[typeKey] || "sans-serif";

    return {
      name,
      cssVariable: `--font-${key}`,
      provider: fontProviders.google(),
      weights,
      display: "swap",
      fallbacks: [fallback],
    };
  });

export default defineConfig({
  site: config.site.base_url
    ? config.site.base_url
    : "https://walkatha.pages.dev",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash:
    config.site.trailing_slash === true ||
    config.site.trailing_slash === "always"
      ? "always"
      : "never",

  // ✅ Fix 1: Sharp image service with WebP + quality optimization
  image: {
    service: sharpImageService(),
    defaultFormat: "webp",
    experimentalResponsiveImages: true,
  },

  // ✅ Fix 2: Vite CSS code splitting to reduce render-blocking
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
    css: {
      transformer: "lightningcss",
    },
  },

  fonts: fontsConfig,

  integrations: [
    react(),

    // ✅ Fix 3: Sitemap with explicit config
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),

    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Youtube",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
      ],
    }),

    mdx(),

    gtm({
      enable: config.google_tag_manager.enable,
      id: config.google_tag_manager.gtm_id,
      devMode: false, // ✅ Fix 4: Production එකේදී devMode false කරන්න
    }),
  ],

  markdown: {
    shikiConfig: { theme: "one-dark-pro", wrap: true },
  },
});
