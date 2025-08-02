import { defineConfig } from "wxt"

export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: "Brain Bridge",
    permissions: ["storage", "contextMenus"],
    host_permissions: ["https://*.openai.com/*", "https://*.anthropic.com/*", "https://*.googleapis.com/*"],
    browser_specific_settings: {
      gecko: {
        id: "brain-bridge@example.com",
        strict_min_version: "109.0",
      },
    },
  },
})
