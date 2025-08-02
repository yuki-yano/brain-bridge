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
        id: "{8ab24243-3060-47fb-a71a-fd762caaad57}",
        strict_min_version: "109.0",
      },
    },
  },
})
